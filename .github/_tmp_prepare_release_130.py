from __future__ import annotations

from pathlib import Path

VERSION_OLD = "1.2.0"
VERSION_NEW = "1.3.0"
RELEASE_DATE = "2026-09-06"


def replace_exact(path: str, old: str, new: str, *, count: int | None = None) -> None:
    target = Path(path)
    text = target.read_text()
    occurrences = text.count(old)
    expected = count if count is not None else 1
    if occurrences < expected:
        raise SystemExit(f"{path}: expected at least {expected} occurrence(s) of {old!r}, found {occurrences}")
    target.write_text(text.replace(old, new, expected))


# Release metadata.
replace_exact("pyproject.toml", 'version = "1.2.0"', 'version = "1.3.0"')
replace_exact(
    "custom_components/bindhome/manifest.json",
    '"version": "1.2.0"',
    '"version": "1.3.0"',
)
replace_exact("frontend/package.json", '"version": "1.2.0"', '"version": "1.3.0"')
replace_exact(
    "frontend/package-lock.json",
    '"version": "1.2.0"',
    '"version": "1.3.0"',
    count=2,
)

# Public release marker.
replace_exact(
    "README.md",
    "**Current stable release: `1.2.0` · Home Assistant `2026.8.0+`**",
    "**Current stable release: `1.3.0` · Home Assistant `2026.8.0+`**",
)

# Diagnostics fixture should describe the release being built.
diag = Path("tests/test_diagnostics.py")
diag_text = diag.read_text()
if diag_text.count('version="1.2.0"') != 3 or diag_text.count('"version": "1.2.0"') != 1:
    raise SystemExit("unexpected diagnostics version fixture shape")
diag_text = diag_text.replace('version="1.2.0"', 'version="1.3.0"')
diag_text = diag_text.replace('"version": "1.2.0"', '"version": "1.3.0"')
diag.write_text(diag_text)

# Finalize changelog from the accumulated Unreleased section.
changelog_path = Path("CHANGELOG.md")
changelog = changelog_path.read_text()
start_marker = "## [Unreleased]\n"
next_marker = "\n---\n\n## [1.2.0] - 2026-09-05"
start = changelog.index(start_marker) + len(start_marker)
end = changelog.index(next_marker, start)
unreleased = changelog[start:end].strip()

reliability_heading = "### Reliability\n"
if reliability_heading not in unreleased:
    raise SystemExit("CHANGELOG Unreleased Reliability heading missing")
live_entry = (
    "- The panel now follows committed BindHome Registry changes through a live WebSocket subscription instead of manual refresh or polling. "
    "A runtime-only monotonic revision lets the first-party panel attach optimistic-concurrency preconditions to mutations, reject stale writes before persistence, refresh other open sessions deterministically and offer a localized reload path after conflicts. "
    "The revision is not persisted and legacy callers that do not opt into revision preconditions retain their previous mutation contract. "
    "([#35](https://github.com/alessbarb/bindhome/issues/35), [#80](https://github.com/alessbarb/bindhome/pull/80))"
)
unreleased = unreleased.replace(
    reliability_heading,
    reliability_heading + "\n" + live_entry + "\n",
    1,
)

churn_entry = (
    "- The BindHome panel now keeps Home Assistant's high-frequency `hass` updates local to the active top-level view. "
    "Inactive Home, Add and Advanced views retain their mounted UI state without receiving routine state-machine churn, reducing unnecessary frontend work while preserving drafts and navigation state."
)
if churn_entry not in unreleased:
    raise SystemExit("expected #76 changelog entry missing")
unreleased = unreleased.replace(
    churn_entry,
    churn_entry + " ([#76](https://github.com/alessbarb/bindhome/pull/76))",
    1,
)

compatibility = """### Compatibility

- BindHome 1.3.0 persists Registry schema v2 so registered Binding targets can retain stable Home Assistant Entity Registry identity across `entity_id` renames. Existing schema-v1 data migrates deterministically on upgrade. After 1.3.0 has written schema v2, BindHome 1.2.0 cannot read that Registry in place; a controlled downgrade requires restoring a compatible schema-v1 backup through the supported recovery path rather than editing Home Assistant `.storage` manually. ([#50](https://github.com/alessbarb/bindhome/issues/50))

### Distribution

- Version promoted to `1.3.0` across Python, Home Assistant and frontend package metadata.
"""

