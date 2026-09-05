"""Tests for the BindHome WebSocket API."""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
import voluptuous as vol

from custom_components.bindhome import websocket
from custom_components.bindhome.manager import BindingCycleError
from custom_components.bindhome.models import (
    Asset,
    Binding,
    Relation,
    Representation,
)
from custom_components.bindhome.registry import (
    BindHomeRegistry,
    RegistryConflictError,
    RegistryNotFoundError,
    RegistryValidationError,
)
from custom_components.bindhome.resolver import BindingResolver, StaticEntityProbe


class FakeConnection:
    """Capture WebSocket responses without a live Home Assistant server."""

    def __init__(self) -> None:
        self.user = SimpleNamespace(is_admin=True)
        self.results: list[tuple[str, object]] = []
        self.errors: list[tuple[str, str, str]] = []

    def send_result(self, message_id: str, result: object = None) -> None:
        self.results.append((message_id, result))

    def send_error(self, message_id: str, code: str, message: str) -> None:
        self.errors.append((message_id, code, message))


class FakeManager:
    """Minimal manager double used to exercise handler contracts."""

    def __init__(self) -> None:
        self.revision = 0
        self.registry = Mock()
        self.registry.to_dict.return_value = {
            "schema_version": 1,
            "assets": [],
            "relations": [],
            "bindings": [],
            "representations": [],
        }
        self.async_create_asset = AsyncMock()
        self.async_create_assets = AsyncMock()
        self.async_update_asset = AsyncMock()
        self.async_delete_asset = AsyncMock()
        self.async_add_relation = AsyncMock()
        self.async_remove_relation = AsyncMock()
        self.async_set_binding = AsyncMock()
        self.async_remove_binding = AsyncMock()
        self.async_set_representation = AsyncMock()
        self.async_remove_representation = AsyncMock()


def hass_for(manager: FakeManager) -> SimpleNamespace:
    """Build the Home Assistant surface used by the handlers."""
    entry = SimpleNamespace(
        state=websocket.config_entries.ConfigEntryState.LOADED,
        runtime_data=manager,
    )
    return SimpleNamespace(
        config_entries=SimpleNamespace(async_entries=lambda domain: [entry]),
    )


def call(handler, hass, connection, msg):
    """Call through the async handler decorator layers."""
    return handler.__wrapped__.__wrapped__(hass, connection, msg)


@pytest.mark.asyncio
async def test_registry_get_returns_complete_registry() -> None:
    manager = FakeManager()
    connection = FakeConnection()

    await call(websocket.ws_registry_get, hass_for(manager), connection, {"id": "1"})

    assert connection.results == [
        ("1", {**manager.registry.to_dict.return_value, "revision": 0})
    ]


@pytest.mark.asyncio
async def test_asset_create_returns_serialized_asset() -> None:
    manager = FakeManager()
    asset = Asset.create(name="Light", asset_type="light_point")
    manager.async_create_asset.return_value = asset
    connection = FakeConnection()

    await call(
        websocket.ws_asset_create,
        hass_for(manager),
        connection,
        {"id": "1", "name": "Light", "asset_type": "light_point"},
    )

    manager.async_create_asset.assert_awaited_once()
    assert connection.results == [("1", {"asset": asset.to_dict()})]


@pytest.mark.asyncio
async def test_asset_create_accepts_valid_area_reference() -> None:
    manager = FakeManager()
    asset = Asset.create(name="Light", asset_type="light_point", area_id="area-1")
    manager.async_create_asset.return_value = asset
    connection = FakeConnection()
    with pytest.MonkeyPatch.context() as patch:
        validate = Mock()
        patch.setattr(websocket, "validate_area", validate)
        await call(
            websocket.ws_asset_create,
            hass_for(manager),
            connection,
            {
                "id": "1",
                "name": "Light",
                "asset_type": "light_point",
                "area_id": "area-1",
            },
        )

    validate.assert_called_once()
    assert connection.results == [("1", {"asset": asset.to_dict()})]


