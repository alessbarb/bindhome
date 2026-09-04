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
- `custom_components/bindhome/panel/frontend/package.json`.

Release tags use the same version prefixed with `v`, for example `v1.0.0`.

## Home Assistant compatibility

`hacs.json.homeassistant` is the minimum Home Assistant release supported by the current BindHome release.

The minimum is not inferred from development history. It must be covered by the Home Assistant compatibility workflow and pass the complete BindHome Python test suite. CI also tests the current supported Home Assistant release so compatibility is checked at both ends of the supported range.

When the minimum supported Home Assistant version changes, the HACS metadata, README, compatibility matrix, and release notes must change together.

## Release checklist

1. Start from an up-to-date `main` and a dedicated release branch.
2. Set the intended BindHome version in all release metadata.
3. Confirm the Home Assistant compatibility matrix is green.
4. Confirm Validate, Hassfest, frontend and HACS validation are green.
5. Confirm the README and release notes describe the supported Home Assistant range and any migrations.
6. Merge the release PR into `main`.
7. Confirm all workflows are green on the exact merged `main` commit.
8. Create tag `v<version>` on that exact commit.
9. Create the GitHub Release from that tag; do not move or reuse an existing release tag.
10. Install or upgrade the release through HACS in a development Home Assistant instance.
11. Restart Home Assistant and verify BindHome loads, the Registry is intact, logical entities reconcile, and the panel opens.
12. Keep the previous release available for controlled downgrade.

For the first public release, repository visibility is changed to public only after the release-preparation PR has been merged and `main` is green. `v1.0.0` is then created from that exact public `main` commit.

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
