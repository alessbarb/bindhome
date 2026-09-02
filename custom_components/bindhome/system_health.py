"""System health support for BindHome."""

from __future__ import annotations

from typing import Any, cast

from homeassistant import config_entries
from homeassistant.components import system_health
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .manager import BindHomeManager


@callback
def async_register(
    hass: HomeAssistant, register: system_health.SystemHealthRegistration
) -> None:
    """Register BindHome system health information."""
    register.async_register_info(_async_system_health_info)


async def _async_system_health_info(hass: HomeAssistant) -> dict[str, Any]:
    """Return BindHome system health information."""
    entries = [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is config_entries.ConfigEntryState.LOADED
    ]
    if not entries:
        return {"loaded": False}

    manager = cast(BindHomeManager, entries[0].runtime_data)
    return {
        "loaded": True,
        "assets": len(manager.registry.assets),
        "relations": len(manager.registry.relations),
        "bindings": len(manager.registry.bindings),
        "representations": len(manager.registry.representations),
    }
