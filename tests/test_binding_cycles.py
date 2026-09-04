"""Tests for functional BindHome composition cycle validation."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.manager import BindHomeManager, BindingCycleError
from custom_components.bindhome.models import Asset, Representation


def _asset(manager: BindHomeManager, name: str, capabilities: list[str]) -> Asset:
    asset = Asset.create(name=name, asset_type="fixture", capabilities=capabilities)
    manager.registry.add_asset(asset)
    return asset


def _logical_entity(hass: HomeAssistant, asset: Asset) -> str:
    return (
        er.async_get(hass)
        .async_get_or_create(
            "light",
            "bindhome",
            f"bindhome_{asset.id}",
            suggested_object_id=f"asset_{asset.id[:8]}",
        )
        .entity_id
    )


@pytest.fixture
def manager(hass: HomeAssistant) -> BindHomeManager:
    value = BindHomeManager(hass)
    value._store.async_save = AsyncMock()
    return value


@pytest.mark.asyncio
async def test_bindhome_composition_is_acyclic_and_self_cycle_is_rejected(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    source = _asset(manager, "Source", ["on_off"])
    target = _asset(manager, "Target", ["on_off"])
    manager.registry.set_representation(
        Representation.create(asset_id=source.id, platform="light")
    )
    manager.registry.set_representation(
        Representation.create(asset_id=target.id, platform="light")
    )
    physical = (
        er.async_get(hass)
        .async_get_or_create("switch", "demo", "relay", suggested_object_id="relay")
        .entity_id
    )

    await manager.async_set_binding(
        asset_id=target.id, capability="on_off", entity_id=physical, role="primary"
    )
    await manager.async_set_binding(
        asset_id=source.id,
        capability="on_off",
        entity_id=_logical_entity(hass, target),
        role="primary",
    )

    with pytest.raises(BindingCycleError):
        await manager.async_set_binding(
            asset_id=source.id,
            capability="on_off",
            entity_id=_logical_entity(hass, source),
            role="primary",
        )

    assert len(manager.registry.bindings) == 2
    assert manager._store.async_save.await_count == 2


@pytest.mark.asyncio
async def test_functional_binding_keys_avoid_asset_level_false_positive(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    source = _asset(manager, "Source", ["on_off", "temperature"])
    target = _asset(manager, "Target", ["on_off"])
    for asset in (source, target):
        manager.registry.set_representation(
            Representation.create(asset_id=asset.id, platform="light")
        )
    physical = (
        er.async_get(hass)
        .async_get_or_create(
            "sensor", "demo", "temperature", suggested_object_id="temperature"
        )
        .entity_id
    )
    await manager.async_set_binding(
        asset_id=source.id,
        capability="temperature",
        entity_id=_logical_entity(hass, target),
        role="primary",
    )
    await manager.async_set_binding(
        asset_id=target.id,
        capability="on_off",
        entity_id=_logical_entity(hass, source),
        role="primary",
    )
    # The path ends at source.on_off, which is unbound; A -> B -> A at the
    # Asset level is therefore valid at the functional BindingKey level.
    await manager.async_set_binding(
        asset_id=source.id,
        capability="on_off",
        entity_id=physical,
        role="primary",
    )


@pytest.mark.asyncio
@pytest.mark.parametrize("state", ["off", "unavailable", "unknown"])
async def test_ordinary_state_machine_targets_are_accepted(
    hass: HomeAssistant, manager: BindHomeManager, state: str
) -> None:
    asset = _asset(manager, "Ordinary", ["on_off"])
    hass.states.async_set("switch.ordinary", state)
    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="switch.ordinary",
        role="primary",
    )
    assert binding.entity_id == "switch.ordinary"


@pytest.mark.asyncio
async def test_registry_only_target_and_bindhome_looking_foreign_entity_are_terminal(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    asset = _asset(manager, "Ordinary", ["on_off"])
    entity_registry = er.async_get(hass)
    entity_registry.async_get_or_create(
        "switch", "demo", "registered", suggested_object_id="registered"
    )
    entity_registry.async_get_or_create(
        "light", "other_integration", "bindhome_fake", suggested_object_id="fake"
    )
    await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="switch.registered",
        role="primary",
    )
    await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="light.fake",
        role="primary",
    )
    only_binding = manager.registry.bindings[next(iter(manager.registry.bindings))]
    assert only_binding.entity_id == "light.fake"


@pytest.mark.asyncio
async def test_representation_mapping_uses_identity_and_survives_entity_rename(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    target = _asset(manager, "Logical", ["on_off"])
    manager.registry.set_representation(
        Representation.create(asset_id=target.id, platform="light")
    )
    entity_registry = er.async_get(hass)
    entity_registry.async_get_or_create(
        "light", "bindhome", f"bindhome_{target.id}", suggested_object_id="logical"
    )
    source = _asset(manager, "Source", ["on_off"])
    await manager.async_set_binding(
        asset_id=source.id,
        capability="on_off",
        entity_id="light.logical",
        role="primary",
    )
    entity_registry.async_update_entity("light.logical", new_entity_id="light.renamed")
    replacement = _asset(manager, "Replacement", ["on_off"])
    await manager.async_set_binding(
        asset_id=replacement.id,
        capability="on_off",
        entity_id="light.renamed",
        role="primary",
    )
    assert len(manager.registry.bindings) == 2


@pytest.mark.asyncio
async def test_stale_bindhome_metadata_without_active_representation_is_terminal(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    stale = _asset(manager, "Stale", ["on_off"])
    er.async_get(hass).async_get_or_create(
        "light", "bindhome", f"bindhome_{stale.id}", suggested_object_id="stale"
    )
    source = _asset(manager, "Source", ["on_off"])
    await manager.async_set_binding(
        asset_id=source.id,
        capability="on_off",
        entity_id="light.stale",
        role="primary",
    )
    only_binding = manager.registry.bindings[next(iter(manager.registry.bindings))]
    assert only_binding.entity_id == "light.stale"


def _configure_logical_assets(
    hass: HomeAssistant, manager: BindHomeManager, count: int = 3
) -> list[Asset]:
    assets = [_asset(manager, f"Logical {index}", ["on_off"]) for index in range(count)]
    entity_registry = er.async_get(hass)
    for asset in assets:
        manager.registry.set_representation(
            Representation.create(asset_id=asset.id, platform="light")
        )
        entity_registry.async_get_or_create(
            "light",
            "bindhome",
            f"bindhome_{asset.id}",
            suggested_object_id=f"logical_{asset.id[:8]}",
        )
    return assets


@pytest.mark.asyncio
async def test_two_and_three_node_cycles_are_rejected(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    a, b, c = _configure_logical_assets(hass, manager)
    for source, target in ((a, b), (b, c)):
        await manager.async_set_binding(
            asset_id=source.id,
            capability="on_off",
            entity_id=f"light.logical_{target.id[:8]}",
            role="primary",
        )
    with pytest.raises(BindingCycleError):
        await manager.async_set_binding(
            asset_id=c.id,
            capability="on_off",
            entity_id=f"light.logical_{a.id[:8]}",
            role="primary",
        )

    with pytest.raises(BindingCycleError):
        await manager.async_set_binding(
            asset_id=b.id,
            capability="on_off",
            entity_id=f"light.logical_{a.id[:8]}",
            role="primary",
        )


@pytest.mark.asyncio
async def test_acyclic_multi_hop_bindhome_chain_is_accepted(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    a, b, c = _configure_logical_assets(hass, manager)
    physical = (
        er.async_get(hass)
        .async_get_or_create(
            "switch", "demo", "terminal", suggested_object_id="terminal"
        )
        .entity_id
    )
    await manager.async_set_binding(
        asset_id=c.id, capability="on_off", entity_id=physical, role="primary"
    )
    await manager.async_set_binding(
        asset_id=b.id,
        capability="on_off",
        entity_id=f"light.logical_{c.id[:8]}",
        role="primary",
    )
    await manager.async_set_binding(
        asset_id=a.id,
        capability="on_off",
        entity_id=f"light.logical_{b.id[:8]}",
        role="primary",
    )
    assert len(manager.registry.bindings) == 3


@pytest.mark.asyncio
async def test_replacement_ignores_old_edge_preserves_id_and_unrelated_bindings(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    a, b, c = _configure_logical_assets(hass, manager)
    physical = (
        er.async_get(hass)
        .async_get_or_create(
            "switch", "demo", "physical", suggested_object_id="physical"
        )
        .entity_id
    )
    first = await manager.async_set_binding(
        asset_id=a.id,
        capability="on_off",
        entity_id=f"light.logical_{b.id[:8]}",
        role="primary",
    )
    unrelated = await manager.async_set_binding(
        asset_id=c.id, capability="on_off", entity_id=physical, role="primary"
    )
    replaced = await manager.async_set_binding(
        asset_id=a.id, capability="on_off", entity_id=physical, role="primary"
    )
    assert replaced.id == first.id
    assert manager.registry.bindings[unrelated.id] == unrelated


@pytest.mark.asyncio
async def test_non_primary_bindings_are_preserved_and_do_not_create_light_dependency(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    a, b = _configure_logical_assets(hass, manager, 2)
    physical = (
        er.async_get(hass)
        .async_get_or_create("switch", "demo", "backup", suggested_object_id="backup")
        .entity_id
    )
    backup = await manager.async_set_binding(
        asset_id=b.id, capability="on_off", entity_id=physical, role="backup"
    )
    await manager.async_set_binding(
        asset_id=a.id,
        capability="on_off",
        entity_id=f"light.logical_{b.id[:8]}",
        role="primary",
    )
    assert manager.registry.bindings[backup.id] == backup


@pytest.mark.asyncio
async def test_cycle_failure_is_atomic(
    hass: HomeAssistant, manager: BindHomeManager
) -> None:
    asset = _asset(manager, "Self", ["on_off"])
    manager.registry.set_representation(
        Representation.create(asset_id=asset.id, platform="light")
    )
    entity_registry = er.async_get(hass)
    entity_registry.async_get_or_create(
        "light", "bindhome", f"bindhome_{asset.id}", suggested_object_id="self"
    )
    with pytest.raises(BindingCycleError):
        await manager.async_set_binding(
            asset_id=asset.id,
            capability="on_off",
            entity_id="light.self",
            role="primary",
        )
    assert not manager.registry.bindings
    manager._store.async_save.assert_not_awaited()
