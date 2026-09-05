"""Administrator WebSocket API for safe human Asset deletion."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import ERR_NOT_FOUND
from homeassistant.components.websocket_api.decorators import (
    async_response,
    require_admin,
    websocket_command,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .deletion import async_delete_asset_with_dependencies, build_asset_delete_impact
from .manager import BindHomeManager
from .registry import RegistryConflictError, RegistryNotFoundError

WS_ASSET_DELETE_IMPACT = f"{DOMAIN}/assets/delete_impact"
WS_ASSET_DELETE_WITH_DEPENDENCIES = f"{DOMAIN}/assets/delete_with_dependencies"


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    entries = [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is config_entries.ConfigEntryState.LOADED
    ]
    if not entries:
        raise RegistryNotFoundError("BindHome is not configured or loaded")
    return cast(BindHomeManager, entries[0].runtime_data)


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_ASSET_DELETE_IMPACT,
        vol.Required("asset_id"): cv.string,
    }
)
def ws_asset_delete_impact(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the current deletion impact without mutating anything."""
    try:
        manager = _get_manager(hass)
        impact = build_asset_delete_impact(manager, msg["asset_id"])
    except RegistryNotFoundError as err:
        connection.send_error(msg["id"], ERR_NOT_FOUND, str(err))
        return
    result = impact.to_dict()
    result["revision"] = manager.revision
    connection.send_result(msg["id"], result)


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_ASSET_DELETE_WITH_DEPENDENCIES,
        vol.Required("asset_id"): cv.string,
        vol.Optional("based_on_revision"): vol.All(int, vol.Range(min=0)),
    }
)
@async_response
async def ws_asset_delete_with_dependencies(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete an Asset and all BindHome-owned dependencies transactionally."""
    manager = _get_manager(hass)
    try:
        impact = await async_delete_asset_with_dependencies(
            manager,
            msg["asset_id"],
            expected_revision=msg.get("based_on_revision"),
        )
    except RegistryNotFoundError as err:
        connection.send_error(msg["id"], ERR_NOT_FOUND, str(err))
        return
    except RegistryConflictError as err:
        connection.send_error(msg["id"], "conflict", str(err))
        return

    connection.send_result(
        msg["id"],
        {
            "deleted": True,
            "impact": impact.to_dict(),
            "revision": manager.revision,
        },
    )


def async_register_deletion_websocket_commands(hass: HomeAssistant) -> None:
    """Register safe-deletion WebSocket commands."""
    websocket_api.async_register_command(hass, ws_asset_delete_impact)
    websocket_api.async_register_command(hass, ws_asset_delete_with_dependencies)
