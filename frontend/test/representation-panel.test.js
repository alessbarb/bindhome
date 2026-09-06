import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";
import { createBindHomeApi } from "../src/api/bindhome-api.js";
const window = new Window();
Object.assign(globalThis, { window, document: window.document, customElements: window.customElements, HTMLElement: window.HTMLElement, ShadowRoot: window.ShadowRoot, Document: window.Document, CSSStyleSheet: window.CSSStyleSheet, Event: window.Event, CustomEvent: window.CustomEvent });
await import("../src/home/element-detail.js");
async function fixture() {
  const calls = [];
  const element = document.createElement("bindhome-representation-control");
  element.asset = { id: "a1", name: "Ceiling", capabilities: ["on_off"] };
  element.registry = { revision: 7, representations: [], representation_entities: {} };
  element.bindingStatuses = { records: [{ asset_id: "a1", capability: "on_off", role: "primary", config_valid: true, runtime_available: true, entity_id: "light.hardware" }] };
  element.hass = { user: { is_admin: true }, connection: {}, states: {}, callWS: async (message) => { calls.push(message); return { revision: 8 }; } };
  element.onRefresh = async () => {};
  document.body.append(element);
  await element.updateComplete;
  return { element, calls };
}
test("normal element detail exposes the control outside technical details", async () => {
  const detail = document.createElement("bindhome-element-detail");
  detail.asset = { id: "a1", name: "Ceiling", asset_type: "light_point", capabilities: ["on_off"] };
  document.body.append(detail); await detail.updateComplete;
  const control = detail.shadowRoot.querySelector("bindhome-representation-control");
  assert.ok(control); assert.equal(control.closest("details"), null); detail.remove();
});
test("creation requires capability and configuration-valid primary on/off Binding", async () => {
  const { element, calls } = await fixture();
  element.asset = { ...element.asset, capabilities: [] }; await element.updateComplete;
  element._prepare(); assert.equal(element._confirmation, null);
  assert.match(element.shadowRoot.textContent, /representation.missing_capability/);
  element.asset = { ...element.asset, capabilities: ["on_off"] };
  element.bindingStatuses = { records: [{ asset_id: "a1", capability: "on_off", role: "secondary", config_valid: true }] };
  await element.updateComplete; element._prepare(); assert.equal(element._confirmation, null);
  assert.ok(element.shadowRoot.querySelector(".manage").disabled); assert.equal(calls.length, 0); element.remove();
});
test("creation is explicit and pinned to the reviewed revision even when API revision advances", async () => {
  const { element, calls } = await fixture();
  element.shadowRoot.querySelector(".manage").click(); await element.updateComplete;
  assert.equal(calls.length, 0);
  element.registry = { ...element.registry, revision: 12 };
  element.hass.callWS = async (message) => { calls.push(message); return { revision: 12 }; };
  await createBindHomeApi(element.hass).getRegistry(); calls.length = 0;
  element.shadowRoot.querySelector(".confirm").click();
  await window.happyDOM.waitUntilComplete();
  assert.deepEqual(calls, [{ type: "bindhome/representations/set", asset_id: "a1", platform: "light", based_on_revision: 7 }]);
  assert.equal(element._confirmation, null); assert.equal(element._notice, "representation.created"); element.remove();
});
test("removal confirms consumer impact and uses only the existing delete contract", async () => {
  const { element, calls } = await fixture();
  element.registry = { revision: 7, representations: [{ asset_id: "a1", platform: "light" }] };
  element.bindingStatuses = { records: [] }; await element.updateComplete;
  element._prepare(); await element.updateComplete;
  assert.match(element.shadowRoot.textContent, /representation.confirm_remove/);
  await element._commit();
  assert.deepEqual(calls, [{ type: "bindhome/representations/delete", asset_id: "a1", based_on_revision: 7 }]); element.remove();
});
test("logical identity comes from backend lookup and runtime state, never the Asset name or backing ID", async () => {
  const { element } = await fixture();
  element.registry = { revision: 7, representations: [{ asset_id: "a1", platform: "light" }], representation_entities: { a1: "light.user_renamed" } };
  element.hass = { ...element.hass, states: { "light.user_renamed": { state: "off" } } };
  await element.updateComplete;
  assert.equal(element.shadowRoot.querySelector(".entity").textContent, "light.user_renamed");
  assert.match(element.shadowRoot.textContent, /representation.active/);
  element.hass = { ...element.hass, states: { "light.user_renamed": { state: "unavailable" } } }; await element.updateComplete;
  assert.match(element.shadowRoot.textContent, /representation.unavailable/);
  element.registry = { ...element.registry, representation_entities: { a1: null } }; await element.updateComplete;
  assert.equal(element.shadowRoot.querySelector(".entity"), null); assert.match(element.shadowRoot.textContent, /representation.pending_entity/); element.remove();
});
test("valid unavailable hardware permits creation while another domain explains ON/OFF limits", async () => {
  const { element } = await fixture();
  element.bindingStatuses = { records: [{ ...element._binding(), entity_id: "switch.relay", runtime_available: false }] };
  await element.updateComplete;
  assert.equal(element.shadowRoot.querySelector(".manage").disabled, false);
  assert.match(element.shadowRoot.textContent, /representation.limited/);
  assert.match(element.shadowRoot.textContent, /representation.backing_unavailable/); element.remove();
});
test("read-only users cannot prepare or commit, including permission loss during confirmation", async () => {
  const { element, calls } = await fixture();
  element._prepare(); element.readOnly = true; await element._commit(); await element.updateComplete;
  assert.equal(element.shadowRoot.querySelector(".manage"), null); assert.equal(element.shadowRoot.querySelector(".confirm"), null);
  element._prepare(); assert.equal(element._confirmation, null); assert.equal(calls.length, 0); element.remove();
});
test("conflicts require refresh and another review without automatic retry", async () => {
  const { element, calls } = await fixture();
  element.hass.callWS = async (message) => { calls.push(message); throw { code: "conflict" }; };
  element._prepare(); await element._commit(); await element.updateComplete;
  assert.equal(element._error, "representation.conflict"); assert.equal(element._confirmation, null);
  element._prepare(); assert.equal(element._confirmation, null); assert.equal(calls.length, 1);
  await element._refresh(); element._prepare(); assert.ok(element._confirmation); element.remove();
});
test("save success plus refresh failure is reported without offering a duplicate mutation", async () => {
  const { element, calls } = await fixture();
  element.onRefresh = async () => { throw new Error("offline"); };
  element._prepare(); await element._commit(); await element.updateComplete;
  assert.equal(element._notice, "representation.created"); assert.equal(element._error, "representation.saved_refresh_failed");
  assert.ok(element.shadowRoot.querySelector(".manage").disabled); assert.equal(calls.length, 1); element.remove();
});
test("switching Assets discards confirmation and late mutation feedback", async () => {
  const { element } = await fixture();
  let resolve; element.hass.callWS = () => new Promise((done) => { resolve = done; });
  element._prepare(); const pending = element._commit();
  element.asset = { id: "a2", name: "Other", capabilities: [] }; await element.updateComplete;
  resolve({ revision: 8 }); await pending;
  assert.equal(element._confirmation, null); assert.equal(element._notice, null); assert.equal(element._busy, false); element.remove();
});
