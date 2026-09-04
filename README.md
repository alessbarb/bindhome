# BindHome

**Model the home, not the hardware.**

BindHome is a Home Assistant custom integration for describing the **stable physical infrastructure of a home** independently from the smart devices that happen to control or measure it today.

Home Assistant is excellent at representing devices and entities. Those devices are replaceable: a relay fails, a sensor is upgraded, a Zigbee device becomes Matter, or a Shelly is replaced by another brand. The physical thing in the home usually did not change.

BindHome adds that missing stable layer.

```text
THE HOME                         CURRENT HOME ASSISTANT HARDWARE

Living room ceiling light  <-->  switch.shelly_living_room
          ^
          |
     stable Asset
```

Replace the relay:

```text
Living room ceiling light  <-->  switch.new_relay
          ^
          |
     same Asset
```

The infrastructure keeps its identity. Only the connection to the current hardware changes.

---

## Why BindHome exists

A normal Home Assistant installation tends to make hardware identifiers part of the long-term model of the house:

```text
automation
  -> switch.shelly_2pm_channel_0
```

That works, but the identifier describes a device implementation rather than the physical thing you care about.

BindHome introduces a stable abstraction:

```text
Living room ceiling light
  -> capability: on_off
  -> current implementation: switch.shelly_2pm_channel_0
```

Later:

```text
Living room ceiling light
  -> capability: on_off
  -> current implementation: switch.sonoff_relay_1
```

The meaning of the home did not change just because the electronics changed.

This is useful for much more than lights. BindHome can inventory and relate physical infrastructure such as:

- sockets and switches;
- light points;
- electrical panels and circuits;
- radiators, thermostats and valves;
- taps, manifolds and drains;
- Ethernet, telephone and antenna outlets;
- doors, windows and blinds;
- boilers, pumps and fixed equipment;
- any other physical element you want to identify independently from a particular smart device.

---

## The BindHome mental model

You only need four concepts to understand most of BindHome.

### 1. Asset — the stable physical thing

An **Asset** represents something that exists in the home independently from smart hardware.

Examples:

```text
Living room ceiling light
Kitchen socket 03
Heating circuit ground floor
Bedroom radiator
Network outlet office
```

An Asset has a stable BindHome identity and can reference a Home Assistant Area.

### 2. Capability — what the Asset can do

A **Capability** describes a logical function of the Asset.

Examples:

```text
on_off
temperature
setpoint
power_measurement
```

A ceiling light may have `on_off`. A radiator may have no smart capability yet. Both are valid Assets.

### 3. Binding — what implements that capability today

A **Binding** connects one Asset capability to the Home Assistant entity that currently implements it.

```text
Asset: Living room ceiling light
Capability: on_off
Binding: switch.shelly_living_room
```

Bindings are intentionally replaceable.

If the Shelly is replaced, the Asset does not need to be recreated:

```text
Asset: Living room ceiling light
Capability: on_off
Binding: switch.new_relay
```

### 4. Representation — how the Asset is exposed back to Home Assistant

A **Representation** is optional. It tells BindHome to expose an Asset as a stable logical Home Assistant entity.

For example:

```text
Physical Asset
  Living room ceiling light
        |
        +-- capability: on_off
        |
        +-- binding: switch.shelly_living_room
        |
        +-- representation: light
                       |
                       v
          light.living_room_ceiling_light
```

The logical entity represents the physical light, while the bound entity represents the replaceable hardware underneath it.

BindHome 1.0 implements the logical `light` Representation for Assets with the `on_off` capability.

---

## How you use BindHome

The intended workflow is progressive. You do **not** need to configure everything at once.

### Step 1 — Inventory the physical home

Start with what physically exists.

```text
Ground floor
└── Living room
    ├── Ceiling light
    ├── Socket 01
    ├── Socket 02
    ├── Radiator
    └── Ethernet outlet
```

BindHome reuses **Home Assistant Floors and Areas**. It does not maintain a second room catalogue.

This means location management stays where it already belongs: Home Assistant.

### Step 2 — Connect smart hardware where it exists

Some Assets are passive. Others already have Home Assistant entities.

