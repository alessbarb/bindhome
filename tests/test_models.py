"""Tests for BindHome core models."""

import pytest

from custom_components.bindhome.models import (
    Asset,
    Binding,
    ModelValidationError,
    Relation,
    Representation,
)


def test_asset_valid_creation_minimal() -> None:
    asset = Asset.create(name="Ceiling Light", asset_type="light_point")
    assert asset.id is not None
    assert asset.name == "Ceiling Light"
    assert asset.asset_type == "light_point"
    assert asset.code is None
    assert asset.area_id is None
    assert asset.capabilities == ()


def test_asset_valid_creation_full() -> None:
    asset = Asset.create(
        name="Living Room Main Light",
        asset_type="light_point",
        code="LGT-01",
        area_id="living_room",
        capabilities=["dimming", "on_off"],
    )
    assert asset.name == "Living Room Main Light"
    assert asset.asset_type == "light_point"
    assert asset.code == "LGT-01"
    assert asset.area_id == "living_room"
    assert asset.capabilities == ("dimming", "on_off")


def test_asset_immutable_generated_id_behavior() -> None:
    asset1 = Asset.create(name="Light 1", asset_type="light_point")
    asset2 = Asset.create(name="Light 2", asset_type="light_point")
    assert asset1.id != asset2.id
    assert len(asset1.id) > 0
    assert len(asset2.id) > 0


def test_asset_whitespace_normalization() -> None:
    asset = Asset.create(
        name="  Ceiling Light  ",
        asset_type="  light_point  ",
        code="  LGT-01  ",
        area_id="  living_room  ",
        capabilities=["  on_off  "],
    )
    assert asset.name == "Ceiling Light"
    assert asset.asset_type == "light_point"
    assert asset.code == "LGT-01"
    assert asset.area_id == "living_room"
    assert asset.capabilities == ("on_off",)


def test_asset_empty_name_rejection() -> None:
    with pytest.raises(ModelValidationError, match="name must not be empty"):
        Asset.create(name="", asset_type="light_point")

    with pytest.raises(ModelValidationError, match="name must not be empty"):
        Asset.create(name="   ", asset_type="light_point")


def test_asset_type_normalization_and_invalid_identifiers() -> None:
    with pytest.raises(
        ModelValidationError, match="asset_type must use lower_snake_case"
    ):
        Asset.create(name="Light", asset_type="Light Point")

    with pytest.raises(
        ModelValidationError, match="asset_type must use lower_snake_case"
    ):
        Asset.create(name="Light", asset_type="light-point")

    with pytest.raises(
        ModelValidationError, match="asset_type must use lower_snake_case"
    ):
        Asset.create(name="Light", asset_type="123_light")


def test_asset_duplicate_capabilities_and_sorting() -> None:
    asset = Asset.create(
        name="Light",
        asset_type="light_point",
        capabilities=["on_off", "dimming", "on_off", "color_temp"],
    )
    assert asset.capabilities == ("color_temp", "dimming", "on_off")


def test_asset_optional_code_and_area_id_behavior() -> None:
    asset_none = Asset.create(
        name="Socket", asset_type="socket", code=None, area_id=None
    )
    assert asset_none.code is None
    assert asset_none.area_id is None

    with pytest.raises(ModelValidationError, match="code must not be empty"):
        Asset.create(name="Socket", asset_type="socket", code="  ")

    with pytest.raises(ModelValidationError, match="area_id must not be empty"):
        Asset.create(name="Socket", asset_type="socket", area_id="  ")


def test_asset_with_capabilities() -> None:
    asset = Asset.create(
        name="Light", asset_type="light_point", capabilities=["on_off"]
    )
    updated = asset.with_capabilities(["on_off", "dimming"])
    assert asset.capabilities == ("on_off",)
    assert updated.capabilities == ("dimming", "on_off")
    assert updated.id == asset.id


def test_asset_serialization_deserialization() -> None:
    original = Asset.create(
        name="Radiator",
        asset_type="radiator",
        code="RAD-1",
        area_id="bedroom",
        capabilities=["temperature", "setpoint"],
    )
    serialized = original.to_dict()
    deserialized = Asset.from_dict(serialized)

    assert deserialized == original

    # Test deserialization error cases
    with pytest.raises(ModelValidationError):
        Asset.from_dict("not a dict")  # type: ignore[arg-type]

    with pytest.raises(ModelValidationError, match="Missing required asset field"):
        Asset.from_dict({"id": "a-1", "name": "Radiator"})

    with pytest.raises(ModelValidationError, match="Capabilities must be a list"):
        Asset.from_dict(
            {
                "id": "a-1",
                "name": "Radiator",
                "asset_type": "radiator",
                "capabilities": "on_off",
            }
        )


