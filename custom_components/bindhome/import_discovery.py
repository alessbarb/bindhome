"""Read-only assisted-import discovery from Home Assistant metadata."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.core import HomeAssistant, State
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .import_proposals import (
    ImportAssetCandidate,
    ImportBindingCandidate,
    ImportProposal,
    ImportSource,
)
from .registry import BindHomeRegistry


@dataclass(frozen=True, slots=True)
class _EntityHint:
    asset_type: str
    capabilities: tuple[str, ...]


_DOMAIN_HINTS: dict[str, _EntityHint] = {
    "light": _EntityHint("light_point", ("on_off",)),
    "switch": _EntityHint("switch", ("on_off",)),
    "fan": _EntityHint("fan", ("on_off",)),
    "cover": _EntityHint("cover", ("open_close",)),
    "valve": _EntityHint("valve", ("open_close",)),
    "climate": _EntityHint("thermostat", ("setpoint",)),
}
_SENSOR_HINTS: dict[str, _EntityHint] = {
    "temperature": _EntityHint("sensor", ("temperature",)),
    "power": _EntityHint("sensor", ("power_measurement",)),
}
_BINARY_SENSOR_HINTS: dict[str, _EntityHint] = {
    "door": _EntityHint("door", ("open_close",)),
    "window": _EntityHint("window", ("open_close",)),
    "opening": _EntityHint("opening", ("open_close",)),
}


class ImportDiscoveryError(ValueError):
    """Reject an invalid discovery scope without mutating anything."""


def _domain(entity_id: str) -> str:
    return entity_id.partition(".")[0]


def _device_class_value(entry: er.RegistryEntry) -> str | None:
    value = entry.device_class or entry.original_device_class
    if value is None:
        return None
    return str(getattr(value, "value", value))


def _hint_for_entry(entry: er.RegistryEntry) -> _EntityHint | None:
    domain = _domain(entry.entity_id)
    if domain == "sensor":
        device_class = _device_class_value(entry)
        return _SENSOR_HINTS.get(device_class or "")
    if domain == "binary_sensor":
        device_class = _device_class_value(entry)
        return _BINARY_SENSOR_HINTS.get(device_class or "")
    return _DOMAIN_HINTS.get(domain)


def _hint_for_state(state: State) -> _EntityHint | None:
    """Return only domain-level hints that do not require Registry metadata."""
    return _DOMAIN_HINTS.get(_domain(state.entity_id))


def _entry_name(entry: er.RegistryEntry) -> str:
    return entry.name or entry.original_name or entry.entity_id


def _effective_area(
    device: dr.DeviceEntry | None,
    entries: tuple[er.RegistryEntry, ...],
) -> str | None:
    if device is not None and device.area_id is not None:
        return device.area_id
    entity_areas = {entry.area_id for entry in entries if entry.area_id is not None}
    if len(entity_areas) == 1:
        return next(iter(entity_areas))
    return None


def _matches_scope(
    *,
    selected_area_id: str | None,
    candidate_area_id: str | None,
    entries: tuple[er.RegistryEntry, ...],
) -> bool:
    if selected_area_id is None:
        return True
    if candidate_area_id == selected_area_id:
        return True
    return any(entry.area_id == selected_area_id for entry in entries)


def _bindings_for_entry(entry: er.RegistryEntry) -> tuple[ImportBindingCandidate, ...]:
    hint = _hint_for_entry(entry)
    if hint is None:
        return ()
    return tuple(
        ImportBindingCandidate.create(
            capability=capability,
            entity_id=entry.entity_id,
            entity_registry_id=entry.id,
        )
        for capability in hint.capabilities
    )


def _proposal_from_entries(
    *,
    registry: BindHomeRegistry,
    device: dr.DeviceEntry | None,
    entries: tuple[er.RegistryEntry, ...],
    candidate_key: str,
    name: str,
    selected_area_id: str | None,
) -> ImportProposal | None:
    hints = tuple(
        hint for entry in entries if (hint := _hint_for_entry(entry)) is not None
    )
    if not hints:
        return None

    area_id = _effective_area(device, entries)
    if not _matches_scope(
        selected_area_id=selected_area_id,
        candidate_area_id=area_id,
        entries=entries,
    ):
        return None

    asset_types = {hint.asset_type for hint in hints}
    asset_type = next(iter(asset_types)) if len(asset_types) == 1 else "device"
    bindings = tuple(
        binding for entry in entries for binding in _bindings_for_entry(entry)
    )
    capabilities = tuple(sorted({binding.capability for binding in bindings}))
    source = ImportSource.create(
        area_id=area_id,
        device_id=device.id if device is not None else None,
        entity_ids=(entry.entity_id for entry in entries),
        entity_registry_ids=(entry.id for entry in entries),
    )
    return ImportProposal.create(
        source=source,
        asset=ImportAssetCandidate.create(
            name=name,
            asset_type=asset_type,
            area_id=area_id,
            capabilities=capabilities,
        ),
        bindings=bindings,
        existing_assets=registry.assets.values(),
        existing_bindings=registry.bindings.values(),
        candidate_key=candidate_key,
    )


def _device_proposals(
    *,
    registry: BindHomeRegistry,
    device: dr.DeviceEntry,
    entries: tuple[er.RegistryEntry, ...],
    selected_area_id: str | None,
) -> list[ImportProposal]:
    supported = tuple(
        entry
        for entry in entries
        if entry.disabled_by is None
        and entry.platform != "bindhome"
        and _hint_for_entry(entry) is not None
    )
    if not supported:
        return []

    binding_keys: list[tuple[str, str]] = []
    for entry in supported:
        binding_keys.extend(
            (binding.capability, binding.role) for binding in _bindings_for_entry(entry)
        )

    # A single physical HA Device may expose multiple independently replaceable
    # channels (for example a two-channel relay). Never collapse conflicting
    # capability/role keys into one BindHome Asset. Separate proposals remain
    # mergeable by the human review step.
    has_conflicting_keys = len(binding_keys) != len(set(binding_keys))
    if has_conflicting_keys:
        proposals: list[ImportProposal] = []
        for entry in supported:
            proposal = _proposal_from_entries(
                registry=registry,
                device=device,
                entries=(entry,),
                candidate_key=entry.id,
                name=_entry_name(entry),
                selected_area_id=selected_area_id,
            )
            if proposal is not None:
                proposals.append(proposal)
        return proposals

    proposal = _proposal_from_entries(
        registry=registry,
        device=device,
        entries=supported,
        candidate_key=device.id,
        name=device.name_by_user or device.name or _entry_name(supported[0]),
        selected_area_id=selected_area_id,
    )
    return [proposal] if proposal is not None else []


def discover_import_proposals(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
    *,
    area_id: str | None = None,
) -> list[ImportProposal]:
    """Discover reviewable proposals without changing HA or BindHome state."""
    if area_id is not None and ar.async_get(hass).async_get_area(area_id) is None:
        raise ImportDiscoveryError(f"Home Assistant Area {area_id} was not found")

    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)
    proposals: list[ImportProposal] = []
    seen_entity_ids: set[str] = set()
    entries = tuple(
        sorted(
            entity_registry.entities.values(),
            key=lambda item: item.entity_id,
        )
    )

    entries_by_device: dict[str, list[er.RegistryEntry]] = {}
    for entry in entries:
        if entry.device_id is not None:
            entries_by_device.setdefault(entry.device_id, []).append(entry)

    for device_id in sorted(entries_by_device):
        device = device_registry.async_get(device_id)
        if device is None:
            continue
        device_entries = tuple(entries_by_device[device_id])
        seen_entity_ids.update(entry.entity_id for entry in device_entries)
        proposals.extend(
            _device_proposals(
                registry=registry,
                device=device,
                entries=device_entries,
                selected_area_id=area_id,
            )
        )

    for entry in entries:
        if entry.entity_id in seen_entity_ids:
            continue
        if entry.disabled_by is not None or entry.platform == "bindhome":
            continue
        proposal = _proposal_from_entries(
            registry=registry,
            device=None,
            entries=(entry,),
            candidate_key=entry.id,
            name=_entry_name(entry),
            selected_area_id=area_id,
        )
        if proposal is not None:
            proposals.append(proposal)
        seen_entity_ids.add(entry.entity_id)

    # State-machine-only entities have no stable Registry identity. They are
    # still useful as explicit fallback proposals for whole-install discovery,
    # but they cannot be safely assigned to an Area by discovery alone.
    if area_id is None:
        for state in sorted(hass.states.async_all(), key=lambda item: item.entity_id):
            if state.entity_id in seen_entity_ids:
                continue
            hint = _hint_for_state(state)
            if hint is None:
                continue
            source = ImportSource.create(entity_ids=(state.entity_id,))
            bindings = tuple(
                ImportBindingCandidate.create(
                    capability=capability,
                    entity_id=state.entity_id,
                )
                for capability in hint.capabilities
            )
            proposals.append(
                ImportProposal.create(
                    source=source,
                    asset=ImportAssetCandidate.create(
                        name=state.name,
                        asset_type=hint.asset_type,
                        capabilities=hint.capabilities,
                    ),
                    bindings=bindings,
                    existing_assets=registry.assets.values(),
                    existing_bindings=registry.bindings.values(),
                    candidate_key=state.entity_id,
                )
            )

    return sorted(proposals, key=lambda proposal: proposal.proposal_id)
