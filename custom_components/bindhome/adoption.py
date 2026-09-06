"""Reversible visibility ownership for explicitly bound Home Assistant hardware."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .models import HardwareAdoption
from .registry import RegistryNotFoundError, RegistryValidationError
from .representation import representation_entity_ids

if TYPE_CHECKING:
    from .manager import BindHomeManager
    from .models import Binding


def _entry_for_registry_id(
    hass: HomeAssistant, entity_registry_id: str
) -> er.RegistryEntry | None:
    return er.async_get(hass).entities.get_entry(entity_registry_id)


def _hidden_value(value: er.RegistryEntryHider | None) -> str | None:
    return value.value if value is not None else None


def _hidden_enum(value: str | None) -> er.RegistryEntryHider | None:
    return er.RegistryEntryHider(value) if value is not None else None


def _entry_for_binding(hass: HomeAssistant, binding: Binding) -> er.RegistryEntry:
    if binding.entity_registry_id is None:
        raise RegistryValidationError(
            "Only Home Assistant Entity Registry targets can be adopted",
            field="binding_id",
        )
    entry = _entry_for_registry_id(hass, binding.entity_registry_id)
    if entry is None:
        raise RegistryNotFoundError(
            f"Home Assistant entity for Binding {binding.id} was not found",
            field="binding_id",
        )
    return entry


def sync_adoption_visibility_transition(
    hass: HomeAssistant,
    previous: dict[str, HardwareAdoption],
    current: dict[str, HardwareAdoption],
) -> None:
    """Apply only visibility transitions owned by committed Registry changes.

    This function is deliberately best-effort after durable Registry persistence.
    Missing or concurrently changed Home Assistant entries are left untouched. A
    later startup reconciliation can re-apply an active adoption, while reversal
    never overwrites a newer user decision.
    """
    entity_registry = er.async_get(hass)

    for registry_id, old in previous.items():
        if registry_id in current or not old.changed_hidden_by:
            continue
        entry = entity_registry.entities.get_entry(registry_id)
        if entry is None or entry.hidden_by is not er.RegistryEntryHider.INTEGRATION:
            continue
        try:
            entity_registry.async_update_entity(
                entry.entity_id,
                hidden_by=_hidden_enum(old.previous_hidden_by),
            )
        except (KeyError, ValueError):
            continue

    for registry_id, adoption in current.items():
        old = previous.get(registry_id)
        if old == adoption or not adoption.changed_hidden_by:
            continue
        entry = entity_registry.entities.get_entry(registry_id)
        if entry is None or entry.hidden_by is er.RegistryEntryHider.INTEGRATION:
            continue
        expected = _hidden_enum(adoption.previous_hidden_by)
        if entry.hidden_by is not expected:
            # A user/integration changed visibility after consent. Do not seize it.
            continue
        try:
            entity_registry.async_update_entity(
                entry.entity_id,
                hidden_by=er.RegistryEntryHider.INTEGRATION,
            )
        except (KeyError, ValueError):
            continue


def sync_current_adoption_visibility(
    hass: HomeAssistant, adoptions: dict[str, HardwareAdoption]
) -> None:
    """Reconcile persisted adoptions after startup without overriding user state."""
    sync_adoption_visibility_transition(hass, {}, adoptions)


async def async_adopt_binding(
    manager: BindHomeManager,
    binding_id: str,
    *,
    expected_revision: int | None = None,
) -> HardwareAdoption:
    """Persist consent for one Binding and then hide only eligible visible hardware."""
    async with manager.transaction(expected_revision=expected_revision) as staged:
        binding = staged.bindings.get(binding_id)
        if binding is None:
            raise RegistryNotFoundError(f"Binding {binding_id} was not found")
        entry = _entry_for_binding(manager.hass, binding)
        registry_id = binding.entity_registry_id
        assert registry_id is not None
        existing = staged.adoptions.get(registry_id)
        if existing is not None:
            staged.set_adoption(existing.with_binding(binding.id))
        else:
            previous_hidden = _hidden_value(entry.hidden_by)
            staged.set_adoption(
                HardwareAdoption.create(
                    entity_registry_id=registry_id,
                    entity_id=entry.entity_id,
                    previous_hidden_by=previous_hidden,
                    changed_hidden_by=entry.hidden_by is None,
                    binding_ids=[binding.id],
                )
            )

    adoption = manager.registry.adoptions.get(registry_id)
    if adoption is None:
        raise RegistryValidationError("Committed adoption could not be resolved")
    return adoption


async def async_revert_binding_adoption(
    manager: BindHomeManager,
    binding_id: str,
    *,
    expected_revision: int | None = None,
) -> None:
    """Release one Binding's visibility ownership and restore on last owner."""
    async with manager.transaction(expected_revision=expected_revision) as staged:
        if binding_id not in staged.bindings:
            raise RegistryNotFoundError(f"Binding {binding_id} was not found")
        if not staged.remove_adoption_for_binding(binding_id):
            raise RegistryNotFoundError(
                f"Binding {binding_id} has no active hardware adoption"
            )


