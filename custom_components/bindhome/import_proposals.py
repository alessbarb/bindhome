"""Pure proposal contract for assisted Home Assistant inventory import."""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256

from .models import (
    Asset,
    Binding,
    normalize_identifier,
    normalize_non_empty,
)


class ImportDuplicateStatus(StrEnum):
    """How confidently an import proposal overlaps existing BindHome state."""

    NEW = "new"
    ALREADY_BOUND = "already_bound"
    POSSIBLE_ASSET_MATCH = "possible_asset_match"
    AMBIGUOUS = "ambiguous"


class ImportDecisionAction(StrEnum):
    """Explicit user outcome for one reviewed import proposal."""

    CREATE = "create"
    MERGE = "merge"
    SKIP = "skip"


@dataclass(frozen=True, slots=True)
class ImportSource:
    """Traceable Home Assistant identities that produced one proposal."""

    area_id: str | None
    device_id: str | None
    entity_ids: tuple[str, ...]
    entity_registry_ids: tuple[str, ...]

    @classmethod
    def create(
        cls,
        *,
        area_id: str | None = None,
        device_id: str | None = None,
        entity_ids: Iterable[str] = (),
        entity_registry_ids: Iterable[str] = (),
    ) -> ImportSource:
        """Create a deterministic, normalized source descriptor."""
        normalized_entity_ids = tuple(
            sorted({normalize_non_empty(value, "entity_id") for value in entity_ids})
        )
        normalized_registry_ids = tuple(
            sorted(
                {
                    normalize_non_empty(value, "entity_registry_id")
                    for value in entity_registry_ids
                }
            )
        )
        normalized_device_id = (
            normalize_non_empty(device_id, "device_id")
            if device_id is not None
            else None
        )
        if normalized_device_id is None and not normalized_entity_ids:
            raise ValueError("Import source requires a Device or at least one Entity")

        return cls(
            area_id=(
                normalize_non_empty(area_id, "area_id") if area_id is not None else None
            ),
            device_id=normalized_device_id,
            entity_ids=normalized_entity_ids,
            entity_registry_ids=normalized_registry_ids,
        )

    def fingerprint(self) -> str:
        """Return stable source identity independent from mutable display metadata."""
        parts: list[str] = []
        if self.device_id is not None:
            parts.append(f"device:{self.device_id}")
        if self.entity_registry_ids:
            parts.extend(f"registry:{value}" for value in self.entity_registry_ids)
        else:
            parts.extend(f"entity:{value}" for value in self.entity_ids)
        return "|".join(parts)

    def to_dict(self) -> dict[str, object]:
        """Serialize source traceability for API/UI consumers."""
        return {
            "area_id": self.area_id,
            "device_id": self.device_id,
            "entity_ids": list(self.entity_ids),
            "entity_registry_ids": list(self.entity_registry_ids),
        }


@dataclass(frozen=True, slots=True)
class ImportAssetCandidate:
    """Editable Asset data proposed from Home Assistant metadata."""

    name: str
    asset_type: str
    area_id: str | None
    capabilities: tuple[str, ...]

    @classmethod
    def create(
        cls,
        *,
        name: str,
        asset_type: str,
        area_id: str | None = None,
        capabilities: Iterable[str] = (),
    ) -> ImportAssetCandidate:
        """Create normalized editable Asset candidate data."""
        return cls(
            name=normalize_non_empty(name, "name"),
            asset_type=normalize_identifier(asset_type, "asset_type"),
            area_id=(
                normalize_non_empty(area_id, "area_id") if area_id is not None else None
            ),
            capabilities=tuple(
                sorted(
                    {
                        normalize_identifier(capability, "capability")
                        for capability in capabilities
                    }
                )
            ),
        )

    def to_dict(self) -> dict[str, object]:
        """Serialize candidate data for review clients."""
        return {
            "name": self.name,
            "asset_type": self.asset_type,
            "area_id": self.area_id,
            "capabilities": list(self.capabilities),
        }


