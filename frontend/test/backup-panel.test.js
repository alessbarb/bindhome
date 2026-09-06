import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";

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

await import("../src/advanced/backup-restore-tool.js");

function fileInput(name, text) {
  return { currentTarget: { files: [{ name, text: async () => text }] } };
}

test("restore file is parsed and requires explicit confirmation", async () => {
  const element = document.createElement("bindhome-backup-restore-tool");
  element.t = (key) => key;
  const backup = {
    format: "bindhome.registry",
    format_version: 1,
    registry: { assets: [{ id: "a" }], relations: [], bindings: [], representations: [] },
  };
  await element._restoreFileSelected(fileInput("backup.json", JSON.stringify(backup)));
  assert.equal(element._restoreSummary.assets, 1);
  assert.equal(element._confirmed, false);
});

test("invalid JSON never reaches restore", async () => {
  let calls = 0;
  const element = document.createElement("bindhome-backup-restore-tool");
  element.t = (key) => key;
  element.hass = { callWS: async () => { calls += 1; } };
  await element._restoreFileSelected(fileInput("bad.json", "{bad"));
  await element._restore();
  assert.equal(calls, 0);
  assert.equal(element._restoreBackup, null);
});

test("confirmed restore uses the visible Registry revision and refreshes assets", async () => {
  const calls = [];
  const element = document.createElement("bindhome-backup-restore-tool");
  element.t = (key) => key;
  element.revision = 12;
  element.hass = {
    user: { id: "u1" },
    connection: { sendMessagePromise: async () => ({ value: null }) },
    callWS: async (message) => {
      calls.push(message);
      if (message.type === "bindhome/backup/restore") {
        assert.equal(message.based_on_revision, 12);
        return { restored: true, revision: 13, registry: { assets: [{ id: "restored" }] } };
      }
      if (message.type === "bindhome/backup/recovery_status") {
        return { recovery_required: false, entry_state: "loaded", recovery: null };
      }
      throw new Error(`Unexpected ${message.type}`);
    },
  };
  element._recovery = { recovery_required: false };
  element._restoreBackup = { format: "bindhome.registry", registry: {} };
  element._confirmed = true;
  let refreshed = null;
  element.addEventListener("assets-refreshed", (event) => { refreshed = event.detail; });
  await element._restore();
  assert.deepEqual(refreshed, [{ id: "restored" }]);
  assert.equal(calls.some((call) => call.type === "bindhome/backup/restore"), true);
});

test("recovery restore intentionally omits stale live revision", async () => {
  const calls = [];
  const element = document.createElement("bindhome-backup-restore-tool");
  element.t = (key) => key;
  element.revision = 12;
  element.hass = {
    user: { id: "u1" },
    connection: { sendMessagePromise: async () => ({ value: null }) },
    callWS: async (message) => {
      calls.push(message);
      if (message.type === "bindhome/backup/restore") return { restored: true, registry: { assets: [] }, reloaded: true };
      if (message.type === "bindhome/backup/recovery_status") return { recovery_required: true, entry_state: "setup_error", recovery: {} };
      throw new Error(`Unexpected ${message.type}`);
    },
  };
  element._recovery = { recovery_required: true };
  element._restoreBackup = { format: "bindhome.registry", registry: {} };
  element._confirmed = true;
  await element._restore();
  const restore = calls.find((call) => call.type === "bindhome/backup/restore");
  assert.equal("based_on_revision" in restore, false);
});
