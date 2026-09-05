"""Stable Home Assistant identity helpers for persisted Bindings."""

from __future__ import annotations

from dataclasses import replace

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .registry import BindHomeRegistry


def entity_registry_id_for_entity(
    hass: HomeAssistant,
    entity_id: str,
) -> str | None:
    """Return the exact Entity Registry entry identity for an entity id, if any."""
    entry = er.async_get(hass).async_get(entity_id)
    return entry.id if entry is not None else None


def enrich_binding_target_identities(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
) -> bool:
    """Upgrade provable entity-id fallbacks to stable Entity Registry identity.

    Only an exact Entity Registry lookup by the persisted ``entity_id`` is used.
    Missing targets remain explicit entity-id fallbacks; this function never
    searches for or guesses a different entity.
    """
    entity_registry = er.async_get(hass)
    changed = False

    for binding_id, binding in tuple(registry.bindings.items()):
        if binding.entity_registry_id is not None:
            continue

        entry = entity_registry.async_get(binding.entity_id)
        if entry is None:
            continue

        registry.bindings[binding_id] = replace(
            binding,
            entity_registry_id=entry.id,
        )
        changed = True

    return changed
