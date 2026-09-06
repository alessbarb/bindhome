"""Transactional commit boundary for reviewed assisted-import decisions."""

from __future__ import annotations

from dataclasses import dataclass

from .binding_identity import entity_registry_id_for_entity
from .import_proposals import (
    AcceptedImport,
    ImportAssetCandidate,
    ImportBindingCandidate,
    ImportDecision,
    ImportDecisionAction,
    ImportProposal,
    apply_import_decision,
)
from .manager import BindHomeManager, RegistryRevisionConflictError
from .models import Asset, Binding, normalize_identifier, normalize_non_empty
from .registry import RegistryConflictError, RegistryValidationError
from .validation import validate_area


@dataclass(frozen=True, slots=True)
class ImportBindingSelector:
    """Stable review-side identity for one proposed Binding candidate."""

    capability: str
    role: str
    entity_registry_id: str | None
    entity_id: str | None

    @classmethod
    def create(
        cls,
        *,
        capability: str,
        role: str = "primary",
        entity_registry_id: str | None = None,
        entity_id: str | None = None,
    ) -> ImportBindingSelector:
        """Create a selector that prefers stable Entity Registry identity."""
        normalized_registry_id = (
            normalize_non_empty(entity_registry_id, "entity_registry_id")
            if entity_registry_id is not None
            else None
        )
        normalized_entity_id = (
            normalize_non_empty(entity_id, "entity_id")
            if entity_id is not None
            else None
        )
        if normalized_registry_id is None and normalized_entity_id is None:
            raise RegistryValidationError(
                "Binding selection requires entity_registry_id or entity_id"
            )
        return cls(
            capability=normalize_identifier(capability, "capability"),
            role=normalize_identifier(role, "role"),
            entity_registry_id=normalized_registry_id,
            entity_id=normalized_entity_id,
        )


def _candidate_key(
    candidate: ImportBindingCandidate,
) -> tuple[str, str, str, str]:
    if candidate.entity_registry_id is not None:
        return (
            candidate.capability,
            candidate.role,
            "registry",
            candidate.entity_registry_id,
        )
    return (candidate.capability, candidate.role, "entity", candidate.entity_id)


def _selector_key(selector: ImportBindingSelector) -> tuple[str, str, str, str]:
    if selector.entity_registry_id is not None:
        return (
            selector.capability,
            selector.role,
            "registry",
            selector.entity_registry_id,
        )
    assert selector.entity_id is not None
    return (selector.capability, selector.role, "entity", selector.entity_id)


def select_proposal_bindings(
    proposal: ImportProposal,
    selectors: tuple[ImportBindingSelector, ...],
) -> tuple[ImportBindingCandidate, ...]:
    """Resolve explicit selectors only against candidates in the current proposal."""
    candidates = {
        _candidate_key(candidate): candidate for candidate in proposal.bindings
    }
    selected: list[ImportBindingCandidate] = []
    seen: set[tuple[str, str, str, str]] = set()

    for selector in selectors:
        key = _selector_key(selector)
        if key in seen:
            raise RegistryValidationError(
                f"Binding selection for proposal {proposal.proposal_id} is duplicated"
            )
        seen.add(key)
        candidate = candidates.get(key)
        if candidate is None:
            raise RegistryValidationError(
                "Selected Binding is not part of the current import proposal"
            )
        selected.append(candidate)

    return tuple(selected)


@dataclass(frozen=True, slots=True)
class ImportCommitItemResult:
    """Committed outcome for one explicitly reviewed proposal."""

    proposal_id: str
    action: ImportDecisionAction
    asset_id: str | None
    bindings_applied: int

    def to_dict(self) -> dict[str, object]:
        """Serialize one commit outcome."""
        return {
            "proposal_id": self.proposal_id,
            "action": self.action.value,
            "asset_id": self.asset_id,
            "bindings_applied": self.bindings_applied,
        }


@dataclass(frozen=True, slots=True)
class ImportCommitResult:
    """Summary of one atomic reviewed-import batch."""

    items: tuple[ImportCommitItemResult, ...]
    revision: int

    @property
    def created(self) -> int:
        return sum(item.action is ImportDecisionAction.CREATE for item in self.items)

    @property
    def merged(self) -> int:
        return sum(item.action is ImportDecisionAction.MERGE for item in self.items)

    @property
    def skipped(self) -> int:
        return sum(item.action is ImportDecisionAction.SKIP for item in self.items)

    @property
    def bindings_applied(self) -> int:
        return sum(item.bindings_applied for item in self.items)

    def to_dict(self) -> dict[str, object]:
        """Serialize counters and per-proposal results."""
        return {
            "created": self.created,
            "merged": self.merged,
            "skipped": self.skipped,
            "bindings_applied": self.bindings_applied,
            "revision": self.revision,
            "items": [item.to_dict() for item in self.items],
        }


