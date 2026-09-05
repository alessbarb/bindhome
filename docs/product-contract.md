# BindHome product contract

This document defines the user-facing behaviour BindHome 1.x is expected to preserve.

It is normative: implementation details may change, but these ownership, identity and workflow rules should remain stable unless a release explicitly changes the contract.

## Product principle

BindHome models the stable physical and functional identity of a home independently from replaceable smart hardware.

It is not a parallel Home Assistant platform.

Home Assistant remains authoritative for:

- Floors and Areas;
- Devices and Entities;
- runtime state and availability;
- domains and entity platforms;
- supported features;
- services and service routing;
- integration-specific hardware behaviour.

BindHome owns only concepts that Home Assistant does not already provide for this purpose:

- stable physical Assets;
- extensible Capabilities;
- directed infrastructure Relations;
- replaceable hardware Bindings;
- explicit logical Representations;
- inventory preset metadata.

## Stable identity

### Asset

An Asset represents a physical element of the home.

The minimum valid Asset is:

- `name`;
- `asset_type`.

BindHome generates an immutable internal Asset ID. Name, code, Area, Capabilities and hardware connection may change without replacing that identity.

Passive Assets are valid. A radiator, socket or network outlet can be inventoried even when it has no smart hardware.

### Area

`area_id` is a reference to a Home Assistant Area.

BindHome must not maintain a second Area or Floor catalogue. Floor information is derived from Home Assistant through the referenced Area.

If an Area reference becomes stale, BindHome should surface that condition for repair rather than silently changing the Asset location.

### Capability

A Capability describes a function of an Asset from BindHome's point of view.

Capabilities are extensible identifiers. BindHome must not maintain a static compatibility table between Capability names and Home Assistant domains.

### Binding

A Binding maps a stable functional key to a Home Assistant entity target:

```text
Asset + Capability + Role -> stable Home Assistant Entity Registry identity
                           -> current entity_id at runtime
```

When the target is registered in Home Assistant's Entity Registry, BindHome persists that Registry entry identity as the authoritative target. The mutable `entity_id` remains stored as the last-known human-readable value, but it is not the identity of a registered target.

Renaming a registered entity in Home Assistant must not break or replace the Binding. BindHome resolves the current `entity_id` from the stable Registry entry and updates runtime consumers without requiring a BindHome Registry write.

If the stable Home Assistant Registry entry is deleted, the Binding becomes stale/unresolved. BindHome must not silently fall back to the old `entity_id`, even if another entity later reuses that string, and must not guess replacement hardware.

Entities that exist only in Home Assistant's state machine have no Entity Registry identity. For those explicit targets, `entity_id` remains the documented compatibility fallback.

Bindings are replaceable implementation references. Replacing a relay, sensor or other smart device changes the Binding target, not the Asset.

Changing an existing Binding must be replacement-safe: the new target is validated and committed without deleting the current Binding first.

BindHome-to-BindHome Binding composition is allowed when the dependency graph remains acyclic. Cycle validation operates at functional Binding-key granularity `(asset_id, capability, role)`.

Configuration validity and runtime availability are separate. A temporarily unavailable but correctly referenced Home Assistant entity is not automatically a broken BindHome configuration.

### Relation

A Relation is a directed link between two Assets.

Relation types are extensible identifiers. BindHome does not impose one universal ontology for electrical, water, climate, network or building infrastructure.

Relations are explicit. Deleting a Relation must not delete either Asset or cascade into unrelated Bindings or Representations.

### Representation

A Representation explicitly exposes an Asset back into Home Assistant as a stable logical entity.

Capability and Representation are different concepts. Having `on_off` does not automatically create a Home Assistant Light.

The current BindHome 1.x contract supports zero or one Representation per Asset. The implemented logical platform is currently `light`, which requires the BindHome `on_off` Capability; supported Representation platforms may expand across 1.x releases without changing the stable Asset identity rules.

Removing a Representation removes the logical entity while preserving the Asset. Re-adding the same Representation preserves the stable logical identity derived from the Asset.

## Normal user workflow

The intended lifecycle is progressive:

```text
Inventory -> Connect -> Topology -> Represent / Automate when useful
```

A user must be able to stop after Inventory. Smart hardware, topology and logical Home Assistant exposure are optional enrichments.

### First-run onboarding

A new installation with an empty Registry receives a short onboarding flow that explains:

1. stable infrastructure versus replaceable hardware;
2. Asset, Capability, Binding and Representation;
3. reuse of Home Assistant Floors and Areas;
4. the recommended first action: inventory one room.

The onboarding must not create sample Assets or mutate the Registry automatically.

It is skippable and remembered per Home Assistant user/browser. Installations that already contain Assets do not receive the first-run walkthrough.

### Inventory

Inventory records what physically exists before deciding how it is automated.

Room-oriented inventory should:

1. use Home Assistant Floors and Areas as location context;
2. allow common physical types to be added quickly;
3. generate editable drafts from BindHome presets;
4. allow names, codes and Capabilities to be corrected before save;
5. save accepted batches atomically.

Bulk inventory creation must not automatically create:

- Bindings;
- Relations;
- Representations;
- Home Assistant devices;
- automations.

### Creation presets

Built-in presets are convenience metadata for common home infrastructure.

They may suggest:

- `asset_type`;
- default display name;
- inventory group;
- Capabilities.

Presets are not backend enums or hidden validation rules. Custom Asset types and Capabilities remain valid.

There is no preset-specific persistence model: preset-generated drafts are saved through the ordinary Asset creation contracts.

### Add

The human Add workflow starts a fresh creation session each time.

