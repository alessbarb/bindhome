"""Tests for the BindHome binding resolver and compatibility layer."""

import pytest

from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import (
    AssetNotFoundError,
    BindingNotFoundError,
    BindingResolver,
    CapabilityCompatibility,
    CapabilityNotDeclaredError,
    Compatibility,
    InvalidResolveRequestError,
    ResolutionStatus,
    StaleBindingError,
    StaticEntityProbe,
)


def _asset(registry: BindHomeRegistry, caps: list[str]) -> Asset:
    return registry.add_asset(
        Asset.create(
            name="Living room ceiling light",
            asset_type="light_point",
            capabilities=caps,
        )
    )


def _bind(
    registry: BindHomeRegistry,
    asset: Asset,
    cap: str,
    entity: str,
    role: str = "primary",
) -> Binding:
    return registry.set_binding(
        Binding.create(asset_id=asset.id, capability=cap, entity_id=entity, role=role)
    )


# --- resolution outcomes ---------------------------------------------------


def test_valid_resolution_from_state_machine() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(registry, asset, "on_off", "switch.relay")
    probe = StaticEntityProbe(states={"switch.relay": "on"})
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.RESOLVED
    assert result.entity_id == "switch.relay"
    assert result.state == "on"
    assert result.config_valid is True
    assert result.runtime_available is True
    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.relay"


def test_registry_only_target_is_valid_config_but_not_runtime_available() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(registry, asset, "on_off", "switch.relay")
    probe = StaticEntityProbe(registered={"switch.relay"})  # no state yet
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.RUNTIME_UNAVAILABLE
    assert result.config_valid is True
    assert result.runtime_available is False
    # strict API still yields the entity id: not a configuration failure
    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.relay"


def test_missing_asset() -> None:
    resolver = BindingResolver(BindHomeRegistry(), StaticEntityProbe())
    result = resolver.resolve("does-not-exist", "on_off")
    assert result.status is ResolutionStatus.ASSET_NOT_FOUND
    assert result.config_valid is False
    with pytest.raises(AssetNotFoundError):
        resolver.resolve_entity_id("does-not-exist", "on_off")


def test_missing_capability_is_distinct_from_missing_binding() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    resolver = BindingResolver(registry, StaticEntityProbe())

    not_declared = resolver.resolve(asset.id, "dimming")
    no_binding = resolver.resolve(asset.id, "on_off")

    assert not_declared.status is ResolutionStatus.CAPABILITY_NOT_DECLARED
    assert no_binding.status is ResolutionStatus.BINDING_NOT_FOUND
    assert not_declared.status is not no_binding.status
    with pytest.raises(CapabilityNotDeclaredError):
        resolver.resolve_entity_id(asset.id, "dimming")
    with pytest.raises(BindingNotFoundError):
        resolver.resolve_entity_id(asset.id, "on_off")


def test_stale_entity_reference() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(registry, asset, "on_off", "switch.removed")
    resolver = BindingResolver(registry, StaticEntityProbe())  # entity unknown

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.ENTITY_NOT_FOUND
    assert result.entity_id == "switch.removed"
    assert result.config_valid is False
    with pytest.raises(StaleBindingError):
        resolver.resolve_entity_id(asset.id, "on_off")


@pytest.mark.parametrize(
    ("state", "status"),
    [
        ("unavailable", ResolutionStatus.RUNTIME_UNAVAILABLE),
        ("unknown", ResolutionStatus.RUNTIME_UNKNOWN),
    ],
)
def test_runtime_state_does_not_invalidate_configuration(state, status) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(registry, asset, "on_off", "switch.relay")
    probe = StaticEntityProbe(
        registered={"switch.relay"}, states={"switch.relay": state}
    )
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is status
    assert result.config_valid is True
    assert result.runtime_available is False
    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.relay"


def test_capability_and_role_inputs_are_normalized() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(registry, asset, "on_off", "switch.relay")
    probe = StaticEntityProbe(states={"switch.relay": "on"})
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "  On_Off  ", "PRIMARY")

    assert result.status is ResolutionStatus.RESOLVED


