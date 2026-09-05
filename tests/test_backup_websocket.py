"""Tests for the BindHome backup WebSocket API."""

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from homeassistant.components.websocket_api.const import ERR_INVALID_FORMAT

from custom_components.bindhome import backup_websocket
from custom_components.bindhome.backup import (
    BackupValidationError,
    export_registry_backup,
)
from custom_components.bindhome.models import Asset
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.store import BindHomeStoreError


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
    """Minimal manager double used by backup handlers."""

    def __init__(self) -> None:
        self.registry = BindHomeRegistry()
        self.registry.add_asset(
            Asset.create(name="Socket", asset_type="socket", code="SOCK-01")
        )


def hass_for(manager: FakeManager) -> SimpleNamespace:
    """Build the Home Assistant surface used by backup handlers."""
    entry = SimpleNamespace(
        state=backup_websocket.config_entries.ConfigEntryState.LOADED,
        runtime_data=manager,
    )
    return SimpleNamespace(
        config_entries=SimpleNamespace(async_entries=lambda domain: [entry]),
    )


def call(handler, hass, connection, msg):
    """Call through the async handler decorator layers."""
    return handler.__wrapped__.__wrapped__(hass, connection, msg)


@pytest.mark.asyncio
async def test_backup_export_returns_versioned_envelope() -> None:
    manager = FakeManager()
    connection = FakeConnection()

    await call(
        backup_websocket.ws_backup_export,
        hass_for(manager),
        connection,
        {"id": "1"},
    )

    assert connection.errors == []
    assert connection.results == [
        ("1", {"backup": export_registry_backup(manager.registry)})
    ]


@pytest.mark.asyncio
async def test_backup_restore_returns_committed_registry(monkeypatch) -> None:
    manager = FakeManager()
    restored = BindHomeRegistry()
    restored.add_asset(
        Asset.create(
            name="Restored",
            asset_type="socket",
            code="NEW-01",
        )
    )
    restore = AsyncMock(return_value=restored)
    monkeypatch.setattr(backup_websocket, "async_restore_registry_backup", restore)
    connection = FakeConnection()
    backup = export_registry_backup(restored)

    await call(
        backup_websocket.ws_backup_restore,
        hass_for(manager),
        connection,
        {"id": "2", "backup": backup},
    )

    restore.assert_awaited_once_with(manager, backup)
    assert connection.errors == []
    assert connection.results == [
        ("2", {"restored": True, "registry": restored.to_dict()})
    ]


@pytest.mark.asyncio
async def test_backup_restore_translates_validation_error(monkeypatch) -> None:
    manager = FakeManager()
    restore = AsyncMock(side_effect=BackupValidationError("bad backup"))
    monkeypatch.setattr(backup_websocket, "async_restore_registry_backup", restore)
    connection = FakeConnection()

    await call(
        backup_websocket.ws_backup_restore,
        hass_for(manager),
        connection,
        {"id": "3", "backup": {}},
    )

    assert connection.results == []
    assert connection.errors == [("3", ERR_INVALID_FORMAT, "bad backup")]


@pytest.mark.asyncio
async def test_backup_restore_translates_storage_error(monkeypatch) -> None:
    manager = FakeManager()
    restore = AsyncMock(side_effect=BindHomeStoreError("disk full"))
    monkeypatch.setattr(backup_websocket, "async_restore_registry_backup", restore)
    connection = FakeConnection()

    await call(
        backup_websocket.ws_backup_restore,
        hass_for(manager),
        connection,
        {"id": "4", "backup": {}},
    )

    assert connection.results == []
    assert connection.errors == [("4", "storage_error", "disk full")]


def test_registers_backup_commands_under_bindhome_namespace() -> None:
    hass = SimpleNamespace(data={})

    backup_websocket.async_register_backup_websocket_commands(hass)

    assert set(hass.data["websocket_api"]) == {
        backup_websocket.WS_BACKUP_EXPORT,
        backup_websocket.WS_BACKUP_RESTORE,
        backup_websocket.WS_BACKUP_RECOVERY_STATUS,
    }
