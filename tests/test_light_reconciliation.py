"""Runtime reconciliation tests for BindHome logical lights."""

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome import async_setup
from custom_components.bindhome.const import DOMAIN


@pytest.fixture
async def bindhome_entry(hass: HomeAssistant):
    """Set up BindHome and always cleanly unload its entity platforms."""
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)

    await async_setup(hass, {})
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    yield entry

    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()


async def test_asset_created_after_setup_adds_logical_light(
    hass: HomeAssistant,
    bindhome_entry,
) -> None:
    manager = bindhome_entry.runtime_data

    asset = await manager.async_create_asset(
        name="Dynamic light",
        asset_type="light_point",
        code="DYN-01",
        area_id=None,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        f"{DOMAIN}_{asset.id}",
    )

    assert entity_id is not None
    assert hass.states.get(entity_id) is not None


async def test_existing_asset_becomes_logical_light_when_on_off_added(
    hass: HomeAssistant,
    bindhome_entry,
) -> None:
    manager = bindhome_entry.runtime_data

    asset = await manager.async_create_asset(
        name="Initially passive",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=[],
    )
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    unique_id = f"{DOMAIN}_{asset.id}"

    assert registry.async_get_entity_id("light", DOMAIN, unique_id) is None

    await manager.async_update_asset(
        asset_id=asset.id,
        name=asset.name,
        asset_type=asset.asset_type,
        code=asset.code,
        area_id=asset.area_id,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    )

    assert entity_id is not None
    assert hass.states.get(entity_id) is not None


async def test_logical_light_metadata_updates_without_identity_change(
    hass: HomeAssistant,
    bindhome_entry,
) -> None:
    manager = bindhome_entry.runtime_data

    asset = await manager.async_create_asset(
        name="Old name",
        asset_type="light_point",
        code="LGT-OLD",
        area_id=None,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    unique_id = f"{DOMAIN}_{asset.id}"
    entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    )

    assert entity_id is not None

    await manager.async_update_asset(
        asset_id=asset.id,
        name="New name",
        asset_type="ceiling_light",
        code="LGT-NEW",
        area_id=None,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    updated_entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    )

    assert updated_entity_id == entity_id

    state = hass.states.get(entity_id)
    assert state is not None
    assert state.attributes["friendly_name"] == "New name"

    registry_entry = registry.async_get(entity_id)
    assert registry_entry is not None
    assert registry_entry.original_name == "New name"


async def test_removing_on_off_removes_logical_light_cleanly(
    hass: HomeAssistant,
    bindhome_entry,
) -> None:
    manager = bindhome_entry.runtime_data

    asset = await manager.async_create_asset(
        name="Temporary logical light",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    unique_id = f"{DOMAIN}_{asset.id}"
    entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    )

    assert entity_id is not None
    assert hass.states.get(entity_id) is not None

    await manager.async_update_asset(
        asset_id=asset.id,
        name=asset.name,
        asset_type=asset.asset_type,
        code=asset.code,
        area_id=asset.area_id,
        capabilities=[],
    )
    await hass.async_block_till_done()

    assert registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    ) is None
    assert hass.states.get(entity_id) is None


async def test_removed_capability_can_be_readded_with_same_entity_id(
    hass: HomeAssistant,
    bindhome_entry,
) -> None:
    manager = bindhome_entry.runtime_data

    asset = await manager.async_create_asset(
        name="Recreatable light",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    unique_id = f"{DOMAIN}_{asset.id}"

    original_entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    )
    assert original_entity_id is not None

    await manager.async_update_asset(
        asset_id=asset.id,
        name=asset.name,
        asset_type=asset.asset_type,
        code=asset.code,
        area_id=asset.area_id,
        capabilities=[],
    )
    await hass.async_block_till_done()

    await manager.async_update_asset(
        asset_id=asset.id,
        name=asset.name,
        asset_type=asset.asset_type,
        code=asset.code,
        area_id=asset.area_id,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    restored_entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    )

    assert restored_entity_id == original_entity_id
    assert hass.states.get(restored_entity_id) is not None


async def test_deleting_asset_removes_logical_light_without_reload(
    hass: HomeAssistant,
    bindhome_entry,
) -> None:
    manager = bindhome_entry.runtime_data

    asset = await manager.async_create_asset(
        name="Disposable light",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    await hass.async_block_till_done()

    registry = er.async_get(hass)
    unique_id = f"{DOMAIN}_{asset.id}"

    entity_id = registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    )

    assert entity_id is not None
    assert hass.states.get(entity_id) is not None

    await manager.async_delete_asset(asset.id)
    await hass.async_block_till_done()

    assert registry.async_get_entity_id(
        "light",
        DOMAIN,
        unique_id,
    ) is None
    assert hass.states.get(entity_id) is None
