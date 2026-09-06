"""Administrative WebSocket API for human-editable CSV inventory maintenance."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import ERR_INVALID_FORMAT
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.core import HomeAssistant

from .authorization import admin_read, admin_write
from .const import DOMAIN
from .csv_inventory import (
    CSV_FORMAT_VERSION,
    CsvBatchValidationError,
    async_import_inventory_csv,
    export_inventory_csv,
    validate_inventory_csv,
)
from .manager import BindHomeManager, RegistryRevisionConflictError
from .registry import RegistryValidationError
from .store import BindHomeStoreError

WS_CSV_EXPORT = f"{DOMAIN}/csv/export"
WS_CSV_VALIDATE = f"{DOMAIN}/csv/validate"
WS_CSV_IMPORT = f"{DOMAIN}/csv/import"


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        raise RegistryValidationError("BindHome is not configured")
    entry = entries[0]
    if entry.state is not config_entries.ConfigEntryState.LOADED:
        raise RegistryValidationError("BindHome is not loaded")
    return cast(BindHomeManager, entry.runtime_data)


def _validation_payload(error: CsvBatchValidationError) -> dict[str, object]:
    return {
        "valid": False,
        "format_version": CSV_FORMAT_VERSION,
        "errors": [item.to_dict() for item in error.errors],
    }


@admin_read
@websocket_command({vol.Required("type"): WS_CSV_EXPORT})
def ws_csv_export(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Export the human-maintenance Asset CSV."""
    try:
        manager = _get_manager(hass)
    except RegistryValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return

    connection.send_result(
        msg["id"],
        {
            "format_version": CSV_FORMAT_VERSION,
            "csv": export_inventory_csv(hass, manager.registry),
            "row_count": len(manager.registry.assets),
        },
    )


@admin_read
@websocket_command(
    {
        vol.Required("type"): WS_CSV_VALIDATE,
        vol.Required("csv"): str,
    }
)
def ws_csv_validate(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Validate a complete CSV without mutating the live Registry."""
    try:
        manager = _get_manager(hass)
        preview = validate_inventory_csv(hass, manager.registry, msg["csv"])
    except RegistryValidationError as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return
    except CsvBatchValidationError as err:
        connection.send_result(msg["id"], _validation_payload(err))
        return

    connection.send_result(
        msg["id"],
        {
            "valid": True,
            "format_version": CSV_FORMAT_VERSION,
            "errors": [],
            "preview": preview.to_dict(),
            "revision": manager.revision,
        },
    )


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_CSV_IMPORT,
        vol.Required("csv"): str,
        vol.Optional("based_on_revision"): vol.All(int, vol.Range(min=0)),
    }
)
@async_response
async def ws_csv_import(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Validate and commit the complete CSV as one Registry transaction."""
    try:
        manager = _get_manager(hass)
        preview = await async_import_inventory_csv(
            manager,
            msg["csv"],
            **(
                {"expected_revision": msg["based_on_revision"]}
                if "based_on_revision" in msg
                else {}
            ),
        )
    except CsvBatchValidationError as err:
        payload = _validation_payload(err)
        payload["imported"] = False
        connection.send_result(msg["id"], payload)
        return
    except RegistryRevisionConflictError as err:
        connection.send_error(msg["id"], "conflict", str(err))
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
            "imported": True,
            "valid": True,
            "format_version": CSV_FORMAT_VERSION,
            "errors": [],
            "preview": preview.to_dict(),
            "revision": manager.revision,
        },
    )


def async_register_csv_websocket_commands(hass: HomeAssistant) -> None:
    """Register CSV inventory commands."""
    websocket_api.async_register_command(hass, ws_csv_export)
    websocket_api.async_register_command(hass, ws_csv_validate)
    websocket_api.async_register_command(hass, ws_csv_import)
