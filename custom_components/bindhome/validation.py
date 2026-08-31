"""Home Assistant reference validation for BindHome."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er


def validate_area(hass: HomeAssistant, area_id: str | None) -> None:
    """Validate an optional Home Assistant area reference."""
    if area_id is not None and ar.async_get(hass).async_get_area(area_id) is None:
        raise ServiceValidationError(f"Home Assistant area {area_id} was not found")


def validate_entity(hass: HomeAssistant, entity_id: str) -> None:
    """Validate that a binding target exists in Home Assistant."""
    if (
        er.async_get(hass).async_get(entity_id) is None
        and hass.states.get(entity_id) is None
    ):
        raise ServiceValidationError(f"Home Assistant entity {entity_id} was not found")
