"""Tests for BindHome Registry backup and restore."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from custom_components.bindhome.backup import (
    BACKUP_FORMAT,
    BACKUP_FORMAT_VERSION,
    BackupValidationError,
    async_restore_registry_backup,
    export_registry_backup,
    parse_registry_backup,
)
from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.models import Asset
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.store import BindHomeStoreError


def _registry(name: str, code: str) -> BindHomeRegistry:
    registry = BindHomeRegistry()
    registry.add_asset(
        Asset.create(
            name=name,
            asset_type="socket",
            code=code,
            capabilities=["on_off"],
        )
    )
    return registry


def test_export_uses_stable_versioned_envelope() -> None:
    registry = _registry("Workshop socket", "SOCK-01")

    first = export_registry_backup(registry)
    second = export_registry_backup(registry)

    assert first == second
    assert first == {
        "format": BACKUP_FORMAT,
        "format_version": BACKUP_FORMAT_VERSION,
        "registry": registry.to_dict(),
    }


def test_backup_round_trip_restores_registry_exactly() -> None:
    registry = _registry("Workshop socket", "SOCK-01")

    restored = parse_registry_backup(export_registry_backup(registry))

    assert restored is not registry
    assert restored.to_dict() == registry.to_dict()


@pytest.mark.parametrize(
    ("payload", "message"),
    [
        ("not-a-dict", "backup must be a dictionary"),
        ({"format": "other", "format_version": 1, "registry": {}}, "backup format"),
        (
            {"format": BACKUP_FORMAT, "format_version": 999, "registry": {}},
            "format version",
        ),
        (
            {"format": BACKUP_FORMAT, "format_version": BACKUP_FORMAT_VERSION},
            "missing registry",
        ),
        (
            {
                "format": BACKUP_FORMAT,
                "format_version": BACKUP_FORMAT_VERSION,
                "registry": "invalid",
            },
            "registry must be a dictionary",
        ),
    ],
)
def test_backup_envelope_validation(payload: object, message: str) -> None:
    with pytest.raises(BackupValidationError, match=message):
        parse_registry_backup(payload)


def test_invalid_registry_payload_is_rejected() -> None:
    payload = {
        "format": BACKUP_FORMAT,
        "format_version": BACKUP_FORMAT_VERSION,
        "registry": {
            "schema_version": 999,
            "assets": [],
            "relations": [],
            "bindings": [],
            "representations": [],
        },
    }

    with pytest.raises(
        BackupValidationError,
        match="Unsupported registry schema version: 999",
    ):
        parse_registry_backup(payload)


async def test_restore_persists_before_adoption_and_preserves_identity(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    original = _registry("Old socket", "OLD-01")
    manager._adopt_staged_registry(original)
    original_registry = manager.registry
    replacement = _registry("Restored socket", "RESTORE-01")
    backup = export_registry_backup(replacement)

    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    async def save(staged: BindHomeRegistry) -> None:
        assert manager.registry is original_registry
        assert manager.registry.to_dict() == original.to_dict()
        assert notifications == []
        assert staged.to_dict() == replacement.to_dict()

    manager._store.async_save = AsyncMock(side_effect=save)

    try:
        restored = await async_restore_registry_backup(manager, backup)
    finally:
        unsubscribe()

    manager._store.async_save.assert_awaited_once()
    assert restored is original_registry
    assert manager.registry is original_registry
    assert manager.registry.to_dict() == replacement.to_dict()
    assert notifications == [None]


async def test_restore_storage_failure_leaves_live_registry_unchanged(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    original = _registry("Old socket", "OLD-01")
    manager._adopt_staged_registry(original)
    original_registry = manager.registry
    baseline = manager.registry.to_dict()
    backup = export_registry_backup(_registry("Replacement", "NEW-01"))
    manager._store.async_save = AsyncMock(
        side_effect=BindHomeStoreError("disk full")
    )

    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    try:
        with pytest.raises(BindHomeStoreError, match="disk full"):
            await async_restore_registry_backup(manager, backup)
    finally:
        unsubscribe()

    manager._store.async_save.assert_awaited_once()
    assert manager.registry is original_registry
    assert manager.registry.to_dict() == baseline
    assert notifications == []


async def test_invalid_restore_never_attempts_persistence(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    manager._store.async_save = AsyncMock()
    baseline = manager.registry.to_dict()

    with pytest.raises(BackupValidationError):
        await async_restore_registry_backup(manager, {"format": "wrong"})

    manager._store.async_save.assert_not_awaited()
    assert manager.registry.to_dict() == baseline
