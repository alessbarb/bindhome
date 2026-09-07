"""Tests for reversible hardware visibility adoption."""

from __future__ import annotations

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.adoption import (
    async_adopt_binding,
    async_revert_all_adoptions,
    async_revert_binding_adoption,
)
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.registry import RegistryValidationError


async def _manager_with_binding(hass: HomeAssistant, unique_id: str = "relay"):
    entry = er.async_get(hass).async_get_or_create(
        "switch", "demo", unique_id, suggested_object_id=unique_id
    )
    hass.states.async_set(entry.entity_id, "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Relay",
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="primary",
    )
    return manager, asset, binding, entry


async def test_adopt_visible_registered_hardware_hides_and_records_snapshot(
    hass: HomeAssistant,
) -> None:
    manager, _asset, binding, entry = await _manager_with_binding(hass)

    adoption = await async_adopt_binding(manager, binding.id)

    current = er.async_get(hass).entities.get_entry(entry.id)
    assert current is not None
    assert current.hidden_by is er.RegistryEntryHider.INTEGRATION
    assert adoption.previous_hidden_by is None
    assert adoption.changed_hidden_by is True
    assert adoption.binding_ids == (binding.id,)
    assert manager.registry.adoptions[entry.id] == adoption


async def test_revert_restores_exact_previous_visibility(hass: HomeAssistant) -> None:
    manager, _asset, binding, entry = await _manager_with_binding(hass)
    await async_adopt_binding(manager, binding.id)

    await async_revert_binding_adoption(manager, binding.id)

    current = er.async_get(hass).entities.get_entry(entry.id)
    assert current is not None
    assert current.hidden_by is None
    assert manager.registry.adoptions == {}


async def test_preexisting_user_hidden_state_is_never_owned_or_changed(
    hass: HomeAssistant,
) -> None:
    manager, _asset, binding, entry = await _manager_with_binding(hass)
    registry = er.async_get(hass)
    registry.async_update_entity(entry.entity_id, hidden_by=er.RegistryEntryHider.USER)

    adoption = await async_adopt_binding(manager, binding.id)
    await async_revert_binding_adoption(manager, binding.id)

    current = registry.entities.get_entry(entry.id)
    assert current is not None
    assert current.hidden_by is er.RegistryEntryHider.USER
    assert adoption.previous_hidden_by == "user"
    assert adoption.changed_hidden_by is False


async def test_user_change_after_adoption_wins_over_reversal(hass: HomeAssistant) -> None:
    manager, _asset, binding, entry = await _manager_with_binding(hass)
    registry = er.async_get(hass)
    await async_adopt_binding(manager, binding.id)
    registry.async_update_entity(entry.entity_id, hidden_by=None)

    await async_revert_binding_adoption(manager, binding.id)

    current = registry.entities.get_entry(entry.id)
    assert current is not None
    assert current.hidden_by is None


async def test_binding_target_change_releases_old_visibility_without_adopting_new(
    hass: HomeAssistant,
) -> None:
    manager, asset, binding, old_entry = await _manager_with_binding(hass, "old")
    new_entry = er.async_get(hass).async_get_or_create(
        "switch", "demo", "new", suggested_object_id="new"
    )
    hass.states.async_set(new_entry.entity_id, "off")
    await async_adopt_binding(manager, binding.id)

    updated = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=new_entry.entity_id,
        role="primary",
    )

    registry = er.async_get(hass)
    old_current = registry.entities.get_entry(old_entry.id)
    new_current = registry.entities.get_entry(new_entry.id)
    assert old_current is not None and old_current.hidden_by is None
    assert new_current is not None and new_current.hidden_by is None
    assert updated.id == binding.id
    assert manager.registry.adoptions == {}


async def test_state_machine_only_binding_cannot_be_adopted(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.state_only", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="State only",
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="switch.state_only",
        role="primary",
    )

    with pytest.raises(RegistryValidationError, match="Entity Registry"):
        await async_adopt_binding(manager, binding.id)


async def test_revert_all_restores_all_owned_visibility(hass: HomeAssistant) -> None:
    manager, _asset, binding, first = await _manager_with_binding(hass, "first")
    await async_adopt_binding(manager, binding.id)

    count = await async_revert_all_adoptions(manager)

    current = er.async_get(hass).entities.get_entry(first.id)
    assert count == 1
    assert current is not None and current.hidden_by is None
    assert manager.registry.adoptions == {}
