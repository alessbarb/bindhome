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
if (!customElements.get("ha-switch")) customElements.define("ha-switch", class extends HTMLElement {});

await import("../src/bindhome-panel.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("non-admin panel is read-only and does not expose mutation navigation", async () => {
  const panel = document.createElement("bindhome-panel");
  panel._loading = false;
  panel._initialized = true;
  panel._translationLanguage = "en";
  panel._t = (key) => key;
  panel._floors = [];
  panel._areas = [];
  panel._assets = [];
  panel._registry = { assets: [], relations: [], bindings: [], representations: [] };
  panel.hass = { language: "en", user: { id: "reader", is_admin: false }, states: {}, callWS: async () => ({}) };
  document.body.append(panel);
  panel._syncOnboardingVisibility();
  await settle(panel);

  const labels = [...panel.shadowRoot.querySelectorAll(".tabs button")].map((button) => button.textContent.trim());
  assert.deepEqual(labels, ["nav.home", "nav.search"]);
  assert.equal(panel.shadowRoot.querySelector("ha-switch.advanced-switch"), null);
  assert.equal(panel.shadowRoot.querySelector(".read-only-badge")?.textContent, "common.read_only");
  assert.equal(panel.shadowRoot.querySelector("bindhome-home-view").readOnly, true);
  assert.equal(panel._onboardingVisible, false);

  panel._navigate("add");
  assert.equal(panel._view, "home");
  panel._setAdvancedPinned(true);
  assert.equal(panel._advancedPinned, false);
});

test("read-only Asset detail hides edit, relation, binding and deletion controls", async () => {
  const detail = document.createElement("bindhome-element-detail");
  detail.t = (key) => key;
  detail.readOnly = true;
  detail.asset = { id: "asset-1", name: "Ceiling light", asset_type: "light", code: "L1", area_id: null, capabilities: ["light"] };
  detail.assets = [detail.asset];
  detail.areas = [];
  detail.floors = [];
  detail.registry = { relations: [], representations: [] };
  detail.bindingStatuses = { records: [{ asset_id: "asset-1", capability: "light", role: "primary", status: "resolved", entity_id: "light.kitchen", binding: { entity_id: "light.kitchen" } }], summary: {} };
  detail.entityRegistry = [];
  detail.deviceRegistry = [];
  document.body.append(detail);
  await settle(detail);

  assert.equal(detail.shadowRoot.querySelector("bindhome-primary-connection-editor"), null);
  assert.equal(detail.shadowRoot.querySelector("bindhome-asset-delete-control"), null);
  assert.equal(detail.shadowRoot.querySelector("bindhome-contextual-relation-editor"), null);
  assert.equal(detail.shadowRoot.querySelector("button.open-advanced"), null);
  assert.equal([...detail.shadowRoot.querySelectorAll("button")].some((button) => button.textContent.includes("common.edit")), false);
  assert.ok(detail.shadowRoot.textContent.includes("light.kitchen"));
});
