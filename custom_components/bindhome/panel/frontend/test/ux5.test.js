import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";
import {
  assetPresentation,
  categoryPresentation,
} from "../src/presentation/asset-types.js";
import {
  relationPresentation,
  contextualRelationActions,
} from "../src/presentation/relation-types.js";
import {
  buildHomeProjection,
  groupRoomAssets,
  searchAssets,
  NO_AREA,
  STALE_AREA,
} from "../src/state/home-selectors.js";

const t = (key, variables = {}) =>
  ({
    "presets.socket.name": "Enchufe",
    "presets.light_point.name": "Punto de luz",
    "categories.lighting": "Iluminación",
    "categories.electricity": "Electricidad",
    "categories.other": "Otros",
    "relations.feeds.incoming": "Recibe alimentación de",
    "relations.feeds.outgoing": "Alimenta",
    "topology.duplicate_relation": "Esta relación de topología ya existe.",
    "topology.sync_warning": "La relación se guardó, pero no se pudo actualizar.",
  })[key] ?? key.replace("{type}", variables.type ?? "");

test("known and custom Asset types have safe human presentation", () => {
  assert.deepEqual(assetPresentation(t, "socket"), {
    type: "socket",
    label: "Enchufe",
    icon: "mdi:power-socket-eu",
    category: "electricity",
    known: true,
  });
  assert.deepEqual(assetPresentation(t, "solar_inverter"), {
    type: "solar_inverter",
    label: "Solar inverter",
    icon: "mdi:cube-outline",
    category: "other",
    known: false,
  });
});

test("relation direction is humanized while unknown types remain extensible", () => {
  assert.equal(
    relationPresentation(t, "feeds", "incoming").label,
    "Recibe alimentación de",
  );
  assert.equal(relationPresentation(t, "feeds", "outgoing").label, "Alimenta");
  const custom = relationPresentation(t, "protects", "outgoing");
  assert.equal(custom.known, false);
  assert.equal(custom.type, "protects");
});

test("contextual topology actions are exact and preserve multiple valid semantics", () => {
  assert.deepEqual(
    contextualRelationActions("socket").map(({ direction, relationType }) => [direction, relationType]),
    [["outgoing", "feeds"], ["incoming", "feeds"]],
  );
  assert.deepEqual(
    contextualRelationActions("electrical_panel").map(({ direction, relationType }) => [direction, relationType]),
    [["outgoing", "feeds"], ["outgoing", "contains"]],
  );
  assert.deepEqual(
    contextualRelationActions("light_point").map(({ direction, relationType }) => [direction, relationType]),
    [["incoming", "feeds"]],
  );
  for (const type of ["junction_box", "manifold"]) {
    assert.deepEqual(
      contextualRelationActions(type).map(({ direction, relationType }) => [direction, relationType]),
      [["outgoing", "contains"]],
    );
  }
  for (const type of ["shutoff_valve", "valve"]) {
    assert.deepEqual(
      contextualRelationActions(type).map(({ direction, relationType }) => [direction, relationType]),
      [["outgoing", "controls"]],
    );
  }
  assert.equal(contextualRelationActions("custom_type").length, 0);
});

test("Casa projection preserves floors, no-floor rooms, unassigned and stale Assets", () => {
  const floors = [{ floor_id: "up", name: "Upper", level: 1, icon: null }];
  const areas = [
    { area_id: "bed", name: "Bedroom", floor_id: "up", icon: null },
    { area_id: "garage", name: "Garage", floor_id: null, icon: null },
  ];
  const assets = [
    { id: "1", name: "A", asset_type: "socket", area_id: "bed" },
    { id: "2", name: "B", asset_type: "socket" },
    { id: "3", name: "C", asset_type: "socket", area_id: "gone" },
  ];
  const projection = buildHomeProjection(floors, areas, assets);
  assert.deepEqual(
    projection.groups.map((group) => group.id),
    ["up", "__no_floor__"],
  );
  assert.equal(projection.assetsByArea.get("bed").length, 1);
  assert.equal(projection.assetsByArea.get(NO_AREA).length, 1);
  assert.equal(projection.assetsByArea.get(STALE_AREA).length, 1);
});

