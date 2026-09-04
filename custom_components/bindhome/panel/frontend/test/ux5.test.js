import assert from "node:assert/strict";
import test from "node:test";
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

test("contextual topology actions reuse existing directed Relation types", () => {
  assert.ok(
    contextualRelationActions("socket").some(
      (action) =>
        action.relationType === "feeds" && action.direction === "incoming",
    ),
  );
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
