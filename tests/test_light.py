"""Tests for the BindHome logical light platform."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.bindhome.light import BindHomeLight
from custom_components.bindhome.models import Asset, Binding
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
    logical = _logical_light(hass, registry, asset)
    unique_id = logical.unique_id

    await logical.async_turn_on()
    assert calls[-1].domain == "switch"
    assert calls[-1].data == {"entity_id": "switch.hardware_a"}

    _binding(registry, asset, "switch.hardware_b")
    hass.states.async_set("switch.hardware_b", "off")
    await logical.async_turn_off()

    assert calls[-1].domain == "switch"
    assert calls[-1].service == "turn_off"
    assert calls[-1].data == {"entity_id": "switch.hardware_b"}
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


async def test_logical_light_does_not_forward_missing_or_unsupported_binding(
    hass: HomeAssistant,
) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    calls = AsyncMock()
    hass.services.async_register("switch", "turn_on", calls)
    logical = _logical_light(hass, registry, asset)

    await logical.async_turn_on()
    assert calls.await_count == 0

    _binding(registry, asset, "fan.unsupported")
    hass.states.async_set("fan.unsupported", "off")
    await logical.async_turn_on()
    assert calls.await_count == 0


async def test_assets_without_on_off_are_not_eligible() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["dimming"])

    assert BindHomeLight.is_eligible(asset) is False
