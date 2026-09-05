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

## Installation

### Requirements

- Home Assistant `2026.8.0` or newer.
- HACS installed for the normal installation path.
- Administrator access to Home Assistant for setup and Registry backup/restore operations.

BindHome is a local custom integration. It does not require a cloud account and declares `local_push` as its Home Assistant IoT class.

### Install with HACS

BindHome is distributed as a standard HACS integration repository.

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
8. Search for **BindHome** and add it.

BindHome supports a single config entry. Once configured, the BindHome panel is registered in the Home Assistant sidebar.

### Updates

When a new stable GitHub Release is published, HACS can offer that version as an update.

The recommended upgrade path is:

```text
HACS update
  -> restart Home Assistant
  -> open BindHome
  -> verify System Health / Registry state
```

Back up the BindHome Registry before an important upgrade. See [Backup and restore](docs/backup-restore.md).

### Downgrade

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

The integration supports deterministic Registry backup/export and transactional restore through administrator-only WebSocket commands. A restore validates the complete backup before it replaces live state.

See [docs/backup-restore.md](docs/backup-restore.md) for the exact format and recovery procedure.

Key guarantee:

> If a Registry write fails, BindHome does not publish the staged change into live memory.

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