@dataclass(frozen=True, slots=True)
class ImportBindingCandidate:
    """One proposed capability Binding to an existing Home Assistant entity."""

    capability: str
    role: str
    entity_id: str
    entity_registry_id: str | None

    @classmethod
    def create(
        cls,
        *,
        capability: str,
        entity_id: str,
        entity_registry_id: str | None = None,
        role: str = "primary",
    ) -> ImportBindingCandidate:
        """Create one normalized Binding candidate."""
        return cls(
            capability=normalize_identifier(capability, "capability"),
            role=normalize_identifier(role, "role"),
            entity_id=normalize_non_empty(entity_id, "entity_id"),
            entity_registry_id=(
                normalize_non_empty(entity_registry_id, "entity_registry_id")
                if entity_registry_id is not None
                else None
            ),
        )

    def to_dict(self) -> dict[str, str | None]:
        """Serialize Binding candidate data."""
        return {
            "capability": self.capability,
            "role": self.role,
            "entity_id": self.entity_id,
            "entity_registry_id": self.entity_registry_id,
        }


def _matches_existing_binding(
    candidate: ImportBindingCandidate,
    binding: Binding,
) -> bool:
    """Return whether candidate and persisted Binding identify the same target."""
    if candidate.entity_registry_id is not None:
        return candidate.entity_registry_id == binding.entity_registry_id
    return (
        binding.entity_registry_id is None and candidate.entity_id == binding.entity_id
    )


def analyze_import_duplicate(
    *,
    asset: ImportAssetCandidate,
    bindings: Iterable[ImportBindingCandidate],
    existing_assets: Iterable[Asset],
    existing_bindings: Iterable[Binding],
) -> tuple[ImportDuplicateStatus, tuple[str, ...]]:
    """Classify duplicate evidence without making an automatic merge decision.

    Stable Binding target identity is definitive. Asset display metadata is only
    advisory: exact name/type/Area matches are surfaced as possible merge targets
    and never silently treated as the same physical Asset.
    """
    binding_candidates = tuple(bindings)
    persisted_bindings = tuple(existing_bindings)
    bound_asset_ids = tuple(
        sorted(
            {
                binding.asset_id
                for binding in persisted_bindings
                for candidate in binding_candidates
                if _matches_existing_binding(candidate, binding)
            }
        )
    )
    if bound_asset_ids:
        return ImportDuplicateStatus.ALREADY_BOUND, bound_asset_ids

    candidate_name = asset.name.casefold()
    metadata_matches = tuple(
        sorted(
            current.id
            for current in existing_assets
            if current.name.casefold() == candidate_name
            and current.asset_type == asset.asset_type
            and current.area_id == asset.area_id
        )
    )
    if len(metadata_matches) == 1:
        return ImportDuplicateStatus.POSSIBLE_ASSET_MATCH, metadata_matches
    if len(metadata_matches) > 1:
        return ImportDuplicateStatus.AMBIGUOUS, metadata_matches
    return ImportDuplicateStatus.NEW, ()


def _proposal_id(source: ImportSource, candidate_key: str) -> str:
    """Derive a deterministic workflow identity from stable HA source identity."""
    key = normalize_non_empty(candidate_key, "candidate_key")
    digest = sha256(f"{source.fingerprint()}|candidate:{key}".encode()).hexdigest()
    return f"ha_{digest[:24]}"


@dataclass(frozen=True, slots=True)
class ImportProposal:
    """One non-mutating assisted-import proposal awaiting user review."""

    proposal_id: str
    source: ImportSource
    asset: ImportAssetCandidate
    bindings: tuple[ImportBindingCandidate, ...]
    duplicate_status: ImportDuplicateStatus
    merge_candidate_asset_ids: tuple[str, ...]

    @classmethod
    def create(
        cls,
        *,
        source: ImportSource,
        asset: ImportAssetCandidate,
        bindings: Iterable[ImportBindingCandidate],
        existing_assets: Iterable[Asset] = (),
        existing_bindings: Iterable[Binding] = (),
        candidate_key: str = "default",
    ) -> ImportProposal:
        """Build a proposal and deterministic duplicate analysis."""
        normalized_bindings = tuple(bindings)
        missing_capabilities = {
            binding.capability for binding in normalized_bindings
        } - set(asset.capabilities)
        if missing_capabilities:
            missing = ", ".join(sorted(missing_capabilities))
            raise ValueError(
                f"Binding candidates require undeclared capabilities: {missing}"
            )

        duplicate_status, merge_candidates = analyze_import_duplicate(
            asset=asset,
            bindings=normalized_bindings,
            existing_assets=existing_assets,
            existing_bindings=existing_bindings,
        )
        return cls(
            proposal_id=_proposal_id(source, candidate_key),
            source=source,
            asset=asset,
            bindings=normalized_bindings,
            duplicate_status=duplicate_status,
            merge_candidate_asset_ids=merge_candidates,
        )

    @property
    def requires_review(self) -> bool:
        """Return whether a human decision is required before commit."""
        return True

    def to_dict(self) -> dict[str, object]:
        """Serialize proposal data for a review surface."""
        return {
            "proposal_id": self.proposal_id,
            "source": self.source.to_dict(),
            "asset": self.asset.to_dict(),
            "bindings": [binding.to_dict() for binding in self.bindings],
            "duplicate_status": self.duplicate_status.value,
            "merge_candidate_asset_ids": list(self.merge_candidate_asset_ids),
            "requires_review": True,
        }


