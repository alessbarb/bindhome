"""Tests for BindHome registry behavior."""

import pytest

from custom_components.bindhome.models import Asset, Binding, Relation
from custom_components.bindhome.registry import (
    BindHomeRegistry,
    RegistryConflictError,
    RegistryNotFoundError,
    RegistryValidationError,
)


def test_add_asset_and_get_asset() -> None:
    registry = BindHomeRegistry()
    asset = Asset.create(
        name="Living room ceiling light",
        asset_type="light_point",
        code="LGT-01",
        capabilities=["on_off"],
    )
    added = registry.add_asset(asset)

    assert added == asset
    assert registry.get_asset(asset.id) == asset


def test_add_asset_duplicate_id() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(Asset.create(name="Light 1", asset_type="light_point"))

    duplicate_id_asset = Asset(
        id=asset.id,
        name="Light 2",
        asset_type="light_point",
    )

    with pytest.raises(RegistryConflictError, match="already exists"):
        registry.add_asset(duplicate_id_asset)


def test_add_asset_duplicate_code() -> None:
    registry = BindHomeRegistry()
    registry.add_asset(
        Asset.create(name="Light 1", asset_type="light_point", code="LGT-01")
    )

    with pytest.raises(RegistryConflictError, match="Asset code LGT-01 already exists"):
        registry.add_asset(
            Asset.create(name="Light 2", asset_type="light_point", code="LGT-01")
        )


def test_get_missing_asset() -> None:
    registry = BindHomeRegistry()
    with pytest.raises(RegistryNotFoundError, match="was not found"):
        registry.get_asset("non-existent-id")


def test_update_asset_capabilities_without_bindings() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(name="Light", asset_type="light_point", capabilities=["on_off"])
    )

    updated = registry.update_asset_capabilities(asset.id, ["on_off", "dimming"])

    assert updated.capabilities == ("dimming", "on_off")
    assert registry.get_asset(asset.id).capabilities == ("dimming", "on_off")


def test_update_asset_capabilities_blocked_by_active_binding() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Light",
            asset_type="light_point",
            capabilities=["on_off", "dimming"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="dimming",
            entity_id="light.living_room",
        )
    )

    with pytest.raises(
        RegistryConflictError,
        match="Cannot remove capabilities that still have active bindings",
    ):
        registry.update_asset_capabilities(asset.id, ["on_off"])


def test_delete_clean_asset() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(Asset.create(name="Light", asset_type="light_point"))

    registry.delete_asset(asset.id)

    assert asset.id not in registry.assets
    with pytest.raises(RegistryNotFoundError):
        registry.get_asset(asset.id)


def test_delete_asset_blocked_by_relation() -> None:
    registry = BindHomeRegistry()
    source = registry.add_asset(Asset.create(name="Circuit", asset_type="circuit"))
    target = registry.add_asset(Asset.create(name="Socket", asset_type="socket"))
    registry.add_relation(
        Relation.create(
            source_asset_id=source.id,
            relation_type="feeds",
            target_asset_id=target.id,
        )
    )

    with pytest.raises(
        RegistryConflictError, match="Cannot delete an asset used by a relation"
    ):
        registry.delete_asset(source.id)

    with pytest.raises(
        RegistryConflictError, match="Cannot delete an asset used by a relation"
    ):
        registry.delete_asset(target.id)


def test_delete_asset_blocked_by_binding() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(name="Light", asset_type="light_point", capabilities=["on_off"])
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.relay",
        )
    )

    with pytest.raises(
        RegistryConflictError, match="Cannot delete an asset with active bindings"
    ):
        registry.delete_asset(asset.id)


def test_add_valid_relation() -> None:
    registry = BindHomeRegistry()
    source = registry.add_asset(Asset.create(name="Panel", asset_type="panel"))
    target = registry.add_asset(Asset.create(name="Circuit", asset_type="circuit"))

    relation = registry.add_relation(
        Relation.create(
            source_asset_id=source.id,
            relation_type="feeds",
            target_asset_id=target.id,
        )
    )

    assert relation.id in registry.relations
    assert registry.relations[relation.id] == relation


def test_add_relation_missing_source_or_target() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(Asset.create(name="Panel", asset_type="panel"))

    with pytest.raises(RegistryNotFoundError, match="was not found"):
        registry.add_relation(
            Relation.create(
                source_asset_id="missing-id",
                relation_type="feeds",
                target_asset_id=asset.id,
            )
        )

    with pytest.raises(RegistryNotFoundError, match="was not found"):
        registry.add_relation(
            Relation.create(
                source_asset_id=asset.id,
                relation_type="feeds",
                target_asset_id="missing-id",
            )
        )


def test_add_duplicate_relation() -> None:
    registry = BindHomeRegistry()
    source = registry.add_asset(Asset.create(name="Panel", asset_type="panel"))
    target = registry.add_asset(Asset.create(name="Circuit", asset_type="circuit"))

    registry.add_relation(
        Relation.create(
            source_asset_id=source.id,
            relation_type="feeds",
            target_asset_id=target.id,
        )
    )

    with pytest.raises(
        RegistryConflictError, match="same topology relation already exists"
    ):
        registry.add_relation(
            Relation.create(
                source_asset_id=source.id,
                relation_type="feeds",
                target_asset_id=target.id,
            )
        )


