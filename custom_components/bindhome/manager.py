"""Transactional manager for BindHome registry mutations."""

from __future__ import annotations

import asyncio

from homeassistant.core import HomeAssistant

from .models import Asset, Binding, Relation
from .registry import BindHomeRegistry
from .store import BindHomeStore


class BindHomeManager:
    """Coordinate registry state and persistent writes."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.registry = BindHomeRegistry()
        self._store = BindHomeStore(hass)
        self._mutation_lock = asyncio.Lock()

    async def async_load(self) -> None:
        """Load persisted registry state."""
        self.registry = await self._store.async_load()

    async def async_create_asset(
        self,
        *,
        name: str,
        asset_type: str,
        code: str | None,
        area_id: str | None,
        capabilities: list[str],
    ) -> Asset:
        """Create and persist an asset."""
        async with self._mutation_lock:
            asset = self.registry.add_asset(
                Asset.create(
                    name=name,
                    asset_type=asset_type,
                    code=code,
                    area_id=area_id,
                    capabilities=capabilities,
                )
            )
            await self._store.async_save(self.registry)
            return asset

    async def async_delete_asset(self, asset_id: str) -> None:
        """Delete and persist an asset."""
        async with self._mutation_lock:
            self.registry.delete_asset(asset_id)
            await self._store.async_save(self.registry)

    async def async_add_relation(
        self, *, source_asset_id: str, relation_type: str, target_asset_id: str
    ) -> Relation:
        """Create and persist a topology relation."""
        async with self._mutation_lock:
            relation = self.registry.add_relation(
                Relation.create(
                    source_asset_id=source_asset_id,
                    relation_type=relation_type,
                    target_asset_id=target_asset_id,
                )
            )
            await self._store.async_save(self.registry)
            return relation

    async def async_remove_relation(self, relation_id: str) -> None:
        """Remove and persist a topology relation."""
        async with self._mutation_lock:
            self.registry.remove_relation(relation_id)
            await self._store.async_save(self.registry)

    async def async_set_binding(
        self,
        *,
        asset_id: str,
        capability: str,
        entity_id: str,
        role: str,
    ) -> Binding:
        """Create or replace and persist a capability binding."""
        async with self._mutation_lock:
            binding = self.registry.set_binding(
                Binding.create(
                    asset_id=asset_id,
                    capability=capability,
                    entity_id=entity_id,
                    role=role,
                )
            )
            await self._store.async_save(self.registry)
            return binding

    async def async_remove_binding(self, binding_id: str) -> None:
        """Remove and persist a binding."""
        async with self._mutation_lock:
            self.registry.remove_binding(binding_id)
            await self._store.async_save(self.registry)
