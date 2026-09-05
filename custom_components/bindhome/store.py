"""Persistent storage for BindHome."""

from __future__ import annotations

import os
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, UnsupportedStorageVersionError
from homeassistant.helpers.storage import Store
from homeassistant.util import json as json_util
from homeassistant.util.file import WriteError

from .const import STORAGE_KEY, STORAGE_VERSION
from .migrations import RegistrySchemaFutureError, migrate_registry_payload
from .registry import BindHomeRegistry, RegistryValidationError


class BindHomeStoreError(RuntimeError):
    """Base error for BindHome persistent storage failures."""


class BindHomeStoreLoadError(BindHomeStoreError):
    """Raised when persisted BindHome state cannot be loaded safely."""


class BindHomeStoreCorruptionError(BindHomeStoreLoadError):
    """Raised when Home Assistant moved corrupt BindHome storage aside."""


class BindHomeStoreVersionError(BindHomeStoreLoadError):
    """Raised when the Home Assistant storage envelope is incompatible."""


class BindHomeRegistryVersionError(BindHomeStoreLoadError):
    """Raised when the Registry schema itself is newer than this BindHome."""


class _FailFastStore(Store[dict[str, Any]]):
    """Surface write failures that Home Assistant's Store normally logs only."""

    async def _async_write_data(self, data: dict[str, Any]) -> None:
        try:
            await super()._async_write_data(data)
        except (json_util.SerializationError, WriteError) as err:
            raise BindHomeStoreError("Failed to persist BindHome registry") from err


class BindHomeStore:
    """Persist the BindHome registry using Home Assistant storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = _FailFastStore(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
            atomic_writes=True,
        )

    async def _async_path_exists(self) -> bool:
        """Return whether the managed Home Assistant storage file exists."""
        return await self._hass.async_add_executor_job(os.path.isfile, self._store.path)

    async def async_load(self) -> BindHomeRegistry:
        """Load persisted registry state without silently discarding failures."""
        existed_before = await self._async_path_exists()

        try:
            data = await self._store.async_load()
        except UnsupportedStorageVersionError as err:
            raise BindHomeStoreVersionError(
                "BindHome storage envelope was written by a newer incompatible version"
            ) from err
        except NotImplementedError as err:
            raise BindHomeStoreVersionError(
                "BindHome storage envelope uses an unsupported older storage version"
            ) from err
        except (HomeAssistantError, KeyError, TypeError) as err:
            raise BindHomeStoreLoadError(
                "Home Assistant could not read BindHome storage"
            ) from err

        if data is None:
            if not existed_before:
                return BindHomeRegistry()

            if not await self._async_path_exists():
                raise BindHomeStoreCorruptionError(
                    "BindHome storage is corrupt and Home Assistant moved it aside; "
                    "restore the registry from a backup before continuing"
                )

            raise BindHomeStoreLoadError(
                "BindHome storage exists but did not contain a readable registry"
            )

        try:
            migration = migrate_registry_payload(data)
        except RegistrySchemaFutureError as err:
            raise BindHomeRegistryVersionError(str(err)) from err
        except RegistryValidationError as err:
            raise BindHomeStoreLoadError(
                f"Persisted BindHome registry is invalid: {err}"
            ) from err

        registry = migration.registry

        # Startup migration/canonicalization uses the manager-independent
        # validate-before-write primitive established by the transaction contract.
        # Failed migration never reaches this write, and failed writes abort setup.
        if migration.changed:
            await self.async_save(registry)

        return registry

    async def async_save(self, registry: BindHomeRegistry) -> None:
        """Validate canonical Registry state, then persist it atomically.

        This method is safe to use both for runtime commits and during startup,
        when no live manager, mutation lock or Registry-changed signal exists.
        Validation/serialization must complete before Home Assistant storage is
        touched.
        """
        canonical = BindHomeRegistry.from_dict(registry.to_dict())
        await self._store.async_save(canonical.to_dict())
