"""Human-editable CSV round-trip for BindHome Asset inventory."""

from __future__ import annotations

import csv
from dataclasses import dataclass
from io import StringIO

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar

from .manager import BindHomeManager
from .models import Asset, ModelValidationError
from .registry import BindHomeRegistry, RegistryError, RegistryNotFoundError

CSV_FORMAT_VERSION = "1"
CSV_COLUMNS = (
    "bindhome_csv_version",
    "asset_id",
    "code",
    "name",
    "asset_type",
    "area_id",
    "area_name",
    "capabilities",
)


@dataclass(frozen=True, slots=True)
class CsvRowError:
    """One validation error tied to a human-visible CSV row and field."""

    row: int
    field: str | None
    message: str

    def to_dict(self) -> dict[str, object]:
        """Serialize the row error for APIs and UI."""
        return {"row": self.row, "field": self.field, "message": self.message}


class CsvBatchValidationError(ValueError):
    """Reject a CSV batch before any Registry mutation is committed."""

    def __init__(self, errors: list[CsvRowError]) -> None:
        self.errors = tuple(errors)
        super().__init__(f"CSV validation failed with {len(errors)} error(s)")


@dataclass(frozen=True, slots=True)
class CsvChange:
    """One validated create/update operation from a CSV row."""

    row: int
    operation: str
    name: str
    asset_id: str | None

    def to_dict(self) -> dict[str, object]:
        """Serialize the validated change without exposing temporary create IDs."""
        return {
            "row": self.row,
            "operation": self.operation,
            "name": self.name,
            "asset_id": self.asset_id,
        }


@dataclass(frozen=True, slots=True)
class CsvImportPreview:
    """Validated summary of a complete CSV batch."""

    changes: tuple[CsvChange, ...]

    @property
    def created(self) -> int:
        return sum(change.operation == "create" for change in self.changes)

    @property
    def updated(self) -> int:
        return sum(change.operation == "update" for change in self.changes)

    def to_dict(self) -> dict[str, object]:
        """Serialize preview counters and row-level operations."""
        return {
            "created": self.created,
            "updated": self.updated,
            "total": len(self.changes),
            "changes": [change.to_dict() for change in self.changes],
        }


def export_inventory_csv(hass: HomeAssistant, registry: BindHomeRegistry) -> str:
    """Export Assets as deterministic UTF-8 CSV text."""
    area_registry = ar.async_get(hass)
    output = StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=CSV_COLUMNS, lineterminator="\n")
    writer.writeheader()
    for asset in sorted(registry.assets.values(), key=lambda item: item.id):
        area = (
            area_registry.async_get_area(asset.area_id)
            if asset.area_id is not None
            else None
        )
        writer.writerow(
            {
                "bindhome_csv_version": CSV_FORMAT_VERSION,
                "asset_id": asset.id,
                "code": asset.code or "",
                "name": asset.name,
                "asset_type": asset.asset_type,
                "area_id": asset.area_id or "",
                "area_name": area.name if area is not None else "",
                "capabilities": ";".join(asset.capabilities),
            }
        )
    return output.getvalue()


def _normalized_fieldnames(fieldnames: list[str] | None) -> tuple[str, ...]:
    if fieldnames is None:
        return ()
    normalized = list(fieldnames)
    if normalized:
        normalized[0] = normalized[0].lstrip("\ufeff")
    return tuple(normalized)


def _rows(csv_text: str) -> list[tuple[int, dict[str, str]]]:
    reader = csv.DictReader(StringIO(csv_text, newline=""))
    fieldnames = _normalized_fieldnames(reader.fieldnames)
    if set(fieldnames) != set(CSV_COLUMNS) or len(fieldnames) != len(CSV_COLUMNS):
        expected = ", ".join(CSV_COLUMNS)
        raise CsvBatchValidationError(
            [CsvRowError(1, None, f"CSV header must contain exactly: {expected}")]
        )

    rows: list[tuple[int, dict[str, str]]] = []
    malformed: list[CsvRowError] = []
    for row_number, raw in enumerate(reader, start=2):
        if None in raw:
            malformed.append(
                CsvRowError(
                    row_number,
                    None,
                    "CSV row contains more columns than the header",
                )
            )
            continue
        normalized = {
            str(key).lstrip("\ufeff"): value or "" for key, value in raw.items()
        }
        rows.append((row_number, normalized))
    if malformed:
        raise CsvBatchValidationError(malformed)
    if not rows:
        raise CsvBatchValidationError(
            [CsvRowError(2, None, "CSV must contain at least one Asset row")]
        )
    return rows


