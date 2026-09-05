from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).parent


def replace_once(path: str, old: str, new: str) -> None:
    file = ROOT / path
    text = file.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one replacement, found {count}: {old[:80]!r}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


# Registry schema v2: Binding targets gain stable Entity Registry identity.
replace_once(
    "custom_components/bindhome/const.py",
    "REGISTRY_SCHEMA_VERSION: Final = 1",
    "REGISTRY_SCHEMA_VERSION: Final = 2",
)

models_path = ROOT / "custom_components/bindhome/models.py"
models = models_path.read_text(encoding="utf-8")
marker = '@dataclass(frozen=True, slots=True)\nclass Binding:'
if models.count(marker) != 1:
    raise SystemExit("Binding model marker not found exactly once")
prefix = models.split(marker, 1)[0]
binding_class = '''@dataclass(frozen=True, slots=True)
class Binding:
    """Map an Asset capability to a Home Assistant entity target.

    ``entity_registry_id`` is the stable Home Assistant Entity Registry entry
    identity when the target is registered. ``entity_id`` remains the last-known
    entity id and the compatibility fallback for state-machine-only entities.
    """

    id: str
    asset_id: str
    capability: str
    entity_id: str
    entity_registry_id: str | None = None
    role: str = "primary"

    @classmethod
    def create(
        cls,
        *,
        asset_id: str,
        capability: str,
        entity_id: str,
        entity_registry_id: str | None = None,
        role: str = "primary",
    ) -> Binding:
        """Create a validated binding."""
        return cls(
            id=_new_id(),
            asset_id=normalize_non_empty(asset_id, "asset_id"),
            capability=normalize_identifier(capability, "capability"),
            entity_id=normalize_non_empty(entity_id, "entity_id"),
            entity_registry_id=(
                normalize_non_empty(entity_registry_id, "entity_registry_id")
                if entity_registry_id is not None
                else None
            ),
            role=normalize_identifier(role, "role"),
        )

    def with_entity_id(
        self,
        entity_id: str,
        *,
        entity_registry_id: str | None = None,
    ) -> Binding:
        """Replace the current implementation while preserving Binding identity."""
        return replace(
            self,
            entity_id=normalize_non_empty(entity_id, "entity_id"),
            entity_registry_id=(
                normalize_non_empty(entity_registry_id, "entity_registry_id")
                if entity_registry_id is not None
                else None
            ),
        )

    def to_dict(self) -> dict[str, str | None]:
        """Serialize the binding."""
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "capability": self.capability,
            "entity_id": self.entity_id,
            "entity_registry_id": self.entity_registry_id,
            "role": self.role,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Binding:
        """Deserialize and validate a binding."""
        if not isinstance(data, dict):
            raise ModelValidationError("Binding data must be a dictionary")
        try:
            entity_registry_id = data.get("entity_registry_id")
            return cls(
                id=normalize_non_empty(str(data["id"]), "id"),
                asset_id=normalize_non_empty(str(data["asset_id"]), "asset_id"),
                capability=normalize_identifier(str(data["capability"]), "capability"),
                entity_id=normalize_non_empty(str(data["entity_id"]), "entity_id"),
                entity_registry_id=(
                    normalize_non_empty(
                        str(entity_registry_id),
                        "entity_registry_id",
                    )
                    if entity_registry_id is not None
                    else None
                ),
                role=normalize_identifier(str(data.get("role", "primary")), "role"),
            )
        except KeyError as err:
            raise ModelValidationError(
                f"Missing required binding field: {err.args[0]}"
            ) from err
'''
models_path.write_text(prefix + binding_class, encoding="utf-8")

