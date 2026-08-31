"""BindHome CRUD WebSocket API."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .manager import BindHomeManager
from .models import ModelValidationError
from .registry import (
    RegistryConflictError,
    RegistryError,
    RegistryNotFoundError,
    RegistryValidationError,
)
from .validation import validate_area, validate_entity

WS_REGISTRY_GET = f"{DOMAIN}/registry/get"
WS_ASSET_CREATE = f"{DOMAIN}/assets/create"
WS_ASSET_DELETE = f"{DOMAIN}/assets/delete"
WS_RELATION_CREATE = f"{DOMAIN}/relations/create"
WS_RELATION_DELETE = f"{DOMAIN}/relations/delete"
WS_BINDING_SET = f"{DOMAIN}/bindings/set"
WS_BINDING_DELETE = f"{DOMAIN}/bindings/delete"


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


def _send_error(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], err: Exception
) -> None:
    """Translate domain and Home Assistant validation errors to stable WS errors."""
    if isinstance(err, RegistryNotFoundError):
        code = websocket_api.ERR_NOT_FOUND
    elif isinstance(err, RegistryConflictError):
        code = "conflict"
    elif isinstance(err, ServiceValidationError):
        code = websocket_api.ERR_NOT_FOUND
    elif isinstance(err, (ModelValidationError, RegistryValidationError)):
        code = websocket_api.ERR_INVALID_FORMAT
    else:
        code = websocket_api.ERR_INVALID_FORMAT
    connection.send_error(msg["id"], code, str(err))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): WS_REGISTRY_GET})
@websocket_api.async_response
async def ws_registry_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the complete serialized registry."""
    try:
        result = _get_manager(hass).registry.to_dict()
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_ASSET_CREATE,
        vol.Required("name"): cv.string,
        vol.Required("asset_type"): cv.string,
        vol.Optional("code"): cv.string,
        vol.Optional("area_id"): cv.string,
        vol.Optional("capabilities", default=[]): [cv.string],
    }
)
@websocket_api.async_response
async def ws_asset_create(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Create an asset."""
    try:
        validate_area(hass, msg.get("area_id"))
        asset = await _get_manager(hass).async_create_asset(
            name=msg["name"],
            asset_type=msg["asset_type"],
            code=msg.get("code"),
            area_id=msg.get("area_id"),
            capabilities=list(msg.get("capabilities", [])),
        )
    except (ModelValidationError, RegistryError, ServiceValidationError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"asset": asset.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): WS_ASSET_DELETE, vol.Required("asset_id"): cv.string}
)
@websocket_api.async_response
async def ws_asset_delete(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete an asset."""
    try:
        await _get_manager(hass).async_delete_asset(msg["asset_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"deleted": True})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_RELATION_CREATE,
        vol.Required("source_asset_id"): cv.string,
        vol.Required("relation_type"): cv.string,
        vol.Required("target_asset_id"): cv.string,
    }
)
@websocket_api.async_response
async def ws_relation_create(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Create a relation."""
    try:
        relation = await _get_manager(hass).async_add_relation(
            source_asset_id=msg["source_asset_id"],
            relation_type=msg["relation_type"],
            target_asset_id=msg["target_asset_id"],
        )
    except (ModelValidationError, RegistryError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"relation": relation.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): WS_RELATION_DELETE, vol.Required("relation_id"): cv.string}
)
@websocket_api.async_response
async def ws_relation_delete(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete a relation."""
    try:
        await _get_manager(hass).async_remove_relation(msg["relation_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"deleted": True})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_BINDING_SET,
        vol.Required("asset_id"): cv.string,
        vol.Required("capability"): cv.string,
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("role", default="primary"): cv.string,
    }
)
@websocket_api.async_response
async def ws_binding_set(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Create or replace a binding."""
    try:
        validate_entity(hass, msg["entity_id"])
        binding = await _get_manager(hass).async_set_binding(
            asset_id=msg["asset_id"],
            capability=msg["capability"],
            entity_id=msg["entity_id"],
            role=msg.get("role", "primary"),
        )
    except (ModelValidationError, RegistryError, ServiceValidationError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"binding": binding.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): WS_BINDING_DELETE, vol.Required("binding_id"): cv.string}
)
@websocket_api.async_response
async def ws_binding_delete(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete a binding."""
    try:
        await _get_manager(hass).async_remove_binding(msg["binding_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"deleted": True})


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register BindHome WebSocket commands once during integration setup."""
    for handler in (
        ws_registry_get,
        ws_asset_create,
        ws_asset_delete,
        ws_relation_create,
        ws_relation_delete,
        ws_binding_set,
        ws_binding_delete,
    ):
        websocket_api.async_register_command(hass, handler)
