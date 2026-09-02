"""BindHome CRUD WebSocket API."""

from __future__ import annotations

import json
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
    require_admin,
    websocket_command,
)
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from . import query
from .const import DOMAIN
from .manager import (
    AssetCreateSpec,
    BindHomeManager,
    BulkAssetCreateError,
)
from .models import ModelValidationError
from .presets import list_creation_presets
from .query import Direction
from .registry import (
    RegistryConflictError,
    RegistryError,
    RegistryNotFoundError,
    RegistryValidationError,
)
from .validation import validate_area, validate_entity

WS_REGISTRY_GET = f"{DOMAIN}/registry/get"
WS_ASSET_CREATE = f"{DOMAIN}/assets/create"
WS_ASSET_CREATE_BULK = f"{DOMAIN}/assets/create_bulk"
WS_ASSET_UPDATE = f"{DOMAIN}/assets/update"
WS_ASSET_DELETE = f"{DOMAIN}/assets/delete"
WS_RELATION_CREATE = f"{DOMAIN}/relations/create"
WS_RELATION_DELETE = f"{DOMAIN}/relations/delete"
WS_BINDING_SET = f"{DOMAIN}/bindings/set"
WS_BINDING_DELETE = f"{DOMAIN}/bindings/delete"
WS_REPRESENTATION_SET = f"{DOMAIN}/representations/set"
WS_REPRESENTATION_DELETE = f"{DOMAIN}/representations/delete"
WS_PRESET_LIST = f"{DOMAIN}/presets/list"
WS_ASSET_GET = f"{DOMAIN}/assets/get"
WS_ASSET_LIST = f"{DOMAIN}/assets/list"
WS_RELATION_LIST = f"{DOMAIN}/relations/list"
WS_GRAPH_TRAVERSE = f"{DOMAIN}/graph/traverse"
WS_GRAPH_PATH = f"{DOMAIN}/graph/path"
WS_BINDING_STATUS = f"{DOMAIN}/bindings/status"

_DIRECTIONS = [direction.value for direction in Direction]

_ASSET_CREATE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("asset_type"): cv.string,
        vol.Optional("code"): cv.string,
        vol.Optional("area_id"): cv.string,
        vol.Optional("capabilities", default=[]): [cv.string],
    }
)


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
    connection: ActiveConnection, msg: dict[str, Any], err: Exception
) -> None:
    """Translate domain and Home Assistant validation errors to stable WS errors."""
    if isinstance(err, RegistryNotFoundError):
        code = ERR_NOT_FOUND
    elif isinstance(err, RegistryConflictError):
        code = "conflict"
    elif isinstance(err, ServiceValidationError):
        code = ERR_NOT_FOUND
    elif isinstance(err, (ModelValidationError, RegistryValidationError)):
        code = ERR_INVALID_FORMAT
    else:
        code = ERR_INVALID_FORMAT
    connection.send_error(msg["id"], code, str(err))


def _send_bulk_asset_error(
    connection: ActiveConnection,
    msg: dict[str, Any],
    err: BulkAssetCreateError,
) -> None:
    """Return an indexed, machine-readable error for one batch item."""
    if isinstance(err.cause, RegistryConflictError):
        code = "conflict"
    elif isinstance(err.cause, ServiceValidationError):
        code = ERR_NOT_FOUND
    else:
        code = ERR_INVALID_FORMAT

    connection.send_error(
        msg["id"],
        code,
        json.dumps(err.to_dict(), separators=(",", ":")),
    )