@pytest.mark.asyncio
async def test_asset_create_rejects_invalid_area() -> None:
    manager = FakeManager()
    connection = FakeConnection()
    hass = hass_for(manager)
    hass.config = SimpleNamespace()  # make the fake explicit; registry is patched below

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(
            websocket,
            "validate_area",
            Mock(side_effect=websocket.ServiceValidationError("missing")),
        )
        await call(
            websocket.ws_asset_create,
            hass,
            connection,
            {
                "id": "1",
                "name": "Light",
                "asset_type": "light_point",
                "area_id": "area-1",
            },
        )

    assert connection.errors == [("1", "not_found", "missing")]
    manager.async_create_asset.assert_not_awaited()


@pytest.mark.asyncio
async def test_asset_create_bulk_returns_assets_in_request_order() -> None:
    manager = FakeManager()

    first = Asset.create(
        name="Light point 1",
        asset_type="light_point",
        area_id="living_room",
    )
    second = Asset.create(
        name="Socket 1",
        asset_type="socket",
        area_id="living_room",
    )

    manager.async_create_assets.return_value = [first, second]

    connection = FakeConnection()
    hass = hass_for(manager)

    with pytest.MonkeyPatch.context() as patch:
        validate = Mock()
        patch.setattr(websocket, "validate_area", validate)

        await call(
            websocket.ws_asset_create_bulk,
            hass,
            connection,
            {
                "id": "1",
                "assets": [
                    {
                        "name": "Light point 1",
                        "asset_type": "light_point",
                        "area_id": "living_room",
                    },
                    {
                        "name": "Socket 1",
                        "asset_type": "socket",
                        "area_id": "living_room",
                    },
                ],
            },
        )

    specs = manager.async_create_assets.await_args.args[0]

    assert [spec.name for spec in specs] == [
        "Light point 1",
        "Socket 1",
    ]
    assert [spec.area_id for spec in specs] == [
        "living_room",
        "living_room",
    ]

    assert validate.call_count == 2

    assert connection.results == [
        (
            "1",
            {
                "assets": [
                    first.to_dict(),
                    second.to_dict(),
                ]
            },
        )
    ]


@pytest.mark.asyncio
async def test_asset_create_bulk_identifies_invalid_area_row() -> None:
    manager = FakeManager()
    connection = FakeConnection()
    hass = hass_for(manager)

    def validate(_hass, area_id):
        if area_id == "missing":
            raise websocket.ServiceValidationError("Area missing")

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(websocket, "validate_area", validate)

        await call(
            websocket.ws_asset_create_bulk,
            hass,
            connection,
            {
                "id": "1",
                "assets": [
                    {
                        "name": "Socket 1",
                        "asset_type": "socket",
                        "area_id": "living_room",
                    },
                    {
                        "name": "Socket 2",
                        "asset_type": "socket",
                        "area_id": "missing",
                    },
                ],
            },
        )

    assert manager.async_create_assets.await_count == 0
    assert len(connection.errors) == 1

    message_id, code, raw_error = connection.errors[0]
    details = json.loads(raw_error)

    assert message_id == "1"
    assert code == "not_found"
    assert details == {
        "index": 1,
        "field": "area_id",
        "message": "Area missing",
    }


@pytest.mark.asyncio
async def test_asset_create_bulk_returns_structured_conflict_row() -> None:
    manager = FakeManager()
    manager.async_create_assets.side_effect = websocket.BulkAssetCreateError(
        1,
        RegistryConflictError(
            "Asset code SOCK-01 already exists",
            field="code",
        ),
    )

    connection = FakeConnection()
    hass = hass_for(manager)

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(websocket, "validate_area", Mock())

        await call(
            websocket.ws_asset_create_bulk,
            hass,
            connection,
            {
                "id": "1",
                "assets": [
                    {
                        "name": "Socket 1",
                        "asset_type": "socket",
                        "code": "SOCK-01",
                    },
                    {
                        "name": "Socket 2",
                        "asset_type": "socket",
                        "code": "SOCK-01",
                    },
                ],
            },
        )

    assert len(connection.errors) == 1

    message_id, code, raw_error = connection.errors[0]
    details = json.loads(raw_error)

    assert message_id == "1"
    assert code == "conflict"
    assert details == {
        "index": 1,
        "field": "code",
        "message": "Asset code SOCK-01 already exists",
    }


