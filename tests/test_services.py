"""Tests for BindHome service actions."""

from typing import Any

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome import async_setup
from custom_components.bindhome.const import (
    DOMAIN,
    SERVICE_ADD_RELATION,
    SERVICE_CREATE_ASSET,
    SERVICE_DELETE_ASSET,
    SERVICE_GET_REGISTRY,
    SERVICE_REMOVE_BINDING,
    SERVICE_REMOVE_RELATION,
    SERVICE_SET_BINDING,
    SERVICE_UPDATE_ASSET,
)


@pytest.fixture
async def setup_bindhome(hass: HomeAssistant) -> MockConfigEntry:
    """Set up loaded BindHome integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    await async_setup(hass, {})
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_service_unloaded_raises_error(hass: HomeAssistant) -> None:
    await async_setup(hass, {})
    with pytest.raises(
        ServiceValidationError, match="BindHome is not configured or loaded"
    ):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_CREATE_ASSET,
            {"name": "Light", "asset_type": "light_point"},
            blocking=True,
        )


async def test_create_asset_service_and_area_validation(
    hass: HomeAssistant, setup_bindhome: MockConfigEntry
) -> None:
    area_reg = ar.async_get(hass)
    area = area_reg.async_get_or_create("living_room")

    # Call create_asset service with valid area
    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_ASSET,
        {
            "name": "Living Room Light",
            "asset_type": "light_point",
            "code": "LGT-1",
            "area_id": area.id,
            "capabilities": ["on_off"],
        },
        blocking=True,
        return_response=True,
    )
    assert response is not None
    asset_dict = response["asset"]
    assert asset_dict["name"] == "Living Room Light"
    assert asset_dict["area_id"] == area.id

    # Call with invalid area_id -> ServiceValidationError
    with pytest.raises(
        ServiceValidationError, match="Home Assistant area invalid_area was not found"
    ):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_CREATE_ASSET,
            {
                "name": "Bad Light",
                "asset_type": "light_point",
                "area_id": "invalid_area",
            },
            blocking=True,
        )


async def test_update_asset_service_is_partial(
    hass: HomeAssistant,
    setup_bindhome: MockConfigEntry,
) -> None:
    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_ASSET,
        {
            "name": "Original light",
            "asset_type": "light_point",
            "code": "LGT-01",
            "capabilities": ["on_off"],
        },
        blocking=True,
        return_response=True,
    )
    asset_id = response["asset"]["id"]

    updated = await hass.services.async_call(
        DOMAIN,
        SERVICE_UPDATE_ASSET,
        {
            "asset_id": asset_id,
            "name": "Renamed light",
        },
        blocking=True,
        return_response=True,
    )

    assert updated["asset"]["id"] == asset_id
    assert updated["asset"]["name"] == "Renamed light"
    assert updated["asset"]["asset_type"] == "light_point"
    assert updated["asset"]["code"] == "LGT-01"
    assert updated["asset"]["capabilities"] == ["on_off"]


async def test_create_asset_model_validation_translation(
    hass: HomeAssistant, setup_bindhome: MockConfigEntry
) -> None:
    with pytest.raises(ServiceValidationError, match="must use lower_snake_case"):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_CREATE_ASSET,
            {"name": "Bad Asset", "asset_type": "Bad Type"},
            blocking=True,
        )


async def test_set_binding_service_and_entity_validation(
    hass: HomeAssistant, setup_bindhome: MockConfigEntry
) -> None:
    # First create asset
    response = await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_ASSET,
        {
            "name": "Ceiling Light",
            "asset_type": "light_point",
            "capabilities": ["on_off"],
        },
        blocking=True,
        return_response=True,
    )
    asset_id = response["asset"]["id"]

    # Register entity in entity registry
    ent_reg = er.async_get(hass)
    ent_reg.async_get_or_create(
        "switch", "demo", "shelly_1", suggested_object_id="shelly_relay"
    )

    # Set binding to valid entity
    bind_resp = await hass.services.async_call(
        DOMAIN,
        SERVICE_SET_BINDING,
        {
            "asset_id": asset_id,
            "capability": "on_off",
            "entity_id": "switch.shelly_relay",
            "role": "primary",
        },
        blocking=True,
        return_response=True,
    )
    assert bind_resp is not None
    binding_id = bind_resp["binding"]["id"]
    assert bind_resp["binding"]["entity_id"] == "switch.shelly_relay"

    # Try set binding to invalid entity
    with pytest.raises(
        ServiceValidationError,
        match="Home Assistant entity switch.non_existent was not found",
    ):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_SET_BINDING,
            {
                "asset_id": asset_id,
                "capability": "on_off",
                "entity_id": "switch.non_existent",
            },
            blocking=True,
        )

    # Remove binding
    del_resp = await hass.services.async_call(
        DOMAIN,
        SERVICE_REMOVE_BINDING,
        {"binding_id": binding_id},
        blocking=True,
        return_response=True,
    )
    assert del_resp == {"deleted": True}


async def test_relation_services(
    hass: HomeAssistant, setup_bindhome: MockConfigEntry
) -> None:
    source_resp = await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_ASSET,
        {"name": "Panel", "asset_type": "panel"},
        blocking=True,
        return_response=True,
    )
    target_resp = await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_ASSET,
        {"name": "Circuit", "asset_type": "circuit"},
        blocking=True,
        return_response=True,
    )
    source_id = source_resp["asset"]["id"]
    target_id = target_resp["asset"]["id"]

    rel_resp = await hass.services.async_call(
        DOMAIN,
        SERVICE_ADD_RELATION,
        {
            "source_asset_id": source_id,
            "relation_type": "feeds",
            "target_asset_id": target_id,
        },
        blocking=True,
        return_response=True,
    )
    assert rel_resp is not None
    rel_id = rel_resp["relation"]["id"]

    # Delete asset blocked by relation -> ServiceValidationError
    with pytest.raises(
        ServiceValidationError, match="Cannot delete an asset used by a relation"
    ):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_DELETE_ASSET,
            {"asset_id": source_id},
            blocking=True,
        )

    # Remove relation
    await hass.services.async_call(
        DOMAIN,
        SERVICE_REMOVE_RELATION,
        {"relation_id": rel_id},
        blocking=True,
    )

    # Delete asset now succeeds
    await hass.services.async_call(
        DOMAIN,
        SERVICE_DELETE_ASSET,
        {"asset_id": source_id},
        blocking=True,
    )


async def test_get_registry_service(
    hass: HomeAssistant, setup_bindhome: MockConfigEntry
) -> None:
    await hass.services.async_call(
        DOMAIN,
        SERVICE_CREATE_ASSET,
        {"name": "Socket", "asset_type": "socket"},
        blocking=True,
    )

    registry_data: Any = await hass.services.async_call(
        DOMAIN,
        SERVICE_GET_REGISTRY,
        {},
        blocking=True,
        return_response=True,
    )
    assert registry_data["schema_version"] == 1
    assert len(registry_data["assets"]) == 1
    assert registry_data["assets"][0]["name"] == "Socket"
