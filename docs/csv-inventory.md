# CSV inventory round-trip

BindHome CSV is a **human-maintenance interchange format** for Asset inventory. It is not the Registry storage format and it is not a machine backup. Use the backup/restore contract for disaster recovery.

## Format version 1

Files are UTF-8 CSV and export these stable columns:

| Column | Meaning |
| --- | --- |
| `bindhome_csv_version` | Must be `1` for every row. |
| `asset_id` | Stable BindHome Asset ID. Empty means create a new Asset; a value means update exactly that existing Asset. |
| `code` | Optional human Asset code. Must remain unique. |
| `name` | Required human-readable Asset name. |
| `asset_type` | Required generic `lower_snake_case` Asset type. |
| `area_id` | Optional stable Home Assistant Area ID. Authoritative when present. |
| `area_name` | Human-readable Area name. Exported for spreadsheets; when `area_id` is empty it may resolve a uniquely named HA Area. |
| `capabilities` | Optional `;`-separated capability identifiers. |

The export keeps both `area_id` and `area_name` so a spreadsheet remains readable without weakening identity. If an Area is renamed in Home Assistant, an existing `area_id` remains authoritative and the exported display name updates on the next export.

## Create and update rules

- Empty `asset_id` means **create**. BindHome generates the stable Asset ID during the committed import.
- Non-empty `asset_id` means **update that exact Asset**. An unknown ID is an error; BindHome never interprets it as a request to create an Asset with a caller-chosen ID.
- Duplicate Asset IDs or codes in one CSV are errors.
- Existing Registry uniqueness, capability and Representation/Binding invariants still apply.
- `area_id` must identify a current Home Assistant Area. If it is empty and `area_name` is present, the name must match exactly one current Area (case-insensitive).
- The import never creates, renames, deletes or reassigns Home Assistant Areas, Devices or Entities.

## Validation and transaction boundary

The administrative WebSocket API exposes:

- `bindhome/csv/export`
- `bindhome/csv/validate`
- `bindhome/csv/import`

All three are administrator-only in v1.4. CSV is an inventory-management/export surface, not a household read surface.

`validate` applies the complete file to an isolated Registry copy and returns row/field errors plus a create/update preview. It does not mutate runtime state or storage.

`import` repeats the same validation inside the public BindHome transaction boundary and persists once. Any CSV validation error, Registry invariant error, revision conflict or storage failure leaves the live Registry unchanged. Clients may pass `based_on_revision` from the validation response to reject a commit based on stale data.

A typical safe workflow is therefore:

1. Export.
2. Edit in a spreadsheet without changing stable IDs accidentally.
3. Validate the complete CSV.
4. Review row-level errors and the create/update preview.
5. Import using the validated Registry revision.
6. Export again if a canonical post-import spreadsheet is required.

## Panel workflow — available in 1.4.1

Administrators can open **Advanced → Maintenance → CSV inventory** and export all Assets or restrict the exported rows to one current Home Assistant Floor or Area. The panel filters the canonical export; the CSV schema and backend contract are unchanged from 1.4.0.

Select an edited UTF-8 file, validate it and review the complete create/update preview and row/field errors. Commit only the validated file against its reviewed Registry revision. A conflict requires another validation; the panel does not silently apply stale changes. Import scope comes from the file contents, not the current export filter.

CSV never exports or imports Bindings, Relations or Representations and never deletes Assets omitted from the file. Use a Registry backup for complete recovery.
