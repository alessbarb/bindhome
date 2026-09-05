"""Pure contract tests for assisted-import proposals and deduplication."""

import pytest

from custom_components.bindhome.import_proposals import (
    ImportAssetCandidate,
    ImportBindingCandidate,
    ImportDecision,
    ImportDecisionAction,
    ImportDuplicateStatus,
    ImportProposal,
    ImportSource,
    apply_import_decision,
)
from custom_components.bindhome.models import Asset, Binding


def _source(
    *,
    area_id: str | None = "living_room",
    device_id: str | None = "device-1",
    entity_ids: tuple[str, ...] = ("light.ceiling",),
    registry_ids: tuple[str, ...] = ("registry-1",),
) -> ImportSource:
    return ImportSource.create(
        area_id=area_id,
        device_id=device_id,
        entity_ids=entity_ids,
        entity_registry_ids=registry_ids,
    )


def _asset_candidate(
    *,
    name: str = "Ceiling light",
    asset_type: str = "light_point",
    area_id: str | None = "living_room",
    capabilities: tuple[str, ...] = ("on_off",),
) -> ImportAssetCandidate:
    return ImportAssetCandidate.create(
        name=name,
        asset_type=asset_type,
        area_id=area_id,
        capabilities=capabilities,
    )


def _binding_candidate(
    *,
    capability: str = "on_off",
    entity_id: str = "light.ceiling",
    registry_id: str | None = "registry-1",
    role: str = "primary",
) -> ImportBindingCandidate:
    return ImportBindingCandidate.create(
        capability=capability,
        entity_id=entity_id,
        entity_registry_id=registry_id,
        role=role,
    )


def test_device_with_one_entity_produces_new_traceable_proposal() -> None:
    proposal = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
    )

    assert proposal.duplicate_status is ImportDuplicateStatus.NEW
    assert proposal.merge_candidate_asset_ids == ()
    assert proposal.requires_review is True
    assert proposal.source.device_id == "device-1"
    assert proposal.source.entity_ids == ("light.ceiling",)
    assert proposal.source.entity_registry_ids == ("registry-1",)
    assert proposal.bindings[0].entity_registry_id == "registry-1"
    assert proposal.to_dict()["requires_review"] is True


def test_device_with_multiple_entities_and_capabilities_stays_one_proposal() -> None:
    source = _source(
        entity_ids=("sensor.power", "light.ceiling", "sensor.power"),
        registry_ids=("registry-power", "registry-light", "registry-light"),
    )
    asset = _asset_candidate(capabilities=("power_measurement", "on_off"))
    bindings = (
        _binding_candidate(),
        _binding_candidate(
            capability="power_measurement",
            entity_id="sensor.power",
            registry_id="registry-power",
        ),
    )

    proposal = ImportProposal.create(source=source, asset=asset, bindings=bindings)

    assert proposal.source.entity_ids == ("light.ceiling", "sensor.power")
    assert proposal.source.entity_registry_ids == (
        "registry-light",
        "registry-power",
    )
    assert {binding.capability for binding in proposal.bindings} == {
        "on_off",
        "power_measurement",
    }


def test_entity_without_device_is_supported_and_has_deterministic_identity() -> None:
    source = _source(
        device_id=None,
        entity_ids=("switch.garden",),
        registry_ids=("registry-garden",),
    )
    asset = _asset_candidate(
        name="Garden switch",
        asset_type="switch",
        area_id="garden",
    )
    binding = _binding_candidate(
        entity_id="switch.garden",
        registry_id="registry-garden",
    )

    first = ImportProposal.create(source=source, asset=asset, bindings=[binding])
    second = ImportProposal.create(source=source, asset=asset, bindings=[binding])

    assert first.proposal_id == second.proposal_id
    assert first.proposal_id.startswith("ha_")


def test_registered_source_identity_survives_entity_id_rename() -> None:
    before = ImportProposal.create(
        source=_source(entity_ids=("light.old_name",)),
        asset=_asset_candidate(),
        bindings=[_binding_candidate(entity_id="light.old_name")],
    )
    after = ImportProposal.create(
        source=_source(entity_ids=("light.new_name",)),
        asset=_asset_candidate(),
        bindings=[_binding_candidate(entity_id="light.new_name")],
    )

    assert before.proposal_id == after.proposal_id


def test_already_bound_registered_entity_is_definitive_duplicate() -> None:
    existing_asset = Asset.create(
        name="Existing light",
        asset_type="light_point",
        area_id="living_room",
        capabilities=["on_off"],
    )
    existing_binding = Binding.create(
        asset_id=existing_asset.id,
        capability="on_off",
        entity_id="light.old_name",
        entity_registry_id="registry-1",
    )

    proposal = ImportProposal.create(
        source=_source(entity_ids=("light.new_name",)),
        asset=_asset_candidate(name="Different display name"),
        bindings=[_binding_candidate(entity_id="light.new_name")],
        existing_assets=[existing_asset],
        existing_bindings=[existing_binding],
    )

    assert proposal.duplicate_status is ImportDuplicateStatus.ALREADY_BOUND
    assert proposal.merge_candidate_asset_ids == (existing_asset.id,)


