# Registry backup and restore

BindHome exposes an administrator-only WebSocket contract for exporting and restoring the complete logical Registry without reading or editing Home Assistant `.storage` files directly.

## Panel workflow — available in 1.4.1

Administrators can open **Advanced → Maintenance → Backup and restore**. Download a complete JSON backup before a significant change. The last-export indication is stored per Home Assistant user; it records a successful download, not an automatic backup schedule or proof that an external copy still exists.

To restore, select a backup file, inspect the object counts, acknowledge that the whole Registry will be replaced and confirm. During normal operation the panel submits the reviewed Registry revision and rejects stale restores. In recovery mode the existing recovery API can validate and restore storage even when the normal Registry manager cannot load. A stored restore followed by a failed integration reload is reported separately; use Repairs and reload the integration.

Backups preserve Assets, Relations, Bindings and Representations. CSV export covers Asset inventory only and is not a substitute for a complete Registry backup. Both 1.4.0 and 1.4.1 use backup format v1 and Registry schema v2.

## Backup envelope

`bindhome/backup/export` returns a versioned envelope:

```json
{
  "backup": {
    "format": "bindhome.registry",
    "format_version": 1,
    "registry": {
      "schema_version": 2,
      "assets": [],
      "relations": [],
      "bindings": [],
      "representations": []
    }
  }
}
```

The backup format version and Registry schema version are independent. The outer version controls the backup transport contract. The inner `schema_version` controls the persisted BindHome domain model.

The export contains no timestamp or environment-specific metadata, so exporting the same Registry twice produces the same payload.

## Restore contract

`bindhome/backup/restore` accepts the `backup` object returned by export.

Restore is a full Registry replacement, not a merge. BindHome:

1. validates the backup envelope and its version;
2. deserializes and validates the complete Registry into isolated staged state;
3. acquires the manager mutation lock;
4. persists the staged Registry using the fail-fast atomic Store;
5. only after persistence succeeds, adopts the staged contents into the existing live Registry object;
6. emits `SIGNAL_REGISTRY_CHANGED` after commit.

A malformed backup, unsupported backup version, unsupported Registry schema, or Registry validation failure is rejected before persistence is attempted.

A persistence failure leaves the live Registry unchanged and emits no Registry-changed signal.

## Scope and safety

Both commands require a Home Assistant administrator.

A backup may contain Home Assistant entity references that have since become stale. Schema-v2 Bindings preserve both the last-known `entity_id` and, when available, the stable Home Assistant `entity_registry_id`. Historical backups are upgraded to stable Entity Registry identity only when an exact current Registry entry proves that identity; otherwise the original `entity_id` remains an explicit compatibility fallback. Runtime lookup of the current entity id is handled separately from backup migration.

Do not manipulate Home Assistant `.storage` files to create or restore a BindHome backup. Use the panel workflow or this API.
