"""Administrative WebSocket API for assisted Home Assistant import discovery."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import ERR_INVALID_FORMAT
from homeassistant.components.websocket_api.decorators import (
    require_admin,
    websocket_command,
)
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .import_discovery import ImportDiscoveryError, discover_import_proposals
from .manager import BindHomeManager
from .registry import RegistryValidationError

WS_IMPORT_DISCOVER = f"{DOMAIN}/import/discover"


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        raise RegistryValidationError("BindHome is not configured")
    entry = entries[0]
    if entry.state is not config_entries.ConfigEntryState.LOADED:
        raise RegistryValidationError("BindHome is not loaded")
    return cast(BindHomeManager, entry.runtime_data)


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_IMPORT_DISCOVER,
        vol.Optional("area_id"): str,
    }
)
def ws_import_discover(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return non-mutating assisted-import proposals for review."""
    try:
        manager = _get_manager(hass)
        proposals = discover_import_proposals(
            hass,
            manager.registry,
            area_id=msg.get("area_id"),
        )
    except (ImportDiscoveryError, RegistryValidationError) as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return

    connection.send_result(
        msg["id"],
        {
            "scope": {
                "type": "area" if msg.get("area_id") is not None else "all",
                "area_id": msg.get("area_id"),
            },
            "revision": manager.revision,
            "count": len(proposals),
            "proposals": [proposal.to_dict() for proposal in proposals],
        },
    )


def async_register_import_websocket_commands(hass: HomeAssistant) -> None:
    """Register assisted-import read commands."""
    websocket_api.async_register_command(hass, ws_import_discover)
