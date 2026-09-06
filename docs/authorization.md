# Authorization model

BindHome uses Home Assistant authentication and roles. It does not maintain a separate user or ACL database.

## Policy

Every BindHome WebSocket handler is classified explicitly as one of three access levels by `custom_components.bindhome.authorization`:

- `household_read`: available to any authenticated Home Assistant user.
- `admin_read`: non-mutating but sensitive/administrative; Home Assistant administrator required.
- `admin_write`: any Registry mutation, destructive action or recovery/import commit; administrator required.

The classification decorators are part of the runtime authorization boundary and expose metadata used by regression tests. New API surfaces must choose one class explicitly.

## Current matrix

| Surface | Access | Reason |
| --- | --- | --- |
| Registry get/subscribe | household-read | Canonical household inventory and live revision updates |
| Preset list | household-read | Static presentation metadata |
| Asset get/list | household-read | Physical household inventory |
| Relation list and graph traverse/path | household-read | Household topology |
| Binding/resolver status | household-read | Operational status of the household model |
| Backup export/recovery status | admin-read | Complete machine backup and recovery diagnostics |
| CSV export/validate | admin-read | Administrative bulk-maintenance surface |
| Assisted-import discovery | admin-read | Exposes installation-wide Device/Entity metadata for an admin workflow |
| Hardware-replacement candidates | admin-read | Administrative rebinding workflow over installation Entity metadata |
| Delete-impact preview | admin-read | Administrative/destructive planning data |
| Asset/Relation/Binding/Representation mutation | admin-write | Changes the BindHome Registry |
| Backup restore | admin-write | Replaces persisted Registry state |
| CSV import | admin-write | Bulk Registry mutation |
| Assisted-import commit | admin-write | Bulk Registry mutation |
| Hardware-replacement commit | admin-write | Atomically replaces a Binding target |
| Delete with dependencies | admin-write | Destructive Registry mutation |

Home Assistant remains authoritative for Floor, Area, Device and Entity metadata. BindHome consumes their read-only registry APIs; it does not widen Home Assistant's own authorization for those APIs.

## Panel behavior

The sidebar panel is visible to authenticated non-admin users. In household-read mode it exposes Home and Search, inventory/topology/status details and live refreshes. Add, Advanced, edit/relation/rebind/delete actions and onboarding creation flows are hidden or disabled. Backend authorization remains authoritative even if a frontend client is modified.

This pattern is intended to be reused by future topology analysis (#41) and report/export surfaces (#42): each new handler must choose household-read, admin-read or admin-write rather than duplicating ad-hoc role checks.