@dataclass(frozen=True, slots=True)
class ImportDecision:
    """Explicit user-reviewed outcome for one proposal."""

    action: ImportDecisionAction
    asset: ImportAssetCandidate | None = None
    target_asset_id: str | None = None
    bindings: tuple[ImportBindingCandidate, ...] | None = None

    @classmethod
    def create(
        cls,
        *,
        action: ImportDecisionAction | str,
        asset: ImportAssetCandidate | None = None,
        target_asset_id: str | None = None,
        bindings: Iterable[ImportBindingCandidate] | None = None,
    ) -> ImportDecision:
        """Create and validate an explicit create/merge/skip decision."""
        normalized_action = ImportDecisionAction(action)
        normalized_target = (
            normalize_non_empty(target_asset_id, "target_asset_id")
            if target_asset_id is not None
            else None
        )
        normalized_bindings = tuple(bindings) if bindings is not None else None

        if normalized_action is ImportDecisionAction.CREATE:
            if asset is None or normalized_target is not None:
                raise ValueError(
                    "Create decision requires Asset data and no merge target"
                )
        elif normalized_action is ImportDecisionAction.MERGE:
            if normalized_target is None or asset is not None:
                raise ValueError(
                    "Merge decision requires target_asset_id and no new Asset"
                )
        elif (
            asset is not None
            or normalized_target is not None
            or normalized_bindings is not None
        ):
            raise ValueError("Skip decision cannot carry Asset, target or Binding data")

        if asset is not None and normalized_bindings is not None:
            missing_capabilities = {
                binding.capability for binding in normalized_bindings
            } - set(asset.capabilities)
            if missing_capabilities:
                missing = ", ".join(sorted(missing_capabilities))
                raise ValueError(
                    f"Accepted Bindings require undeclared capabilities: {missing}"
                )

        return cls(
            action=normalized_action,
            asset=asset,
            target_asset_id=normalized_target,
            bindings=normalized_bindings,
        )


@dataclass(frozen=True, slots=True)
class AcceptedImport:
    """Commit-ready result of applying one explicit decision to a proposal."""

    proposal_id: str
    source: ImportSource
    action: ImportDecisionAction
    asset: ImportAssetCandidate | None
    target_asset_id: str | None
    bindings: tuple[ImportBindingCandidate, ...]


def apply_import_decision(
    proposal: ImportProposal,
    decision: ImportDecision,
) -> AcceptedImport | None:
    """Materialize reviewed data without mutating BindHome or Home Assistant."""
    if decision.action is ImportDecisionAction.SKIP:
        return None

    bindings = proposal.bindings if decision.bindings is None else decision.bindings
    asset = decision.asset

    if asset is not None:
        missing_capabilities = {binding.capability for binding in bindings} - set(
            asset.capabilities
        )
        if missing_capabilities:
            missing = ", ".join(sorted(missing_capabilities))
            raise ValueError(
                f"Accepted Bindings require undeclared capabilities: {missing}"
            )

    return AcceptedImport(
        proposal_id=proposal.proposal_id,
        source=proposal.source,
        action=decision.action,
        asset=asset,
        target_asset_id=decision.target_asset_id,
        bindings=bindings,
    )
