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
