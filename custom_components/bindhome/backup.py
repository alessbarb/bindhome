"""Stable BindHome Registry backup and restore contract."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from .registry import BindHomeRegistry, RegistryValidationError

if TYPE_CHECKING:
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


def parse_registry_backup(data: object) -> BindHomeRegistry:
    """Validate a backup envelope and return its isolated Registry."""
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
        return BindHomeRegistry.from_dict(registry_data)
    except RegistryValidationError as err:
        raise BackupValidationError(f"Invalid BindHome backup registry: {err}") from err


async def async_restore_registry_backup(
    manager: BindHomeManager,
    data: object,
) -> BindHomeRegistry:
    """Validate and atomically replace the live Registry from a backup."""
    staged = parse_registry_backup(data)

    async with manager._mutation_lock:
        await manager._async_commit_staged_registry(staged)

    return manager.registry
