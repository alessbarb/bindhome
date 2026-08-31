"""Tests for BindHome core models."""

import pytest

from custom_components.bindhome.models import Asset, Binding, ModelValidationError


def test_asset_capabilities_are_normalized_and_deduplicated() -> None:
    asset = Asset.create(
        name="Living room ceiling light",
        asset_type="light_point",
        capabilities=["on_off", "dimming", "on_off"],
    )

    assert asset.capabilities == ("dimming", "on_off")


def test_invalid_identifier_is_rejected() -> None:
    with pytest.raises(ModelValidationError):
        Asset.create(name="Light", asset_type="Light Point")


def test_binding_replacement_preserves_binding_identity() -> None:
    binding = Binding.create(
        asset_id="asset-1",
        capability="on_off",
        entity_id="switch.old_relay",
    )

    replaced = binding.with_entity_id("switch.new_relay")

    assert replaced.id == binding.id
    assert replaced.entity_id == "switch.new_relay"
