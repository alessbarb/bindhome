"""Tests for versioned BindHome Registry schema migration policy."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

import pytest

from custom_components.bindhome.backup import parse_registry_backup
from custom_components.bindhome.const import REGISTRY_SCHEMA_VERSION
from custom_components.bindhome.migrations import (
    MIN_SUPPORTED_REGISTRY_SCHEMA_VERSION,
    REGISTRY_MIGRATIONS,
    RegistryMigrationError,
    RegistrySchemaFutureError,
    migrate_registry_payload,
)
from custom_components.bindhome.registry import BindHomeRegistry, RegistryValidationError

_FIXTURES = Path(__file__).parent / "fixtures" / "registry"


def _fixture(name: str) -> dict[str, object]:
    return json.loads((_FIXTURES / name).read_text(encoding="utf-8"))


def test_current_v1_golden_payload_loads_unchanged() -> None:
    payload = _fixture("v1_canonical.json")

    result = migrate_registry_payload(payload)

    assert result.source_version == 1
    assert result.target_version == REGISTRY_SCHEMA_VERSION == 1
    assert result.changed is False
    assert result.canonical_payload == payload
    assert result.registry.to_dict() == payload


def test_legacy_v0_golden_payload_migrates_to_current_schema() -> None:
    payload = _fixture("v0_legacy_implicit_light.json")
    original = deepcopy(payload)

    result = migrate_registry_payload(payload)

    assert payload == original
    assert result.source_version == 0
    assert result.target_version == 1
    assert result.changed is True
    assert result.canonical_payload["schema_version"] == 1
    assert result.canonical_payload["representations"] == [
        {"asset_id": "legacy-light", "platform": "light"}
    ]
    representation = result.registry.get_representation("legacy-light")
    assert representation is not None
    assert representation.platform == "light"
    assert result.registry.get_representation("legacy-socket") is None


def test_historical_v1_shape_without_representations_is_canonicalized() -> None:
    payload = {
        "schema_version": 1,
        "assets": [
            {
                "id": "old-light",
                "name": "Old light",
                "asset_type": "light_point",
                "capabilities": ["on_off"],
            }
        ],
        "relations": [],
        "bindings": [],
    }

    result = migrate_registry_payload(payload)

    assert result.source_version == 1
    assert result.changed is True
    assert result.canonical_payload["representations"] == [
        {"asset_id": "old-light", "platform": "light"}
    ]


def test_migration_is_idempotent_once_payload_is_canonical() -> None:
    first = migrate_registry_payload(_fixture("v0_legacy_implicit_light.json"))
    second = migrate_registry_payload(first.canonical_payload)

    assert second.changed is False
    assert second.canonical_payload == first.canonical_payload


def test_future_schema_fails_closed_without_mutating_input() -> None:
    payload = {
        "schema_version": REGISTRY_SCHEMA_VERSION + 1,
        "assets": [],
        "relations": [],
        "bindings": [],
        "representations": [],
    }
    original = deepcopy(payload)

    with pytest.raises(RegistrySchemaFutureError, match="newer than supported"):
        migrate_registry_payload(payload)

    assert payload == original


def test_invalid_schema_version_is_not_a_migration_input() -> None:
    with pytest.raises(RegistryMigrationError, match="must be an integer"):
        migrate_registry_payload({"schema_version": "1"})

    with pytest.raises(RegistryMigrationError, match="must be an integer"):
        migrate_registry_payload({"schema_version": True})


def test_schema_bump_requires_a_complete_stepwise_migration_path() -> None:
    expected_steps = set(
        range(MIN_SUPPORTED_REGISTRY_SCHEMA_VERSION, REGISTRY_SCHEMA_VERSION)
    )

    assert set(REGISTRY_MIGRATIONS) == expected_steps


def test_current_schema_parser_does_not_hide_migration_logic() -> None:
    with pytest.raises(
        RegistryValidationError,
        match="missing representations",
    ):
        BindHomeRegistry.from_dict(
            {
                "schema_version": 1,
                "assets": [],
                "relations": [],
                "bindings": [],
            }
        )


def test_backup_restore_parser_migrates_supported_historical_registry() -> None:
    registry = parse_registry_backup(
        {
            "format": "bindhome.registry",
            "format_version": 1,
            "registry": _fixture("v0_legacy_implicit_light.json"),
        }
    )

    assert registry.to_dict()["schema_version"] == REGISTRY_SCHEMA_VERSION
    representation = registry.get_representation("legacy-light")
    assert representation is not None
    assert representation.platform == "light"
