# Guided hardware replacement

BindHome treats hardware replacement as a Binding change, not as replacement of the physical Asset.

From the human Asset detail view, an administrator can choose **Replace hardware** for an existing primary connection. The workflow keeps the current target visible, asks BindHome for compatible current Home Assistant entities, requires an explicit candidate selection and then shows a final current → new confirmation before writing anything.

## Candidate safety

The backend is authoritative. `bindhome/replacement/candidates` is an admin-read surface and filters out:

- the current Binding target;
- BindHome logical entities;
- disabled Entity Registry entries;
- targets already bound to a different Asset;
- candidates that are safely known to be incompatible with the selected capability.

Known capabilities use conservative Home Assistant domain/device-class contracts (`on_off`, `open_close`, `position`, `setpoint`, `temperature`, `power_measurement`). Custom capabilities remain eligible because BindHome cannot safely invent a domain contract for them.

Candidates are ranked rather than auto-selected. Same Area, same current domain, stable Entity Registry identity and current runtime presence improve ranking. The user remains responsible for physical identity.

## Commit boundary

`bindhome/replacement/commit` is admin-write. It re-runs candidate discovery immediately before commit, rejects a target that disappeared or is no longer compatible, and then delegates to `BindHomeManager.async_set_binding()` with the revision captured during review.

The manager stages and validates the replacement before persistence. The old Binding is never deleted first. A validation, conflict or storage failure therefore leaves the previous Binding live. A successful replacement preserves the Asset ID/code, Relations and Representation identity; Home Assistant Device/Entity registries are never modified.
