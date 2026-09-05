import assert from "node:assert/strict";
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
  const FirstElement = /** @type {CustomElementConstructor} */ (class {});
  const ReloadedElement = /** @type {CustomElementConstructor} */ (class {});

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
