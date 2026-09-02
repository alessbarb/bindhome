# BindHome

**Stable infrastructure. Replaceable hardware.**

BindHome is a Home Assistant custom integration that models the stable physical infrastructure of a home and binds that infrastructure to replaceable Home Assistant entities.

The core design rule is simple:

> Automations should depend on the home, not on the hardware currently implementing it.

## Why BindHome?

A physical light point, socket, radiator, valve, circuit, or network outlet can remain in the same place for decades while the smart hardware attached to it changes repeatedly. BindHome gives the physical asset a stable identity and stores the current binding separately.

Example:

```text
Living room ceiling light (stable BindHome asset)
    -> capability: on_off
    -> binding: switch.shelly_channel_0
```

After replacing the relay:

```text
Living room ceiling light (same BindHome asset)
    -> capability: on_off
    -> binding: switch.sonoff_relay
```

The infrastructure identity remains unchanged.

## Current scope

The current implementation provides:

- stable infrastructure assets;
- Home Assistant Area references;
- generic asset-to-asset relations;
- capabilities attached to assets;
- capability-to-Home-Assistant-entity bindings;
- persistent storage managed by Home Assistant;
- Home Assistant actions for registry mutations;
- CRUD and query WebSocket APIs;
- atomic bulk Asset creation for high-volume inventory;
- binding resolution with configuration/runtime status;
- explicit optional logical Representations;
- dynamic logical entity reconciliation;
- a logical `light` platform driven by explicit Representation;
- an extensible built-in creation preset catalogue;
- a read-only preset WebSocket API;
- a dedicated BindHome panel;
- system health counters;
- import/export-ready registry serialization.

The backend functional foundation for inventory UX is now in place:
transactional bulk creation, explicit logical Representations, and extensible
creation presets.

The next product milestone is the Area-oriented **Inventory this room** user
experience built on those primitives.

## Data model

### Asset

A stable piece of home infrastructure.

Examples: `electrical_panel`, `circuit`, `socket`, `light_point`, `radiator`, `valve`, `network_socket`.

### Relation

A topology edge between two assets.

Examples: `feeds`, `protects`, `contains`, `connected_to`, `serves`.

### Capability

A logical function provided by an asset.

Examples: `on_off`, `dimming`, `temperature`, `setpoint`, `power_measurement`.

### Binding

Maps one asset capability to the Home Assistant entity that currently implements it.

Bindings are replaceable. Assets are stable.

### Representation

Describes whether and how BindHome exposes an Asset back into Home Assistant as
a logical entity.

Representation is explicit and independent from Capability. An Asset may expose
`on_off` without being represented as a Home Assistant Light.

The currently implemented logical `light` Representation requires the BindHome
`on_off` capability.

### Creation preset

UX metadata used to generate editable Asset drafts quickly during high-volume
inventory.

Presets suggest an `asset_type`, display name and capabilities. They do not
restrict custom Assets, create bindings, or create logical Representations.

## Installation during development

Copy `custom_components/bindhome` to your Home Assistant configuration directory:

```text
/config/custom_components/bindhome
```

Restart Home Assistant, then add **BindHome** from **Settings -> Devices & services -> Add integration**.

The integration is configured through the UI and supports one config entry per Home Assistant installation.

## Actions

The backend exposes Home Assistant actions for creating and maintaining the registry:

- `bindhome.create_asset`
- `bindhome.update_asset`
- `bindhome.delete_asset`
- `bindhome.add_relation`
- `bindhome.remove_relation`
- `bindhome.set_binding`
- `bindhome.remove_binding`
- `bindhome.get_registry`

`get_registry` is read-only and returns the serialized registry.

## Project principles

1. Infrastructure identities are stable.
2. Hardware identities are replaceable.
3. Home Assistant's Device Registry and Entity Registry remain the source of truth for hardware.
4. BindHome does not duplicate hardware inventory.
5. Bindings are made at capability level, not merely asset level.
6. BindHome is generic and must not contain installation-specific knowledge.
7. User-facing text may be translated, but code, identifiers, documentation, commits, and development artifacts are written in English.

## Status

Early development. The storage model and service API may change before the first public release.

## License

MIT
