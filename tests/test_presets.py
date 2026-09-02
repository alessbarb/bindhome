"""Tests for BindHome built-in creation presets."""

from custom_components.bindhome.models import Asset
from custom_components.bindhome.presets import (
    CREATION_PRESETS,
    CreationPreset,
    list_creation_presets,
)

EXPECTED_GROUP_ORDER = (
    "electrical",
    "network",
    "climate",
    "water",
    "building",
    "equipment",
)


def test_builtin_preset_catalogue_is_stable_and_unique() -> None:
    presets = list_creation_presets()

    assert presets is CREATION_PRESETS
    assert len(presets) == 29

    preset_ids = [preset.preset_id for preset in presets]
    asset_types = [preset.asset_type for preset in presets]

    assert len(preset_ids) == len(set(preset_ids))
    assert len(asset_types) == len(set(asset_types))

    # Built-ins intentionally use asset_type as their stable preset identity.
    assert preset_ids == asset_types


def test_builtin_groups_follow_inventory_questionnaire_order() -> None:
    groups = tuple(dict.fromkeys(preset.group for preset in CREATION_PRESETS))

    assert groups == EXPECTED_GROUP_ORDER


def test_every_preset_produces_a_valid_editable_asset_draft() -> None:
    for preset in CREATION_PRESETS:
        asset = Asset.create(
            name=preset.default_name,
            asset_type=preset.asset_type,
            capabilities=list(preset.suggested_capabilities),
        )

        assert asset.name == preset.default_name
        assert asset.asset_type == preset.asset_type
        assert asset.capabilities == preset.suggested_capabilities


def test_preset_serialization_contains_only_ux_suggestions() -> None:
    preset = CreationPreset.create(
        preset_id="test_device",
        group="equipment",
        asset_type="test_device",
        default_name="Test device",
        suggested_capabilities=("on_off",),
    )

    assert preset.to_dict() == {
        "preset_id": "test_device",
        "group": "equipment",
        "asset_type": "test_device",
        "default_name": "Test device",
        "suggested_capabilities": ["on_off"],
    }

    # Inventory presets must never imply automation or HA exposure.
    assert "representation" not in preset.to_dict()
    assert "binding" not in preset.to_dict()
    assert "entity_id" not in preset.to_dict()


def test_preset_capabilities_are_normalized_suggestions() -> None:
    preset = CreationPreset.create(
        preset_id="example",
        group="equipment",
        asset_type="example_device",
        default_name="Example",
        suggested_capabilities=(
            "position",
            "on_off",
            "position",
        ),
    )

    assert preset.suggested_capabilities == ("on_off", "position")


def test_custom_assets_remain_valid_without_any_preset() -> None:
    asset = Asset.create(
        name="Solar inverter",
        asset_type="solar_inverter",
        capabilities=["generation", "power_measurement"],
    )

    assert asset.asset_type == "solar_inverter"
    assert asset.capabilities == ("generation", "power_measurement")
    assert all(preset.asset_type != asset.asset_type for preset in CREATION_PRESETS)


def test_socket_preset_does_not_assume_switchability() -> None:
    socket = next(preset for preset in CREATION_PRESETS if preset.preset_id == "socket")

    assert socket.suggested_capabilities == ()


def test_light_point_suggests_capability_but_not_representation() -> None:
    light_point = next(
        preset for preset in CREATION_PRESETS if preset.preset_id == "light_point"
    )

    assert light_point.suggested_capabilities == ("on_off",)
    assert set(light_point.to_dict()) == {
        "preset_id",
        "group",
        "asset_type",
        "default_name",
        "suggested_capabilities",
    }
