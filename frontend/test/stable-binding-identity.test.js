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

await import("../src/infrastructure/infrastructure-inspector.js");
await import("../src/bindings/primary-connection-editor.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("Advanced Binding inspector exposes stable and last-known target identity", async () => {
  const inspector = document.createElement("bindhome-infrastructure-inspector");
  inspector.t = (key) => key;
  inspector.registry = {
    assets: [{ id: "asset-1", name: "Ceiling light", capabilities: ["on_off"] }],
    relations: [],
    bindings: [{
      id: "binding-1",
      asset_id: "asset-1",
      capability: "on_off",
      role: "primary",
      entity_id: "light.old_name",
      entity_registry_id: "stable-registry-entry-123",
    }],
  };
  inspector._tab = "bindings";
  document.body.append(inspector);
  await settle(inspector);

  const text = inspector.shadowRoot.textContent;
  assert.match(text, /light\.old_name/);
  assert.match(text, /stable-registry-entry-123/);
  assert.match(text, /Entity Registry ID/);

  inspector.remove();
});

test("normal connection summary shows current resolved entity after HA rename", async () => {
  const editor = document.createElement("bindhome-primary-connection-editor");
  editor.hass = {
    states: {
      "light.current_name": {
        state: "on",
        attributes: { friendly_name: "Current light" },
      },
    },
    callWS: async () => ({}),
  };
  editor.t = (key) => key;
  editor.asset = { id: "asset-1", capabilities: ["on_off"] };
  editor.capability = "on_off";
  editor.entityRegistry = [{ entity_id: "light.current_name", name: "Current light" }];
  editor.status = {
    status: "resolved",
    config_valid: true,
    runtime_available: true,
    entity_id: "light.current_name",
    binding: {
      id: "binding-1",
      asset_id: "asset-1",
      capability: "on_off",
      role: "primary",
      entity_id: "light.old_name",
      entity_registry_id: "stable-registry-entry-123",
    },
  };
  document.body.append(editor);
  await settle(editor);

  const text = editor.shadowRoot.textContent;
  assert.match(text, /light\.current_name/);
  assert.doesNotMatch(text, /light\.old_name/);
  assert.doesNotMatch(text, /stable-registry-entry-123/);

  editor.remove();
});