def test_repeat_import_after_commit_is_detected_from_binding_identity() -> None:
    imported_asset = Asset.create(
        name="Ceiling light",
        asset_type="light_point",
        area_id="living_room",
        capabilities=["on_off"],
    )
    imported_binding = Binding.create(
        asset_id=imported_asset.id,
        capability="on_off",
        entity_id="light.ceiling",
        entity_registry_id="registry-1",
    )

    repeated = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
        existing_assets=[imported_asset],
        existing_bindings=[imported_binding],
    )

    assert repeated.duplicate_status is ImportDuplicateStatus.ALREADY_BOUND
    assert repeated.merge_candidate_asset_ids == (imported_asset.id,)


def test_state_only_entity_duplicate_uses_entity_id_fallback() -> None:
    existing_asset = Asset.create(
        name="State only switch",
        asset_type="switch",
        capabilities=["on_off"],
    )
    existing_binding = Binding.create(
        asset_id=existing_asset.id,
        capability="on_off",
        entity_id="switch.state_only",
        entity_registry_id=None,
    )

    proposal = ImportProposal.create(
        source=_source(
            area_id=None,
            device_id=None,
            entity_ids=("switch.state_only",),
            registry_ids=(),
        ),
        asset=_asset_candidate(
            name="State only switch",
            asset_type="switch",
            area_id=None,
        ),
        bindings=[
            _binding_candidate(
                entity_id="switch.state_only",
                registry_id=None,
            )
        ],
        existing_bindings=[existing_binding],
    )

    assert proposal.duplicate_status is ImportDuplicateStatus.ALREADY_BOUND


def test_exact_asset_metadata_match_is_advisory_not_automatic_duplicate() -> None:
    existing = Asset.create(
        name="Ceiling light",
        asset_type="light_point",
        area_id="living_room",
        capabilities=["on_off"],
    )

    proposal = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
        existing_assets=[existing],
    )

    assert proposal.duplicate_status is ImportDuplicateStatus.POSSIBLE_ASSET_MATCH
    assert proposal.merge_candidate_asset_ids == (existing.id,)


def test_multiple_asset_metadata_matches_require_explicit_review() -> None:
    first = Asset.create(
        name="Ceiling light",
        asset_type="light_point",
        area_id="living_room",
        capabilities=["on_off"],
    )
    second = Asset.create(
        name="Ceiling light",
        asset_type="light_point",
        area_id="living_room",
        capabilities=["on_off"],
    )

    proposal = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
        existing_assets=[first, second],
    )

    assert proposal.duplicate_status is ImportDuplicateStatus.AMBIGUOUS
    assert set(proposal.merge_candidate_asset_ids) == {first.id, second.id}


def test_create_decision_can_rename_and_reclassify_before_commit() -> None:
    proposal = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
    )
    reviewed_asset = ImportAssetCandidate.create(
        name="Main ceiling light",
        asset_type="ceiling_light",
        area_id="living_room",
        capabilities=["on_off"],
    )
    decision = ImportDecision.create(
        action=ImportDecisionAction.CREATE,
        asset=reviewed_asset,
        bindings=proposal.bindings,
    )

    accepted = apply_import_decision(proposal, decision)

    assert accepted is not None
    assert accepted.action is ImportDecisionAction.CREATE
    assert accepted.asset == reviewed_asset
    assert accepted.bindings == proposal.bindings
    assert accepted.source == proposal.source


def test_create_decision_can_explicitly_drop_all_candidate_bindings() -> None:
    proposal = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
    )
    decision = ImportDecision.create(
        action="create",
        asset=proposal.asset,
        bindings=(),
    )

    accepted = apply_import_decision(proposal, decision)

    assert accepted is not None
    assert accepted.bindings == ()


def test_merge_decision_targets_existing_asset_without_creating_one() -> None:
    proposal = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
    )
    decision = ImportDecision.create(
        action="merge",
        target_asset_id="asset-existing",
    )

    accepted = apply_import_decision(proposal, decision)

    assert accepted is not None
    assert accepted.action is ImportDecisionAction.MERGE
    assert accepted.asset is None
    assert accepted.target_asset_id == "asset-existing"
    assert accepted.bindings == proposal.bindings


def test_skip_decision_materializes_nothing() -> None:
    proposal = ImportProposal.create(
        source=_source(),
        asset=_asset_candidate(),
        bindings=[_binding_candidate()],
    )

    decision = ImportDecision.create(action="skip")

    assert apply_import_decision(proposal, decision) is None


def test_binding_candidate_requires_declared_asset_capability() -> None:
    with pytest.raises(ValueError, match="undeclared capabilities"):
        ImportProposal.create(
            source=_source(),
            asset=_asset_candidate(capabilities=()),
            bindings=[_binding_candidate()],
        )


def test_invalid_decision_shapes_fail_before_commit() -> None:
    with pytest.raises(ValueError, match="Create decision"):
        ImportDecision.create(action="create")

    with pytest.raises(ValueError, match="Merge decision"):
        ImportDecision.create(action="merge")

    with pytest.raises(ValueError, match="Skip decision"):
        ImportDecision.create(
            action="skip",
            target_asset_id="asset-existing",
        )
