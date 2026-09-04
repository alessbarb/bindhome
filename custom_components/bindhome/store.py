"""Persistent storage for BindHome."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import json as json_util
from homeassistant.util.file import WriteError

from .const import STORAGE_KEY, STORAGE_VERSION
from .registry import BindHomeRegistry


class BindHomeStoreError(RuntimeError):
    """Raised when Home Assistant cannot persist the BindHome registry."""


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
        self._store: Store[dict[str, Any]] = _FailFastStore(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
            atomic_writes=True,
        )

    async def async_load(self) -> BindHomeRegistry:
        """Load the registry from Home Assistant storage."""
        return BindHomeRegistry.from_dict(await self._store.async_load())

    async def async_save(self, registry: BindHomeRegistry) -> None:
        """Persist the registry immediately or raise on storage failure."""
        await self._store.async_save(registry.to_dict())
