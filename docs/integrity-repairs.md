# Integrity Repairs

BindHome uses Home Assistant Repairs only for persistent integrity conditions where the user has a concrete supported action. Normal runtime status remains in the resolver/panel and does not become a Repair merely because hardware is temporarily offline.

## Conditions that create Repairs

### Missing Area references

BindHome Assets store a reference to a Home Assistant Area. If that Area no longer exists, BindHome keeps the stale reference rather than silently moving the physical Asset.

All affected Assets are grouped into one warning Repair per BindHome config entry. The Repair lists the affected physical elements and directs the user to edit them in BindHome and either assign an existing room or choose no room.

The Repair clears automatically when no Asset retains a stale Area reference.

### Missing Binding targets

A Binding needs repair when its configured Home Assistant target can no longer be resolved because the referenced entity has been removed. This includes deletion of a stable Entity Registry target and missing state-only fallback entities.

All broken Bindings are grouped into one warning Repair per BindHome config entry. The Repair identifies the affected Asset/capability/role combinations and directs the user to change or disconnect those connections in BindHome.

A normal Entity Registry rename does not create a Repair because stable target identity follows the renamed entity. Rebinding or removing the broken Binding clears the Repair automatically once no broken target remains.

## Conditions that do not create Repairs

Transient runtime conditions are not configuration problems. A valid target that is currently `unavailable`, `unknown` or otherwise lacks a usable runtime state remains a normal resolver/panel status and does not create a Repair.

The existing critical Registry recovery Repair is also separate. Corrupt/unsupported persistent Registry state continues to use the fail-closed recovery path in `recovery.py`; integrity tracking does not duplicate or replace it.

## Grouping policy

BindHome intentionally creates at most two ordinary integrity Repairs per loaded config entry:

- missing Areas;
- missing Binding targets.

This avoids one Repair per Asset or Binding while keeping each remediation path specific. Human summaries are bounded so a large broken inventory does not flood the Repairs UI with raw identifiers.

## Event-driven lifecycle

Integrity Repairs are reconciled without polling. The tracker refreshes on:

- committed BindHome Registry changes;
- relevant stable Binding target changes from Home Assistant's Entity Registry;
- Home Assistant Area Registry updates.

This means Repairs appear and disappear as the underlying authoritative state changes, without a separate persistent BindHome issue database.

## Panel health — available in 1.4.1

**Advanced → Maintenance → Model health** presents the existing Binding summary, configuration faults and runtime availability separately. It also surfaces declared capabilities without Bindings, stale Home Assistant Areas, Registry recovery and hardware not yet documented in BindHome, using the existing assisted-import discovery contract.

Actions open the relevant element, import review or backup/recovery workflow. An undocumented device or a deliberately unconnected capability is a review finding, not automatically a Home Assistant Repair. Temporary hardware unavailability remains runtime status. The panel reuses authoritative data and explicit refresh; it does not add polling or a persistent issue store.
