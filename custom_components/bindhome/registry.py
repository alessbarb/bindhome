"""In-memory BindHome infrastructure registry."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from .const import REGISTRY_SCHEMA_VERSION
from .models import Asset, Binding, ModelValidationError, Relation


class RegistryError(ValueError):
    """Base registry error."""


class RegistryNotFoundError(RegistryError):
    """Raised when a registry object does not exist."""


class RegistryConflictError(RegistryError):
    """Raised when a registry operation conflicts with existing data."""


class RegistryValidationError(RegistryError):
    """Raised when registry-level validation fails."""


class BindHomeRegistry:
    """Store assets, topology relations, and capability bindings."""

    def __init__(self) -> None:
        self.assets: dict[str, Asset] = {}
        self.relations: dict[str, Relation] = {}
        self.bindings: dict[str, Binding] = {}

    def add_asset(self, asset: Asset) -> Asset:
        """Add an asset."""
        if asset.id in self.assets:
            raise RegistryConflictError(f"Asset {asset.id} already exists")
        if asset.code and any(
            existing.code == asset.code for existing in self.assets.values()
        ):
            raise RegistryConflictError(f"Asset code {asset.code} already exists")
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
            raise RegistryConflictError(f"Asset code {updated.code} already exists")

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
            updated = replace(existing, entity_id=binding.entity_id)
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

    def to_dict(self) -> dict[str, Any]:
        """Serialize the complete registry."""
        return {
            "schema_version": REGISTRY_SCHEMA_VERSION,
            "assets": [asset.to_dict() for asset in self.assets.values()],
            "relations": [relation.to_dict() for relation in self.relations.values()],
            "bindings": [binding.to_dict() for binding in self.bindings.values()],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> BindHomeRegistry:
        """Load and validate a serialized registry."""
        registry = cls()
        if data is None:
            return registry
        if not isinstance(data, dict):
            raise RegistryValidationError("Persisted registry must be a dictionary")

        schema_version = data.get("schema_version", REGISTRY_SCHEMA_VERSION)
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

        return registry