When opened from a room, that Home Assistant Area may be preselected as context. Global Add must not retain a stale room or stale draft from a previous session.

### Browse and edit

Normal browsing is organized around the home rather than Registry internals.

Human editing may change:

- name;
- optional code;
- Home Assistant Area;
- supported human-editable metadata.

It must preserve the Asset ID.

A failed save keeps the draft available for correction. A successful write remains committed even if a subsequent refresh fails; the UI should report synchronization uncertainty rather than repeat the mutation.

### Connect

Connection management operates on declared Asset Capabilities.

The primary workflow supports Connect, Change and Disconnect against Home Assistant entities.

Candidate discovery may rank same-Area entities more highly, but Area must not become a validity rule. Disabled, hidden, registry-only or state-only Home Assistant entities may still be valid explicit choices when Home Assistant knows about them.

The UI must distinguish persisted Current connection from an unsaved Selected draft. For registered targets, the normal human UI displays the current Home Assistant entity name/`entity_id` resolved from the stable Entity Registry target rather than exposing or requiring the user to enter Registry entry IDs.

A Home Assistant rename must become visible through the same Binding without requiring a rebind. If the Registry entry is removed, the UI must represent that connection as stale instead of silently following another entity that happens to reuse the old `entity_id`.

### Topology

Topology is a human view of the same directed Relation objects stored in the Registry.

Users can inspect incoming and outgoing Relations, search for related Assets, create explicit Relations and delete exact Relations.

Missing or stale related Assets must not cause raw UUIDs to dominate the normal UX.

### Search

Search is a bounded human navigation tool over Assets. It should remain usable for large inventories and must not render an effectively unbounded result list.

## Normal and Advanced surfaces

The human shell is:

```text
Casa | Añadir | Buscar | Avanzado
```

Normal mode prioritizes:

- physical name;
- room;
- type;
- capabilities;
- connections;
- topology;
- status.

Raw Asset UUIDs, Binding IDs, stable Entity Registry target IDs, last-known entity IDs, Representation internals and direct Registry controls belong in Advanced/technical surfaces. Normal connection surfaces should show the current resolved Home Assistant identifier that users recognize.

Advanced mode is opt-in and its preference is remembered per Home Assistant user/browser.

Moving between top-level views should not destroy mounted drafts or unrelated view state.

## Transactional mutation contract

Registry mutation is persist-before-publish.

For every mutation:

1. stage isolated Registry state;
2. validate the complete requested change;
3. persist staged state atomically;
4. adopt it into the existing live Registry only after persistence succeeds;
5. notify runtime consumers after commit.

If validation or persistence fails:

- live Registry state remains unchanged;
- the previous persisted Registry remains authoritative;
- no Registry-changed signal is emitted.

Bulk creation is one transaction, not N independent client-side creates.

Home Assistant Entity Registry rename/removal events are read-side/runtime events, not BindHome Registry mutations. Following a registered target's current `entity_id` must not rewrite BindHome storage merely because the Home Assistant name changed.

## Destructive operations

BindHome must not silently cascade destructive changes.

Removing a Capability is blocked while active Bindings or a Representation still require it.

Deleting an Asset is blocked while it is referenced by active Bindings, Relations or a Representation.

The UI/API should explain blocking dependencies so the user can resolve them deliberately.

## Storage and recovery

The BindHome Registry is persistent infrastructure data.

Startup must fail closed if persisted state is corrupt, unreadable or uses an unsupported version. Unsafe persisted state must never be silently replaced by an empty Registry.

Legacy migrations are validated before canonical data is persisted.

Manual editing of Home Assistant `.storage` is outside the supported operating model.

## Backup and restore

Administrators can export and restore the complete Registry through the versioned BindHome backup contract.

Restore is a validated full replacement, not a merge, and uses the same transaction guarantees as normal Registry mutations.

Backups preserve the complete Binding target contract: the stable `entity_registry_id` when one exists plus the last-known/fallback `entity_id`. Historical `entity_id`-only data may be enriched to a stable identity only when the current Home Assistant Entity Registry proves an exact match; otherwise it remains an explicit fallback.

Backup payloads may legitimately contain Home Assistant entity references that later become stale; runtime resolution reports that condition separately and must not silently retarget them.

## Logical entity behaviour

A logical BindHome entity represents the stable Asset, while its Binding identifies the current implementation underneath it.

Replacing hardware should not require changing automations that target the stable logical entity when the Representation remains the same.

Renaming the currently bound registered Home Assistant entity also must not require changing the BindHome logical entity or Binding. Logical runtime consumers follow the stable Binding target to its current `entity_id`.

Logical operations resolve the current Binding and delegate execution to Home Assistant services. Home Assistant remains responsible for actual platform and hardware behaviour.

## Compatibility contract

A BindHome release declares a minimum supported Home Assistant version in `hacs.json`.

The minimum must be demonstrated by the complete compatibility suite, not inferred from development history.

The BindHome 1.x compatibility baseline starts at Home Assistant `2026.8.0`. A later 1.x release may raise the declared minimum only through an explicit release metadata change backed by compatibility validation. CI covers both the declared minimum supported release and the current stable release used for the release baseline.

## Explicit non-goals for 1.x

BindHome 1.x does not promise:

- automatic topology discovery;
- automatic Representation creation from Capabilities;
- a second Home Assistant Device/Entity/Area/Floor registry;
- hidden destructive cascades;
- a domain/capability compatibility matrix maintained by BindHome;
- direct `.storage` manipulation;
- house-specific configuration embedded in the integration.

Future features may extend workflows, visualization, Representation platforms or import/export UX, but they must preserve the ownership and stable-identity rules above unless a versioned product-contract change explicitly says otherwise.
