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

### Changed

- Registry multi-step mutations now have a supported public `BindHomeManager.transaction()` boundary. Backup restore and dependency-aware Asset deletion use that API instead of reaching into private manager locking/staging/commit internals. ([#62](https://github.com/alessbarb/bindhome/pull/62))

### Reliability

- Same-task nested manager mutations inside an open Registry transaction now fail immediately with an explicit transaction error instead of being able to deadlock on a non-reentrant `asyncio.Lock`; concurrent mutations from different tasks continue to serialize normally. ([#62](https://github.com/alessbarb/bindhome/pull/62))
- Staged Registry state is revalidated before persistence, and the manager-independent store write path now validates canonical state before touching Home Assistant storage, giving future startup migrations a documented validate-before-write persistence primitive. ([#62](https://github.com/alessbarb/bindhome/pull/62))
- Live Registry adoption derives its persisted collection set from the Registry serialization contract instead of maintaining a separate hand-written list, so future persisted collections cannot be silently omitted; new persisted fields without collection semantics fail closed until explicitly handled. ([#62](https://github.com/alessbarb/bindhome/pull/62))

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

[Unreleased]: https://github.com/alessbarb/bindhome/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/alessbarb/bindhome/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/alessbarb/bindhome/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/alessbarb/bindhome/releases/tag/v1.0.0