test("room groups are category ordered and unknown types stay visible", () => {
  const grouped = groupRoomAssets(t, [
    { id: "x", name: "Custom", asset_type: "custom" },
    { id: "l", name: "Light", asset_type: "light_point" },
    { id: "s", name: "Socket", asset_type: "socket" },
  ]);
  assert.deepEqual(
    grouped.map((group) => group.category),
    ["lighting", "electricity", "other"],
  );
  assert.equal(grouped.at(-1).assets[0].name, "Custom");
  assert.equal(categoryPresentation(t, "other").label, "Otros");
});

test("human search matches name, code, type, Area and Floor and remains bounded", () => {
  const floors = [
    { floor_id: "ground", name: "Planta baja", level: 0, icon: null },
  ];
  const areas = [
    { area_id: "kitchen", name: "Cocina", floor_id: "ground", icon: null },
  ];
  const assets = Array.from({ length: 40 }, (_, index) => ({
    id: String(index),
    name: index === 0 ? "Frigorífico" : `Elemento ${index}`,
    asset_type: index === 0 ? "socket" : "custom",
    code: index === 1 ? "ABC-1" : null,
    area_id: "kitchen",
  }));
  assert.equal(
    searchAssets(t, assets, areas, floors, "frigorífico")[0].asset.id,
    "0",
  );
  assert.equal(
    searchAssets(t, assets, areas, floors, "ABC-1")[0].asset.id,
    "1",
  );
  assert.ok(
    searchAssets(t, assets, areas, floors, "Enchufe").some(
      (item) => item.asset.id === "0",
    ),
  );
  assert.equal(searchAssets(t, assets, areas, floors, "Cocina").length, 30);
  assert.equal(searchAssets(t, assets, areas, floors, "").length, 8);
});

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
if (!customElements.get("ha-icon"))
  customElements.define("ha-icon", class extends HTMLElement {});
await import("../src/home/element-detail.js");
await import("../src/add/add-view.js");
await import("../src/search/search-view.js");
await import("../src/home/contextual-relation-editor.js");
await import("../src/bindhome-panel.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("human detail prioritizes name, Area, type, relations, passive state and technical disclosure", async () => {
  const element = document.createElement("bindhome-element-detail");
  element.t = t;
  element.asset = {
    id: "socket-1",
    name: "Enchufe frigorífico",
    asset_type: "socket",
    area_id: "kitchen",
    capabilities: [],
  };
  element.assets = [
    element.asset,
    { id: "circuit", name: "Circuito cocina", asset_type: "circuit" },
  ];
  element.areas = [{ area_id: "kitchen", name: "Cocina" }];
  element.registry = {
    relations: [
      {
        id: "r",
        source_asset_id: "circuit",
        target_asset_id: "socket-1",
        relation_type: "feeds",
      },
    ],
    representations: [],
  };
  document.body.append(element);
  await settle(element);
  const text = element.shadowRoot.textContent;
  assert.match(text, /Enchufe frigorífico/);
  assert.match(text, /Cocina/);
  assert.match(text, /Recibe alimentación de/);
  assert.match(text, /Circuito cocina/);
  assert.match(text, /detail.passive/);
  assert.ok(element.shadowRoot.querySelector("details"));
});

test("Añadir uses preset defaults and current Area without exposing capabilities", async () => {
  const calls = [];
  const element = document.createElement("bindhome-add-view");
  element.hass = {
    callWS: async (message) => {
      calls.push(message);
      return { assets: [{ id: "new", ...message.assets?.[0] }] };
    },
  };
  element.t = t;
  element.presets = [
    {
      preset_id: "socket",
      asset_type: "socket",
      default_name: "Socket",
      suggested_capabilities: ["on_off"],
    },
  ];
  element.areas = [{ area_id: "kitchen", name: "Cocina" }];
  element.contextAreaId = "kitchen";
  document.body.append(element);
  await settle(element);
  element._choose(element.presets[0]);
  await settle(element);
  assert.equal(element._areaId, "kitchen");
  assert.doesNotMatch(element.shadowRoot.textContent, /on_off/);
  await element._submit({ preventDefault() {} });
  assert.deepEqual(calls[0].assets[0], {
    name: "Enchufe",
    asset_type: "socket",
    capabilities: ["on_off"],
    area_id: "kitchen",
  });
});

