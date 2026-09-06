"""Runtime contracts for BindHome-owned representations."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN
from .models import Binding, BindingKey, Representation


@dataclass(frozen=True, slots=True)
class RepresentationRuntimeContract:
    """HA identity and functional dependencies of a representation."""

    domain: str
    unique_id: str
    required_capabilities: frozenset[str]
    dependencies: tuple[BindingKey, ...]


def runtime_contract(
    representation: Representation, asset_id: str
) -> RepresentationRuntimeContract | None:
    """Return the runtime contract for an implemented representation."""
    if representation.platform == "light":
        return RepresentationRuntimeContract(
            domain="light",
            unique_id=f"{DOMAIN}_{asset_id}",
            required_capabilities=frozenset({"on_off"}),
            dependencies=((asset_id, "on_off", "primary"),),
        )
    return None


def representation_asset_for_entity(
    hass: HomeAssistant,
    entity_id: str,
    representations: dict[str, Representation],
) -> str | None:
    """Map an HA entity to an active BindHome representation by registry identity."""
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get(entity_id)
    if entry is None or entry.platform != DOMAIN:
        return None

    for asset_id, representation in representations.items():
        contract = runtime_contract(representation, asset_id)
        if contract is None:
            continue
        if entry.domain != contract.domain or entry.unique_id != contract.unique_id:
            continue
        current_entity_id = entity_registry.async_get_entity_id(
            contract.domain, DOMAIN, contract.unique_id
        )
        if current_entity_id == entity_id:
            return asset_id
    return None


def binding_key(binding: Binding) -> BindingKey:
    """Return a binding's functional identity."""
    return (binding.asset_id, binding.capability, binding.role)


def representation_entity_ids(
    hass: HomeAssistant, representations: dict[str, Representation]
) -> dict[str, str | None]:
    """Resolve current logical entity IDs without persisting HA runtime metadata."""
    entity_registry = er.async_get(hass)
    result = {}
    for asset_id, representation in representations.items():
        contract = runtime_contract(representation, asset_id)
        result[asset_id] = (
            entity_registry.async_get_entity_id(
                contract.domain, DOMAIN, contract.unique_id
            )
            if contract is not None
            else None
        )
    return result


def implemented_platforms() -> frozenset[str]:
    """Return platforms with a BindHome runtime contract."""
    return frozenset({"light"})