def test_remove_relation() -> None:
    registry = BindHomeRegistry()
    source = registry.add_asset(Asset.create(name="Panel", asset_type="panel"))
    target = registry.add_asset(Asset.create(name="Circuit", asset_type="circuit"))

    relation = registry.add_relation(
        Relation.create(
            source_asset_id=source.id,
            relation_type="feeds",
            target_asset_id=target.id,
        )
    )

    registry.remove_relation(relation.id)
    assert relation.id not in registry.relations

    with pytest.raises(RegistryNotFoundError, match="was not found"):
        registry.remove_relation(relation.id)


def test_set_binding_and_missing_asset() -> None:
    registry = BindHomeRegistry()
    with pytest.raises(RegistryNotFoundError, match="was not found"):
        registry.set_binding(
            Binding.create(
                asset_id="missing-asset",
                capability="on_off",
                entity_id="switch.relay",
            )
        )


def test_set_binding_requires_declared_capability() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(name="Circuit", asset_type="circuit", capabilities=[])
    )

    with pytest.raises(RegistryValidationError, match="does not provide capability"):
        registry.set_binding(
            Binding.create(
                asset_id=asset.id,
                capability="power_measurement",
                entity_id="sensor.circuit_power",
            )
        )


def test_set_binding_replaces_hardware_and_preserves_binding_id() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Living room ceiling light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )

    first = registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.shelly_relay",
        )
    )
    second = registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.sonoff_relay",
        )
    )

    assert second.id == first.id
    assert second.asset_id == asset.id
    assert second.entity_id == "switch.sonoff_relay"
    assert len(registry.bindings) == 1


def test_independent_roles_and_capabilities_for_same_asset() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Radiator",
            asset_type="radiator",
            capabilities=["temperature", "on_off"],
        )
    )

    b_primary = registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.valve_primary",
            role="primary",
        )
    )
    b_backup = registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.valve_backup",
            role="backup",
        )
    )
    b_temp = registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="temperature",
            entity_id="sensor.radiator_temp",
            role="primary",
        )
    )

    assert len(registry.bindings) == 3
    assert b_primary.id != b_backup.id
    assert b_primary.id != b_temp.id


def test_remove_binding() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(name="Light", asset_type="light_point", capabilities=["on_off"])
    )
    binding = registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id="switch.relay",
        )
    )

    registry.remove_binding(binding.id)
    assert binding.id not in registry.bindings

    with pytest.raises(RegistryNotFoundError, match="was not found"):
        registry.remove_binding(binding.id)


def test_registry_full_serialization_and_deserialization() -> None:
    registry = BindHomeRegistry()
    source = registry.add_asset(
        Asset.create(
            name="Panel",
            asset_type="panel",
            code="PNL-1",
            capabilities=["power_measurement"],
        )
    )
    target = registry.add_asset(
        Asset.create(
            name="Light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )
    relation = registry.add_relation(
        Relation.create(
            source_asset_id=source.id,
            relation_type="feeds",
            target_asset_id=target.id,
        )
    )
    binding = registry.set_binding(
        Binding.create(
            asset_id=target.id,
            capability="on_off",
            entity_id="switch.light_switch",
        )
    )

    data = registry.to_dict()
    assert data["schema_version"] == 1
    assert len(data["assets"]) == 2
    assert len(data["relations"]) == 1
    assert len(data["bindings"]) == 1
    assert len(data["representations"]) == 0

    restored = BindHomeRegistry.from_dict(data)
    assert len(restored.assets) == 2
    assert len(restored.relations) == 1
    assert len(restored.bindings) == 1
    assert len(restored.representations) == 0
    assert restored.assets[source.id] == source
    assert restored.assets[target.id] == target
    assert restored.relations[relation.id] == relation
    assert restored.bindings[binding.id] == binding


def test_registry_deserialization_unsupported_version() -> None:
    with pytest.raises(
        RegistryValidationError, match="Unsupported registry schema version"
    ):
        BindHomeRegistry.from_dict({"schema_version": 999})


def test_registry_deserialization_malformed_objects() -> None:
    with pytest.raises(
        RegistryValidationError, match="Persisted registry must be a dictionary"
    ):
        BindHomeRegistry.from_dict("not a dict")  # type: ignore[arg-type]

    # Invalid asset in persisted data
    malformed_asset_data = {
        "schema_version": 1,
        "assets": [{"id": "a-1", "name": ""}],  # missing asset_type, empty name
    }
    with pytest.raises(RegistryValidationError, match="Invalid asset in registry"):
        BindHomeRegistry.from_dict(malformed_asset_data)

    # Invalid relation in persisted data (referencing non-existent asset)
    malformed_relation_data = {
        "schema_version": 1,
        "assets": [{"id": "a-1", "name": "Asset 1", "asset_type": "socket"}],
        "relations": [
            {
                "id": "r-1",
                "source_asset_id": "a-1",
                "relation_type": "feeds",
                "target_asset_id": "non-existent",
            }
        ],
    }
    with pytest.raises(RegistryValidationError, match="Invalid relation in registry"):
        BindHomeRegistry.from_dict(malformed_relation_data)

    # Invalid binding in persisted data (undeclared capability)
    malformed_binding_data = {
        "schema_version": 1,
        "assets": [
            {
                "id": "a-1",
                "name": "Asset 1",
                "asset_type": "socket",
                "capabilities": [],
            }
        ],
        "bindings": [
            {
                "id": "b-1",
                "asset_id": "a-1",
                "capability": "on_off",
                "entity_id": "switch.relay",
            }
        ],
    }
    with pytest.raises(RegistryValidationError, match="Invalid binding in registry"):
        BindHomeRegistry.from_dict(malformed_binding_data)
