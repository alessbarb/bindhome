# BindHome architecture

## Purpose

BindHome is a stable infrastructure abstraction layer for Home Assistant.

It separates the physical identity of the home from the replaceable hardware that currently controls or measures it.

```text
Stable physical Asset
        |
        +-- Capability
        |      |
        |      +-- Binding -> current Home Assistant entity
        |
        +-- Relation -> another Asset
        |
        +-- optional Representation -> stable logical HA entity
```

The core rule is simple: replacing smart hardware should normally change a Binding, not the identity of the physical thing being modelled.

The product positioning behind this architecture is recorded in [ADR 0001: the infrastructure model is the product core](adr/0001-product-positioning.md).

## Ownership boundary

Home Assistant remains authoritative for:

- Floors and Areas;
- Devices and Entities;
- entity state and availability;
- domains and entity platforms;
- supported features;
- services and service routing;
- integration-specific hardware behaviour.

BindHome owns only the additional infrastructure model:

- Assets;
- Capabilities;
- Relations;
- Bindings;
- Representations;
- inventory preset metadata.

BindHome does not maintain a parallel Device Registry, Entity Registry, Floor catalogue or Area catalogue. When Home Assistant already owns a concept, BindHome references or reads it instead of copying it.

## Core objects

### Asset

An Asset is a stable physical element of the home.

An Asset contains:

- immutable internal `id`;
- human-readable `name`;
- extensible `asset_type`;
- optional human code;
- optional Home Assistant `area_id`;
- zero or more extensible Capabilities.

Passive Assets are valid. An Asset does not need a Binding or Representation to exist.

### Capability

A Capability describes a function of an Asset from BindHome's point of view, for example `on_off`, `temperature`, `setpoint` or `power_measurement`.

Capabilities are extensible identifiers. BindHome deliberately does not maintain a static mapping between Capability names and Home Assistant domains.

### Binding

A Binding maps:

```text
Asset + Capability + Role -> Home Assistant entity_id
```

The Home Assistant entity is replaceable. Setting a new Binding for the same functional key changes the current implementation while preserving the Asset.

Binding targets may also be logical entities produced by BindHome Representations. BindHome-to-BindHome composition is allowed only when the resulting functional dependency graph remains acyclic. Cycle validation operates at `(asset_id, capability, role)` granularity.

Home Assistant's Entity Registry is authoritative for registered entity identity, but BindHome 1.1.x currently persists the mutable `entity_id` string in hardware Bindings. Renaming a bound entity in Home Assistant can therefore make that Binding stale until it is rebound. Stable Entity Registry target identity is planned in issue #31.

### Relation

A Relation is a directed link between two Assets.

Relation types are extensible identifiers. The core does not impose an electrical, plumbing, climate or network ontology. Direction is significant: `source -> target` is preserved by the model and query layer.

Relations are explicit and do not cascade-delete Assets, Bindings or Representations.

### Representation

A Representation is BindHome's explicit decision to expose an Asset back into Home Assistant as a stable logical entity.

Capability and Representation are separate concepts. An Asset may have `on_off` without being represented as a Home Assistant Light.

BindHome 1.x supports zero or one Representation per Asset. The implemented logical platform is currently `light`, which requires the BindHome `on_off` Capability.

Representation requirements describe BindHome's own implementation contract; they are not a compatibility catalogue for Home Assistant domains.

Removing a Representation removes the logical entity while preserving the physical Asset. Re-adding it restores the same stable logical identity derived from the Asset.

### Creation preset

Creation presets are read-only UX metadata used to generate editable Asset drafts during inventory.

A preset may suggest:

- a stable preset identifier;
- inventory group;
- `asset_type`;
- default name;
- Capabilities.

Presets are not backend enums or validation rules. They never create Bindings, Home Assistant entity references, Relations or Representations automatically.

## Registry and persistence

`BindHomeRegistry` is the canonical in-memory domain state. It serializes Assets, Relations, Bindings and Representations with an explicit Registry schema version.

Persistent storage uses Home Assistant's `Store` helper with atomic writes. Home Assistant `.storage` files are implementation details and must not be edited manually.

### Mutation transaction boundary

All manager mutations follow the same contract:

1. clone the live Registry into isolated staged state;
2. apply and validate the mutation against staged state;
3. persist the staged Registry;
4. only after persistence succeeds, adopt the staged collections into the existing live Registry object;
5. emit `SIGNAL_REGISTRY_CHANGED` after commit.

The identity of the live Registry object is preserved so long-lived resolvers and platform consumers remain attached to the canonical object.

If persistence fails, live RAM remains unchanged and no Registry-changed signal is emitted.

### Startup and recovery

Storage loading fails closed when persisted BindHome state is corrupt, unreadable or uses an unsupported storage/schema version. Unsafe persisted state is never silently replaced with an empty Registry.

Legacy Registry payloads that predate explicit Representations are validated and migrated to the canonical schema. The canonical form is persisted only after validation succeeds.

