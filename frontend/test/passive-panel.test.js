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
if (!customElements.get("ha-switch")) {
  customElements.define("ha-switch", class extends HTMLElement {});
}

await import("../src/bindhome-panel.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function fixture() {
  const panel = document.createElement("bindhome-panel");
  panel._loading = false;
  panel._initialized = true;
  panel._translationLanguage = "en";
  panel._t = (key) => key;
  panel._floors = [];
  panel._areas = [];
  panel._assets = [];
  panel._registry = { assets: [], relations: [], bindings: [], representations: [] };
  panel.hass = { language: "en", states: {}, callWS: async () => ({}) };
  document.body.append(panel);
  return panel;
}

test("routine hass updates propagate only into the active top-level view", async () => {
  const panel = fixture();
  await settle(panel);

  const home = panel.shadowRoot.querySelector("bindhome-home-view");
  const add = panel.shadowRoot.querySelector("bindhome-add-view");
  const advanced = panel.shadowRoot.querySelector("bindhome-advanced-view");
  assert.ok(home);
  assert.ok(add);
  assert.ok(advanced);

  const initialHomeHass = home.hass;
  const initialAddHass = add.hass;
  const initialAdvancedHass = advanced.hass;
  const initialAddCreated = add.onCreated;
  const initialHomeRefresh = home.refreshBindingData;
  const initialAdvancedRefresh = advanced.refreshBindingData;

  const homeHass = {
    language: "en",
    states: { "sensor.example": { state: "one" } },
    callWS: async () => ({}),
  };
  panel.hass = homeHass;
  await settle(panel);

  assert.equal(home.hass, homeHass);
  assert.notEqual(home.hass, initialHomeHass);
  assert.equal(add.hass, initialAddHass);
  assert.equal(advanced.hass, initialAdvancedHass);
  assert.equal(add.onCreated, initialAddCreated);
  assert.equal(home.refreshBindingData, initialHomeRefresh);
  assert.equal(advanced.refreshBindingData, initialAdvancedRefresh);

  panel._setAdvancedPinned(true);
  panel._navigate("advanced");
  await settle(panel);
  assert.equal(advanced.hass, homeHass);
  assert.equal(add.hass, initialAddHass);

  const advancedHass = {
    language: "en",
    states: { "sensor.example": { state: "two" } },
    callWS: async () => ({}),
  };
  panel.hass = advancedHass;
  await settle(panel);

  assert.equal(advanced.hass, advancedHass);
  assert.equal(home.hass, homeHass);
  assert.equal(add.hass, initialAddHass);
});
