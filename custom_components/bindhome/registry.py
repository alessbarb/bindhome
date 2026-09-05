"""In-memory BindHome infrastructure registry."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from .const import REGISTRY_SCHEMA_VERSION
from .models import (
    Asset,
    Binding,
    ModelValidationError,
    Relation,
    Representation,
)
from .representation import runtime_contract


class RegistryError(ValueError):
    """Base registry error."""

    def __init__(
        self,
        message: str,
        *,
        field: str | None = None,
    ) -> None:
        super().__init__(message)
        self.field = field


class RegistryNotFoundError(RegistryError):
    """Raised when a registry object does not exist."""


class RegistryConflictError(RegistryError):
    """Raised when a registry operation conflicts with existing data."""


class RegistryValidationError(RegistryError):
    """Raised when registry-level validation fails."""


class BindHomeRegistry:
    """Store BindHome-owned infrastructure abstractions."""

    def __init__(self) -> None:
        self.assets: dict[str, Asset] = {}
        self.relations: dict[str, Relation] = {}
        self.bindings: dict[str, Binding] = {}
        self.representations: dict[str, Representation] = {}

    def add_asset(self, asset: Asset) -> Asset:
        """Add an asset."""
        if asset.id in self.assets:
            raise RegistryConflictError(f"Asset {asset.id} already exists")
        if asset.code and any(
            existing.code == asset.code for existing in self.assets.values()
        ):
            raise RegistryConflictError(
                f"Asset code {asset.code} already exists",
                field="code",
            )
        self.assets[asset.id] = asset
        return asset

    def update_asset(
        self,
        asset_id: str,
        *,
        name: str,
        asset_type: str,
        code: str | None,
        area_id: str | None,
        capabilities: tuple[str, ...] | list[str],
    ) -> Asset:
        """Update an asset while preserving its stable identity."""
        asset = self.get_asset(asset_id)
        updated = asset.with_updates(
            name=name,
            asset_type=asset_type,
            code=code,
            area_id=area_id,
            capabilities=capabilities,
        )

        if updated.code and any(
            existing.id != asset_id and existing.code == updated.code
            for existing in self.assets.values()
        ):
            raise RegistryConflictError(
                f"Asset code {updated.code} already exists",
                field="code",
            )

        removed = set(asset.capabilities) - set(updated.capabilities)
        if removed:
            blocking = [
                binding
                for binding in self.bindings.values()
                if binding.asset_id == asset_id and binding.capability in removed
            ]
            if blocking:
                raise RegistryConflictError(
                    "Cannot remove capabilities that still have active bindings"
                )

            representation = self.representations.get(asset_id)
            if representation is not None:
                contract = runtime_contract(representation, asset_id)
                if contract is None:
                    raise RegistryValidationError(
                        f"Unknown representation platform {representation.platform}"
                    )
                required = contract.required_capabilities
                missing = sorted(required - set(updated.capabilities))
                if missing:
                    raise RegistryConflictError(
                        "Cannot remove capabilities required by active "
                        f"{representation.platform} representation: "
                        f"{', '.join(missing)}",
                        field="capabilities",
                    )

        self.assets[asset_id] = updated
        return updated

    def update_asset_capabilities(
        self, asset_id: str, capabilities: tuple[str, ...] | list[str]
    ) -> Asset:
        """Replace capabilities while preserving the existing asset metadata."""
        asset = self.get_asset(asset_id)
        return self.update_asset(
            asset_id,
            name=asset.name,
            asset_type=asset.asset_type,
            code=asset.code,
            area_id=asset.area_id,
            capabilities=capabilities,
        )

    def delete_asset(self, asset_id: str) -> None:
        """Delete an unreferenced asset."""
        self.get_asset(asset_id)
        if any(
            relation.source_asset_id == asset_id or relation.target_asset_id == asset_id
            for relation in self.relations.values()
        ):
            raise RegistryConflictError("Cannot delete an asset used by a relation")
        if any(binding.asset_id == asset_id for binding in self.bindings.values()):
            raise RegistryConflictError("Cannot delete an asset with active bindings")
        if asset_id in self.representations:
            raise RegistryConflictError(
                "Cannot delete an asset with active representation"
            )
        del self.assets[asset_id]

    def get_asset(self, asset_id: str) -> Asset:
        """Get an asset or fail."""
        try:
            return self.assets[asset_id]
        except KeyError as err:
            raise RegistryNotFoundError(f"Asset {asset_id} was not found") from err

    def add_relation(self, relation: Relation) -> Relation:
        """Add a topology relation."""
        self.get_asset(relation.source_asset_id)
        self.get_asset(relation.target_asset_id)
        if relation.id in self.relations:
            raise RegistryConflictError(f"Relation {relation.id} already exists")
        if any(
            existing.source_asset_id == relation.source_asset_id
            and existing.relation_type == relation.relation_type
            and existing.target_asset_id == relation.target_asset_id
            for existing in self.relations.values()
        ):
            raise RegistryConflictError("The same topology relation already exists")
        self.relations[relation.id] = relation
        return relation

    def remove_relation(self, relation_id: str) -> None:
        """Remove a topology relation."""
        if relation_id not in self.relations:
            raise RegistryNotFoundError(f"Relation {relation_id} was not found")
        del self.relations[relation_id]

    def set_binding(self, binding: Binding) -> Binding:
        """Create or replace the binding for an asset capability and role."""
        asset = self.get_asset(binding.asset_id)
        if binding.capability not in asset.capabilities:
            raise RegistryValidationError(
                f"Asset {asset.id} does not provide capability {binding.capability}"
            )

        existing = next(
            (
                candidate
                for candidate in self.bindings.values()
                if candidate.asset_id == binding.asset_id
                and candidate.capability == binding.capability
                and candidate.role == binding.role
            ),
            None,
        )
        if existing is not None:
            updated = replace(
                existing,
                entity_id=binding.entity_id,
                entity_registry_id=binding.entity_registry_id,
            )
            self.bindings[existing.id] = updated
            return updated

        if binding.id in self.bindings:
            raise RegistryConflictError(f"Binding {binding.id} already exists")

        self.bindings[binding.id] = binding
        return binding

    def get_binding(
        self, asset_id: str, capability: str, role: str = "primary"
    ) -> Binding | None:
        """Return the binding for an asset capability and role, if any.

        This is the read-side counterpart of :meth:`set_binding` and uses the
        same ``(asset_id, capability, role)`` identity rule.
        """
        return next(
            (
                candidate
                for candidate in self.bindings.values()
                if candidate.asset_id == asset_id
                and candidate.capability == capability
                and candidate.role == role
            ),
            None,
        )

    def remove_binding(self, binding_id: str) -> None:
        """Remove a capability binding."""
        if binding_id not in self.bindings:
            raise RegistryNotFoundError(f"Binding {binding_id} was not found")
        del self.bindings[binding_id]

    def set_representation(
        self,
        representation: Representation,
    ) -> Representation:
        """Create the optional logical representation for an Asset."""
        asset = self.get_asset(representation.asset_id)

        contract = runtime_contract(representation, representation.asset_id)
        if contract is None:
            raise RegistryValidationError(
                "BindHome does not implement representation platform "
                f"{representation.platform}",
                field="platform",
            )

        missing = sorted(contract.required_capabilities - set(asset.capabilities))
        if missing:
            raise RegistryValidationError(
                f"{representation.platform} representation requires capabilities: "
                f"{', '.join(missing)}",
                field="capabilities",
            )

        existing = self.representations.get(asset.id)
        if existing is not None:
            if existing.platform == representation.platform:
                return existing

            raise RegistryConflictError(
                "Cannot change representation platform directly; "
                "remove the current representation first",
                field="platform",
            )

        self.representations[asset.id] = representation
        return representation

    def get_representation(self, asset_id: str) -> Representation | None:
        """Return an Asset's logical representation, if configured."""
        self.get_asset(asset_id)
        return self.representations.get(asset_id)

    def remove_representation(self, asset_id: str) -> None:
        """Remove an Asset's logical representation."""
        self.get_asset(asset_id)

        if asset_id not in self.representations:
            raise RegistryNotFoundError(
                f"Representation for Asset {asset_id} was not found"
            )

        del self.representations[asset_id]

    def to_dict(self) -> dict[str, Any]:
        """Serialize the complete registry."""
        return {
            "schema_version": REGISTRY_SCHEMA_VERSION,
            "assets": [asset.to_dict() for asset in self.assets.values()],
            "relations": [relation.to_dict() for relation in self.relations.values()],
            "bindings": [binding.to_dict() for binding in self.bindings.values()],
            "representations": [
                representation.to_dict()
                for representation in self.representations.values()
            ],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> BindHomeRegistry:
        """Parse and validate only the current canonical Registry schema.

        Historical schema migration belongs in ``migrations.py``. Keeping this
        parser strict prevents ordinary model parsing from silently changing
        persisted semantics.
        """
        registry = cls()
        if data is None:
            return registry
        if not isinstance(data, dict):
            raise RegistryValidationError("Persisted registry must be a dictionary")

        if "schema_version" not in data:
            raise RegistryValidationError(
                "Persisted registry is missing schema_version"
            )
        schema_version = data["schema_version"]
        if schema_version != REGISTRY_SCHEMA_VERSION:
            raise RegistryValidationError(
                f"Unsupported registry schema version: {schema_version}"
            )

        for raw_asset in data.get("assets", []):
            try:
                registry.add_asset(Asset.from_dict(raw_asset))
            except (ModelValidationError, RegistryError) as err:
                raise RegistryValidationError(
                    f"Invalid asset in registry: {err}"
                ) from err

        for raw_relation in data.get("relations", []):
            try:
                registry.add_relation(Relation.from_dict(raw_relation))
            except (ModelValidationError, RegistryError) as err:
                raise RegistryValidationError(
                    f"Invalid relation in registry: {err}"
                ) from err

        for raw_binding in data.get("bindings", []):
            try:
                registry.set_binding(Binding.from_dict(raw_binding))
            except (ModelValidationError, RegistryError) as err:
                raise RegistryValidationError(
                    f"Invalid binding in registry: {err}"
                ) from err

        if "representations" not in data:
            raise RegistryValidationError(
                "Current registry schema is missing representations"
            )

        for raw_representation in data.get("representations", []):
            try:
                registry.set_representation(
                    Representation.from_dict(raw_representation)
                )
            except (ModelValidationError, RegistryError) as err:
                raise RegistryValidationError(
                    f"Invalid representation in registry: {err}"
                ) from err

        return registry
