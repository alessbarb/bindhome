"""Persistent storage for BindHome."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION
from .registry import BindHomeRegistry


class BindHomeStore:
    """Persist the BindHome registry using Home Assistant storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
        )

    async def async_load(self) -> BindHomeRegistry:
        """Load the registry from Home Assistant storage."""
        return BindHomeRegistry.from_dict(await self._store.async_load())

    async def async_save(self, registry: BindHomeRegistry) -> None:
        """Persist the registry immediately."""
        await self._store.async_save(registry.to_dict())
