"""Tests for BindHome store and manager."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant

from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.registry import RegistryConflictError
from custom_components.bindhome.store import BindHomeStore


async def test_store_empty_initial(hass: HomeAssistant) -> None:
    store = BindHomeStore(hass)
    registry = await store.async_load()
    assert len(registry.assets) == 0
    assert len(registry.relations) == 0
    assert len(registry.bindings) == 0


async def test_manager_load_and_persist(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    asset = await manager.async_create_asset(
        name="Living Room Lamp",
        asset_type="light_point",
        code="LGT-01",
        area_id="living_room",
        capabilities=["on_off", "dimming"],
    )

    assert asset.id in manager.registry.assets
    assert manager.registry.assets[asset.id].name == "Living Room Lamp"

    # Reload into new manager instance to verify persistence
    new_manager = BindHomeManager(hass)
    await new_manager.async_load()

    assert asset.id in new_manager.registry.assets
    loaded_asset = new_manager.registry.assets[asset.id]
    assert loaded_asset.name == "Living Room Lamp"
    assert loaded_asset.code == "LGT-01"
    assert loaded_asset.capabilities == ("dimming", "on_off")


async def test_manager_relation_lifecycle(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    source = await manager.async_create_asset(
        name="Main Panel",
        asset_type="panel",
        code=None,
        area_id=None,
        capabilities=[],
    )
    target = await manager.async_create_asset(
        name="Kitchen Circuit",
        asset_type="circuit",
        code=None,
        area_id=None,
        capabilities=[],
    )

    relation = await manager.async_add_relation(
        source_asset_id=source.id,
        relation_type="feeds",
        target_asset_id=target.id,
    )

    assert relation.id in manager.registry.relations

    await manager.async_remove_relation(relation.id)
    assert relation.id not in manager.registry.relations


async def test_manager_binding_lifecycle_and_replacement(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    asset = await manager.async_create_asset(
        name="Ceiling Fan",
        asset_type="fan",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )

    binding1 = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="fan.old_switch",
        role="primary",
    )

    assert binding1.id in manager.registry.bindings
    assert manager.registry.bindings[binding1.id].entity_id == "fan.old_switch"

    # Replacement semantics: same asset, capability, and role
    binding2 = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="fan.new_switch",
        role="primary",
    )

    assert binding2.id == binding1.id
    assert len(manager.registry.bindings) == 1
    assert manager.registry.bindings[binding1.id].entity_id == "fan.new_switch"

    await manager.async_remove_binding(binding1.id)
    assert binding1.id not in manager.registry.bindings


async def test_failed_mutation_does_not_persist_partial_state(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    await manager.async_create_asset(
        name="Asset 1",
        asset_type="socket",
        code="SOCK-01",
        area_id=None,
        capabilities=[],
    )

    # Spy on store save
    manager._store.async_save = AsyncMock()

    # Attempt duplicate code creation
    with pytest.raises(RegistryConflictError):
        await manager.async_create_asset(
            name="Asset 2",
            asset_type="socket",
            code="SOCK-01",
            area_id=None,
            capabilities=[],
        )

    # Storage save should not have been called for the failed mutation
    manager._store.async_save.assert_not_called()
    assert len(manager.registry.assets) == 1


async def test_manager_delete_asset(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    asset = await manager.async_create_asset(
        name="Temporary Asset",
        asset_type="socket",
        code=None,
        area_id=None,
        capabilities=[],
    )

    assert asset.id in manager.registry.assets
    await manager.async_delete_asset(asset.id)
    assert asset.id not in manager.registry.assets