@pytest.mark.asyncio
async def test_asset_update_is_partial_and_preserves_unspecified_fields() -> None:
    manager = FakeManager()
    existing = Asset(
        id="asset-1",
        name="Old name",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=("on_off",),
    )
    updated = Asset(
        id=existing.id,
        name="New name",
        asset_type=existing.asset_type,
        code=existing.code,
        area_id=existing.area_id,
        capabilities=existing.capabilities,
    )

    manager.registry.get_asset.return_value = existing
    manager.async_update_asset.return_value = updated

    connection = FakeConnection()

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(websocket, "validate_area", Mock())

        await call(
            websocket.ws_asset_update,
            hass_for(manager),
            connection,
            {
                "id": "1",
                "asset_id": existing.id,
                "name": "New name",
            },
        )

    manager.async_update_asset.assert_awaited_once_with(
        asset_id=existing.id,
        name="New name",
        asset_type="light_point",
        code="LGT-01",
        area_id=None,
        capabilities=["on_off"],
    )
    assert connection.results == [("1", {"asset": updated.to_dict()})]


@pytest.mark.asyncio
async def test_asset_update_can_clear_optional_references() -> None:
    manager = FakeManager()
    existing = Asset(
        id="asset-1",
        name="Light",
        asset_type="light_point",
        code="LGT-01",
        area_id="living_room",
        capabilities=("on_off",),
    )
    updated = Asset(
        id=existing.id,
        name=existing.name,
        asset_type=existing.asset_type,
        code=None,
        area_id=None,
        capabilities=existing.capabilities,
    )

    manager.registry.get_asset.return_value = existing
    manager.async_update_asset.return_value = updated
    connection = FakeConnection()
    hass = hass_for(manager)

    with pytest.MonkeyPatch.context() as patch:
        validate = Mock()
        patch.setattr(websocket, "validate_area", validate)

        await call(
            websocket.ws_asset_update,
            hass,
            connection,
            {
                "id": "1",
                "asset_id": existing.id,
                "code": None,
                "area_id": None,
            },
        )

    validate.assert_called_once_with(hass, None)

    manager.async_update_asset.assert_awaited_once_with(
        asset_id=existing.id,
        name="Light",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )


@pytest.mark.asyncio
async def test_asset_delete_uses_manager_and_returns_deleted() -> None:
    manager = FakeManager()
    connection = FakeConnection()

    await call(
        websocket.ws_asset_delete,
        hass_for(manager),
        connection,
        {"id": "1", "asset_id": "a"},
    )

    manager.async_delete_asset.assert_awaited_once_with("a")
    assert connection.results == [("1", {"deleted": True})]


@pytest.mark.asyncio
async def test_relation_create_and_delete_return_contracts() -> None:
    manager = FakeManager()
    relation = Relation.create(
        source_asset_id="a", relation_type="feeds", target_asset_id="b"
    )
    manager.async_add_relation.return_value = relation
    connection = FakeConnection()
    hass = hass_for(manager)

    await call(
        websocket.ws_relation_create,
        hass,
        connection,
        {
            "id": "1",
            "source_asset_id": "a",
            "relation_type": "feeds",
            "target_asset_id": "b",
        },
    )
    await call(
        websocket.ws_relation_delete,
        hass,
        connection,
        {"id": "2", "relation_id": relation.id},
    )

    assert connection.results == [
        ("1", {"relation": relation.to_dict()}),
        ("2", {"deleted": True}),
    ]
    manager.async_remove_relation.assert_awaited_once_with(relation.id)


