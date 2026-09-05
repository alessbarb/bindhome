"""Home Assistant integration tests for stable Binding runtime identity."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import (
    BindingResolver,
    HomeAssistantEntityProbe,
    ResolutionStatus,
)


async def test_ha_probe_follows_entity_registry_rename(hass: HomeAssistant) -> None:
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "stable-relay",
        suggested_object_id="before_rename",
    )
    stable_id = entry.id
    old_entity_id = entry.entity_id
    renamed = entity_registry.async_update_entity(
        old_entity_id,
        new_entity_id="switch.after_rename",
    )

    probe = HomeAssistantEntityProbe(hass)

    assert probe.entity_id_for_registry_id(stable_id) == renamed.entity_id
    assert renamed.entity_id == "switch.after_rename"


async def test_resolver_uses_ha_registry_identity_after_rename(
    hass: HomeAssistant,
) -> None:
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "bound-relay",
        suggested_object_id="original",
    )
    stable_id = entry.id
    original_entity_id = entry.entity_id
    entity_registry.async_update_entity(
        original_entity_id,
        new_entity_id="switch.renamed",
    )
    hass.states.async_set("switch.renamed", "on")

    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Relay",
            asset_type="relay",
            capabilities=["on_off"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=original_entity_id,
            entity_registry_id=stable_id,
        )
    )

    resolution = BindingResolver(
        registry,
        HomeAssistantEntityProbe(hass),
    ).resolve(asset.id, "on_off")

    assert resolution.status is ResolutionStatus.RESOLVED
    assert resolution.entity_id == "switch.renamed"
    assert resolution.state == "on"
