"""Administrative WebSocket API for BindHome Registry backup and recovery."""

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
    parse_registry_backup,
)
from .const import DOMAIN
from .manager import BindHomeManager
from .recovery import async_get_recovery_state
from .registry import BindHomeRegistry, RegistryValidationError
from .store import BindHomeStore, BindHomeStoreError

WS_BACKUP_EXPORT = f"{DOMAIN}/backup/export"
WS_BACKUP_RESTORE = f"{DOMAIN}/backup/restore"
WS_BACKUP_RECOVERY_STATUS = f"{DOMAIN}/backup/recovery_status"


def _get_entry(hass: HomeAssistant) -> config_entries.ConfigEntry:
    """Return the single configured BindHome entry."""
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        raise RegistryValidationError("BindHome is not configured")
    return entries[0]


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    """Return the loaded BindHome manager."""
    entry = _get_entry(hass)
    if entry.state is not config_entries.ConfigEntryState.LOADED:
        raise RegistryValidationError("BindHome is not loaded")
    return cast(BindHomeManager, entry.runtime_data)


async def _async_restore_recovery_registry(
    hass: HomeAssistant,
    data: object,
) -> tuple[BindHomeRegistry, bool]:
    """Restore directly to storage when normal Registry setup failed closed."""
    entry = _get_entry(hass)
    state = async_get_recovery_state(hass, entry.entry_id)
    if state is None:
        raise RegistryValidationError(
            "BindHome has no active Registry recovery condition"
        )

    # Parse/migrate the complete backup before touching persistent storage.
    registry = parse_registry_backup(data)
    store = BindHomeStore(hass)
    await store.async_save(registry)

    # A successful reload clears recovery state only after normal manager load,
    # platform setup and panel registration succeed. If reload cannot complete,
    # the valid restored Registry remains on disk and the Repair stays visible.
    reloaded = await hass.config_entries.async_reload(entry.entry_id)
    return registry, bool(reloaded)


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
@websocket_command({vol.Required("type"): WS_BACKUP_RECOVERY_STATUS})
def ws_backup_recovery_status(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return degraded Registry recovery state without requiring a live manager."""
    try:
        entry = _get_entry(hass)
    except RegistryValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return

    state = async_get_recovery_state(hass, entry.entry_id)
    connection.send_result(
        msg["id"],
        {
            "recovery_required": state is not None,
            "entry_state": entry.state.value,
            "recovery": state.to_dict() if state is not None else None,
        },
    )


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
    """Restore Registry through the live manager or the fail-closed recovery path."""
    recovery_reload: bool | None = None
    try:
        entry = _get_entry(hass)
        if entry.state is config_entries.ConfigEntryState.LOADED:
            registry = await async_restore_registry_backup(
                _get_manager(hass),
                msg["backup"],
            )
        else:
            registry, recovery_reload = await _async_restore_recovery_registry(
                hass,
                msg["backup"],
            )
    except BackupValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return
    except BindHomeStoreError as err:
        connection.send_error(msg["id"], "storage_error", str(err))
        return
    except RegistryValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return

    result: dict[str, Any] = {
        "restored": True,
        "registry": registry.to_dict(),
    }
    if recovery_reload is not None:
        result["reloaded"] = recovery_reload
    connection.send_result(msg["id"], result)


def async_register_backup_websocket_commands(hass: HomeAssistant) -> None:
    """Register BindHome backup and recovery WebSocket commands."""
    websocket_api.async_register_command(hass, ws_backup_export)
    websocket_api.async_register_command(hass, ws_backup_restore)
    websocket_api.async_register_command(hass, ws_backup_recovery_status)
