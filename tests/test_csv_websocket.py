"""Tests for BindHome CSV inventory WebSocket registration and responses."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from homeassistant import config_entries

from custom_components.bindhome import csv_websocket
from custom_components.bindhome.csv_inventory import (
    CsvBatchValidationError,
    CsvRowError,
)
from custom_components.bindhome.registry import BindHomeRegistry


class FakeConnection:
    """Capture WebSocket responses without a live WebSocket client."""

    def __init__(self) -> None:
        self.user = SimpleNamespace(is_admin=True)
        self.results: list[tuple[str, object]] = []
        self.errors: list[tuple[str, str, str]] = []

    def send_result(self, message_id: str, result: object = None) -> None:
        self.results.append((message_id, result))

    def send_error(self, message_id: str, code: str, message: str) -> None:
        self.errors.append((message_id, code, message))


class FakeManager:
    """Minimal loaded manager surface for CSV handlers."""

    def __init__(self) -> None:
        self.registry = BindHomeRegistry()
        self.revision = 7


def _hass(manager: FakeManager) -> SimpleNamespace:
    entry = SimpleNamespace(
        state=config_entries.ConfigEntryState.LOADED,
        runtime_data=manager,
    )
    return SimpleNamespace(
        config_entries=SimpleNamespace(async_entries=lambda domain: [entry]),
        data={},
    )


def _call_sync(handler, hass, connection, msg):
    """Call through require_admin for a synchronous WebSocket handler."""
    return handler.__wrapped__(hass, connection, msg)


def _call_async(handler, hass, connection, msg):
    """Call through require_admin and async_response for an async handler."""
    return handler.__wrapped__.__wrapped__(hass, connection, msg)


def test_registers_csv_commands_under_bindhome_namespace() -> None:
    hass = SimpleNamespace(data={})

    csv_websocket.async_register_csv_websocket_commands(hass)

    assert set(hass.data["websocket_api"]) == {
        csv_websocket.WS_CSV_EXPORT,
        csv_websocket.WS_CSV_VALIDATE,
        csv_websocket.WS_CSV_IMPORT,
    }


def test_validate_returns_structured_row_errors(monkeypatch) -> None:
    manager = FakeManager()
    error = CsvBatchValidationError([CsvRowError(4, "asset_type", "bad type")])
    validator = Mock(side_effect=error)
    monkeypatch.setattr(csv_websocket, "validate_inventory_csv", validator)
    connection = FakeConnection()

    _call_sync(
        csv_websocket.ws_csv_validate,
        _hass(manager),
        connection,
        {"id": "1", "csv": "bad"},
    )

    assert connection.errors == []
    assert connection.results == [
        (
            "1",
            {
                "valid": False,
                "format_version": "1",
                "errors": [{"row": 4, "field": "asset_type", "message": "bad type"}],
            },
        )
    ]


@pytest.mark.asyncio
async def test_import_passes_revision_and_returns_committed_revision(
    monkeypatch,
) -> None:
    manager = FakeManager()
    manager.revision = 8
    preview = SimpleNamespace(to_dict=lambda: {"created": 1, "updated": 0, "total": 1})
    importer = AsyncMock(return_value=preview)
    monkeypatch.setattr(csv_websocket, "async_import_inventory_csv", importer)
    connection = FakeConnection()

    await _call_async(
        csv_websocket.ws_csv_import,
        _hass(manager),
        connection,
        {"id": "2", "csv": "ok", "based_on_revision": 7},
    )

    importer.assert_awaited_once_with(manager, "ok", expected_revision=7)
    assert connection.errors == []
    assert connection.results[0][1]["imported"] is True
    assert connection.results[0][1]["revision"] == 8
