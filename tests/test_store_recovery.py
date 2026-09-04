"""Tests for fail-closed BindHome registry loading and recovery."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError, HomeAssistantError

from custom_components.bindhome import async_setup_entry
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.store import (
    BindHomeStore,
    BindHomeStoreCorruptionError,
    BindHomeStoreError,
    BindHomeStoreLoadError,
)


async def test_missing_storage_loads_empty_registry(hass: HomeAssistant) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=False)
    store._store.async_load = AsyncMock(return_value=None)

    registry = await store.async_load()

    assert registry.to_dict() == BindHomeRegistry().to_dict()
    store._async_path_exists.assert_awaited_once()
    store._store.async_load.assert_awaited_once()


async def test_corrupt_storage_does_not_become_empty_registry(
    hass: HomeAssistant,
) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(side_effect=[True, False])
    store._store.async_load = AsyncMock(return_value=None)

    with pytest.raises(
        BindHomeStoreCorruptionError,
        match="Home Assistant moved it aside",
    ):
        await store.async_load()

    assert store._async_path_exists.await_count == 2


async def test_existing_unreadable_storage_fails_closed(hass: HomeAssistant) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(side_effect=[True, True])
    store._store.async_load = AsyncMock(return_value=None)

    with pytest.raises(
        BindHomeStoreLoadError,
        match="did not contain a readable registry",
    ):
        await store.async_load()


async def test_home_assistant_load_failure_is_surfaced(hass: HomeAssistant) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=True)
    store._store.async_load = AsyncMock(
        side_effect=HomeAssistantError("cannot read storage")
    )

    with pytest.raises(
        BindHomeStoreLoadError,
        match="Home Assistant could not read BindHome storage",
    ):
        await store.async_load()


async def test_future_registry_schema_is_rejected_without_rewrite(
    hass: HomeAssistant,
) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=True)
    store._store.async_load = AsyncMock(
        return_value={
            "schema_version": 999,
            "assets": [],
            "relations": [],
            "bindings": [],
            "representations": [],
        }
    )
    store.async_save = AsyncMock()

    with pytest.raises(
        BindHomeStoreLoadError,
        match="Unsupported registry schema version: 999",
    ):
        await store.async_load()

    store.async_save.assert_not_awaited()


async def test_legacy_representation_migration_is_persisted_once(
    hass: HomeAssistant,
) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=True)
    store._store.async_load = AsyncMock(
        return_value={
            "schema_version": 1,
            "assets": [
                {
                    "id": "legacy-light",
                    "name": "Legacy logical light",
                    "asset_type": "light_point",
                    "capabilities": ["on_off"],
                }
            ],
            "relations": [],
            "bindings": [],
        }
    )
    store.async_save = AsyncMock()

    registry = await store.async_load()

    representation = registry.get_representation("legacy-light")
    assert representation is not None
    assert representation.platform == "light"
    store.async_save.assert_awaited_once_with(registry)


async def test_canonical_registry_is_not_rewritten_on_load(
    hass: HomeAssistant,
) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=True)
    store._store.async_load = AsyncMock(
        return_value={
            "schema_version": 1,
            "assets": [],
            "relations": [],
            "bindings": [],
            "representations": [],
        }
    )
    store.async_save = AsyncMock()

    registry = await store.async_load()

    assert registry.to_dict() == BindHomeRegistry().to_dict()
    store.async_save.assert_not_awaited()


async def test_migration_write_failure_aborts_load(hass: HomeAssistant) -> None:
    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=True)
    store._store.async_load = AsyncMock(
        return_value={
            "schema_version": 1,
            "assets": [],
            "relations": [],
            "bindings": [],
        }
    )
    store.async_save = AsyncMock(side_effect=BindHomeStoreError("disk full"))

    with pytest.raises(BindHomeStoreError, match="disk full"):
        await store.async_load()


async def test_setup_entry_reports_storage_failure_as_config_entry_error(
    hass: HomeAssistant,
) -> None:
    load = AsyncMock(side_effect=BindHomeStoreLoadError("registry unsafe"))

    with (
        patch("custom_components.bindhome.BindHomeManager.async_load", new=load),
        pytest.raises(ConfigEntryError, match="registry unsafe"),
    ):
        await async_setup_entry(hass, MagicMock())

    load.assert_awaited_once()