@pytest.mark.asyncio
async def test_duplicate_relation_is_a_structured_conflict() -> None:
    manager = FakeManager()
    manager.async_add_relation.side_effect = RegistryConflictError("duplicate")
    connection = FakeConnection()

    await call(
        websocket.ws_relation_create,
        hass_for(manager),
        connection,
        {
            "id": "1",
            "source_asset_id": "a",
            "relation_type": "feeds",
            "target_asset_id": "b",
        },
    )

    assert connection.errors == [("1", "conflict", "duplicate")]


@pytest.mark.asyncio
async def test_binding_set_replaces_and_delete_serialize_binding() -> None:
    manager = FakeManager()
    binding = Binding.create(asset_id="a", capability="on_off", entity_id="switch.new")
    manager.async_set_binding.return_value = binding
    connection = FakeConnection()
    hass = hass_for(manager)
    await call(
        websocket.ws_binding_set,
        hass,
        connection,
        {
            "id": "1",
            "asset_id": "a",
            "capability": "on_off",
            "entity_id": "switch.new",
        },
    )
    await call(
        websocket.ws_binding_delete,
        hass,
        connection,
        {"id": "2", "binding_id": binding.id},
    )

    assert connection.results == [
        ("1", {"binding": binding.to_dict()}),
        ("2", {"deleted": True}),
    ]
    manager.async_set_binding.assert_awaited_once_with(
        asset_id="a", capability="on_off", entity_id="switch.new", role="primary"
    )


@pytest.mark.asyncio
async def test_representation_set_and_delete_websocket_contracts() -> None:
    manager = FakeManager()
    representation = Representation.create(
        asset_id="asset-1",
        platform="light",
    )
    manager.async_set_representation.return_value = representation

    connection = FakeConnection()
    hass = hass_for(manager)

    await call(
        websocket.ws_representation_set,
        hass,
        connection,
        {
            "id": "1",
            "asset_id": "asset-1",
            "platform": "light",
        },
    )

    await call(
        websocket.ws_representation_delete,
        hass,
        connection,
        {
            "id": "2",
            "asset_id": "asset-1",
        },
    )

    manager.async_set_representation.assert_awaited_once_with(
        asset_id="asset-1",
        platform="light",
    )
    manager.async_remove_representation.assert_awaited_once_with("asset-1")

    assert connection.results == [
        (
            "1",
            {"representation": representation.to_dict()},
        ),
        (
            "2",
            {"deleted": True},
        ),
    ]


@pytest.mark.asyncio
async def test_representation_validation_error_is_structured() -> None:
    manager = FakeManager()
    manager.async_set_representation.side_effect = RegistryValidationError(
        "light representation requires capabilities: on_off",
        field="capabilities",
    )
    connection = FakeConnection()

    await call(
        websocket.ws_representation_set,
        hass_for(manager),
        connection,
        {
            "id": "1",
            "asset_id": "asset-1",
            "platform": "light",
        },
    )

    assert connection.errors == [
        (
            "1",
            "invalid_format",
            "light representation requires capabilities: on_off",
        )
    ]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("handler", "error"),
    [
        (websocket.ws_asset_delete, RegistryNotFoundError("unknown asset")),
        (websocket.ws_binding_set, RegistryValidationError("unknown capability")),
    ],
)
async def test_registry_errors_are_structured(handler, error) -> None:
    manager = FakeManager()
    connection = FakeConnection()
    if handler is websocket.ws_asset_delete:
        manager.async_delete_asset.side_effect = error
        msg = {"id": "1", "asset_id": "missing"}
    else:
        manager.async_set_binding.side_effect = error
        msg = {
            "id": "1",
            "asset_id": "a",
            "capability": "on_off",
            "entity_id": "switch.x",
        }
        await call(handler, hass_for(manager), connection, msg)
        assert connection.errors == [("1", "invalid_format", str(error))]
        return
    await call(handler, hass_for(manager), connection, msg)
    assert connection.errors == [("1", "not_found", str(error))]


