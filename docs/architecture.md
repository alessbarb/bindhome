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

### Home Assistant is the infrastructure source of truth

BindHome is not a parallel home-automation platform.

Home Assistant owns and remains authoritative for:

- entities and their current state;
- devices;
- areas and floors;
- domains and entity platforms;
- services and service routing;
- supported features and runtime capabilities;
- integration-specific behaviour.

BindHome references those Home Assistant objects and adds only the concepts
needed to preserve the stable physical and functional identity of the home,
such as infrastructure assets, topology relations and bindings between a stable
capability and the Home Assistant entity that currently implements it.

When Home Assistant already provides a registry, service, capability model or
runtime behaviour, BindHome uses it rather than maintaining a parallel copy.
In particular, BindHome must not maintain domain-to-capability compatibility
matrices or duplicate Home Assistant supported-feature knowledge.

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

Calling `set_binding` for an existing `(asset, capability, role)` replaces the
current implementation while preserving the stable infrastructure asset.

### Representation

Represents BindHome's explicit decision to expose an Asset back into Home
Assistant as a logical entity.

The current cardinality is zero or one Representation per Asset. A
Representation stores the stable BindHome `asset_id` and a platform implemented
by BindHome.

Capability and Representation are intentionally independent. For example,
`on_off` describes a function of an Asset but does not itself create a
`light.*` entity.

BindHome owns only the Representation platforms that it actually implements.
The initial `light` Representation requires the BindHome `on_off` capability.
This is a BindHome implementation contract, not a Home Assistant compatibility
matrix.

### Creation preset

Creation presets are read-only UX metadata for generating editable Asset drafts
during high-volume inventory.

A preset contains only BindHome-owned suggestions such as:

- stable preset identifier;
- inventory group;
- suggested `asset_type`;
- default display name;
- suggested capabilities.

Presets do not create Assets by themselves, do not create bindings or
Representations, and do not restrict custom Asset types or capabilities.

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

### Home Assistant capability and service authority

The resolver does not maintain its own operational compatibility model. Its
responsibility is limited to BindHome concerns: resolving the stable
asset/capability/role key, checking that the binding references an entity known
to Home Assistant, and reporting its runtime state.

When an operation is executed, BindHome resolves the binding to a Home
Assistant `entity_id` and delegates through Home Assistant's own generic service
infrastructure. Home Assistant then determines the target domain, whether the
operation is supported, and how the integration implements it.

This keeps BindHome independent of Home Assistant's evolving domain and feature
catalogue and avoids duplicating infrastructure knowledge already owned by Home
Assistant.

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

The WebSocket API is the primary BindHome-facing application surface.

Asset mutation:

- `bindhome/assets/create`;
- `bindhome/assets/create_bulk`;
- `bindhome/assets/update`;
- `bindhome/assets/delete`.

Topology and binding mutation:

- `bindhome/relations/create`;
- `bindhome/relations/delete`;
- `bindhome/bindings/set`;
- `bindhome/bindings/delete`.

Logical exposure:

- `bindhome/representations/set`;
- `bindhome/representations/delete`.

Inventory metadata:

- `bindhome/presets/list`.

Read/query commands:

- `bindhome/registry/get`;
- `bindhome/assets/get`;
- `bindhome/assets/list`;
- `bindhome/relations/list`;
- `bindhome/graph/traverse`;
- `bindhome/graph/path`;
- `bindhome/bindings/status`.

Bulk Asset creation is a first-class transactional operation rather than N
client-side `create_asset` calls. Representation and preset configuration are
WebSocket-oriented primitives and deliberately do not duplicate Home Assistant
service actions without an external service-use case.

## Hardware ownership

BindHome does not maintain a hardware registry. Home Assistant already owns the Device Registry and Entity Registry. BindHome only stores entity references in bindings.

## Storage

The registry is persisted with Home Assistant's `Store` helper. The `.storage` file is an implementation detail and must never be edited manually.

## Current functional state

Implemented:

1. Core registry and Home Assistant-backed persistence.
2. Stable Asset identity with update support.
3. Relations, capabilities and replaceable bindings.
4. Binding resolver with configuration/runtime status.
5. CRUD and query WebSocket APIs.
6. Transactional bulk Asset creation with all-or-none persistence.
7. Explicit optional Representation, currently zero-or-one per Asset.
8. Logical `light` proxy entities driven by explicit Representation.
9. Dynamic logical-entity reconciliation.
10. Hot binding replacement without integration reload.
11. Home Assistant-native service routing.
12. Extensible creation presets used only as editable UX defaults.
13. Dedicated BindHome panel.
14. System-health counters and registry serialization.

The functional backend foundation required before inventory UX is complete.

In particular:

- Capability no longer implies logical Home Assistant entity type.
- An Asset with `on_off` remains passive unless it has an explicit
  Representation.
- Existing pre-Representation registries are migrated to preserve their previous
  logical-light behaviour once, after which Representation state is explicit.
- Bulk creation stages the entire mutation, persists once, then adopts the
  staged contents into the existing live registry object so long-lived runtime
  references remain valid.
- Creation presets never create bindings, entity references or
  Representations.

## Next product work

The first user-facing milestone is the Area-oriented **Inventory this room**
workflow using Home Assistant Floors and Areas.

The backend primitives it requires are already available:

1. read the creation preset catalogue;
2. generate and edit local Asset drafts;
3. submit the complete room inventory through transactional bulk creation;
4. enrich created Assets later with bindings, topology and optional
   Representations.

Later UX work can add topology visualization, richer editing, issues/status
views and import/export workflows without changing these core ownership rules.

See `product-contract.md` for the agreed product behaviour.
