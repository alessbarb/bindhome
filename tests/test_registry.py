"""Tests for BindHome registry behavior."""

import pytest

from custom_components.bindhome.models import Asset, Binding, Relation
from custom_components.bindhome.registry import (
    BindHomeRegistry,
    RegistryConflictError,
    RegistryValidationError,
)


def test_set_binding_replaces_hardware_without_replacing_asset() -> None:
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


def test_binding_requires_declared_capability() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(name="Circuit", asset_type="circuit", capabilities=[])
    )

    with pytest.raises(RegistryValidationError):
        registry.set_binding(
            Binding.create(
                asset_id=asset.id,
                capability="power_measurement",
                entity_id="sensor.circuit_power",
            )
        )


def test_asset_with_topology_cannot_be_deleted() -> None:
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

    with pytest.raises(RegistryConflictError):
        registry.delete_asset(source.id)
