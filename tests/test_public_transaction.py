"""Tests for the public BindHome Registry transaction contract."""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from custom_components.bindhome.const import SIGNAL_REGISTRY_CHANGED
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.models import Asset, Relation
from custom_components.bindhome.registry import (
    BindHomeRegistry,
    RegistryValidationError,
)
from custom_components.bindhome.registry_state import replace_registry_contents
from custom_components.bindhome.store import BindHomeStore
from custom_components.bindhome.transaction import BindHomeTransactionError


async def test_public_transaction_commits_once_and_signals_once(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    original_registry = manager.registry

    real_save = manager._store.async_save
    manager._store.async_save = AsyncMock(wraps=real_save)
    notifications: list[None] = []
    unsubscribe = async_dispatcher_connect(
        hass,
        SIGNAL_REGISTRY_CHANGED,
        lambda: notifications.append(None),
    )

    try:
        async with manager.transaction() as staged:
            asset = staged.add_asset(
                Asset.create(
                    name="Socket",
                    asset_type="socket",
                    code="SOCK-01",
                    area_id=None,
                    capabilities=[],
                )
            )
            assert manager.registry is original_registry
            assert asset.id not in manager.registry.assets

        await hass.async_block_till_done()

        assert manager._store.async_save.await_count == 1
        assert manager.registry is original_registry
        assert manager.registry.get_asset(asset.id) == asset
        assert notifications == [None]
    finally:
        unsubscribe()


async def test_public_transaction_exception_does_not_persist_or_publish(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    baseline = manager.registry.to_dict()
    manager._store.async_save = AsyncMock()

    with pytest.raises(RuntimeError, match="abort staged mutation"):
        async with manager.transaction() as staged:
            staged.add_asset(
                Asset.create(
                    name="Socket",
                    asset_type="socket",
                    code="SOCK-01",
                    area_id=None,
                    capabilities=[],
                )
            )
            raise RuntimeError("abort staged mutation")

    manager._store.async_save.assert_not_awaited()
    assert manager.registry.to_dict() == baseline


async def test_public_mutation_inside_transaction_fails_fast(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    manager._store.async_save = AsyncMock()

    async with manager.transaction() as staged:
        staged.add_asset(
            Asset.create(
                name="Staged socket",
                asset_type="socket",
                code="SOCK-01",
                area_id=None,
                capabilities=[],
            )
        )

        with pytest.raises(
            BindHomeTransactionError,
            match="active Registry transaction",
        ):
            async with asyncio.timeout(0.1):
                await manager.async_create_asset(
                    name="Nested socket",
                    asset_type="socket",
                    code="SOCK-02",
                    area_id=None,
                    capabilities=[],
                )

    assert len(manager.registry.assets) == 1


async def test_concurrent_transactions_serialize_without_false_reentry(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    manager._store.async_save = AsyncMock()

    first_entered = asyncio.Event()
    release_first = asyncio.Event()

    async def first_mutation() -> None:
        async with manager.transaction() as staged:
            staged.add_asset(
                Asset.create(
                    name="First",
                    asset_type="socket",
                    code="SOCK-01",
                    area_id=None,
                    capabilities=[],
                )
            )
            first_entered.set()
            await release_first.wait()

    async def second_mutation() -> None:
        await first_entered.wait()
        await manager.async_create_asset(
            name="Second",
            asset_type="socket",
            code="SOCK-02",
            area_id=None,
            capabilities=[],
        )

    first_task = asyncio.create_task(first_mutation())
    second_task = asyncio.create_task(second_mutation())

    await first_entered.wait()
    await asyncio.sleep(0)
    assert not second_task.done()

    release_first.set()
    await asyncio.gather(first_task, second_task)

    assert {asset.code for asset in manager.registry.assets.values()} == {
        "SOCK-01",
        "SOCK-02",
    }


async def test_transaction_revalidates_staged_registry_before_storage(
    hass: HomeAssistant,
) -> None:
    manager = BindHomeManager(hass)
    await manager.async_load()
    baseline = manager.registry.to_dict()
    manager._store.async_save = AsyncMock()

    with pytest.raises(RegistryValidationError, match="was not found"):
        async with manager.transaction() as staged:
            relation = Relation.create(
                source_asset_id="missing-source",
                relation_type="feeds",
                target_asset_id="missing-target",
            )
            staged.relations[relation.id] = relation

    manager._store.async_save.assert_not_awaited()
    assert manager.registry.to_dict() == baseline


async def test_store_validates_before_touching_home_assistant_storage(
    hass: HomeAssistant,
) -> None:
    store = BindHomeStore(hass)
    store._store.async_save = AsyncMock()
    registry = BindHomeRegistry()
    relation = Relation.create(
        source_asset_id="missing-source",
        relation_type="feeds",
        target_asset_id="missing-target",
    )
    registry.relations[relation.id] = relation

    with pytest.raises(RegistryValidationError, match="was not found"):
        await store.async_save(registry)

    store._store.async_save.assert_not_awaited()


def test_registry_replacement_covers_future_persisted_collection(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    target = BindHomeRegistry()
    source = BindHomeRegistry()
    target.future_items = {}  # type: ignore[attr-defined]
    source.future_items = {"future": object()}  # type: ignore[attr-defined]

    original_to_dict = BindHomeRegistry.to_dict

    def to_dict_with_future(self: BindHomeRegistry) -> dict[str, object]:
        data: dict[str, object] = original_to_dict(self)
        data["future_items"] = []
        return data

    monkeypatch.setattr(BindHomeRegistry, "to_dict", to_dict_with_future)

    replace_registry_contents(target, source)

    assert target.future_items == source.future_items  # type: ignore[attr-defined]


def test_registry_replacement_fails_closed_for_unhandled_persisted_field(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    target = BindHomeRegistry()
    source = BindHomeRegistry()
    original_to_dict = BindHomeRegistry.to_dict

    def to_dict_with_scalar(self: BindHomeRegistry) -> dict[str, object]:
        data: dict[str, object] = original_to_dict(self)
        data["revision"] = 1
        return data

    monkeypatch.setattr(BindHomeRegistry, "to_dict", to_dict_with_scalar)

    with pytest.raises(
        RegistryValidationError,
        match="explicit adoption semantics: revision",
    ):
        replace_registry_contents(target, source)
