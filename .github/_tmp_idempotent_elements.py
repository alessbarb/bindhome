from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path("frontend/src")
HELPER = ROOT / "custom-elements.js"
CALL = "customElements.define("

migrated_files: list[Path] = []
registration_names: list[str] = []

for path in sorted(ROOT.rglob("*.js")):
    if path == HELPER:
        continue
    text = path.read_text()
    if CALL not in text:
        continue

    names = re.findall(
        r"customElements\.define\(\s*[\"'](bindhome-[^\"']+)[\"']",
        text,
    )
    if len(names) != text.count(CALL):
        raise SystemExit(f"Could not parse every custom-element registration in {path}")

    relative = os.path.relpath(HELPER, path.parent).replace(os.sep, "/")
    if not relative.startswith("."):
        relative = f"./{relative}"
    import_line = f'import {{ defineBindHomeElement }} from "{relative}";\n'
    if "defineBindHomeElement" not in text:
        text = import_line + text

    text = text.replace(CALL, "defineBindHomeElement(")
    path.write_text(text)
    migrated_files.append(path)
    registration_names.extend(names)

if len(migrated_files) != 19:
    raise SystemExit(
        f"Expected 19 production files with direct registrations, found {len(migrated_files)}"
    )
if len(registration_names) != 19:
    raise SystemExit(
        f"Expected 19 BindHome custom-element registrations, found {len(registration_names)}"
    )
if len(set(registration_names)) != len(registration_names):
    raise SystemExit("Duplicate bindhome-* element names exist in source")

remaining = [
    path
    for path in ROOT.rglob("*.js")
    if path != HELPER and CALL in path.read_text()
]
if remaining:
    raise SystemExit(f"Direct registrations remain: {remaining}")

changelog = Path("CHANGELOG.md")
source = changelog.read_text()
marker = "### Reliability\n\n"
entry = (
    "- BindHome custom-element registration is now idempotent across repeated panel "
    "bundle evaluation in the same browser tab. All production `bindhome-*` Web "
    "Components use one guarded registration helper, preventing cache-busted or "
    "reloaded bundles from aborting with a duplicate `CustomElementRegistry` "
    "definition error. ([#77](https://github.com/alessbarb/bindhome/issues/77))\n"
)
if entry not in source:
    if marker not in source:
        raise SystemExit("CHANGELOG Reliability marker missing")
    source = source.replace(marker, marker + entry, 1)
    changelog.write_text(source)

Path("frontend/test/custom-element-registration.test.js").write_text(r'''import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { defineBindHomeElement } from "../src/custom-elements.js";

class FakeRegistry {
  constructor() {
    this.elements = new Map();
    this.defineCalls = 0;
  }

  get(name) {
    return this.elements.get(name);
  }

  define(name, constructor) {
    if (this.elements.has(name)) throw new Error(`duplicate ${name}`);
    this.defineCalls += 1;
    this.elements.set(name, constructor);
  }
}

test("BindHome registration is idempotent and preserves the first constructor", () => {
  const registry = new FakeRegistry();
  class FirstElement {}
  class ReloadedElement {}

  const first = defineBindHomeElement(
    "bindhome-test-registration",
    FirstElement,
    registry,
  );
  const second = defineBindHomeElement(
    "bindhome-test-registration",
    ReloadedElement,
    registry,
  );

  assert.equal(first, FirstElement);
  assert.equal(second, FirstElement);
  assert.equal(registry.get("bindhome-test-registration"), FirstElement);
  assert.equal(registry.defineCalls, 1);
});

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

test("production sources cannot register custom elements directly", () => {
  const src = new URL("../src/", import.meta.url);
  const helper = new URL("../src/custom-elements.js", import.meta.url).pathname;
  const offenders = walk(src.pathname)
    .filter((file) => file.endsWith(".js") && file !== helper)
    .filter((file) => fs.readFileSync(file, "utf8").includes("customElements.define("));

  assert.deepEqual(offenders, []);
});
''')

print("Migrated custom-element registrations:")
for path, name in zip(migrated_files, registration_names, strict=True):
    print(f"- {path}: {name}")
