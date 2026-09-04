"""Administrative WebSocket API for BindHome Registry backup and restore."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import ERR_INVALID_FORMAT
from homeassistant.components.websocket_api.decorators import (
    async_response,
    require_admin,
    websocket_command,
)
from homeassistant.core import HomeAssistant

from .backup import (
    BackupValidationError,
    async_restore_registry_backup,
    export_registry_backup,
)
from .const import DOMAIN
from .manager import BindHomeManager
from .registry import RegistryValidationError
from .store import BindHomeStoreError

WS_BACKUP_EXPORT = f"{DOMAIN}/backup/export"
WS_BACKUP_RESTORE = f"{DOMAIN}/backup/restore"


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


@require_admin
@websocket_command({vol.Required("type"): WS_BACKUP_EXPORT})
@async_response
async def ws_backup_export(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Export the complete Registry in the stable backup envelope."""
    try:
        backup = export_registry_backup(_get_manager(hass).registry)
    except RegistryValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return

    connection.send_result(msg["id"], {"backup": backup})


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_BACKUP_RESTORE,
        vol.Required("backup"): dict,
    }
)
@async_response
async def ws_backup_restore(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Validate and atomically restore the Registry from a backup."""
    try:
        registry = await async_restore_registry_backup(_get_manager(hass), msg["backup"])
    except BackupValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return
    except BindHomeStoreError as err:
        connection.send_error(msg["id"], "storage_error", str(err))
        return
    except RegistryValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return

    connection.send_result(
        msg["id"],
        {
            "restored": True,
            "registry": registry.to_dict(),
        },
    )


def async_register_backup_websocket_commands(hass: HomeAssistant) -> None:
    """Register BindHome backup WebSocket commands."""
    websocket_api.async_register_command(hass, ws_backup_export)
    websocket_api.async_register_command(hass, ws_backup_restore)
