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

if (!customElements.get("ha-icon")) {
  customElements.define("ha-icon", class extends HTMLElement {});
}

await import("../src/inventory/asset-connections.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function createConnections() {
  const element = document.createElement("bindhome-asset-connections");
  element.hass = { states: {}, callWS: async () => ({}) };
  element.t = (key) => key;
  element.asset = {
    id: "asset-a",
    name: "Ceiling light",
    asset_type: "light_point",
    capabilities: ["on_off"],
  };
  element.assets = [element.asset];
  element.areas = [];
  element.registry = {
    assets: [element.asset],
    relations: [],
    bindings: [{
      id: "binding-a",
      asset_id: "asset-a",
      capability: "on_off",
      role: "primary",
      entity_id: "switch.relay",
    }],
    representations: [{ asset_id: "asset-a", platform: "light" }],
  };
  element.bindingStatuses = { records: [], summary: {} };
  element.entityRegistry = [];
  element.deviceRegistry = [];
  document.body.append(element);
  return element;
}

test("asset connections owns topology, Binding and Representation presentation", async () => {
  const element = createConnections();
  await settle(element);

  const topology = element.shadowRoot.querySelector("bindhome-asset-topology");
  const binding = element.shadowRoot.querySelector("bindhome-primary-connection-editor");
  assert.ok(topology);
  assert.ok(binding);
  assert.equal(topology.asset.id, "asset-a");
  assert.equal(binding.asset.id, "asset-a");
  assert.equal(binding.capability, "on_off");
  assert.equal(binding.status.binding.id, "binding-a");
  assert.match(element.shadowRoot.textContent, /light/);
});

test("topology warning crosses the extracted boundary exactly once", async () => {
  const element = createConnections();
  await settle(element);
  const topology = element.shadowRoot.querySelector("bindhome-asset-topology");
  const warnings = [];
  element.addEventListener("topology-sync-warning", (event) => warnings.push(event.detail));

  topology.dispatchEvent(new CustomEvent("topology-sync-warning", {
    detail: "refresh failed",
    bubbles: true,
    composed: true,
  }));

  assert.deepEqual(warnings, ["refresh failed"]);
});
