"""Tests for atomic assisted-import commit."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.import_commit import (
    ImportBindingSelector,
    async_commit_reviewed_imports,
    select_proposal_bindings,
)
from custom_components.bindhome.import_proposals import (
    ImportAssetCandidate,
    ImportBindingCandidate,
    ImportDecision,
    ImportDecisionAction,
    ImportProposal,
    ImportSource,
)
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.registry import (
    RegistryConflictError,
    RegistryNotFoundError,
)


def _proposal(
    manager: BindHomeManager,
    *,
    name: str,
    entity_id: str,
    entity_registry_id: str | None = None,
    candidate_key: str | None = None,
) -> ImportProposal:
    return ImportProposal.create(
        source=ImportSource.create(
            entity_ids=(entity_id,),
            entity_registry_ids=(
                (entity_registry_id,) if entity_registry_id is not None else ()
            ),
        ),
        asset=ImportAssetCandidate.create(
            name=name,
            asset_type="switch",
            capabilities=("on_off",),
        ),
        bindings=(
            ImportBindingCandidate.create(
                capability="on_off",
                entity_id=entity_id,
                entity_registry_id=entity_registry_id,
            ),
        ),
        existing_assets=manager.registry.assets.values(),
        existing_bindings=manager.registry.bindings.values(),
        candidate_key=candidate_key or entity_registry_id or entity_id,
    )


async def test_mixed_create_merge_skip_commits_once(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.new", "off")
    hass.states.async_set("switch.merge", "off")
    hass.states.async_set("switch.skip", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    existing = await manager.async_create_asset(
        name="Existing point",
        asset_type="switch",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    revision = manager.revision
    manager._store.async_save = AsyncMock(wraps=manager._store.async_save)

    create_proposal = _proposal(manager, name="New", entity_id="switch.new")
    merge_proposal = _proposal(manager, name="Merge", entity_id="switch.merge")
    skip_proposal = _proposal(manager, name="Skip", entity_id="switch.skip")
    reviewed_asset = ImportAssetCandidate.create(
        name="Renamed new point",
        asset_type="relay_point",
        capabilities=("on_off",),
    )

    result = await async_commit_reviewed_imports(
        manager,
        (
            (
                create_proposal,
                ImportDecision.create(
                    action=ImportDecisionAction.CREATE,
                    asset=reviewed_asset,
                ),
            ),
            (
                merge_proposal,
                ImportDecision.create(
                    action=ImportDecisionAction.MERGE,
                    target_asset_id=existing.id,
                ),
            ),
            (
                skip_proposal,
                ImportDecision.create(action=ImportDecisionAction.SKIP),
            ),
        ),
        expected_revision=revision,
    )

    assert result.created == 1
    assert result.merged == 1
    assert result.skipped == 1
    assert result.bindings_applied == 2
    assert result.revision == revision + 1
    assert manager._store.async_save.await_count == 1
    created = next(
        asset for asset in manager.registry.assets.values() if asset.id != existing.id
    )
    assert created.name == "Renamed new point"
    assert created.asset_type == "relay_point"
    assert {binding.asset_id for binding in manager.registry.bindings.values()} == {
        existing.id,
        created.id,
    }


async def test_create_can_accept_zero_bindings(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.optional", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    proposal = _proposal(manager, name="Optional relay", entity_id="switch.optional")

    result = await async_commit_reviewed_imports(
        manager,
        (
            (
                proposal,
                ImportDecision.create(
                    action=ImportDecisionAction.CREATE,
                    asset=ImportAssetCandidate.create(
                        name="Manual inventory only",
                        asset_type="electrical_point",
                        capabilities=(),
                    ),
                    bindings=(),
                ),
            ),
        ),
        expected_revision=manager.revision,
    )

    assert result.created == 1
    assert result.bindings_applied == 0
    assert len(manager.registry.assets) == 1
    assert manager.registry.bindings == {}
    asset = next(iter(manager.registry.assets.values()))
    assert asset.name == "Manual inventory only"
    assert asset.asset_type == "electrical_point"
    assert asset.capabilities == ()


async def test_invalid_late_target_aborts_complete_batch(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.first", "off")
    hass.states.async_set("switch.second", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    first = _proposal(manager, name="First", entity_id="switch.first")
    second = _proposal(manager, name="Second", entity_id="switch.second")
    baseline = manager.registry.to_dict()
    revision = manager.revision
    manager._store.async_save = AsyncMock(wraps=manager._store.async_save)

    with pytest.raises(RegistryNotFoundError):
        await async_commit_reviewed_imports(
            manager,
            (
                (
                    first,
                    ImportDecision.create(
                        action=ImportDecisionAction.CREATE,
                        asset=first.asset,
                    ),
                ),
                (
                    second,
                    ImportDecision.create(
                        action=ImportDecisionAction.MERGE,
                        target_asset_id="missing-asset",
                    ),
                ),
            ),
            expected_revision=revision,
        )

    assert manager.registry.to_dict() == baseline
    assert manager.revision == revision
    assert manager._store.async_save.await_count == 0


async def test_storage_failure_preserves_previous_registry(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.storage", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    proposal = _proposal(manager, name="Storage", entity_id="switch.storage")
    baseline = manager.registry.to_dict()
    revision = manager.revision
    manager._store.async_save = AsyncMock(side_effect=RuntimeError("storage failed"))

    with pytest.raises(RuntimeError, match="storage failed"):
        await async_commit_reviewed_imports(
            manager,
            (
                (
                    proposal,
                    ImportDecision.create(
                        action=ImportDecisionAction.CREATE,
                        asset=proposal.asset,
                    ),
                ),
            ),
            expected_revision=revision,
        )

    assert manager.registry.to_dict() == baseline
    assert manager.revision == revision
    assert manager._store.async_save.await_count == 1


async def test_already_bound_target_cannot_create_duplicate_asset(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("switch.shared", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    existing = await manager.async_create_asset(
        name="Existing",
        asset_type="switch",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    await manager.async_set_binding(
        asset_id=existing.id,
        capability="on_off",
        entity_id="switch.shared",
        role="primary",
    )
    proposal = _proposal(manager, name="Duplicate", entity_id="switch.shared")
    baseline = manager.registry.to_dict()
    revision = manager.revision

    with pytest.raises(RegistryConflictError, match="another BindHome Asset"):
        await async_commit_reviewed_imports(
            manager,
            (
                (
                    proposal,
                    ImportDecision.create(
                        action=ImportDecisionAction.CREATE,
                        asset=proposal.asset,
                    ),
                ),
            ),
            expected_revision=revision,
        )

    assert manager.registry.to_dict() == baseline
    assert manager.revision == revision


async def test_repeat_merge_to_same_asset_is_idempotent(hass: HomeAssistant) -> None:
    hass.states.async_set("switch.shared", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    existing = await manager.async_create_asset(
        name="Existing",
        asset_type="switch",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    await manager.async_set_binding(
        asset_id=existing.id,
        capability="on_off",
        entity_id="switch.shared",
        role="primary",
    )
    original_binding_id = next(iter(manager.registry.bindings))
    proposal = _proposal(manager, name="Repeat", entity_id="switch.shared")

    result = await async_commit_reviewed_imports(
        manager,
        (
            (
                proposal,
                ImportDecision.create(
                    action=ImportDecisionAction.MERGE,
                    target_asset_id=existing.id,
                ),
            ),
        ),
        expected_revision=manager.revision,
    )

    assert result.merged == 1
    assert len(manager.registry.assets) == 1
    assert len(manager.registry.bindings) == 1
    assert next(iter(manager.registry.bindings)) == original_binding_id


async def test_registered_target_persists_stable_identity(hass: HomeAssistant) -> None:
    entity = er.async_get(hass).async_get_or_create(
        "switch",
        "demo",
        "stable-import",
        suggested_object_id="stable_import",
    )
    manager = BindHomeManager(hass)
    await manager.async_load()
    proposal = _proposal(
        manager,
        name="Stable",
        entity_id=entity.entity_id,
        entity_registry_id=entity.id,
    )

    await async_commit_reviewed_imports(
        manager,
        (
            (
                proposal,
                ImportDecision.create(
                    action=ImportDecisionAction.CREATE,
                    asset=proposal.asset,
                ),
            ),
        ),
        expected_revision=manager.revision,
    )

    binding = next(iter(manager.registry.bindings.values()))
    assert binding.entity_registry_id == entity.id
    assert binding.entity_id == entity.entity_id


def test_binding_selection_uses_stable_identity_over_mutable_entity_id() -> None:
    proposal = ImportProposal.create(
        source=ImportSource.create(
            entity_ids=("switch.current",),
            entity_registry_ids=("registry-1",),
        ),
        asset=ImportAssetCandidate.create(
            name="Relay",
            asset_type="switch",
            capabilities=("on_off",),
        ),
        bindings=(
            ImportBindingCandidate.create(
                capability="on_off",
                entity_id="switch.current",
                entity_registry_id="registry-1",
            ),
        ),
    )

    selected = select_proposal_bindings(
        proposal,
        (
            ImportBindingSelector.create(
                capability="on_off",
                entity_registry_id="registry-1",
                entity_id="switch.old_name",
            ),
        ),
    )

    assert selected == proposal.bindings
    assert selected[0].entity_id == "switch.current"
