# Contributing to BindHome

Thanks for helping improve BindHome.

BindHome models the **stable physical infrastructure of a home** independently from replaceable Home Assistant hardware. Contributions should preserve that boundary: Home Assistant remains authoritative for Floors, Areas, Devices, Entities, runtime state, domains and service routing; BindHome owns Assets, Capabilities, Relations, Bindings and Representations.

## Before opening a pull request

For bugs and feature proposals, start with the appropriate GitHub Issue Form unless the change is trivial and self-contained.

For security vulnerabilities, follow [SECURITY.md](SECURITY.md) and do not disclose vulnerability details in a public Issue or pull request.

## Development environment

### Python / Home Assistant integration

BindHome development currently targets Python 3.14.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install .[dev]
```

Run the Python checks with:

```bash
pytest
ruff check .
ruff format --check .
```

The Home Assistant compatibility workflow also runs the full Python suite against the minimum supported Home Assistant release and the current stable release.

### Frontend

Frontend source and tests live in `frontend/`. The Home Assistant runtime bundle is generated into `custom_components/bindhome/panel/static/bindhome-panel.js`.

Use Node.js 22 and install dependencies with:

```bash
cd frontend
npm ci
npm run typecheck
npm test
npm run build
```

After building, the generated runtime bundle must be committed and must match the source exactly. CI verifies this with `git diff`.

Do not move frontend development tooling back under `custom_components/bindhome`; HACS should install runtime integration files only.

## Product and architecture rules

Please preserve these core rules:

1. Physical Asset identity is stable; hardware identity is replaceable.
2. Bindings occur at Capability level.
3. A Capability does not automatically imply a Representation.
4. Passive Assets are valid.
5. Home Assistant remains the source of truth for its own registries and runtime state.
6. BindHome does not encode one specific house or installation.
7. Registry mutations and restore operations must preserve the transactional persist-before-adopt contract.
8. Invalid, corrupt or unsupported persisted state must fail closed rather than being silently replaced.
9. User-facing workflows should prefer physical/home terminology; internal identifiers belong in Advanced surfaces.
10. Manual Home Assistant `.storage` editing is not part of the supported operating model.

See [docs/architecture.md](docs/architecture.md) and [docs/product-contract.md](docs/product-contract.md) before making changes that affect the domain model, persistence, runtime entity behavior or human workflow.

## Tests

Changes should include focused regression coverage at the lowest useful layer.

Examples:

- Registry/model behavior: Python unit tests.
- Manager persistence semantics: transaction/failure-path tests.
- Home Assistant integration behavior: custom-component tests.
- Panel state, async workflows and localization: frontend tests.
- Compatibility-sensitive changes: ensure both supported Home Assistant CI jobs remain green.

Do not weaken or delete tests simply to make a change pass.

## Localization

Runtime translations for this custom integration live in:

```text
custom_components/bindhome/translations/en.json
custom_components/bindhome/translations/es.json
```

English and Spanish panel keys should remain aligned. Do not reintroduce a duplicated `strings.json` runtime source for the custom component.

Machine identifiers such as Asset types, Capability names, Relation types and preset IDs must remain stable and must not be translated in persisted or API payloads.

## Changelog

Add a concise entry under `Unreleased` in `CHANGELOG.md` for user-visible features, behavior changes, compatibility changes, migrations, reliability work, security changes or meaningful fixes.

Pure formatting, generated bundle updates and internal refactors do not need changelog entries unless they materially affect users, compatibility, reliability or the release process.

## Pull request checklist

Before requesting review:

- keep the change focused and explain the problem it solves;
- update tests for changed behavior;
- update documentation when public behavior, architecture or operating procedures change;
- update `CHANGELOG.md` when appropriate;
- run Python and frontend checks locally when the change touches those areas;
- ensure the generated frontend bundle is current;
- do not include credentials, Home Assistant tokens, real private Registry data or house-specific secrets;
- do not include temporary workspaces, local tooling artifacts or generated helper workflows;
- keep all required GitHub Actions checks green.

## Scope discipline

BindHome is intentionally infrastructure-focused. A proposal that duplicates Home Assistant registries, hardcodes hardware brands, embeds knowledge of a particular home, or couples stable Assets to current entity IDs is likely outside the product boundary unless there is a compelling architectural reason.

When in doubt, describe the user problem first. The smallest change that preserves the stable-home / replaceable-hardware boundary is usually preferred.
