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

if (!customElements.get("ha-icon")) {
  customElements.define("ha-icon", class extends HTMLElement {});
}

await import("../src/bindings/primary-connection-editor.js");

const t = (key) => key === "connection.cycle_error" ? "Circular connection" : key;

function resources(language) {
  const json = JSON.parse(readFileSync(new URL(`../../../translations/${language}.json`, import.meta.url)));
  return Object.fromEntries(Object.entries(json.common).filter(([key]) => key.startsWith("panel_")).map(([key, value]) => [`component.bindhome.common.${key}`, value]));
}

const englishT = (await import("../src/i18n/localize.js")).createLocalizer(resources("en"), resources("en"));
const spanishT = (await import("../src/i18n/localize.js")).createLocalizer(resources("es"), resources("en"));

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function createEditor(callWS) {
  const editor = document.createElement("bindhome-primary-connection-editor");
  editor.hass = {
    states: {
      "switch.relay": {
        state: "on",
        attributes: { friendly_name: "Relay" },
      },
    },
    callWS,
  };
  editor.t = t;
  editor.asset = { id: "asset-a", area_id: "living", capabilities: ["on_off"] };
  editor.capability = "on_off";
  editor.status = {
    status: "binding_not_found",
    config_valid: false,
    runtime_available: false,
    binding: null,
  };
  editor.entityRegistry = [{ entity_id: "switch.relay", name: "Relay" }];
  editor.areas = [{ area_id: "living", name: "Living room" }];
  document.body.append(editor);
  return editor;
}

test("primary connection Save uses one primary Binding request and narrow refresh", async () => {
  const calls = [];
  const editor = createEditor(async (message) => {
    calls.push(message);
    if (message.type === "bindhome/bindings/set") return { binding: { id: "binding-1" } };
    throw new Error(`Unexpected ${message.type}`);
  });
  let refreshes = 0;
  editor.refreshBindingData = async () => { refreshes += 1; };
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  await editor._save();
  assert.deepEqual(calls, [{
    type: "bindhome/bindings/set",
    asset_id: "asset-a",
    capability: "on_off",
    entity_id: "switch.relay",
    role: "primary",
  }]);
  assert.equal(refreshes, 1);
  assert.equal(editor._editing, false);
});

test("changing a primary connection replaces it with one set request", async () => {
  const calls = [];
  const editor = createEditor(async (message) => { calls.push(message); return {}; });
  editor.status = {
    status: "resolved",
    entity_id: "switch.relay",
    binding: { id: "binding-old", role: "primary", entity_id: "switch.relay" },
  };
  editor.entityRegistry = [
    { entity_id: "switch.relay", name: "Relay" },
    { entity_id: "light.new", name: "New light" },
  ];
  await settle(editor);
  editor._beginEdit();
  editor._select("light.new");
  await editor._save();
  assert.deepEqual(calls, [{
    type: "bindhome/bindings/set",
    asset_id: "asset-a",
    capability: "on_off",
    entity_id: "light.new",
    role: "primary",
  }]);
});

test("primary connection Cancel does not write and Disconnect uses only binding id", async () => {
  const calls = [];
  const editor = createEditor(async (message) => {
    calls.push(message);
    return { deleted: true };
  });
  editor.status = {
    status: "resolved",
    entity_id: "switch.relay",
    binding: { id: "binding-1", asset_id: "asset-a", capability: "on_off", role: "primary", entity_id: "switch.relay" },
  };
  let refreshes = 0;
  editor.refreshBindingData = async () => { refreshes += 1; };
  await settle(editor);
  editor._beginEdit();
  editor._cancelEdit();
  assert.deepEqual(calls, []);
  editor._confirmDisconnect = true;
  await editor._disconnect();
  assert.deepEqual(calls, [{ type: "bindhome/bindings/delete", binding_id: "binding-1" }]);
  assert.equal(refreshes, 1);
});

