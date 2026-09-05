"""Tests for Home Assistant Entity Registry events affecting Binding targets."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)

from custom_components.bindhome.binding_events import BindingTargetEventTracker
from custom_components.bindhome.const import (
    SIGNAL_BINDING_TARGET_CHANGED,
    SIGNAL_REGISTRY_CHANGED,
)
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.models import Asset, Binding


def _asset(manager: BindHomeManager) -> Asset:
    return manager.registry.add_asset(
        Asset.create(
            name="Tracked light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )


def _bind(
    manager: BindHomeManager,
    asset: Asset,
    *,
    entity_id: str,
    entity_registry_id: str,
) -> Binding:
    return manager.registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entity_id,
            entity_registry_id=entity_registry_id,
        )
    )


def _registry_entry(hass: HomeAssistant, unique_id: str, object_id: str):
    return er.async_get(hass).async_get_or_create(
        "switch",
        "test",
        unique_id,
        suggested_object_id=object_id,
    )


async def test_entity_registry_rename_notifies_bound_stable_target(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    entry = _registry_entry(hass, "target-rename", "before_rename")
    asset = _asset(manager)
    _bind(
        manager,
        asset,
        entity_id=entry.entity_id,
        entity_registry_id=entry.id,
    )
    manager._store.async_save = AsyncMock()  # type: ignore[method-assign]

    changes: list[dict[str, object]] = []
    unsub_signal = async_dispatcher_connect(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        changes.append,
    )
    tracker = BindingTargetEventTracker(hass, manager)
    tracker.async_setup()

    renamed = er.async_get(hass).async_update_entity(
        entry.entity_id,
        new_entity_id="switch.after_rename",
    )
    await hass.async_block_till_done()

    assert renamed.id == entry.id
    assert changes == [
        {
            "action": "update",
            "entity_registry_id": entry.id,
            "entity_id": "switch.after_rename",
            "old_entity_id": entry.entity_id,
        }
    ]
    manager._store.async_save.assert_not_awaited()

    tracker.async_unload()
    unsub_signal()


async def test_entity_registry_remove_marks_current_stable_target_stale(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    entry = _registry_entry(hass, "target-remove", "remove_me")
    asset = _asset(manager)
    _bind(
        manager,
        asset,
        entity_id=entry.entity_id,
        entity_registry_id=entry.id,
    )

    changes: list[dict[str, object]] = []
    unsub_signal = async_dispatcher_connect(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        changes.append,
    )
    tracker = BindingTargetEventTracker(hass, manager)
    tracker.async_setup()

    er.async_get(hass).async_remove(entry.entity_id)
    await hass.async_block_till_done()

    assert changes == [
        {
            "action": "remove",
            "entity_registry_id": entry.id,
            "entity_id": None,
            "old_entity_id": entry.entity_id,
        }
    ]

    tracker.async_unload()
    unsub_signal()


async def test_rename_then_remove_tracks_the_current_entity_id(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    entry = _registry_entry(hass, "target-rename-remove", "old_name")
    asset = _asset(manager)
    binding = _bind(
        manager,
        asset,
        entity_id=entry.entity_id,
        entity_registry_id=entry.id,
    )

    changes: list[dict[str, object]] = []
    unsub_signal = async_dispatcher_connect(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        changes.append,
    )
    tracker = BindingTargetEventTracker(hass, manager)
    tracker.async_setup()

    renamed = er.async_get(hass).async_update_entity(
        entry.entity_id,
        new_entity_id="switch.current_name",
    )
    await hass.async_block_till_done()
    er.async_get(hass).async_remove(renamed.entity_id)
    await hass.async_block_till_done()

    assert [change["action"] for change in changes] == ["update", "remove"]
    assert changes[-1]["old_entity_id"] == "switch.current_name"
    # The persisted last-known entity_id deliberately remains untouched.
    assert binding.entity_id == entry.entity_id

    tracker.async_unload()
    unsub_signal()


async def test_unrelated_and_non_rename_registry_updates_are_ignored(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    bound = _registry_entry(hass, "target-bound", "bound")
    unrelated = _registry_entry(hass, "target-unrelated", "unrelated")
    asset = _asset(manager)
    _bind(
        manager,
        asset,
        entity_id=bound.entity_id,
        entity_registry_id=bound.id,
    )

    changes: list[dict[str, object]] = []
    unsub_signal = async_dispatcher_connect(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        changes.append,
    )
    tracker = BindingTargetEventTracker(hass, manager)
    tracker.async_setup()

    er.async_get(hass).async_update_entity(bound.entity_id, name="Still bound")
    er.async_get(hass).async_update_entity(
        unrelated.entity_id,
        new_entity_id="switch.unrelated_renamed",
    )
    await hass.async_block_till_done()

    assert changes == []

    tracker.async_unload()
    unsub_signal()


async def test_bindhome_registry_change_refreshes_tracked_target_set(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    entry = _registry_entry(hass, "target-added-later", "added_later")
    asset = _asset(manager)

    changes: list[dict[str, object]] = []
    unsub_signal = async_dispatcher_connect(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        changes.append,
    )
    tracker = BindingTargetEventTracker(hass, manager)
    tracker.async_setup()

    _bind(
        manager,
        asset,
        entity_id=entry.entity_id,
        entity_registry_id=entry.id,
    )
    async_dispatcher_send(hass, SIGNAL_REGISTRY_CHANGED)

    er.async_get(hass).async_update_entity(
        entry.entity_id,
        new_entity_id="switch.added_later_renamed",
    )
    await hass.async_block_till_done()

    assert len(changes) == 1
    assert changes[0]["entity_registry_id"] == entry.id

    tracker.async_unload()
    unsub_signal()


async def test_tracker_setup_is_idempotent_and_unload_stops_events(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    entry = _registry_entry(hass, "target-lifecycle", "lifecycle")
    asset = _asset(manager)
    _bind(
        manager,
        asset,
        entity_id=entry.entity_id,
        entity_registry_id=entry.id,
    )

    changes: list[dict[str, object]] = []
    unsub_signal = async_dispatcher_connect(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        changes.append,
    )
    tracker = BindingTargetEventTracker(hass, manager)
    tracker.async_setup()
    tracker.async_setup()

    renamed = er.async_get(hass).async_update_entity(
        entry.entity_id,
        new_entity_id="switch.lifecycle_renamed",
    )
    await hass.async_block_till_done()
    assert len(changes) == 1

    tracker.async_unload()
    er.async_get(hass).async_update_entity(
        renamed.entity_id,
        new_entity_id="switch.lifecycle_after_unload",
    )
    await hass.async_block_till_done()

    assert len(changes) == 1
    unsub_signal()
