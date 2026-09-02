"""Logical light platform for BindHome."""

from __future__ import annotations

import asyncio
from typing import Any

from homeassistant.components.light import ColorMode, LightEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN, SIGNAL_REGISTRY_CHANGED
from .manager import BindHomeManager
from .models import Asset
from .resolver import (
    BindingResolver,
    Resolution,
    ResolutionStatus,
)

_CAPABILITY = "on_off"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: Any,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up and dynamically reconcile BindHome logical lights."""
    manager: BindHomeManager = entry.runtime_data
    entity_registry = er.async_get(hass)

    entities: dict[str, BindHomeLight] = {}
    reconcile_lock = asyncio.Lock()

    async def async_reconcile() -> None:
        """Reconcile logical lights against the current BindHome registry."""
        async with reconcile_lock:
            eligible_assets = {
                asset.id: asset
                for asset in manager.registry.assets.values()
                if BindHomeLight.is_eligible(asset)
            }

            current_ids = set(entities)
            eligible_ids = set(eligible_assets)

            # Remove logical entities whose assets no longer expose on_off.
            for asset_id in sorted(current_ids - eligible_ids):
                entity = entities.pop(asset_id)

                if entity.hass is not None:
                    platform = entity.platform
                    await entity.async_remove(force_remove=True)

                    # Direct force-removal bypasses
                    # EntityPlatform.async_remove_entity(), so mirror its polling
                    # cleanup when no polling entities remain.
                    if not any(
                        candidate.should_poll
                        for candidate in platform.entities.values()
                    ):
                        platform.async_unsub_polling()

                entity_id = entity_registry.async_get_entity_id(
                    "light",
                    DOMAIN,
                    f"{DOMAIN}_{asset_id}",
                )
                if entity_id is not None:
                    entity_registry.async_remove(entity_id)

            # Refresh metadata for entities which continue to exist.
            for asset_id in sorted(current_ids & eligible_ids):
                asset = eligible_assets[asset_id]
                entity = entities[asset_id]

                entity.update_asset(asset)

                entity_id = entity_registry.async_get_entity_id(
                    "light",
                    DOMAIN,
                    entity.unique_id,
                )
                if entity_id is not None:
                    entity_registry.async_update_entity(
                        entity_id,
                        area_id=asset.area_id,
                        original_name=asset.name,
                    )

            # Add newly eligible assets.
            new_entities: list[BindHomeLight] = []

            for asset_id in sorted(eligible_ids - current_ids):
                asset = eligible_assets[asset_id]
                entity = BindHomeLight(
                    hass,
                    asset,
                    manager.resolver,
                )
                entities[asset_id] = entity
                new_entities.append(entity)

            if new_entities:
                async_add_entities(new_entities)

    await async_reconcile()

    entry.async_on_unload(
        async_dispatcher_connect(
            hass,
            SIGNAL_REGISTRY_CHANGED,
            async_reconcile,
        )
    )


class BindHomeLight(LightEntity):
    """A stable logical light backed by the asset's current binding."""

    _attr_should_poll = True
    _attr_color_mode = ColorMode.ONOFF
    _attr_supported_color_modes = {ColorMode.ONOFF}

    def __init__(
        self, hass: HomeAssistant, asset: Asset, resolver: BindingResolver
    ) -> None:
        self.hass = hass
        self._asset = asset
        self._resolver = resolver
        self._resolution: Resolution | None = None
        self._attr_name = asset.name
        self._attr_unique_id = f"{DOMAIN}_{asset.id}"
        self._attr_available = False
        self._attr_is_on = None

    @property
    def asset_id(self) -> str:
        """Return the stable BindHome asset identity."""
        return self._asset.id

    def update_asset(self, asset: Asset) -> None:
        """Refresh mutable asset metadata while preserving entity identity."""
        if asset.id != self._asset.id:
            raise ValueError("Cannot replace the stable asset identity")

        self._asset = asset
        self._attr_name = asset.name

        if self.hass is not None:
            self.async_write_ha_state()

    @staticmethod
    def is_eligible(asset: Asset) -> bool:
        """Return whether an asset can be represented as a logical light."""
        return _CAPABILITY in asset.capabilities

    async def async_update(self) -> None:
        """Refresh state from the binding resolved at operation time."""
        self._resolution = self._resolver.resolve(self._asset.id, _CAPABILITY)
        self._attr_available = self._resolution.runtime_available
        state = self._resolution.state
        self._attr_is_on = (
            state == "on"
            if self._resolution.runtime_available and state in {"on", "off"}
            else None
        )

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

        await self.hass.services.async_call(
            "homeassistant",
            service,
            {"entity_id": entity_id},
            blocking=True,
        )
