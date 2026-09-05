"""Logical light platform for BindHome."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from typing import Any

from homeassistant.components.light import ColorMode, LightEntity
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from .const import DOMAIN, SIGNAL_BINDING_TARGET_CHANGED, SIGNAL_REGISTRY_CHANGED
from .manager import BindHomeManager
from .models import Asset, Representation
from .representation import runtime_contract
from .resolver import (
    BindingResolver,
    Resolution,
    ResolutionStatus,
)

_CAPABILITY = "on_off"


def _entity_registry_id(asset_id: str) -> tuple[str, str, str]:
    """Return the Entity Registry identity for a logical light."""
    contract = runtime_contract(
        Representation.create(asset_id=asset_id, platform="light"), asset_id
    )
    if contract is None:
        raise ValueError("Missing runtime contract for light representation")
    return contract.domain, DOMAIN, contract.unique_id


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
            eligible_assets: dict[str, Asset] = {}

            for asset_id, representation in manager.registry.representations.items():
                if representation.platform != "light":
                    continue

                asset = manager.registry.get_asset(asset_id)
                if BindHomeLight.is_eligible(asset, representation):
                    eligible_assets[asset.id] = asset

            current_ids = set(entities)
            eligible_ids = set(eligible_assets)

            # Remove logical entities whose light Representation disappeared.
            for asset_id in sorted(current_ids - eligible_ids):
                entity = entities.pop(asset_id)

                if entity.hass is not None:
                    await entity.async_remove(force_remove=True)

                entity_id = entity_registry.async_get_entity_id(
                    *_entity_registry_id(asset_id)
                )
                if entity_id is not None:
                    entity_registry.async_remove(entity_id)

            # Refresh metadata and Binding subscriptions for surviving entities.
            for asset_id in sorted(current_ids & eligible_ids):
                asset = eligible_assets[asset_id]
                entity = entities[asset_id]

                entity.update_asset(asset)
                entity.refresh_binding_subscription()

                entity_id = entity_registry.async_get_entity_id(
                    *_entity_registry_id(asset_id)
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

    _attr_should_poll = False
    _attr_color_mode = ColorMode.ONOFF
    _attr_supported_color_modes = {ColorMode.ONOFF}

    def __init__(
        self, hass: HomeAssistant, asset: Asset, resolver: BindingResolver
    ) -> None:
        self.hass = hass
        self._asset = asset
        self._resolver = resolver
        self._resolution: Resolution | None = None
        self._subscribed_entity_id: str | None = None
        self._unsub_backing_state: Callable[[], None] | None = None
        self._unsub_binding_target: Callable[[], None] | None = None
        self._attr_name = asset.name
        self._attr_unique_id = _entity_registry_id(asset.id)[2]
        self._attr_available = False
        self._attr_is_on = None

    @property
    def asset_id(self) -> str:
        """Return the stable BindHome asset identity."""
        return self._asset.id

    async def async_added_to_hass(self) -> None:
        """Subscribe to the currently resolved backing entity."""
        await super().async_added_to_hass()
        self.refresh_binding_subscription()
        self._unsub_binding_target = async_dispatcher_connect(
            self.hass,
            SIGNAL_BINDING_TARGET_CHANGED,
            self._handle_binding_target_change,
        )

    async def async_will_remove_from_hass(self) -> None:
        """Release Binding-target and backing-state listeners before removal."""
        if self._unsub_binding_target is not None:
            self._unsub_binding_target()
            self._unsub_binding_target = None
        self._unsubscribe_backing_state()
        await super().async_will_remove_from_hass()

    def update_asset(self, asset: Asset) -> None:
        """Refresh mutable asset metadata while preserving entity identity."""
        if asset.id != self._asset.id:
            raise ValueError("Cannot replace the stable asset identity")

        self._asset = asset
        self._attr_name = asset.name

        if self.hass is not None and self.entity_id is not None:
            self.async_write_ha_state()

    @staticmethod
    def is_eligible(
        asset: Asset,
        representation: Representation,
    ) -> bool:
        """Return whether this explicit Representation belongs to this light."""
        contract = runtime_contract(representation, asset.id)
        return (
            contract is not None
            and representation.asset_id == asset.id
            and contract.required_capabilities <= set(asset.capabilities)
        )

    def refresh_binding_subscription(self) -> None:
        """Re-resolve the Binding and follow its backing entity without polling."""
        resolution = self._resolver.resolve(self._asset.id, _CAPABILITY)
        self._apply_resolution(resolution)
        entity_id = resolution.entity_id

        if entity_id != self._subscribed_entity_id:
            self._unsubscribe_backing_state()
            if entity_id is not None:
                self._unsub_backing_state = async_track_state_change_event(
                    self.hass,
                    [entity_id],
                    self._handle_backing_state_change,
                )
                self._subscribed_entity_id = entity_id

        if self.entity_id is not None:
            self.async_write_ha_state()

    @callback
    def _handle_binding_target_change(self, change: dict[str, Any]) -> None:
        """Re-resolve only when this light's stable Binding target changed."""
        binding = self._resolution.binding if self._resolution is not None else None
        if (
            binding is None
            or binding.entity_registry_id is None
            or binding.entity_registry_id != change.get("entity_registry_id")
        ):
            return
        self.refresh_binding_subscription()

    @callback
    def _handle_backing_state_change(self, event: Event) -> None:
        """Refresh logical state immediately after a backing entity state event."""
        if event.data.get("entity_id") != self._subscribed_entity_id:
            return

        self._apply_resolution(self._resolver.resolve(self._asset.id, _CAPABILITY))
        if self.entity_id is not None:
            self.async_write_ha_state()

    def _apply_resolution(self, resolution: Resolution) -> None:
        """Project one resolver result onto Home Assistant light attributes."""
        self._resolution = resolution
        self._attr_available = resolution.runtime_available
        state = resolution.state
        self._attr_is_on = (
            state == "on"
            if resolution.runtime_available and state in {"on", "off"}
            else None
        )

    def _unsubscribe_backing_state(self) -> None:
        """Remove the current backing state listener exactly once."""
        if self._unsub_backing_state is not None:
            self._unsub_backing_state()
            self._unsub_backing_state = None
        self._subscribed_entity_id = None

    async def async_update(self) -> None:
        """Support an explicit refresh without enabling periodic polling."""
        self._apply_resolution(self._resolver.resolve(self._asset.id, _CAPABILITY))

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
