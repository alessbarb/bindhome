"""Tests for asset updates and registry mutation notifications."""

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import (
    BindHomeRegistry,
    RegistryConflictError,
)


def test_update_asset_preserves_identity_and_updates_metadata() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Old light",
            asset_type="light_point",
            code="OLD-01",
            area_id="old_area",
            capabilities=["on_off"],
        )
    )

    updated = registry.update_asset(
        asset.id,
        name="New light",
        asset_type="ceiling_light",
        code="NEW-01",
        area_id="new_area",
        capabilities=["on_off", "dimming"],
    )

    assert updated.id == asset.id
    assert updated.name == "New light"
    assert updated.asset_type == "ceiling_light"
    assert updated.code == "NEW-01"
    assert updated.area_id == "new_area"
    assert updated.capabilities == ("dimming", "on_off")
    assert registry.get_asset(asset.id) == updated


def test_update_asset_rejects_duplicate_code() -> None:
    registry = BindHomeRegistry()
    first = registry.add_asset(
        Asset.create(name="First", asset_type="socket", code="SOCK-01")
    )
    second = registry.add_asset(
        Asset.create(name="Second", asset_type="socket", code="SOCK-02")
    )

    with pytest.raises(
        RegistryConflictError,
        match="Asset code SOCK-01 already exists",
    ):
        registry.update_asset(
            second.id,
            name=second.name,
            asset_type=second.asset_type,
            code=first.code,
            area_id=second.area_id,
            capabilities=list(second.capabilities),
        )


def test_update_asset_cannot_orphan_binding() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Light",
            asset_type="light_point",
            capabilities=["on_off", "dimming"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.backend",
        )
    )

    with pytest.raises(
        RegistryConflictError,
        match="Cannot remove capabilities that still have active bindings",
    ):
        registry.update_asset(
            asset.id,
            name=asset.name,
            asset_type=asset.asset_type,
            code=asset.code,
            area_id=asset.area_id,
            capabilities=["dimming"],
        )


async def test_manager_update_persists_and_dispatches(
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

    asset = await manager.async_create_asset(
        name="Original",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    updated = await manager.async_update_asset(
        asset_id=asset.id,
        name="Renamed",
        asset_type="ceiling_light",
        code="LGT-02",
        area_id="living_room",
        capabilities=["on_off", "dimming"],
    )
    await hass.async_block_till_done()

    assert updated.id == asset.id
    assert len(notifications) == 2

    reloaded = BindHomeManager(hass)
    await reloaded.async_load()
    persisted = reloaded.registry.get_asset(asset.id)

    assert persisted.id == asset.id
    assert persisted.name == "Renamed"
    assert persisted.asset_type == "ceiling_light"
    assert persisted.code == "LGT-02"
    assert persisted.area_id == "living_room"
    assert persisted.capabilities == ("dimming", "on_off")

    unsubscribe()
