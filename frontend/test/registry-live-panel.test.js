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

const { createBindHomeApi } = await import("../src/api/bindhome-api.js");
await import("../src/bindhome-panel.js");

function harness() {
  let listener = null;
  let unsubscribeCount = 0;
  let revision = 1;
  let assets = [
    { id: "asset-1", name: "Before", asset_type: "socket", capabilities: [] },
  ];
  let conflictNext = false;
  const connection = {
    async subscribeMessage(callback, message) {
      assert.deepEqual(message, { type: "bindhome/registry/subscribe" });
      listener = callback;
      return () => {
        unsubscribeCount += 1;
        listener = null;
      };
    },
  };
  const hass = {
    connection,
    language: "en",
    user: { id: "user-1" },
    async callWS(message) {
      if (message.type === "bindhome/registry/get") {
        return {
          schema_version: 2,
          assets,
          relations: [],
          bindings: [],
          representations: [],
          revision,
        };
      }
      if (message.type === "bindhome/bindings/status") {
        return { records: [], summary: {} };
      }
      if (conflictNext) {
        conflictNext = false;
        throw { code: "conflict", message: "stale" };
      }
      return { revision: ++revision };
    },
  };
  return {
    hass,
    emit(event) {
      listener?.(event);
    },
    setAssets(next) {
      assets = next;
      revision += 1;
    },
    conflict() {
      conflictNext = true;
    },
    unsubscribeCount: () => unsubscribeCount,
  };
}

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("a Registry event refreshes another panel without polling", async () => {
  const h = harness();
  const panel = document.createElement("bindhome-panel");
  panel.hass = h.hass;
  panel._initialized = true;
  panel._registry = { revision: 1, assets: [] };
  await panel._ensureRegistrySubscription();

  h.setAssets([
    { id: "asset-1", name: "After", asset_type: "socket", capabilities: [] },
  ]);
  h.emit({ revision: 2 });
  await panel._registryRefreshPromise;

  assert.equal(panel._assets[0].name, "After");
  assert.equal(panel._registry.revision, 2);
});

test("a stale mutation exposes reload and cleanup removes the listener", async () => {
  const h = harness();
  const panel = document.createElement("bindhome-panel");
  panel.hass = h.hass;
  panel._initialized = true;
  panel._t = (key) => key;
  document.body.append(panel);
  await createBindHomeApi(h.hass).getRegistry();
  await panel._ensureRegistrySubscription();

  h.conflict();
  await assert.rejects(
    createBindHomeApi(h.hass).deleteBinding("binding-1"),
    (error) => error.code === "conflict",
  );
  await settle(panel);

  assert.equal(panel._registryConflict, true);
  assert.ok(panel.shadowRoot.querySelector(".registry-conflict .retry"));

  panel._dropRegistrySubscription();
  panel._dropConflictSubscription();
  assert.equal(h.unsubscribeCount(), 1);
});
