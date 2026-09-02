import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
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
window.HTMLElement.prototype.scrollIntoView = () => {};
window.confirm = () => true;
if (!customElements.get("ha-icon")) customElements.define("ha-icon", class extends HTMLElement {});

await import("../src/inventory/inventory-workflow.js");
await import("../src/bindhome-panel.js");
const { createLocalizer } = await import("../src/i18n/localize.js");

const translationJson = JSON.parse(readFileSync(new URL("../../../translations/en.json", import.meta.url)));
function flatten(object, prefix = "component.bindhome.panel", result = {}) {
  for (const [key, value] of Object.entries(object)) typeof value === "object" ? flatten(value, `${prefix}.${key}`, result) : (result[`${prefix}.${key}`] = value);
  return result;
}
const englishResources = flatten(translationJson.panel);
const englishT = createLocalizer(englishResources, englishResources);
const spanishJson = JSON.parse(readFileSync(new URL("../../../translations/es.json", import.meta.url)));
const spanishResources = flatten(spanishJson.panel);

const presets = [
  { preset_id: "light_point", group: "electrical", asset_type: "light_point", default_name: "Light point", suggested_capabilities: ["on_off"] },
  { preset_id: "socket", group: "electrical", asset_type: "socket", default_name: "Socket", suggested_capabilities: [] },
];

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

async function roomWorkflow(hass, areas = [{ area_id: "living", name: "Living room", floor_id: "ground" }]) {
  const element = document.createElement("bindhome-inventory-workflow");
  element.hass = hass;
  element.t = englishT;
  element.presets = presets;
  element.floors = [{ floor_id: "ground", name: "Ground floor" }];
  element.areas = areas;
  element.assets = [];
  document.body.append(element);
  await settle(element);
  element._floorId = "ground";
  element._areaId = areas[0].area_id;
  element._continue();
  element._changeQuantity("socket", 2);
  await settle(element);
  return element;
}

test("routine hass replacement does not reload or unmount an edited room batch", async () => {
  const calls = [];
  const callWS = async (message) => {
    calls.push(message.type);
    if (message.type === "bindhome/presets/list") return { presets };
    if (message.type === "bindhome/assets/list") return { assets: [] };
    if (message.type === "bindhome/registry/get") return { assets: [], relations: [], bindings: [] };
    if (message.type === "config/floor_registry/list") return [{ floor_id: "ground", name: "Ground floor" }];
    if (message.type === "config/area_registry/list") return [{ area_id: "living", name: "Living room", floor_id: "ground" }];
    if (message.type === "frontend/get_translations") return { resources: englishResources };
    throw new Error(`Unexpected call: ${message.type}`);
  };
  const panel = document.createElement("bindhome-panel");
  panel.hass = { callWS, states: {} };
  document.body.append(panel);
  await settle(panel);
  const workflow = panel.shadowRoot.querySelector("bindhome-inventory-workflow");
  workflow._floorId = "ground";
  workflow._areaId = "living";
  workflow._continue();
  workflow._changeQuantity("socket", 1);
  const draft = workflow._activeDrafts[0];
  workflow._updateDraft(draft.key, { name: "Edited socket" });
  await settle(workflow);
  await panel._load(false);
  await settle(panel);
  assert.equal(panel.shadowRoot.querySelector("bindhome-inventory-workflow"), workflow);
  assert.equal(workflow._activeDrafts[0].name, "Edited socket");
  const initialCalls = calls.length;

  panel.hass = { callWS, states: { "sensor.example": { state: "updated" } } };
  await settle(panel);

  assert.equal(calls.length, initialCalls);
  assert.equal(panel.shadowRoot.querySelector("bindhome-inventory-workflow"), workflow);
  assert.equal(workflow._activeDrafts[0].name, "Edited socket");
});

