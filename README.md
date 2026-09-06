# BindHome

**Current stable release: `1.4.2` · Home Assistant `2026.8.0+`**

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

An Asset represents something that belongs to the home itself.

Examples:

```text
Living room ceiling light
Kitchen socket 03
Main electrical panel
Bedroom radiator
Garden shut-off valve
Garage Ethernet outlet
```

An Asset has a stable identity that should not change when a smart device is replaced.

### 2. Capability — what the Asset can do

Capabilities describe logical functions of the Asset.

Examples:

```text
on_off
temperature
setpoint
power_measurement
```

A capability does **not** imply that Home Assistant currently has an entity for it.

A radiator may exist as an Asset with no smart hardware at all. A light point may have `on_off`, even if the current relay is temporarily missing.

### 3. Binding — what implements the capability today

A Binding connects a stable Asset capability to the Home Assistant entity that currently implements it.

```text
Living room ceiling light
  capability: on_off
  binding: switch.shelly_living_room
```

If the relay is replaced:

```text
Living room ceiling light
  capability: on_off
  binding: switch.new_relay
```

The Asset did not change. Only the Binding changed.

### 4. Representation — how BindHome exposes the Asset back to Home Assistant

A Representation is optional.

For example, an Asset representing a physical light point can be exposed as a stable logical Home Assistant light:

```text
Asset
  Living room ceiling light

Binding
  on_off -> switch.shelly_living_room

Representation
  light.living_room_ceiling_light
```

Automations can then target the stable logical light instead of the replaceable relay entity.

Not every Asset needs a Representation. Passive infrastructure such as junction boxes, drains or many sockets may only need to exist in the inventory and topology.

---

## Recommended workflow

BindHome is designed to be adopted progressively.

### Step 1 — Inventory the physical home

Start room by room and record what physically exists.

