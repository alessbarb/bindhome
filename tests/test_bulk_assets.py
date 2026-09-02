"""Tests for transactional bulk Asset creation."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import (
    AssetCreateSpec,
    BindHomeManager,
    BulkAssetCreateError,
)
from custom_components.bindhome.resolver import ResolutionStatus


async def test_bulk_create_persists_once_preserves_order_and_registry_identity(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    original_registry = manager.registry

    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    real_save = manager._store.async_save
    manager._store.async_save = AsyncMock(wraps=real_save)

    created = await manager.async_create_assets(
        [
            AssetCreateSpec(
                name="Light point 1",
                asset_type="light_point",
                area_id="living_room",
                capabilities=("on_off",),
            ),
            AssetCreateSpec(
                name="Socket 1",
                asset_type="socket",
                code="SOCK-01",
                area_id="living_room",
            ),
            AssetCreateSpec(
                name="Radiator 1",
                asset_type="radiator",
                area_id="living_room",
            ),
        ]
    )
    await hass.async_block_till_done()

    assert [asset.name for asset in created] == [
        "Light point 1",
        "Socket 1",
        "Radiator 1",
    ]

    # Long-lived runtime consumers may retain this object.
    assert manager.registry is original_registry

    assert manager._store.async_save.await_count == 1
    assert notifications == [None]

    assert list(manager.registry.assets) == [asset.id for asset in created]

    # Verify the one persisted batch can be reloaded normally.
    reloaded = BindHomeManager(hass)
    await reloaded.async_load()

    assert [asset.name for asset in reloaded.registry.assets.values()] == [
        "Light point 1",
        "Socket 1",
        "Radiator 1",
    ]

    unsubscribe()


async def test_bulk_create_duplicate_code_rolls_back_entire_batch(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    manager._store.async_save = AsyncMock()

    with pytest.raises(BulkAssetCreateError) as raised:
        await manager.async_create_assets(
            [
                AssetCreateSpec(
                    name="Socket 1",
                    asset_type="socket",
                    code="SOCK-01",
                ),
                AssetCreateSpec(
                    name="Socket 2",
                    asset_type="socket",
                    code="SOCK-01",
                ),
                AssetCreateSpec(
                    name="Socket 3",
                    asset_type="socket",
                    code="SOCK-03",
                ),
            ]
        )

    error = raised.value

    assert error.index == 1
    assert error.field == "code"
    assert "SOCK-01" in error.reason

    assert manager.registry.assets == {}
    manager._store.async_save.assert_not_awaited()

    await hass.async_block_till_done()
    assert notifications == []

    unsubscribe()


async def test_bulk_create_model_error_identifies_failing_row(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    manager._store.async_save = AsyncMock()

    with pytest.raises(BulkAssetCreateError) as raised:
        await manager.async_create_assets(
            [
                AssetCreateSpec(
                    name="Socket 1",
                    asset_type="socket",
                ),
                AssetCreateSpec(
                    name="Broken",
                    asset_type="Not Valid",
                ),
                AssetCreateSpec(
                    name="Socket 3",
                    asset_type="socket",
                ),
            ]
        )

    error = raised.value

    assert error.index == 1
    assert error.field == "asset_type"
    assert manager.registry.assets == {}
    manager._store.async_save.assert_not_awaited()


async def test_bulk_create_storage_failure_leaves_live_registry_unchanged(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    existing = await manager.async_create_asset(
        name="Existing socket",
        asset_type="socket",
        code="EXISTING-01",
        area_id=None,
        capabilities=[],
    )

    original_registry = manager.registry
    original_assets = dict(manager.registry.assets)

    manager._store.async_save = AsyncMock(
        side_effect=RuntimeError("storage failed"),
    )

    with pytest.raises(RuntimeError, match="storage failed"):
        await manager.async_create_assets(
            [
                AssetCreateSpec(
                    name="New socket",
                    asset_type="socket",
                    code="NEW-01",
                )
            ]
        )

    assert manager.registry is original_registry
    assert manager.registry.assets == original_assets
    assert list(manager.registry.assets) == [existing.id]


async def test_bulk_create_rejects_empty_batch(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    manager._store.async_save = AsyncMock()

    with pytest.raises(
        ValueError,
        match="assets must contain at least one item",
    ):
        await manager.async_create_assets([])

    manager._store.async_save.assert_not_awaited()


async def test_bulk_create_preserves_existing_topology_bindings_and_live_resolver(
    hass: HomeAssistant,
) -> None:
    """A batch commit must not invalidate existing runtime references."""
    hass.states.async_set("switch.existing_backend", "off")
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
        name="Existing light",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )

    relation = await manager.async_add_relation(
        source_asset_id=source.id,
        relation_type="feeds",
        target_asset_id=target.id,
    )

    binding = await manager.async_set_binding(
        asset_id=target.id,
        capability="on_off",
        entity_id="switch.existing_backend",
        role="primary",
    )

    # Capture a resolver before the batch. This is representative of a
    # long-lived logical entity which must keep observing the live registry.
    resolver = manager.resolver
    original_registry = manager.registry

    manager._store.async_save = AsyncMock()

    created = await manager.async_create_assets(
        [
            AssetCreateSpec(
                name="New logical candidate",
                asset_type="light_point",
                code="LGT-02",
                capabilities=("on_off",),
            )
        ]
    )

    new_asset = created[0]

    assert manager.registry is original_registry

    # Existing topology and bindings survive the staged commit unchanged.
    assert manager.registry.relations[relation.id] == relation
    assert manager.registry.bindings[binding.id] == binding

    # Most importantly, the resolver created BEFORE the batch sees the newly
    # committed Asset. If the manager had replaced the registry object, this
    # would incorrectly return ASSET_NOT_FOUND.
    resolution = resolver.resolve(new_asset.id, "on_off")

    assert resolution.status is ResolutionStatus.BINDING_NOT_FOUND
    assert resolution.config_valid is False

    manager._store.async_save.assert_awaited_once()