test("same identity preserves the selected draft across hass and status updates", async () => {
  const editor = createEditor(async () => ({ binding: { id: "binding-1" } }));
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  editor._search = "relay";
  editor.hass = { ...editor.hass, states: { ...editor.hass.states, "switch.relay": { state: "off", attributes: { friendly_name: "Relay" } } } };
  editor.status = { ...editor.status };
  await settle(editor);
  assert.equal(editor._editing, true);
  assert.equal(editor._selectedEntityId, "switch.relay");
  assert.equal(editor._search, "relay");
});

test("identity change clears the old draft before another Asset can save", async () => {
  const calls = [];
  const editor = createEditor(async (message) => { calls.push(message); return {}; });
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  editor._search = "relay";
  editor.asset = { id: "asset-b", area_id: "office", capabilities: ["on_off"] };
  await settle(editor);
  assert.equal(editor._editing, false);
  assert.equal(editor._selectedEntityId, null);
  assert.equal(editor._search, "");
  await editor._save();
  assert.deepEqual(calls, []);
});

test("set failure preserves selected entity and search without refreshing", async () => {
  const editor = createEditor(async () => { throw { code: "invalid_format", message: "Rejected" }; });
  let refreshes = 0;
  editor.refreshBindingData = async () => { refreshes += 1; };
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  editor._search = "relay";
  await editor._save();
  assert.equal(editor._editing, true);
  assert.equal(editor._selectedEntityId, "switch.relay");
  assert.equal(editor._search, "relay");
  assert.equal(refreshes, 0);
});

test("binding cycle failure is translated and preserves the editor draft", async () => {
  const editor = createEditor(async () => { throw { code: "binding_cycle", message: "backend detail" }; });
  let refreshes = 0;
  editor.refreshBindingData = async () => { refreshes += 1; };
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  editor._search = "relay";
  await editor._save();
  assert.equal(editor._editing, true);
  assert.equal(editor._selectedEntityId, "switch.relay");
  assert.equal(editor._search, "relay");
  assert.equal(editor._error, "Circular connection");
  assert.equal(refreshes, 0);
});

test("successful mutation exits editing even when refresh fails", async () => {
  const editor = createEditor(async () => ({ binding: { id: "binding-1" } }));
  editor.refreshBindingData = async () => { throw new Error("refresh unavailable"); };
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  await editor._save();
  assert.equal(editor._editing, false);
  assert.equal(editor._error, "connection.sync_warning");
});

test("non-primary status is not used by the primary editor", async () => {
  const editor = createEditor(async () => ({}));
  editor.status = { status: "binding_not_found", binding: null };
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /connection.not_connected/);
  assert.doesNotMatch(editor.shadowRoot.textContent, /binding-secondary/);
});

test("in-flight Save cannot leak completion into a new identity", async () => {
  let resolveSave;
  const editor = createEditor(() => new Promise((resolve) => { resolveSave = resolve; }));
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  const save = editor._save();
  editor.asset = { id: "asset-b", area_id: "office", capabilities: ["on_off"] };
  await settle(editor);
  resolveSave({ binding: { id: "binding-a" } });
  await save;
  assert.equal(editor._editing, false);
  assert.equal(editor._selectedEntityId, null);
  assert.equal(editor._error, null);
});

test("in-flight Save rejection cannot leak an error into a new identity", async () => {
  let rejectSave;
  const editor = createEditor(() => new Promise((resolve, reject) => { rejectSave = reject; }));
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.relay");
  const save = editor._save();
  editor.capability = "temperature";
  await settle(editor);
  rejectSave({ code: "binding_cycle", message: "old identity" });
  await save;
  assert.equal(editor._error, null);
  assert.equal(editor._selectedEntityId, null);
});