def _same_target(left: Binding, right: Binding) -> bool:
    """Compare Binding targets without falling back from stable identity."""
    if left.entity_registry_id is not None:
        return left.entity_registry_id == right.entity_registry_id
    return right.entity_registry_id is None and left.entity_id == right.entity_id


def _reject_cross_asset_target_duplicate(
    proposed: Binding,
    *,
    registry_bindings: tuple[Binding, ...],
) -> None:
    """Prevent repeat import from creating a second Asset for one stable target."""
    for existing in registry_bindings:
        if existing.asset_id == proposed.asset_id:
            continue
        if _same_target(proposed, existing):
            raise RegistryConflictError(
                "Home Assistant Binding target is already attached to another "
                f"BindHome Asset ({existing.asset_id})"
            )


def _binding_from_candidate(
    manager: BindHomeManager,
    *,
    asset_id: str,
    candidate: ImportBindingCandidate,
) -> Binding:
    """Re-resolve stable target identity using the normal current HA lookup."""
    current_registry_id = entity_registry_id_for_entity(
        manager.hass,
        candidate.entity_id,
    )
    if current_registry_id != candidate.entity_registry_id:
        raise RegistryConflictError(
            "Home Assistant Binding target changed after import review; "
            "run discovery again"
        )
    return Binding.create(
        asset_id=asset_id,
        capability=candidate.capability,
        role=candidate.role,
        entity_id=candidate.entity_id,
        entity_registry_id=current_registry_id,
    )


def _create_asset(candidate: ImportAssetCandidate) -> Asset:
    return Asset.create(
        name=candidate.name,
        asset_type=candidate.asset_type,
        code=None,
        area_id=candidate.area_id,
        capabilities=list(candidate.capabilities),
    )


async def async_commit_reviewed_imports(
    manager: BindHomeManager,
    reviewed: tuple[tuple[ImportProposal, ImportDecision], ...],
    *,
    expected_revision: int,
) -> ImportCommitResult:
    """Validate and persist one complete reviewed batch atomically."""
    seen_proposals: set[str] = set()
    materialized: list[
        tuple[ImportProposal, ImportDecision, AcceptedImport | None]
    ] = []
    for proposal, decision in reviewed:
        if proposal.proposal_id in seen_proposals:
            raise RegistryValidationError(
                f"Import proposal {proposal.proposal_id} has multiple decisions"
            )
        seen_proposals.add(proposal.proposal_id)
        materialized.append(
            (proposal, decision, apply_import_decision(proposal, decision))
        )

    if all(accepted is None for _, _, accepted in materialized):
        if manager.revision != expected_revision:
            raise RegistryRevisionConflictError(expected_revision, manager.revision)
        return ImportCommitResult(
            items=tuple(
                ImportCommitItemResult(
                    proposal_id=proposal.proposal_id,
                    action=decision.action,
                    asset_id=None,
                    bindings_applied=0,
                )
                for proposal, decision, _ in materialized
            ),
            revision=manager.revision,
        )

    results: list[ImportCommitItemResult] = []
    async with manager.transaction(expected_revision=expected_revision) as staged:
        for proposal, decision, accepted in materialized:
            if accepted is None:
                results.append(
                    ImportCommitItemResult(
                        proposal_id=proposal.proposal_id,
                        action=decision.action,
                        asset_id=None,
                        bindings_applied=0,
                    )
                )
                continue

            if accepted.action is ImportDecisionAction.CREATE:
                assert accepted.asset is not None
                validate_area(manager.hass, accepted.asset.area_id)
                asset = staged.add_asset(_create_asset(accepted.asset))
            else:
                assert accepted.action is ImportDecisionAction.MERGE
                assert accepted.target_asset_id is not None
                asset = staged.get_asset(accepted.target_asset_id)

            for candidate in accepted.bindings:
                binding = _binding_from_candidate(
                    manager,
                    asset_id=asset.id,
                    candidate=candidate,
                )
                manager._validate_binding_target(binding, registry=staged)
                _reject_cross_asset_target_duplicate(
                    binding,
                    registry_bindings=tuple(staged.bindings.values()),
                )
                staged.set_binding(binding)

            results.append(
                ImportCommitItemResult(
                    proposal_id=proposal.proposal_id,
                    action=accepted.action,
                    asset_id=asset.id,
                    bindings_applied=len(accepted.bindings),
                )
            )

    return ImportCommitResult(items=tuple(results), revision=manager.revision)
