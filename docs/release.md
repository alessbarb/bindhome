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
- `custom_components/bindhome/panel/frontend/package.json`;
- the root package metadata in `custom_components/bindhome/panel/frontend/package-lock.json`.

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
6. use the finalized changelog section as the basis for the GitHub Release notes.

Generated bundles, formatting-only changes and internal refactors do not need changelog entries unless they materially affect users, compatibility, reliability or release operations.

## Home Assistant compatibility

`hacs.json.homeassistant` is the minimum Home Assistant release supported by the current BindHome release.

The minimum is not inferred from development history. It must be covered by the Home Assistant compatibility workflow and pass the complete BindHome Python test suite. CI also tests the current supported Home Assistant release so compatibility is checked at both ends of the supported range.

BindHome 1.0.0 supports Home Assistant `2026.8.0` and newer compatible releases. Home Assistant `2026.7.0` is below the supported floor because the BindHome panel uses `homeassistant.components.http.server.StaticPathConfig`, which is unavailable there.

When the minimum supported Home Assistant version changes, the HACS metadata, README, compatibility matrix, changelog and release notes must change together.

## Release checklist

1. Start from an up-to-date `main` and a dedicated release branch.
2. Set the intended BindHome version in all release metadata.
3. Review `CHANGELOG.md`: ensure every notable merged change since the previous release is present, move `Unreleased` into the release version/date, and leave a fresh `Unreleased` section.
4. Confirm the Home Assistant compatibility matrix is green.
5. Confirm Validate, Hassfest, frontend and HACS validation are green.
6. Confirm the README, changelog and release notes describe the supported Home Assistant range and any migrations.
7. For a public release, confirm the repository itself satisfies HACS publication metadata requirements.
8. Merge the release PR into `main`.
9. Confirm all workflows are green on the exact merged `main` commit.
10. Create tag `v<version>` on that exact commit.
11. Create the GitHub Release from that tag; do not move or reuse an existing release tag.
12. Install or upgrade the release through HACS in a development Home Assistant instance.
13. Restart Home Assistant and verify BindHome loads, the Registry is intact, logical entities reconcile, and the panel opens.
14. Keep the previous release available for controlled downgrade when one exists.

For the first public release, the repository must be public before the final HACS publication validation. `v1.0.0` is created only after the release-preparation PR is merged and the exact resulting `main` commit is green.

## Upgrade

Before a material upgrade, export a BindHome Registry backup using the administrator-only backup API. HACS should be used to download the new release. Restart Home Assistant after the files have been replaced and verify BindHome system health, Registry contents, logical entities, and panel access.

BindHome storage migrations run through the integration. Do not edit Home Assistant `.storage` files manually.

## Downgrade

Downgrade only to a BindHome release whose documented storage schema can read the current Registry. Use HACS to select the previous release, restart Home Assistant, and verify the integration.

If a newer release introduced a storage schema that the older release cannot read, restore a backup created while the older compatible schema was active instead of manipulating `.storage` manually.

## Release failure

If installation succeeds but post-restart validation fails:

1. stop making Registry mutations;
2. capture the BindHome and Home Assistant logs;
3. reinstall the previous known-good BindHome release through HACS;
4. restart Home Assistant;
5. restore a compatible BindHome Registry backup only if required.

A failed release must never be repaired by changing Home Assistant `.storage` directly.