test("Disconnect failure preserves the primary connection and confirmation", async () => {
  const calls = [];
  const editor = createEditor(async (message) => {
    calls.push(message);
    throw { code: "invalid_format", message: "Rejected" };
  });
  editor.status = { status: "entity_not_found", entity_id: "switch.stale", binding: { id: "binding-stale", entity_id: "switch.stale", role: "primary" } };
  editor._confirmDisconnect = true;
  await settle(editor);
  await editor._disconnect();
  assert.deepEqual(calls, [{ type: "bindhome/bindings/delete", binding_id: "binding-stale" }]);
  assert.equal(editor._confirmDisconnect, true);
  assert.equal(editor._error, "Rejected");
});

test("Disconnect success with refresh failure is committed once", async () => {
  const calls = [];
  const editor = createEditor(async (message) => { calls.push(message); return {}; });
  editor.status = { status: "resolved", entity_id: "switch.relay", binding: { id: "binding-1", role: "primary" } };
  editor.refreshBindingData = async () => { throw new Error("refresh failed"); };
  editor._confirmDisconnect = true;
  await settle(editor);
  await editor._disconnect();
  await editor._disconnect();
  assert.deepEqual(calls, [{ type: "bindhome/bindings/delete", binding_id: "binding-1" }]);
  assert.equal(editor._confirmDisconnect, false);
  assert.equal(editor._error, "connection.sync_warning");
});

test("rendered summaries preserve configuration and live runtime semantics", async () => {
  const editor = createEditor(async () => ({}));
  editor.status = { status: "resolved", config_valid: true, entity_id: "switch.relay", binding: { id: "b", role: "primary" } };
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /Relay/);
  assert.match(editor.shadowRoot.textContent, /switch.relay/);
  assert.match(editor.shadowRoot.textContent, /connection.configured/);
  assert.match(editor.shadowRoot.textContent, /connection.available/);
  editor.hass = { ...editor.hass, states: { "switch.relay": { state: "unavailable", attributes: { friendly_name: "Relay" } } } };
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /connection.unavailable/);
  editor.hass = { ...editor.hass, states: { "switch.relay": { state: "unknown", attributes: { friendly_name: "Relay" } } } };
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /connection.unknown/);
  editor.hass = { ...editor.hass, states: {} };
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /connection.no_runtime/);
  editor.status = { status: "entity_not_found", config_valid: false, entity_id: "switch.stale", binding: { id: "b", role: "primary" } };
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /switch.stale/);
  assert.match(editor.shadowRoot.textContent, /connection.stale/);
  editor.status = { status: "resolved", config_valid: false, entity_id: "switch.relay", binding: { id: "b", role: "primary" } };
  editor.hass = { ...editor.hass, states: { "switch.relay": { state: "on", attributes: { friendly_name: "Relay" } } } };
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /connection.invalid_configuration/);
});

test("rendered configured runtime status has one configuration label", async () => {
  const editor = createEditor(async () => ({}));
  editor.t = spanishT;
  editor.status = { status: "resolved", config_valid: true, entity_id: "switch.relay", binding: { id: "binding-1", role: "primary", entity_id: "switch.relay" } };
  await settle(editor);
  const summary = editor.shadowRoot.textContent;
  assert.equal((summary.match(/Configurada/g) ?? []).length, 1);
  assert.match(summary, /disponible/);
});

test("English configured runtime status is not duplicated", async () => {
  const editor = createEditor(async () => ({}));
  editor.t = englishT;
  editor.status = { status: "resolved", config_valid: true, entity_id: "switch.relay", binding: { id: "binding-1", role: "primary", entity_id: "switch.relay" } };
  await settle(editor);
  const summary = editor.shadowRoot.textContent;
  assert.equal((summary.match(/Configured/g) ?? []).length, 1);
  assert.match(summary, /available/);
});

