"""Tests for the BindHome binding resolver and compatibility layer."""

import pytest
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import (
    AssetNotFoundError,
    BindingNotFoundError,
    BindingResolver,
    CapabilityNotDeclaredError,
    EntityProbe,
    HomeAssistantEntityProbe,
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
    *,
    entity_registry_id: str | None = None,
) -> Binding:
    return registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability=cap,
            entity_id=entity,
            entity_registry_id=entity_registry_id,
            role=role,
        )
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


def test_both_probe_implementations_satisfy_the_entity_probe_protocol() -> None:
    static_probe: EntityProbe = StaticEntityProbe(states={"switch.relay": "on"})
    ha_probe: EntityProbe = HomeAssistantEntityProbe.__new__(HomeAssistantEntityProbe)
    assert static_probe.resolve_registry_entity_id("missing") is None
    assert static_probe.is_known("switch.relay") is True
    assert static_probe.get_state("switch.relay") == "on"
    assert callable(ha_probe.resolve_registry_entity_id)
    assert callable(ha_probe.is_known)
    assert callable(ha_probe.get_state)


def test_registry_and_state_machine_can_disagree_on_which_entity_exists() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(registry, asset, "on_off", "switch.registered_only")
    # Entity is in the Entity Registry but a different entity holds a state:
    # the restart window where hardware has not reported yet.
    probe = StaticEntityProbe(
        registered={"switch.registered_only"},
        states={"switch.unrelated": "on"},
    )
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.RUNTIME_UNAVAILABLE
    assert result.config_valid is True


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


# --- stable Entity Registry target identity -------------------------------


def test_stable_registry_target_resolves_current_entity_id_after_rename() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    binding = _bind(
        registry,
        asset,
        "on_off",
        "switch.before_rename",
        entity_registry_id="entry-123",
    )
    probe = StaticEntityProbe(
        registry_entries={"entry-123": "switch.after_rename"},
        states={"switch.after_rename": "on"},
    )
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.RESOLVED
    assert result.entity_id == "switch.after_rename"
    assert result.state == "on"
    assert result.binding is binding
    assert result.binding.entity_registry_id == "entry-123"
    # Persisted entity_id is deliberately only the last-known value.
    assert result.binding.entity_id == "switch.before_rename"
    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.after_rename"


def test_missing_stable_registry_entry_never_falls_back_to_reused_entity_id() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(
        registry,
        asset,
        "on_off",
        "switch.reused_name",
        entity_registry_id="removed-entry",
    )
    probe = StaticEntityProbe(
        # Another Registry entry now owns the old mutable entity_id.
        registry_entries={"different-entry": "switch.reused_name"},
        states={"switch.reused_name": "on"},
    )
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.ENTITY_NOT_FOUND
    assert result.entity_id is None
    assert result.binding is not None
    assert result.binding.entity_id == "switch.reused_name"
    assert result.config_valid is False
    with pytest.raises(StaleBindingError, match="removed-entry"):
        resolver.resolve_entity_id(asset.id, "on_off")


def test_stable_registry_target_is_valid_even_without_runtime_state() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(
        registry,
        asset,
        "on_off",
        "switch.old_name",
        entity_registry_id="entry-offline",
    )
    resolver = BindingResolver(
        registry,
        StaticEntityProbe(registry_entries={"entry-offline": "switch.current_name"}),
    )

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.RUNTIME_UNAVAILABLE
    assert result.entity_id == "switch.current_name"
    assert result.config_valid is True
    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.current_name"


async def test_home_assistant_probe_resolves_registry_uuid_after_entity_rename(
    hass,
) -> None:
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "stable-target",
        suggested_object_id="before_rename",
    )
    registry_entry_id = entry.id
    old_entity_id = entry.entity_id
    renamed = entity_registry.async_update_entity(
        old_entity_id,
        new_entity_id="switch.after_rename",
    )

    probe = HomeAssistantEntityProbe(hass)

    assert renamed.id == registry_entry_id
    assert probe.resolve_registry_entity_id(registry_entry_id) == "switch.after_rename"
    assert probe.resolve_registry_entity_id("missing-entry") is None


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
