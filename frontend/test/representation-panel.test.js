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
});

const { createBindHomeApi } = await import("../src/api/bindhome-api.js");
await import("../src/home/representation-manager.js");

function createElement({ status = null, representation = null, entityRegistry = [] } = {}) {
  const element = document.createElement("bindhome-representation-manager");
  element.t = (key, vars = {}) => `${key}${vars.platform ? `:${vars.platform}` : ""}`;
  element.asset = { id: "asset-light", name: "Kitchen ceiling", asset_type: "light_fixture", capabilities: ["on_off"] };
  element.registry = { representations: representation ? [representation] : [] };
  element.bindingStatuses = { records: status ? [status] : [], summary: {} };
  element.entityRegistry = entityRegistry;
  return element;
}

function resolvedStatus(entityId = "light.kitchen") {
  return {
    asset_id: "asset-light",
    capability: "on_off",
    role: "primary",
    status: "resolved",
    config_valid: true,
    runtime_available: true,
    entity_id: entityId,
    binding: { id: "binding-1", asset_id: "asset-light", capability: "on_off", role: "primary", entity_id: entityId },
  };
}

test("creation is disabled when the required on_off primary Binding is absent", async () => {
  const element = createElement();
  document.body.append(element);
  await element.updateComplete;
  assert.equal(element._hasRequiredBinding(), false);
  assert.equal(element.shadowRoot.querySelector("button.primary").disabled, true);
  assert.match(element.shadowRoot.textContent, /representation.binding_required/);
  element.remove();
});

test("existing logical entity is found by internal stable identity but only public entity_id is shown", async () => {
  const element = createElement({
    status: resolvedStatus(),
    representation: { asset_id: "asset-light", platform: "light" },
    entityRegistry: [
      { entity_id: "light.kitchen_ceiling", platform: "bindhome", unique_id: "bindhome_asset-light" },
    ],
  });
  document.body.append(element);
  await element.updateComplete;
  const text = element.shadowRoot.textContent;
  assert.match(text, /light\.kitchen_ceiling/);
  assert.doesNotMatch(text, /bindhome_asset-light/);
  assert.match(text, /representation.light_fidelity/);
  element.remove();
});

test("non-light backing target explicitly warns that the logical light carries ON/OFF only", async () => {
  const element = createElement({ status: resolvedStatus("switch.relay") });
  document.body.append(element);
  await element.updateComplete;
  assert.match(element.shadowRoot.textContent, /representation.onoff_only_warning/);
  element.remove();
});

test("stale required Binding remains reviewable but is called out before exposure", async () => {
  const status = resolvedStatus("light.removed");
  status.status = "entity_not_found";
  status.config_valid = false;
  const element = createElement({ status });
  document.body.append(element);
  await element.updateComplete;
  assert.equal(element._hasRequiredBinding(), true);
  assert.equal(element.shadowRoot.querySelector("button.primary").disabled, false);
  assert.match(element.shadowRoot.textContent, /representation.stale_binding_warning/);
  element.remove();
});

test("create and confirmed remove use the existing Representation WebSocket contracts", async () => {
  const calls = [];
  const hass = {
    connection: {},
    callWS: async (message) => {
      calls.push(message);
      if (message.type === "bindhome/registry/get") return { revision: 17, assets: [], relations: [], bindings: [], representations: [] };
      if (message.type === "bindhome/representations/set") return { revision: 18, representation: { asset_id: "asset-light", platform: "light" } };
      if (message.type === "bindhome/representations/delete") return { revision: 19, deleted: true };
      if (message.type === "config/entity_registry/list") return [];
      throw new Error(`Unexpected ${message.type}`);
    },
  };
  await createBindHomeApi(hass).getRegistry();
  const element = createElement({ status: resolvedStatus() });
  element.hass = hass;
  element.refreshBindingData = async () => {};
  await element._createRepresentation();
  assert.deepEqual(calls.find((call) => call.type === "bindhome/representations/set"), {
    type: "bindhome/representations/set",
    asset_id: "asset-light",
    platform: "light",
    based_on_revision: 17,
  });
  assert.equal(element._representation().platform, "light");
  element._confirmRemove = true;
  await element._removeRepresentation();
  assert.deepEqual(calls.find((call) => call.type === "bindhome/representations/delete"), {
    type: "bindhome/representations/delete",
    asset_id: "asset-light",
    based_on_revision: 18,
  });
  assert.equal(element._representation(), null);
});

test("read-only mode explains Representation without exposing mutation controls", async () => {
  const element = createElement({ status: resolvedStatus(), representation: { asset_id: "asset-light", platform: "light" } });
  element.readOnly = true;
  document.body.append(element);
  await element.updateComplete;
  assert.equal(element.shadowRoot.querySelectorAll(".actions button").length, 0);
  assert.match(element.shadowRoot.textContent, /representation.exposed_as/);
  element.remove();
});
