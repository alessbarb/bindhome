# Changelog

All notable changes to BindHome are documented in this file.

The format follows the principles of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows [Semantic Versioning](https://semver.org/).

## How this changelog is maintained

- User-visible features, behavior changes, compatibility changes, reliability work, migrations and meaningful fixes are added to **Unreleased** in the same PR that introduces them.
- Entries describe the effect on users or maintainers rather than individual commits.
- Relevant pull requests are linked so a changelog entry can be traced back to its design, tests and acceptance evidence.
- Pure refactors, generated bundles and documentation-only corrections may be omitted unless they materially affect operation, compatibility or the release process.
- At release time, the contents of **Unreleased** are moved under the released version and release date, then a fresh empty **Unreleased** section is kept at the top.

The preferred categories are **Added**, **Changed**, **Fixed**, **Reliability**, **Compatibility**, **Security**, **Deprecated**, **Removed** and **Distribution**. Only categories that contain entries need to be present.

---

## [Unreleased]

### Added

- Asset detail now manages the existing logical Representation contract directly: administrators can expose or withdraw the stable light entity, see its public Home Assistant entity identity, understand the required on/off Binding and capability fidelity, and are warned when non-light hardware can carry only safe ON/OFF semantics. ([#101](https://github.com/alessbarb/bindhome/issues/101))
- Advanced Maintenance now includes a first-class model health surface for Binding status, stale Areas, declared capabilities without Bindings, Registry recovery and undocumented Home Assistant hardware discovered through the existing assisted-import engine; actionable findings route into the supported remediation workflows. ([#100](https://github.com/alessbarb/bindhome/issues/100))

### Changed

- Advanced Maintenance now exposes the existing Registry backup/recovery contract: administrators can download a deterministic backup, see when they last exported one, inspect recovery mode, review backup contents and restore only after an explicit full-Registry overwrite confirmation. ([#99](https://github.com/alessbarb/bindhome/issues/99))
- Advanced Maintenance now exposes the existing transactional CSV inventory round-trip: administrators can export the whole Registry, one Floor or one Area, validate edited CSV files with row-level errors and preview creates/updates before committing the complete batch against the validated Registry revision. ([#98](https://github.com/alessbarb/bindhome/issues/98))
- The BindHome header now exposes Home Assistant's native sidebar menu control, letting phone/narrow layouts and desktop setups with an always-hidden docked sidebar open HA navigation using the platform's own context, kiosk and notification semantics. ([#115](https://github.com/alessbarb/bindhome/issues/115))
- Panel preferences for Advanced pinning, onboarding dismissal and collapsed Floors now persist in Home Assistant per-user frontend data so they follow the authenticated user across browsers and devices; existing browser-local values migrate once when the server preference is unset, and explicit user changes cannot be overwritten by a late asynchronous restore. ([#113](https://github.com/alessbarb/bindhome/issues/113))
- BindHome panel views now have canonical URLs with deep-linkable Home/Area/Asset, Add, Search and Advanced routes; browser history and search query state stay synchronized without remounting active workflows. ([#109](https://github.com/alessbarb/bindhome/issues/109))

---

## [1.4.0] - 2026-09-06

Maintenance-focused release that turns the stable BindHome model into something easier to inspect, populate, repair and rebind as Home Assistant hardware changes.

**Minimum Home Assistant:** `2026.8.0`

### Added

- Authenticated non-admin users can open BindHome in a read-only household mode. Intended inventory, topology and Binding status reads are available without administrator privileges, while mutations, backup/recovery and administrative internals remain admin-only and write controls are hidden from read-only users. ([#34](https://github.com/alessbarb/bindhome/issues/34))
- Added the `bindhome.resolve` Home Assistant response action. Callers can resolve an Asset capability/role to structured status, current entity, configuration validity, runtime availability and state without depending on BindHome internals. ([#37](https://github.com/alessbarb/bindhome/issues/37))
- Added assisted import from Home Assistant metadata with deterministic proposals, stable Entity Registry identity, conservative duplicate detection, explicit create/merge/skip review and one atomic commit for the reviewed batch. The panel exposes the complete review workflow without mutating Home Assistant devices or entities. ([#38](https://github.com/alessbarb/bindhome/issues/38), [#55](https://github.com/alessbarb/bindhome/issues/55), [#84](https://github.com/alessbarb/bindhome/issues/84), [#85](https://github.com/alessbarb/bindhome/issues/85), [#86](https://github.com/alessbarb/bindhome/issues/86))
- Added actionable Home Assistant Repairs for stale Asset Areas and broken Binding targets. Issues are grouped, avoid runtime-unavailable false positives, follow stable Entity Registry renames and clear automatically when the underlying condition is repaired. ([#47](https://github.com/alessbarb/bindhome/issues/47))
- Added a deterministic, versioned CSV inventory round-trip contract for Assets, including stable/human Area references, row-level validation, create/update semantics and transaction-safe import through administrator WebSocket commands. Bindings and topology remain outside the CSV format. ([#48](https://github.com/alessbarb/bindhome/issues/48))

### Changed

- Existing Bindings now have a guided hardware-replacement workflow: compatible candidates are reviewed explicitly and revalidated immediately before the atomic replacement, preserving the Asset, topology and logical Representation while leaving the old Home Assistant hardware untouched. ([#39](https://github.com/alessbarb/bindhome/issues/39))
- Logical Representation metadata ownership is explicit: BindHome keeps integration-provided original identity and physical Area aligned with the Asset while preserving Home Assistant user overrides such as custom entity name, `entity_id`, icon, aliases and labels. ([#44](https://github.com/alessbarb/bindhome/issues/44))
- Casa navigation now follows Home Assistant Floor/Area icons where configured, persists collapsed Floor state, exposes clearer child counts and empty-room actions, keeps selection accessible, and gives refresh an explicit loading/disabled state. ([#46](https://github.com/alessbarb/bindhome/issues/46))

### Reliability

- Assisted import and hardware replacement reuse the existing Registry transaction boundary and stable Binding target identity, so validation/storage failure cannot partially adopt a reviewed batch or replace the live Binding.
- Integrity Repairs are event-driven rather than polled and distinguish broken configuration from temporarily unavailable runtime state.

### Distribution

- Version promoted to `1.4.0` across Python, Home Assistant and frontend package metadata.

---

## [1.3.0] - 2026-09-06

Third feature release focused on stable Binding identity, event-driven logical Representations, live multi-session Registry synchronization and frontend runtime reliability.

**Minimum Home Assistant:** `2026.8.0`

### Changed

- Logical `light` Representations now mirror supported Home Assistant light capabilities from their current backing `light` entity, including brightness/color metadata and supported transition/effect features, while non-light targets remain ON/OFF-only. Light service parameters are forwarded to backing lights, rebinding refreshes advertised capabilities without changing logical identity, and unresolved or unavailable commands now raise a visible Home Assistant error instead of succeeding as silent no-ops. ([#30](https://github.com/alessbarb/bindhome/issues/30))
- Stable Binding target identity is now reflected consistently across backup/restore, typed frontend contracts, Advanced infrastructure inspection and the normative architecture/product documentation. Normal connection UI continues to show the current resolved Home Assistant `entity_id`, while technical surfaces can inspect the stable Entity Registry entry identity and last-known fallback. ([#53](https://github.com/alessbarb/bindhome/issues/53))

### Reliability

- The panel now follows committed BindHome Registry changes through a live WebSocket subscription instead of manual refresh or polling. A runtime-only monotonic revision lets the first-party panel attach optimistic-concurrency preconditions to mutations, reject stale writes before persistence, refresh other open sessions deterministically and offer a localized reload path after conflicts. The revision is not persisted and legacy callers that do not opt into revision preconditions retain their previous mutation contract. ([#35](https://github.com/alessbarb/bindhome/issues/35), [#80](https://github.com/alessbarb/bindhome/pull/80))

- BindHome custom-element registration is now idempotent across repeated panel bundle evaluation in the same browser tab. All production `bindhome-*` Web Components use one guarded registration helper, preventing cache-busted or reloaded bundles from aborting with a duplicate `CustomElementRegistry` definition error. ([#77](https://github.com/alessbarb/bindhome/issues/77))
- The BindHome panel now keeps Home Assistant's high-frequency `hass` updates local to the active top-level view. Inactive Home, Add and Advanced views retain their mounted UI state without receiving routine state-machine churn, reducing unnecessary frontend work while preserving drafts and navigation state. ([#76](https://github.com/alessbarb/bindhome/pull/76))
- Bound Entity Registry targets now follow Home Assistant entity renames and removals at runtime without rewriting BindHome storage. Renames move logical Representation subscriptions to the current `entity_id`, removals become stale immediately, unrelated Registry events are ignored, and config-entry unload removes every listener cleanly. ([#52](https://github.com/alessbarb/bindhome/issues/52))
- Binding resolution now treats persisted Home Assistant Entity Registry entry identity as authoritative, resolving the current `entity_id` at read time so normal HA renames stay transparent. Removed Registry entries fail stale without falling back to a potentially reused entity name; state-machine-only targets retain the explicit `entity_id` fallback. ([#51](https://github.com/alessbarb/bindhome/issues/51))
- Logical `light` Representations now follow backing-entity state changes through Home Assistant events instead of periodic polling. Rebinding moves the listener to the new target, unavailable/removed states update promptly, and entity removal cleans listeners without duplication. ([#29](https://github.com/alessbarb/bindhome/issues/29))
- Registry schema v2 adds stable Home Assistant Entity Registry identity to persisted Bindings while retaining `entity_id` as the last-known/state-machine fallback. v1 data and backups migrate deterministically, exact registered targets are enriched before canonical persistence, and unresolved targets are never guessed or silently rebound. ([#50](https://github.com/alessbarb/bindhome/issues/50))

### Compatibility

- BindHome 1.3.0 persists Registry schema v2 so registered Binding targets can retain stable Home Assistant Entity Registry identity across `entity_id` renames. Existing schema-v1 data migrates deterministically on upgrade. After 1.3.0 has written schema v2, BindHome 1.2.0 cannot read that Registry in place; a controlled downgrade requires restoring a compatible schema-v1 backup through the supported recovery path rather than editing Home Assistant `.storage` manually. ([#50](https://github.com/alessbarb/bindhome/issues/50))

### Distribution

- Version promoted to `1.3.0` across Python, Home Assistant and frontend package metadata.

---

## [1.2.0] - 2026-09-05

Second feature release focused on Registry durability, explicit migration and recovery paths, privacy-preserving diagnostics, localization parity and stronger frontend/backend development safety.

**Minimum Home Assistant:** `2026.8.0`

### Added

- Added privacy-preserving Home Assistant config-entry diagnostics with integration/storage/schema versions, aggregate Registry counts, aggregate Binding resolver statuses and fail-closed recovery context without exporting Registry contents or stable/hardware identifiers. ([#67](https://github.com/alessbarb/bindhome/pull/67))

### Changed

- Home Assistant-facing English and Spanish translations now have enforced key and placeholder parity across config flow, services, system health, Repairs and panel resources; system health also covers Representations, and frontend localization preserves unresolved optional placeholders. ([#66](https://github.com/alessbarb/bindhome/pull/66))
- Registry multi-step mutations now have a supported public `BindHomeManager.transaction()` boundary. Backup restore and dependency-aware Asset deletion use that API instead of reaching into private manager locking/staging/commit internals. ([#62](https://github.com/alessbarb/bindhome/pull/62))
- Registry schema evolution now uses an explicit stepwise migration layer separate from current-schema model parsing. The real pre-version Registry payload and early schema-v1 payloads that predate explicit Representations are migrated/canonicalized to the current v1 schema without introducing a fake schema bump. ([#63](https://github.com/alessbarb/bindhome/pull/63))
- Frontend CI now typechecks the production JavaScript source with TypeScript `checkJs`, including the runtime `(key, variables?)` localizer contract and a regression test proving invalid JSDoc assignments fail the gate. ([#64](https://github.com/alessbarb/bindhome/pull/64))

### Reliability

- Registry load failures now enter an explicit fail-closed recovery state with a critical Home Assistant Repair. Administrators can validate and restore a BindHome backup directly to storage even when the normal manager cannot load; successful restore reloads the config entry instead of requiring manual `.storage` edits. ([#65](https://github.com/alessbarb/bindhome/pull/65))
- Same-task nested manager mutations inside an open Registry transaction now fail immediately with an explicit transaction error instead of being able to deadlock on a non-reentrant `asyncio.Lock`; concurrent mutations from different tasks continue to serialize normally. ([#62](https://github.com/alessbarb/bindhome/pull/62))
- Staged Registry state is revalidated before persistence, and the manager-independent store write path now validates canonical state before touching Home Assistant storage, giving future startup migrations a documented validate-before-write persistence primitive. ([#62](https://github.com/alessbarb/bindhome/pull/62))
- Live Registry adoption derives its persisted collection set from the Registry serialization contract instead of maintaining a separate hand-written list, so future persisted collections cannot be silently omitted; new persisted fields without collection semantics fail closed until explicitly handled. ([#62](https://github.com/alessbarb/bindhome/pull/62))
- Unsupported future Registry schemas fail closed without rewrite, while supported historical Registry schemas—including schemas contained in compatible backup envelopes—are migrated only through explicit validated steps. Golden fixtures and CI require a complete migration path whenever `REGISTRY_SCHEMA_VERSION` is raised. ([#63](https://github.com/alessbarb/bindhome/pull/63))

### Distribution

- Version promoted to `1.2.0` across Python, Home Assistant and frontend package metadata.

---

## [1.1.1] - 2026-09-05

Patch release correcting BindHome's Home Assistant integration classification.

**Minimum Home Assistant:** `2026.8.0`

### Fixed

- BindHome is now declared as a `hub` integration instead of a `helper`. It therefore belongs under **Settings → Devices & services → Integrations**, rather than the Helpers screen. The previous helper classification caused Home Assistant to offer a helper-edit/options flow that BindHome does not implement, producing `Invalid handler specified` when the BindHome row was opened.
- Existing BindHome config entries, Registry storage, Assets, Relations, Bindings and Representations are unchanged by this metadata correction.

### Distribution

- Version promoted to `1.1.1` across Python, Home Assistant and frontend package metadata.

---

## [1.1.0] - 2026-09-05

First feature update after the public 1.0 release, focused on making the normal human workflow faster and safer.

**Minimum Home Assistant:** `2026.8.0`

### Added

- `Añadir` now offers both single-element creation and **bulk room inventory** in the normal human flow, reusing the existing atomic room workflow rather than introducing a second bulk-save path. ([#24](https://github.com/alessbarb/bindhome/pull/24))
- Added administrator-only **safe Asset deletion** with an authoritative impact preview before confirmation. The operation removes BindHome-owned Relations, owned Bindings, dependent BindHome-to-BindHome Bindings and the optional logical Representation in one transaction before the strict final Asset deletion. ([#24](https://github.com/alessbarb/bindhome/pull/24))
- Floor groups in **Casa** can now be collapsed and expanded to reduce vertical space when browsing larger homes. ([#24](https://github.com/alessbarb/bindhome/pull/24))

### Changed

- The Home Assistant config flow is now one-click after selecting BindHome: the single config entry is created immediately instead of displaying an empty confirmation form. HACS still installs the integration separately from Home Assistant config-entry creation. ([#24](https://github.com/alessbarb/bindhome/pull/24))
- Completing first-run onboarding now lands in **Casa** instead of automatically opening `Añadir`. ([#24](https://github.com/alessbarb/bindhome/pull/24))

### Reliability

- Human deletion fails closed: persistence occurs before live Registry adoption, storage failure leaves live state unchanged, and the existing strict Asset-delete invariant remains the final guard against future unhandled reference types. ([#24](https://github.com/alessbarb/bindhome/pull/24))
- Deleting a BindHome Asset never deletes the physical Home Assistant Device or external Entity used as hardware. When a BindHome-owned logical Representation is removed, the UI explicitly warns that external dashboards, scripts or automations referencing that logical entity may require adjustment. ([#24](https://github.com/alessbarb/bindhome/pull/24))

### Distribution

- Version promoted to `1.1.0` across Python, Home Assistant and frontend package metadata. ([#24](https://github.com/alessbarb/bindhome/pull/24))
- Dependabot upgraded the frontend bundler **esbuild** from `0.25.12` to `0.28.2`. ([#21](https://github.com/alessbarb/bindhome/pull/21))
- Dependabot upgraded the frontend typechecker **TypeScript** from `5.9.2` to `7.0.2`. ([#22](https://github.com/alessbarb/bindhome/pull/22))

---

## [1.0.0] - 2026-09-04

First public BindHome release.

**Minimum Home Assistant:** `2026.8.0`

### Added

- Stable physical **Assets** with Home Assistant Area references and extensible Capabilities.
- Directed Asset-to-Asset **Relations** for physical topology.
- Capability-level **Bindings** to replaceable Home Assistant entities.
- Explicit optional **Representations**, including stable logical `light` entities for Assets with an `on_off` capability.
- Dynamic reconciliation of logical Home Assistant entities when BindHome Registry state changes. ([#5](https://github.com/alessbarb/bindhome/pull/5), [#9](https://github.com/alessbarb/bindhome/pull/9))
- Home Assistant actions and CRUD/query WebSocket APIs for Registry operations.
- Atomic bulk Asset creation for room inventory. ([#8](https://github.com/alessbarb/bindhome/pull/8))
- Built-in extensible creation presets for electrical, network, climate, water, building and equipment inventory. ([#10](https://github.com/alessbarb/bindhome/pull/10))
- Room-oriented inventory workflow using Home Assistant Floors and Areas as the location source of truth. ([#12](https://github.com/alessbarb/bindhome/pull/12))
- Physical inventory browser and stable Asset editing without replacing Asset identity. ([#13](https://github.com/alessbarb/bindhome/pull/13))
- Search-first primary Binding workflow with Connect, Change and Disconnect operations. ([#14](https://github.com/alessbarb/bindhome/pull/14))
- Human topology browsing, relation creation/deletion and one-hop topology explorer. ([#15](https://github.com/alessbarb/bindhome/pull/15))
- Human-first `Casa | Añadir | Buscar | Avanzado` application shell, with Advanced mode opt-in and persisted per Home Assistant user/browser. ([#16](https://github.com/alessbarb/bindhome/pull/16))
- First-run onboarding for empty Registries explaining stable infrastructure, replaceable hardware, Asset → Capability → Binding → Representation and the recommended first-room inventory flow. ([#20](https://github.com/alessbarb/bindhome/pull/20))
- English and Spanish panel/onboarding localization.
- Administrator-only deterministic Registry backup/export and transactional full restore. ([#19](https://github.com/alessbarb/bindhome/pull/19))
- BindHome system health reporting.

### Changed

- Home Assistant is explicitly the source of truth for Floors, Areas, Devices, Entities, runtime states, domains and service routing; BindHome owns only its stable infrastructure model. ([#6](https://github.com/alessbarb/bindhome/pull/6), [#7](https://github.com/alessbarb/bindhome/pull/7))
- Logical operations delegate through Home Assistant services instead of maintaining a duplicate domain/capability compatibility catalogue. ([#6](https://github.com/alessbarb/bindhome/pull/6))
- Representation semantics are explicit: an Asset capability no longer implicitly means a Home Assistant entity must exist. ([#9](https://github.com/alessbarb/bindhome/pull/9))
- Custom panel resource URLs are content-versioned so Home Assistant/browser caching cannot keep an obsolete frontend bundle active after deployment. ([#13](https://github.com/alessbarb/bindhome/pull/13))
- The public README now documents the BindHome mental model, progressive Inventory → Connect → Topology → Represent workflow, HACS installation, compatibility and recovery expectations. ([#20](https://github.com/alessbarb/bindhome/pull/20))

### Fixed

- Fixed Home Assistant custom-panel registration so the BindHome sidebar panel receives the configuration shape expected by Home Assistant. ([#2](https://github.com/alessbarb/bindhome/pull/2))
- Fixed production Lit template corruption caused by post-processing significant whitespace in the generated frontend bundle. ([#3](https://github.com/alessbarb/bindhome/pull/3))
- Fixed logical light color-mode declaration for Home Assistant runtime compatibility. ([#4](https://github.com/alessbarb/bindhome/pull/4))
- Hardened asynchronous frontend workflows so stale saves, refreshes and navigation completions cannot contaminate a different Asset or draft session. ([#14](https://github.com/alessbarb/bindhome/pull/14), [#15](https://github.com/alessbarb/bindhome/pull/15), [#16](https://github.com/alessbarb/bindhome/pull/16))
- First-run onboarding is rendered over the existing shell rather than replacing it, preserving mounted views and active draft state. ([#20](https://github.com/alessbarb/bindhome/pull/20))

### Reliability

- All Registry mutations use one staged **validate → persist → adopt → notify** transaction boundary. Persistence failures leave live RAM unchanged and emit no Registry-changed signal. ([#17](https://github.com/alessbarb/bindhome/pull/17))
- Persistent writes use atomic Home Assistant storage and surface underlying serialization/write failures instead of publishing unpersisted state. ([#17](https://github.com/alessbarb/bindhome/pull/17))
- Live `BindHomeRegistry` object identity is preserved across successful commits so existing runtime consumers and resolvers remain attached to the canonical Registry. ([#17](https://github.com/alessbarb/bindhome/pull/17))
- Startup fails closed for corrupt, unreadable or unsupported Registry storage rather than silently replacing unsafe persisted state with an empty Registry. ([#18](https://github.com/alessbarb/bindhome/pull/18))
- Legacy persisted Registries are validated, migrated to the canonical schema and durably rewritten only after successful validation. ([#18](https://github.com/alessbarb/bindhome/pull/18))
- Backup restore validates the complete Registry before persistence and uses the same transaction guarantees as ordinary mutations. ([#19](https://github.com/alessbarb/bindhome/pull/19))

### Compatibility

- Development and CI tooling was aligned with Python 3.14 and the Home Assistant test environment. ([#1](https://github.com/alessbarb/bindhome/pull/1))
- Home Assistant `2026.8.0` is the verified minimum supported release.
- Home Assistant `2026.9.0` is covered by the release compatibility matrix.
- Home Assistant `2026.7.0` and older are not supported because the BindHome panel requires `homeassistant.components.http.server.StaticPathConfig`.
- BindHome-to-BindHome functional composition is supported when acyclic; true Binding cycles are rejected using capability/role identity rather than coarse Asset-level detection. ([#14](https://github.com/alessbarb/bindhome/pull/14))

### Distribution

- Stable GitHub Releases are published automatically from the exact green `main` commit after all protected release gates pass. ([#23](https://github.com/alessbarb/bindhome/pull/23))
- Version promoted to `1.0.0` across Python, Home Assistant and frontend package metadata. ([#20](https://github.com/alessbarb/bindhome/pull/20))
- Added HACS repository metadata, brand asset and automatic HACS publication validation. ([#20](https://github.com/alessbarb/bindhome/pull/20))
- Added permanent Home Assistant compatibility CI for the supported floor and current stable release. ([#20](https://github.com/alessbarb/bindhome/pull/20))
- Added release metadata consistency validation so Python, manifest and frontend versions cannot drift unnoticed. ([#20](https://github.com/alessbarb/bindhome/pull/20))
- Development-only frontend source, tests and Node.js tooling now live outside `custom_components/bindhome`, leaving the HACS-installed integration with only the generated runtime bundle. ([#20](https://github.com/alessbarb/bindhome/pull/20))
- GitHub Actions use the current Node 24-based official action generations, and Dependabot tracks GitHub Actions, Python and frontend npm dependencies weekly. ([#20](https://github.com/alessbarb/bindhome/pull/20))
- Added documented installation, upgrade, downgrade, backup and release procedures. ([#20](https://github.com/alessbarb/bindhome/pull/20))

### Development milestones included in 1.0.0

| Milestone | Scope | Pull requests |
| --- | --- | --- |
| Runtime foundation | HA tooling, panel loading, frontend bundle correctness, dynamic logical entities and HA-native service routing | [#1](https://github.com/alessbarb/bindhome/pull/1)–[#6](https://github.com/alessbarb/bindhome/pull/6) |
| Inventory foundation | Product contract, atomic bulk creation, explicit Representations, creation presets and synchronized architecture docs | [#7](https://github.com/alessbarb/bindhome/pull/7)–[#11](https://github.com/alessbarb/bindhome/pull/11) |
| Human workflows | Room inventory, browse/edit, Bindings, topology and the human-first Casa experience | [#12](https://github.com/alessbarb/bindhome/pull/12)–[#16](https://github.com/alessbarb/bindhome/pull/16) |
| Reliability & release | Transactional mutations, fail-closed storage, backup/restore, onboarding, compatibility and HACS publication foundation | [#17](https://github.com/alessbarb/bindhome/pull/17)–[#20](https://github.com/alessbarb/bindhome/pull/20) |

---

[Unreleased]: https://github.com/alessbarb/bindhome/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/alessbarb/bindhome/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/alessbarb/bindhome/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/alessbarb/bindhome/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/alessbarb/bindhome/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/alessbarb/bindhome/releases/tag/v1.0.0
