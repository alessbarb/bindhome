"""Redacted Home Assistant diagnostics for BindHome."""

from __future__ import annotations

from typing import Any, cast

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN, REGISTRY_SCHEMA_VERSION, STORAGE_VERSION
from .manager import BindHomeManager
from .recovery import async_get_recovery_state
from .registry import BindHomeRegistry
from .resolver import (
    BindingResolver,
    EntityProbe,
    HomeAssistantEntityProbe,
    ResolutionStatus,
)


def _registry_diagnostics(
    registry: BindHomeRegistry,
    probe: EntityProbe,
) -> dict[str, Any]:
    """Return aggregate Registry diagnostics without exposing identifiers."""
    resolver = BindingResolver(registry, probe)
    statuses = {status.value: 0 for status in ResolutionStatus}
    config_valid = 0
    runtime_available = 0

    for binding in registry.bindings.values():
        resolution = resolver.resolve(
            binding.asset_id,
            binding.capability,
            binding.role,
        )
        statuses[resolution.status.value] += 1
        config_valid += int(resolution.config_valid)
        runtime_available += int(resolution.runtime_available)

    return {
        "counts": {
            "assets": len(registry.assets),
            "relations": len(registry.relations),
            "bindings": len(registry.bindings),
            "representations": len(registry.representations),
        },
        "resolver": {
            "configured_bindings": len(registry.bindings),
            "config_valid": config_valid,
            "runtime_available": runtime_available,
            "statuses": statuses,
        },
    }


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict[str, Any]:
    """Return privacy-preserving diagnostics for a BindHome config entry."""
    integration = await async_get_integration(hass, DOMAIN)
    recovery = async_get_recovery_state(hass, entry.entry_id)
    loaded = entry.state is ConfigEntryState.LOADED

    result: dict[str, Any] = {
        "integration": {
            "version": integration.version,
            "storage_version": STORAGE_VERSION,
            "registry_schema_version": REGISTRY_SCHEMA_VERSION,
        },
        "config_entry": {
            "state": entry.state.value,
            "version": getattr(entry, "version", None),
            "minor_version": getattr(entry, "minor_version", None),
        },
        "recovery": {
            "required": recovery is not None,
            "reason": recovery.reason if recovery is not None else None,
        },
        "registry": {
            "available": loaded,
            "counts": None,
        },
        "resolver": None,
    }

    if not loaded:
        return result

    manager = cast(BindHomeManager, entry.runtime_data)
    snapshot = _registry_diagnostics(
        manager.registry,
        HomeAssistantEntityProbe(hass),
    )
    result["registry"] = {
        "available": True,
        "counts": snapshot["counts"],
    }
    result["resolver"] = snapshot["resolver"]
    return result
