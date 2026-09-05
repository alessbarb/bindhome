"""Safe, transactional Asset deletion for the human BindHome workflow."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.helpers import entity_registry as er

from .const import DOMAIN
from .manager import BindHomeManager
from .models import Binding, Relation, Representation
from .registry import BindHomeRegistry
from .representation import representation_asset_for_entity, runtime_contract


@dataclass(frozen=True, slots=True)
class AssetDeleteImpact:
    """Describe BindHome and Home Assistant state affected by deleting an Asset."""

    asset_id: str
    relations: tuple[Relation, ...]
    owned_bindings: tuple[Binding, ...]
    dependent_bindings: tuple[Binding, ...]
    representation: Representation | None
    logical_entity_id: str | None

    def to_dict(self) -> dict[str, object]:
        """Return a stable user-facing deletion preview."""
        return {
            "asset_id": self.asset_id,
            "relations": [relation.to_dict() for relation in self.relations],
            "owned_bindings": [binding.to_dict() for binding in self.owned_bindings],
            "dependent_bindings": [
                binding.to_dict() for binding in self.dependent_bindings
            ],
            "representation": (
                self.representation.to_dict()
                if self.representation is not None
                else None
            ),
            "logical_entity_id": self.logical_entity_id,
        }


def build_asset_delete_impact(
    manager: BindHomeManager,
    asset_id: str,
    *,
    registry: BindHomeRegistry | None = None,
) -> AssetDeleteImpact:
    """Build the authoritative impact of deleting one Asset."""
    target = registry or manager.registry
    target.get_asset(asset_id)

    relations = tuple(
        relation
        for relation in target.relations.values()
        if relation.source_asset_id == asset_id or relation.target_asset_id == asset_id
    )
    owned_bindings = tuple(
        binding for binding in target.bindings.values() if binding.asset_id == asset_id
    )

    representation = target.representations.get(asset_id)
    logical_entity_id: str | None = None
    if representation is not None:
        contract = runtime_contract(representation, asset_id)
        if contract is not None:
            logical_entity_id = er.async_get(manager.hass).async_get_entity_id(
                contract.domain,
                DOMAIN,
                contract.unique_id,
            )

    dependent_bindings: list[Binding] = []
    if representation is not None:
        for binding in target.bindings.values():
            if binding.asset_id == asset_id:
                continue
            if (
                representation_asset_for_entity(
                    manager.hass,
                    binding.entity_id,
                    target.representations,
                )
                == asset_id
            ):
                dependent_bindings.append(binding)

    return AssetDeleteImpact(
        asset_id=asset_id,
        relations=relations,
        owned_bindings=owned_bindings,
        dependent_bindings=tuple(dependent_bindings),
        representation=representation,
        logical_entity_id=logical_entity_id,
    )


async def async_delete_asset_with_dependencies(
    manager: BindHomeManager,
    asset_id: str,
) -> AssetDeleteImpact:
    """Delete an Asset and its BindHome-owned dependencies as one transaction."""
    async with manager._mutation_lock:
        staged = manager._stage_registry()
        impact = build_asset_delete_impact(manager, asset_id, registry=staged)

        for relation in impact.relations:
            staged.remove_relation(relation.id)

        binding_ids = {
            binding.id
            for binding in (*impact.owned_bindings, *impact.dependent_bindings)
        }
        for binding_id in sorted(binding_ids):
            staged.remove_binding(binding_id)

        if impact.representation is not None:
            staged.remove_representation(asset_id)

        # Use the existing strict delete as the final invariant check. If a new
        # BindHome reference type is added later and is not cleaned above, the
        # transaction fails closed rather than leaving an orphan.
        staged.delete_asset(asset_id)
        await manager._async_commit_staged_registry(staged)
        return impact
