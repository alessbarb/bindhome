"""Built-in creation presets for high-volume BindHome inventory."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from .models import normalize_identifier, normalize_non_empty


@dataclass(frozen=True, slots=True)
class CreationPreset:
    """UX metadata that suggests an editable Asset draft."""

    preset_id: str
    group: str
    asset_type: str
    default_name: str
    suggested_capabilities: tuple[str, ...] = ()

    @classmethod
    def create(
        cls,
        *,
        preset_id: str,
        group: str,
        asset_type: str,
        default_name: str,
        suggested_capabilities: tuple[str, ...] = (),
    ) -> CreationPreset:
        """Create normalized preset metadata."""
        return cls(
            preset_id=normalize_identifier(preset_id, "preset_id"),
            group=normalize_identifier(group, "group"),
            asset_type=normalize_identifier(asset_type, "asset_type"),
            default_name=normalize_non_empty(default_name, "default_name"),
            suggested_capabilities=tuple(
                sorted(
                    {
                        normalize_identifier(capability, "capability")
                        for capability in suggested_capabilities
                    }
                )
            ),
        )

    def to_dict(self) -> dict[str, object]:
        """Serialize preset metadata for user-facing clients."""
        return {
            "preset_id": self.preset_id,
            "group": self.group,
            "asset_type": self.asset_type,
            "default_name": self.default_name,
            "suggested_capabilities": list(self.suggested_capabilities),
        }


def _preset(
    asset_type: str,
    group: str,
    default_name: str,
    *capabilities: str,
) -> CreationPreset:
    """Build one built-in preset using its Asset type as stable preset ID."""
    return CreationPreset.create(
        preset_id=asset_type,
        group=group,
        asset_type=asset_type,
        default_name=default_name,
        suggested_capabilities=capabilities,
    )


# Order is intentional: it defines the default inventory questionnaire order.
#
# Presets are suggestions only. They do not restrict custom asset_type values,
# custom capabilities, bindings or logical Representations.
CREATION_PRESETS: Final[tuple[CreationPreset, ...]] = (
    # Electrical
    _preset("light_point", "electrical", "Light point", "on_off"),
    _preset("socket", "electrical", "Socket"),
    _preset("switch", "electrical", "Switch", "on_off"),
    _preset("electrical_panel", "electrical", "Electrical panel"),
    _preset("circuit", "electrical", "Circuit"),
    _preset("junction_box", "electrical", "Junction box"),
    # Network and communications
    _preset("ethernet_outlet", "network", "Ethernet outlet"),
    _preset("telephone_outlet", "network", "Telephone outlet"),
    _preset("antenna_outlet", "network", "Antenna outlet"),
    _preset("wifi_access_point", "network", "Wi-Fi access point"),
    # Climate
    _preset("radiator", "climate", "Radiator"),
    _preset(
        "thermostat",
        "climate",
        "Thermostat",
        "temperature",
        "setpoint",
    ),
    _preset("fan", "climate", "Fan", "on_off"),
    _preset(
        "air_conditioning_unit",
        "climate",
        "Air-conditioning unit",
        "on_off",
        "setpoint",
    ),
    # Water
    _preset("tap", "water", "Tap", "open_close"),
    _preset("shutoff_valve", "water", "Shut-off valve", "open_close"),
    _preset("valve", "water", "Valve", "open_close"),
    _preset("drain", "water", "Drain"),
    _preset("manifold", "water", "Manifold"),
    # Building
    _preset("door", "building", "Door", "open_close"),
    _preset("window", "building", "Window", "open_close"),
    _preset("blind", "building", "Blind", "open_close", "position"),
    _preset("skylight", "building", "Skylight", "open_close"),
    # Equipment
    _preset("boiler", "equipment", "Boiler", "on_off"),
    _preset("water_heater", "equipment", "Water heater", "on_off"),
    _preset("pump", "equipment", "Pump", "on_off"),
    _preset("freezer", "equipment", "Freezer", "on_off"),
    _preset("appliance", "equipment", "Appliance", "on_off"),
    _preset("machine", "equipment", "Machine", "on_off"),
)


def list_creation_presets() -> tuple[CreationPreset, ...]:
    """Return the built-in catalogue in deterministic questionnaire order."""
    return CREATION_PRESETS
