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
    RegistryValidationError,
)
from .representation import (
    binding_key,
    representation_asset_for_entity,
    runtime_contract,
)
from .resolver import BindingResolver, HomeAssistantEntityProbe
from .store import BindHomeStore
from .validation import validate_entity


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


class BindingCycleError(RegistryError):
    """Raised when a binding would create recursive BindHome resolution."""

    def __init__(self, path: list[tuple[str, str, str]]) -> None:
        self.path = tuple(path)
        formatted = " -> ".join(
            f"({asset_id}, {capability}, {role})" for asset_id, capability, role in path
        )
        super().__init__(f"Binding cycle detected: {formatted}")


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

    def _stage_registry(self) -> BindHomeRegistry:
        """Return an isolated validated copy of the live registry."""
        return BindHomeRegistry.from_dict(self.registry.to_dict())

    async def _async_commit_staged_registry(
        self,
        staged: BindHomeRegistry,
    ) -> None:
        """Persist staged state, then atomically publish it to runtime consumers."""
        await self._store.async_save(staged)
        self._adopt_staged_registry(staged)
        async_dispatcher_send(self.hass, SIGNAL_REGISTRY_CHANGED)

    def _adopt_staged_registry(self, staged: BindHomeRegistry) -> None:
        """Commit staged state while preserving the live registry identity.

        Long-lived runtime consumers may retain references to the current
        BindHomeRegistry, so commits replace its contents rather than replacing
        the registry object itself.
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
            staged = self._stage_registry()
            asset = staged.add_asset(
                Asset.create(
                    name=name,
                    asset_type=asset_type,
                    code=code,
                    area_id=area_id,
                    capabilities=capabilities,
                )
            )
            await self._async_commit_staged_registry(staged)
            return asset

    async def async_create_assets(
        self,
        specs: list[AssetCreateSpec],
    ) -> list[Asset]:
        """Create many Assets as one atomic persistent mutation."""
        if not specs:
            raise ValueError("assets must contain at least one item")

        async with self._mutation_lock:
            staged = self._stage_registry()
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

            await self._async_commit_staged_registry(staged)
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
            staged = self._stage_registry()
            asset = staged.update_asset(
                asset_id,
                name=name,
                asset_type=asset_type,
                code=code,
                area_id=area_id,
                capabilities=capabilities,
            )
            await self._async_commit_staged_registry(staged)
            return asset

    async def async_delete_asset(self, asset_id: str) -> None:
        """Delete and persist an asset."""
        async with self._mutation_lock:
            staged = self._stage_registry()
            staged.delete_asset(asset_id)
            await self._async_commit_staged_registry(staged)

    async def async_add_relation(
        self, *, source_asset_id: str, relation_type: str, target_asset_id: str
    ) -> Relation:
        """Create and persist a topology relation."""
        async with self._mutation_lock:
            staged = self._stage_registry()
            relation = staged.add_relation(
                Relation.create(
                    source_asset_id=source_asset_id,
                    relation_type=relation_type,
                    target_asset_id=target_asset_id,
                )
            )
            await self._async_commit_staged_registry(staged)
            return relation

    async def async_remove_relation(self, relation_id: str) -> None:
        """Remove and persist a topology relation."""
        async with self._mutation_lock:
            staged = self._stage_registry()
            staged.remove_relation(relation_id)
            await self._async_commit_staged_registry(staged)

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
            staged = self._stage_registry()
            binding = Binding.create(
                asset_id=asset_id,
                capability=capability,
                entity_id=entity_id,
                role=role,
            )
            self._validate_binding_target(binding, registry=staged)
            binding = staged.set_binding(binding)
            await self._async_commit_staged_registry(staged)
            return binding

    def _validate_binding_target(
        self,
        proposed: Binding,
        *,
        registry: BindHomeRegistry,
    ) -> None:
        """Validate HA target and reject only functional BindHome cycles."""
        asset = registry.get_asset(proposed.asset_id)
        if proposed.capability not in asset.capabilities:
            raise RegistryValidationError(
                f"Asset {proposed.asset_id} does not declare capability "
                f"{proposed.capability}",
                field="capability",
            )
        validate_entity(self.hass, proposed.entity_id)

        source = binding_key(proposed)
        adjacency: dict[tuple[str, str, str], set[tuple[str, str, str]]] = {}
        for existing in registry.bindings.values():
            key = binding_key(existing)
            if key == source:
                continue
            target_asset = representation_asset_for_entity(
                self.hass, existing.entity_id, registry.representations
            )
            if target_asset is None:
                continue
            contract = runtime_contract(
                registry.representations[target_asset], target_asset
            )
            if contract is not None:
                adjacency.setdefault(key, set()).update(contract.dependencies)

        target_asset = representation_asset_for_entity(
            self.hass, proposed.entity_id, registry.representations
        )
        if target_asset is None:
            return
        contract = runtime_contract(
            registry.representations[target_asset], target_asset
        )
        if contract is None:
            return
        adjacency[source] = set(contract.dependencies)
        for dependency in contract.dependencies:
            if dependency == source:
                raise BindingCycleError([source, source])
            path = self._find_path(adjacency, dependency, source)
            if path is not None:
                raise BindingCycleError([source, *path])

    @staticmethod
    def _find_path(
        adjacency: dict[tuple[str, str, str], set[tuple[str, str, str]]],
        start: tuple[str, str, str],
        goal: tuple[str, str, str],
    ) -> list[tuple[str, str, str]] | None:
        """Return a path from start to goal, including both endpoints."""
        stack = [(start, [start])]
        visited: set[tuple[str, str, str]] = set()
        while stack:
            node, path = stack.pop()
            if node == goal:
                return path
            if node in visited:
                continue
            visited.add(node)
            for neighbor in adjacency.get(node, ()):
                stack.append((neighbor, [*path, neighbor]))
        return None

    async def async_remove_binding(self, binding_id: str) -> None:
        """Remove and persist a binding."""
        async with self._mutation_lock:
            staged = self._stage_registry()
            staged.remove_binding(binding_id)
            await self._async_commit_staged_registry(staged)

    async def async_set_representation(
        self,
        *,
        asset_id: str,
        platform: str,
    ) -> Representation:
        """Create and persist an Asset's logical representation."""
        async with self._mutation_lock:
            staged = self._stage_registry()
            representation = staged.set_representation(
                Representation.create(
                    asset_id=asset_id,
                    platform=platform,
                )
            )
            await self._async_commit_staged_registry(staged)
            return representation

    async def async_remove_representation(self, asset_id: str) -> None:
        """Remove and persist an Asset's logical representation."""
        async with self._mutation_lock:
            staged = self._stage_registry()
            staged.remove_representation(asset_id)
            await self._async_commit_staged_registry(staged)
