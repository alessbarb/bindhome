# BindHome architecture

## Purpose

BindHome is a stable infrastructure abstraction layer for Home Assistant.

It separates the physical identity of the home from the hardware that currently implements automation or measurement.

```text
Home / automation logic
        |
        v
Stable BindHome asset + capability
        |
        v
Binding
        |
        v
Current Home Assistant entity
        |
        v
Current physical hardware
```

## Core objects

### Asset

Represents stable physical infrastructure.

Required properties:

- immutable internal `id`;
- human-readable `name`;
- generic `asset_type`;
- optional human code;
- optional Home Assistant `area_id`;
- zero or more capabilities.

### Relation

Represents topology between assets. The core does not hard-code electrical, plumbing, climate, or network semantics. Relation types are extensible identifiers.

### Capability

Represents a logical function of an asset. Bindings attach to capabilities, allowing one asset to use different Home Assistant entities for control, sensing, power measurement, and other roles.

### Binding

Maps `asset + capability + role` to one Home Assistant `entity_id`.

Calling `set_binding` for an existing `(asset, capability, role)` replaces the current implementation while preserving the stable infrastructure asset.

## Binding resolver

`resolver.py` is the read-side layer that future logical BindHome entities use to
find which Home Assistant entity currently implements a capability:

```text
(asset_id, capability, role) -> current Home Assistant entity_id
```

`BindingResolver.resolve()` returns a typed `Resolution` with an explicit
`ResolutionStatus` instead of an ambiguous `None`:

- `ASSET_NOT_FOUND`, `CAPABILITY_NOT_DECLARED`, `BINDING_NOT_FOUND` -- the request
  cannot be satisfied by the registry;
- `ENTITY_NOT_FOUND` -- the binding exists but its `entity_id` is no longer in the
  Entity Registry or state machine (stale reference);
- `RUNTIME_UNAVAILABLE` / `RUNTIME_UNKNOWN` -- the entity exists but its state is
  `unavailable`, `unknown` or not yet loaded;
- `RESOLVED` -- the entity exists and has a usable state;
- `INVALID_REQUEST` -- the requested capability/role is not a valid identifier.

### Configuration validity vs runtime availability

These are independent axes and must not be conflated:

- `Resolution.config_valid` is true for `RESOLVED`, `RUNTIME_UNAVAILABLE` and
  `RUNTIME_UNKNOWN`. A device that is merely offline is still a valid binding.
- `Resolution.runtime_available` is true only for `RESOLVED`.

`resolve_entity_id()` is the strict variant: it raises for configuration failures
(missing asset/capability/binding, stale reference) but still returns the
`entity_id` when the reference is valid and only the runtime state is degraded.

Home Assistant access is isolated behind the `EntityProbe` protocol
(`HomeAssistantEntityProbe` for production, `StaticEntityProbe` for tests), so the
resolver and its tests need no running Home Assistant instance.

### Compatibility checks

`CapabilityCompatibility` provides advisory, vendor-neutral checks based only on
generic Home Assistant entity domains (for example `dimming` expects the `light`
domain). Verdicts are tri-state: `COMPATIBLE`, `INCOMPATIBLE`, or `UNKNOWN` for
unmapped capabilities or un-parseable entity ids. Compatibility never blocks
resolution and contains no manufacturer or protocol knowledge; the domain map is
extensible via `register()`.

## Infrastructure query layer

`query.py` is the pure, side-effect-free read layer that makes BindHome
semantically queryable. Every function takes a `BindHomeRegistry` (and, for the
resolver status read model, an `EntityProbe`) and returns plain data or simple
serializable dataclasses (`to_dict()`), following the `models.py` idiom.

It never mutates the registry and adds no dependency: traversal is plain
breadth-first search over dictionaries.

### Relation reads

`get_asset` / `list_assets`, and `incoming_relations` / `outgoing_relations` /
`relations_for_asset`. Relation direction is significant: `outgoing` follows
`source -> target`, `incoming` follows `target -> source`. All reads accept an
optional `relation_types` filter, matched as normalized identifiers so `POWERS`
matches `powers`; relation types are never interpreted. Unknown assets raise
`RegistryNotFoundError` (never an empty list).

### Traversal and paths

`traverse(registry, asset_id, direction, relation_types=None, max_depth=None)`
returns `TraversalHit(asset_id, depth)` entries. The `Direction` enum is
`OUTGOING` (default), `INCOMING`, or `ANY`. The start asset is excluded; each
reachable asset appears once at its minimum depth, so cycles terminate safely.
`max_depth=1` yields direct neighbours only. `reachable_assets` is the sorted
id-only view. `find_path` returns the shortest asset-id path between two assets
(both endpoints included) or `None`.

Results are deterministic: neighbours and result lists are sorted by a stable
key, so output does not depend on asset insertion order.

### Binding / resolver status read model

`resolver_status(registry, probe)` composes `BindingResolver` outcomes into an
aggregate read model: per-key `records` (each a serialized `BindingStatus` with
`status`, `config_valid`, `runtime_available`, `entity_id`, `state`, `binding`)
plus a `summary` with totals and a per-status breakdown. The key set is the union
of existing bindings and every declared-but-unbound capability, so
`binding_not_found` gaps are surfaced rather than omitted.

### WebSocket surface

These are exposed as additive read commands alongside the Sprint 1 CRUD
commands, without renaming any: `bindhome/assets/get`, `bindhome/assets/list`,
`bindhome/relations/list`, `bindhome/graph/traverse`, `bindhome/graph/path`, and
`bindhome/bindings/status`. The panel branch remains usable from
`bindhome/registry/get` alone.

## Hardware ownership

BindHome does not maintain a hardware registry. Home Assistant already owns the Device Registry and Entity Registry. BindHome only stores entity references in bindings.

## Storage

The registry is persisted with Home Assistant's `Store` helper. The `.storage` file is an implementation detail and must never be edited manually.

## Planned layers

1. Core registry and persistence. (done)
2. Binding resolver and compatibility layer. (done)
3. CRUD WebSocket API.
4. Dedicated BindHome panel.
5. Logical proxy entities, starting with `light`, built on the resolver.
6. Topology visualization.
7. Import/export UI.
