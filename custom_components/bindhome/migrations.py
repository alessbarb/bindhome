"""Versioned migration policy for persisted BindHome Registry payloads."""

from __future__ import annotations

from collections.abc import Callable
from copy import deepcopy
from dataclasses import dataclass
from typing import Any

from .const import REGISTRY_SCHEMA_VERSION
from .registry import BindHomeRegistry, RegistryValidationError

LEGACY_REGISTRY_SCHEMA_VERSION = 0
MIN_SUPPORTED_REGISTRY_SCHEMA_VERSION = LEGACY_REGISTRY_SCHEMA_VERSION


class RegistryMigrationError(RegistryValidationError):
    """Raised when a persisted Registry payload cannot be migrated safely."""


class RegistrySchemaFutureError(RegistryMigrationError):
    """Raised when a Registry payload was written by a newer BindHome schema."""


@dataclass(frozen=True, slots=True)
class RegistryMigrationResult:
    """Describe canonical Registry state produced from one persisted payload."""

    registry: BindHomeRegistry
    source_version: int
    target_version: int
    changed: bool
    canonical_payload: dict[str, Any]


MigrationStep = Callable[[dict[str, Any]], dict[str, Any]]


def _read_schema_version(data: dict[str, Any]) -> int:
    """Return the explicit schema version or the pre-version legacy marker."""
    if "schema_version" not in data:
        return LEGACY_REGISTRY_SCHEMA_VERSION

    raw = data["schema_version"]
    if isinstance(raw, bool) or not isinstance(raw, int):
        raise RegistryMigrationError("Registry schema_version must be an integer")
    if raw < LEGACY_REGISTRY_SCHEMA_VERSION:
        raise RegistryMigrationError(f"Unsupported Registry schema version: {raw}")
    return raw


def _infer_legacy_representations(data: dict[str, Any]) -> list[dict[str, str]]:
    """Preserve the historical implicit on_off -> light behavior deterministically."""
    representations: list[dict[str, str]] = []
    assets = data.get("assets", [])
    if not isinstance(assets, list):
        return representations

    for asset in assets:
        if not isinstance(asset, dict):
            continue
        asset_id = asset.get("id")
        capabilities = asset.get("capabilities", [])
        if asset_id is None or not isinstance(capabilities, (list, tuple)):
            continue
        if "on_off" in capabilities:
            representations.append(
                {
                    "asset_id": str(asset_id),
                    "platform": "light",
                }
            )
    return representations


def _migrate_v0_to_v1(data: dict[str, Any]) -> dict[str, Any]:
    """Migrate the pre-schema legacy payload to Registry schema v1."""
    migrated = deepcopy(data)
    migrated["schema_version"] = 1
    migrated.setdefault("representations", _infer_legacy_representations(migrated))
    return migrated


REGISTRY_MIGRATIONS: dict[int, MigrationStep] = {
    0: _migrate_v0_to_v1,
}


def _canonicalize_current_payload(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize historically accepted shapes within the current schema version."""
    canonical = deepcopy(data)

    # Early schema-v1 builds persisted schema_version=1 before Representations
    # became explicit. Keep that historical shape readable without putting
    # migration behavior back into BindHomeRegistry.from_dict().
    if REGISTRY_SCHEMA_VERSION == 1 and "representations" not in canonical:
        canonical["representations"] = _infer_legacy_representations(canonical)

    return canonical


def migrate_registry_payload(data: object) -> RegistryMigrationResult:
    """Validate version policy, migrate historical payloads and parse canonical state.

    The input object is never mutated. Unsupported future schemas fail before any
    canonical payload can be persisted. Model validation happens only after all
    supported version transformations are complete.
    """
    if not isinstance(data, dict):
        raise RegistryMigrationError("Persisted registry must be a dictionary")

    original = deepcopy(data)
    source_version = _read_schema_version(original)

    if source_version > REGISTRY_SCHEMA_VERSION:
        raise RegistrySchemaFutureError(
            "Registry schema version "
            f"{source_version} is newer than supported version "
            f"{REGISTRY_SCHEMA_VERSION}"
        )
    if source_version < MIN_SUPPORTED_REGISTRY_SCHEMA_VERSION:
        raise RegistryMigrationError(
            f"Unsupported historical Registry schema version: {source_version}"
        )

    canonical = deepcopy(original)
    version = source_version
    while version < REGISTRY_SCHEMA_VERSION:
        step = REGISTRY_MIGRATIONS.get(version)
        if step is None:
            raise RegistryMigrationError(
                "No Registry migration path from schema version "
                f"{version} to {version + 1}"
            )

        migrated = step(canonical)
        next_version = _read_schema_version(migrated)
        if next_version != version + 1:
            raise RegistryMigrationError(
                "Registry migration step did not advance exactly one version: "
                f"{version} -> {next_version}"
            )
        canonical = migrated
        version = next_version

    canonical = _canonicalize_current_payload(canonical)
    final_version = _read_schema_version(canonical)
    if final_version != REGISTRY_SCHEMA_VERSION:
        raise RegistryMigrationError(
            "Registry migration did not produce the current schema version"
        )

    registry = BindHomeRegistry.from_dict(canonical)
    canonical_payload = registry.to_dict()
    return RegistryMigrationResult(
        registry=registry,
        source_version=source_version,
        target_version=REGISTRY_SCHEMA_VERSION,
        changed=canonical_payload != original,
        canonical_payload=canonical_payload,
    )
