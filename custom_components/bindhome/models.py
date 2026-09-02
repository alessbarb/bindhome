"""Core data models for BindHome."""

from __future__ import annotations

import re
from dataclasses import dataclass, replace
from typing import Any
from uuid import uuid4

_IDENTIFIER_RE = re.compile(r"^[a-z][a-z0-9_]*$")


class ModelValidationError(ValueError):
    """Raised when a BindHome model is invalid."""


def normalize_identifier(value: str, field: str) -> str:
    """Validate and normalize an extensible identifier."""
    normalized = value.strip().lower()
    if not _IDENTIFIER_RE.fullmatch(normalized):
        raise ModelValidationError(
            f"{field} must use lower_snake_case and start with a letter"
        )
    return normalized


def normalize_non_empty(value: str, field: str) -> str:
    """Return a trimmed non-empty string."""
    normalized = value.strip()
    if not normalized:
        raise ModelValidationError(f"{field} must not be empty")
    return normalized


def _new_id() -> str:
    return str(uuid4())


@dataclass(frozen=True, slots=True)
class Asset:
    """A stable piece of home infrastructure."""

    id: str
    name: str
    asset_type: str
    code: str | None = None
    area_id: str | None = None
    capabilities: tuple[str, ...] = ()

    @classmethod
    def create(
        cls,
        *,
        name: str,
        asset_type: str,
        code: str | None = None,
        area_id: str | None = None,
        capabilities: tuple[str, ...] | list[str] = (),
    ) -> Asset:
        """Create a validated asset with an immutable generated ID."""
        normalized_capabilities = tuple(
            sorted(
                {
                    normalize_identifier(capability, "capability")
                    for capability in capabilities
                }
            )
        )
        return cls(
            id=_new_id(),
            name=normalize_non_empty(name, "name"),
            asset_type=normalize_identifier(asset_type, "asset_type"),
            code=normalize_non_empty(code, "code") if code is not None else None,
            area_id=(
                normalize_non_empty(area_id, "area_id") if area_id is not None else None
            ),
            capabilities=normalized_capabilities,
        )

    def with_capabilities(self, capabilities: tuple[str, ...] | list[str]) -> Asset:
        """Return a copy with a normalized capability set."""
        normalized = tuple(
            sorted(
                {
                    normalize_identifier(capability, "capability")
                    for capability in capabilities
                }
            )
        )
        return replace(self, capabilities=normalized)

    def with_updates(
        self,
        *,
        name: str,
        asset_type: str,
        code: str | None,
        area_id: str | None,
        capabilities: tuple[str, ...] | list[str],
    ) -> Asset:
        """Return an updated asset while preserving its stable identity."""
        normalized_capabilities = tuple(
            sorted(
                {
                    normalize_identifier(capability, "capability")
                    for capability in capabilities
                }
            )
        )
        return replace(
            self,
            name=normalize_non_empty(name, "name"),
            asset_type=normalize_identifier(asset_type, "asset_type"),
            code=normalize_non_empty(code, "code") if code is not None else None,
            area_id=(
                normalize_non_empty(area_id, "area_id") if area_id is not None else None
            ),
            capabilities=normalized_capabilities,
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialize the asset."""
        return {
            "id": self.id,
            "name": self.name,
            "asset_type": self.asset_type,
            "code": self.code,
            "area_id": self.area_id,
            "capabilities": list(self.capabilities),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Asset:
        """Deserialize and validate an asset."""
        if not isinstance(data, dict):
            raise ModelValidationError("Asset data must be a dictionary")
        try:
            asset_id = normalize_non_empty(str(data["id"]), "id")
            name = normalize_non_empty(str(data["name"]), "name")
            asset_type = normalize_identifier(str(data["asset_type"]), "asset_type")
        except KeyError as err:
            raise ModelValidationError(
                f"Missing required asset field: {err.args[0]}"
            ) from err
        code_raw = data.get("code")
        area_raw = data.get("area_id")
        capabilities_raw = data.get("capabilities", [])
        if not isinstance(capabilities_raw, (list, tuple)):
            raise ModelValidationError("Capabilities must be a list or tuple")
        capabilities = tuple(
            sorted(
                {
                    normalize_identifier(str(capability), "capability")
                    for capability in capabilities_raw
                }
            )
        )
        return cls(
            id=asset_id,
            name=name,
            asset_type=asset_type,
            code=(
                normalize_non_empty(str(code_raw), "code")
                if code_raw is not None
                else None
            ),
            area_id=(
                normalize_non_empty(str(area_raw), "area_id")
                if area_raw is not None
                else None
            ),
            capabilities=capabilities,
        )


@dataclass(frozen=True, slots=True)
class Relation:
    """A directed topology relation between two assets."""

    id: str
    source_asset_id: str
    relation_type: str
    target_asset_id: str

    @classmethod
    def create(
        cls, *, source_asset_id: str, relation_type: str, target_asset_id: str
    ) -> Relation:
        """Create a validated relation."""
        source = normalize_non_empty(source_asset_id, "source_asset_id")
        target = normalize_non_empty(target_asset_id, "target_asset_id")
        if source == target:
            raise ModelValidationError("A relation cannot connect an asset to itself")
        return cls(
            id=_new_id(),
            source_asset_id=source,
            relation_type=normalize_identifier(relation_type, "relation_type"),
            target_asset_id=target,
        )

    def to_dict(self) -> dict[str, str]:
        """Serialize the relation."""
        return {
            "id": self.id,
            "source_asset_id": self.source_asset_id,
            "relation_type": self.relation_type,
            "target_asset_id": self.target_asset_id,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Relation:
        """Deserialize and validate a relation."""
        if not isinstance(data, dict):
            raise ModelValidationError("Relation data must be a dictionary")
        try:
            relation = cls(
                id=normalize_non_empty(str(data["id"]), "id"),
                source_asset_id=normalize_non_empty(
                    str(data["source_asset_id"]), "source_asset_id"
                ),
                relation_type=normalize_identifier(
                    str(data["relation_type"]), "relation_type"
                ),
                target_asset_id=normalize_non_empty(
                    str(data["target_asset_id"]), "target_asset_id"
                ),
            )
        except KeyError as err:
            raise ModelValidationError(
                f"Missing required relation field: {err.args[0]}"
            ) from err
        if relation.source_asset_id == relation.target_asset_id:
            raise ModelValidationError("A relation cannot connect an asset to itself")
        return relation


@dataclass(frozen=True, slots=True)
class Binding:
    """Map an asset capability to the current Home Assistant entity."""

    id: str
    asset_id: str
    capability: str
    entity_id: str
    role: str = "primary"

    @classmethod
    def create(
        cls,
        *,
        asset_id: str,
        capability: str,
        entity_id: str,
        role: str = "primary",
    ) -> Binding:
        """Create a validated binding."""
        return cls(
            id=_new_id(),
            asset_id=normalize_non_empty(asset_id, "asset_id"),
            capability=normalize_identifier(capability, "capability"),
            entity_id=normalize_non_empty(entity_id, "entity_id"),
            role=normalize_identifier(role, "role"),
        )

    def with_entity_id(self, entity_id: str) -> Binding:
        """Replace the current implementation while preserving binding identity."""
        return replace(self, entity_id=normalize_non_empty(entity_id, "entity_id"))

    def to_dict(self) -> dict[str, str]:
        """Serialize the binding."""
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "capability": self.capability,
            "entity_id": self.entity_id,
            "role": self.role,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Binding:
        """Deserialize and validate a binding."""
        if not isinstance(data, dict):
            raise ModelValidationError("Binding data must be a dictionary")
        try:
            return cls(
                id=normalize_non_empty(str(data["id"]), "id"),
                asset_id=normalize_non_empty(str(data["asset_id"]), "asset_id"),
                capability=normalize_identifier(str(data["capability"]), "capability"),
                entity_id=normalize_non_empty(str(data["entity_id"]), "entity_id"),
                role=normalize_identifier(str(data.get("role", "primary")), "role"),
            )
        except KeyError as err:
            raise ModelValidationError(
                f"Missing required binding field: {err.args[0]}"
            ) from err
