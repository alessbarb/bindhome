"""Tests for live Registry WebSocket notifications and revision preconditions."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.bindhome import websocket
from custom_components.bindhome.manager import RegistryRevisionConflictError
from custom_components.bindhome.models import Asset


class FakeConnection:
    """Capture subscription results, events and errors."""

    def __init__(self) -> None:
        self.user = SimpleNamespace(is_admin=True)
        self.results: list[tuple[str, object]] = []
        self.errors: list[tuple[str, str, str]] = []
        self.events: list[tuple[str, object]] = []
        self.subscriptions: dict[str, object] = {}

    def send_result(self, message_id: str, result: object = None) -> None:
        self.results.append((message_id, result))

    def send_error(self, message_id: str, code: str, message: str) -> None:
        self.errors.append((message_id, code, message))

    def send_event(self, message_id: str, event: object) -> None:
        self.events.append((message_id, event))


class FakeManager:
    """Minimal loaded manager surface for the WebSocket contract."""

    def __init__(self) -> None:
        self.revision = 7
        self.registry = Mock()
        self.registry.to_dict.return_value = {
            "schema_version": 2,
            "assets": [],
            "relations": [],
            "bindings": [],
            "representations": [],
        }
        self.async_update_asset = AsyncMock()


def hass_for(manager: FakeManager) -> SimpleNamespace:
    entry = SimpleNamespace(
        state=websocket.config_entries.ConfigEntryState.LOADED,
        runtime_data=manager,
    )
    return SimpleNamespace(
        config_entries=SimpleNamespace(async_entries=lambda domain: [entry]),
    )


def call_async(handler, hass, connection, msg):
    """Call through async response and admin/command wrappers."""
    return handler.__wrapped__.__wrapped__(hass, connection, msg)


def call_sync(handler, hass, connection, msg):
    """Call through admin/command wrappers."""
    return handler.__wrapped__.__wrapped__(hass, connection, msg)


@pytest.mark.asyncio
async def test_registry_get_exposes_current_revision() -> None:
    manager = FakeManager()
    connection = FakeConnection()

    await call_async(
        websocket.ws_registry_get,
        hass_for(manager),
        connection,
        {"id": "1"},
    )

    assert connection.results[0][1]["revision"] == 7
    assert "revision" not in manager.registry.to_dict.return_value


def test_subscription_emits_one_revision_event_and_stores_cleanup() -> None:
    manager = FakeManager()
    connection = FakeConnection()
    callback_holder: dict[str, object] = {}
    unsubscribe = Mock()

    def connect(hass, signal, callback):
        callback_holder["callback"] = callback
        return unsubscribe

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(websocket, "async_dispatcher_connect", connect)
        call_sync(
            websocket.ws_registry_subscribe,
            hass_for(manager),
            connection,
            {"id": "sub"},
        )

    assert connection.results == [("sub", {"revision": 7})]
    assert connection.subscriptions["sub"] is unsubscribe

    manager.revision = 8
    callback_holder["callback"]()
    assert connection.events == [("sub", {"revision": 8})]

    connection.subscriptions.pop("sub")()
    unsubscribe.assert_called_once_with()


@pytest.mark.asyncio
async def test_mutation_forwards_client_revision_and_returns_revision() -> None:
    manager = FakeManager()
    asset = Asset.create(name="Socket", asset_type="socket")
    manager.registry.get_asset.return_value = asset
    manager.async_update_asset.return_value = asset
    connection = FakeConnection()

    await call_async(
        websocket.ws_asset_update,
        hass_for(manager),
        connection,
        {
            "id": "2",
            "asset_id": asset.id,
            "name": "Socket",
            "based_on_revision": 7,
        },
    )

    assert manager.async_update_asset.await_args.kwargs["expected_revision"] == 7
    assert connection.results == [("2", {"asset": asset.to_dict(), "revision": 7})]


@pytest.mark.asyncio
async def test_stale_mutation_is_a_clear_conflict() -> None:
    manager = FakeManager()
    asset = Asset.create(name="Socket", asset_type="socket")
    manager.registry.get_asset.return_value = asset
    manager.async_update_asset.side_effect = RegistryRevisionConflictError(6, 7)
    connection = FakeConnection()

    await call_async(
        websocket.ws_asset_update,
        hass_for(manager),
        connection,
        {
            "id": "3",
            "asset_id": asset.id,
            "name": "Stale",
            "based_on_revision": 6,
        },
    )

    assert connection.errors == [
        (
            "3",
            "conflict",
            "Registry revision conflict: client has 6, current is 7",
        )
    ]
    assert connection.results == []
