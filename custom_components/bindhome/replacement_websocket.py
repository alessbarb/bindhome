"""WebSocket API for guided hardware replacement."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import (
    ERR_INVALID_FORMAT,
    ERR_NOT_FOUND,
)
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .authorization import admin_read, admin_write
from .const import DOMAIN
from .manager import BindHomeManager
from .models import ModelValidationError
from .registry import RegistryError, RegistryNotFoundError
from .replacement import ReplacementError, async_replace_binding, replacement_candidates

WS_REPLACEMENT_CANDIDATES = f"{DOMAIN}/replacement/candidates"
WS_REPLACEMENT_COMMIT = f"{DOMAIN}/replacement/commit"


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    entries = [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is config_entries.ConfigEntryState.LOADED
    ]
    if not entries:
        raise ReplacementError("BindHome is not configured or loaded")
    return cast(BindHomeManager, entries[0].runtime_data)


def _send_error(
    connection: ActiveConnection, msg: dict[str, Any], err: Exception
) -> None:
    if isinstance(err, RegistryNotFoundError):
        code = ERR_NOT_FOUND
    elif isinstance(
        err,
        (ReplacementError, ModelValidationError, RegistryError, ServiceValidationError),
    ):
        code = ERR_INVALID_FORMAT
    else:
        code = ERR_INVALID_FORMAT
    connection.send_error(msg["id"], code, str(err))


@admin_read
@websocket_command(
    {
        vol.Required("type"): WS_REPLACEMENT_CANDIDATES,
        vol.Required("asset_id"): cv.string,
        vol.Required("capability"): cv.string,
        vol.Optional("role", default="primary"): cv.string,
    }
)
@async_response
async def ws_replacement_candidates(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return current compatible hardware candidates for one Binding key."""
    try:
        result = replacement_candidates(
            hass,
            _get_manager(hass),
            asset_id=msg["asset_id"],
            capability=msg["capability"],
            role=msg.get("role", "primary"),
        )
    except (ModelValidationError, RegistryError, ServiceValidationError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], result)


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_REPLACEMENT_COMMIT,
        vol.Required("asset_id"): cv.string,
        vol.Required("capability"): cv.string,
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("role", default="primary"): cv.string,
        vol.Required("based_on_revision"): vol.All(int, vol.Range(min=0)),
    }
)
@async_response
async def ws_replacement_commit(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Revalidate and atomically commit one reviewed replacement."""
    try:
        result = await async_replace_binding(
            hass,
            _get_manager(hass),
            asset_id=msg["asset_id"],
            capability=msg["capability"],
            entity_id=msg["entity_id"],
            role=msg.get("role", "primary"),
            expected_revision=msg["based_on_revision"],
        )
    except (ModelValidationError, RegistryError, ServiceValidationError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], result)


def async_register_replacement_websocket_commands(hass: HomeAssistant) -> None:
    """Register guided hardware-replacement WebSocket commands."""
    websocket_api.async_register_command(hass, ws_replacement_candidates)
    websocket_api.async_register_command(hass, ws_replacement_commit)
