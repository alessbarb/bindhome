# Assisted import proposal contract

BindHome assisted import is a review workflow over Home Assistant metadata. It is deliberately split into discovery, proposal review and transactional commit so that Home Assistant data is never mutated and no inferred physical model is committed silently.

This document defines the intermediate proposal contract shared by backend discovery, frontend review and the final commit step.

## Principles

1. Discovery is read-only. It may inspect Home Assistant Areas, Devices and Entities but does not write BindHome or Home Assistant state.
2. Every proposal remains a suggestion until a user explicitly chooses create, merge or skip.
3. Stable Home Assistant Entity Registry identity is preferred when available. Mutable `entity_id` is used only as the explicit fallback for state-machine-only entities.
4. Display metadata is not physical identity. Matching name, type and Area may suggest an existing Asset but never authorizes an automatic merge.
5. The accepted proposal set is materialized into commit-ready data first, then committed through one BindHome transaction.
6. The workflow can be rerun safely. Already-bound stable entities are recognized deterministically.

## Proposal model

Each `ImportProposal` contains four independent concerns.

### Source traceability

`ImportSource` retains the Home Assistant identities that produced the proposal:

- `area_id` when the source belongs to an Area;
- `device_id` when discovery grouped entities through a Device;
- current `entity_ids` for human-readable traceability;
- stable Entity Registry entry IDs when those entries exist.

The source descriptor is workflow metadata only. It is not persisted into the BindHome Registry schema.

### Candidate Asset

`ImportAssetCandidate` contains editable physical inventory data:

- name;
- `asset_type`;
- Area reference;
- proposed Capabilities.

Discovery may derive these values from Home Assistant names, domains, device classes or other safe metadata, but they remain editable suggestions. Custom Asset types and Capabilities remain valid.

### Candidate Bindings

Each `ImportBindingCandidate` describes one proposed `(capability, role) -> Home Assistant entity` connection. It carries both the current `entity_id` and stable Entity Registry identity when available.

A proposal may contain multiple Binding candidates when one physical Device exposes several relevant functions. The proposal Asset must declare every Capability used by its proposed Bindings.

### Duplicate analysis

`ImportDuplicateStatus` communicates evidence without silently deciding what the user wants:

- `new`: no existing overlap found;
- `already_bound`: at least one proposed entity target is already represented by an existing BindHome Binding;
- `possible_asset_match`: exactly one existing Asset has the same normalized display name, type and Area, but no stable Binding identity proves it is the same physical thing;
- `ambiguous`: multiple existing Assets match that advisory metadata.

`merge_candidate_asset_ids` identifies the existing Assets relevant to the status.

## Deterministic deduplication rules

### Registered entities

When a candidate has an Entity Registry identity, that stable ID is authoritative. An existing Binding with the same stable target makes the proposal `already_bound`, even if Home Assistant has renamed the entity since the Binding was stored.

The importer must not fall back to a historical `entity_id` when a stable Registry identity exists.

### State-machine-only entities

When both candidate and existing Binding lack Entity Registry identity, exact `entity_id` equality is the compatibility fallback.

### Existing Assets without matching Bindings

An exact case-insensitive name plus `asset_type` plus Area match is only a merge suggestion. It never creates, changes or merges an Asset automatically. One match produces `possible_asset_match`; multiple matches produce `ambiguous`.

This keeps physical identity a user decision rather than making display strings authoritative.

### Repeat import

A previously imported smart entity is normally detected on the next run because the committed Binding retains its stable Entity Registry target. The repeated proposal therefore returns `already_bound` and can be skipped or intentionally merged/reviewed without creating a duplicate Asset.

## Review outcomes

Every proposal requires an explicit review outcome.

### Create

The user accepts creation of a new Asset. The review surface submits the complete final `ImportAssetCandidate`, so rename, reclassification, Area correction and Capability editing all happen before commit. The user may also retain or remove proposed Binding candidates.

### Merge

The user selects an existing stable Asset ID. No new Asset is created; the accepted Binding candidates are applied to that chosen Asset during the later transactional commit step. A metadata match may be offered as a shortcut but does not select the target automatically.

### Skip

Nothing from that proposal enters the commit set.

`apply_import_decision()` converts a reviewed proposal plus explicit decision into `AcceptedImport` data without mutating either system. A skipped proposal materializes to no commit item.

## Ambiguous discovery

Discovery must not force every Home Assistant Device into one BindHome Asset. If a Device/Entity grouping could sensibly represent several physical Assets, discovery should emit separate proposals or mark the candidate for human review through deterministic candidate keys. The proposal contract supports multiple Binding candidates but does not infer topology or physical composition.

Examples that remain human decisions include:

- a multi-channel relay controlling several independent light points;
- a Device exposing control and measurement entities that may belong to different physical Assets;
- entities whose Home Assistant names are too generic to identify the physical object safely.

## Transaction boundary

The proposal layer never calls `BindHomeManager` mutation methods. The final import implementation must first validate the complete accepted set, then create/update Assets and Bindings inside one manager transaction using the normal Registry invariants.

If validation or persistence fails, no accepted proposal is partially committed.

The commit step must not modify Home Assistant Areas, Devices or Entities.

## API compatibility

Proposal IDs are deterministic workflow identifiers derived from Home Assistant source identities plus a discovery-provided candidate key. They are not persistent infrastructure identity and must not be used as Asset IDs.

The Python contract in `custom_components/bindhome/import_proposals.py` is the canonical shape for implementation work under #38. Backend discovery and frontend review should serialize that contract rather than defining parallel structures.

## Discovery implementation in v1.4

`bindhome/import/discover` implements the read-only discovery slice. It is administrator-only until the household-read authorization matrix explicitly classifies assisted-import metadata. It accepts an optional Home Assistant `area_id`; without one it scans the whole installation.

Discovery reads current Area, Device, Entity Registry and state-machine metadata and serializes the canonical proposal contract above. It never writes the BindHome Registry or Home Assistant registries.

### Conservative metadata mapping

The first implementation proposes capabilities only where Home Assistant metadata provides a reasonably stable meaning:

- `light`, `switch`, `fan` -> `on_off`;
- `cover`, `valve` -> `open_close`;
- `climate` -> `setpoint`;
- temperature sensors -> `temperature`;
- power sensors -> `power_measurement`;
- door/window/opening binary sensors -> `open_close`.

Unsupported metadata is not translated into an invented capability. Every mapping remains a proposal that the review step may rename, reclassify, merge or skip.

### Device grouping

Device-backed entities are grouped only while proposed `(capability, role)` keys remain non-conflicting. A Device exposing two switch channels therefore becomes two reviewable proposals instead of one Asset with two competing primary `on_off` Bindings. Non-conflicting functions can remain together. The human review step may explicitly merge proposals when that reflects the real physical installation.

### Stable identity and fallbacks

Entity Registry entry IDs are retained as the strong target identity. A Home Assistant entity rename updates the current `entity_id` without changing the stable proposal identity where Registry identity exists.

State-machine-only entities are included only during whole-installation discovery and use the explicit `entity_id` fallback defined by the contract. Discovery does not guess an Area for them.

The discovery response also includes the current BindHome Registry revision so the later reviewed commit can reject stale decisions through optimistic concurrency.
