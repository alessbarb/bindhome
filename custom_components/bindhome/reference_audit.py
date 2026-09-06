"""Read-only audit of direct Home Assistant references to bound hardware."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from homeassistant.components.automation import automations_with_entity
from homeassistant.components.homeassistant.scene import scenes_with_entity
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.components.script import scripts_with_entity
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .models import Binding
from .registry import BindHomeRegistry
from .representation import representation_entity_ids

CLASS_DETERMINISTIC = "deterministic_rewrite"
CLASS_MANUAL = "manual_review"
SOURCE_COMPLETE = "complete"
SOURCE_NOT_LOADED = "not_loaded"
SOURCE_UNREADABLE = "unreadable"


@dataclass(frozen=True, slots=True)
class ReferenceAuditTarget:
    """One currently bound backing entity and its safe logical replacement options."""

    entity_id: str
    bindings: tuple[dict[str, str], ...]
    logical_entity_ids: tuple[str, ...]

    @property
    def deterministic_replacement(self) -> str | None:
        """Return the only provable logical replacement, if there is exactly one."""
        if len(self.logical_entity_ids) != 1:
            return None
        return self.logical_entity_ids[0]

    def to_dict(self) -> dict[str, object]:
        """Serialize the target for API consumers."""
        return {
            "entity_id": self.entity_id,
            "bindings": list(self.bindings),
            "logical_entity_ids": list(self.logical_entity_ids),
        }


@dataclass(frozen=True, slots=True)
class DirectReference:
    """One located consumer reference to adopted/bound backing hardware."""

    backing_entity_id: str
    consumer_type: str
    consumer_id: str
    consumer_name: str
    path: str
    match_kind: str
    classification: str
    replacement_entity_id: str | None

    def to_dict(self) -> dict[str, str | None]:
        """Serialize the reference for API consumers."""
        return {
            "backing_entity_id": self.backing_entity_id,
            "consumer_type": self.consumer_type,
            "consumer_id": self.consumer_id,
            "consumer_name": self.consumer_name,
            "path": self.path,
            "match_kind": self.match_kind,
            "classification": self.classification,
            "replacement_entity_id": self.replacement_entity_id,
        }


@dataclass(frozen=True, slots=True)
class ReferenceSourceStatus:
    """Coverage status for one Home Assistant configuration source."""

    source: str
    status: str
    consumer_id: str | None = None
    detail: str | None = None

    def to_dict(self) -> dict[str, str | None]:
        """Serialize source coverage without exposing exception internals."""
        return {
            "source": self.source,
            "status": self.status,
            "consumer_id": self.consumer_id,
            "detail": self.detail,
        }


def _current_binding_entity_id(
    entity_registry: er.EntityRegistry,
    binding: Binding,
) -> str:
    """Resolve a stable Binding target to its current entity id when possible."""
    if binding.entity_registry_id is not None:
        entry = entity_registry.entities.get_entry(binding.entity_registry_id)
        if entry is not None:
            return entry.entity_id
    return binding.entity_id


def reference_audit_targets(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
) -> dict[str, ReferenceAuditTarget]:
    """Build deterministic audit targets from explicit Bindings and Representations."""
    entity_registry = er.async_get(hass)
    logical_entities = representation_entity_ids(hass, registry.representations)
    grouped: dict[str, dict[str, Any]] = {}

    for binding in registry.bindings.values():
        entity_id = _current_binding_entity_id(entity_registry, binding)
        target = grouped.setdefault(
            entity_id,
            {"bindings": [], "logical_entity_ids": set()},
        )
        target["bindings"].append(
            {
                "binding_id": binding.id,
                "asset_id": binding.asset_id,
                "capability": binding.capability,
                "role": binding.role,
            }
        )
        logical_entity_id = logical_entities.get(binding.asset_id)
        if logical_entity_id is not None:
            target["logical_entity_ids"].add(logical_entity_id)

    return {
        entity_id: ReferenceAuditTarget(
            entity_id=entity_id,
            bindings=tuple(
                sorted(
                    data["bindings"],
                    key=lambda item: (
                        item["asset_id"],
                        item["capability"],
                        item["role"],
                        item["binding_id"],
                    ),
                )
            ),
            logical_entity_ids=tuple(sorted(data["logical_entity_ids"])),
        )
        for entity_id, data in sorted(grouped.items())
    }


def _consumer_name(hass: HomeAssistant, entity_id: str) -> str:
    """Return a human locator while preserving the stable consumer id."""
    state = hass.states.get(entity_id)
    if state is None:
        return entity_id
    return state.name or entity_id


def _reported_reference(
    hass: HomeAssistant,
    *,
    target: ReferenceAuditTarget,
    consumer_type: str,
    consumer_id: str,
    path: str,
    deterministic: bool,
) -> DirectReference:
    replacement = target.deterministic_replacement
    return DirectReference(
        backing_entity_id=target.entity_id,
        consumer_type=consumer_type,
        consumer_id=consumer_id,
        consumer_name=_consumer_name(hass, consumer_id),
        path=path,
        match_kind="direct" if deterministic else "reported_reference",
        classification=(
            CLASS_DETERMINISTIC
            if deterministic and replacement is not None
            else CLASS_MANUAL
        ),
        replacement_entity_id=replacement,
    )


def _scan_reported_consumers(
    hass: HomeAssistant,
    targets: dict[str, ReferenceAuditTarget],
    *,
    consumer_type: str,
    finder: Any,
    deterministic: bool,
) -> list[DirectReference]:
    """Scan one Home Assistant helper that reports consumers for an entity id."""
    references: list[DirectReference] = []
    for entity_id, target in targets.items():
        for consumer_id in sorted(set(finder(hass, entity_id))):
            references.append(
                _reported_reference(
                    hass,
                    target=target,
                    consumer_type=consumer_type,
                    consumer_id=consumer_id,
                    path=consumer_id,
                    deterministic=deterministic,
                )
            )
    return references


def _path(parent: str, key: str | int) -> str:
    if isinstance(key, int):
        return f"{parent}[{key}]" if parent else f"[{key}]"
    if not parent:
        return key
    return f"{parent}.{key}"


def _template_mentions(value: str, entity_id: str) -> bool:
    """Return whether a Jinja-like string contains the complete entity id token."""
    if "{{" not in value and "{%" not in value:
        return False
    token = rf"(?<![A-Za-z0-9_]){re.escape(entity_id)}(?![A-Za-z0-9_])"
    return re.search(token, value) is not None


def scan_dashboard_config(
    config: object,
    targets: dict[str, ReferenceAuditTarget],
    *,
    dashboard_id: str,
) -> list[DirectReference]:
    """Locate exact and conservative template references in one dashboard config."""
    references: list[DirectReference] = []

    def walk(value: object, path: str) -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                walk(child, _path(path, str(key)))
            return
        if isinstance(value, (list, tuple)):
            for index, child in enumerate(value):
                walk(child, _path(path, index))
            return
        if not isinstance(value, str):
            return

        exact = targets.get(value)
        if exact is not None:
            replacement = exact.deterministic_replacement
            references.append(
                DirectReference(
                    backing_entity_id=exact.entity_id,
                    consumer_type="dashboard",
                    consumer_id=dashboard_id,
                    consumer_name=dashboard_id,
                    path=path or "root",
                    match_kind="direct",
                    classification=(
                        CLASS_DETERMINISTIC if replacement is not None else CLASS_MANUAL
                    ),
                    replacement_entity_id=replacement,
                )
            )
            return

        for entity_id, target in targets.items():
            if not _template_mentions(value, entity_id):
                continue
            references.append(
                DirectReference(
                    backing_entity_id=entity_id,
                    consumer_type="dashboard",
                    consumer_id=dashboard_id,
                    consumer_name=dashboard_id,
                    path=path or "root",
                    match_kind="template",
                    classification=CLASS_MANUAL,
                    replacement_entity_id=target.deterministic_replacement,
                )
            )

    walk(config, "")
    return references


def _component_source_status(
    hass: HomeAssistant,
    source: str,
    component: str,
) -> ReferenceSourceStatus:
    """Describe whether a component-backed audit source is available."""
    status = (
        SOURCE_COMPLETE if component in hass.config.components else SOURCE_NOT_LOADED
    )
    return ReferenceSourceStatus(source=source, status=status)


async def _async_scan_dashboards(
    hass: HomeAssistant,
    targets: dict[str, ReferenceAuditTarget],
) -> tuple[list[DirectReference], list[ReferenceSourceStatus]]:
    """Read every loaded Lovelace dashboard through its supported config object."""
    data = hass.data.get(LOVELACE_DATA)
    if data is None:
        return [], [ReferenceSourceStatus("dashboards", SOURCE_NOT_LOADED)]

    references: list[DirectReference] = []
    statuses: list[ReferenceSourceStatus] = []
    dashboards = getattr(data, "dashboards", {})
    for url_path, dashboard in sorted(
        dashboards.items(), key=lambda item: "" if item[0] is None else str(item[0])
    ):
        dashboard_id = "lovelace" if url_path is None else str(url_path)
        try:
            config = await dashboard.async_load(False)
        except Exception as err:
            # Home Assistant dashboard adapters expose varied errors.
            statuses.append(
                ReferenceSourceStatus(
                    source="dashboard",
                    status=SOURCE_UNREADABLE,
                    consumer_id=dashboard_id,
                    detail=type(err).__name__,
                )
            )
            continue
        statuses.append(
            ReferenceSourceStatus(
                source="dashboard",
                status=SOURCE_COMPLETE,
                consumer_id=dashboard_id,
            )
        )
        references.extend(
            scan_dashboard_config(config, targets, dashboard_id=dashboard_id)
        )

    if not dashboards:
        statuses.append(ReferenceSourceStatus("dashboards", SOURCE_COMPLETE))
    return references, statuses


def _deduplicate(references: list[DirectReference]) -> list[DirectReference]:
    """Return stable unique reference records."""
    unique = {
        (
            item.backing_entity_id,
            item.consumer_type,
            item.consumer_id,
            item.path,
            item.match_kind,
        ): item
        for item in references
    }
    return [unique[key] for key in sorted(unique)]


async def async_audit_direct_references(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
) -> dict[str, object]:
    """Audit direct-reference debt without mutating Home Assistant or BindHome."""
    targets = reference_audit_targets(hass, registry)
    references: list[DirectReference] = []
    sources: list[ReferenceSourceStatus] = []

    source_specs = (
        ("automations", "automation", "automation", automations_with_entity, False),
        ("scripts", "script", "script", scripts_with_entity, False),
        ("scenes", "scene", "scene", scenes_with_entity, True),
    )
    for source, component, consumer_type, finder, deterministic in source_specs:
        status = _component_source_status(hass, source, component)
        sources.append(status)
        if status.status != SOURCE_COMPLETE:
            continue
        references.extend(
            _scan_reported_consumers(
                hass,
                targets,
                consumer_type=consumer_type,
                finder=finder,
                deterministic=deterministic,
            )
        )

    dashboard_references, dashboard_sources = await _async_scan_dashboards(
        hass, targets
    )
    references.extend(dashboard_references)
    sources.extend(dashboard_sources)
    references = _deduplicate(references)

    grouped: list[dict[str, object]] = []
    for entity_id, target in targets.items():
        target_references = [
            item.to_dict() for item in references if item.backing_entity_id == entity_id
        ]
        if not target_references:
            continue
        grouped.append(
            {
                **target.to_dict(),
                "reference_count": len(target_references),
                "references": target_references,
            }
        )

    deterministic_count = sum(
        item.classification == CLASS_DETERMINISTIC for item in references
    )
    manual_count = len(references) - deterministic_count
    incomplete = sum(source.status != SOURCE_COMPLETE for source in sources)
    return {
        "summary": {
            "bound_backing_entities": len(targets),
            "referenced_backing_entities": len(grouped),
            "references": len(references),
            "deterministic_rewrites": deterministic_count,
            "manual_review": manual_count,
            "incomplete_sources": incomplete,
        },
        "groups": grouped,
        "sources": [source.to_dict() for source in sources],
    }