test("changing HA language localizes presentation without touching an active batch", async () => {
  const calls = [];
  const callWS = async (message) => {
    calls.push(structuredClone(message));
    if (message.type === "frontend/get_translations") return { resources: message.language === "es" ? spanishResources : englishResources };
    if (message.type === "bindhome/presets/list") return { presets };
    if (message.type === "bindhome/assets/list") return { assets: [] };
    if (message.type === "bindhome/registry/get") return { assets: [], relations: [], bindings: [] };
    if (message.type === "config/floor_registry/list") return [{ floor_id: "ground", name: "Ground floor user name" }];
    if (message.type === "config/area_registry/list") return [{ area_id: "living", name: "Living room user name", floor_id: "ground" }];
    throw new Error(`Unexpected call: ${message.type}`);
  };
  const panel = document.createElement("bindhome-panel");
  panel.hass = { callWS, language: "en", states: {} };
  document.body.append(panel);
  await settle(panel);
  const workflow = panel.shadowRoot.querySelector("bindhome-inventory-workflow");
  workflow._floorId = "ground";
  workflow._areaId = "living";
  workflow._continue();
  workflow._changeQuantity("socket", 1);
  workflow._updateDraft(workflow._activeDrafts[0].key, { name: "My edited socket", asset_type: "socket", capabilities: ["on_off"] });
  await settle(workflow);
  const beforeDataCalls = calls.filter((call) => call.type !== "frontend/get_translations").length;

  panel.hass = { callWS, language: "es", states: { "sensor.language": { state: "es" } } };
  await settle(panel);
  await window.happyDOM.waitUntilComplete();
  await settle(panel);

  assert.equal(panel.shadowRoot.querySelector("bindhome-inventory-workflow"), workflow);
  assert.equal(workflow._activeDrafts[0].name, "My edited socket");
  assert.equal(workflow._activeDrafts[0].asset_type, "socket");
  assert.deepEqual(workflow._activeDrafts[0].capabilities, ["on_off"]);
  assert.match(panel.shadowRoot.textContent, /Inventario/);
  assert.match(workflow.shadowRoot.textContent, /Ground floor user name/);
  assert.match(workflow.shadowRoot.textContent, /Living room user name/);
  assert.equal(calls.filter((call) => call.type !== "frontend/get_translations").length, beforeDataCalls);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create_bulk").length, 0);
});

test("changing room requires discard and cannot retarget active drafts", async () => {
  const bulkCalls = [];
  const hass = { callWS: async (message) => {
    if (message.type === "bindhome/assets/create_bulk") { bulkCalls.push(message); return { assets: [] }; }
    if (message.type === "bindhome/assets/list") return { assets: [] };
    throw new Error(`Unexpected call: ${message.type}`);
  } };
  const element = await roomWorkflow(hass, [
    { area_id: "area-a", name: "Room A", floor_id: "ground" },
    { area_id: "area-b", name: "Room B", floor_id: "ground" },
  ]);
  const originalDrafts = element._activeDrafts;
  element._requestRoomChange();
  await settle(element);
  assert.equal(element._confirmRoomChange, true);
  assert.equal(element._areaId, "area-a");
  assert.deepEqual(element._activeDrafts, originalDrafts);
  element._confirmRoomChange = false;
  await settle(element);
  assert.equal(element._areaId, "area-a");
  assert.equal(bulkCalls.length, 0);

  element._requestRoomChange();
  element._discardAndChangeRoom();
  await settle(element);
  assert.equal(element._activeDrafts.length, 0);
  assert.equal(element._areaId, "");
  assert.equal(element._step, "select");
});

test("Back to quantities preserves every edited draft field", async () => {
  const element = await roomWorkflow({ callWS: async () => ({ assets: [] }) });
  const second = element._activeDrafts[1];
  element._updateDraft(second.key, { name: "Desk outlet", asset_type: "custom_outlet", code: "DESK-1", capabilities: ["custom_power"] });
  element._step = "review";
  await settle(element);
  element.shadowRoot.querySelector(".bottom-bar .button.secondary").click();
  await settle(element);
  assert.equal(element._step, "quantity");
  element._step = "review";
  await settle(element);
  assert.deepEqual(element._activeDrafts[1], { ...second, name: "Desk outlet", asset_type: "custom_outlet", code: "DESK-1", capabilities: ["custom_power"] });
});