### Backup and restore

BindHome provides a versioned deterministic Registry backup envelope through administrator-only WebSocket commands:

- `bindhome/backup/export`;
- `bindhome/backup/restore`.

Restore is a validated full Registry replacement and uses the same persist-before-adopt transaction boundary as ordinary mutations.

See [Registry backup and restore](backup-restore.md).

## Binding resolver and runtime state

`resolver.py` translates a stable BindHome functional key into the current Home Assistant entity implementation:

```text
(asset_id, capability, role) -> Home Assistant entity_id
```

Resolution distinguishes configuration validity from runtime availability. A correctly configured entity that is temporarily `unavailable` is not treated as a broken Binding.

The read model exposes statuses such as:

- asset not found;
- capability not declared;
- binding not found;
- stale entity reference;
- runtime unavailable;
- runtime unknown;
- resolved.

Operations on logical BindHome entities resolve the current Binding and then delegate service execution to Home Assistant. Home Assistant remains responsible for actual domain behaviour and hardware communication.

## Query layer

`query.py` provides side-effect-free Registry reads and graph traversal.

It includes:

- Asset lookup/listing;
- incoming/outgoing Relations;
- deterministic traversal;
- reachability;
- shortest paths;
- Binding/resolver status aggregation.

Relation traversal treats types as identifiers rather than imposing domain semantics.

## Application surfaces

### WebSocket API

The BindHome panel primarily uses WebSocket commands.

Mutation surfaces include:

- Asset create, bulk create, update and delete;
- Relation create and delete;
- Binding set and delete;
- Representation set and delete;
- Registry backup restore.

Read surfaces include:

- Registry and Asset reads;
- Relation reads and graph traversal/path queries;
- Binding status;
- creation presets;
- Registry backup export.

### Home Assistant actions

Home Assistant actions expose selected Registry operations for automation and administrative tooling. The panel remains the preferred normal-user surface.

### System health

BindHome exposes system-health information for the Registry and its main object counts.

## Frontend architecture

The BindHome panel is a Lit 3 application bundled with esbuild. Development source, tests and Node.js tooling live at the repository root under:

```text
frontend
```

The HACS/runtime tree contains only the generated frontend artifact under:

```text
custom_components/bindhome/panel/static/bindhome-panel.js
```

CI rebuilds the bundle and fails if the committed runtime artifact differs from source.

### Human shell

The primary navigation is:

```text
Casa | Añadir | Buscar | Avanzado
```

Normal workflows present physical/home concepts. Technical identifiers and direct Registry controls are kept in the opt-in Advanced workspace.

Top-level views remain mounted while navigating so in-progress drafts and view state are not destroyed by ordinary navigation.

### First-run onboarding

An empty Registry triggers a guided onboarding overlay. It explains the stable-infrastructure model, the four core concepts, reuse of Home Assistant Floors/Areas and the recommended first-room inventory workflow.

The onboarding does not create sample data. It is skippable and remembered per Home Assistant user/browser. Existing installations with Assets do not receive it.

### Home Assistant data adapters

The panel reads Home Assistant Floors, Areas, Entity Registry and Device Registry data through Home Assistant WebSocket APIs. These values are presentation/runtime inputs and are not copied into a parallel BindHome registry.

### Inventory and editing

Room inventory uses Home Assistant Areas as location references and BindHome presets to generate editable local drafts. Accepted batches are persisted with one transactional `bindhome/assets/create_bulk` request.

Human editing preserves stable Asset identity. Hardware connection uses replacement-safe Binding operations rather than delete-before-set sequences.

Topology uses the same directed Relation objects as the backend and supports bounded search/navigation.

### Localization

Custom-integration translation resources live under `custom_components/bindhome/translations/`. `translations/en.json` contains the complete English runtime source and `translations/es.json` provides Spanish. This follows Home Assistant's custom-integration translation contract rather than relying on Core-only `strings.json` build processing.

Language changes update presentation without resetting mounted workflow state.

## Compatibility and release boundary

BindHome 1.x supports Home Assistant `2026.8.0` and newer compatible releases. CI tests the complete Python suite against the minimum supported Home Assistant version and the current stable release used for the release baseline.

Release metadata is synchronized across Python, Home Assistant manifest and frontend package metadata. HACS, Hassfest, Python, frontend and compatibility validation form the release gate.

See [Release process](release.md).

## Architectural non-goals

BindHome 1.x does not attempt to:

- replace Home Assistant Devices, Entities, Areas or Floors;
- infer physical topology automatically;
- infer a logical Representation from a Capability;
- maintain a Home Assistant domain/capability compatibility matrix;
- cascade-delete dependent infrastructure implicitly;
- edit Home Assistant `.storage` files directly;
- encode knowledge of one particular house.

See [Product contract](product-contract.md) for the user-facing behavioural rules built on these boundaries.
