"""Tests for safe transactional Asset deletion."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.const import DOMAIN
from custom_components.bindhome.deletion import (
    async_delete_asset_with_dependencies,
    build_asset_delete_impact,
)
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.models import Asset, Binding, Relation, Representation


def _build_composed_registry(hass: HomeAssistant) -> tuple[BindHomeManager, str, str]:
    manager = BindHomeManager(hass)
    target = manager.registry.add_asset(
        Asset.create(
            name="Target light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )
    dependent = manager.registry.add_asset(
        Asset.create(
            name="Dependent light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )
    manager.registry.add_relation(
        Relation.create(
            source_asset_id=dependent.id,
            relation_type="feeds",
            target_asset_id=target.id,
        )
    )
    manager.registry.set_binding(
        Binding.create(
            asset_id=target.id,
            capability="on_off",
            role="primary",
            entity_id="switch.physical_target",
        )
    )
    manager.registry.set_representation(
        Representation.create(asset_id=target.id, platform="light")
    )

    logical = er.async_get(hass).async_get_or_create(
        "light",
        DOMAIN,
        f"{DOMAIN}_{target.id}",
        suggested_object_id="target_light",
    )
    manager.registry.set_binding(
        Binding.create(
            asset_id=dependent.id,
            capability="on_off",
            role="primary",
            entity_id=logical.entity_id,
        )
    )
    return manager, target.id, dependent.id


def test_delete_impact_includes_cross_asset_bindings(hass: HomeAssistant) -> None:
    """Preview dependencies owned by and pointing to the Asset."""
    manager, target_id, dependent_id = _build_composed_registry(hass)

    impact = build_asset_delete_impact(manager, target_id)

    assert len(impact.relations) == 1
    assert len(impact.owned_bindings) == 1
    assert len(impact.dependent_bindings) == 1
    assert impact.dependent_bindings[0].asset_id == dependent_id
    assert impact.representation is not None
    assert impact.logical_entity_id == "light.target_light"


async def test_delete_with_dependencies_is_one_consistent_mutation(
    hass: HomeAssistant,
) -> None:
    """Cascade removes BindHome references but preserves unrelated Assets."""
    manager, target_id, dependent_id = _build_composed_registry(hass)

    impact = await async_delete_asset_with_dependencies(manager, target_id)

    assert impact.asset_id == target_id
    assert target_id not in manager.registry.assets
    assert dependent_id in manager.registry.assets
    assert not manager.registry.relations
    assert not manager.registry.bindings
    assert target_id not in manager.registry.representations


async def test_delete_with_dependencies_storage_failure_is_atomic(
    hass: HomeAssistant,
) -> None:
    """A failed persistent write must leave the live Registry untouched."""
    manager, target_id, dependent_id = _build_composed_registry(hass)
    before = manager.registry.to_dict()
    manager._store.async_save = AsyncMock(side_effect=RuntimeError("disk failed"))

    with pytest.raises(RuntimeError, match="disk failed"):
        await async_delete_asset_with_dependencies(manager, target_id)

    assert manager.registry.to_dict() == before
    assert target_id in manager.registry.assets
    assert dependent_id in manager.registry.assets
