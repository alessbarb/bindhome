"""Tests for persisted Binding target identity migration and capture."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.store import BindHomeStore, BindHomeStoreLoadError


def _v1_registry(entity_id: str) -> dict[str, object]:
    return {
        "schema_version": 1,
        "assets": [
            {
                "id": "asset-1",
                "name": "Relay",
                "asset_type": "relay",
                "code": None,
                "area_id": None,
                "capabilities": ["on_off"],
            }
        ],
        "relations": [],
        "bindings": [
            {
                "id": "binding-1",
                "asset_id": "asset-1",
                "capability": "on_off",
                "entity_id": entity_id,
                "role": "primary",
            }
        ],
        "representations": [],
    }


async def test_new_registered_binding_captures_entity_registry_identity(
    hass: HomeAssistant,
) -> None:
    entry = er.async_get(hass).async_get_or_create(
        "switch",
        "demo",
        "relay",
        suggested_object_id="relay",
    )
    hass.states.async_set(entry.entity_id, "off")

    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="Relay",
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )

    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id=entry.entity_id,
        role="primary",
    )

    assert binding.entity_id == entry.entity_id
    assert binding.entity_registry_id == entry.id


async def test_state_machine_only_binding_keeps_entity_id_fallback(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("switch.state_only", "off")
    manager = BindHomeManager(hass)
    await manager.async_load()
    asset = await manager.async_create_asset(
        name="State only",
        asset_type="relay",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )

    binding = await manager.async_set_binding(
        asset_id=asset.id,
        capability="on_off",
        entity_id="switch.state_only",
        role="primary",
    )

    assert binding.entity_registry_id is None
    assert binding.entity_id == "switch.state_only"


async def test_v1_store_migration_enriches_exact_registered_target(
    hass: HomeAssistant,
) -> None:
    entry = er.async_get(hass).async_get_or_create(
        "switch",
        "demo",
        "legacy",
        suggested_object_id="legacy",
    )
    store = BindHomeStore(hass)
    await store._store.async_save(_v1_registry(entry.entity_id))

    registry = await store.async_load()

    binding = registry.bindings["binding-1"]
    assert binding.entity_id == entry.entity_id
    assert binding.entity_registry_id == entry.id
    persisted = await store._store.async_load()
    assert persisted is not None
    assert persisted["schema_version"] == 2
    assert persisted["bindings"][0]["entity_registry_id"] == entry.id


async def test_v1_migration_never_guesses_a_different_registered_target(
    hass: HomeAssistant,
) -> None:
    er.async_get(hass).async_get_or_create(
        "switch",
        "demo",
        "different",
        suggested_object_id="different",
    )
    store = BindHomeStore(hass)
    await store._store.async_save(_v1_registry("switch.missing"))

    registry = await store.async_load()

    binding = registry.bindings["binding-1"]
    assert binding.entity_id == "switch.missing"
    assert binding.entity_registry_id is None


async def test_invalid_v1_binding_does_not_trigger_canonical_write(
    hass: HomeAssistant,
) -> None:
    payload = _v1_registry("switch.legacy")
    binding = payload["bindings"][0]
    assert isinstance(binding, dict)
    binding.pop("entity_id")

    store = BindHomeStore(hass)
    store._async_path_exists = AsyncMock(return_value=True)  # type: ignore[method-assign]
    store._store.async_load = AsyncMock(return_value=payload)  # type: ignore[method-assign]
    store.async_save = AsyncMock()  # type: ignore[method-assign]

    with pytest.raises(BindHomeStoreLoadError, match="invalid"):
        await store.async_load()

    store.async_save.assert_not_awaited()
