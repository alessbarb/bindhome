"""Transactional manager for BindHome registry mutations."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .const import SIGNAL_REGISTRY_CHANGED
from .models import (
    Asset,
    Binding,
    ModelValidationError,
    Relation,
    Representation,
)
from .registry import (
    BindHomeRegistry,
    RegistryError,
)
from .resolver import BindingResolver, HomeAssistantEntityProbe
from .store import BindHomeStore


@dataclass(frozen=True, slots=True)
class AssetCreateSpec:
    """Validated-boundary input for creating one Asset in a batch."""

    name: str
    asset_type: str
    code: str | None = None
    area_id: str | None = None
    capabilities: tuple[str, ...] = ()


class BulkAssetCreateError(ValueError):
    """Identify the exact Asset draft that failed during atomic creation."""

    def __init__(
        self,
        index: int,
        cause: Exception,
        *,
        field: str | None = None,
    ) -> None:
        self.index = index
        self.cause = cause

        cause_field = getattr(cause, "field", None)
        if cause_field == "capability":
            cause_field = "capabilities"

        self.field = field if field is not None else cause_field
        self.reason = str(cause)

        location = f"assets[{index}]"
        if self.field is not None:
            location += f".{self.field}"

        super().__init__(f"{location}: {self.reason}")

    def to_dict(self) -> dict[str, object]:
        """Return structured details suitable for a user-facing API."""
        return {
            "index": self.index,
            "field": self.field,
            "message": self.reason,
        }


class BindHomeManager:
    """Coordinate registry state and persistent writes."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.registry = BindHomeRegistry()
        self._store = BindHomeStore(hass)
        self._mutation_lock = asyncio.Lock()
        self._probe = HomeAssistantEntityProbe(hass)

    @property
    def resolver(self) -> BindingResolver:
        """Return a resolver bound to the current registry and Home Assistant."""
        return BindingResolver(self.registry, self._probe)

    async def _async_persist_and_notify(self) -> None:
        """Persist the registry and notify runtime consumers."""
        await self._store.async_save(self.registry)
        async_dispatcher_send(self.hass, SIGNAL_REGISTRY_CHANGED)

    def _adopt_staged_registry(self, staged: BindHomeRegistry) -> None:
        """Commit staged state while preserving the live registry identity.

        Long-lived runtime consumers may retain references to the current
        BindHomeRegistry, so batch commits replace its contents rather than
        replacing the registry object itself.
        """
        self.registry.assets.clear()
        self.registry.assets.update(staged.assets)

        self.registry.relations.clear()
        self.registry.relations.update(staged.relations)

        self.registry.bindings.clear()
        self.registry.bindings.update(staged.bindings)

        self.registry.representations.clear()
        self.registry.representations.update(staged.representations)

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
            await self._async_persist_and_notify()
            return asset

    async def async_create_assets(
        self,
        specs: list[AssetCreateSpec],
    ) -> list[Asset]:
        """Create many Assets as one atomic persistent mutation."""
        if not specs:
            raise ValueError("assets must contain at least one item")

        async with self._mutation_lock:
            staged = BindHomeRegistry.from_dict(self.registry.to_dict())
            created: list[Asset] = []

            for index, spec in enumerate(specs):
                try:
                    asset = Asset.create(
                        name=spec.name,
                        asset_type=spec.asset_type,
                        code=spec.code,
                        area_id=spec.area_id,
                        capabilities=list(spec.capabilities),
                    )
                    staged.add_asset(asset)
                except (ModelValidationError, RegistryError) as err:
                    raise BulkAssetCreateError(index, err) from err

                created.append(asset)

            # Persistence is deliberately performed before changing the live
            # registry. If storage fails, the running registry remains exactly
            # as it was before the batch.
            await self._store.async_save(staged)

            self._adopt_staged_registry(staged)
            async_dispatcher_send(self.hass, SIGNAL_REGISTRY_CHANGED)

            return created

    async def async_update_asset(
        self,
        *,
        asset_id: str,
        name: str,
        asset_type: str,
        code: str | None,
        area_id: str | None,
        capabilities: list[str],
    ) -> Asset:
        """Update and persist an asset without changing its identity."""
        async with self._mutation_lock:
            asset = self.registry.update_asset(
                asset_id,
                name=name,
                asset_type=asset_type,
                code=code,
                area_id=area_id,
                capabilities=capabilities,
            )
            await self._async_persist_and_notify()
            return asset

    async def async_delete_asset(self, asset_id: str) -> None:
        """Delete and persist an asset."""
        async with self._mutation_lock:
            self.registry.delete_asset(asset_id)
            await self._async_persist_and_notify()

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
            await self._async_persist_and_notify()
            return relation

    async def async_remove_relation(self, relation_id: str) -> None:
        """Remove and persist a topology relation."""
        async with self._mutation_lock:
            self.registry.remove_relation(relation_id)
            await self._async_persist_and_notify()

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
            await self._async_persist_and_notify()
            return binding

    async def async_remove_binding(self, binding_id: str) -> None:
        """Remove and persist a binding."""
        async with self._mutation_lock:
            self.registry.remove_binding(binding_id)
            await self._async_persist_and_notify()

    async def async_set_representation(
        self,
        *,
        asset_id: str,
        platform: str,
    ) -> Representation:
        """Create and persist an Asset's logical representation."""
        async with self._mutation_lock:
            representation = self.registry.set_representation(
                Representation.create(
                    asset_id=asset_id,
                    platform=platform,
                )
            )
            await self._async_persist_and_notify()
            return representation

    async def async_remove_representation(self, asset_id: str) -> None:
        """Remove and persist an Asset's logical representation."""
        async with self._mutation_lock:
            self.registry.remove_representation(asset_id)
            await self._async_persist_and_notify()