```text
Ceiling light
  on_off -> switch.shelly_channel_0

Socket 01
  no smart hardware

Radiator
  no smart hardware yet
```

A missing Binding is not an error. It simply means that element is not currently connected to smart hardware.

### Step 3 — Describe topology when useful

Relations describe how physical infrastructure is connected.

Examples:

```text
Main panel
  feeds -> Lighting circuit

Lighting circuit
  feeds -> Living room ceiling light

Heating manifold
  feeds -> Bedroom radiator
```

Relations are generic directed links between Assets. They are useful for infrastructure navigation, diagnostics and future automation logic.

### Step 4 — Expose stable logical entities where useful

Not every Asset needs to become a Home Assistant entity.

Represent only the Assets where a stable logical entity provides value to dashboards, scripts or automations.

---

## A complete example

Imagine a physical ceiling light controlled by a Shelly relay.

### Initial state

```text
Asset
  name: Living room ceiling light
  type: light_point
  area: Living room
  capability: on_off

Binding
  on_off -> switch.shelly_living_room

Representation
  light
```

Home Assistant can then contain two different concepts:

```text
switch.shelly_living_room
  = current hardware implementation

light.living_room_ceiling_light
  = stable logical home object
```

A year later the Shelly fails and is replaced by another relay.

Only this changes:

```text
Binding
  on_off -> switch.new_relay
```

The Asset remains the same. Its identity, room, topology and logical Representation remain the same.

That separation is the core purpose of BindHome.

---

## First-run onboarding

BindHome 1.0 includes an onboarding flow for new installations.

When the Registry is empty, the panel guides the user through:

1. the difference between stable infrastructure and replaceable hardware;
2. Asset, Capability, Binding and Representation;
3. how BindHome reuses Home Assistant Floors and Areas;
4. starting the first room inventory.

Existing installations that already contain Assets do not receive the first-run walkthrough.

The onboarding can be skipped and is remembered per Home Assistant user/browser. It does not create sample Assets or modify the Registry automatically.

---

## What BindHome does not replace

BindHome is deliberately **not** a replacement for Home Assistant core registries.

Home Assistant remains the source of truth for:

- Devices;
- Entities;
- Areas;
- Floors;
- runtime state;
- integrations that communicate with hardware.

BindHome is the source of truth for the additional infrastructure model:

```text
Assets
Capabilities
Relations
Bindings
Representations
```

It does not duplicate the Home Assistant Device Registry or Entity Registry.

---

## BindHome 1.0

The first public release includes:

- first-run onboarding for new users;
- stable infrastructure Assets;
- Home Assistant Area references;
- generic Asset-to-Asset topology Relations;
- Asset Capabilities;
- capability-level hardware Bindings;
- explicit logical Representations;
- logical `light` entities for `on_off` Assets;
- dynamic entity reconciliation;
- room-based inventory and bulk creation presets;
- search and home navigation;
- human-oriented connection and topology workflows;
- an optional Advanced workspace for direct Registry operations;
- CRUD and query WebSocket APIs;
- Home Assistant actions;
- transactional Registry mutations;
- atomic persistent storage;
- fail-closed storage recovery;
- storage schema/version handling;
- administrator-only Registry backup and transactional restore;
- system health reporting;
- HACS-compatible release packaging and validation.

---

## Compatibility

**BindHome:** `1.0.0`

**Minimum Home Assistant:** `2026.8.0`

The compatibility floor is verified by CI rather than inferred from development history.

The complete BindHome Python suite passes against:

- Home Assistant `2026.8.0` — minimum supported release;
- Home Assistant `2026.9.0` — current stable release when BindHome 1.0 was prepared.

Home Assistant `2026.7.0` is not supported because the BindHome panel depends on `homeassistant.components.http.server.StaticPathConfig`, which is unavailable there.

The compatibility workflow continuously tests the minimum supported Home Assistant release and the current stable release.

---

## Installation with HACS

BindHome is designed to be installed and updated through HACS using tagged GitHub Releases.

For the initial public release:

1. Open **HACS**.
2. Open the HACS menu and choose **Custom repositories**.
3. Add `https://github.com/alessbarb/bindhome`.
4. Select **Integration** as the repository type.
5. Search for **BindHome** and install the latest release.
6. Restart Home Assistant.
7. Open **Settings -> Devices & services -> Add integration**.
8. Search for **BindHome** and add it.
9. Open the **BindHome** panel in the Home Assistant sidebar.
10. Follow the first-run onboarding and inventory one room.

BindHome supports one config entry per Home Assistant installation.

Published installations should use tagged releases rather than development branches.

---

## Updating

Use HACS to install newer BindHome releases.

For material upgrades, export a BindHome Registry backup first.

After updating:

1. restart Home Assistant;
2. confirm BindHome loads without errors;
3. verify the Registry and logical entities;
4. open the BindHome panel;
5. review system health if anything looks unexpected.

Do not manually edit Home Assistant `.storage` files during an upgrade or rollback.

See [Release process, upgrades and downgrades](docs/release.md).

---

## Registry reliability

BindHome treats the Registry as persistent infrastructure data, not as disposable UI state.

Every mutation follows the same transaction contract:

```text
stage isolated Registry
        |
        v
validate mutation
        |
        v
persist staged state atomically
        |
        v
adopt into the existing live Registry
        |
        v
emit Registry changed signal
```

If persistence fails:

- live Registry memory is not modified;
- the previous persisted Registry remains authoritative;
- no Registry-changed signal is emitted.

Startup also fails closed. Malformed, corrupt or unsupported storage is not silently replaced by an empty Registry.

---

## Backup and restore

BindHome exposes administrator-only WebSocket commands:

```text
bindhome/backup/export
bindhome/backup/restore
```

Backups contain the complete versioned BindHome Registry.

Restore validates the entire backup before persistence and uses the same transaction guarantees as normal Registry mutations.

See [Registry backup and restore](docs/backup-restore.md).

---

## Home Assistant actions

BindHome exposes actions for Registry maintenance, including:

```text
bindhome.create_asset
bindhome.update_asset
bindhome.delete_asset
bindhome.add_relation
bindhome.remove_relation
bindhome.set_binding
bindhome.remove_binding
bindhome.get_registry
```

`get_registry` is read-only and returns the serialized Registry.

Most normal users should use the BindHome panel. The actions and WebSocket APIs are useful for automation, administration, tooling and integration development.

---

## Design principles

BindHome follows a small set of rules:

1. **Infrastructure identities are stable.**
2. **Hardware identities are replaceable.**
3. **Home Assistant remains the source of truth for hardware and runtime state.**
4. **BindHome does not duplicate hardware inventory.**
5. **Bindings happen at capability level.**
6. **Representation is explicit.** Having a capability does not automatically create a logical HA entity.
7. **Passive Assets are valid.** Physical infrastructure does not need smart hardware to belong in BindHome.
8. **BindHome is installation-agnostic.** The integration contains no knowledge of a particular house.
9. **Persistent data is protected.** Registry writes and restores are transactional.
10. **Manual `.storage` editing is not part of the operating model.**

See [Architecture](docs/architecture.md) for the deeper technical model.

---

## Development

The Home Assistant custom integration lives under:

```text
custom_components/bindhome
```

The frontend source lives under:

```text
custom_components/bindhome/panel/frontend
```

Validation includes:

- Ruff lint and format checks;
- the complete Python test suite;
- Home Assistant compatibility testing;
- Hassfest;
- HACS publication validation;
- frontend type checking;
- frontend tests;
- production bundle verification;
- release metadata consistency checks.

---

## Releases

BindHome follows Semantic Versioning.

Public releases are immutable GitHub Releases tagged:

```text
vMAJOR.MINOR.PATCH
```

They are intended to be consumed through HACS.

See [Release process](docs/release.md).

---

## Issues and contributions

Bug reports and focused feature proposals are welcome through GitHub Issues.

When reporting a problem, include:

- BindHome version;
- Home Assistant version;
- relevant logs;
- the smallest reproducible Registry scenario when possible.

Do not include Home Assistant access tokens or other credentials.

---

## License

MIT