@pytest.mark.asyncio
async def test_binding_set_rejects_invalid_entity_reference() -> None:
    manager = FakeManager()
    manager.async_set_binding.side_effect = websocket.ServiceValidationError(
        "missing entity"
    )
    connection = FakeConnection()
    await call(
        websocket.ws_binding_set,
        hass_for(manager),
        connection,
        {
            "id": "1",
            "asset_id": "a",
            "capability": "on_off",
            "entity_id": "switch.missing",
        },
    )

    assert connection.errors == [("1", "not_found", "missing entity")]
    manager.async_set_binding.assert_awaited_once()


@pytest.mark.asyncio
async def test_binding_set_cycle_uses_stable_error_code() -> None:
    manager = FakeManager()
    manager.async_set_binding.side_effect = BindingCycleError(
        [("asset-a", "on_off", "primary"), ("asset-a", "on_off", "primary")]
    )
    connection = FakeConnection()
    await call(
        websocket.ws_binding_set,
        hass_for(manager),
        connection,
        {
            "id": "1",
            "asset_id": "asset-a",
            "capability": "on_off",
            "entity_id": "light.self",
        },
    )
    assert connection.errors[0][1] == "binding_cycle"


def test_command_schemas_reject_malformed_payloads() -> None:
    with pytest.raises(vol.Invalid):
        websocket.ws_asset_create._ws_schema(
            {"id": "1", "type": websocket.WS_ASSET_CREATE}
        )

    with pytest.raises(vol.Invalid):
        websocket.ws_asset_create_bulk._ws_schema(
            {
                "id": "2",
                "type": websocket.WS_ASSET_CREATE_BULK,
                "assets": [],
            }
        )


def test_registers_all_commands_under_bindhome_namespace() -> None:
    hass = SimpleNamespace(data={})
    websocket.async_register_websocket_commands(hass)

    assert set(hass.data["websocket_api"]) == {
        websocket.WS_REGISTRY_GET,
        websocket.WS_REGISTRY_SUBSCRIBE,
        websocket.WS_ASSET_CREATE,
        websocket.WS_ASSET_CREATE_BULK,
        websocket.WS_ASSET_UPDATE,
        websocket.WS_ASSET_DELETE,
        websocket.WS_RELATION_CREATE,
        websocket.WS_RELATION_DELETE,
        websocket.WS_BINDING_SET,
        websocket.WS_BINDING_DELETE,
        websocket.WS_REPRESENTATION_SET,
        websocket.WS_REPRESENTATION_DELETE,
        websocket.WS_PRESET_LIST,
        websocket.WS_ASSET_GET,
        websocket.WS_ASSET_LIST,
        websocket.WS_RELATION_LIST,
        websocket.WS_GRAPH_TRAVERSE,
        websocket.WS_GRAPH_PATH,
        websocket.WS_BINDING_STATUS,
    }


class _QueryManager:
    """Manager double backed by a real registry and entity probe."""

    def __init__(self, registry: BindHomeRegistry, probe: StaticEntityProbe) -> None:
        self.registry = registry
        self.resolver = BindingResolver(registry, probe)


def _query_hass(
    registry: BindHomeRegistry, probe: StaticEntityProbe
) -> SimpleNamespace:
    return hass_for(_QueryManager(registry, probe))


def _sample_registry() -> BindHomeRegistry:
    registry = BindHomeRegistry()
    a = Asset(id="a", name="A", asset_type="node", capabilities=("on_off",))
    b = Asset(id="b", name="B", asset_type="node")
    c = Asset(id="c", name="C", asset_type="node")
    for asset in (a, b, c):
        registry.add_asset(asset)
    registry.add_relation(
        Relation(
            id="r1", source_asset_id="a", relation_type="feeds", target_asset_id="b"
        )
    )
    registry.add_relation(
        Relation(
            id="r2", source_asset_id="b", relation_type="feeds", target_asset_id="c"
        )
    )
    return registry


