# Release process

BindHome releases are immutable GitHub Releases intended for installation through HACS. Development deployments may use other mechanisms, but published users should install and update from tagged releases only.

## Versioning

BindHome follows Semantic Versioning:

- `MAJOR`: incompatible public API, storage, or behavior changes that require explicit migration guidance;
- `MINOR`: backwards-compatible features;
- `PATCH`: backwards-compatible fixes.

The release version must match in:

- `pyproject.toml`;
- `custom_components/bindhome/manifest.json`;
- `frontend/package.json`;
- the root package metadata in `frontend/package-lock.json`.

CI verifies this metadata before a release can be accepted.

Release tags use the same version prefixed with `v`, for example `v1.0.0`.

## Changelog discipline

`CHANGELOG.md` is the canonical human-readable history of public BindHome improvements and released versions.

Every pull request that introduces a user-visible feature, behavior change, compatibility change, migration, reliability change or meaningful bug fix should add a concise entry under `Unreleased`. The entry should describe the effect rather than the implementation detail and should link the relevant pull request when that improves traceability.

Use the established categories where applicable: `Added`, `Changed`, `Fixed`, `Reliability`, `Compatibility`, `Security`, `Deprecated`, `Removed` and `Distribution`. Do not create empty categories merely for symmetry.

At release time:

1. review every merged PR since the previous release and confirm that all notable changes are represented;
2. move the accumulated `Unreleased` entries under `## [x.y.z] - YYYY-MM-DD`;
3. leave a fresh `Unreleased` section at the top;
4. add or update comparison/release links at the bottom of the file;
5. ensure migrations, minimum Home Assistant changes, deprecations and breaking changes are explicit;
6. use the finalized changelog section as the GitHub Release notes.

Generated bundles, formatting-only changes and internal refactors do not need changelog entries unless they materially affect users, compatibility, reliability or release operations.

## Home Assistant compatibility

`hacs.json.homeassistant` is the minimum Home Assistant release supported by the current BindHome release.

The minimum is not inferred from development history. It must be covered by the Home Assistant compatibility workflow and pass the complete BindHome Python test suite. CI also tests the current supported Home Assistant release so compatibility is checked at both ends of the supported range.

The BindHome 1.x compatibility baseline starts at Home Assistant `2026.8.0`. Home Assistant `2026.7.0` is below the supported floor because the BindHome panel uses `homeassistant.components.http.server.StaticPathConfig`, which is unavailable there.

When the minimum supported Home Assistant version changes, the HACS metadata, README, compatibility matrix, changelog and release notes must change together.

## Registry schema policy

Home Assistant's storage-envelope version and BindHome's Registry schema version are independent compatibility layers. The complete policy is documented in [`docs/registry-schema.md`](registry-schema.md).

A supported historical Registry schema is migrated one version at a time to the current schema before model parsing. An unsupported future Registry schema fails closed and must never be silently rewritten by an older release. Corrupt or invalid payloads are validation failures, not migration candidates to be guessed or repaired heuristically.

Every future Registry schema bump must include the corresponding stepwise migration test and release/downgrade guidance in the same change.

## Distribution layout

Stable HACS installs use a dedicated GitHub Release asset named `bindhome.zip`. `hacs.json` declares `zip_release: true` and `filename: bindhome.zip`, so tagged installations consume that validated artifact instead of relying only on GitHub's generic repository archive. The ZIP is built from `custom_components/bindhome` and is rooted at the integration itself: `manifest.json`, `__init__.py`, `panel/`, translations and the remaining runtime files live directly at archive root.

Development-only frontend source, tests and Node.js tooling remain separately under the repository-root `frontend/` directory.

The frontend build writes the only runtime artifact it needs into:

```text
custom_components/bindhome/panel/static/bindhome-panel.js
```

The release gate rebuilds this bundle and verifies that the committed artifact is current. Development source and tests must not be moved back into the HACS runtime tree.

## Automated publication

`.github/workflows/release.yml` is the publication boundary for stable BindHome releases.

When a merge to `main` changes release metadata, the changelog, or the release workflow itself, the publisher:

1. verifies that all version metadata agrees and that `CHANGELOG.md` contains a finalized section for that version;
2. exits without changing anything if the corresponding GitHub Release already exists;
3. waits for the exact merged `main` commit to pass `Release Metadata`, `Pytest`, `Ruff Lint & Format`, `Hassfest`, `Frontend`, `HACS Validation`, `HA 2026.8.0`, and `HA 2026.9.0`;
4. fails closed if any required gate fails or the gate does not complete within the bounded wait;
5. extracts the release notes from the matching `CHANGELOG.md` section;
6. builds `bindhome.zip` from the runtime integration and validates required files, JSON manifest content, non-empty panel bundle, safe paths and HACS-rooted ZIP layout;
7. creates the immutable `v<version>` tag and stable GitHub Release on that exact commit with `bindhome.zip` and `bindhome.zip.sha256` attached;
8. verifies that the published release targets the exact green commit and contains both required assets.