test("refreshed presets do not rewrite active draft semantics", async () => {
  const element = await roomWorkflow({ callWS: async () => ({ assets: [] }) });
  const first = element._activeDrafts[0];
  element._updateDraft(first.key, { name: "Keep me", asset_type: "custom_socket", capabilities: ["custom_capability"] });
  element.presets = presets.map((preset) => preset.preset_id === "socket" ? { ...preset, default_name: "Changed backend name", asset_type: "changed_type", suggested_capabilities: ["changed"] } : preset);
  await settle(element);
  assert.equal(element._activeDrafts[0].name, "Keep me");
  assert.equal(element._activeDrafts[0].asset_type, "custom_socket");
  assert.deepEqual(element._activeDrafts[0].capabilities, ["custom_capability"]);
});

test("room workflow preserves and focuses a failed draft, then retries one atomic request", async () => {
  const calls = [];
  let shouldFail = true;
  let assets = [{ id: "existing", name: "Existing window", asset_type: "window", area_id: "living", capabilities: ["open_close"] }];
  const hass = {
    async callWS(message) {
      calls.push(structuredClone(message));
      if (message.type === "bindhome/assets/create_bulk") {
        if (shouldFail) {
          shouldFail = false;
          throw new Error('{"index":1,"field":"code","message":"Duplicate code"}');
        }
        const created = message.assets.map((item, index) => ({ ...item, id: `created-${index}` }));
        assets = [...assets, ...created];
        return { assets: created };
      }
      if (message.type === "bindhome/assets/list") return { assets };
      throw new Error(`Unexpected call: ${message.type}`);
    },
  };
  const element = document.createElement("bindhome-inventory-workflow");
  element.hass = hass;
  element.t = englishT;
  element.presets = presets;
  element.floors = [{ floor_id: "ground", name: "Ground floor" }];
  element.areas = [{ area_id: "living", name: "Living room", floor_id: "ground" }];
  element.assets = assets;
  document.body.append(element);
  await settle(element);

  element._floorId = "ground";
  element._areaId = "living";
  element._continue();
  element.requestUpdate();
  await settle(element);

  let increaseSocket = element.shadowRoot.querySelector('button[aria-label="Increase Socket quantity"]');
  if (!increaseSocket) {
    element.shadowRoot.querySelector(".group-toggle").click();
    await settle(element);
    increaseSocket = element.shadowRoot.querySelector('button[aria-label="Increase Socket quantity"]');
  }
  increaseSocket.click();
  increaseSocket.click();
  await settle(element);
  assert.match(element.shadowRoot.textContent, /2 assets/);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);

  assert.match(element.shadowRoot.textContent, /Nothing was saved/);
  assert.equal(element._activeDrafts.length, 2);
  const failedCode = element.shadowRoot.querySelector("#draft-socket-2-code");
  assert.equal(failedCode.getAttribute("aria-invalid"), "true");
  assert.equal(element.shadowRoot.activeElement, failedCode);

  const firstDraft = element._activeDrafts[0];
  element._updateDraft(firstDraft.key, { name: "First edited socket" });
  await settle(element);
  assert.equal(element._saveError.field, "code");
  const secondDraft = element._activeDrafts[1];
  element._updateDraft(secondDraft.key, { name: "Second edited socket" });
  await settle(element);
  assert.equal(element._saveError.field, "code");

  failedCode.value = "SOCKET-2";
  failedCode.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(element);
  assert.equal(element._saveError, null);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);

  assert.match(element.shadowRoot.textContent, /2 assets created/);
  assert.match(element.shadowRoot.textContent, /Only physical inventory was created/);
  assert.equal(element._activeDrafts.length, 0);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create_bulk").length, 2);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create").length, 0);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/list").length, 1);
});