test("rendered picker consumes mixed candidates without filtering", async () => {
  const editor = createEditor(async () => ({}));
  editor.entityRegistry = [
    { entity_id: "switch.same", name: "Same area", area_id: "living" },
    { entity_id: "light.bindhome", name: "Logical", platform: "bindhome", area_id: "living" },
    { entity_id: "sensor.registry", name: "Registry only", area_id: "office", disabled_by: "user" },
    { entity_id: "switch.hidden", name: "Hidden", area_id: "office", hidden_by: "user" },
  ];
  editor.hass.states = {
    "switch.same": { state: "on" },
    "fan.other": { state: "off", attributes: { friendly_name: "Other area" } },
    "sensor.state": { state: "42", attributes: { friendly_name: "State only" } },
  };
  await settle(editor);
  editor._beginEdit();
  await settle(editor);
  const buttons = [...editor.shadowRoot.querySelectorAll("button.candidate")];
  const ids = buttons.map((button) => button.textContent);
  assert.equal(buttons.length, 6);
  assert.ok(ids[0].includes("Same area") || ids[0].includes("Logical"));
  assert.ok(ids.some((value) => value.includes("Logical")));
  assert.ok(ids.some((value) => value.includes("State only")));
  assert.ok(ids.some((value) => value.includes("Registry only")));
  assert.ok(ids.some((value) => value.includes("disabled")));
  assert.ok(ids.some((value) => value.includes("hidden")));
  const input = editor.shadowRoot.querySelector("input");
  input.value = "does-not-exist";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /connection.no_matches/);
});

test("Connect and Change buttons open the rendered picker", async () => {
  const unbound = createEditor(async () => ({}));
  await settle(unbound);
  unbound.shadowRoot.querySelector("button.primary").click();
  await settle(unbound);
  assert.ok(unbound.shadowRoot.querySelector("input"));

  const bound = createEditor(async () => ({}));
  bound.status = { status: "resolved", entity_id: "switch.relay", binding: { id: "binding-1", role: "primary", entity_id: "switch.relay" } };
  await settle(bound);
  const change = [...bound.shadowRoot.querySelectorAll("button")].find((button) => button.textContent.includes("connection.change"));
  assert.ok(change);
  change.click();
  await settle(bound);
  assert.equal(bound._selectedEntityId, "switch.relay");
  assert.ok(bound.shadowRoot.querySelector("input"));
});

test("stale summaries retain recovery actions", async () => {
  const editor = createEditor(async () => ({}));
  editor.status = { status: "entity_not_found", config_valid: false, entity_id: "switch.stale", binding: { id: "binding-stale", role: "primary", entity_id: "switch.stale" } };
  await settle(editor);
  const text = editor.shadowRoot.textContent;
  assert.match(text, /switch.stale/);
  assert.match(text, /connection.stale/);
  const buttons = [...editor.shadowRoot.querySelectorAll("button")];
  assert.ok(buttons.find((button) => button.textContent.includes("connection.change"))?.disabled === false);
  assert.ok(buttons.find((button) => button.textContent.includes("connection.disconnect"))?.disabled === false);
});

test("candidate selection updates aria-pressed, including disabled and hidden rows", async () => {
  const editor = createEditor(async () => ({}));
  editor.entityRegistry = [
    { entity_id: "switch.a", name: "Candidate A", area_id: "living" },
    { entity_id: "switch.disabled", name: "Disabled", area_id: "living", disabled_by: "user" },
    { entity_id: "switch.hidden", name: "Hidden", area_id: "living", hidden_by: "user" },
  ];
  editor.hass.states = {};
  await settle(editor);
  editor._beginEdit();
  await settle(editor);
  const rows = [...editor.shadowRoot.querySelectorAll("button.candidate")];
  const disabled = rows.find((button) => button.textContent.includes("Disabled"));
  const hidden = rows.find((button) => button.textContent.includes("Hidden"));
  assert.equal(disabled.disabled, false);
  assert.equal(hidden.disabled, false);
  disabled.click();
  await settle(editor);
  assert.equal(editor._selectedEntityId, "switch.disabled");
  editor._changeSelection();
  await settle(editor);
  const disabledAgain = [...editor.shadowRoot.querySelectorAll("button.candidate")].find((button) => button.textContent.includes("Disabled"));
  assert.equal(disabledAgain.getAttribute("aria-pressed"), "true");
  const hiddenAgain = [...editor.shadowRoot.querySelectorAll("button.candidate")].find((button) => button.textContent.includes("Hidden"));
  hiddenAgain.click();
  await settle(editor);
  assert.equal(editor._selectedEntityId, "switch.hidden");
  editor._changeSelection();
  await settle(editor);
  const hiddenSelected = [...editor.shadowRoot.querySelectorAll("button.candidate")].find((button) => button.textContent.includes("Hidden"));
  assert.equal(hiddenSelected.getAttribute("aria-pressed"), "true");
  assert.equal(editor.shadowRoot.textContent.includes("connection.disabled"), true);
  assert.equal(editor.shadowRoot.textContent.includes("connection.hidden"), true);
});

