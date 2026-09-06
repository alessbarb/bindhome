"""BindHome integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .adoption import AdoptionError
from .adoption_runtime import async_prepare_adoption_manager, get_adoption_manager
from .adoption_websocket import async_register_adoption_websocket_commands
from .backup_websocket import async_register_backup_websocket_commands
from .binding_events import BindingTargetEventTracker
from .const import DOMAIN
from .csv_websocket import async_register_csv_websocket_commands
from .deletion_websocket import async_register_deletion_websocket_commands
from .import_websocket import async_register_import_websocket_commands
from .integrity_repairs import IntegrityRepairTracker
from .manager import BindHomeManager
from .panel import async_register_panel, async_unregister_panel
from .recovery import async_clear_recovery_state, async_set_recovery_state
from .reference_websocket import async_register_reference_websocket_commands
from .replacement_websocket import async_register_replacement_websocket_commands
from .representation import implemented_platforms
from .services import async_register_services
from .store import BindHomeStoreError
from .websocket import async_register_websocket_commands

type BindHomeConfigEntry = ConfigEntry[BindHomeManager]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
PLATFORMS = [Platform(platform) for platform in implemented_platforms()]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up BindHome and register service actions."""
    async_register_services(hass)
    async_register_websocket_commands(hass)
    async_register_backup_websocket_commands(hass)
    async_register_csv_websocket_commands(hass)
    async_register_import_websocket_commands(hass)
    async_register_deletion_websocket_commands(hass)
    async_register_replacement_websocket_commands(hass)
    async_register_reference_websocket_commands(hass)
    async_register_adoption_websocket_commands(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: BindHomeConfigEntry) -> bool:
    """Set up BindHome from a config entry."""
    manager = BindHomeManager(hass)
    try:
        await manager.async_load()
    except BindHomeStoreError as err:
        async_set_recovery_state(hass, entry.entry_id, err)
        raise ConfigEntryError(str(err)) from err

    async_clear_recovery_state(hass, entry.entry_id)
    try:
        adoption_manager = await async_prepare_adoption_manager(hass, manager.registry)
    except AdoptionError as err:
        raise ConfigEntryError(str(err)) from err

    entry.runtime_data = manager
    entry.async_on_unload(adoption_manager.async_setup(manager.registry))

    binding_target_tracker = BindingTargetEventTracker(hass, manager)
    binding_target_tracker.async_setup()
    entry.async_on_unload(binding_target_tracker.async_unload)

    integrity_repair_tracker = IntegrityRepairTracker(hass, manager, entry.entry_id)
    integrity_repair_tracker.async_setup()
    entry.async_on_unload(integrity_repair_tracker.async_unload)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: BindHomeConfigEntry) -> bool:
    """Unload BindHome without changing persisted adoption ownership."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        async_unregister_panel(hass)
    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: BindHomeConfigEntry) -> None:
    """Restore all BindHome-owned visibility metadata when the entry is removed."""
    adoption_manager = get_adoption_manager(hass)
    if not adoption_manager.loaded:
        await adoption_manager.async_load()
    await adoption_manager.async_revert_all()
