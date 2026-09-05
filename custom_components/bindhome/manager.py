"""Transactional manager for BindHome registry mutations."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .binding_identity import entity_registry_id_for_entity
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
    RegistryConflictError,
    RegistryError,
    RegistryValidationError,
)
from .registry_state import replace_registry_contents
from .representation import (
    binding_key,
    representation_asset_for_entity,
    runtime_contract,
)
from .resolver import BindingResolver, HomeAssistantEntityProbe
from .store import BindHomeStore
from .transaction import BindHomeMutationLock
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


class RegistryRevisionConflictError(RegistryConflictError):
    """Raised when a mutation is based on an obsolete Registry revision."""

    def __init__(self, expected: int, current: int) -> None:
        self.expected = expected
        self.current = current
        super().__init__(
            f"Registry revision conflict: client has {expected}, current is {current}"
        )


class BindHomeManager:
    """Coordinate registry state and persistent writes."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.registry = BindHomeRegistry()
        self._store = BindHomeStore(hass)
        self._mutation_lock = BindHomeMutationLock()
        self._probe = HomeAssistantEntityProbe(hass)
        self._revision = 0

    @property
    def resolver(self) -> BindingResolver:
        """Return a resolver bound to the current registry and Home Assistant."""
        return BindingResolver(self.registry, self._probe)

    @property
    def revision(self) -> int:
        """Return the monotonic in-process Registry revision."""
        return self._revision

    @asynccontextmanager
    async def transaction(
        self,
        *,
        expected_revision: int | None = None,
    ) -> AsyncIterator[BindHomeRegistry]:
        """Yield an isolated Registry and commit it once on successful exit.

        Concurrent callers serialize through the mutation lock. Re-entering the
        manager from the same task while a transaction is open fails fast rather
        than deadlocking on ``asyncio.Lock`` semantics. Transaction callers must
        therefore perform multi-step changes directly against the staged
        Registry yielded here.

        When ``expected_revision`` is supplied it is checked after acquiring the
        mutation lock, before any staged mutation or persistent write can occur.
        """
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
            staged = self._stage_registry()
            yield staged
            await self._async_commit_staged_registry(staged)

    def _assert_expected_revision(self, expected_revision: int | None) -> None:
        """Fail before mutation when a client is based on stale Registry state."""
        if expected_revision is None or expected_revision == self._revision:
            return
        raise RegistryRevisionConflictError(expected_revision, self._revision)

    def _stage_registry(self) -> BindHomeRegistry:
        """Return an isolated validated copy of the live registry."""
        return BindHomeRegistry.from_dict(self.registry.to_dict())

    async def _async_commit_staged_registry(
        self,
        staged: BindHomeRegistry,
    ) -> None:
        """Persist validated staged state, then publish it to runtime consumers."""
        canonical = BindHomeRegistry.from_dict(staged.to_dict())
        await self._store.async_save(canonical)
        self._adopt_staged_registry(canonical)
        self._revision += 1
        async_dispatcher_send(self.hass, SIGNAL_REGISTRY_CHANGED)

    def _adopt_staged_registry(self, staged: BindHomeRegistry) -> None:
        """Commit staged state while preserving the live registry identity.

        Long-lived runtime consumers may retain references to the current
        BindHomeRegistry, so commits replace its persisted collections rather
        than replacing the registry object itself.
        """
        replace_registry_contents(self.registry, staged)

    async def async_load(self) -> None:
        """Load persisted registry state and establish a fresh runtime revision."""
        self.registry = await self._store.async_load()
        self._revision = 0

    async def async_create_asset(
        self,
        *,
        name: str,
        asset_type: str,
        code: str | None,
        area_id: str | None,
        capabilities: list[str],
        expected_revision: int | None = None,
    ) -> Asset:
        """Create and persist an asset."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
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
        *,
        expected_revision: int | None = None,
    ) -> list[Asset]:
        """Create many Assets as one atomic persistent mutation."""
        if not specs:
            raise ValueError("assets must contain at least one item")

        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
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
        expected_revision: int | None = None,
    ) -> Asset:
        """Update and persist an asset without changing its identity."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
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

    async def async_delete_asset(
        self,
        asset_id: str,
        *,
        expected_revision: int | None = None,
    ) -> None:
        """Delete and persist an asset."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
            staged = self._stage_registry()
            staged.delete_asset(asset_id)
            await self._async_commit_staged_registry(staged)

    async def async_add_relation(
        self,
        *,
        source_asset_id: str,
        relation_type: str,
        target_asset_id: str,
        expected_revision: int | None = None,
    ) -> Relation:
        """Create and persist a topology relation."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
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

    async def async_remove_relation(
        self,
        relation_id: str,
        *,
        expected_revision: int | None = None,
    ) -> None:
        """Remove and persist a topology relation."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
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
        expected_revision: int | None = None,
    ) -> Binding:
        """Create or replace and persist a capability binding."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
            staged = self._stage_registry()
            binding = Binding.create(
                asset_id=asset_id,
                capability=capability,
                entity_id=entity_id,
                entity_registry_id=entity_registry_id_for_entity(self.hass, entity_id),
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
        contract = runtime_contract(registry.representations[target_asset], target_asset)
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

    async def async_remove_binding(
        self,
        binding_id: str,
        *,
        expected_revision: int | None = None,
    ) -> None:
        """Remove and persist a binding."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
            staged = self._stage_registry()
            staged.remove_binding(binding_id)
            await self._async_commit_staged_registry(staged)

    async def async_set_representation(
        self,
        *,
        asset_id: str,
        platform: str,
        expected_revision: int | None = None,
    ) -> Representation:
        """Create and persist an Asset's logical representation."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
            staged = self._stage_registry()
            representation = staged.set_representation(
                Representation.create(
                    asset_id=asset_id,
                    platform=platform,
                )
            )
            await self._async_commit_staged_registry(staged)
            return representation

    async def async_remove_representation(
        self,
        asset_id: str,
        *,
        expected_revision: int | None = None,
    ) -> None:
        """Remove and persist an Asset's logical representation."""
        async with self._mutation_lock:
            self._assert_expected_revision(expected_revision)
            staged = self._stage_registry()
            staged.remove_representation(asset_id)
            await self._async_commit_staged_registry(staged)
