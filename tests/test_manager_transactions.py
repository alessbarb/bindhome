"""Failure-atomicity tests for BindHomeManager mutations."""

from collections.abc import Awaitable, Callable
from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import BindHomeManager


async def _assert_storage_failure_is_atomic(
    hass: HomeAssistant,
    manager: BindHomeManager,
    mutation: Callable[[], Awaitable[object | None]],
) -> None:
    """Assert a failed save publishes neither staged RAM nor a change signal."""
    original_registry = manager.registry
    baseline = manager.registry.to_dict()

    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    manager._store.async_save = AsyncMock(
        side_effect=RuntimeError("storage failed"),
    )

    try:
        with pytest.raises(RuntimeError, match="storage failed"):
            await mutation()

        await hass.async_block_till_done()

        assert manager._store.async_save.await_count == 1
        assert manager.registry is original_registry
        assert manager.registry.to_dict() == baseline
        assert notifications == []

        reloaded = BindHomeManager(hass)
        await reloaded.async_load()
        assert reloaded.registry.to_dict() == baseline
    finally:
        unsubscribe()


async def test_create_asset_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_create_asset(
            name="New socket",
            asset_type="socket",
            code="SOCK-01",
            area_id=None,
            capabilities=[],
        ),
    )


async def test_update_asset_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Original",
        asset_type="socket",
        code="SOCK-01",
        area_id=None,
        capabilities=[],
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_update_asset(
            asset_id=asset.id,
            name="Renamed",
            asset_type="socket",
            code="SOCK-02",
            area_id="living_room",
            capabilities=[],
        ),
    )


async def test_delete_asset_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Socket",
        asset_type="socket",
        code="SOCK-01",
        area_id=None,
        capabilities=[],
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_delete_asset(asset.id),
    )


async def test_add_relation_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    source = await manager.async_create_asset(
        name="Panel",
        asset_type="panel",
        code="PANEL-01",
        area_id=None,
        capabilities=[],
    )
    target = await manager.async_create_asset(
        name="Socket",
        asset_type="socket",
        code="SOCK-01",
        area_id=None,
        capabilities=[],
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_add_relation(
            source_asset_id=source.id,
            relation_type="feeds",
            target_asset_id=target.id,
        ),
    )


async def test_remove_relation_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    source = await manager.async_create_asset(
        name="Panel",
        asset_type="panel",
        code="PANEL-01",
        area_id=None,
        capabilities=[],
    )
    target = await manager.async_create_asset(
        name="Socket",
        asset_type="socket",
        code="SOCK-01",
        area_id=None,
        capabilities=[],
    )
    relation = await manager.async_add_relation(
        source_asset_id=source.id,
        relation_type="feeds",
        target_asset_id=target.id,
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_remove_relation(relation.id),
    )


async def test_set_binding_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.backend", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Logical light",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_set_binding(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.backend",
            role="primary",
        ),
    )


async def test_replace_binding_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.backend_a", "off")
    hass.states.async_set("switch.backend_b", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Logical light",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )
    original = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="switch.backend_a",
        role="primary",
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_set_binding(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.backend_b",
            role="primary",
        ),
    )

    assert manager.registry.bindings[original.id] == original


async def test_remove_binding_storage_failure_is_atomic(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.backend", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Logical light",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )
    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="switch.backend",
        role="primary",
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_remove_binding(binding.id),
    )


async def test_set_representation_storage_failure_is_atomic(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Logical light",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_set_representation(
            asset_id=asset.id,
            platform="light",
        ),
    )


async def test_remove_representation_storage_failure_is_atomic(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Logical light",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )
    await manager.async_set_representation(
        asset_id=asset.id,
        platform="light",
    )

    await _assert_storage_failure_is_atomic(
        hass,
        manager,
        lambda: manager.async_remove_representation(asset.id),
    )


async def test_commit_persists_before_live_adoption_and_signal(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Original",
        asset_type="socket",
        code="SOCK-01",
        area_id=None,
        capabilities=[],
    )

    original_registry = manager.registry
    baseline = manager.registry.to_dict()
    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    async def assert_precommit_state(staged: object) -> None:
        assert manager.registry is original_registry
        assert manager.registry.to_dict() == baseline
        assert notifications == []
        assert staged is not manager.registry

    manager._store.async_save = AsyncMock(side_effect=assert_precommit_state)

    try:
        updated = await manager.async_update_asset(
            asset_id=asset.id,
            name="Committed",
            asset_type="socket",
            code="SOCK-02",
            area_id=None,
            capabilities=[],
        )
        await hass.async_block_till_done()

        assert manager.registry is original_registry
        assert manager.registry.get_asset(asset.id) == updated
        assert manager.registry.to_dict() != baseline
        assert notifications == [None]
    finally:
        unsubscribe()
