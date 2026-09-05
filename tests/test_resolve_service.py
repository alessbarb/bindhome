"""Tests for the bindhome.resolve response action."""

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome import async_setup
from custom_components.bindhome.const import DOMAIN, SERVICE_RESOLVE


@pytest.fixture
async def setup_bindhome(hass: HomeAssistant) -> MockConfigEntry:
    """Set up a loaded BindHome integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    await async_setup(hass, {})
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _resolve(
    hass: HomeAssistant,
    *,
    asset_id: str,
    capability: str = "on_off",
    role: str = "primary",
):
    return await hass.services.async_call(
        DOMAIN,
        SERVICE_RESOLVE,
        {
            "asset_id": asset_id,
            "capability": capability,
            "role": role,
        },
        blocking=True,
        return_response=True,
    )


async def _asset(setup_bindhome: MockConfigEntry):
    return await setup_bindhome.runtime_data.async_create_asset(
        name="Ceiling light",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )


async def test_resolve_action_returns_resolved_binding(
    hass: HomeAssistant,
    setup_bindhome: MockConfigEntry,
) -> None:
    asset = await _asset(setup_bindhome)
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "relay-1",
        suggested_object_id="relay_1",
    )
    hass.states.async_set(entry.entity_id, "on")
    await setup_bindhome.runtime_data.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="primary",
    )

    response = await _resolve(hass, asset_id=asset.id)

    assert response == {
        "asset_id": asset.id,
        "capability": "on_off",
        "role": "primary",
        "status": "resolved",
        "entity_id": entry.entity_id,
        "config_valid": True,
        "runtime_available": True,
        "state": "on",
    }


async def test_resolve_action_returns_structured_missing_binding(
    hass: HomeAssistant,
    setup_bindhome: MockConfigEntry,
) -> None:
    asset = await _asset(setup_bindhome)

    response = await _resolve(hass, asset_id=asset.id)

    assert response["status"] == "binding_not_found"
    assert response["entity_id"] is None
    assert response["config_valid"] is False
    assert response["runtime_available"] is False
    assert response["state"] is None


async def test_resolve_action_returns_structured_stale_target(
    hass: HomeAssistant,
    setup_bindhome: MockConfigEntry,
) -> None:
    asset = await _asset(setup_bindhome)
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "relay-stale",
        suggested_object_id="relay_stale",
    )
    await setup_bindhome.runtime_data.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="primary",
    )
    entity_registry.async_remove(entry.entity_id)

    response = await _resolve(hass, asset_id=asset.id)

    assert response["status"] == "entity_not_found"
    assert response["entity_id"] is None
    assert response["config_valid"] is False
    assert response["runtime_available"] is False


async def test_resolve_action_distinguishes_runtime_unavailable(
    hass: HomeAssistant,
    setup_bindhome: MockConfigEntry,
) -> None:
    asset = await _asset(setup_bindhome)
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "relay-offline",
        suggested_object_id="relay_offline",
    )
    await setup_bindhome.runtime_data.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="primary",
    )
    hass.states.async_set(entry.entity_id, "unavailable")

    response = await _resolve(hass, asset_id=asset.id)

    assert response["status"] == "runtime_unavailable"
    assert response["entity_id"] == entry.entity_id
    assert response["config_valid"] is True
    assert response["runtime_available"] is False
    assert response["state"] == "unavailable"


async def test_resolve_action_supports_non_default_role(
    hass: HomeAssistant,
    setup_bindhome: MockConfigEntry,
) -> None:
    asset = await _asset(setup_bindhome)
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "relay-backup",
        suggested_object_id="relay_backup",
    )
    hass.states.async_set(entry.entity_id, "off")
    await setup_bindhome.runtime_data.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="backup",
    )

    response = await _resolve(hass, asset_id=asset.id, role="backup")

    assert response["status"] == "resolved"
    assert response["role"] == "backup"
    assert response["entity_id"] == entry.entity_id


@pytest.mark.parametrize(
    ("data", "message"),
    [
        (
            {"asset_id": "", "capability": "on_off"},
            "asset_id must not be empty",
        ),
        (
            {"asset_id": "asset-id", "capability": "Bad Capability"},
            "capability must use lower_snake_case",
        ),
        (
            {
                "asset_id": "asset-id",
                "capability": "on_off",
                "role": "Bad Role",
            },
            "role must use lower_snake_case",
        ),
    ],
)
async def test_resolve_action_rejects_invalid_requests(
    hass: HomeAssistant,
    setup_bindhome: MockConfigEntry,
    data: dict[str, str],
    message: str,
) -> None:
    with pytest.raises(ServiceValidationError, match=message):
        await hass.services.async_call(
            DOMAIN,
            SERVICE_RESOLVE,
            data,
            blocking=True,
            return_response=True,
        )
