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

await import("../src/add/add-view.js");
await import("../src/home/home-view.js");
await import("../src/home/asset-delete-control.js");
await import("../src/bindhome-panel.js");

const t = (key, variables = {}) => {
  let value =
    {
      "nav.home": "Casa",
      "nav.add": "Añadir",
      "add.mode_label": "Modo de alta",
      "add.single_mode": "Un elemento",
      "add.bulk_mode": "Varios en una habitación",
      "home.navigation_label": "Casa",
      "common.no_floor": "Sin planta",
      "delete.title": "Eliminar elemento",
      "delete.prepare_body": "Preparar",
      "delete.prepare": "Revisar eliminación",
      "delete.loading": "Revisando",
      "delete.impact": "{relations}/{bindings}/{dependent}",
      "delete.hardware_safe": "No se borra hardware",
      "delete.logical_warning": "Lógica {entity_id}",
      "delete.confirm": "Eliminar definitivamente",
      "delete.deleting": "Eliminando",
      "delete.error": "Error",
      "common.cancel": "Cancelar",
    }[key] ?? key;
  for (const [name, replacement] of Object.entries(variables)) {
    value = value.replace(`{${name}}`, String(replacement));
  }
  return value;
};

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("Añadir exposes the existing atomic room inventory workflow in human mode", async () => {
  const element = document.createElement("bindhome-add-view");
  element.t = t;
  element.hass = { callWS: async () => ({}) };
  element.floors = [{ floor_id: "ground", name: "Baja" }];
  element.areas = [{ area_id: "living", name: "Salón", floor_id: "ground" }];
  element.assets = [{ id: "socket", name: "Enchufe", asset_type: "socket", area_id: "living" }];
  element.presets = [];
  document.body.append(element);
  await settle(element);

  element._mode = "bulk";
  await settle(element);

  const workflow = element.shadowRoot.querySelector("bindhome-inventory-workflow");
  assert.ok(workflow);
  assert.equal(workflow.floors, element.floors);
  assert.equal(workflow.areas, element.areas);
  assert.equal(workflow.assets, element.assets);
});

test("Casa floor headers collapse and expand their rooms", async () => {
  const element = document.createElement("bindhome-home-view");
  element.t = t;
  element.floors = [{ floor_id: "ground", name: "Planta baja", level: 0, icon: null }];
  element.areas = [{ area_id: "living", name: "Salón", floor_id: "ground", icon: null }];
  element.assets = [];
  document.body.append(element);
  await settle(element);

  let floor = element.shadowRoot.querySelector(".floor-title");
  assert.equal(floor.getAttribute("aria-expanded"), "true");
  assert.equal(element.shadowRoot.querySelectorAll(".area-row").length, 1);

  floor.click();
  await settle(element);
  floor = element.shadowRoot.querySelector(".floor-title");
  assert.equal(floor.getAttribute("aria-expanded"), "false");
  assert.equal(element.shadowRoot.querySelectorAll(".area-row").length, 0);

  floor.click();
  await settle(element);
  assert.equal(element.shadowRoot.querySelectorAll(".area-row").length, 1);
});

test("human deletion previews impact before the explicit cascade request", async () => {
  const calls = [];
  const element = document.createElement("bindhome-asset-delete-control");
  element.t = t;
  element.asset = { id: "light-1", name: "Luz" };
  element.hass = {
    callWS: async (message) => {
      calls.push(message);
      if (message.type === "bindhome/assets/delete_impact") {
        return {
          asset_id: "light-1",
          relations: [{ id: "r" }],
          owned_bindings: [{ id: "b" }],
          dependent_bindings: [{ id: "d" }],
          representation: { asset_id: "light-1", platform: "light" },
          logical_entity_id: "light.luz",
        };
      }
      return { deleted: true };
    },
  };
  document.body.append(element);
  await settle(element);

  await element._prepare();
  await settle(element);
  assert.deepEqual(calls.map((call) => call.type), ["bindhome/assets/delete_impact"]);
  assert.match(element.shadowRoot.textContent, /1\/1\/1/);
  assert.match(element.shadowRoot.textContent, /light\.luz/);

  let deleted = null;
  element.addEventListener("asset-deleted", (event) => (deleted = event.detail));
  await element._delete();
  assert.deepEqual(calls.map((call) => call.type), [
    "bindhome/assets/delete_impact",
    "bindhome/assets/delete_with_dependencies",
  ]);
  assert.equal(deleted, "light-1");
});

test("completing onboarding always lands in Casa", () => {
  window.localStorage.clear();
  const panel = document.createElement("bindhome-panel");
  panel._view = "add";
  panel._onboardingVisible = true;
  panel._completeOnboarding({ detail: { startInventory: true } });
  assert.equal(panel._view, "home");
  assert.equal(panel._contextAreaId, null);
  assert.equal(panel._onboardingVisible, false);
});
