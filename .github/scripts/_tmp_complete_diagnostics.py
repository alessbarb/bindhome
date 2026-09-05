from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
README = ROOT / "README.md"
CHANGELOG = ROOT / "CHANGELOG.md"


text = README.read_text()
heading = "## Diagnostics and support"
if heading not in text:
    anchor = "## Safety model\n"
    block = """## Diagnostics and support

When reporting a BindHome problem, use Home Assistant's **Download diagnostics** action for the BindHome config entry and attach that diagnostics file to the issue when it is relevant.

BindHome diagnostics are intentionally aggregated. They include the integration/storage/schema versions, config-entry state, Registry object counts and Binding resolver status counts. They do **not** export Asset names or codes, BindHome UUIDs, Home Assistant entity IDs, config-entry IDs or the Registry itself.

If Registry loading has failed closed, diagnostics remain useful where Home Assistant can invoke them: the recovery category is reported, while the stored error message and unsafe Registry contents are omitted. Registry backup/export remains a separate administrator operation and is never embedded in diagnostics.

---

"""
    if anchor not in text:
        raise RuntimeError("README Safety model anchor not found")
    README.write_text(text.replace(anchor, block + anchor, 1))

text = CHANGELOG.read_text()
entry = (
    "- Added privacy-preserving Home Assistant config-entry diagnostics with "
    "integration/storage/schema versions, aggregate Registry counts, aggregate "
    "Binding resolver statuses and fail-closed recovery context without exporting "
    "Registry contents or stable/hardware identifiers. "
    "([#67](https://github.com/alessbarb/bindhome/pull/67))\n"
)
if entry not in text:
    anchor = "## [Unreleased]\n\n"
    if anchor not in text:
        raise RuntimeError("Unreleased changelog anchor not found")
    CHANGELOG.write_text(text.replace(anchor, anchor + "### Added\n\n" + entry + "\n", 1))
