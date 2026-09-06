"""Runtime lifecycle for BindHome hardware visibility adoption."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from .adoption import AdoptionManager
from .const import DOMAIN
from .registry import BindHomeRegistry

DATA_ADOPTION_MANAGER = f"{DOMAIN}_adoption_manager"


def get_adoption_manager(hass: HomeAssistant) -> AdoptionManager:
    """Return the integration-wide adoption manager."""
    manager = hass.data.get(DATA_ADOPTION_MANAGER)
    if isinstance(manager, AdoptionManager):
        return manager
    manager = AdoptionManager(hass)
    hass.data[DATA_ADOPTION_MANAGER] = manager
    return manager


async def async_prepare_adoption_manager(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
) -> AdoptionManager:
    """Load, reconcile and return the adoption manager for a loaded Registry."""
    manager = get_adoption_manager(hass)
    if not manager.loaded:
        await manager.async_load()
    await manager.async_reconcile(registry)
    return manager