release_intro = f"""## [Unreleased]

---

## [{VERSION_NEW}] - {RELEASE_DATE}

Third feature release focused on stable Binding identity, event-driven logical Representations, live multi-session Registry synchronization and frontend runtime reliability.

**Minimum Home Assistant:** `2026.8.0`

{unreleased}

{compatibility.rstrip()}
"""
changelog = changelog[: changelog.index(start_marker)] + release_intro + changelog[end:]
old_links = "[Unreleased]: https://github.com/alessbarb/bindhome/compare/v1.2.0...HEAD\n[1.2.0]:"
new_links = "[Unreleased]: https://github.com/alessbarb/bindhome/compare/v1.3.0...HEAD\n[1.3.0]: https://github.com/alessbarb/bindhome/compare/v1.2.0...v1.3.0\n[1.2.0]:"
if old_links not in changelog:
    raise SystemExit("CHANGELOG comparison-link marker missing")
changelog = changelog.replace(old_links, new_links, 1)
changelog_path.write_text(changelog)

# Architecture: document runtime-only revision/subscription semantics.
architecture_path = Path("docs/architecture.md")
architecture = architecture_path.read_text()
architecture_marker = "If persistence fails, live RAM remains unchanged and no Registry-changed signal is emitted.\n\n### Startup and recovery"
architecture_insert = """If persistence fails, live RAM remains unchanged and no Registry-changed signal is emitted.

### Live Registry revision and subscriptions

The manager also maintains a monotonic **runtime-only Registry revision** for coordinating live clients. A successful committed Registry mutation advances the revision exactly once after persistence and live adoption; rejected, stale or failed mutations do not advance it.

`bindhome/registry/get` exposes the current revision and `bindhome/registry/subscribe` emits committed revision notifications. The subscription is an invalidation signal: clients fetch the current Registry/read models rather than applying speculative partial patches.

Revision-aware mutation callers may include `based_on_revision`. If that value no longer matches the manager revision, the mutation fails with an explicit conflict before persistence. The field is optional so existing API callers retain their established request/response behavior, while the first-party panel uses it to protect edits made from an older snapshot.

The runtime revision is deliberately not part of the persisted Registry schema or backup envelope. It may reset when the config entry/manager reloads; clients reacquire the authoritative snapshot and revision from `bindhome/registry/get` after reconnect/reload. This concurrency token therefore has no identity or migration semantics and does not imply Registry schema v3.

### Startup and recovery"""
if architecture_marker not in architecture:
    raise SystemExit("architecture insertion marker missing")
architecture_path.write_text(architecture.replace(architecture_marker, architecture_insert, 1))

# Product contract: define the user-visible multi-session/stale-write guarantee.
contract_path = Path("docs/product-contract.md")
contract = contract_path.read_text()
contract_marker = "Bulk creation is one transaction, not N independent client-side creates.\n\nHome Assistant Entity Registry rename/removal events are read-side/runtime events, not BindHome Registry mutations."
contract_insert = """Bulk creation is one transaction, not N independent client-side creates.

### Live multi-session coordination

The first-party panel must converge on committed Registry changes made in another open panel/admin session without polling or requiring a manual refresh. A committed Registry notification causes the client to reacquire the current authoritative read model.

Panel mutations are based on the Registry revision last read by that client. If another writer commits first, a stale panel mutation must fail before persistence instead of silently overwriting newer Registry state. The UI must keep the conflict explicit and offer a clear reload path; local uncommitted draft state should not be discarded merely because another session changed the Registry.

The revision used for this coordination is a runtime token, not persistent infrastructure identity. It may reset when the BindHome manager reloads, at which point clients reacquire a fresh snapshot/revision. Generic API callers may omit the revision precondition for backward compatibility, but the BindHome panel uses it for optimistic concurrency.

Home Assistant Entity Registry rename/removal events are read-side/runtime events, not BindHome Registry mutations."""
if contract_marker not in contract:
    raise SystemExit("product-contract insertion marker missing")
contract_path.write_text(contract.replace(contract_marker, contract_insert, 1))
