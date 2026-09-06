"""Guided hardware replacement candidate discovery and commit."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.core import HomeAssistant, State
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .manager import BindHomeManager
from .models import Binding
from .registry import RegistryValidationError

_DOMAIN_CAPABILITIES: dict[str, frozenset[str]] = {
    "on_off": frozenset({"light", "switch", "fan", "input_boolean"}),
    "open_close": frozenset({"cover", "valve", "binary_sensor"}),
    "position": frozenset({"cover"}),
    "setpoint": frozenset({"climate", "number"}),
}
_SENSOR_CLASSES: dict[str, frozenset[str]] = {
    "temperature": frozenset({"temperature"}),
    "power_measurement": frozenset({"power"}),
}
_OPEN_CLOSE_BINARY_CLASSES = frozenset({"door", "window", "opening"})


class ReplacementError(RegistryValidationError):
    """Reject an invalid or stale replacement choice."""


@dataclass(frozen=True, slots=True)
class ReplacementCandidate:
    """One Home Assistant entity that can currently replace a Binding target."""

    entity_id: str
    entity_registry_id: str | None
    name: str
    domain: str
    area_id: str | None
    device_id: str | None
    state: str | None
    rank: int
    reasons: tuple[str, ...]

    def to_dict(self) -> dict[str, Any]:
        return {
            "entity_id": self.entity_id,
            "entity_registry_id": self.entity_registry_id,
            "name": self.name,
            "domain": self.domain,
            "area_id": self.area_id,
            "device_id": self.device_id,
            "state": self.state,
            "rank": self.rank,
            "reasons": list(self.reasons),
        }


def _domain(entity_id: str) -> str:
    return entity_id.partition(".")[0]


def _device_class(entry: er.RegistryEntry | None, state: State | None) -> str | None:
    value = None
    if entry is not None:
        value = entry.device_class or entry.original_device_class
    if value is None and state is not None:
        value = state.attributes.get("device_class")
    if value is None:
        return None
    return str(getattr(value, "value", value))


def _compatible(
    capability: str,
    entity_id: str,
    entry: er.RegistryEntry | None,
    state: State | None,
) -> bool:
    domain = _domain(entity_id)
    if capability in _SENSOR_CLASSES:
        return (
            domain == "sensor"
            and _device_class(entry, state) in _SENSOR_CLASSES[capability]
        )
    if capability == "open_close" and domain == "binary_sensor":
        return _device_class(entry, state) in _OPEN_CLOSE_BINARY_CLASSES
    domains = _DOMAIN_CAPABILITIES.get(capability)
    if domains is not None:
        return domain in domains
    # Custom capabilities remain usable: BindHome cannot safely infer a domain contract.
    return True


def _effective_area(
    device_registry: dr.DeviceRegistry,
    entry: er.RegistryEntry | None,
) -> str | None:
    if entry is None:
        return None
    if entry.area_id is not None:
        return entry.area_id
    if entry.device_id is None:
        return None
    device = device_registry.async_get(entry.device_id)
    return device.area_id if device is not None else None


def _candidate_name(
    entity_id: str,
    entry: er.RegistryEntry | None,
    state: State | None,
) -> str:
    return (
        (state.attributes.get("friendly_name") if state is not None else None)
        or (entry.name if entry is not None else None)
        or (entry.original_name if entry is not None else None)
        or entity_id
    )


def _bound_elsewhere(
    manager: BindHomeManager,
    *,
    asset_id: str,
    entity_id: str,
    entity_registry_id: str | None,
) -> bool:
    for binding in manager.registry.bindings.values():
        if binding.asset_id == asset_id:
            continue
        if (
            entity_registry_id is not None
            and binding.entity_registry_id == entity_registry_id
        ):
            return True
        if binding.entity_registry_id is None and binding.entity_id == entity_id:
            return True
    return False


def _current_binding(
    manager: BindHomeManager, asset_id: str, capability: str, role: str
) -> Binding | None:
    return manager.registry.get_binding(asset_id, capability, role)


def replacement_candidates(
    hass: HomeAssistant,
    manager: BindHomeManager,
    *,
    asset_id: str,
    capability: str,
    role: str = "primary",
) -> dict[str, Any]:
    """Return a deterministic, read-only replacement plan for one Binding key."""
    asset = manager.registry.get_asset(asset_id)
    if capability not in asset.capabilities:
        raise ReplacementError(
            f"Asset {asset_id} does not declare capability {capability}",
            field="capability",
        )

    binding = _current_binding(manager, asset_id, capability, role)
    resolution = manager.resolver.resolve(asset_id, capability, role)
    entity_registry = er.async_get(hass)
    device_registry = dr.async_get(hass)
    entries = {entry.entity_id: entry for entry in entity_registry.entities.values()}
    entity_ids = set(entries) | set(hass.states.async_entity_ids())
    current_entity_id = resolution.entity_id or (binding.entity_id if binding else None)
    current_domain = _domain(current_entity_id) if current_entity_id else None

    candidates: list[ReplacementCandidate] = []
    for entity_id in entity_ids:
        if entity_id == current_entity_id:
            continue
        entry = entries.get(entity_id)
        state = hass.states.get(entity_id)
        if entry is not None and (
            entry.disabled_by is not None or entry.platform == "bindhome"
        ):
            continue
        if not _compatible(capability, entity_id, entry, state):
            continue
        registry_id = entry.id if entry is not None else None
        if _bound_elsewhere(
            manager,
            asset_id=asset_id,
            entity_id=entity_id,
            entity_registry_id=registry_id,
        ):
            continue

        area_id = _effective_area(device_registry, entry)
        reasons: list[str] = []
        rank = 20
        if asset.area_id is not None and area_id == asset.area_id:
            rank -= 10
            reasons.append("same_area")
        if current_domain is not None and _domain(entity_id) == current_domain:
            rank -= 4
            reasons.append("same_domain")
        if registry_id is not None:
            rank -= 2
            reasons.append("stable_identity")
        if state is not None:
            rank -= 1
            reasons.append("runtime_present")

        candidates.append(
            ReplacementCandidate(
                entity_id=entity_id,
                entity_registry_id=registry_id,
                name=_candidate_name(entity_id, entry, state),
                domain=_domain(entity_id),
                area_id=area_id,
                device_id=entry.device_id if entry is not None else None,
                state=state.state if state is not None else None,
                rank=rank,
                reasons=tuple(reasons),
            )
        )

    candidates.sort(key=lambda item: (item.rank, item.name.casefold(), item.entity_id))
    return {
        "asset_id": asset.id,
        "capability": capability,
        "role": role,
        "revision": manager.revision,
        "current": {
            "binding": binding.to_dict() if binding is not None else None,
            "entity_id": current_entity_id,
            "status": resolution.status.value,
            "config_valid": resolution.config_valid,
            "runtime_available": resolution.runtime_available,
        },
        "candidates": [candidate.to_dict() for candidate in candidates],
    }


async def async_replace_binding(
    hass: HomeAssistant,
    manager: BindHomeManager,
    *,
    asset_id: str,
    capability: str,
    entity_id: str,
    role: str = "primary",
    expected_revision: int | None = None,
) -> dict[str, Any]:
    """Revalidate and atomically replace one Binding target."""
    plan = replacement_candidates(
        hass,
        manager,
        asset_id=asset_id,
        capability=capability,
        role=role,
    )
    if not any(candidate["entity_id"] == entity_id for candidate in plan["candidates"]):
        raise ReplacementError(
            f"Home Assistant entity {entity_id} is not a current compatible "
            "replacement",
            field="entity_id",
        )

    binding = await manager.async_set_binding(
        asset_id=asset_id,
        capability=capability,
        entity_id=entity_id,
        role=role,
        expected_revision=expected_revision,
    )
    resolution = manager.resolver.resolve(asset_id, capability, role)
    return {
        "binding": binding.to_dict(),
        "revision": manager.revision,
        "resolution": {
            "status": resolution.status.value,
            "entity_id": resolution.entity_id,
            "config_valid": resolution.config_valid,
            "runtime_available": resolution.runtime_available,
        },
    }