test("failed Añadir preserves the draft and duplicate submission is blocked", async () => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  let count = 0;
  const element = document.createElement("bindhome-add-view");
  element.hass = {
    callWS: async () => {
      count += 1;
      await pending;
      throw new Error("conflict");
    },
  };
  element.t = t;
  element._preset = {
    preset_id: "socket",
    asset_type: "socket",
    default_name: "Socket",
    suggested_capabilities: [],
  };
  element._name = "Mi enchufe";
  const one = element._submit({ preventDefault() {} });
  const two = element._submit({ preventDefault() {} });
  assert.equal(count, 1);
  release();
  await Promise.all([one, two]);
  assert.equal(element._name, "Mi enchufe");
  assert.equal(element._saving, false);
  assert.ok(element._error);
});

test("Buscar result selection emits the stable Asset identity", async () => {
  const element = document.createElement("bindhome-search-view");
  element.t = t;
  element.assets = [
    {
      id: "a",
      name: "Enchufe frigorífico",
      asset_type: "socket",
      area_id: "k",
    },
  ];
  element.areas = [{ area_id: "k", name: "Cocina", floor_id: null }];
  let selected = null;
  element.addEventListener("open-asset", (event) => (selected = event.detail));
  document.body.append(element);
  await settle(element);
  element.shadowRoot.querySelector(".result").click();
  assert.equal(selected, "a");
});

function panelFixture() {
  const panel = document.createElement("bindhome-panel");
  panel._loading = false;
  panel._initialized = true;
  panel._t = t;
  panel._floors = [{ floor_id: "ground", name: "Planta baja", level: 0, icon: null }];
  panel._areas = [
    { area_id: "kitchen", name: "Cocina", floor_id: "ground", icon: null },
    { area_id: "garage", name: "Garaje", floor_id: "ground", icon: null },
  ];
  panel._assets = [
    { id: "a", name: "Circuito cocina", asset_type: "circuit", area_id: "kitchen", capabilities: [] },
    { id: "c", name: "Enchufe cocina", asset_type: "socket", area_id: "kitchen", capabilities: [] },
    { id: "b", name: "Cuadro general", asset_type: "electrical_panel", area_id: "garage", capabilities: [] },
    { id: "n", name: "Elemento sin habitación", asset_type: "custom", capabilities: [] },
    { id: "s", name: "Elemento obsoleto", asset_type: "custom", area_id: "deleted", capabilities: [] },
  ];
  panel._registry = {
    assets: panel._assets,
    relations: [
      { id: "r", source_asset_id: "a", target_asset_id: "b", relation_type: "feeds" },
      { id: "rc", source_asset_id: "a", target_asset_id: "c", relation_type: "feeds" },
      { id: "rn", source_asset_id: "a", target_asset_id: "n", relation_type: "feeds" },
      { id: "rs", source_asset_id: "a", target_asset_id: "s", relation_type: "feeds" },
    ],
    bindings: [],
    representations: [],
  };
  document.body.append(panel);
  return panel;
}

async function settlePanel(panel) {
  await settle(panel);
  const home = panel.shadowRoot.querySelector("bindhome-home-view");
  if (home) await settle(home);
  return home;
}

test("full panel owns Casa Area and Asset back navigation", async () => {
  const panel = panelFixture();
  let home = await settlePanel(panel);
  home.shadowRoot.querySelector(".area-row").click();
  home = await settlePanel(panel);
  assert.equal(panel._selectedAreaId, "kitchen");
  home.shadowRoot.querySelector(".room .back").click();
  home = await settlePanel(panel);
  assert.equal(panel._selectedAreaId, null);
  assert.equal(home.shadowRoot.querySelector(".room .empty").textContent, "home.choose_room");

  home.shadowRoot.querySelector(".area-row").click();
  home = await settlePanel(panel);
  home.shadowRoot.querySelector(".asset-row").click();
  home = await settlePanel(panel);
  let detail = home.shadowRoot.querySelector("bindhome-element-detail");
  await settle(detail);
  detail.shadowRoot.querySelector(".back").click();
  home = await settlePanel(panel);
  assert.equal(panel._selectedAreaId, "kitchen");
  assert.equal(panel._selectedAssetId, null);
  home.shadowRoot.querySelector(".room .back").click();
  await settlePanel(panel);
  assert.deepEqual([panel._selectedAreaId, panel._selectedAssetId], [null, null]);
});

