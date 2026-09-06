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

await import("../src/home/home-view.js");
await import("../src/bindhome-panel.js");

const t = (key, values = {}) => {
  const templates = {
    "home.room_count_one": "{count} room",
    "home.room_count_other": "{count} rooms",
    "home.room_empty": "Empty room",
    "home.add_first_element": "Add first element",
    "home.add_element": "Add element",
    "home.element_count": "{count} elements",
  };
  let value = templates[key] ?? key;
  for (const [name, replacement] of Object.entries(values)) value = value.replace(`{${name}}`, String(replacement));
  return value;
};
async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}
function homeFixture() {
  const element = document.createElement("bindhome-home-view");
  element.t = t;
  element.hass = { user: { id: "user-a" } };
  element.floors = [{ floor_id: "ground", name: "Ground", level: 0, icon: null }];
  element.areas = [{ area_id: "living", name: "Living", floor_id: "ground", icon: "mdi:sofa" }];
  element.assets = [];
  document.body.append(element);
  return element;
}

test("floor uses HA icon when present and level-aware fallback otherwise", async () => {
  const element = homeFixture();
  element.floors = [
    { floor_id: "ground", name: "Ground", level: 0, icon: null },
    { floor_id: "upper", name: "Upper", level: 1, icon: "mdi:stairs" },
  ];
  element.areas = [
    { area_id: "living", name: "Living", floor_id: "ground", icon: null },
    { area_id: "bed", name: "Bed", floor_id: "upper", icon: null },
  ];
  await settle(element);
  const icons = [...element.shadowRoot.querySelectorAll(".floor-title > ha-icon:first-child")].map((icon) => icon.getAttribute("icon"));
  assert.deepEqual(icons, ["mdi:home-floor-0", "mdi:stairs"]);
  assert.match(element.shadowRoot.querySelector(".floor-title .count").textContent, /1 room/);
});

test("room header uses the authoritative HA Area icon", async () => {
  const element = homeFixture();
  element.selectedAreaId = "living";
  await settle(element);
  assert.equal(element.shadowRoot.querySelector(".room-head > ha-icon").getAttribute("icon"), "mdi:sofa");
});

test("collapsed floors persist per Home Assistant user and expand naturally", async () => {
  window.localStorage.clear();
  const first = homeFixture();
  await settle(first);
  first._toggleFloor("ground");
  await settle(first);
  assert.equal(first.shadowRoot.querySelector(".floor-title").getAttribute("aria-expanded"), "false");
  assert.deepEqual(JSON.parse(window.localStorage.getItem("bindhome.home-collapsed-floors.user-a")), ["ground"]);

  const second = homeFixture();
  await settle(second);
  assert.equal(second.shadowRoot.querySelector(".floor-title").getAttribute("aria-expanded"), "false");
  second._toggleFloor("ground");
  await settle(second);
  assert.deepEqual(JSON.parse(window.localStorage.getItem("bindhome.home-collapsed-floors.user-a")), []);
});

test("empty room offers first-element CTA for the selected HA Area", async () => {
  const element = homeFixture();
  element.selectedAreaId = "living";
  let areaId = null;
  element.addEventListener("add-in-area", (event) => { areaId = event.detail; });
  await settle(element);
  const button = element.shadowRoot.querySelector(".empty-room button.primary");
  assert.equal(button.textContent.trim(), "Add first element");
  button.click();
  assert.equal(areaId, "living");
});

test("selected room is exposed visually and accessibly", async () => {
  const element = homeFixture();
  element.selectedAreaId = "living";
  await settle(element);
  const room = element.shadowRoot.querySelector(".area-row.selected");
  assert.ok(room);
  assert.equal(room.getAttribute("aria-current"), "location");
  assert.equal(room.getAttribute("aria-pressed"), "true");
});

test("refresh control exposes reactive busy disabled and tooltip state", async () => {
  const panel = document.createElement("bindhome-panel");
  panel._loading = false;
  panel._initialized = true;
  panel._translationLanguage = "en";
  panel._t = (key) => key;
  panel._refreshing = true;
  panel.hass = { language: "en", user: { id: "user-a" }, states: {}, callWS: async () => ({}) };
  document.body.append(panel);
  await settle(panel);
  const refresh = panel.shadowRoot.querySelector("button.refresh");
  assert.equal(refresh.disabled, true);
  assert.equal(refresh.getAttribute("aria-busy"), "true");
  assert.equal(refresh.getAttribute("aria-label"), "shell.refreshing_label");
  assert.equal(refresh.getAttribute("title"), "shell.refreshing_label");
  assert.equal(refresh.querySelector("ha-icon").classList.contains("spinning"), true);
});