(ROOT / "custom_components/bindhome/binding_identity.py").write_text(
    '''"""Stable Home Assistant identity helpers for persisted Bindings."""

from __future__ import annotations

from dataclasses import replace

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .registry import BindHomeRegistry


def entity_registry_id_for_entity(
    hass: HomeAssistant,
    entity_id: str,
) -> str | None:
    """Return the exact Entity Registry entry identity for an entity id, if any."""
    entry = er.async_get(hass).async_get(entity_id)
    return entry.id if entry is not None else None


def enrich_binding_target_identities(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
) -> bool:
    """Upgrade provable entity-id fallbacks to stable Entity Registry identity.

    Only an exact Entity Registry lookup by the persisted ``entity_id`` is used.
    Missing targets remain explicit entity-id fallbacks; this function never
    searches for or guesses a different entity.
    """
    entity_registry = er.async_get(hass)
    changed = False

    for binding_id, binding in tuple(registry.bindings.items()):
        if binding.entity_registry_id is not None:
            continue

        entry = entity_registry.async_get(binding.entity_id)
        if entry is None:
            continue

        registry.bindings[binding_id] = replace(
            binding,
            entity_registry_id=entry.id,
        )
        changed = True

    return changed
''',
    encoding="utf-8",
)

(ROOT / "custom_components/bindhome/migrations.py").write_text(
    '''"""Versioned migration policy for persisted BindHome Registry payloads."""

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


def _migrate_v1_to_v2(data: dict[str, Any]) -> dict[str, Any]:
    """Add stable Entity Registry identity slots to persisted Bindings."""
    migrated = deepcopy(data)

    # Early v1 payloads may still predate explicit Representations. Canonicalize
    # that historical v1 shape before advancing the schema.
    migrated.setdefault("representations", _infer_legacy_representations(migrated))

    bindings = migrated.get("bindings", [])
    if isinstance(bindings, list):
        for binding in bindings:
            if isinstance(binding, dict):
                # v1 persisted only entity_id. The HA-aware startup/restore phase
                # enriches exact registered targets before canonical persistence.
                binding.setdefault("entity_registry_id", None)

    migrated["schema_version"] = 2
    return migrated


REGISTRY_MIGRATIONS: dict[int, MigrationStep] = {
    0: _migrate_v0_to_v1,
    1: _migrate_v1_to_v2,
}


def _canonicalize_current_payload(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize historically accepted shapes within the current schema version."""
    return deepcopy(data)


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
            f"Unsupported registry schema version: {source_version}; "
            f"newer than supported version {REGISTRY_SCHEMA_VERSION}"
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
''',
    encoding="utf-8",
)

replace_once(
    "custom_components/bindhome/registry.py",
    "            updated = replace(existing, entity_id=binding.entity_id)\n",
    "            updated = replace(\n"
    "                existing,\n"
    "                entity_id=binding.entity_id,\n"
    "                entity_registry_id=binding.entity_registry_id,\n"
    "            )\n",
)

replace_once(
    "custom_components/bindhome/manager.py",
    "from .const import SIGNAL_REGISTRY_CHANGED\n",
    "from .binding_identity import entity_registry_id_for_entity\n"
    "from .const import SIGNAL_REGISTRY_CHANGED\n",
)
replace_once(
    "custom_components/bindhome/manager.py",
    "                entity_id=entity_id,\n                role=role,\n",
    "                entity_id=entity_id,\n"
    "                entity_registry_id=entity_registry_id_for_entity(\n"
    "                    self.hass, entity_id\n"
    "                ),\n"
    "                role=role,\n",
)

replace_once(
    "custom_components/bindhome/store.py",
    "from .const import STORAGE_KEY, STORAGE_VERSION\n",
    "from .binding_identity import enrich_binding_target_identities\n"
    "from .const import STORAGE_KEY, STORAGE_VERSION\n",
)
replace_once(
    "custom_components/bindhome/store.py",
    "        registry = migration.registry\n\n        # Startup migration/canonicalization uses the manager-independent\n",
    "        registry = migration.registry\n"
    "        identity_changed = enrich_binding_target_identities(self._hass, registry)\n\n"
    "        # Startup migration/canonicalization uses the manager-independent\n",
)
replace_once(
    "custom_components/bindhome/store.py",
    "        if migration.changed:\n            await self.async_save(registry)\n",
    "        if migration.changed or identity_changed:\n"
    "            await self.async_save(registry)\n",
)

