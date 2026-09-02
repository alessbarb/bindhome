"""Tests for the BindHome logical light platform."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.components.light import ColorMode
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.setup import async_setup_component

from custom_components.bindhome.light import BindHomeLight
from custom_components.bindhome.models import Asset, Binding, Representation
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import (
    BindingResolver,
    HomeAssistantEntityProbe,
)


def _asset(registry: BindHomeRegistry, capabilities: list[str]) -> Asset:
    asset = Asset.create(
        name="Ceiling light",
        asset_type="light_point",
        capabilities=capabilities,
    )
    registry.add_asset(asset)
    return asset


def _binding(registry: BindHomeRegistry, asset: Asset, entity_id: str) -> None:
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entity_id,
        )
    )


def _logical_light(
    hass: HomeAssistant, registry: BindHomeRegistry, asset: Asset
) -> BindHomeLight:
    return BindHomeLight(
        hass,
        asset,
        BindingResolver(registry, HomeAssistantEntityProbe(hass)),
    )


async def _setup_homeassistant_turn_services(hass: HomeAssistant) -> None:
    """Set up HA's own generic turn_on/turn_off routing."""
    assert await async_setup_component(hass, "homeassistant", {})


async def test_logical_light_forwards_to_replaced_binding_and_keeps_identity(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _binding(registry, asset, "switch.hardware_a")
    hass.states.async_set("switch.hardware_a", "off")

    calls: list[ServiceCall] = []

    async def capture(call: ServiceCall) -> None:
        calls.append(call)

    hass.services.async_register("switch", "turn_on", capture)
    hass.services.async_register("switch", "turn_off", capture)
    await _setup_homeassistant_turn_services(hass)

    logical = _logical_light(hass, registry, asset)
    unique_id = logical.unique_id

    await logical.async_turn_on()

    assert calls[-1].domain == "switch"
    assert calls[-1].service == "turn_on"
    assert calls[-1].data == {"entity_id": ["switch.hardware_a"]}

    _binding(registry, asset, "switch.hardware_b")
    hass.states.async_set("switch.hardware_b", "off")

    await logical.async_turn_off()

    assert calls[-1].domain == "switch"
    assert calls[-1].service == "turn_off"
    assert calls[-1].data == {"entity_id": ["switch.hardware_b"]}

    assert logical.unique_id == unique_id
    assert asset.id == logical.asset_id


@pytest.mark.parametrize("state, expected", [("on", True), ("off", False)])
async def test_logical_light_reflects_resolved_state(
    hass: HomeAssistant, state: str, expected: bool
) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _binding(registry, asset, "light.hardware")
    hass.states.async_set("light.hardware", state)
    logical = _logical_light(hass, registry, asset)

    await logical.async_update()

    assert logical.available is True
    assert logical.is_on is expected


@pytest.mark.parametrize("state", [None, "unavailable", "unknown"])
async def test_logical_light_is_safely_unavailable_for_degraded_binding(
    hass: HomeAssistant, state: str | None
) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _binding(registry, asset, "switch.hardware")
    if state is not None:
        hass.states.async_set("switch.hardware", state)
    logical = _logical_light(hass, registry, asset)

    await logical.async_update()

    assert logical.available is False
    assert logical.is_on is None


async def test_logical_light_does_not_forward_missing_binding(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])

    calls = AsyncMock()
    hass.services.async_register("switch", "turn_on", calls)

    logical = _logical_light(hass, registry, asset)

    await logical.async_turn_on()

    assert calls.await_count == 0


async def test_logical_light_delegates_fan_binding_to_home_assistant(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _binding(registry, asset, "fan.ceiling")
    hass.states.async_set("fan.ceiling", "off")

    calls: list[ServiceCall] = []

    async def capture(call: ServiceCall) -> None:
        calls.append(call)

    hass.services.async_register("fan", "turn_on", capture)
    await _setup_homeassistant_turn_services(hass)

    logical = _logical_light(hass, registry, asset)

    await logical.async_turn_on()

    assert len(calls) == 1
    assert calls[0].domain == "fan"
    assert calls[0].service == "turn_on"
    assert calls[0].data == {"entity_id": ["fan.ceiling"]}


async def test_logical_light_leaves_unsupported_target_to_home_assistant(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _binding(registry, asset, "sensor.temperature")
    hass.states.async_set("sensor.temperature", "21.5")
    await _setup_homeassistant_turn_services(hass)

    logical = _logical_light(hass, registry, asset)

    # BindHome deliberately does not maintain a parallel compatibility
    # catalogue. HA owns service support and handles unsupported targets.
    await logical.async_turn_on()


async def test_light_eligibility_requires_explicit_representation_and_on_off() -> None:
    registry = BindHomeRegistry()

    eligible_asset = _asset(registry, ["on_off"])
    eligible_representation = Representation.create(
        asset_id=eligible_asset.id,
        platform="light",
    )

    assert (
        BindHomeLight.is_eligible(
            eligible_asset,
            eligible_representation,
        )
        is True
    )

    passive_asset = Asset.create(
        name="Passive point",
        asset_type="light_point",
        capabilities=["dimming"],
    )
    passive_representation = Representation.create(
        asset_id=passive_asset.id,
        platform="light",
    )

    assert (
        BindHomeLight.is_eligible(
            passive_asset,
            passive_representation,
        )
        is False
    )


async def test_logical_light_exposes_valid_on_off_light_attributes(
    hass: HomeAssistant,
) -> None:
    """Expose the Home Assistant light color-mode contract."""
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _binding(registry, asset, "switch.hardware")
    hass.states.async_set("switch.hardware", "on")

    logical = _logical_light(hass, registry, asset)
    await logical.async_update()

    assert logical.supported_color_modes == {ColorMode.ONOFF}
    assert logical.color_mode is ColorMode.ONOFF
    assert logical.state_attributes["color_mode"] == ColorMode.ONOFF
