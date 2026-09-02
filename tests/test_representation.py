"""Tests for explicit BindHome logical Representations."""

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.models import Asset, Representation
from custom_components.bindhome.registry import (
    BindHomeRegistry,
    RegistryConflictError,
    RegistryNotFoundError,
    RegistryValidationError,
)


def _light_asset(registry: BindHomeRegistry) -> Asset:
    return registry.add_asset(
        Asset.create(
            name="Ceiling light",
            asset_type="light_point",
            capabilities=["on_off"],
        )
    )


def test_representation_requires_existing_asset() -> None:
    registry = BindHomeRegistry()

    with pytest.raises(RegistryNotFoundError, match="was not found"):
        registry.set_representation(
            Representation.create(
                asset_id="missing",
                platform="light",
            )
        )


def test_representation_platform_must_be_implemented_by_bindhome() -> None:
    registry = BindHomeRegistry()
    asset = _light_asset(registry)

    with pytest.raises(
        RegistryValidationError,
        match="does not implement representation platform fan",
    ):
        registry.set_representation(
            Representation.create(
                asset_id=asset.id,
                platform="fan",
            )
        )


def test_light_representation_requires_on_off_capability() -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Passive light point",
            asset_type="light_point",
            capabilities=[],
        )
    )

    with pytest.raises(
        RegistryValidationError,
        match="light representation requires capabilities: on_off",
    ):
        registry.set_representation(
            Representation.create(
                asset_id=asset.id,
                platform="light",
            )
        )


def test_representation_is_zero_or_one_and_same_platform_is_idempotent() -> None:
    registry = BindHomeRegistry()
    asset = _light_asset(registry)

    first = registry.set_representation(
        Representation.create(
            asset_id=asset.id,
            platform="light",
        )
    )
    second = registry.set_representation(
        Representation.create(
            asset_id=asset.id,
            platform="light",
        )
    )

    assert first == second
    assert registry.get_representation(asset.id) == first
    assert len(registry.representations) == 1


def test_required_capability_cannot_be_removed_while_representation_exists() -> None:
    registry = BindHomeRegistry()
    asset = _light_asset(registry)

    registry.set_representation(
        Representation.create(
            asset_id=asset.id,
            platform="light",
        )
    )

    with pytest.raises(
        RegistryConflictError,
        match="Cannot remove capabilities required by active light representation",
    ):
        registry.update_asset_capabilities(asset.id, [])


def test_asset_cannot_be_deleted_while_representation_exists() -> None:
    registry = BindHomeRegistry()
    asset = _light_asset(registry)

    registry.set_representation(
        Representation.create(
            asset_id=asset.id,
            platform="light",
        )
    )

    with pytest.raises(
        RegistryConflictError,
        match="Cannot delete an asset with active representation",
    ):
        registry.delete_asset(asset.id)

    registry.remove_representation(asset.id)
    registry.delete_asset(asset.id)

    assert asset.id not in registry.assets


def test_representation_serialization_roundtrip() -> None:
    registry = BindHomeRegistry()
    asset = _light_asset(registry)

    representation = registry.set_representation(
        Representation.create(
            asset_id=asset.id,
            platform="light",
        )
    )

    data = registry.to_dict()

    assert data["representations"] == [representation.to_dict()]

    restored = BindHomeRegistry.from_dict(data)

    assert restored.get_representation(asset.id) == representation


def test_legacy_registry_migrates_implicit_on_off_lights() -> None:
    legacy = BindHomeRegistry.from_dict(
        {
            "schema_version": 1,
            "assets": [
                {
                    "id": "old-light",
                    "name": "Old light",
                    "asset_type": "light_point",
                    "capabilities": ["on_off"],
                },
                {
                    "id": "old-socket",
                    "name": "Passive socket",
                    "asset_type": "socket",
                    "capabilities": [],
                },
            ],
            "relations": [],
            "bindings": [],
        }
    )

    representation = legacy.get_representation("old-light")

    assert representation is not None
    assert representation.platform == "light"
    assert legacy.get_representation("old-socket") is None

    # Once serialized by the new model, the distinction becomes explicit.
    assert "representations" in legacy.to_dict()


def test_explicit_empty_representation_list_disables_legacy_inference() -> None:
    registry = BindHomeRegistry.from_dict(
        {
            "schema_version": 1,
            "assets": [
                {
                    "id": "new-light-point",
                    "name": "New light point",
                    "asset_type": "light_point",
                    "capabilities": ["on_off"],
                }
            ],
            "relations": [],
            "bindings": [],
            "representations": [],
        }
    )

    assert registry.get_representation("new-light-point") is None


async def test_manager_representation_lifecycle_persists_and_notifies(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()

    asset = await manager.async_create_asset(
        name="Logical candidate",
        asset_type="light_point",
        code=None,
        area_id=None,
        capabilities=["on_off"],
    )

    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    representation = await manager.async_set_representation(
        asset_id=asset.id,
        platform="light",
    )
    await hass.async_block_till_done()

    assert representation.platform == "light"
    assert manager.registry.get_representation(asset.id) == representation

    await manager.async_remove_representation(asset.id)
    await hass.async_block_till_done()

    assert manager.registry.get_representation(asset.id) is None
    assert notifications == [None, None]

    reloaded = BindHomeManager(hass)
    await reloaded.async_load()
    assert reloaded.registry.get_representation(asset.id) is None

    unsubscribe()