Publication therefore cannot race ahead of the protected release gate. Re-running the workflow is idempotent for an already published version.

## Release checklist

1. Start from an up-to-date `main` and a dedicated release branch.
2. Set the intended BindHome version in all release metadata.
3. Review `CHANGELOG.md`: ensure every notable merged change since the previous release is present, move `Unreleased` into the release version/date, and leave a fresh `Unreleased` section.
4. Confirm the Home Assistant compatibility matrix is green on the release PR.
5. Confirm Validate, Hassfest, frontend and HACS validation are green on the release PR.
6. Confirm the README, changelog and release notes describe the supported Home Assistant range and any migrations.
7. For a public release, confirm the repository itself satisfies HACS publication metadata requirements.
8. Confirm `custom_components/bindhome` contains runtime files only and no local development workspace/tool artifacts.
9. Build the release archive with `python scripts/build_release_package.py --output dist/bindhome.zip` and confirm `manifest.json`, `__init__.py` and `panel/static/bindhome-panel.js` are present and non-empty at the expected integration-root paths.
10. Merge the release PR into `main`.
11. Let the publication workflow wait for all required checks on the exact merged `main` commit and create `v<version>` plus the GitHub Release.
12. Verify that the published release targets that exact green commit and that its notes match the finalized changelog section.
13. Install or upgrade the release through HACS in a development Home Assistant instance.
14. Restart Home Assistant and verify BindHome loads, the Registry is intact, logical entities reconcile, and the panel opens.
15. Keep the previous release available for controlled downgrade when one exists.

For the first public release, the repository must be public before the final HACS publication validation. `v1.0.0` is published only after the release-preparation changes are on protected `main` and the exact resulting commit passes every required gate.

## Upgrade

Before a material upgrade, export a BindHome Registry backup using the administrator-only backup API. HACS should be used to download the new release. Restart Home Assistant after the files have been replaced and verify BindHome system health, Registry contents, logical entities, and panel access.

BindHome storage migrations run through the integration. Do not edit Home Assistant `.storage` files manually.

## Downgrade

Downgrade only to a BindHome release whose documented Registry schema can read the Registry currently on disk. A code downgrade does not downgrade persisted data.

Before any release that bumps the Registry schema, retain a backup created while the older compatible release/schema was active. If the current Registry has already been written in a schema newer than the target release understands, an in-place downgrade is unsafe: use the supported recovery workflow with a backup that the target release can read. If that older target release predates an in-product recovery path for an unloadable Registry, reinstall the newer compatible BindHome release rather than editing `.storage` or repeatedly starting the incompatible version.

See [`docs/registry-schema.md`](registry-schema.md) for the exact version policy and downgrade constraints.

## Release failure

If installation succeeds but post-restart validation fails:

1. stop making Registry mutations;
2. capture the BindHome and Home Assistant logs;
3. reinstall the previous known-good BindHome release through HACS only when its documented Registry schema can read the current data;
4. restart Home Assistant;
5. restore a compatible BindHome Registry backup only through the supported recovery path if required.

A failed release must never be repaired by changing Home Assistant `.storage` directly.

## 1.4.2 distribution hotfix baseline

Version 1.4.2 intentionally preserves the 1.4.1 runtime and data contracts. Its release-specific change is the HACS distribution boundary: tagged installs must use the validated `bindhome.zip` asset, and publication must fail before tagging if the archive cannot be built or validated. Registry schema stays v2, backup format v1, CSV format v1 and the Home Assistant minimum stays at 2026.8.0 with compatibility coverage for 2026.8.0 and 2026.9.0.

The incident motivating this hotfix was a local installation whose `/config/custom_components/bindhome/manifest.json` had been truncated to zero bytes even though the immutable v1.4.1 tag contains a valid manifest. Release checks therefore validate not only repository metadata but the exact archive layout and critical file contents that HACS will extract.

Keep all release metadata, README current-release guidance, changelog comparison links and HACS package metadata coherent. Validate every release PR on its final SHA, inspect comments/reviews/threads and mergeability, then merge with an expected head SHA. A new SHA invalidates previous validation evidence.

## 1.4.1 release baseline

The 1.4.0 tag remains immutable release history. Version 1.4.1 completes panel surfaces over existing contracts, uses Registry schema v2 / backup format v1 / CSV format v1, and keeps the Home Assistant 2026.8.0 minimum with compatibility coverage for 2026.8.0 and 2026.9.0.

Keep README current-release and workflow descriptions, all five version values, the finalized changelog and its 1.4.0/1.4.1 comparison links coherent. Historical 1.4.0 notes must remain under 1.4.0 rather than being relabeled. Validate every feature and release PR on its final SHA, inspect comments/reviews/threads and mergeability, then merge with an expected head SHA. A new SHA invalidates previous validation evidence.

The release branch must ultimately target current `main`. Let the existing publisher create `v1.4.1` and its stable release on the exact green merged `main` commit, then verify tag identity, published version and notes. Do not publish directly from the release branch or move an existing tag.