test("top-level Home Search Home preserves one coherent Casa navigation state", async () => {
  const panel = panelFixture();
  let home = await settlePanel(panel);
  home.shadowRoot.querySelector(".area-row").click();
  home = await settlePanel(panel);
  home.shadowRoot.querySelector(".asset-row").click();
  await settlePanel(panel);
  panel._navigate("search");
  await settlePanel(panel);
  panel._navigate("home");
  home = await settlePanel(panel);
  assert.equal(panel._selectedAreaId, "kitchen");
  assert.equal(panel._selectedAssetId, "a");
  assert.ok(home.shadowRoot.querySelector("bindhome-element-detail"));
});

test("relation navigation derives same, cross, absent and stale target Areas", async () => {
  const panel = panelFixture();
  await settlePanel(panel);
  const cases = [
    ["c", "kitchen"], ["b", "garage"], ["n", NO_AREA], ["s", STALE_AREA],
  ];
  for (const [assetId, areaId] of cases) {
    panel._homeNavigate({ detail: { areaId: "kitchen", assetId: "a" } });
    let home = await settlePanel(panel);
    let detail = home.shadowRoot.querySelector("bindhome-element-detail");
    await settle(detail);
    const targetName = panel._assets.find((asset) => asset.id === assetId).name;
    const relationButton = [...detail.shadowRoot.querySelectorAll(".relation button")]
      .find((button) => button.textContent.trim() === targetName);
    assert.ok(relationButton);
    relationButton.click();
    home = await settlePanel(panel);
    assert.equal(panel._selectedAreaId, areaId);
    detail = home.shadowRoot.querySelector("bindhome-element-detail");
    await settle(detail);
    detail.shadowRoot.querySelector(".back").click();
    await settlePanel(panel);
    assert.equal(panel._selectedAreaId, areaId);
  }
});

function contextualFixture(callWS, onRefresh = async () => {}) {
  const editor = document.createElement("bindhome-contextual-relation-editor");
  editor.hass = { callWS };
  editor.t = t;
  editor.asset = { id: "a", name: "A", asset_type: "socket" };
  editor.assets = [editor.asset, { id: "b", name: "B", asset_type: "device" }];
  editor.areas = [];
  editor.action = { direction: "outgoing", relationType: "feeds", labelKey: "x" };
  editor.onRefresh = onRefresh;
  document.body.append(editor);
  return editor;
}

test("contextual Relation conflict is localized and preserves its draft", async () => {
  const editor = contextualFixture(async () => { throw { code: "conflict", message: "Already exists" }; });
  await settle(editor);
  editor._target = "b";
  editor._query = "Bee";
  await editor._save();
  assert.equal(editor._error, "Esta relación de topología ya existe.");
  assert.deepEqual([editor._target, editor._query], ["b", "Bee"]);
});

test("contextual Relation write failure preserves complete retryable draft", async () => {
  const editor = contextualFixture(async () => { throw new Error("write failed"); });
  await settle(editor);
  editor._target = "b";
  editor._query = "B";
  await editor._save();
  assert.deepEqual([editor._target, editor._query, editor._committed], ["b", "B", false]);
  assert.match(editor._error, /write failed/);
});

test("committed contextual Relation with refresh failure cannot be resubmitted", async () => {
  let writes = 0;
  const editor = contextualFixture(async () => { writes += 1; }, async () => { throw new Error("refresh"); });
  let warning = null;
  let done = 0;
  editor.addEventListener("sync-warning", (event) => (warning = event.detail));
  editor.addEventListener("done", () => (done += 1));
  await settle(editor);
  editor._target = "b";
  await editor._save();
  await editor._save();
  assert.equal(writes, 1);
  assert.equal(done, 1);
  assert.equal(warning, "La relación se guardó, pero no se pudo actualizar.");
  assert.equal(editor._committed, true);
});

test("contextual Relation identity change blocks late completion contamination", async () => {
  let release;
  const pending = new Promise((resolve) => (release = resolve));
  const editor = contextualFixture(async () => pending);
  let done = 0;
  editor.addEventListener("done", () => (done += 1));
  await settle(editor);
  editor._target = "b";
  const save = editor._save();
  editor.asset = { id: "other", name: "Other", asset_type: "socket" };
  editor.action = { direction: "incoming", relationType: "feeds", labelKey: "y" };
  await settle(editor);
  release();
  await save;
  assert.deepEqual([done, editor._target, editor._query, editor._error], [0, "", "", null]);
});