replace_once(
    "custom_components/bindhome/backup.py",
    "from typing import TYPE_CHECKING, Any\n\nfrom .migrations import migrate_registry_payload\n",
    "from typing import TYPE_CHECKING, Any\n\n"
    "from .binding_identity import enrich_binding_target_identities\n"
    "from .migrations import migrate_registry_payload\n",
)
replace_once(
    "custom_components/bindhome/backup.py",
    "if TYPE_CHECKING:\n    from .manager import BindHomeManager\n",
    "if TYPE_CHECKING:\n"
    "    from homeassistant.core import HomeAssistant\n\n"
    "    from .manager import BindHomeManager\n",
)
replace_once(
    "custom_components/bindhome/backup.py",
    "def parse_registry_backup(data: object) -> BindHomeRegistry:\n",
    "def parse_registry_backup(\n"
    "    data: object,\n"
    "    *,\n"
    "    hass: HomeAssistant | None = None,\n"
    ") -> BindHomeRegistry:\n",
)
replace_once(
    "custom_components/bindhome/backup.py",
    "    try:\n        return migrate_registry_payload(registry_data).registry\n    except RegistryValidationError as err:\n",
    "    try:\n"
    "        registry = migrate_registry_payload(registry_data).registry\n"
    "        if hass is not None:\n"
    "            enrich_binding_target_identities(hass, registry)\n"
    "        return registry\n"
    "    except RegistryValidationError as err:\n",
)
replace_once(
    "custom_components/bindhome/backup.py",
    "    replacement = parse_registry_backup(data)\n",
    "    replacement = parse_registry_backup(data, hass=manager.hass)\n",
)

replace_once(
    "custom_components/bindhome/backup_websocket.py",
    "    registry = parse_registry_backup(data)\n",
    "    registry = parse_registry_backup(data, hass=hass)\n",
)

# Documentation: schema v2 and the exact identity/fallback contract.
replace_once(
    "docs/registry-schema.md",
    "| BindHome Registry schema | `REGISTRY_SCHEMA_VERSION = 1` | BindHome | Shape and semantics of Assets, Relations, Bindings and Representations |",
    "| BindHome Registry schema | `REGISTRY_SCHEMA_VERSION = 2` | BindHome | Shape and semantics of Assets, Relations, Bindings and Representations |",
)
replace_once(
    "docs/registry-schema.md",
    "The real pre-version BindHome payload is treated as historical schema `v0`. Its migration to `v1` preserves the old implicit behavior where an Asset with `on_off` was exposed as a logical `light` by writing an explicit Representation. Early `v1` payloads that already declared `schema_version: 1` but predate the `representations` collection are canonicalized with the same deterministic rule.\n",
    "The real pre-version BindHome payload is treated as historical schema `v0`. Its migration to `v1` preserves the old implicit behavior where an Asset with `on_off` was exposed as a logical `light` by writing an explicit Representation. Early `v1` payloads that already declared `schema_version: 1` but predate the `representations` collection use the same deterministic rule while migrating onward.\n\n"
    "Schema `v2` adds `entity_registry_id` to each Binding. `entity_id` remains the last-known Home Assistant entity id and is the documented compatibility fallback for state-machine-only entities. During startup and backup restore, BindHome upgrades a fallback to `entity_registry_id` only when the current Home Assistant Entity Registry has an exact entry for that persisted `entity_id`. Missing or stale targets remain explicit fallbacks; migration never searches for or guesses a replacement entity. The Binding functional key `(asset_id, capability, role)` and BindHome Binding `id` do not change.\n",
)
replace_once(
    "docs/backup-restore.md",
    '      "schema_version": 1,',
    '      "schema_version": 2,',
)
replace_once(
    "docs/backup-restore.md",
    "A backup may contain Home Assistant entity references that have since become stale. BindHome preserves those references during restore just as it does during normal persisted startup; runtime resolution reports stale or unavailable targets separately.\n",
    "A backup may contain Home Assistant entity references that have since become stale. Schema-v2 Bindings preserve both the last-known `entity_id` and, when available, the stable Home Assistant `entity_registry_id`. Historical backups are upgraded to stable Entity Registry identity only when an exact current Registry entry proves that identity; otherwise the original `entity_id` remains an explicit compatibility fallback. Runtime lookup of the current entity id is handled separately from backup migration.\n",
)

