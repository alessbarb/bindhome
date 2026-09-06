"""WebSocket API for reversible managed hardware visibility."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import async_response, websocket_command
from homeassistant.core import HomeAssistant

from .adoption import AdoptionError
from .adoption_runtime import get_adoption_manager
from .authorization import admin_read, admin_write
from .const import DOMAIN
from .manager import BindHomeManager
from .reference_audit import async_audit_direct_references
from .registry import RegistryValidationError

WS_ADOPTION_STATUS = f"{DOMAIN}/adoption/status"
WS_ADOPTION_ADOPT = f"{DOMAIN}/adoption/adopt"
WS_ADOPTION_REVERT = f"{DOMAIN}/adoption/revert"
WS_ADOPTION_REVERT_ALL = f"{DOMAIN}/adoption/revert_all"


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    entries = [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is config_entries.ConfigEntryState.LOADED
    ]
    if not entries:
        raise RegistryValidationError("BindHome is not configured or loaded")
    return cast(BindHomeManager, entries[0].runtime_data)


async def _status(
    hass: HomeAssistant,
    manager: BindHomeManager,
    *,
    asset_id: str | None = None,
) -> dict[str, object]:
    adoption = get_adoption_manager(hass)
    result = adoption.status(manager.registry, asset_id=asset_id)
    if asset_id is not None:
        return result

    audit = await async_audit_direct_references(hass, manager.registry)
    summary = dict(result["summary"])
    audit_summary = audit["summary"]
    summary["direct_reference_debt"] = audit_summary["references"]
    summary["incomplete_reference_sources"] = audit_summary["incomplete_sources"]
    return {**result, "summary": summary}


@admin_read
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_STATUS,
        vol.Optional("asset_id"): str,
    }
)
@async_response
async def ws_adoption_status(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return managed visibility state and exposed-surface summary."""
    try:
        manager = _get_manager(hass)
        result = await _status(hass, manager, asset_id=msg.get("asset_id"))
    except (RegistryValidationError, AdoptionError) as err:
        connection.send_error(msg["id"], "not_found", str(err))
        return
    connection.send_result(msg["id"], result)


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_ADOPT,
        vol.Required("asset_id"): str,
        vol.Required("confirm"): vol.In([True]),
    }
)
@async_response
async def ws_adoption_adopt(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Adopt visibility for hardware explicitly bound to one Asset."""
    try:
        manager = _get_manager(hass)
        adoption = get_adoption_manager(hass)
        result = await adoption.async_adopt_asset(manager.registry, msg["asset_id"])
    except (RegistryValidationError, AdoptionError) as err:
        connection.send_error(msg["id"], "invalid_adoption", str(err))
        return
    connection.send_result(msg["id"], result)


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_REVERT,
        vol.Required("asset_id"): str,
        vol.Required("confirm"): vol.In([True]),
    }
)
@async_response
async def ws_adoption_revert(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Release one Asset's visibility ownership."""
    try:
        manager = _get_manager(hass)
        adoption = get_adoption_manager(hass)
        result = await adoption.async_revert_asset(manager.registry, msg["asset_id"])
    except (RegistryValidationError, AdoptionError) as err:
        connection.send_error(msg["id"], "invalid_adoption", str(err))
        return
    connection.send_result(msg["id"], result)


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_REVERT_ALL,
        vol.Required("confirm"): vol.In([True]),
    }
)
@async_response
async def ws_adoption_revert_all(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Restore all BindHome-owned visibility metadata."""
    try:
        manager = _get_manager(hass)
        adoption = get_adoption_manager(hass)
        await adoption.async_revert_all()
        result = await _status(hass, manager)
    except (RegistryValidationError, AdoptionError) as err:
        connection.send_error(msg["id"], "invalid_adoption", str(err))
        return
    connection.send_result(msg["id"], result)


def async_register_adoption_websocket_commands(hass: HomeAssistant) -> None:
    """Register managed visibility commands."""
    websocket_api.async_register_command(hass, ws_adoption_status)
    websocket_api.async_register_command(hass, ws_adoption_adopt)
    websocket_api.async_register_command(hass, ws_adoption_revert)
    websocket_api.async_register_command(hass, ws_adoption_revert_all)
