"""WebSocket API for the read-only Home Assistant reference audit."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.core import HomeAssistant

from .authorization import admin_read
from .const import DOMAIN
from .manager import BindHomeManager
from .reference_audit import async_audit_direct_references
from .registry import RegistryValidationError

WS_REFERENCE_AUDIT = f"{DOMAIN}/references/audit"


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    """Return the loaded BindHome manager."""
    entries = [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is config_entries.ConfigEntryState.LOADED
    ]
    if not entries:
        raise RegistryValidationError("BindHome is not configured or loaded")
    return cast(BindHomeManager, entries[0].runtime_data)


@admin_read
@websocket_command({vol.Required("type"): WS_REFERENCE_AUDIT})
@async_response
async def ws_reference_audit(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return direct-reference debt without mutating any Home Assistant source."""
    try:
        manager = _get_manager(hass)
    except RegistryValidationError as err:
        connection.send_error(msg["id"], "not_found", str(err))
        return

    result = await async_audit_direct_references(hass, manager.registry)
    connection.send_result(msg["id"], result)


def async_register_reference_websocket_commands(hass: HomeAssistant) -> None:
    """Register read-only reference audit commands."""
    websocket_api.async_register_command(hass, ws_reference_audit)