# Changelog note under Unreleased Reliability.
replace_once(
    "CHANGELOG.md",
    "### Reliability\n\n",
    "### Reliability\n\n"
    "- Registry schema v2 adds stable Home Assistant Entity Registry identity to persisted Bindings while retaining `entity_id` as the last-known/state-machine fallback. v1 data and backups migrate deterministically, exact registered targets are enriched before canonical persistence, and unresolved targets are never guessed or silently rebound. ([#50](https://github.com/alessbarb/bindhome/issues/50))\n",
)

# Current-schema golden fixture.
(ROOT / "tests/fixtures/registry/v2_canonical.json").write_text(
    '''{
  "schema_version": 2,
  "assets": [
    {
      "id": "canonical-light",
      "name": "Canonical light",
      "asset_type": "light_point",
      "code": "LGT-01",
      "area_id": "living_room",
      "capabilities": ["on_off"]
    }
  ],
  "relations": [],
  "bindings": [],
  "representations": [
    {
      "asset_id": "canonical-light",
      "platform": "light"
    }
  ]
}
''',
    encoding="utf-8",
)

(ROOT / "tests/test_registry_migrations.py").write_text(
    '''"""Tests for versioned BindHome Registry schema migration policy."""

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
from custom_components.bindhome.registry import (
    BindHomeRegistry,
    RegistryValidationError,
)

_FIXTURES = Path(__file__).parent / "fixtures" / "registry"


def _fixture(name: str) -> dict[str, object]:
    return json.loads((_FIXTURES / name).read_text(encoding="utf-8"))


def test_current_v2_golden_payload_loads_unchanged() -> None:
    payload = _fixture("v2_canonical.json")

    result = migrate_registry_payload(payload)

    assert result.source_version == 2
    assert result.target_version == REGISTRY_SCHEMA_VERSION == 2
    assert result.changed is False
    assert result.canonical_payload == payload
    assert result.registry.to_dict() == payload


def test_v1_golden_payload_migrates_to_v2() -> None:
    payload = _fixture("v1_canonical.json")
    original = deepcopy(payload)

    result = migrate_registry_payload(payload)

    assert payload == original
    assert result.source_version == 1
    assert result.target_version == 2
    assert result.changed is True
    assert result.canonical_payload["schema_version"] == 2


def test_v1_binding_gets_explicit_entity_registry_fallback() -> None:
    payload = {
        "schema_version": 1,
        "assets": [
            {
                "id": "socket",
                "name": "Socket",
                "asset_type": "socket",
                "capabilities": ["on_off"],
            }
        ],
        "relations": [],
        "bindings": [
            {
                "id": "binding-1",
                "asset_id": "socket",
                "capability": "on_off",
                "entity_id": "switch.legacy",
                "role": "primary",
            }
        ],
        "representations": [],
    }

    result = migrate_registry_payload(payload)

    binding = result.registry.bindings["binding-1"]
    assert binding.entity_id == "switch.legacy"
    assert binding.entity_registry_id is None
    assert result.canonical_payload["bindings"][0]["entity_registry_id"] is None


def test_legacy_v0_golden_payload_migrates_to_current_schema() -> None:
    payload = _fixture("v0_legacy_implicit_light.json")
    original = deepcopy(payload)

    result = migrate_registry_payload(payload)

    assert payload == original
    assert result.source_version == 0
    assert result.target_version == 2
    assert result.changed is True
    assert result.canonical_payload["schema_version"] == 2
    assert result.canonical_payload["representations"] == [
        {"asset_id": "legacy-light", "platform": "light"}
    ]
    representation = result.registry.get_representation("legacy-light")
    assert representation is not None
    assert representation.platform == "light"
    assert result.registry.get_representation("legacy-socket") is None


def test_historical_v1_shape_without_representations_is_migrated() -> None:
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
                "schema_version": 2,
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
''',
    encoding="utf-8",
)

