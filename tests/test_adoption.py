"""Tests for reversible visibility adoption of bound hardware."""

from __future__ import annotations

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome import adoption as adoption_module
from custom_components.bindhome.adoption import AdoptionError, AdoptionManager
from custom_components.bindhome.manager import BindHomeManager


def _fake_expose_entity(
    hass: HomeAssistant,
    assistant: str,
    entity_id: str,
    should_expose: bool,
) -> None:
    registry = er.async_get(hass)
    entry = registry.async_get(entity_id)
    assert entry is not None
    options = dict(entry.options.get(assistant, {}))
    options["should_expose"] = should_expose
    registry.async_update_entity_options(entity_id, assistant, options)


async def _manager_with_bound_asset(
    hass: HomeAssistant,
    *,
    entity_id: str,
    name: str = "Relay",
) -> tuple[BindHomeManager, str, str]:
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name=name,
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entity_id,
        role="primary",
    )
    return manager, asset.id, binding.id


async def test_adopt_and_revert_restore_only_bindhome_owned_values(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(adoption_module, "async_expose_entity", _fake_expose_entity)
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "switch",
        "demo",
        "relay",
        suggested_object_id="relay",
    )
    registry.async_update_entity_options(
        entry.entity_id,
        "conversation",
        {"should_expose": True, "aliases": ["relay"]},
    )
    registry.async_update_entity_options(
        entry.entity_id,
        "cloud.alexa",
        {"display_categories": ["SWITCH"]},
    )
    registry.async_update_entity_options(
        entry.entity_id,
        "cloud.google_assistant",
        {"should_expose": False},
    )
    hass.states.async_set(entry.entity_id, "off")
    manager, asset_id, _ = await _manager_with_bound_asset(
        hass,
        entity_id=entry.entity_id,
    )

    adoption = AdoptionManager(hass)
    await adoption.async_load()
    result = await adoption.async_adopt_asset(manager.registry, asset_id)

    assert result["records"][0]["status"] == "adopted"
    adopted = registry.async_get(entry.entity_id)
    assert adopted is not None
    assert adopted.hidden_by is er.RegistryEntryHider.INTEGRATION
    assert adopted.options["conversation"]["should_expose"] is False
    assert adopted.options["cloud.alexa"]["should_expose"] is False
    assert adopted.options["cloud.google_assistant"]["should_expose"] is False

    # Later user-owned changes must win over BindHome's recorded prior values.
    registry.async_update_entity(
        entry.entity_id,
        hidden_by=er.RegistryEntryHider.USER,
    )
    conversation = dict(registry.async_get(entry.entity_id).options["conversation"])
    conversation["should_expose"] = True
    registry.async_update_entity_options(
        entry.entity_id,
        "conversation",
        conversation,
    )

    await adoption.async_revert_asset(manager.registry, asset_id)

    restored = registry.async_get(entry.entity_id)
    assert restored is not None
    assert restored.hidden_by is er.RegistryEntryHider.USER
    assert restored.options["conversation"]["should_expose"] is True
    assert restored.options["conversation"]["aliases"] == ["relay"]
    assert "should_expose" not in restored.options["cloud.alexa"]
    assert restored.options["cloud.alexa"]["display_categories"] == ["SWITCH"]
    assert restored.options["cloud.google_assistant"]["should_expose"] is False


async def test_shared_hardware_restores_after_last_asset_releases_ownership(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(adoption_module, "async_expose_entity", _fake_expose_entity)
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "switch",
        "demo",
        "shared",
        suggested_object_id="shared",
    )
    hass.states.async_set(entry.entity_id, "off")
    manager, first_asset_id, _ = await _manager_with_bound_asset(
        hass,
        entity_id=entry.entity_id,
        name="First",
    )
    second = await manager.async_create_asset(
        name="Second",
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )
    await manager.async_set_binding(
        asset_id=second.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="primary",
    )

    adoption = AdoptionManager(hass)
    await adoption.async_load()
    await adoption.async_adopt_asset(manager.registry, first_asset_id)
    await adoption.async_adopt_asset(manager.registry, second.id)

    await adoption.async_revert_asset(manager.registry, first_asset_id)
    still_adopted = registry.async_get(entry.entity_id)
    assert still_adopted is not None
    assert still_adopted.hidden_by is er.RegistryEntryHider.INTEGRATION

    await adoption.async_revert_asset(manager.registry, second.id)
    restored = registry.async_get(entry.entity_id)
    assert restored is not None
    assert restored.hidden_by is None


async def test_reconcile_releases_hardware_no_longer_bound_to_asset(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(adoption_module, "async_expose_entity", _fake_expose_entity)
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "switch",
        "demo",
        "replaceable",
        suggested_object_id="replaceable",
    )
    hass.states.async_set(entry.entity_id, "off")
    manager, asset_id, binding_id = await _manager_with_bound_asset(
        hass,
        entity_id=entry.entity_id,
    )
    adoption = AdoptionManager(hass)
    await adoption.async_load()
    await adoption.async_adopt_asset(manager.registry, asset_id)

    await manager.async_remove_binding(binding_id)
    await adoption.async_reconcile(manager.registry)

    restored = registry.async_get(entry.entity_id)
    assert restored is not None
    assert restored.hidden_by is None
    assert adoption.status(manager.registry)["summary"]["adopted_hardware"] == 0


async def test_state_only_binding_cannot_be_adopted_reversibly(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("switch.state_only", "off")
    manager, asset_id, _ = await _manager_with_bound_asset(
        hass,
        entity_id="switch.state_only",
    )
    adoption = AdoptionManager(hass)
    await adoption.async_load()

    with pytest.raises(AdoptionError, match="stable Entity Registry identity"):
        await adoption.async_adopt_asset(manager.registry, asset_id)


async def test_preexisting_user_hidden_state_is_never_claimed(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(adoption_module, "async_expose_entity", _fake_expose_entity)
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "switch",
        "demo",
        "already_hidden",
        suggested_object_id="already_hidden",
        hidden_by=er.RegistryEntryHider.USER,
    )
    hass.states.async_set(entry.entity_id, "off")
    manager, asset_id, _ = await _manager_with_bound_asset(
        hass,
        entity_id=entry.entity_id,
    )
    adoption = AdoptionManager(hass)
    await adoption.async_load()

    await adoption.async_adopt_asset(manager.registry, asset_id)
    adopted = registry.async_get(entry.entity_id)
    assert adopted is not None
    assert adopted.hidden_by is er.RegistryEntryHider.USER

    await adoption.async_revert_asset(manager.registry, asset_id)
    restored = registry.async_get(entry.entity_id)
    assert restored is not None
    assert restored.hidden_by is er.RegistryEntryHider.USER