test("contextual Relation identity change blocks late rejection contamination", async () => {
  let rejectWrite;
  const pending = new Promise((_, reject) => (rejectWrite = reject));
  const editor = contextualFixture(async () => pending);
  await settle(editor);
  editor._target = "b";
  const save = editor._save();
  editor.asset = { id: "other", name: "Other", asset_type: "socket" };
  await settle(editor);
  rejectWrite(new Error("late failure"));
  await save;
  assert.equal(editor._error, null);
  assert.equal(editor._saving, false);
});

test("contextual Relation identity change blocks late refresh success and rejection", async () => {
  for (const rejectRefresh of [false, true]) {
    let finishRefresh;
    let markRefreshStarted;
    const refreshStarted = new Promise((resolve) => (markRefreshStarted = resolve));
    const refresh = new Promise((resolve, reject) => {
      finishRefresh = () => rejectRefresh ? reject(new Error("late refresh")) : resolve();
    });
    const editor = contextualFixture(async () => {}, async () => {
      markRefreshStarted();
      return refresh;
    });
    let done = 0;
    let warnings = 0;
    editor.addEventListener("done", () => (done += 1));
    editor.addEventListener("sync-warning", () => (warnings += 1));
    await settle(editor);
    editor._target = "b";
    const save = editor._save();
    await refreshStarted;
    editor.action = { direction: "incoming", relationType: "feeds", labelKey: "new" };
    await settle(editor);
    finishRefresh();
    await save;
    assert.deepEqual([done, warnings, editor._error], [0, 0, null]);
  }
});

test("Edit opens the exact human Asset in the mounted technical editor", async () => {
  const panel = panelFixture();
  panel._homeNavigate({ detail: { areaId: "garage", assetId: "b" } });
  let home = await settlePanel(panel);
  const detail = home.shadowRoot.querySelector("bindhome-element-detail");
  await settle(detail);
  detail.shadowRoot.querySelector(".header .text-button").click();
  await settle(panel);
  const advanced = panel.shadowRoot.querySelector("bindhome-advanced-view");
  await settle(advanced);
  const section = advanced.shadowRoot.querySelector("bindhome-inventory-section");
  await settle(section);
  const browser = section.shadowRoot.querySelector("bindhome-inventory-browser");
  await settle(browser);
  assert.equal(panel._view, "advanced");
  assert.equal(browser._selectedAssetId, "b");
  assert.equal(browser.shadowRoot.querySelector("bindhome-asset-detail-editor").asset.id, "b");
});

async function advancedBrowser(panel) {
  await settle(panel);
  const advanced = panel.shadowRoot.querySelector("bindhome-advanced-view");
  await settle(advanced);
  const section = advanced.shadowRoot.querySelector("bindhome-inventory-section");
  await settle(section);
  const browser = section.shadowRoot.querySelector("bindhome-inventory-browser");
  await settle(browser);
  return browser;
}

test("repeated Human Edit is a fresh request after manual Advanced navigation", async () => {
  const panel = panelFixture();
  panel._homeNavigate({ detail: { areaId: "kitchen", assetId: "a" } });
  let home = await settlePanel(panel);
  let detail = home.shadowRoot.querySelector("bindhome-element-detail");
  await settle(detail);
  detail.shadowRoot.querySelector(".header .text-button").click();
  let browser = await advancedBrowser(panel);
  assert.equal(browser._selectedAssetId, "a");

  browser._openAsset("b");
  await settle(browser);
  assert.equal(browser._selectedAssetId, "b");

  panel._navigate("home");
  home = await settlePanel(panel);
  assert.equal(panel._advancedAssetId, null);
  detail = home.shadowRoot.querySelector("bindhome-element-detail");
  await settle(detail);
  detail.shadowRoot.querySelector(".header .text-button").click();
  browser = await advancedBrowser(panel);
  assert.equal(browser._selectedAssetId, "a");
});

test("normal Advanced Casa Advanced navigation preserves technical selection", async () => {
  const panel = panelFixture();
  panel._navigate("advanced");
  let browser = await advancedBrowser(panel);
  browser._openAsset("b");
  await settle(browser);

  panel._navigate("home");
  await settlePanel(panel);
  panel._navigate("advanced");
  browser = await advancedBrowser(panel);
  assert.equal(panel._advancedAssetId, null);
  assert.equal(browser._selectedAssetId, "b");
});

