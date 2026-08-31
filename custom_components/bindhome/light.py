"""Logical light platform for BindHome."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.components.light import LightEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN
from .manager import BindHomeManager
from .models import Asset
from .resolver import (
    BindingResolver,
    CapabilityCompatibility,
    Compatibility,
    Resolution,
    ResolutionStatus,
)

_CAPABILITY = "on_off"
_SUPPORTED_DOMAINS = frozenset({"switch", "light"})


async def async_setup_entry(
    hass: HomeAssistant, entry: Any, async_add_entities: Callable
) -> None:
    """Set up logical lights for all eligible BindHome assets."""
    manager: BindHomeManager = entry.runtime_data
    async_add_entities(
        BindHomeLight(hass, asset, manager.resolver)
        for asset in manager.registry.assets.values()
        if BindHomeLight.is_eligible(asset)
    )


class BindHomeLight(LightEntity):
    """A stable logical light backed by the asset's current binding."""

    _attr_should_poll = True

    def __init__(
        self, hass: HomeAssistant, asset: Asset, resolver: BindingResolver
    ) -> None:
        self.hass = hass
        self._asset = asset
        self._resolver = resolver
        self._resolution: Resolution | None = None
        self._attr_name = asset.name
        self._attr_unique_id = f"{DOMAIN}_{asset.id}"

    @property
    def asset_id(self) -> str:
        """Return the stable BindHome asset identity."""
        return self._asset.id

    @staticmethod
    def is_eligible(asset: Asset) -> bool:
        """Return whether an asset can be represented as a logical light."""
        return _CAPABILITY in asset.capabilities

    @property
    def available(self) -> bool:
        """Be unavailable when the current binding cannot provide a live state."""
        return bool(self._resolution and self._resolution.runtime_available)

    @property
    def is_on(self) -> bool | None:
        """Return the current on/off state, if the binding is usable."""
        if not self._resolution or not self._resolution.runtime_available:
            return None
        if self._resolution.state == "on":
            return True
        if self._resolution.state == "off":
            return False
        return None

    async def async_update(self) -> None:
        """Refresh state from the binding resolved at operation time."""
        self._resolution = self._resolver.resolve(self._asset.id, _CAPABILITY)

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Forward turn-on to the currently bound switch or light."""
        await self._async_forward("turn_on")

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Forward turn-off to the currently bound switch or light."""
        await self._async_forward("turn_off")

    async def _async_forward(self, service: str) -> None:
        resolution = self._resolver.resolve(self._asset.id, _CAPABILITY)
        self._resolution = resolution
        entity_id = resolution.entity_id
        if resolution.status is not ResolutionStatus.RESOLVED or entity_id is None:
            return

        compatibility = CapabilityCompatibility().check(_CAPABILITY, entity_id)
        domain = entity_id.split(".", 1)[0] if "." in entity_id else ""
        if (
            compatibility.verdict is Compatibility.INCOMPATIBLE
            or domain not in _SUPPORTED_DOMAINS
        ):
            return

        try:
            await self.hass.services.async_call(
                domain,
                service,
                {"entity_id": entity_id},
                blocking=True,
            )
        except HomeAssistantError:
            return
