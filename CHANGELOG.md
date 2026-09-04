# Changelog

All notable public changes to BindHome are documented here.

The project follows Semantic Versioning.

## 1.0.0

First public BindHome release.

### Added

- Stable infrastructure Assets with Home Assistant Area references.
- Generic Asset Relations and capability modelling.
- Capability-level Bindings to replaceable Home Assistant entities.
- Explicit logical Representations and logical Light entities.
- Dynamic logical entity reconciliation.
- Home Assistant actions and CRUD/query WebSocket APIs.
- Atomic bulk Asset creation and creation presets.
- Dedicated BindHome panel with inventory, search, connection and topology workflows.
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

### Distribution

- HACS-compatible repository metadata.
- Automatic HACS and Hassfest validation.
- Home Assistant compatibility matrix.
- Release metadata consistency validation.
- Public installation, upgrade, downgrade and release documentation.
