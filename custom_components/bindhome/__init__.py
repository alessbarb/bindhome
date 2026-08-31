"""BindHome integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .manager import BindHomeManager
from .services import async_register_services
from .websocket import async_register_websocket_commands

type BindHomeConfigEntry = ConfigEntry[BindHomeManager]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up BindHome and register service actions."""
    async_register_services(hass)
    async_register_websocket_commands(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: BindHomeConfigEntry) -> bool:
    """Set up BindHome from a config entry."""
    manager = BindHomeManager(hass)
    await manager.async_load()
    entry.runtime_data = manager
    return True


async def async_unload_entry(hass: HomeAssistant, entry: BindHomeConfigEntry) -> bool:
    """Unload BindHome."""
    return True
