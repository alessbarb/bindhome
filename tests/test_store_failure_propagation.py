"""Tests for fail-fast BindHome storage writes."""

from unittest.mock import MagicMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.util.file import WriteError

from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.store import BindHomeStoreError


async def test_underlying_store_write_failure_does_not_commit(
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
    assert manager._store._store._atomic_writes is True

    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    manager._store._store._write_prepared_data = MagicMock(
        side_effect=WriteError("disk full"),
    )

    try:
        with pytest.raises(
            BindHomeStoreError,
            match="Failed to persist BindHome registry",
        ):
            await manager.async_update_asset(
                asset_id=asset.id,
                name="Should not commit",
                asset_type="socket",
                code="SOCK-02",
                area_id=None,
                capabilities=[],
            )

        await hass.async_block_till_done()

        assert manager.registry is original_registry
        assert manager.registry.to_dict() == baseline
        assert notifications == []

        reloaded = BindHomeManager(hass)
        await reloaded.async_load()
        assert reloaded.registry.to_dict() == baseline
    finally:
        unsubscribe()