def _resolve_area_id(
    hass: HomeAssistant,
    *,
    area_id: str,
    area_name: str,
    row: int,
) -> str | None:
    area_registry = ar.async_get(hass)
    normalized_id = area_id.strip()
    if normalized_id:
        if area_registry.async_get_area(normalized_id) is None:
            raise CsvBatchValidationError(
                [
                    CsvRowError(
                        row,
                        "area_id",
                        f"Home Assistant Area {normalized_id} was not found",
                    )
                ]
            )
        return normalized_id

    normalized_name = area_name.strip()
    if not normalized_name:
        return None
    matches = [
        area
        for area in area_registry.async_list_areas()
        if area.name.casefold() == normalized_name.casefold()
    ]
    if not matches:
        raise CsvBatchValidationError(
            [
                CsvRowError(
                    row,
                    "area_name",
                    f"Home Assistant Area named {normalized_name!r} was not found",
                )
            ]
        )
    if len(matches) > 1:
        raise CsvBatchValidationError(
            [
                CsvRowError(
                    row,
                    "area_name",
                    f"Home Assistant Area name {normalized_name!r} is ambiguous",
                )
            ]
        )
    return matches[0].id


def _capabilities(raw: str) -> list[str]:
    return [value.strip() for value in raw.split(";") if value.strip()]


def _error_from_exception(row: int, err: Exception) -> CsvRowError:
    field = getattr(err, "field", None)
    return CsvRowError(row, field, str(err))


def _apply_csv(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
    csv_text: str,
) -> CsvImportPreview:
    rows = _rows(csv_text)
    errors: list[CsvRowError] = []
    changes: list[CsvChange] = []
    seen_asset_ids: dict[str, int] = {}
    seen_codes: dict[str, int] = {}

    for row_number, row in rows:
        if row["bindhome_csv_version"].strip() != CSV_FORMAT_VERSION:
            errors.append(
                CsvRowError(
                    row_number,
                    "bindhome_csv_version",
                    "Unsupported BindHome CSV format version",
                )
            )
            continue

        asset_id = row["asset_id"].strip()
        code = row["code"].strip() or None

        if asset_id:
            first_row = seen_asset_ids.get(asset_id)
            if first_row is not None:
                errors.append(
                    CsvRowError(
                        row_number,
                        "asset_id",
                        f"Asset ID is already used by CSV row {first_row}",
                    )
                )
                continue
            seen_asset_ids[asset_id] = row_number

        if code:
            first_row = seen_codes.get(code)
            if first_row is not None:
                errors.append(
                    CsvRowError(
                        row_number,
                        "code",
                        f"Asset code is already used by CSV row {first_row}",
                    )
                )
                continue
            seen_codes[code] = row_number

        try:
            area_id = _resolve_area_id(
                hass,
                area_id=row["area_id"],
                area_name=row["area_name"],
                row=row_number,
            )
            capabilities = _capabilities(row["capabilities"])
            if asset_id:
                registry.get_asset(asset_id)
                updated = registry.update_asset(
                    asset_id,
                    name=row["name"],
                    asset_type=row["asset_type"],
                    code=code,
                    area_id=area_id,
                    capabilities=capabilities,
                )
                changes.append(
                    CsvChange(row_number, "update", updated.name, updated.id)
                )
            else:
                created = registry.add_asset(
                    Asset.create(
                        name=row["name"],
                        asset_type=row["asset_type"],
                        code=code,
                        area_id=area_id,
                        capabilities=capabilities,
                    )
                )
                changes.append(CsvChange(row_number, "create", created.name, None))
        except CsvBatchValidationError as err:
            errors.extend(err.errors)
        except (ModelValidationError, RegistryError) as err:
            field = "asset_id" if isinstance(err, RegistryNotFoundError) else None
            row_error = _error_from_exception(row_number, err)
            if field is not None and row_error.field is None:
                row_error = CsvRowError(row_number, field, row_error.message)
            errors.append(row_error)

    if errors:
        raise CsvBatchValidationError(errors)
    return CsvImportPreview(tuple(changes))


def validate_inventory_csv(
    hass: HomeAssistant,
    registry: BindHomeRegistry,
    csv_text: str,
) -> CsvImportPreview:
    """Validate a complete batch against an isolated Registry copy."""
    staged = BindHomeRegistry.from_dict(registry.to_dict())
    return _apply_csv(hass, staged, csv_text)


async def async_import_inventory_csv(
    manager: BindHomeManager,
    csv_text: str,
    *,
    expected_revision: int | None = None,
) -> CsvImportPreview:
    """Apply a validated CSV batch as one Registry transaction."""
    preview: CsvImportPreview | None = None
    async with manager.transaction(expected_revision=expected_revision) as staged:
        preview = _apply_csv(manager.hass, staged, csv_text)
    assert preview is not None
    return preview
