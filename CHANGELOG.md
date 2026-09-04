# Changelog

All notable public changes to BindHome are documented here.

The project follows Semantic Versioning.

## 1.0.0

First public BindHome release.

**Minimum Home Assistant:** `2026.8.0`

### Added

- Stable infrastructure Assets with Home Assistant Area references.
- Generic Asset Relations and capability modelling.
- Capability-level Bindings to replaceable Home Assistant entities.
- Explicit logical Representations and logical Light entities.
- Dynamic logical entity reconciliation.
- Home Assistant actions and CRUD/query WebSocket APIs.
- Atomic bulk Asset creation and creation presets.
- Dedicated BindHome panel with home navigation, room inventory, search, connection and topology workflows.
- First-run onboarding for empty Registries, explaining the BindHome model and guiding users into their first room inventory.
- English and Spanish onboarding and panel localization.
- Optional Advanced workspace for direct Registry operations.
- System health reporting.
- Transactional Registry backup/export and restore APIs.

### Reliability

- All Registry mutations use staged, persist-before-adopt transactions.
- Atomic storage writes with fail-fast propagation of persistence failures.
- Live Registry object identity is preserved across commits.
- Registry change signals are emitted only after successful persistence.
- Startup fails closed for corrupt or unsupported storage instead of silently creating an empty Registry.
- Storage schema/version validation and legacy migration persistence.
- Backup restore validates the complete Registry before persistence and uses the same transaction guarantees as normal mutations.
- Frontend navigation keeps mounted views and draft state intact, including while first-run onboarding is displayed.

### Compatibility

- Home Assistant `2026.8.0` is the verified minimum supported release.
- Home Assistant `2026.9.0` is covered by the release compatibility matrix.
- Home Assistant `2026.7.0` and older are not supported because the panel requires `homeassistant.components.http.server.StaticPathConfig`.

### Distribution

- BindHome version promoted to `1.0.0` across Python, Home Assistant and frontend metadata.
- HACS-compatible repository metadata and brand asset.
- Automatic HACS and Hassfest validation.
- Home Assistant compatibility matrix covering the supported floor and current stable release.
- Release metadata consistency validation.
- Public README explaining the BindHome mental model, end-to-end usage and HACS installation.
- Public installation, upgrade, downgrade and release documentation.
