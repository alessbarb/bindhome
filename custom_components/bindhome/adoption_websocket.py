"""Administrator WebSocket API for reversible hardware visibility adoption."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import ERR_INVALID_FORMAT, ERR_NOT_FOUND
from homeassistant.components.websocket_api.decorators import async_response, websocket_command
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .adoption import (
    adoption_status,
    async_adopt_binding,
    async_revert_all_adoptions,
    async_revert_asset_adoptions,
    async_revert_binding_adoption,
)
from .authorization import admin_read, admin_write
from .const import DOMAIN
from .manager import BindHomeManager
from .reference_audit import async_audit_direct_references
from .registry import RegistryConflictError, RegistryError, RegistryNotFoundError

WS_ADOPTION_STATUS = f"{DOMAIN}/adoption/status"
WS_ADOPTION_ADOPT = f"{DOMAIN}/adoption/adopt"
WS_ADOPTION_REVERT = f"{DOMAIN}/adoption/revert"
WS_ADOPTION_REVERT_ASSET = f"{DOMAIN}/adoption/revert_asset"
WS_ADOPTION_REVERT_ALL = f"{DOMAIN}/adoption/revert_all"
_REVISION = {vol.Optional("based_on_revision"): vol.All(int, vol.Range(min=0))}


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    entries = [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is config_entries.ConfigEntryState.LOADED
    ]
    if not entries:
        raise RegistryNotFoundError("BindHome is not configured or loaded")
    return cast(BindHomeManager, entries[0].runtime_data)


def _revision(msg: dict[str, Any]) -> int | None:
    return msg.get("based_on_revision")


def _send_error(
    connection: ActiveConnection, msg: dict[str, Any], err: Exception
) -> None:
    if isinstance(err, RegistryNotFoundError):
        code = ERR_NOT_FOUND
    elif isinstance(err, RegistryConflictError):
        code = "conflict"
    else:
        code = ERR_INVALID_FORMAT
    connection.send_error(msg["id"], code, str(err))


@admin_read
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_STATUS,
        vol.Optional("asset_id"): cv.string,
    }
)
@async_response
async def ws_adoption_status(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return managed visibility plus direct-reference debt."""
    try:
        manager = _get_manager(hass)
        result = adoption_status(hass, manager, asset_id=msg.get("asset_id"))
        audit = await async_audit_direct_references(hass, manager.registry)
    except RegistryError as err:
        _send_error(connection, msg, err)
        return

    summary = result["summary"]
    audit_summary = audit.get("summary", {})
    summary["direct_reference_debt"] = audit_summary.get("references", 0)
    summary["direct_reference_manual_review"] = audit_summary.get("manual_review", 0)
    summary["reference_sources_incomplete"] = audit_summary.get("incomplete_sources", 0)
    result["reference_audit"] = audit
    connection.send_result(msg["id"], result)


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_ADOPT,
        vol.Required("binding_id"): cv.string,
        **_REVISION,
    }
)
@async_response
async def ws_adoption_adopt(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Adopt the backing entity of one explicit Binding."""
    try:
        manager = _get_manager(hass)
        adoption = await async_adopt_binding(
            manager,
            msg["binding_id"],
            expected_revision=_revision(msg),
        )
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(
        msg["id"],
        {"adoption": adoption.to_dict(), "revision": manager.revision},
    )


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_REVERT,
        vol.Required("binding_id"): cv.string,
        **_REVISION,
    }
)
@async_response
async def ws_adoption_revert(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Release one Binding's adoption ownership."""
    try:
        manager = _get_manager(hass)
        await async_revert_binding_adoption(
            manager,
            msg["binding_id"],
            expected_revision=_revision(msg),
        )
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"reverted": True, "revision": manager.revision})


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_REVERT_ASSET,
        vol.Required("asset_id"): cv.string,
        **_REVISION,
    }
)
@async_response
async def ws_adoption_revert_asset(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Release every adoption owned by one Asset."""
    try:
        manager = _get_manager(hass)
        count = await async_revert_asset_adoptions(
            manager,
            msg["asset_id"],
            expected_revision=_revision(msg),
        )
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(
        msg["id"], {"reverted": count, "revision": manager.revision}
    )


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_ADOPTION_REVERT_ALL,
        **_REVISION,
    }
)
@async_response
async def ws_adoption_revert_all(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Release all BindHome-owned visibility in one transaction."""
    try:
        manager = _get_manager(hass)
        count = await async_revert_all_adoptions(
            manager,
            expected_revision=_revision(msg),
        )
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(
        msg["id"], {"reverted": count, "revision": manager.revision}
    )


def async_register_adoption_websocket_commands(hass: HomeAssistant) -> None:
    """Register managed-visibility commands."""
    for handler in (
        ws_adoption_status,
        ws_adoption_adopt,
        ws_adoption_revert,
        ws_adoption_revert_asset,
        ws_adoption_revert_all,
    ):
        websocket_api.async_register_command(hass, handler)
