"""Tests for BindHome human-editable CSV inventory round-trip."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar

from custom_components.bindhome.csv_inventory import (
    CSV_COLUMNS,
    CSV_FORMAT_VERSION,
    CsvBatchValidationError,
    async_import_inventory_csv,
    export_inventory_csv,
    validate_inventory_csv,
)
from custom_components.bindhome.manager import BindHomeManager
from custom_components.bindhome.models import Asset
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.store import BindHomeStoreError


def _csv(*rows: str) -> str:
    return ",".join(CSV_COLUMNS) + "\n" + "\n".join(rows) + "\n"


def test_export_round_trip_preserves_unicode_quotes_and_area(
    hass: HomeAssistant,
) -> None:
    area = ar.async_get(hass).async_create("Salón, principal")
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Lámpara, Águeda",
            asset_type="light_point",
            code="LGT,01",
            area_id=area.id,
            capabilities=["on_off", "brightness"],
        )
    )

    exported = export_inventory_csv(hass, registry)
    assert f'"{asset.name}"' in exported
    assert '"LGT,01"' in exported
    assert '"Salón, principal"' in exported

    preview = validate_inventory_csv(hass, registry, exported)
    assert preview.created == 0
    assert preview.updated == 1
    assert preview.changes[0].asset_id == asset.id


def test_create_row_can_resolve_area_by_unique_name(hass: HomeAssistant) -> None:
    area = ar.async_get(hass).async_create("Cocina")
    text = _csv(f"{CSV_FORMAT_VERSION},,SOCK-01,Enchufe,socket,,Cocina,on_off")

    registry = BindHomeRegistry()
    preview = validate_inventory_csv(hass, registry, text)

    assert preview.created == 1
    assert registry.assets == {}
    assert area.id


def test_unknown_asset_id_and_duplicate_codes_are_reported(hass: HomeAssistant) -> None:
    text = _csv(
        f"{CSV_FORMAT_VERSION},missing,SAME,One,socket,,,on_off",
        f"{CSV_FORMAT_VERSION},,SAME,Two,socket,,,on_off",
    )

    with pytest.raises(CsvBatchValidationError) as exc:
        validate_inventory_csv(hass, BindHomeRegistry(), text)

    errors = [error.to_dict() for error in exc.value.errors]
    assert any(error["field"] == "asset_id" for error in errors)
    assert any(error["field"] == "code" for error in errors)


async def test_invalid_row_prevents_whole_import(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    original = manager.registry.add_asset(
        Asset.create(name="Existing", asset_type="socket", code="EX-01")
    )
    manager._store.async_save = AsyncMock()  # noqa: SLF001
    text = _csv(
        f"{CSV_FORMAT_VERSION},,NEW-01,Valid,socket,,,on_off",
        f"{CSV_FORMAT_VERSION},,BAD-01,Bad,Bad Type,,,on_off",
    )

    with pytest.raises(CsvBatchValidationError):
        await async_import_inventory_csv(manager, text)

    assert list(manager.registry.assets) == [original.id]
    manager._store.async_save.assert_not_awaited()  # noqa: SLF001


async def test_persistence_failure_preserves_live_registry(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    original = manager.registry.add_asset(
        Asset.create(name="Existing", asset_type="socket", code="EX-01")
    )
    manager._store.async_save = AsyncMock(  # noqa: SLF001
        side_effect=BindHomeStoreError("disk full")
    )
    text = _csv(f"{CSV_FORMAT_VERSION},,NEW-01,New,socket,,,on_off")

    with pytest.raises(BindHomeStoreError, match="disk full"):
        await async_import_inventory_csv(manager, text)

    assert list(manager.registry.assets) == [original.id]


def test_empty_optional_fields_and_utf8_bom_are_supported(hass: HomeAssistant) -> None:
    text = "\ufeff" + _csv(f"{CSV_FORMAT_VERSION},,,Ático sensor,sensor,,,")

    preview = validate_inventory_csv(hass, BindHomeRegistry(), text)

    assert preview.created == 1


def test_duplicate_asset_ids_are_rejected(hass: HomeAssistant) -> None:
    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(name="Existing", asset_type="socket", code="EX-01")
    )
    text = _csv(
        f"{CSV_FORMAT_VERSION},{asset.id},EX-01,Existing,socket,,,on_off",
        f"{CSV_FORMAT_VERSION},{asset.id},EX-02,Again,socket,,,on_off",
    )

    with pytest.raises(CsvBatchValidationError) as exc:
        validate_inventory_csv(hass, registry, text)

    assert any(error.field == "asset_id" for error in exc.value.errors)


async def test_successful_import_commits_once(hass: HomeAssistant) -> None:
    manager = BindHomeManager(hass)
    manager._store.async_save = AsyncMock()  # noqa: SLF001
    text = _csv(f"{CSV_FORMAT_VERSION},,NEW-01,New socket,socket,,,on_off")

    preview = await async_import_inventory_csv(manager, text)

    assert preview.created == 1
    assert len(manager.registry.assets) == 1
    manager._store.async_save.assert_awaited_once()  # noqa: SLF001
    assert manager.revision == 1


def test_large_batch_validates_without_mutating_live_registry(
    hass: HomeAssistant,
) -> None:
    rows = [
        f"{CSV_FORMAT_VERSION},,CODE-{index},Socket {index},socket,,,on_off"
        for index in range(300)
    ]
    registry = BindHomeRegistry()

    preview = validate_inventory_csv(hass, registry, _csv(*rows))

    assert preview.created == 300
    assert registry.assets == {}
