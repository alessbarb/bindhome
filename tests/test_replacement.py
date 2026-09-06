"""Tests for guided hardware replacement."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.replacement import (
    ReplacementError,
    async_replace_binding,
    replacement_candidates,
)
from custom_components.bindhome.store import BindHomeStoreError


def _entity(
    hass: HomeAssistant,
    domain: str,
    unique_id: str,
    *,
    area_id: str | None = None,
    device_class: str | None = None,
):
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        domain,
        "demo",
        unique_id,
        suggested_object_id=unique_id.replace("-", "_"),
        original_device_class=device_class,
    )
    if area_id is not None:
        registry.async_update_entity(entry.entity_id, area_id=area_id)
        entry = registry.async_get(entry.entity_id)
        assert entry is not None
    hass.states.async_set(entry.entity_id, "off")
    return entry


async def _manager_with_bound_light(hass: HomeAssistant):
    area = ar.async_get(hass).async_create("Living room")
    old = _entity(hass, "switch", "old-relay", area_id=area.id)
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Ceiling light",
        asset_type="light_point",
        code="LIVING-L1",
        area_id=area.id,
        capabilities=["on_off"],
    )
    await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=old.entity_id,
        role="primary",
    )
    return manager, asset, area, old


async def test_candidates_filter_and_rank_safe_replacements(
    hass: HomeAssistant,
) -> None:
    manager, asset, area, old = await _manager_with_bound_light(hass)
    same_area = _entity(hass, "switch", "new-relay", area_id=area.id)
    other_area = ar.async_get(hass).async_create("Garage")
    other = _entity(hass, "light", "garage-light", area_id=other_area.id)
    incompatible = _entity(hass, "sensor", "temperature", device_class="temperature")

    plan = replacement_candidates(
        hass,
        manager,
        asset_id=asset.id,
        capability="on_off",
    )

    ids = [candidate["entity_id"] for candidate in plan["candidates"]]
    assert old.entity_id not in ids
    assert incompatible.entity_id not in ids
    assert ids.index(same_area.entity_id) < ids.index(other.entity_id)
    assert plan["current"]["entity_id"] == old.entity_id
    assert plan["current"]["config_valid"] is True
    assert "same_area" in plan["candidates"][0]["reasons"]


async def test_candidate_bound_to_another_asset_is_not_offered(
    hass: HomeAssistant,
) -> None:
    manager, asset, area, _old = await _manager_with_bound_light(hass)
    shared = _entity(hass, "switch", "shared-relay", area_id=area.id)
    other = await manager.async_create_asset(
        name="Other light",
        asset_type="light_point",
        code=None,
        area_id=area.id,
        capabilities=["on_off"],
    )
    await manager.async_set_binding(
        asset_id=other.id,
        capability="on_off",
        entity_id=shared.entity_id,
        role="primary",
    )

    plan = replacement_candidates(
        hass,
        manager,
        asset_id=asset.id,
        capability="on_off",
    )

    assert shared.entity_id not in {
        candidate["entity_id"] for candidate in plan["candidates"]
    }


async def test_successful_replacement_preserves_asset_topology_and_representation(
    hass: HomeAssistant,
) -> None:
    manager, asset, area, old = await _manager_with_bound_light(hass)
    new = _entity(hass, "light", "new-light", area_id=area.id)
    target = await manager.async_create_asset(
        name="Panel",
        asset_type="electrical_panel",
        code="PANEL-1",
        area_id=None,
        capabilities=[],
    )
    relation = await manager.async_add_relation(
        source_asset_id=target.id,
        relation_type="feeds",
        target_asset_id=asset.id,
    )
    representation = await manager.async_set_representation(
        asset_id=asset.id,
        platform="light",
    )
    before_asset = manager.registry.get_asset(asset.id)
    before_relation = manager.registry.relations[relation.id]
    before_representation = manager.registry.representations[asset.id]
    revision = manager.revision

    result = await async_replace_binding(
        hass,
        manager,
        asset_id=asset.id,
        capability="on_off",
        entity_id=new.entity_id,
        expected_revision=revision,
    )

    assert result["resolution"]["entity_id"] == new.entity_id
    assert manager.registry.get_asset(asset.id) == before_asset
    assert manager.registry.relations[relation.id] == before_relation
    assert manager.registry.representations[asset.id] == before_representation
    assert representation == before_representation
    assert representation.asset_id == asset.id
    binding = manager.registry.get_binding(asset.id, "on_off", "primary")
    assert binding is not None
    assert binding.entity_id == new.entity_id
    assert binding.entity_id != old.entity_id


async def test_stale_or_incompatible_choice_is_rejected_before_mutation(
    hass: HomeAssistant,
) -> None:
    manager, asset, _area, old = await _manager_with_bound_light(hass)
    sensor = _entity(hass, "sensor", "temperature", device_class="temperature")
    baseline = manager.registry.to_dict()

    with pytest.raises(ReplacementError):
        await async_replace_binding(
            hass,
            manager,
            asset_id=asset.id,
            capability="on_off",
            entity_id=sensor.entity_id,
            expected_revision=manager.revision,
        )

    assert manager.registry.to_dict() == baseline
    assert (
        manager.registry.get_binding(asset.id, "on_off", "primary").entity_id
        == old.entity_id
    )


async def test_entity_removed_after_review_is_rejected(hass: HomeAssistant) -> None:
    manager, asset, area, old = await _manager_with_bound_light(hass)
    candidate = _entity(hass, "switch", "replacement", area_id=area.id)
    revision = manager.revision
    plan = replacement_candidates(
        hass,
        manager,
        asset_id=asset.id,
        capability="on_off",
    )
    assert candidate.entity_id in {item["entity_id"] for item in plan["candidates"]}
    er.async_get(hass).async_remove(candidate.entity_id)
    hass.states.async_remove(candidate.entity_id)

    with pytest.raises(ReplacementError):
        await async_replace_binding(
            hass,
            manager,
            asset_id=asset.id,
            capability="on_off",
            entity_id=candidate.entity_id,
            expected_revision=revision,
        )

    assert (
        manager.registry.get_binding(asset.id, "on_off", "primary").entity_id
        == old.entity_id
    )


async def test_storage_failure_keeps_old_binding(hass: HomeAssistant) -> None:
    manager, asset, area, old = await _manager_with_bound_light(hass)
    candidate = _entity(hass, "switch", "replacement", area_id=area.id)
    revision = manager.revision
    manager._store.async_save = AsyncMock(side_effect=BindHomeStoreError("boom"))

    with pytest.raises(BindHomeStoreError):
        await async_replace_binding(
            hass,
            manager,
            asset_id=asset.id,
            capability="on_off",
            entity_id=candidate.entity_id,
            expected_revision=revision,
        )

    binding = manager.registry.get_binding(asset.id, "on_off", "primary")
    assert binding is not None
    assert binding.entity_id == old.entity_id
    assert manager.revision == revision