test("picker is search-first, bounded, and collapses results after selection", async () => {
  const editor = createEditor(async () => ({}));
  editor.t = englishT;
  editor.entityRegistry = Array.from({ length: 25 }, (_, index) => ({
    entity_id: `switch.entity_${index}`,
    name: `Entity ${index}`,
    area_id: index === 0 ? "living" : "office",
  }));
  editor.hass.states = {};
  await settle(editor);
  editor._beginEdit();
  await settle(editor);
  assert.ok(editor.shadowRoot.querySelectorAll("button.candidate").length <= 8);
  const input = editor.shadowRoot.querySelector("input");
  input.value = "entity";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(editor);
  assert.equal(editor.shadowRoot.querySelectorAll("button.candidate").length, 20);
  assert.match(editor.shadowRoot.textContent, /Showing 20 of 25 results/);
  input.value = "entity_24";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(editor);
  const result = editor.shadowRoot.querySelector("button.candidate");
  result.click();
  await settle(editor);
  assert.equal(editor._selectedEntityId, "switch.entity_24");
  assert.equal(editor.shadowRoot.querySelectorAll("button.candidate").length, 0);
  assert.match(editor.shadowRoot.textContent, /switch.entity_24/);
  editor.shadowRoot.querySelector("button:not(.primary)").click();
  await settle(editor);
  assert.ok(editor.shadowRoot.querySelectorAll("button.candidate").length > 0);
});

test("selected draft remains visible when a same-identity catalogue refresh removes it", async () => {
  const calls = [];
  const editor = createEditor(async (message) => { calls.push(message); return {}; });
  editor.status = { status: "resolved", entity_id: "switch.persisted", binding: { id: "binding-b", role: "primary", entity_id: "switch.persisted" } };
  editor.entityRegistry = [
    { entity_id: "switch.persisted", name: "Backend B" },
    { entity_id: "switch.candidate", name: "Backend A" },
  ];
  await settle(editor);
  editor._beginEdit();
  editor._select("switch.candidate");
  await settle(editor);
  assert.match(editor.shadowRoot.textContent, /switch.candidate/);
  editor.entityRegistry = [{ entity_id: "switch.persisted", name: "Backend B" }];
  await settle(editor);
  assert.equal(editor._selectionMode, "selected");
  assert.equal(editor._selectedEntityId, "switch.candidate");
  assert.match(editor.shadowRoot.textContent, /Backend B/);
  assert.match(editor.shadowRoot.textContent, /switch.candidate/);
  assert.ok([...editor.shadowRoot.querySelectorAll("button")].some((button) => button.textContent.includes("connection.change_selection")));
  assert.ok([...editor.shadowRoot.querySelectorAll("button")].some((button) => button.textContent.includes("editor.cancel")));
  assert.equal(calls.length, 0);
  editor._changeSelection();
  await settle(editor);
  assert.ok(editor.shadowRoot.querySelectorAll("button.candidate").length > 0);
});