def test_representation_creation_and_roundtrip() -> None:
    representation = Representation.create(
        asset_id="  asset-1  ",
        platform="  LIGHT  ",
    )

    assert representation.asset_id == "asset-1"
    assert representation.platform == "light"
    assert Representation.from_dict(representation.to_dict()) == representation


def test_representation_rejects_invalid_platform_identifier() -> None:
    with pytest.raises(
        ModelValidationError,
        match="platform must use lower_snake_case",
    ):
        Representation.create(
            asset_id="asset-1",
            platform="Light Proxy",
        )


def test_relation_valid_creation() -> None:
    relation = Relation.create(
        source_asset_id="asset-1",
        relation_type="feeds",
        target_asset_id="asset-2",
    )
    assert relation.id is not None
    assert relation.source_asset_id == "asset-1"
    assert relation.relation_type == "feeds"
    assert relation.target_asset_id == "asset-2"


def test_relation_identifier_validation() -> None:
    with pytest.raises(
        ModelValidationError, match="relation_type must use lower_snake_case"
    ):
        Relation.create(
            source_asset_id="asset-1",
            relation_type="Feeds-Power",
            target_asset_id="asset-2",
        )


def test_relation_self_referencing_rejection() -> None:
    with pytest.raises(ModelValidationError, match="cannot connect an asset to itself"):
        Relation.create(
            source_asset_id="asset-1",
            relation_type="feeds",
            target_asset_id="asset-1",
        )


def test_relation_serialization_deserialization() -> None:
    original = Relation.create(
        source_asset_id="asset-1",
        relation_type="protects",
        target_asset_id="asset-2",
    )
    serialized = original.to_dict()
    deserialized = Relation.from_dict(serialized)

    assert deserialized == original

    with pytest.raises(ModelValidationError):
        Relation.from_dict("not a dict")  # type: ignore[arg-type]

    with pytest.raises(ModelValidationError, match="Missing required relation field"):
        Relation.from_dict({"id": "r-1", "source_asset_id": "a-1"})

    with pytest.raises(ModelValidationError, match="cannot connect an asset to itself"):
        Relation.from_dict(
            {
                "id": "r-1",
                "source_asset_id": "a-1",
                "relation_type": "feeds",
                "target_asset_id": "a-1",
            }
        )


def test_binding_valid_creation() -> None:
    binding = Binding.create(
        asset_id="asset-1",
        capability="on_off",
        entity_id="switch.relay_1",
    )
    assert binding.id is not None
    assert binding.asset_id == "asset-1"
    assert binding.capability == "on_off"
    assert binding.entity_id == "switch.relay_1"
    assert binding.entity_registry_id is None
    assert binding.role == "primary"


def test_binding_capability_and_role_normalization() -> None:
    binding = Binding.create(
        asset_id="  asset-1  ",
        capability="  ON_OFF  ",
        entity_id="  switch.relay_1  ",
        role="  SECONDARY  ",
    )
    assert binding.asset_id == "asset-1"
    assert binding.capability == "on_off"
    assert binding.entity_id == "switch.relay_1"
    assert binding.role == "secondary"


def test_binding_entity_id_handling() -> None:
    with pytest.raises(ModelValidationError, match="entity_id must not be empty"):
        Binding.create(asset_id="a-1", capability="on_off", entity_id="   ")


def test_binding_replacement_preserves_binding_identity() -> None:
    binding = Binding.create(
        asset_id="asset-1",
        capability="on_off",
        entity_id="switch.old_relay",
    )

    replaced = binding.with_entity_id("switch.new_relay")

    assert replaced.id == binding.id
    assert replaced.entity_id == "switch.new_relay"
    assert replaced.asset_id == binding.asset_id
    assert replaced.capability == binding.capability
    assert replaced.role == binding.role


def test_binding_serialization_deserialization() -> None:
    original = Binding.create(
        asset_id="asset-1",
        capability="power_measurement",
        entity_id="sensor.power_meter",
        role="meter",
    )
    serialized = original.to_dict()
    deserialized = Binding.from_dict(serialized)

    assert deserialized == original

    with pytest.raises(ModelValidationError):
        Binding.from_dict("not a dict")  # type: ignore[arg-type]

    with pytest.raises(ModelValidationError, match="Missing required binding field"):
        Binding.from_dict({"id": "b-1", "asset_id": "a-1"})


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