def test_malformed_request_is_reported_not_masked_as_missing_capability() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    resolver = BindingResolver(registry, StaticEntityProbe())

    result = resolver.resolve(asset.id, "on off")

    assert result.status is ResolutionStatus.INVALID_REQUEST
    with pytest.raises(InvalidResolveRequestError):
        resolver.resolve_entity_id(asset.id, "on off")


# --- replacement / identity semantics ------------------------------------


def test_binding_replacement_preserves_identity_and_resolves_new_entity() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    first = _bind(registry, asset, "on_off", "switch.shelly_old")
    probe = StaticEntityProbe(
        states={"switch.shelly_old": "on", "switch.sonoff_new": "off"}
    )
    resolver = BindingResolver(registry, probe)

    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.shelly_old"

    second = _bind(registry, asset, "on_off", "switch.sonoff_new")

    assert second.id == first.id
    assert second.asset_id == asset.id
    assert len(registry.bindings) == 1
    resolved = resolver.resolve(asset.id, "on_off")
    assert resolved.entity_id == "switch.sonoff_new"
    assert resolved.binding.id == first.id


def test_binding_identity_survives_serialization_round_trip() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    original = _bind(registry, asset, "on_off", "switch.relay")

    restored = BindHomeRegistry.from_dict(registry.to_dict())

    binding = restored.get_binding(asset.id, "on_off")
    assert binding is not None
    assert binding.id == original.id
    assert binding.entity_id == "switch.relay"


def test_role_specific_bindings_are_independent() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    primary = _bind(registry, asset, "on_off", "switch.main", role="primary")
    secondary = _bind(registry, asset, "on_off", "switch.aux", role="secondary")
    probe = StaticEntityProbe(states={"switch.main": "on", "switch.aux": "off"})
    resolver = BindingResolver(registry, probe)

    assert primary.id != secondary.id
    assert resolver.resolve_entity_id(asset.id, "on_off", "primary") == "switch.main"
    assert resolver.resolve_entity_id(asset.id, "on_off", "secondary") == "switch.aux"
    assert (
        resolver.resolve(asset.id, "on_off", "tertiary").status
        is ResolutionStatus.BINDING_NOT_FOUND
    )


def test_multiple_capabilities_resolve_to_different_entities() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off", "power_measurement"])
    _bind(registry, asset, "on_off", "switch.relay")
    _bind(registry, asset, "power_measurement", "sensor.relay_power")
    probe = StaticEntityProbe(
        states={"switch.relay": "on", "sensor.relay_power": "42.0"}
    )
    resolver = BindingResolver(registry, probe)

    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.relay"
    assert (
        resolver.resolve_entity_id(asset.id, "power_measurement")
        == "sensor.relay_power"
    )


# --- compatibility -------------------------------------------------------


def test_compatibility_success() -> None:
    compat = CapabilityCompatibility()
    result = compat.check("on_off", "switch.relay")
    assert result.verdict is Compatibility.COMPATIBLE
    assert bool(result) is True


def test_compatibility_rejection() -> None:
    compat = CapabilityCompatibility()
    result = compat.check("dimming", "switch.relay")
    assert result.verdict is Compatibility.INCOMPATIBLE
    assert bool(result) is False


def test_compatibility_unknown_for_unmapped_capability() -> None:
    compat = CapabilityCompatibility()
    result = compat.check("irrigation_flow", "valve.garden")
    assert result.verdict is Compatibility.UNKNOWN
    assert bool(result) is True  # advisory: never rejects extensible capabilities


def test_compatibility_unknown_for_entity_without_domain() -> None:
    compat = CapabilityCompatibility()
    assert compat.check("on_off", "garbage").verdict is Compatibility.UNKNOWN


def test_compatibility_is_extensible() -> None:
    compat = CapabilityCompatibility()
    compat.register("irrigation_flow", {"valve"})
    ok = compat.check("irrigation_flow", "valve.garden")
    bad = compat.check("irrigation_flow", "sensor.x")
    assert ok.verdict is Compatibility.COMPATIBLE
    assert bad.verdict is Compatibility.INCOMPATIBLE