# Add model regression checks without rewriting unrelated tests.
models_tests = ROOT / "tests/test_models.py"
text = models_tests.read_text(encoding="utf-8")
text = text.replace(
    '    assert binding.entity_id == "switch.relay_1"\n    assert binding.role == "primary"\n',
    '    assert binding.entity_id == "switch.relay_1"\n'
    '    assert binding.entity_registry_id is None\n'
    '    assert binding.role == "primary"\n',
    1,
)
text += '''


def test_binding_stable_entity_registry_identity_roundtrip() -> None:
    binding = Binding.create(
        asset_id="asset-1",
        capability="on_off",
        entity_id="switch.relay",
        entity_registry_id="  registry-entry-1  ",
    )

    assert binding.entity_registry_id == "registry-entry-1"
    assert Binding.from_dict(binding.to_dict()) == binding


def test_binding_replacement_clears_old_stable_identity_by_default() -> None:
    binding = Binding.create(
        asset_id="asset-1",
        capability="on_off",
        entity_id="switch.old",
        entity_registry_id="old-registry-entry",
    )

    replaced = binding.with_entity_id("switch.new")

    assert replaced.id == binding.id
    assert replaced.entity_id == "switch.new"
    assert replaced.entity_registry_id is None
'''
models_tests.write_text(text, encoding="utf-8")

(ROOT / "tests/test_binding_target_identity.py").write_text(
    '''"""Tests for persisted Binding target identity migration and capture."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.store import BindHomeStore, BindHomeStoreLoadError


def _v1_registry(entity_id: str) -> dict[str, object]:
    return {
        "schema_version": 1,
        "assets": [
            {
                "id": "asset-1",
                "name": "Relay",
                "asset_type": "relay",
                "code": None,
                "area_id": None,
                "capabilities": ["on_off"],
            }
        ],
        "relations": [],
        "bindings": [
            {
                "id": "binding-1",
                "asset_id": "asset-1",
                "capability": "on_off",
                "entity_id": entity_id,
                "role": "primary",
            }
        ],
        "representations": [],
    }


async def test_new_registered_binding_captures_entity_registry_identity(
    hass: HomeAssistant,
) -> None:
    entry = er.async_get(hass).async_get_or_create(
        "switch",
        "demo",
        "relay",
        suggested_object_id="relay",
    )
    hass.states.async_set(entry.entity_id, "off")

    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Relay",
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )

    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="primary",
    )

    assert binding.entity_id == entry.entity_id
    assert binding.entity_registry_id == entry.id


async def test_state_machine_only_binding_keeps_entity_id_fallback(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("switch.state_only", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="State only",
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )

    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="switch.state_only",
        role="primary",
    )

    assert binding.entity_registry_id is None
    assert binding.entity_id == "switch.state_only"


async def test_v1_store_migration_enriches_exact_registered_target(
    hass: HomeAssistant,
) -> None:
    entry = er.async_get(hass).async_get_or_create(
        "switch",
        "demo",
        "legacy",
        suggested_object_id="legacy",
    )
    store = BindHomeStore(hass)
    await store._store.async_save(_v1_registry(entry.entity_id))

    registry = await store.async_load()

    binding = registry.bindings["binding-1"]
    assert binding.entity_id == entry.entity_id
    assert binding.entity_registry_id == entry.id
    persisted = await store._store.async_load()
    assert persisted is not None
    assert persisted["schema_version"] == 2
    assert persisted["bindings"][0]["entity_registry_id"] == entry.id


async def test_v1_migration_never_guesses_a_different_registered_target(
    hass: HomeAssistant,
) -> None:
    er.async_get(hass).async_get_or_create(
        "switch",
        "demo",
        "different",
        suggested_object_id="different",
    )
    store = BindHomeStore(hass)
    await store._store.async_save(_v1_registry("switch.missing"))

    registry = await store.async_load()

    binding = registry.bindings["binding-1"]
    assert binding.entity_id == "switch.missing"
    assert binding.entity_registry_id is None


async def test_invalid_v1_binding_does_not_trigger_canonical_write(
    hass: HomeAssistant,
) -> None:
    payload = _v1_registry("switch.legacy")
    binding = payload["bindings"][0]
    assert isinstance(binding, dict)
    binding.pop("entity_id")

    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=True)  # type: ignore[method-assign]
    store._store.async_load = AsyncMock(return_value=payload)  # type: ignore[method-assign]
    store.async_save = AsyncMock()  # type: ignore[method-assign]

    with pytest.raises(BindHomeStoreLoadError, match="invalid"):
        await store.async_load()

    store.async_save.assert_not_awaited()
''',
    encoding="utf-8",
)

print("Binding target schema v2 changes staged")
