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

## Hardware ownership

BindHome does not maintain a hardware registry. Home Assistant already owns the Device Registry and Entity Registry. BindHome only stores entity references in bindings.

## Storage

The registry is persisted with Home Assistant's `Store` helper. The `.storage` file is an implementation detail and must never be edited manually.

## Planned layers

1. Core registry and persistence.
2. CRUD WebSocket API.
3. Dedicated BindHome panel.
4. Logical proxy entities, starting with `light`.
5. Binding compatibility checks.
6. Topology visualization.
7. Import/export UI.
