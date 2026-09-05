# Registry schema and migration policy

BindHome persists two independent version layers and they must not be treated as the same thing.

| Layer | Current value | Owner | Purpose |
| --- | ---: | --- | --- |
| Home Assistant storage envelope | `STORAGE_VERSION = 1` | Home Assistant `Store` | Version of the outer `.storage` envelope |
| BindHome Registry schema | `REGISTRY_SCHEMA_VERSION = 1` | BindHome | Shape and semantics of Assets, Relations, Bindings and Representations |

A storage-envelope incompatibility and a Registry-schema incompatibility are different failure conditions. Code, diagnostics and recovery flows should preserve that distinction.

## Supported Registry version policy

Registry payloads are classified before model parsing:

- **Supported historical schema**: migrated one version at a time through the explicit migration registry until the current schema is reached.
- **Current canonical schema**: validated and loaded without migration.
- **Historically accepted non-canonical current shape**: canonicalized explicitly outside the model parser, then validated as the current schema.
- **Unsupported future schema**: fails closed and is never rewritten by the older BindHome release.
- **Corrupt or invalid payload**: fails validation; migration code must not guess missing domain data or silently replace it with an empty Registry.

The real pre-version BindHome payload is treated as historical schema `v0`. Its migration to `v1` preserves the old implicit behavior where an Asset with `on_off` was exposed as a logical `light` by writing an explicit Representation. Early `v1` payloads that already declared `schema_version: 1` but predate the `representations` collection are canonicalized with the same deterministic rule.

`BindHomeRegistry.from_dict()` parses only the current canonical schema. Historical transformation belongs in `custom_components/bindhome/migrations.py` so ordinary model parsing cannot silently mutate persisted semantics.

## Migration rules

Every Registry schema bump must:

1. increment `REGISTRY_SCHEMA_VERSION` deliberately;
2. add a deterministic `vN -> vN+1` migration step;
3. add or retain a golden fixture for the historical input;
4. prove that supported historical payloads migrate to the new canonical schema;
5. prove that unsupported future payloads fail without a write;
6. prove that a failed migration does not replace or partially rewrite the persisted payload;
7. update backup/restore and downgrade guidance if compatibility changes.

CI contains a guard that compares the supported historical range with the registered stepwise migrations. Increasing the schema version without adding the required migration step therefore fails the test suite.

Startup migration uses the manager-independent validate-before-write persistence primitive established by the Registry transaction contract. The canonical payload is persisted only after the complete migrated Registry validates successfully.

## Backup restore

The backup envelope and the Registry schema inside it are versioned separately.

A backup with the current backup format may contain a supported historical Registry schema. Restore validates and migrates that Registry to the schema understood by the running BindHome release before it enters the live transaction.

A backup containing an unsupported future Registry schema remains invalid for an older BindHome release and must not be downgraded or rewritten heuristically.

## Downgrade safety

A code downgrade is safe only when the target BindHome release can read the Registry schema currently on disk.

Before installing a release that introduces a newer Registry schema, export and retain a backup created with the older compatible release. Do not assume that reinstalling older Python files makes newer storage readable.

If the current Registry was already written in a schema newer than the target release supports:

- **do not edit Home Assistant `.storage` manually**;
- do not repeatedly start the older release hoping it will downgrade the file;
- use a backup whose Registry schema is documented as readable by the target release and the supported BindHome recovery workflow;
- if the target release predates an in-product recovery path for an unloadable Registry, reinstall the newer compatible BindHome release rather than attempting an unsafe in-place downgrade.

Release notes for any future schema bump must state the new Registry schema version, whether the previous release can still read it, and the exact supported downgrade/recovery procedure.
