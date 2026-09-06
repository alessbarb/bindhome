import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";
import { parseCsv, scopeInventoryCsv } from "../src/advanced/csv-inventory.js";

const window = new Window({ url: "http://localhost/bindhome/advanced" });
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
  Blob: window.Blob,
  URL: window.URL,
});

await import("../src/advanced/csv-inventory-tool.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("CSV scope filtering preserves quoted fields and embedded newlines", () => {
  const csv = [
    "bindhome_csv_version,asset_id,code,name,asset_type,area_id,area_name,capabilities",
    '1,a1,,"Lamp, north",light,kitchen,Kitchen,on_off',
    '1,a2,,"Two\nlines",socket,garage,Garage,on_off',
    "",
  ].join("\n");
  const scoped = scopeInventoryCsv(csv, { scope: "area", areaId: "kitchen", areas: [] });
  const rows = parseCsv(scoped);
  assert.equal(rows.length, 2);
  assert.equal(rows[1][3], "Lamp, north");
  assert.equal(rows[1][5], "kitchen");

  const floor = scopeInventoryCsv(csv, {
    scope: "floor",
    floorId: "ground",
    areas: [
      { area_id: "kitchen", floor_id: "ground" },
      { area_id: "garage", floor_id: "basement" },
    ],
  });
  assert.equal(parseCsv(floor)[1][1], "a1");
});

test("CSV panel validates then imports at the preview revision", async () => {
  const calls = [];
  const hass = {
    connection: {},
    callWS: async (message) => {
      calls.push(message);
      if (message.type === "bindhome/csv/validate") {
        return {
          valid: true,
          revision: 7,
          errors: [],
          preview: { created: 1, updated: 1, total: 2, changes: [
            { row: 2, operation: "create", name: "New socket", asset_id: null },
            { row: 3, operation: "update", name: "Lamp", asset_id: "a1" },
          ] },
        };
      }
      if (message.type === "bindhome/csv/import") {
        assert.equal(message.based_on_revision, 7);
        return {
          imported: true,
          valid: true,
          revision: 8,
          errors: [],
          preview: { created: 1, updated: 1, total: 2, changes: [] },
        };
      }
      if (message.type === "bindhome/assets/list") return { assets: [{ id: "a1" }, { id: "a2" }] };
      throw new Error(`Unexpected ${message.type}`);
    },
  };
  const element = document.createElement("bindhome-csv-inventory-tool");
  element.hass = hass;
  element.t = (key, vars = {}) => `${key}:${vars.created ?? vars.updated ?? vars.count ?? ""}`;
  element._csvText = "header\nrow";
  document.body.append(element);
  await element._validate();
  assert.equal(element._validation.revision, 7);

  let refreshed = null;
  element.addEventListener("assets-refreshed", (event) => { refreshed = event.detail; });
  await element._commit();
  await settle(element);
  assert.deepEqual(refreshed, [{ id: "a1" }, { id: "a2" }]);
  assert.equal(calls.some((call) => call.type === "bindhome/csv/import"), true);
  element.remove();
});

test("CSV panel renders row-level validation errors without enabling commit", async () => {
  const element = document.createElement("bindhome-csv-inventory-tool");
  element.t = (key, vars = {}) => `${key}:${vars.count ?? ""}`;
  element._validation = {
    valid: false,
    errors: [{ row: 4, field: "area_id", message: "Area missing" }],
  };
  document.body.append(element);
  await settle(element);
  const text = element.shadowRoot.textContent;
  assert.match(text, /Area missing/);
  assert.match(text, /area_id/);
  assert.equal(element.shadowRoot.querySelector("button.primary:last-child")?.textContent.includes("csv.commit"), false);
  element.remove();
});