@require_admin
@websocket_command({vol.Required("type"): WS_REGISTRY_GET})
@async_response
async def ws_registry_get(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the complete serialized registry."""
    try:
        result = _get_manager(hass).registry.to_dict()
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], result)


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_ASSET_CREATE,
        vol.Required("name"): cv.string,
        vol.Required("asset_type"): cv.string,
        vol.Optional("code"): cv.string,
        vol.Optional("area_id"): cv.string,
        vol.Optional("capabilities", default=[]): [cv.string],
    }
)
@async_response
async def ws_asset_create(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
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


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_ASSET_CREATE_BULK,
        vol.Required("assets"): vol.All(
            [_ASSET_CREATE_ITEM_SCHEMA],
            vol.Length(min=1),
        ),
    }
)
@async_response
async def ws_asset_create_bulk(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create multiple Assets as one atomic mutation."""
    specs: list[AssetCreateSpec] = []

    for index, raw in enumerate(msg["assets"]):
        try:
            validate_area(hass, raw.get("area_id"))
        except ServiceValidationError as err:
            _send_bulk_asset_error(
                connection,
                msg,
                BulkAssetCreateError(index, err, field="area_id"),
            )
            return

        specs.append(
            AssetCreateSpec(
                name=raw["name"],
                asset_type=raw["asset_type"],
                code=raw.get("code"),
                area_id=raw.get("area_id"),
                capabilities=tuple(raw.get("capabilities", [])),
            )
        )

    try:
        assets = await _get_manager(hass).async_create_assets(specs)
    except BulkAssetCreateError as err:
        _send_bulk_asset_error(connection, msg, err)
        return

    connection.send_result(
        msg["id"],
        {"assets": [asset.to_dict() for asset in assets]},
    )


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_ASSET_UPDATE,
        vol.Required("asset_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("asset_type"): cv.string,
        vol.Optional("code"): vol.Any(None, cv.string),
        vol.Optional("area_id"): vol.Any(None, cv.string),
        vol.Optional("capabilities"): [cv.string],
    }
)
@async_response
async def ws_asset_update(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Partially update an asset while preserving its stable identity."""
    try:
        manager = _get_manager(hass)
        existing = manager.registry.get_asset(msg["asset_id"])

        area_id = msg.get("area_id", existing.area_id)
        validate_area(hass, area_id)

        asset = await manager.async_update_asset(
            asset_id=existing.id,
            name=msg.get("name", existing.name),
            asset_type=msg.get("asset_type", existing.asset_type),
            code=msg.get("code", existing.code),
            area_id=area_id,
            capabilities=list(msg.get("capabilities", existing.capabilities)),
        )
    except (
        ModelValidationError,
        RegistryError,
        ServiceValidationError,
    ) as err:
        _send_error(connection, msg, err)
        return

    connection.send_result(msg["id"], {"asset": asset.to_dict()})


@require_admin
@websocket_command(
    {vol.Required("type"): WS_ASSET_DELETE, vol.Required("asset_id"): cv.string}
)
@async_response
async def ws_asset_delete(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete an asset."""
    try:
        await _get_manager(hass).async_delete_asset(msg["asset_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"deleted": True})


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_RELATION_CREATE,
        vol.Required("source_asset_id"): cv.string,
        vol.Required("relation_type"): cv.string,
        vol.Required("target_asset_id"): cv.string,
    }
)
@async_response
async def ws_relation_create(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
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


@require_admin
@websocket_command(
    {vol.Required("type"): WS_RELATION_DELETE, vol.Required("relation_id"): cv.string}
)
@async_response
async def ws_relation_delete(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete a relation."""
    try:
        await _get_manager(hass).async_remove_relation(msg["relation_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"deleted": True})


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_BINDING_SET,
        vol.Required("asset_id"): cv.string,
        vol.Required("capability"): cv.string,
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("role", default="primary"): cv.string,
    }
)
@async_response
async def ws_binding_set(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
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


@require_admin
@websocket_command(
    {vol.Required("type"): WS_BINDING_DELETE, vol.Required("binding_id"): cv.string}
)
@async_response
async def ws_binding_delete(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete a binding."""
    try:
        await _get_manager(hass).async_remove_binding(msg["binding_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"deleted": True})


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_REPRESENTATION_SET,
        vol.Required("asset_id"): cv.string,
        vol.Required("platform"): cv.string,
    }
)
@async_response
async def ws_representation_set(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create an Asset's logical Home Assistant representation."""
    try:
        representation = await _get_manager(hass).async_set_representation(
            asset_id=msg["asset_id"],
            platform=msg["platform"],
        )
    except (ModelValidationError, RegistryError) as err:
        _send_error(connection, msg, err)
        return

    connection.send_result(
        msg["id"],
        {"representation": representation.to_dict()},
    )


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_REPRESENTATION_DELETE,
        vol.Required("asset_id"): cv.string,
    }
)
@async_response
async def ws_representation_delete(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove an Asset's logical Home Assistant representation."""
    try:
        await _get_manager(hass).async_remove_representation(msg["asset_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return

    connection.send_result(msg["id"], {"deleted": True})


@require_admin
@websocket_command({vol.Required("type"): WS_PRESET_LIST})
@async_response
async def ws_preset_list(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return built-in creation presets in deterministic UX order."""
    del hass

    connection.send_result(
        msg["id"],
        {"presets": [preset.to_dict() for preset in list_creation_presets()]},
    )


@require_admin
@websocket_command(
    {vol.Required("type"): WS_ASSET_GET, vol.Required("asset_id"): cv.string}
)
@async_response
async def ws_asset_get(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return a single asset."""
    try:
        asset = query.get_asset(_get_manager(hass).registry, msg["asset_id"])
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"asset": asset.to_dict()})


@require_admin
@websocket_command({vol.Required("type"): WS_ASSET_LIST})
@async_response
async def ws_asset_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return every asset, ordered deterministically."""
    try:
        assets = query.list_assets(_get_manager(hass).registry)
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"assets": [asset.to_dict() for asset in assets]})


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_RELATION_LIST,
        vol.Required("asset_id"): cv.string,
        vol.Optional("direction", default=Direction.ANY.value): vol.In(_DIRECTIONS),
        vol.Optional("relation_types", default=[]): [cv.string],
    }
)
@async_response
async def ws_relation_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return relations involving an asset, filtered by direction and type."""
    registry = _get_manager(hass).registry
    asset_id = msg["asset_id"]
    relation_types = list(msg.get("relation_types", []))
    reader = {
        Direction.OUTGOING.value: query.outgoing_relations,
        Direction.INCOMING.value: query.incoming_relations,
        Direction.ANY.value: query.relations_for_asset,
    }[msg.get("direction", Direction.ANY.value)]
    try:
        relations = reader(registry, asset_id, relation_types or None)
    except (ModelValidationError, RegistryError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(
        msg["id"],
        {"relations": [relation.to_dict() for relation in relations]},
    )


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_GRAPH_TRAVERSE,
        vol.Required("asset_id"): cv.string,
        vol.Optional("direction", default=Direction.OUTGOING.value): vol.In(
            _DIRECTIONS
        ),
        vol.Optional("relation_types", default=[]): [cv.string],
        vol.Optional("max_depth"): vol.All(int, vol.Range(min=0)),
    }
)
@async_response
async def ws_graph_traverse(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Recursive cycle-safe directional traversal from an asset."""
    registry = _get_manager(hass).registry
    relation_types = list(msg.get("relation_types", []))
    try:
        hits = query.traverse(
            registry,
            msg["asset_id"],
            msg.get("direction", Direction.OUTGOING.value),
            relation_types or None,
            msg.get("max_depth"),
        )
    except (ModelValidationError, RegistryError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(
        msg["id"],
        {
            "direction": msg.get("direction", Direction.OUTGOING.value),
            "assets": [hit.to_dict() for hit in hits],
        },
    )


@require_admin
@websocket_command(
    {
        vol.Required("type"): WS_GRAPH_PATH,
        vol.Required("source_asset_id"): cv.string,
        vol.Required("target_asset_id"): cv.string,
        vol.Optional("direction", default=Direction.OUTGOING.value): vol.In(
            _DIRECTIONS
        ),
        vol.Optional("relation_types", default=[]): [cv.string],
    }
)
@async_response
async def ws_graph_path(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the shortest deterministic asset path between two assets."""
    registry = _get_manager(hass).registry
    relation_types = list(msg.get("relation_types", []))
    try:
        path = query.find_path(
            registry,
            msg["source_asset_id"],
            msg["target_asset_id"],
            msg.get("direction", Direction.OUTGOING.value),
            relation_types or None,
        )
    except (ModelValidationError, RegistryError) as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], {"path": path, "found": path is not None})


@require_admin
@websocket_command({vol.Required("type"): WS_BINDING_STATUS})
@async_response
async def ws_binding_status(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the binding/resolver status read model for the whole registry."""
    manager = _get_manager(hass)
    try:
        result = query.resolver_status(manager.registry, manager.resolver.probe)
    except RegistryError as err:
        _send_error(connection, msg, err)
        return
    connection.send_result(msg["id"], result)


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register BindHome WebSocket commands once during integration setup."""
    for handler in (
        ws_registry_get,
        ws_asset_create,
        ws_asset_create_bulk,
        ws_asset_update,
        ws_asset_delete,
        ws_relation_create,
        ws_relation_delete,
        ws_binding_set,
        ws_binding_delete,
        ws_representation_set,
        ws_representation_delete,
        ws_preset_list,
        ws_asset_get,
        ws_asset_list,
        ws_relation_list,
        ws_graph_traverse,
        ws_graph_path,
        ws_binding_status,
    ):
        websocket_api.async_register_command(hass, handler)