async def async_revert_asset_adoptions(
    manager: BindHomeManager,
    asset_id: str,
    *,
    expected_revision: int | None = None,
) -> int:
    """Release every adoption owner belonging to one Asset as one transaction."""
    async with manager.transaction(expected_revision=expected_revision) as staged:
        staged.get_asset(asset_id)
        binding_ids = sorted(
            binding.id
            for binding in staged.bindings.values()
            if binding.asset_id == asset_id
        )
        changed = sum(staged.remove_adoption_for_binding(item) for item in binding_ids)
    return changed


async def async_revert_all_adoptions(
    manager: BindHomeManager,
    *,
    expected_revision: int | None = None,
) -> int:
    """Release all BindHome visibility ownership in one durable transaction."""
    count = len(manager.registry.adoptions)
    if not count:
        return 0
    async with manager.transaction(expected_revision=expected_revision) as staged:
        staged.clear_adoptions()
    return count


def adoption_status(
    hass: HomeAssistant,
    manager: BindHomeManager,
    *,
    asset_id: str | None = None,
) -> dict[str, Any]:
    """Return the current visibility surface without mutating either Registry."""
    registry = manager.registry
    if asset_id is not None:
        registry.get_asset(asset_id)

    entity_registry = er.async_get(hass)
    logical = representation_entity_ids(hass, registry.representations)
    logical_ids = {value for value in logical.values() if value is not None}
    records: list[dict[str, Any]] = []
    bound_registry_ids: set[str] = set()
    visible_registry_ids: set[str] = set()

    bindings = sorted(
        registry.bindings.values(),
        key=lambda item: (item.asset_id, item.capability, item.role, item.id),
    )
    for binding in bindings:
        if asset_id is not None and binding.asset_id != asset_id:
            continue
        registry_id = binding.entity_registry_id
        entry = (
            entity_registry.entities.get_entry(registry_id)
            if registry_id is not None
            else None
        )
        adoption = (
            registry.adoptions.get(registry_id) if registry_id is not None else None
        )
        if registry_id is not None:
            bound_registry_ids.add(registry_id)
            if entry is not None and entry.hidden_by is None:
                visible_registry_ids.add(registry_id)
        records.append(
            {
                "binding": binding.to_dict(),
                "eligible": entry is not None and registry_id is not None,
                "adopted": adoption is not None and binding.id in adoption.binding_ids,
                "entity_id": entry.entity_id if entry is not None else binding.entity_id,
                "hidden_by": _hidden_value(entry.hidden_by) if entry is not None else None,
                "visibility_owned": bool(
                    adoption is not None and adoption.changed_hidden_by
                ),
                "previous_hidden_by": (
                    adoption.previous_hidden_by if adoption is not None else None
                ),
            }
        )

    relevant_adoptions = {
        adoption.entity_registry_id
        for adoption in registry.adoptions.values()
        if asset_id is None
        or any(
            registry.bindings[binding_id].asset_id == asset_id
            for binding_id in adoption.binding_ids
            if binding_id in registry.bindings
        )
    }
    relevant_logical = (
        logical_ids
        if asset_id is None
        else {logical.get(asset_id)} - {None}
    )
    return {
        "revision": manager.revision,
        "records": records,
        "summary": {
            "logical_entities": len(relevant_logical),
            "adopted_hardware": len(relevant_adoptions),
            "bound_hardware": len(bound_registry_ids),
            "bound_hardware_visible": len(visible_registry_ids),
        },
    }