```text
Ground floor
  Living room
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

From **Home → room → element**, use **Logical light in Home Assistant → Create logical light** and confirm. The element needs `on_off` and a valid primary Binding. The current platform is exclusively `light`: backing lights retain the existing safely mirrored lighting capabilities; other domains expose ON/OFF only. The detail shows the actual logical entity resolved by Home Assistant, including user renames, and its current availability. Example entity IDs in this README are illustrative, not a naming contract.

Removing the logical light requires confirmation and preserves the physical element, its Bindings and hardware. Dashboards, automations or other connections referencing that logical entity may need adjustment. Read-only household users can inspect status but cannot create or remove it.

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

BindHome includes an onboarding flow for new installations.

When the Registry is empty, the panel guides the user through:

1. the difference between stable infrastructure and replaceable hardware;
2. Asset, Capability, Binding and Representation;
3. how BindHome reuses Home Assistant Floors and Areas;
4. the recommended first-room inventory workflow.

Completing the walkthrough opens **Casa**. From there the user can browse the home or move to **Añadir**, where both single-element and bulk room inventory are available.

Existing installations that already contain Assets do not receive the first-run walkthrough.

---

## BindHome 1.4.2

Version 1.4.2 is a distribution reliability hotfix. It keeps the 1.4.1 runtime, Registry schema and panel behavior, while changing stable HACS delivery to a dedicated, validated `bindhome.zip` GitHub Release asset.

The release package is built directly from `custom_components/bindhome`, places `manifest.json` at the ZIP root as HACS expects, and fails publication if the manifest, integration entry point or production panel bundle is missing or empty. This specifically hardens recovery from incomplete/truncated installation payloads without changing stored BindHome data.

No Registry migration is required. Registry schema remains v2, backup and CSV formats remain v1, and the minimum Home Assistant version remains `2026.8.0`.

See the [1.4.2 changelog](CHANGELOG.md#142---2026-09-06) for the complete hotfix notes.

---

## BindHome 1.4.1

Version 1.4.1 completes the panel experience over the capabilities already shipped in 1.4.0 and earlier.

| Workflow | Where to find it | What you can do |
| --- | --- | --- |
| Logical light | Home → room → element | Create/remove the existing Light Representation with confirmation; inspect its actual HA entity and availability. |
| Model health | Advanced → Maintenance | Review broken Bindings, missing connections, stale Areas, recovery and undocumented HA hardware; open the relevant repair workflow. |
| CSV inventory | Advanced → Maintenance | Export all Assets or one Floor/Area; validate a file, review row errors and preview changes before one transactional import. |
| Registry backup | Advanced → Maintenance | Download a complete backup, see the last export recorded for your HA user, inspect a restore and explicitly confirm full replacement. |
| Navigation | Panel header and URLs | Open the native HA sidebar, share direct links to views/elements and use browser Back/Forward. |
| Preferences | Authenticated HA user | Keep Advanced pinning, onboarding dismissal and collapsed Floors across browsers and devices. |

Enable **Advanced** to access administrative maintenance. Household readers retain Home/Search and status without mutation controls. Registry schema remains v2; the backup and CSV formats remain v1. The minimum HA version remains `2026.8.0`, with CI coverage for `2026.8.0` and `2026.9.0`.

See the [1.4.1 changelog](CHANGELOG.md#141---2026-09-06) for the complete release history and upgrade notes.

### Foundation shipped in 1.4.0

BindHome 1.4.0 makes the stable physical model substantially easier to maintain as a real Home Assistant installation evolves. Authenticated non-admin users can browse the intended household inventory in read-only mode, while mutations, recovery and administrative surfaces remain protected. Administrators gain assisted import from Home Assistant metadata, guided hardware replacement that preserves stable Asset/Representation identity, actionable integrity Repairs, and a deterministic CSV inventory round-trip contract.

The release also adds the `bindhome.resolve` response action for querying the current implementation of an Asset capability, formalizes ownership of logical Representation metadata versus Home Assistant user overrides, and improves Casa navigation with authoritative Floor/Area metadata, persistent collapsed Floors, clearer empty states and accessible refresh feedback. Registry schema remains v2 and the verified minimum Home Assistant release remains `2026.8.0`.

---

## Installation

### Requirements

- Home Assistant `2026.8.0` or newer.
- HACS installed for the normal installation path.
- Administrator access to Home Assistant for setup and Registry backup/restore operations.

BindHome is a local custom integration. It does not require a cloud account and declares `local_push` as its Home Assistant IoT class.

### Install with HACS

BindHome is distributed as a standard HACS integration repository. Stable tagged releases use the validated `bindhome.zip` release asset selected by `hacs.json`, rather than relying only on GitHub's generic source archive.

1. Open **HACS** in Home Assistant.
2. Open **Custom repositories**.
3. Add:

   ```text
   https://github.com/alessbarb/bindhome
   ```

4. Select **Integration** as the repository category.
5. Download BindHome.
6. Restart Home Assistant when HACS asks you to do so.
7. Go to **Settings → Devices & services → Add integration**.
8. Select **BindHome**. Home Assistant creates the single BindHome config entry immediately; there is no empty confirmation form to submit.

HACS installs the integration files, while Home Assistant remains responsible for the user-initiated config-entry creation step. Once configured, the BindHome panel is registered in the Home Assistant sidebar.

### Updates

When a new stable GitHub Release is published, HACS can offer that version as an update.

The recommended upgrade path is:

```text
HACS update
  -> restart Home Assistant
  -> open BindHome
  -> verify System Health / Registry state