test("human device derivation finds non-first bindings and deduplicates one entity", async () => {
  const detail = document.createElement("bindhome-element-detail");
  detail.t = t;
  detail.asset = { id: "climate", name: "Clima", asset_type: "air_conditioner", capabilities: ["on_off", "temperature", "mode"] };
  detail.assets = [detail.asset];
  detail.registry = { relations: [], representations: [] };
  detail.bindingStatuses = { records: [
    { asset_id: "climate", capability: "temperature", role: "primary", status: "configured", entity_id: "climate.room", binding: { id: "b1", asset_id: "climate", capability: "temperature", role: "primary", entity_id: "climate.room" } },
    { asset_id: "climate", capability: "mode", role: "primary", status: "configured", entity_id: "select.room_mode", binding: { id: "b2", asset_id: "climate", capability: "mode", role: "primary", entity_id: "select.room_mode" } },
  ], summary: {} };
  detail.entityRegistry = [
    { entity_id: "climate.room", device_id: "hvac-device" },
    { entity_id: "select.room_mode", device_id: "hvac-device" },
  ];
  document.body.append(detail);
  await settle(detail);
  const editors = detail.shadowRoot.querySelectorAll("bindhome-primary-connection-editor");
  assert.equal(editors.length, 1);
  assert.equal(editors[0].capability, "temperature");
  assert.equal(editors[0].status.binding.id, "b1");
  assert.equal(editors[0].showEntityId, false);
});

test("mobile room Add action keeps a foreground plus while retaining its desktop label", async () => {
  const home = document.createElement("bindhome-home-view");
  home.t = t;
  home.selectedAreaId = "kitchen";
  home.areas = [{ area_id: "kitchen", name: "Cocina", floor_id: null }];
  document.body.append(home);
  await settle(home);
  const action = home.shadowRoot.querySelector(".room-head .primary");
  assert.equal(action.querySelector("ha-icon").getAttribute("icon"), "mdi:plus");
  assert.match(action.textContent, /home\.add_element/);
  const cssText = home.constructor.styles.map((style) => style.cssText).join("\n");
  assert.match(cssText, /\.room-head > ha-icon/);
  assert.match(cssText, /\.room-head \.primary ha-icon\s*\{[^}]*var\(--text-primary-color, #fff\)/s);
  assert.match(cssText, /@media \(max-width: 760px\)[\s\S]*\.room-head \.primary span\s*\{[^}]*display:\s*none/s);
});

test("human Add copy uses room language and never exposes preset terminology", () => {
  for (const [language, expected] of Object.entries({
    es: ["Añade un elemento físico a tu casa.", "Habitación", "Sin habitación"],
    en: ["Add a physical element to your home.", "Room", "No room"],
  })) {
    const json = JSON.parse(readFileSync(new URL(`../../../translations/${language}.json`, import.meta.url)));
    assert.deepEqual(
      [json.common.panel_add_intro, json.common.panel_add_room, json.common.panel_add_no_room],
      expected,
    );
    assert.doesNotMatch(json.common.panel_add_intro, /preset/i);
  }
});

test("human device derivation distinguishes passive, unbound and first-bound Assets", async () => {
  const detail = document.createElement("bindhome-element-detail");
  detail.asset = { id: "x", capabilities: [] };
  detail.bindingStatuses = { records: [], summary: {} };
  assert.deepEqual(detail._devices(), []);
  detail.asset = { id: "x", capabilities: ["on_off"] };
  assert.equal(detail._devices()[0].status, null);
  detail.bindingStatuses.records = [{ asset_id: "x", capability: "on_off", role: "primary", entity_id: "switch.x", binding: { id: "b", entity_id: "switch.x" } }];
  assert.equal(detail._devices()[0].status.binding.id, "b");
});

test("global Add clears stale room launch context deterministically", async () => {
  const add = document.createElement("bindhome-add-view");
  add.contextAreaId = "kitchen";
  document.body.append(add);
  await settle(add);
  assert.equal(add._areaId, "kitchen");
  add.contextAreaId = null;
  await settle(add);
  assert.equal(add._areaId, "");
});
