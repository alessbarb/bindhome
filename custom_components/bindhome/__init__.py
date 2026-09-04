"""BindHome integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .manager import BindHomeManager
from .panel import async_register_panel, async_unregister_panel
from .representation import implemented_platforms
from .services import async_register_services
from .store import BindHomeStoreError
from .websocket import async_register_websocket_commands

type BindHomeConfigEntry = ConfigEntry[BindHomeManager]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
PLATFORMS = [Platform(platform) for platform in implemented_platforms()]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up BindHome and register service actions."""
    async_register_services(hass)
    async_register_websocket_commands(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: BindHomeConfigEntry) -> bool:
    """Set up BindHome from a config entry."""
    manager = BindHomeManager(hass)
    try:
        await manager.async_load()
    except BindHomeStoreError as err:
        raise ConfigEntryError(str(err)) from err

    entry.runtime_data = manager
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: BindHomeConfigEntry) -> bool:
    """Unload BindHome."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        async_unregister_panel(hass)
    return unload_ok