test("selecting the persisted entity again disables Save", async () => {
  const editor = createEditor(async () => ({}));
  editor.status = { status: "resolved", entity_id: "switch.persisted", binding: { id: "binding-b", role: "primary", entity_id: "switch.persisted" } };
  editor.entityRegistry = [
    { entity_id: "switch.persisted", name: "Backend B" },
    { entity_id: "switch.other", name: "Backend A" },
  ];
  await settle(editor);
  editor._beginEdit();
  await settle(editor);
  const rows = () => [...editor.shadowRoot.querySelectorAll("button.candidate")];
  rows().find((button) => button.textContent.includes("Backend A")).click();
  await settle(editor);
  assert.equal([...editor.shadowRoot.querySelectorAll("button")].find((button) => button.textContent.includes("common.save")).disabled, false);
  editor.shadowRoot.querySelector("button:not(.primary)").click();
  await settle(editor);
  rows().find((button) => button.textContent.includes("Backend B")).click();
  await settle(editor);
  assert.equal(editor._selectedEntityId, "switch.persisted");
  assert.equal([...editor.shadowRoot.querySelectorAll("button")].find((button) => button.textContent.includes("common.save")).disabled, true);
});

test("only the final B-to-A-to-C selection is submitted", async () => {
  const calls = [];
  const editor = createEditor(async (message) => { calls.push(message); return {}; });
  editor.status = { status: "resolved", entity_id: "switch.persisted", binding: { id: "binding-b", role: "primary", entity_id: "switch.persisted" } };
  editor.entityRegistry = [
    { entity_id: "switch.persisted", name: "Backend B" },
    { entity_id: "switch.a", name: "Backend A" },
    { entity_id: "switch.c", name: "Backend C" },
  ];
  await settle(editor);
  editor._beginEdit();
  await settle(editor);
  const rows = () => [...editor.shadowRoot.querySelectorAll("button.candidate")];
  rows().find((button) => button.textContent.includes("Backend A")).click();
  await settle(editor);
  editor.shadowRoot.querySelector("button:not(.primary)").click();
  await settle(editor);
  rows().find((button) => button.textContent.includes("Backend C")).click();
  await settle(editor);
  await editor._save();
  assert.deepEqual(calls, [{ type: "bindhome/bindings/set", asset_id: "asset-a", capability: "on_off", entity_id: "switch.c", role: "primary" }]);
});

test("result truncation is omitted when all matches fit", async () => {
  const editor = createEditor(async () => ({}));
  editor.t = englishT;
  editor.entityRegistry = Array.from({ length: 10 }, (_, index) => ({ entity_id: `switch.entity_${index}`, name: `Entity ${index}` }));
  editor.hass.states = {};
  await settle(editor);
  editor._beginEdit();
  await settle(editor);
  const input = editor.shadowRoot.querySelector("input");
  input.value = "entity";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(editor);
  assert.equal(editor.shadowRoot.querySelectorAll("button.candidate").length, 10);
  assert.doesNotMatch(editor.shadowRoot.textContent, /Showing 10 of 10/);
});

test("Save is disabled for an unchanged persisted selection", async () => {
  const editor = createEditor(async () => ({}));
  editor.status = { status: "resolved", entity_id: "switch.relay", binding: { id: "binding-1", role: "primary", entity_id: "switch.relay" } };
  await settle(editor);
  editor._beginEdit();
  await settle(editor);
  const save = [...editor.shadowRoot.querySelectorAll("button")].find((button) => button.textContent.includes("common.save"));
  assert.equal(save.disabled, true);
});

test("picker Cancel uses the established Spanish translation key", async () => {
  const editor = createEditor(async () => ({}));
  editor.t = spanishT;
  await settle(editor);
  editor.shadowRoot.querySelector("button.primary").click();
  await settle(editor);
  const text = editor.shadowRoot.textContent;
  assert.match(text, /Cancelar/);
  assert.doesNotMatch(text, /common\.cancel/);
});

test("picker Cancel uses the established English translation key", async () => {
  const editor = createEditor(async () => ({}));
  editor.t = englishT;
  await settle(editor);
  editor.shadowRoot.querySelector("button.primary").click();
  await settle(editor);
  const text = editor.shadowRoot.textContent;
  assert.match(text, /Cancel/);
  assert.doesNotMatch(text, /common\.cancel/);
});
