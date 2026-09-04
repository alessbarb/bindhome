# BindHome

**Stable infrastructure. Replaceable hardware.**

BindHome is a Home Assistant custom integration for modelling the stable physical infrastructure of a home independently from the smart hardware that currently controls or measures it.

A light point, socket, radiator, valve, circuit or network outlet can remain in the same place for decades while relays, sensors and other Home Assistant entities are replaced. BindHome gives the physical asset a stable identity and stores the current hardware binding separately.

```text
Living room ceiling light
    -> stable BindHome Asset
    -> capability: on_off
    -> current binding: switch.shelly_channel_0
```

Replace the relay and only the binding changes:

```text
Living room ceiling light
    -> same BindHome Asset
    -> capability: on_off
    -> current binding: switch.sonoff_relay
```

Automations and higher-level home logic can therefore depend on the home rather than on a specific piece of replaceable hardware.

## BindHome 1.0

BindHome 1.0 provides a stable first public foundation with:

- persistent infrastructure Assets with stable identities and optional Home Assistant Area references;
- generic Asset-to-Asset Relations for topology;
- capabilities attached to Assets;
- capability-level Bindings to replaceable Home Assistant entities;
- explicit logical Representations exposed back into Home Assistant;
- a logical `light` Representation for `on_off` Assets;
- dynamic logical entity reconciliation;
- transactional Registry mutations with atomic persistence;
- fail-closed startup and storage recovery behavior;
- versioned Registry storage and migration handling;
- administrator-only Registry backup and transactional restore;
- CRUD, query and backup/restore WebSocket APIs;
- Home Assistant actions for Registry maintenance;
- atomic bulk Asset creation;
- creation presets for high-volume inventory;
- a dedicated BindHome panel with room inventory, search, connection and topology workflows;
- system health counters;
- HACS-compatible packaging and release validation.

BindHome deliberately does **not** duplicate Home Assistant's Device Registry or Entity Registry. Home Assistant remains the source of truth for replaceable hardware; BindHome models the stable home infrastructure and the relationship between the two.

## Compatibility

**BindHome:** `1.0.0`

**Minimum Home Assistant:** `2026.4.0`

The minimum supported Home Assistant version is enforced by the repository compatibility matrix. The full Python suite is tested against supported monthly Home Assistant releases through the current stable release.

If the compatibility floor changes in a future BindHome release, it will be stated in the release notes and `hacs.json`.

## Installation with HACS

BindHome is intended to be installed and updated through HACS from GitHub Releases.

For the initial public release, add BindHome as a custom HACS repository:

1. Open **HACS** in Home Assistant.
2. Open the HACS menu and choose **Custom repositories**.
3. Add `https://github.com/alessbarb/bindhome`.
4. Select **Integration** as the repository type.
5. Search for **BindHome** in HACS and install the latest release.
6. Restart Home Assistant.
7. Open **Settings -> Devices & services -> Add integration**.
8. Search for **BindHome** and add it.

BindHome supports one config entry per Home Assistant installation.

Do not install a development branch into a production Home Assistant instance. Published installations should use tagged GitHub Releases.

## Updating

Use HACS to install newer BindHome releases. For material upgrades, export a BindHome Registry backup first.

After updating:

1. restart Home Assistant;
2. confirm BindHome loads without errors;
3. verify the Registry and logical entities;
4. open the BindHome panel;
5. review BindHome system health if anything looks unexpected.

Do not edit Home Assistant `.storage` files manually during an upgrade or rollback.

See [Release process, upgrades and downgrades](docs/release.md).

## Core model

### Asset

A stable piece of physical home infrastructure.

Examples include `electrical_panel`, `circuit`, `socket`, `light_point`, `radiator`, `valve` and `network_socket`.

### Relation

A topology edge between two Assets.

Examples include `feeds`, `protects`, `contains`, `connected_to` and `serves`.

### Capability

A logical function provided by an Asset.

Examples include `on_off`, `dimming`, `temperature`, `setpoint` and `power_measurement`.

### Binding

Maps one Asset capability to the Home Assistant entity that currently implements it.

Bindings are replaceable. Assets are stable.

### Representation

Describes whether and how BindHome exposes an Asset back into Home Assistant as a logical entity.

Representation is explicit and independent from Capability. An Asset may expose `on_off` without being represented as a Home Assistant Light.

BindHome 1.0 implements the logical `light` Representation for Assets with the `on_off` capability.

### Creation preset

UX metadata used to generate editable Asset drafts quickly during inventory.

Presets suggest an Asset type, display name and capabilities. They do not restrict custom Assets and do not automatically create Bindings or Representations.

## Registry reliability

Registry mutations follow a transactional contract:

```text
stage isolated Registry
        -> validate mutation
        -> persist staged state atomically
        -> adopt into the existing live Registry
        -> emit Registry changed signal
```

If persistence fails, the live Registry is not modified and no Registry-changed signal is emitted.

Startup also fails closed: malformed, corrupt or unsupported storage is not silently replaced by an empty Registry.

## Backup and restore

BindHome exposes administrator-only WebSocket commands:

- `bindhome/backup/export`
- `bindhome/backup/restore`

Backups use a deterministic, versioned envelope containing the complete BindHome Registry. Restore validates the complete backup before persistence and uses the same transactional commit guarantees as normal Registry mutations.

See [Registry backup and restore](docs/backup-restore.md).

## Home Assistant actions

BindHome exposes actions for creating and maintaining the Registry, including:

- `bindhome.create_asset`
- `bindhome.update_asset`
- `bindhome.delete_asset`
- `bindhome.add_relation`
- `bindhome.remove_relation`
- `bindhome.set_binding`
- `bindhome.remove_binding`
- `bindhome.get_registry`

`get_registry` is read-only and returns the serialized Registry.

## Architecture and principles

The main design principles are:

1. Infrastructure identities are stable.
2. Hardware identities are replaceable.
3. Home Assistant's Device Registry and Entity Registry remain the source of truth for hardware.
4. BindHome does not duplicate hardware inventory.
5. Bindings are made at capability level, not merely Asset level.
6. BindHome is generic and contains no installation-specific knowledge.
7. User-facing text may be translated, while code, identifiers, documentation, commits and development artifacts are written in English.
8. BindHome never requires manual editing of Home Assistant `.storage` files.

See [Architecture](docs/architecture.md) for more detail.

## Development

The repository contains the custom integration under:

```text
custom_components/bindhome
```

Validation includes:

- Ruff lint and format checks;
- the full Python test suite;
- a Home Assistant compatibility matrix;
- Hassfest;
- HACS validation;
- frontend type checking, tests and production-bundle verification;
- release metadata consistency checks.

Development deployments may copy the integration into a dedicated Home Assistant development instance, but this is separate from the supported public HACS installation path.

## Releases

BindHome follows Semantic Versioning. Public releases are immutable GitHub Releases tagged `vMAJOR.MINOR.PATCH` and are intended to be consumed through HACS.

See [Release process](docs/release.md).

## Issues and contributions

Bug reports and focused feature proposals are welcome through GitHub Issues. When reporting a problem, include the BindHome version, Home Assistant version, relevant logs and the smallest reproducible Registry scenario when possible. Do not include Home Assistant access tokens or other credentials.

## License

MIT