@pytest.mark.asyncio
async def test_preset_list_returns_read_only_catalogue_without_manager() -> None:
    connection = FakeConnection()

    await call(
        websocket.ws_preset_list,
        SimpleNamespace(),
        connection,
        {"id": "presets"},
    )

    assert len(connection.results) == 1

    message_id, result = connection.results[0]

    assert message_id == "presets"
    assert len(result["presets"]) == 29

    first = result["presets"][0]
    assert first == {
        "preset_id": "light_point",
        "group": "electrical",
        "asset_type": "light_point",
        "default_name": "Light point",
        "suggested_capabilities": ["on_off"],
    }

    assert all(
        "representation" not in preset
        and "binding" not in preset
        and "entity_id" not in preset
        for preset in result["presets"]
    )


@pytest.mark.asyncio
async def test_asset_list_and_get_are_deterministic() -> None:
    registry = _sample_registry()
    hass = _query_hass(registry, StaticEntityProbe())
    connection = FakeConnection()

    await call(websocket.ws_asset_list, hass, connection, {"id": "1"})
    await call(websocket.ws_asset_get, hass, connection, {"id": "2", "asset_id": "b"})

    ids = [a["id"] for a in connection.results[0][1]["assets"]]
    assert ids == ["a", "b", "c"]
    assert connection.results[1][1]["asset"]["id"] == "b"


@pytest.mark.asyncio
async def test_asset_get_unknown_is_not_found() -> None:
    hass = _query_hass(_sample_registry(), StaticEntityProbe())
    connection = FakeConnection()

    await call(websocket.ws_asset_get, hass, connection, {"id": "1", "asset_id": "zz"})

    assert connection.errors[0][1] == "not_found"


@pytest.mark.asyncio
async def test_relation_list_direction_filter() -> None:
    hass = _query_hass(_sample_registry(), StaticEntityProbe())
    connection = FakeConnection()

    await call(
        websocket.ws_relation_list,
        hass,
        connection,
        {"id": "1", "asset_id": "b", "direction": "incoming"},
    )

    relations = connection.results[0][1]["relations"]
    assert [r["source_asset_id"] for r in relations] == ["a"]


@pytest.mark.asyncio
async def test_graph_traverse_and_path() -> None:
    hass = _query_hass(_sample_registry(), StaticEntityProbe())
    connection = FakeConnection()

    await call(
        websocket.ws_graph_traverse,
        hass,
        connection,
        {"id": "1", "asset_id": "a", "direction": "outgoing"},
    )
    await call(
        websocket.ws_graph_path,
        hass,
        connection,
        {"id": "2", "source_asset_id": "a", "target_asset_id": "c"},
    )

    assert connection.results[0][1]["assets"] == [
        {"asset_id": "b", "depth": 1},
        {"asset_id": "c", "depth": 2},
    ]
    assert connection.results[1][1] == {"path": ["a", "b", "c"], "found": True}


@pytest.mark.asyncio
async def test_graph_traverse_rejects_invalid_relation_type() -> None:
    hass = _query_hass(_sample_registry(), StaticEntityProbe())
    connection = FakeConnection()

    await call(
        websocket.ws_graph_traverse,
        hass,
        connection,
        {"id": "1", "asset_id": "a", "relation_types": ["Not Valid"]},
    )

    assert connection.errors[0][1] == "invalid_format"


@pytest.mark.asyncio
async def test_binding_status_read_model_is_json_serializable() -> None:
    registry = _sample_registry()
    probe = StaticEntityProbe(states={"switch.a": "on"})
    hass = _query_hass(registry, probe)
    connection = FakeConnection()

    await call(websocket.ws_binding_status, hass, connection, {"id": "1"})

    result = connection.results[0][1]
    json.dumps(result)
    assert result["summary"]["total"] == 1
    assert result["records"][0]["status"] == "binding_not_found"
