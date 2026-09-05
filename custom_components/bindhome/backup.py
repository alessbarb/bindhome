"""Stable BindHome Registry backup and restore contract."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from .binding_identity import enrich_binding_target_identities
from .migrations import migrate_registry_payload
from .registry import BindHomeRegistry, RegistryValidationError
from .registry_state import replace_registry_contents

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from .manager import BindHomeManager

BACKUP_FORMAT = "bindhome.registry"
BACKUP_FORMAT_VERSION = 1


class BackupValidationError(RegistryValidationError):
    """Raised when a BindHome backup cannot be restored safely."""


def export_registry_backup(registry: BindHomeRegistry) -> dict[str, Any]:
    """Return a deterministic, versioned backup envelope."""
    return {
        "format": BACKUP_FORMAT,
        "format_version": BACKUP_FORMAT_VERSION,
        "registry": registry.to_dict(),
    }


def parse_registry_backup(
    data: object,
    *,
    hass: HomeAssistant | None = None,
) -> BindHomeRegistry:
    """Validate a backup envelope and return its current-schema Registry."""
    if not isinstance(data, dict):
        raise BackupValidationError("BindHome backup must be a dictionary")

    backup_format = data.get("format")
    if backup_format != BACKUP_FORMAT:
        raise BackupValidationError(
            f"Unsupported BindHome backup format: {backup_format}"
        )

    format_version = data.get("format_version")
    if format_version != BACKUP_FORMAT_VERSION:
        raise BackupValidationError(
            f"Unsupported BindHome backup format version: {format_version}"
        )

    if "registry" not in data:
        raise BackupValidationError("BindHome backup is missing registry")

    registry_data = data["registry"]
    if not isinstance(registry_data, dict):
        raise BackupValidationError("BindHome backup registry must be a dictionary")

    try:
        registry = migrate_registry_payload(registry_data).registry
        if hass is not None:
            enrich_binding_target_identities(hass, registry)
        return registry
    except RegistryValidationError as err:
        raise BackupValidationError(f"Invalid BindHome backup registry: {err}") from err


async def async_restore_registry_backup(
    manager: BindHomeManager,
    data: object,
) -> BindHomeRegistry:
    """Validate and atomically replace the live Registry from a backup."""
    replacement = parse_registry_backup(data, hass=manager.hass)

    async with manager.transaction() as staged:
        replace_registry_contents(staged, replacement)

    return manager.registry
