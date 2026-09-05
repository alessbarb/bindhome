"""Logical light reactions to stable Binding target Entity Registry events."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send

from custom_components.bindhome.const import SIGNAL_BINDING_TARGET_CHANGED
from custom_components.bindhome.light import BindHomeLight
from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import (
    BindingResolver,
    HomeAssistantEntityProbe,
)


async def test_logical_light_moves_subscription_after_stable_target_rename(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "test",
        "logical-target-rename",
        suggested_object_id="logical_before",
    )

    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Logical ceiling light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entry.entity_id,
            entity_registry_id=entry.id,
        )
    )
    hass.states.async_set(entry.entity_id, "off")

    logical = BindHomeLight(
        hass,
        asset,
        BindingResolver(registry, HomeAssistantEntityProbe(hass)),
    )
    monkeypatch.setattr(logical, "async_write_ha_state", lambda: None)
    await logical.async_added_to_hass()

    assert logical._subscribed_entity_id == entry.entity_id
    assert logical.is_on is False

    renamed = entity_registry.async_update_entity(
        entry.entity_id,
        new_entity_id="switch.logical_after",
    )
    hass.states.async_set(renamed.entity_id, "on")
    async_dispatcher_send(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        {
            "action": "update",
            "entity_registry_id": entry.id,
            "entity_id": renamed.entity_id,
            "old_entity_id": entry.entity_id,
        },
    )

    assert logical._subscribed_entity_id == renamed.entity_id
    assert logical.available is True
    assert logical.is_on is True

    hass.states.async_set(entry.entity_id, "on")
    await hass.async_block_till_done()
    assert logical.is_on is True

    hass.states.async_set(renamed.entity_id, "off")
    await hass.async_block_till_done()
    assert logical.is_on is False

    await logical.async_will_remove_from_hass()


async def test_logical_light_becomes_unavailable_after_stable_target_removal(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "test",
        "logical-target-remove",
        suggested_object_id="logical_remove",
    )

    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Logical wall light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entry.entity_id,
            entity_registry_id=entry.id,
        )
    )
    hass.states.async_set(entry.entity_id, "on")

    logical = BindHomeLight(
        hass,
        asset,
        BindingResolver(registry, HomeAssistantEntityProbe(hass)),
    )
    monkeypatch.setattr(logical, "async_write_ha_state", lambda: None)
    await logical.async_added_to_hass()
    assert logical.available is True

    entity_registry.async_remove(entry.entity_id)
    async_dispatcher_send(
        hass,
        SIGNAL_BINDING_TARGET_CHANGED,
        {
            "action": "remove",
            "entity_registry_id": entry.id,
            "entity_id": None,
            "old_entity_id": entry.entity_id,
        },
    )

    assert logical._subscribed_entity_id is None
    assert logical.available is False
    assert logical.is_on is None

    await logical.async_will_remove_from_hass()
