import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/bindhome" });
Object.assign(globalThis, {
  window,
  document: window.document,
  customElements: window.customElements,
  HTMLElement: window.HTMLElement,
  ShadowRoot: window.ShadowRoot,
  Document: window.Document,
  CSSStyleSheet: window.CSSStyleSheet,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  CSS: window.CSS,
});
if (!customElements.get("ha-icon")) customElements.define("ha-icon", class extends HTMLElement {});

await import("../src/bindings/primary-connection-editor.js");

const t = (key, values = {}) => key === "connection.replacement_success"
  ? `replaced:${values.entity}`
  : key;

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function replacementEditor(callWS) {
  const editor = document.createElement("bindhome-primary-connection-editor");
  editor.hass = {
    states: {
      "switch.old": { state: "on", attributes: { friendly_name: "Old relay" } },
      "switch.new": { state: "off", attributes: { friendly_name: "New relay" } },
    },
    callWS,
  };
  editor.t = t;
  editor.asset = { id: "asset-1", area_id: "living", capabilities: ["on_off"] };
  editor.capability = "on_off";
  editor.status = {
    status: "resolved",
    config_valid: true,
    runtime_available: true,
    entity_id: "switch.old",
    binding: { id: "binding-1", entity_id: "switch.old", role: "primary" },
  };
  editor.entityRegistry = [
    { id: "er-old", entity_id: "switch.old", name: "Old relay", area_id: "living" },
    { id: "er-new", entity_id: "switch.new", name: "New relay", area_id: "living" },
  ];
  editor.areas = [{ area_id: "living", name: "Living room" }];
  document.body.append(editor);
  return editor;
}

test("bound connection loads backend replacement candidates and requires confirmation", async () => {
  const calls = [];
  const editor = replacementEditor(async (message) => {
    calls.push(message);
    if (message.type === "bindhome/replacement/candidates") {
      return {
        revision: 7,
        current: { entity_id: "switch.old" },
        candidates: [{ entity_id: "switch.new", entity_registry_id: "er-new", name: "New relay", domain: "switch", area_id: "living", device_id: null, state: "off", rank: 3, reasons: ["same_area"] }],
      };
    }
    if (message.type === "bindhome/replacement/commit") {
      return { revision: 8, resolution: { entity_id: "switch.new", status: "resolved" } };
    }
    throw new Error(`Unexpected ${message.type}`);
  });
  let refreshes = 0;
  editor.refreshBindingData = async () => { refreshes += 1; };
  await settle(editor);
  await editor._beginEdit();
  await settle(editor);
  assert.equal(editor._selectedEntityId, null);
  assert.equal(editor._candidates().length, 1);

  editor._select("switch.new");
  await editor._save();
  assert.equal(editor._confirmReplacement, true);
  assert.equal(calls.filter((call) => call.type === "bindhome/replacement/commit").length, 0);

  await editor._save();
  assert.deepEqual(calls.at(-1), {
    type: "bindhome/replacement/commit",
    asset_id: "asset-1",
    capability: "on_off",
    entity_id: "switch.new",
    role: "primary",
    based_on_revision: 7,
  });
  assert.equal(refreshes, 1);
  assert.equal(editor._editing, false);
  assert.equal(editor._replacementSuccess, "switch.new");
});

test("replacement failure preserves candidate review for correction", async () => {
  const editor = replacementEditor(async (message) => {
    if (message.type === "bindhome/replacement/candidates") {
      return { revision: 4, candidates: [{ entity_id: "switch.new", name: "New relay", domain: "switch", area_id: "living", state: "off", rank: 1, reasons: [] }] };
    }
    throw { code: "invalid_format", message: "Candidate became stale" };
  });
  await settle(editor);
  await editor._beginEdit();
  editor._select("switch.new");
  await editor._save();
  await editor._save();
  assert.equal(editor._editing, true);
  assert.equal(editor._selectedEntityId, "switch.new");
  assert.equal(editor._confirmReplacement, true);
  assert.equal(editor._error, "Candidate became stale");
});

test("unbound capability keeps direct setBinding behavior", async () => {
  const calls = [];
  const editor = replacementEditor(async (message) => { calls.push(message); return {}; });
  editor.status = { status: "binding_not_found", binding: null };
  await settle(editor);
  await editor._beginEdit();
  editor._select("switch.new");
  await editor._save();
  assert.equal(calls.some((call) => call.type === "bindhome/replacement/candidates"), false);
  assert.equal(calls.at(-1).type, "bindhome/bindings/set");
});
