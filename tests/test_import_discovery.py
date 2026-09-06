"""Tests for assisted-import discovery from Home Assistant metadata."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome.import_discovery import discover_import_proposals
from custom_components.bindhome.import_proposals import ImportDuplicateStatus
from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry


def _device(hass: HomeAssistant, *, name: str, area_id: str | None = None):
    config_entry = MockConfigEntry(domain="demo", data={})
    config_entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=config_entry.entry_id,
        identifiers={("demo", name.casefold().replace(" ", "-"))},
        name=name,
    )
    if area_id is not None:
        dr.async_get(hass).async_update_device(device.id, area_id=area_id)
        device = dr.async_get(hass).async_get(device.id)
        assert device is not None
    return device


def _entity(
    hass: HomeAssistant,
    domain: str,
    unique_id: str,
    *,
    device_id: str | None = None,
    area_id: str | None = None,
    device_class: str | None = None,
):
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        domain,
        "demo",
        unique_id,
        suggested_object_id=unique_id.replace("-", "_"),
        device_id=device_id,
        original_device_class=device_class,
    )
    if area_id is not None:
        registry.async_update_entity(entry.entity_id, area_id=area_id)
        entry = registry.async_get(entry.entity_id)
        assert entry is not None
    return entry


def test_single_device_entity_becomes_stable_proposal(hass: HomeAssistant) -> None:
    area = ar.async_get(hass).async_create("Living room")
    device = _device(hass, name="Ceiling relay", area_id=area.id)
    entity = _entity(hass, "light", "ceiling-light", device_id=device.id)

    proposals = discover_import_proposals(hass, BindHomeRegistry(), area_id=area.id)

    assert len(proposals) == 1
    proposal = proposals[0]
    assert proposal.asset.name == "Ceiling relay"
    assert proposal.asset.asset_type == "light_point"
    assert proposal.asset.area_id == area.id
    assert proposal.asset.capabilities == ("on_off",)
    assert proposal.source.device_id == device.id
    assert proposal.source.entity_registry_ids == (entity.id,)
    assert proposal.bindings[0].entity_registry_id == entity.id
    assert proposal.bindings[0].entity_id == entity.entity_id


def test_multi_channel_device_splits_conflicting_bindings_for_review(
    hass: HomeAssistant,
) -> None:
    device = _device(hass, name="Two-channel relay")
    first = _entity(hass, "switch", "relay-one", device_id=device.id)
    second = _entity(hass, "switch", "relay-two", device_id=device.id)

    proposals = discover_import_proposals(hass, BindHomeRegistry())

    assert len(proposals) == 2
    assert {proposal.source.device_id for proposal in proposals} == {device.id}
    assert {proposal.bindings[0].entity_registry_id for proposal in proposals} == {
        first.id,
        second.id,
    }
    assert all(proposal.asset.capabilities == ("on_off",) for proposal in proposals)


def test_non_conflicting_device_entities_can_share_one_proposal(
    hass: HomeAssistant,
) -> None:
    device = _device(hass, name="Thermostat module")
    climate = _entity(hass, "climate", "thermostat", device_id=device.id)
    sensor = _entity(
        hass,
        "sensor",
        "room-temperature",
        device_id=device.id,
        device_class="temperature",
    )

    proposals = discover_import_proposals(hass, BindHomeRegistry())

    assert len(proposals) == 1
    proposal = proposals[0]
    assert proposal.asset.asset_type == "device"
    assert proposal.asset.capabilities == ("setpoint", "temperature")
    assert proposal.source.entity_registry_ids == tuple(sorted((climate.id, sensor.id)))
    assert {binding.capability for binding in proposal.bindings} == {
        "setpoint",
        "temperature",
    }


def test_entity_without_device_is_discovered_from_area(hass: HomeAssistant) -> None:
    area = ar.async_get(hass).async_create("Kitchen")
    entity = _entity(
        hass,
        "sensor",
        "kitchen-temperature",
        area_id=area.id,
        device_class="temperature",
    )

    proposals = discover_import_proposals(hass, BindHomeRegistry(), area_id=area.id)

    assert len(proposals) == 1
    proposal = proposals[0]
    assert proposal.source.device_id is None
    assert proposal.source.entity_registry_ids == (entity.id,)
    assert proposal.asset.area_id == area.id
    assert proposal.asset.capabilities == ("temperature",)


def test_area_scope_does_not_return_other_area(hass: HomeAssistant) -> None:
    kitchen = ar.async_get(hass).async_create("Kitchen")
    garage = ar.async_get(hass).async_create("Garage")
    kitchen_device = _device(hass, name="Kitchen relay", area_id=kitchen.id)
    garage_device = _device(hass, name="Garage relay", area_id=garage.id)
    _entity(hass, "switch", "kitchen-relay", device_id=kitchen_device.id)
    _entity(hass, "switch", "garage-relay", device_id=garage_device.id)

    proposals = discover_import_proposals(hass, BindHomeRegistry(), area_id=kitchen.id)

    assert len(proposals) == 1
    assert proposals[0].asset.name == "Kitchen relay"


def test_existing_stable_binding_is_classified_already_bound(
    hass: HomeAssistant,
) -> None:
    entity = _entity(hass, "switch", "bound-relay")
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Existing point",
            asset_type="switch",
            capabilities=["on_off"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entity.entity_id,
            entity_registry_id=entity.id,
        )
    )

    proposal = discover_import_proposals(hass, registry)[0]

    assert proposal.duplicate_status is ImportDuplicateStatus.ALREADY_BOUND
    assert proposal.merge_candidate_asset_ids == (asset.id,)


def test_entity_rename_keeps_proposal_identity_and_updates_current_entity_id(
    hass: HomeAssistant,
) -> None:
    entity_registry = er.async_get(hass)
    entity = _entity(hass, "switch", "rename-safe")
    before = discover_import_proposals(hass, BindHomeRegistry())[0]

    entity_registry.async_update_entity(
        entity.entity_id,
        new_entity_id="switch.renamed_hardware",
    )
    after = discover_import_proposals(hass, BindHomeRegistry())[0]

    assert after.proposal_id == before.proposal_id
    assert after.bindings[0].entity_registry_id == entity.id
    assert after.bindings[0].entity_id == "switch.renamed_hardware"


def test_whole_installation_includes_supported_state_only_entity(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("switch.state_only_relay", "off")

    proposals = discover_import_proposals(hass, BindHomeRegistry())

    proposal = next(
        item
        for item in proposals
        if item.bindings[0].entity_id == "switch.state_only_relay"
    )
    assert proposal.source.entity_registry_ids == ()
    assert proposal.bindings[0].entity_registry_id is None


def test_discovery_does_not_mutate_home_assistant_or_registry(
    hass: HomeAssistant,
) -> None:
    device = _device(hass, name="Read only device")
    _entity(hass, "switch", "read-only-relay", device_id=device.id)
    entity_registry = er.async_get(hass)
    device_registry = dr.async_get(hass)
    registry = BindHomeRegistry()
    registry_before = registry.to_dict()
    entity_ids_before = tuple(sorted(entity_registry.entities))
    device_before = device_registry.async_get(device.id)
    assert device_before is not None

    discover_import_proposals(hass, registry)

    assert registry.to_dict() == registry_before
    assert tuple(sorted(entity_registry.entities)) == entity_ids_before
    assert device_registry.async_get(device.id) == device_before
