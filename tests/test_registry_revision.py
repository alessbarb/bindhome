"""Tests for BindHome's runtime Registry revision contract."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import (
    BindHomeManager,
    RegistryRevisionConflictError,
)
from custom_components.bindhome.store import BindHomeStoreError


async def _create_asset(
    manager: BindHomeManager,
    *,
    name: str,
    expected_revision: int | None,
):
    return await manager.async_create_asset(
        name=name,
        asset_type="socket",
        code=None,
        area_id=None,
        capabilities=["on_off"],
        expected_revision=expected_revision,
    )


async def test_two_clients_detect_stale_revision_before_persistence(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    manager._store.async_save = AsyncMock()  # type: ignore[method-assign]

    assert manager.revision == 0
    asset = await _create_asset(manager, name="Client A", expected_revision=0)
    assert manager.revision == 1

    with pytest.raises(RegistryRevisionConflictError) as conflict:
        await manager.async_update_asset(
            asset_id=asset.id,
            name="Stale client B",
            asset_type=asset.asset_type,
            code=asset.code,
            area_id=asset.area_id,
            capabilities=list(asset.capabilities),
            expected_revision=0,
        )

    assert conflict.value.expected == 0
    assert conflict.value.current == 1
    assert manager.registry.get_asset(asset.id).name == "Client A"
    manager._store.async_save.assert_awaited_once()

    updated = await manager.async_update_asset(
        asset_id=asset.id,
        name="Fresh client B",
        asset_type=asset.asset_type,
        code=asset.code,
        area_id=asset.area_id,
        capabilities=list(asset.capabilities),
        expected_revision=1,
    )

    assert updated.name == "Fresh client B"
    assert manager.revision == 2
    assert manager._store.async_save.await_count == 2


async def test_one_successful_commit_emits_one_revision_notification(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    manager._store.async_save = AsyncMock()  # type: ignore[method-assign]
    revisions: list[int] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: revisions.append(manager.revision),
    )

    try:
        await _create_asset(manager, name="One commit", expected_revision=0)
    finally:
        unsubscribe()

    assert revisions == [1]
    assert manager.revision == 1


async def test_persistence_failure_does_not_advance_revision_or_notify(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    manager._store.async_save = AsyncMock(  # type: ignore[method-assign]
        side_effect=BindHomeStoreError("disk full")
    )
    revisions: list[int] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: revisions.append(manager.revision),
    )

    try:
        with pytest.raises(BindHomeStoreError, match="disk full"):
            await _create_asset(manager, name="Never committed", expected_revision=0)
    finally:
        unsubscribe()

    assert manager.revision == 0
    assert revisions == []
    assert manager.registry.assets == {}


async def test_transaction_revision_precondition_is_checked_under_same_boundary(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    manager._store.async_save = AsyncMock()  # type: ignore[method-assign]

    await _create_asset(manager, name="Baseline", expected_revision=0)

    with pytest.raises(RegistryRevisionConflictError):
        async with manager.transaction(expected_revision=0):
            raise AssertionError("stale transaction body must never execute")

    assert manager.revision == 1
    manager._store.async_save.assert_awaited_once()
