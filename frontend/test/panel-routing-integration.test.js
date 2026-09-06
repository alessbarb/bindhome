import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/bindhome/home" });
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
if (!customElements.get("ha-icon"))
  customElements.define("ha-icon", class extends HTMLElement {});
if (!customElements.get("ha-switch"))
  customElements.define("ha-switch", class extends HTMLElement {});

await import("../src/bindhome-panel.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function fixture(path = "/home", search = "") {
  window.history.replaceState(null, "", `/bindhome${path}${search}`);
  const panel = document.createElement("bindhome-panel");
  panel.hass = {
    user: { id: "user", is_admin: true },
    language: "en",
    callWS: async () => [],
    connection: null,
  };
  panel.route = { prefix: "/bindhome", path };
  panel._loading = false;
  panel._initialized = true;
  panel._t = (key) => key;
  panel._floors = [{ floor_id: "ground", name: "Ground", level: 0, icon: null }];
  panel._areas = [{ area_id: "kitchen", name: "Kitchen", floor_id: "ground", icon: null }];
  panel._assets = [
    { id: "socket-1", name: "Socket", asset_type: "socket", area_id: "kitchen", capabilities: [] },
  ];
  panel._registry = { assets: panel._assets, relations: [], bindings: [], representations: [] };
  document.body.append(panel);
  return panel;
}

test("deep Home URL restores Area and Asset selection", async () => {
  const panel = fixture("/home/kitchen/socket-1");
  await settle(panel);
  assert.equal(panel._view, "home");
  assert.equal(panel._selectedAreaId, "kitchen");
  assert.equal(panel._selectedAssetId, "socket-1");
});

test("top-level navigation writes canonical history without discarding Home selection", async () => {
  const panel = fixture("/home/kitchen/socket-1");
  await settle(panel);
  panel._navigate("search");
  assert.equal(window.location.pathname, "/bindhome/search");
  assert.equal(panel._selectedAreaId, "kitchen");
  assert.equal(panel._selectedAssetId, "socket-1");
  panel.route = { prefix: "/bindhome", path: "/search" };
  await settle(panel);
  assert.equal(panel._view, "search");
});

test("search query is URL state and replaces history while typing", async () => {
  const panel = fixture("/search", "?q=socket");
  await settle(panel);
  assert.equal(panel._searchQuery, "socket");
  const search = panel.shadowRoot.querySelector("bindhome-search-view");
  await settle(search);
  assert.equal(search.query, "socket");
  const input = search.shadowRoot.querySelector("input");
  input.value = "socket kitchen";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(search);
  assert.equal(window.location.search, "?q=socket+kitchen");
  assert.equal(panel._searchQuery, "socket kitchen");
});

test("read-only user cannot deep-link into admin-only views", async () => {
  const panel = fixture("/add");
  panel.hass = { ...panel.hass, user: { id: "user", is_admin: false } };
  await settle(panel);
  assert.equal(panel._view, "home");
  assert.equal(window.location.pathname, "/bindhome/home");
});

test("admin Advanced deep link is addressable even when tab is not pinned", async () => {
  const panel = fixture("/advanced/socket-1");
  panel._advancedPinned = false;
  await settle(panel);
  assert.equal(panel._view, "advanced");
  assert.equal(panel._advancedAssetId, "socket-1");
  const button = panel.shadowRoot.querySelector("button.advanced");
  assert.equal(button.disabled, false);
});

test("route changes emulate browser Back without remounting the shell", async () => {
  const panel = fixture("/home/kitchen/socket-1");
  await settle(panel);
  const homeBefore = panel.shadowRoot.querySelector("bindhome-home-view");
  panel._navigate("search");
  panel.route = { prefix: "/bindhome", path: "/search" };
  await settle(panel);
  window.history.back();
  await window.happyDOM.waitUntilComplete();
  panel.route = { prefix: "/bindhome", path: "/home/kitchen/socket-1" };
  await settle(panel);
  assert.equal(panel._view, "home");
  assert.equal(panel._selectedAssetId, "socket-1");
  assert.equal(panel.shadowRoot.querySelector("bindhome-home-view"), homeBefore);
});
