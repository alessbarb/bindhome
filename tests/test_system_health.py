"""Tests for BindHome system health."""

from unittest.mock import MagicMock

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome import async_setup
from custom_components.bindhome.const import DOMAIN
from custom_components.bindhome.system_health import (
    _async_system_health_info,
    async_register,
)


async def test_system_health_unloaded(hass: HomeAssistant) -> None:
    info = await _async_system_health_info(hass)
    assert info == {"loaded": False}


async def test_system_health_loaded(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    await async_setup(hass, {})
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    manager = entry.runtime_data
    await manager.async_create_asset(
        name="Light",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=[],
    )

    info = await _async_system_health_info(hass)
    assert info == {
        "loaded": True,
        "assets": 1,
        "relations": 0,
        "bindings": 0,
        "representations": 0,
    }


def test_system_health_register(hass: HomeAssistant) -> None:
    mock_registration = MagicMock()
    async_register(hass, mock_registration)
    mock_registration.async_register_info.assert_called_once_with(
        _async_system_health_info
    )
