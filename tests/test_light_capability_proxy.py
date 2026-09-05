"""Capability-fidelity tests for BindHome logical light Representations."""

import pytest
from homeassistant.components.light import ColorMode, LightEntityFeature
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError

from custom_components.bindhome.light import BindHomeLight
from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import (
    BindingResolver,
    HomeAssistantEntityProbe,
)


def _setup(
    registry: BindHomeRegistry,
    hass: HomeAssistant,
    entity_id: str,
) -> BindHomeLight:
    asset = registry.add_asset(
        Asset.create(
            name="Proxy light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entity_id,
        )
    )
    return BindHomeLight(
        hass,
        asset,
        BindingResolver(registry, HomeAssistantEntityProbe(hass)),
    )


def _rebind(registry: BindHomeRegistry, logical: BindHomeLight, entity_id: str) -> None:
    registry.set_binding(
        Binding.create(
            asset_id=logical.asset_id,
            capability="on_off",
            entity_id=entity_id,
        )
    )


async def test_on_off_backing_light_advertises_only_on_off(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    hass.states.async_set(
        "light.onoff",
        "off",
        {
            "supported_color_modes": [ColorMode.ONOFF],
            "color_mode": ColorMode.ONOFF,
            "supported_features": 0,
        },
    )
    logical = _setup(registry, hass, "light.onoff")

    await logical.async_update()

    assert logical.available is True
    assert logical.supported_color_modes == {ColorMode.ONOFF}
    assert logical.color_mode is ColorMode.ONOFF
    assert logical.supported_features == 0
    assert logical.brightness is None


async def test_dimmable_backing_light_forwards_brightness_and_transition(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    hass.states.async_set(
        "light.dimmer",
        "on",
        {
            "supported_color_modes": [ColorMode.BRIGHTNESS],
            "color_mode": ColorMode.BRIGHTNESS,
            "brightness": 96,
            "supported_features": int(LightEntityFeature.TRANSITION),
        },
    )
    logical = _setup(registry, hass, "light.dimmer")
    calls: list[ServiceCall] = []

    async def capture(call: ServiceCall) -> None:
        calls.append(call)

    hass.services.async_register("light", "turn_on", capture)

    await logical.async_update()
    await logical.async_turn_on(brightness=200, transition=1.5)

    assert logical.supported_color_modes == {ColorMode.BRIGHTNESS}
    assert logical.color_mode is ColorMode.BRIGHTNESS
    assert logical.brightness == 96
    assert logical.supported_features == LightEntityFeature.TRANSITION
    assert len(calls) == 1
    assert calls[0].domain == "light"
    assert calls[0].service == "turn_on"
    assert calls[0].data == {
        "entity_id": "light.dimmer",
        "brightness": 200,
        "transition": 1.5,
    }


async def test_color_backing_light_projects_color_and_effect_metadata(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    hass.states.async_set(
        "light.color",
        "on",
        {
            "supported_color_modes": [ColorMode.HS, ColorMode.COLOR_TEMP],
            "color_mode": ColorMode.HS,
            "brightness": 180,
            "hs_color": (220.0, 65.0),
            "color_temp_kelvin": 3200,
            "min_color_temp_kelvin": 2000,
            "max_color_temp_kelvin": 6500,
            "supported_features": int(
                LightEntityFeature.EFFECT | LightEntityFeature.TRANSITION
            ),
            "effect": "relax",
            "effect_list": ["relax", "focus"],
        },
    )
    logical = _setup(registry, hass, "light.color")

    await logical.async_update()

    assert logical.supported_color_modes == {ColorMode.HS, ColorMode.COLOR_TEMP}
    assert logical.color_mode is ColorMode.HS
    assert logical.brightness == 180
    assert logical.hs_color == (220.0, 65.0)
    assert logical.color_temp_kelvin == 3200
    assert logical.min_color_temp_kelvin == 2000
    assert logical.max_color_temp_kelvin == 6500
    assert logical.supported_features & LightEntityFeature.EFFECT
    assert logical.supported_features & LightEntityFeature.TRANSITION
    assert logical.effect == "relax"
    assert logical.effect_list == ["relax", "focus"]


async def test_rebinding_refreshes_capabilities_without_changing_logical_identity(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    hass.states.async_set(
        "light.first",
        "on",
        {
            "supported_color_modes": [ColorMode.BRIGHTNESS],
            "color_mode": ColorMode.BRIGHTNESS,
            "brightness": 120,
        },
    )
    hass.states.async_set(
        "light.second",
        "on",
        {
            "supported_color_modes": [ColorMode.RGB],
            "color_mode": ColorMode.RGB,
            "rgb_color": (10, 20, 30),
        },
    )
    logical = _setup(registry, hass, "light.first")
    unique_id = logical.unique_id

    await logical.async_update()
    assert logical.supported_color_modes == {ColorMode.BRIGHTNESS}
    assert logical.brightness == 120

    _rebind(registry, logical, "light.second")
    logical.refresh_binding_subscription()

    assert logical.unique_id == unique_id
    assert logical.supported_color_modes == {ColorMode.RGB}
    assert logical.color_mode is ColorMode.RGB
    assert logical.rgb_color == (10, 20, 30)
    assert logical.brightness is None


@pytest.mark.parametrize("state", ["unavailable", "unknown"])
async def test_command_fails_visibly_when_backing_light_is_not_available(
    hass: HomeAssistant,
    state: str,
) -> None:
    registry = BindHomeRegistry()
    hass.states.async_set(
        "light.offline",
        state,
        {
            "supported_color_modes": [ColorMode.BRIGHTNESS],
            "color_mode": ColorMode.BRIGHTNESS,
        },
    )
    logical = _setup(registry, hass, "light.offline")
    calls: list[ServiceCall] = []

    async def capture(call: ServiceCall) -> None:
        calls.append(call)

    hass.services.async_register("light", "turn_on", capture)

    with pytest.raises(HomeAssistantError, match="runtime_(unavailable|unknown)"):
        await logical.async_turn_on(brightness=200)

    assert calls == []
