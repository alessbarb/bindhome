"""Logical light platform for BindHome."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from typing import Any

from homeassistant.components.light import (
    ColorMode,
    LightEntity,
    LightEntityFeature,
    filter_supported_color_modes,
)
from homeassistant.const import ATTR_SUPPORTED_FEATURES
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from .const import DOMAIN, SIGNAL_BINDING_TARGET_CHANGED, SIGNAL_REGISTRY_CHANGED
from .manager import BindHomeManager
from .models import Asset, Representation
from .representation import runtime_contract
from .resolver import BindingResolver, Resolution, ResolutionStatus

_CAPABILITY = "on_off"
_KNOWN_LIGHT_FEATURES = (
    LightEntityFeature.EFFECT | LightEntityFeature.FLASH | LightEntityFeature.TRANSITION
)


def _entity_registry_id(asset_id: str) -> tuple[str, str, str]:
    """Return the Entity Registry identity for a logical light."""
    contract = runtime_contract(
        Representation.create(asset_id=asset_id, platform="light"), asset_id
    )
    if contract is None:
        raise ValueError("Missing runtime contract for light representation")
    return contract.domain, DOMAIN, contract.unique_id


def _color_mode(value: Any) -> ColorMode | None:
    """Coerce one Home Assistant state attribute to a known color mode."""
    try:
        mode = ColorMode(value)
    except TypeError, ValueError:
        return None
    return None if mode is ColorMode.UNKNOWN else mode


def _supported_color_modes(attributes: dict[str, Any]) -> set[ColorMode]:
    """Return a safe advertised mode set from a backing light state."""
    raw_modes = attributes.get("supported_color_modes")
    if not isinstance(raw_modes, (list, tuple, set, frozenset)):
        return {ColorMode.ONOFF}

    modes = {mode for value in raw_modes if (mode := _color_mode(value)) is not None}
    if not modes:
        return {ColorMode.ONOFF}

    try:
        return filter_supported_color_modes(modes)
    except HomeAssistantError:
        return {ColorMode.ONOFF}


def _tuple_value(
    value: Any,
    length: int,
    caster: type[int] | type[float],
) -> tuple[Any, ...] | None:
    """Return a typed tuple from one state attribute when structurally valid."""
    if not isinstance(value, (list, tuple)) or len(value) != length:
        return None
    try:
        return tuple(caster(item) for item in value)
    except TypeError, ValueError:
        return None


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
        self._reset_light_capabilities()

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
        self._apply_backing_light_capabilities(resolution.entity_id)

    def _reset_light_capabilities(self) -> None:
        """Expose only safe ON/OFF semantics for a non-light or unknown target."""
        self._attr_supported_color_modes = {ColorMode.ONOFF}
        self._attr_color_mode = ColorMode.ONOFF
        self._attr_supported_features = LightEntityFeature(0)
        self._attr_brightness = None
        self._attr_color_temp_kelvin = None
        self._attr_min_color_temp_kelvin = None
        self._attr_max_color_temp_kelvin = None
        self._attr_hs_color = None
        self._attr_rgb_color = None
        self._attr_rgbw_color = None
        self._attr_rgbww_color = None
        self._attr_xy_color = None
        self._attr_effect = None
        self._attr_effect_list = None

    def _apply_backing_light_capabilities(self, entity_id: str | None) -> None:
        """Mirror the current backing light's safe Home Assistant capabilities."""
        self._reset_light_capabilities()
        if entity_id is None or not entity_id.startswith("light."):
            return

        backing_state = self.hass.states.get(entity_id)
        if backing_state is None:
            return

        attributes = backing_state.attributes
        modes = _supported_color_modes(attributes)
        self._attr_supported_color_modes = modes

        current_mode = _color_mode(attributes.get("color_mode"))
        if current_mode in modes:
            self._attr_color_mode = current_mode
        elif len(modes) == 1:
            self._attr_color_mode = next(iter(modes))
        else:
            self._attr_color_mode = None

        raw_features = attributes.get(ATTR_SUPPORTED_FEATURES, 0)
        try:
            features = LightEntityFeature(int(raw_features))
        except TypeError, ValueError:
            features = LightEntityFeature(0)
        self._attr_supported_features = features & _KNOWN_LIGHT_FEATURES

        brightness = attributes.get("brightness")
        self._attr_brightness = brightness if isinstance(brightness, int) else None

        color_temp = attributes.get("color_temp_kelvin")
        self._attr_color_temp_kelvin = (
            color_temp if isinstance(color_temp, int) else None
        )
        min_color_temp = attributes.get("min_color_temp_kelvin")
        self._attr_min_color_temp_kelvin = (
            min_color_temp if isinstance(min_color_temp, int) else None
        )
        max_color_temp = attributes.get("max_color_temp_kelvin")
        self._attr_max_color_temp_kelvin = (
            max_color_temp if isinstance(max_color_temp, int) else None
        )

        self._attr_hs_color = _tuple_value(attributes.get("hs_color"), 2, float)
        self._attr_xy_color = _tuple_value(attributes.get("xy_color"), 2, float)
        self._attr_rgb_color = _tuple_value(attributes.get("rgb_color"), 3, int)
        self._attr_rgbw_color = _tuple_value(attributes.get("rgbw_color"), 4, int)
        self._attr_rgbww_color = _tuple_value(attributes.get("rgbww_color"), 5, int)

        if self._attr_supported_features & LightEntityFeature.EFFECT:
            effect = attributes.get("effect")
            self._attr_effect = effect if isinstance(effect, str) else None
            effect_list = attributes.get("effect_list")
            if isinstance(effect_list, (list, tuple)) and all(
                isinstance(item, str) for item in effect_list
            ):
                self._attr_effect_list = list(effect_list)

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
        """Forward turn-on and supported light kwargs to the current target."""
        await self._async_forward("turn_on", kwargs)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Forward turn-off and supported light kwargs to the current target."""
        await self._async_forward("turn_off", kwargs)

    async def _async_forward(self, service: str, kwargs: dict[str, Any]) -> None:
        """Forward one command or raise a Home Assistant-visible runtime error."""
        resolution = self._resolver.resolve(self._asset.id, _CAPABILITY)
        self._apply_resolution(resolution)
        entity_id = resolution.entity_id
        if resolution.status is not ResolutionStatus.RESOLVED or entity_id is None:
            target = entity_id
            if target is None and resolution.binding is not None:
                target = resolution.binding.entity_id
            target_label = target or "configured target"
            raise HomeAssistantError(
                f"BindHome cannot {service.replace('_', ' ')} {self._asset.name}: "
                f"backing entity {target_label} is {resolution.status.value}"
            )

        service_data: dict[str, Any] = {"entity_id": entity_id}
        if entity_id.startswith("light."):
            service_domain = "light"
            service_data.update(kwargs)
        else:
            service_domain = "homeassistant"

        await self.hass.services.async_call(
            service_domain,
            service,
            service_data,
            blocking=True,
        )
