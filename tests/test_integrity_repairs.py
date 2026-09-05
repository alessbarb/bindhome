"""Lifecycle tests for actionable BindHome integrity Repairs."""

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome import async_setup
from custom_components.bindhome.const import DOMAIN


@pytest.fixture
async def bindhome_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up BindHome with integrity Repair tracking enabled."""
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    await async_setup(hass, {})
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _issue(hass: HomeAssistant, entry_id: str, kind: str):
    return ir.async_get(hass).async_get_issue(DOMAIN, f"{kind}_{entry_id}")


async def test_stale_area_repair_appears_and_resolves_after_asset_update(
    hass: HomeAssistant,
    bindhome_entry: MockConfigEntry,
) -> None:
    manager = bindhome_entry.runtime_data
    asset = await manager.async_create_asset(
        name="Hall socket",
        asset_type="socket",
        code=None,
        area_id="area-that-no-longer-exists",
        capabilities=[],
    )
    await hass.async_block_till_done()

    issue = _issue(hass, bindhome_entry.entry_id, "stale_areas")
    assert issue is not None
    assert issue.translation_key == "stale_areas"
    assert issue.translation_placeholders["count"] == "1"
    assert issue.translation_placeholders["assets"] == "Hall socket"

    await manager.async_update_asset(
        asset_id=asset.id,
        name=asset.name,
        asset_type=asset.asset_type,
        code=asset.code,
        area_id=None,
        capabilities=list(asset.capabilities),
    )
    await hass.async_block_till_done()

    assert _issue(hass, bindhome_entry.entry_id, "stale_areas") is None


async def test_deleting_home_assistant_area_creates_grouped_repair(
    hass: HomeAssistant,
    bindhome_entry: MockConfigEntry,
) -> None:
    manager = bindhome_entry.runtime_data
    area_registry = ar.async_get(hass)
    area = area_registry.async_create("Utility room")

    for name in ("Boiler", "Pump"):
        await manager.async_create_asset(
            name=name,
            asset_type="equipment",
            code=None,
            area_id=area.id,
            capabilities=[],
        )
    await hass.async_block_till_done()
    assert _issue(hass, bindhome_entry.entry_id, "stale_areas") is None

    area_registry.async_delete(area.id)
    await hass.async_block_till_done()

    issue = _issue(hass, bindhome_entry.entry_id, "stale_areas")
    assert issue is not None
    assert issue.translation_placeholders["count"] == "2"
    assert issue.translation_placeholders["assets"] == "Boiler, Pump"


async def test_entity_registry_deletion_creates_and_rebind_resolves_repair(
    hass: HomeAssistant,
    bindhome_entry: MockConfigEntry,
) -> None:
    manager = bindhome_entry.runtime_data
    asset = await manager.async_create_asset(
        name="Ceiling light",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    entity_registry = er.async_get(hass)
    original = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "old-relay",
        suggested_object_id="old_relay",
    )
    await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=original.entity_id,
        role="primary",
    )
    await hass.async_block_till_done()
    assert _issue(hass, bindhome_entry.entry_id, "stale_bindings") is None

    entity_registry.async_remove(original.entity_id)
    await hass.async_block_till_done()

    issue = _issue(hass, bindhome_entry.entry_id, "stale_bindings")
    assert issue is not None
    assert issue.translation_key == "stale_bindings"
    assert issue.translation_placeholders["count"] == "1"
    assert (
        issue.translation_placeholders["bindings"] == "Ceiling light — on_off/primary"
    )

    replacement = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "new-relay",
        suggested_object_id="new_relay",
    )
    await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=replacement.entity_id,
        role="primary",
    )
    await hass.async_block_till_done()

    assert _issue(hass, bindhome_entry.entry_id, "stale_bindings") is None


async def test_multiple_broken_bindings_share_one_repair(
    hass: HomeAssistant,
    bindhome_entry: MockConfigEntry,
) -> None:
    manager = bindhome_entry.runtime_data
    entity_registry = er.async_get(hass)

    for index, name in enumerate(("Lamp A", "Lamp B")):
        asset = await manager.async_create_asset(
            name=name,
            asset_type="light_point",
            code=None,
            area_id=None,
            capabilities=["on_off"],
        )
        entity = entity_registry.async_get_or_create(
            "switch",
            "demo",
            f"relay-{index}",
            suggested_object_id=f"relay_{index}",
        )
        await manager.async_set_binding(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entity.entity_id,
            role="primary",
        )
        entity_registry.async_remove(entity.entity_id)

    await hass.async_block_till_done()

    issue = _issue(hass, bindhome_entry.entry_id, "stale_bindings")
    assert issue is not None
    assert issue.translation_placeholders["count"] == "2"
    assert "Lamp A — on_off/primary" in issue.translation_placeholders["bindings"]
    assert "Lamp B — on_off/primary" in issue.translation_placeholders["bindings"]


async def test_runtime_unavailable_does_not_create_repair(
    hass: HomeAssistant,
    bindhome_entry: MockConfigEntry,
) -> None:
    manager = bindhome_entry.runtime_data
    asset = await manager.async_create_asset(
        name="Offline relay",
        asset_type="switch",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    entity_registry = er.async_get(hass)
    entity = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "offline-relay",
        suggested_object_id="offline_relay",
    )
    hass.states.async_set(entity.entity_id, "unavailable")
    await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entity.entity_id,
        role="primary",
    )
    await hass.async_block_till_done()

    assert _issue(hass, bindhome_entry.entry_id, "stale_bindings") is None


async def test_entity_rename_remains_resolved_and_does_not_create_repair(
    hass: HomeAssistant,
    bindhome_entry: MockConfigEntry,
) -> None:
    manager = bindhome_entry.runtime_data
    asset = await manager.async_create_asset(
        name="Rename-safe relay",
        asset_type="switch",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    entity_registry = er.async_get(hass)
    entity = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "rename-safe",
        suggested_object_id="rename_safe",
    )
    await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entity.entity_id,
        role="primary",
    )

    entity_registry.async_update_entity(
        entity.entity_id,
        new_entity_id="switch.renamed_relay",
    )
    await hass.async_block_till_done()

    assert _issue(hass, bindhome_entry.entry_id, "stale_bindings") is None
    resolution = manager.resolver.resolve(asset.id, "on_off")
    assert resolution.entity_id == "switch.renamed_relay"
