"""Pure, deterministic read queries over the BindHome registry.

This module is the semantic query layer for BindHome. It is intentionally
side-effect free: every function takes a :class:`BindHomeRegistry` (and, for the
resolver status read model, an :class:`EntityProbe`) and returns plain data.

Design rules:

* relation direction matters -- ``outgoing`` follows ``source -> target``,
  ``incoming`` follows ``target -> source``, ``any`` follows both;
* relation types stay generic -- optional filters are matched as normalized
  identifiers, never interpreted;
* traversal is cycle-safe -- every asset is visited once, at its minimum depth;
* results are deterministic -- neighbours and result lists are sorted by a
  stable key so output does not depend on insertion order;
* no heavy graph dependency -- plain breadth-first search over dictionaries.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from enum import Enum
from typing import Any

from .models import Asset, Binding, Relation, normalize_identifier
from .registry import BindHomeRegistry
from .resolver import BindingResolver, EntityProbe, Resolution


class Direction(Enum):
    """Direction in which a relation is followed during a query."""

    OUTGOING = "outgoing"
    INCOMING = "incoming"
    ANY = "any"


def _coerce_direction(direction: Direction | str) -> Direction:
    if isinstance(direction, Direction):
        return direction
    try:
        return Direction(direction)
    except ValueError as err:
        raise ValueError(f"Unknown traversal direction: {direction!r}") from err


def _normalize_relation_types(
    relation_types: list[str] | tuple[str, ...] | set[str] | None,
) -> frozenset[str] | None:
    """Return a normalized identifier set, or ``None`` when no filter is given.

    An empty collection is treated as "no filter" rather than "match nothing".
    """
    if not relation_types:
        return None
    return frozenset(
        normalize_identifier(value, "relation_type") for value in relation_types
    )


def _relation_sort_key(relation: Relation) -> tuple[str, str, str]:
    return (
        relation.source_asset_id,
        relation.relation_type,
        relation.target_asset_id,
    )


# ---------------------------------------------------------------------------
# Asset reads
# ---------------------------------------------------------------------------


def get_asset(registry: BindHomeRegistry, asset_id: str) -> Asset:
    """Return a single asset or raise :class:`RegistryNotFoundError`."""
    return registry.get_asset(asset_id)


def list_assets(registry: BindHomeRegistry) -> list[Asset]:
    """Return every asset, ordered deterministically by id."""
    return [registry.assets[asset_id] for asset_id in sorted(registry.assets)]


# ---------------------------------------------------------------------------
# Relation reads
# ---------------------------------------------------------------------------


def outgoing_relations(
    registry: BindHomeRegistry,
    asset_id: str,
    relation_types: list[str] | tuple[str, ...] | set[str] | None = None,
) -> list[Relation]:
    """Return relations where ``asset_id`` is the source."""
    registry.get_asset(asset_id)
    wanted = _normalize_relation_types(relation_types)
    return sorted(
        (
            relation
            for relation in registry.relations.values()
            if relation.source_asset_id == asset_id
            and (wanted is None or relation.relation_type in wanted)
        ),
        key=_relation_sort_key,
    )


def incoming_relations(
    registry: BindHomeRegistry,
    asset_id: str,
    relation_types: list[str] | tuple[str, ...] | set[str] | None = None,
) -> list[Relation]:
    """Return relations where ``asset_id`` is the target."""
    registry.get_asset(asset_id)
    wanted = _normalize_relation_types(relation_types)
    return sorted(
        (
            relation
            for relation in registry.relations.values()
            if relation.target_asset_id == asset_id
            and (wanted is None or relation.relation_type in wanted)
        ),
        key=_relation_sort_key,
    )


def relations_for_asset(
    registry: BindHomeRegistry,
    asset_id: str,
    relation_types: list[str] | tuple[str, ...] | set[str] | None = None,
) -> list[Relation]:
    """Return every relation that involves ``asset_id`` in either direction."""
    registry.get_asset(asset_id)
    wanted = _normalize_relation_types(relation_types)
    return sorted(
        (
            relation
            for relation in registry.relations.values()
            if (
                relation.source_asset_id == asset_id
                or relation.target_asset_id == asset_id
            )
            and (wanted is None or relation.relation_type in wanted)
        ),
        key=_relation_sort_key,
    )


# ---------------------------------------------------------------------------
# Traversal
# ---------------------------------------------------------------------------


def _adjacency(
    registry: BindHomeRegistry,
    direction: Direction,
    wanted: frozenset[str] | None,
) -> dict[str, list[str]]:
    """Build a deterministic adjacency map for the requested direction."""
    adjacency: dict[str, set[str]] = {}
    for relation in registry.relations.values():
        if wanted is not None and relation.relation_type not in wanted:
            continue
        src, tgt = relation.source_asset_id, relation.target_asset_id
        if direction in (Direction.OUTGOING, Direction.ANY):
            adjacency.setdefault(src, set()).add(tgt)
        if direction in (Direction.INCOMING, Direction.ANY):
            adjacency.setdefault(tgt, set()).add(src)
    return {node: sorted(targets) for node, targets in adjacency.items()}


@dataclass(frozen=True, slots=True)
class TraversalHit:
    """One asset reached during a traversal, with its minimum depth."""

    asset_id: str
    depth: int

    def to_dict(self) -> dict[str, Any]:
        """Serialize the hit."""
        return {"asset_id": self.asset_id, "depth": self.depth}


def traverse(
    registry: BindHomeRegistry,
    asset_id: str,
    direction: Direction | str = Direction.OUTGOING,
    relation_types: list[str] | tuple[str, ...] | set[str] | None = None,
    max_depth: int | None = None,
) -> list[TraversalHit]:
    """Breadth-first directional traversal from ``asset_id``.

    The start asset is not included in the result. Each reachable asset appears
    exactly once, at its shortest distance from the start, so cycles terminate
    safely. ``max_depth`` of ``None`` means unbounded; ``1`` means direct
    neighbours only. Results are ordered by ``(depth, asset_id)``.
    """
    registry.get_asset(asset_id)
    resolved_direction = _coerce_direction(direction)
    wanted = _normalize_relation_types(relation_types)
    if max_depth is not None and max_depth < 0:
        raise ValueError("max_depth must not be negative")

    adjacency = _adjacency(registry, resolved_direction, wanted)
    visited: set[str] = {asset_id}
    hits: list[TraversalHit] = []
    queue: deque[tuple[str, int]] = deque([(asset_id, 0)])
    while queue:
        current, depth = queue.popleft()
        if max_depth is not None and depth >= max_depth:
            continue
        for neighbour in adjacency.get(current, ()):
            if neighbour in visited:
                continue
            visited.add(neighbour)
            hits.append(TraversalHit(neighbour, depth + 1))
            queue.append((neighbour, depth + 1))
    hits.sort(key=lambda hit: (hit.depth, hit.asset_id))
    return hits


def reachable_assets(
    registry: BindHomeRegistry,
    asset_id: str,
    direction: Direction | str = Direction.OUTGOING,
    relation_types: list[str] | tuple[str, ...] | set[str] | None = None,
    max_depth: int | None = None,
) -> list[str]:
    """Return just the asset ids reachable from ``asset_id`` (sorted, no start)."""
    return sorted(
        hit.asset_id
        for hit in traverse(registry, asset_id, direction, relation_types, max_depth)
    )


def find_path(
    registry: BindHomeRegistry,
    source_asset_id: str,
    target_asset_id: str,
    direction: Direction | str = Direction.OUTGOING,
    relation_types: list[str] | tuple[str, ...] | set[str] | None = None,
) -> list[str] | None:
    """Return the shortest asset-id path from source to target, or ``None``.

    The path includes both endpoints. When several shortest paths exist, the one
    that is lexicographically smallest by asset id at the first point of
    divergence is returned, so the result is deterministic. A zero-length path
    (``source == target``) returns ``[source]``.
    """
    registry.get_asset(source_asset_id)
    registry.get_asset(target_asset_id)
    resolved_direction = _coerce_direction(direction)
    wanted = _normalize_relation_types(relation_types)
    if source_asset_id == target_asset_id:
        return [source_asset_id]

    adjacency = _adjacency(registry, resolved_direction, wanted)
    visited: set[str] = {source_asset_id}
    queue: deque[list[str]] = deque([[source_asset_id]])
    while queue:
        path = queue.popleft()
        for neighbour in adjacency.get(path[-1], ()):
            if neighbour == target_asset_id:
                return [*path, neighbour]
            if neighbour in visited:
                continue
            visited.add(neighbour)
            queue.append([*path, neighbour])
    return None


# ---------------------------------------------------------------------------
# Binding / resolver status read model
# ---------------------------------------------------------------------------


@dataclass(frozen=True, slots=True)
class BindingStatus:
    """Resolver outcome for one ``(asset_id, capability, role)`` key."""

    asset_id: str
    capability: str
    role: str
    status: str
    config_valid: bool
    runtime_available: bool
    entity_id: str | None
    state: str | None
    binding: Binding | None

    def to_dict(self) -> dict[str, Any]:
        """Serialize the status record."""
        return {
            "asset_id": self.asset_id,
            "capability": self.capability,
            "role": self.role,
            "status": self.status,
            "config_valid": self.config_valid,
            "runtime_available": self.runtime_available,
            "entity_id": self.entity_id,
            "state": self.state,
            "binding": self.binding.to_dict() if self.binding is not None else None,
        }

    @classmethod
    def from_resolution(cls, resolution: Resolution) -> BindingStatus:
        """Build a status record from a :class:`Resolution`."""
        return cls(
            asset_id=resolution.asset_id,
            capability=resolution.capability,
            role=resolution.role,
            status=resolution.status.value,
            config_valid=resolution.config_valid,
            runtime_available=resolution.runtime_available,
            entity_id=resolution.entity_id,
            state=resolution.state,
            binding=resolution.binding,
        )


def _status_keys(registry: BindHomeRegistry) -> list[tuple[str, str, str]]:
    """Every key worth resolving: existing bindings plus unbound capabilities.

    Enumerating declared-but-unbound capabilities is what lets the read model
    surface ``binding_not_found`` instead of silently omitting the gap.
    """
    keys: set[tuple[str, str, str]] = set()
    for binding in registry.bindings.values():
        keys.add((binding.asset_id, binding.capability, binding.role))
    for asset in registry.assets.values():
        for capability in asset.capabilities:
            if registry.get_binding(asset.id, capability, "primary") is None:
                keys.add((asset.id, capability, "primary"))
    return sorted(keys)


def binding_statuses(
    registry: BindHomeRegistry, probe: EntityProbe
) -> list[BindingStatus]:
    """Resolve every relevant binding key into a deterministic status list."""
    resolver = BindingResolver(registry, probe)
    return [
        BindingStatus.from_resolution(resolver.resolve(asset_id, capability, role))
        for asset_id, capability, role in _status_keys(registry)
    ]


def resolver_status(registry: BindHomeRegistry, probe: EntityProbe) -> dict[str, Any]:
    """Aggregate read model of binding/resolver health.

    Returns per-key ``records`` plus a ``summary`` with total counts, a
    per-status breakdown, and how many keys are configuration-valid and
    runtime-available.
    """
    records = binding_statuses(registry, probe)
    by_status: dict[str, int] = {}
    for record in records:
        by_status[record.status] = by_status.get(record.status, 0) + 1
    summary = {
        "total": len(records),
        "config_valid": sum(1 for record in records if record.config_valid),
        "runtime_available": sum(1 for record in records if record.runtime_available),
        "by_status": dict(sorted(by_status.items())),
    }
    return {
        "records": [record.to_dict() for record in records],
        "summary": summary,
    }