```

For the 1.4.1 → 1.4.2 update, no Registry migration is required. Install 1.4.2 through HACS and restart Home Assistant; HACS will use the dedicated `bindhome.zip` asset. For the earlier 1.4.0 → 1.4.1 feature update, export a Registry backup first, then verify element detail and Advanced → Maintenance after restart. Back up the BindHome Registry before an important upgrade. See [Backup and restore](docs/backup-restore.md).

### Downgrade

Only select a release that can read the current Registry schema. Versions 1.4.0, 1.4.1 and 1.4.2 use schema v2; releases before 1.3.0 require a compatible historical backup rather than an in-place downgrade.

If a release causes a problem:

1. Export a BindHome Registry backup first if the integration is still operational.
2. In HACS, open BindHome and select a previous released version.
3. Restart Home Assistant.
4. Verify that the Registry loads and that logical Representations reconcile correctly.

Do not edit Home Assistant `.storage` files manually as a downgrade mechanism.

---

## Compatibility policy

The verified minimum Home Assistant release is declared in [`hacs.json`](hacs.json).

The project CI tests:

- the minimum supported Home Assistant release;
- the current stable Home Assistant release used by the development test environment;
- Python and frontend lint/type/test gates;
- HACS publication structure;
- release metadata consistency.

BindHome may use Home Assistant internal APIs that are appropriate for custom integrations but can change between Home Assistant releases. Compatibility is therefore tested explicitly instead of being assumed.

---

## Recovery and backups

BindHome Registry state is persistent and is deliberately treated as infrastructure data.

Administrators can use **Advanced → Maintenance → Backup and restore** to download a deterministic full Registry backup and review a restore before confirming complete replacement. The panel uses the existing administrator-only WebSocket contract; a restore validates the full backup before replacing live state. CSV inventory export is separate and does not back up Bindings, Relations or Representations.

See [docs/backup-restore.md](docs/backup-restore.md) for the exact format and recovery procedure.

Key guarantee:

> If a Registry write fails, BindHome does not publish the staged change into live memory.

---

## Diagnostics and support

When reporting a BindHome problem, use Home Assistant's **Download diagnostics** action for the BindHome config entry and attach that diagnostics file to the issue when it is relevant.

BindHome diagnostics are intentionally aggregated. They include the integration/storage/schema versions, config-entry state, Registry object counts and Binding resolver status counts. They do **not** export Asset names or codes, BindHome UUIDs, Home Assistant entity IDs, config-entry IDs or the Registry itself.

If Registry loading has failed closed, diagnostics remain useful where Home Assistant can invoke them: the recovery category is reported, while the stored error message and unsafe Registry contents are omitted. Registry backup/export remains a separate administrator operation and is never embedded in diagnostics.

---

## Safety model

BindHome separates physical infrastructure from Home Assistant runtime state. That distinction is intentional:

- Home Assistant remains the source of truth for Floors, Areas, Devices, Entities, service routing and live runtime state.
- BindHome owns stable Assets, Relations, Bindings and Representations.
- Binding an Asset does not transfer ownership of the underlying Home Assistant entity to BindHome.
- Removing or changing a Binding must not delete the Home Assistant device that implements it.

For home electrical, heating, gas, water-pressure or structural work, BindHome is documentation and automation infrastructure. It is not a substitute for electrical measurements, commissioning, certification or a qualified professional.

---

## Development

### Python

Create a development environment and install the project extras:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e '.[dev]'
```

Run the backend tests:

```bash
pytest
```

Run Ruff:

```bash
ruff check .
ruff format --check .
```

### Frontend

The editable frontend source lives in [`frontend/`](frontend/). The HACS-installed integration only contains the generated runtime bundle under `custom_components/bindhome/panel/static/`.

Install dependencies:

```bash
cd frontend
npm ci
```

Run type checks and tests:

```bash
npm run typecheck
npm test
```

Build the production bundle:

```bash
npm run build
```

The generated bundle is committed. CI rebuilds it and fails if the committed artifact differs from the current frontend source.

---

## Release process

BindHome follows Semantic Versioning.

A release requires all protected gates to pass before the version is tagged and published. The release checklist is documented in [docs/release.md](docs/release.md).

Stable releases are the normal HACS installation target. The default branch is development state and should not be treated as the rollback mechanism.

---

## Project status

BindHome is under active development. The stable public release line is intended for normal HACS installs, while new functionality lands through reviewed and tested releases.

The Registry schema and public behavior follow the migration, backup and compatibility policies documented in the repository.

---

## License

MIT — see [LICENSE](LICENSE).
