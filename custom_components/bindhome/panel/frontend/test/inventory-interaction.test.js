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
window.HTMLElement.prototype.scrollIntoView = () => {};
window.confirm = () => true;
if (!customElements.get("ha-icon")) customElements.define("ha-icon", class extends HTMLElement {});

await import("../src/inventory/inventory-workflow.js");
await import("../src/bindhome-panel.js");
const { createLocalizer } = await import("../src/i18n/localize.js");

function panelResources(language) {
  const json = JSON.parse(readFileSync(new URL(`../../../translations/${language}.json`, import.meta.url)));
  return Object.fromEntries(Object.entries(json.common).filter(([key]) => key.startsWith("panel_")).map(([key, value]) => [`component.bindhome.common.${key}`, value]));
}
const englishResources = panelResources("en");
const englishT = createLocalizer(englishResources, englishResources);
const spanishResources = panelResources("es");

const presets = [
  { preset_id: "light_point", group: "electrical", asset_type: "light_point", default_name: "Light point", suggested_capabilities: ["on_off"] },
  { preset_id: "socket", group: "electrical", asset_type: "socket", default_name: "Socket", suggested_capabilities: [] },
];

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function panelInventorySection(panel) {
  return panel.shadowRoot.querySelector("bindhome-advanced-view")?.shadowRoot.querySelector(
    "bindhome-inventory-section",
  ) ?? null;
}

function panelRoomWorkflow(panel) {
  const section = panelInventorySection(panel);

  return section?.shadowRoot.querySelector(
    "bindhome-inventory-workflow",
  ) ?? null;
}

async function roomWorkflow(hass, areas = [{ area_id: "living", name: "Living room", floor_id: "ground" }]) {
  const element = document.createElement("bindhome-inventory-workflow");
  element.hass = hass;
  element.t = englishT;
  element.presets = presets;
  element.floors = [{ floor_id: "ground", name: "Ground floor" }];
  element.areas = areas;
  element.assets = [];
  document.body.append(element);
  await settle(element);
  element._floorId = "ground";
  element._areaId = areas[0].area_id;
  element._continue();
  element._changeQuantity("socket", 2);
  await settle(element);
  return element;
}

test("routine hass replacement does not reload or unmount an edited room batch", async () => {
  const calls = [];
  const callWS = async (message) => {
    calls.push(message.type);
    if (message.type === "bindhome/presets/list") return { presets };
    if (message.type === "bindhome/assets/list") return { assets: [] };
    if (message.type === "bindhome/registry/get") return { assets: [], relations: [], bindings: [] };
    if (message.type === "bindhome/bindings/status") return { records: [], summary: {} };
    if (message.type === "config/entity_registry/list") return [];
    if (message.type === "config/device_registry/list") return [];
    if (message.type === "config/floor_registry/list") return [{ floor_id: "ground", name: "Ground floor" }];
    if (message.type === "config/area_registry/list") return [{ area_id: "living", name: "Living room", floor_id: "ground" }];
    if (message.type === "frontend/get_translations") return { resources: englishResources };
    throw new Error(`Unexpected call: ${message.type}`);
  };
  const panel = document.createElement("bindhome-panel");
  panel.hass = { callWS, states: {} };
  document.body.append(panel);
  await settle(panel);
  const inventorySection = panelInventorySection(panel);
  const workflow = panelRoomWorkflow(panel);
  assert.ok(inventorySection);
  assert.ok(workflow);
  workflow._floorId = "ground";
  workflow._areaId = "living";
  workflow._continue();
  workflow._changeQuantity("socket", 1);
  const draft = workflow._activeDrafts[0];
  workflow._updateDraft(draft.key, { name: "Edited socket" });
  await settle(workflow);
  await panel._load(false);
  await settle(panel);
  assert.equal(
    panelInventorySection(panel),
    inventorySection,
  );
  assert.equal(
    panelRoomWorkflow(panel),
    workflow,
  );
  assert.equal(workflow._activeDrafts[0].name, "Edited socket");
  const initialCalls = calls.length;

  panel.hass = { callWS, states: { "sensor.example": { state: "updated" } } };
  await settle(panel);

  assert.equal(calls.length, initialCalls);
  assert.equal(
    panelInventorySection(panel),
    inventorySection,
  );
  assert.equal(
    panelRoomWorkflow(panel),
    workflow,
  );
  assert.equal(workflow._activeDrafts[0].name, "Edited socket");
});

test("binding refresh reloads only BindHome registry and status data", async () => {
  const calls = [];
  const callWS = async (message) => {
    calls.push(message.type);
    if (message.type === "bindhome/presets/list") return { presets };
    if (message.type === "bindhome/assets/list") return { assets: [] };
    if (message.type === "bindhome/registry/get") return { assets: [], relations: [], bindings: [] };
    if (message.type === "bindhome/bindings/status") return { records: [], summary: {} };
    if (message.type === "config/entity_registry/list") return [];
    if (message.type === "config/device_registry/list") return [];
    if (message.type === "config/floor_registry/list") return [{ floor_id: "ground", name: "Ground floor" }];
    if (message.type === "config/area_registry/list") return [{ area_id: "living", name: "Living room", floor_id: "ground" }];
    if (message.type === "frontend/get_translations") return { resources: englishResources };
    throw new Error(`Unexpected call: ${message.type}`);
  };
  const panel = document.createElement("bindhome-panel");
  panel.hass = { callWS, states: {} };
  document.body.append(panel);
  await settle(panel);
  const before = calls.length;
  await panel._refreshBindingData();
  assert.deepEqual(calls.slice(before), ["bindhome/registry/get", "bindhome/bindings/status"]);
});

test("out-of-order binding refreshes cannot overwrite the newest snapshot", async () => {
  const pending = [];
  const panel = document.createElement("bindhome-panel");
  panel.hass = {
    callWS: (message) => new Promise((resolve) => pending.push({ message, resolve })),
    states: {},
  };
  panel._initialized = true;
  const first = panel._refreshBindingData();
  const second = panel._refreshBindingData();
  const resolveFor = (index, value) => pending[index].resolve(value);
  resolveFor(2, { assets: [{ id: "new" }] });
  resolveFor(3, { records: [{ asset_id: "new", capability: "on_off", role: "primary" }] });
  resolveFor(0, { assets: [{ id: "old" }] });
  resolveFor(1, { records: [{ asset_id: "old", capability: "on_off", role: "primary" }] });
  await Promise.all([first, second]);
  assert.deepEqual(panel._registry.assets, [{ id: "new" }]);
  assert.deepEqual(panel._bindingStatuses.records, [{ asset_id: "new", capability: "on_off", role: "primary" }]);
});

test("a newer full load wins over an older narrow refresh", async () => {
  const deferred = [];
  const callWS = (message) => {
    if (message.type === "bindhome/registry/get" || message.type === "bindhome/bindings/status") {
      return new Promise((resolve) => deferred.push({ type: message.type, resolve }));
    }
    if (message.type === "bindhome/presets/list") return Promise.resolve({ presets });
    if (message.type === "bindhome/assets/list") return Promise.resolve({ assets: [] });
    if (message.type === "config/entity_registry/list" || message.type === "config/device_registry/list") return Promise.resolve([]);
    if (message.type === "config/floor_registry/list") return Promise.resolve([]);
    if (message.type === "config/area_registry/list") return Promise.resolve([]);
    if (message.type === "frontend/get_translations") return Promise.resolve({ resources: englishResources });
    throw new Error(`Unexpected call: ${message.type}`);
  };
  const panel = document.createElement("bindhome-panel");
  panel.hass = { callWS, states: {} };
  panel._initialized = true;
  const narrow = panel._refreshBindingData();
  const full = panel._load(false);
  deferred.find((entry, index) => index === 2 && entry.type === "bindhome/registry/get").resolve({ assets: [{ id: "full" }] });
  deferred.find((entry, index) => index === 3 && entry.type === "bindhome/bindings/status").resolve({ records: [{ asset_id: "full" }] });
  await full;
  deferred[0].resolve({ assets: [{ id: "narrow" }] });
  deferred[1].resolve({ records: [{ asset_id: "narrow" }] });
  await narrow;
  assert.deepEqual(panel._registry.assets, [{ id: "full" }]);
  assert.deepEqual(panel._bindingStatuses.records, [{ asset_id: "full" }]);
});

test("a newer narrow refresh wins over an older full load", async () => {
  const deferred = [];
  const callWS = (message) => {
    if (message.type === "bindhome/registry/get" || message.type === "bindhome/bindings/status") {
      return new Promise((resolve, reject) => deferred.push({ type: message.type, resolve, reject }));
    }
    if (message.type === "bindhome/presets/list") return Promise.resolve({ presets });
    if (message.type === "bindhome/assets/list") return Promise.resolve({ assets: [] });
    if (message.type === "config/entity_registry/list" || message.type === "config/device_registry/list") return Promise.resolve([]);
    if (message.type === "config/floor_registry/list" || message.type === "config/area_registry/list") return Promise.resolve([]);
    if (message.type === "frontend/get_translations") return Promise.resolve({ resources: englishResources });
    throw new Error(`Unexpected call: ${message.type}`);
  };
  const panel = document.createElement("bindhome-panel");
  panel.hass = { callWS, states: {} };
  panel._initialized = true;
  const full = panel._load(false);
  const narrow = panel._refreshBindingData();
  deferred[2].resolve({ assets: [{ id: "narrow" }] });
  deferred[3].resolve({ records: [{ asset_id: "narrow" }] });
  await narrow;
  deferred[0].resolve({ assets: [{ id: "full" }] });
  deferred[1].resolve({ records: [{ asset_id: "full" }] });
  await full;
  assert.deepEqual(panel._registry.assets, [{ id: "narrow" }]);
  assert.deepEqual(panel._bindingStatuses.records, [{ asset_id: "narrow" }]);
});

test("a newer failed refresh prevents an older refresh from applying", async () => {
  const deferred = [];
  const panel = document.createElement("bindhome-panel");
  panel.hass = {
    callWS: (message) => new Promise((resolve, reject) => deferred.push({ type: message.type, resolve, reject })),
    states: {},
  };
  panel._initialized = true;
  const first = panel._refreshBindingData();
  const second = panel._refreshBindingData();
  deferred[2].reject(new Error("new refresh failed"));
  deferred[3].reject(new Error("new refresh failed"));
  await assert.rejects(second, /new refresh failed/);
  deferred[0].resolve({ assets: [{ id: "old" }] });
  deferred[1].resolve({ records: [{ asset_id: "old" }] });
  await first;
  assert.equal(panel._registry, null);
  assert.deepEqual(panel._bindingStatuses.records, []);
});

test("changing HA language localizes presentation without touching an active batch", async () => {
  const calls = [];
  const callWS = async (message) => {
    calls.push(structuredClone(message));
    if (message.type === "frontend/get_translations") return { resources: message.language === "es" ? spanishResources : englishResources };
    if (message.type === "bindhome/presets/list") return { presets };
    if (message.type === "bindhome/assets/list") return { assets: [] };
    if (message.type === "bindhome/registry/get") return { assets: [], relations: [], bindings: [] };
    if (message.type === "bindhome/bindings/status") return { records: [], summary: {} };
    if (message.type === "config/entity_registry/list") return [];
    if (message.type === "config/device_registry/list") return [];
    if (message.type === "config/floor_registry/list") return [{ floor_id: "ground", name: "Ground floor user name" }];
    if (message.type === "config/area_registry/list") return [{ area_id: "living", name: "Living room user name", floor_id: "ground" }];
    throw new Error(`Unexpected call: ${message.type}`);
  };
  const panel = document.createElement("bindhome-panel");
  panel.hass = { callWS, language: "en", states: {} };
  document.body.append(panel);
  await settle(panel);
  const inventorySection = panelInventorySection(panel);
  const workflow = panelRoomWorkflow(panel);
  assert.ok(inventorySection);
  assert.ok(workflow);
  workflow._floorId = "ground";
  workflow._areaId = "living";
  workflow._continue();
  workflow._changeQuantity("socket", 1);
  workflow._updateDraft(workflow._activeDrafts[0].key, { name: "My edited socket", asset_type: "socket", capabilities: ["on_off"] });
  await settle(workflow);
  const beforeDataCalls = calls.filter((call) => call.type !== "frontend/get_translations").length;

  panel.hass = { callWS, language: "es", states: { "sensor.language": { state: "es" } } };
  await settle(panel);
  await window.happyDOM.waitUntilComplete();
  await settle(panel);

  assert.equal(
    panelInventorySection(panel),
    inventorySection,
  );
  assert.equal(
    panelRoomWorkflow(panel),
    workflow,
  );
  assert.equal(workflow._activeDrafts[0].name, "My edited socket");
  assert.equal(workflow._activeDrafts[0].asset_type, "socket");
  assert.deepEqual(workflow._activeDrafts[0].capabilities, ["on_off"]);
  assert.match(panel.shadowRoot.textContent, /Casa\s+Añadir\s+Buscar/);
  const advancedButton =
    panel.shadowRoot.querySelector(".tabs button.advanced");

  assert.ok(advancedButton);
  assert.equal(advancedButton.textContent.trim(), "Avanzado");
  assert.equal(advancedButton.disabled, true);
  assert.match(workflow.shadowRoot.textContent, /Ground floor user name/);
  assert.match(workflow.shadowRoot.textContent, /Living room user name/);
  assert.equal(calls.filter((call) => call.type !== "frontend/get_translations").length, beforeDataCalls);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create_bulk").length, 0);
});

test("changing room requires discard and cannot retarget active drafts", async () => {
  const bulkCalls = [];
  const hass = { callWS: async (message) => {
    if (message.type === "bindhome/assets/create_bulk") { bulkCalls.push(message); return { assets: [] }; }
    if (message.type === "bindhome/assets/list") return { assets: [] };
    throw new Error(`Unexpected call: ${message.type}`);
  } };
  const element = await roomWorkflow(hass, [
    { area_id: "area-a", name: "Room A", floor_id: "ground" },
    { area_id: "area-b", name: "Room B", floor_id: "ground" },
  ]);
  const originalDrafts = element._activeDrafts;
  element._requestRoomChange();
  await settle(element);
  assert.equal(element._confirmRoomChange, true);
  assert.equal(element._areaId, "area-a");
  assert.deepEqual(element._activeDrafts, originalDrafts);
  element._confirmRoomChange = false;
  await settle(element);
  assert.equal(element._areaId, "area-a");
  assert.equal(bulkCalls.length, 0);

  element._requestRoomChange();
  element._discardAndChangeRoom();
  await settle(element);
  assert.equal(element._activeDrafts.length, 0);
  assert.equal(element._areaId, "");
  assert.equal(element._step, "select");
});

test("Back to quantities preserves every edited draft field", async () => {
  const element = await roomWorkflow({ callWS: async () => ({ assets: [] }) });
  const second = element._activeDrafts[1];
  element._updateDraft(second.key, { name: "Desk outlet", asset_type: "custom_outlet", code: "DESK-1", capabilities: ["custom_power"] });
  element._step = "review";
  await settle(element);
  element.shadowRoot.querySelector(".bottom-bar .button.secondary").click();
  await settle(element);
  assert.equal(element._step, "quantity");
  element._step = "review";
  await settle(element);
  assert.deepEqual(element._activeDrafts[1], { ...second, name: "Desk outlet", asset_type: "custom_outlet", code: "DESK-1", capabilities: ["custom_power"] });
});

test("refreshed presets do not rewrite active draft semantics", async () => {
  const element = await roomWorkflow({ callWS: async () => ({ assets: [] }) });
  const first = element._activeDrafts[0];
  element._updateDraft(first.key, { name: "Keep me", asset_type: "custom_socket", capabilities: ["custom_capability"] });
  element.presets = presets.map((preset) => preset.preset_id === "socket" ? { ...preset, default_name: "Changed backend name", asset_type: "changed_type", suggested_capabilities: ["changed"] } : preset);
  await settle(element);
  assert.equal(element._activeDrafts[0].name, "Keep me");
  assert.equal(element._activeDrafts[0].asset_type, "custom_socket");
  assert.deepEqual(element._activeDrafts[0].capabilities, ["custom_capability"]);
});

test("room workflow preserves and focuses a failed draft, then retries one atomic request", async () => {
  const calls = [];
  let shouldFail = true;
  let assets = [{ id: "existing", name: "Existing window", asset_type: "window", area_id: "living", capabilities: ["open_close"] }];
  const hass = {
    async callWS(message) {
      calls.push(structuredClone(message));
      if (message.type === "bindhome/assets/create_bulk") {
        if (shouldFail) {
          shouldFail = false;
          throw new Error('{"index":1,"field":"code","message":"Duplicate code"}');
        }
        const created = message.assets.map((item, index) => ({ ...item, id: `created-${index}` }));
        assets = [...assets, ...created];
        return { assets: created };
      }
      if (message.type === "bindhome/assets/list") return { assets };
      throw new Error(`Unexpected call: ${message.type}`);
    },
  };
  const element = document.createElement("bindhome-inventory-workflow");
  element.hass = hass;
  element.t = englishT;
  element.presets = presets;
  element.floors = [{ floor_id: "ground", name: "Ground floor" }];
  element.areas = [{ area_id: "living", name: "Living room", floor_id: "ground" }];
  element.assets = assets;
  document.body.append(element);
  await settle(element);

  element._floorId = "ground";
  element._areaId = "living";
  element._continue();
  element.requestUpdate();
  await settle(element);

  let increaseSocket = element.shadowRoot.querySelector('button[aria-label="Increase Socket quantity"]');
  if (!increaseSocket) {
    element.shadowRoot.querySelector(".group-toggle").click();
    await settle(element);
    increaseSocket = element.shadowRoot.querySelector('button[aria-label="Increase Socket quantity"]');
  }
  increaseSocket.click();
  increaseSocket.click();
  await settle(element);
  assert.match(element.shadowRoot.textContent, /2 assets/);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);

  assert.match(element.shadowRoot.textContent, /Nothing was saved/);
  assert.equal(element._activeDrafts.length, 2);
  const failedCode = element.shadowRoot.querySelector("#draft-socket-2-code");
  assert.equal(failedCode.getAttribute("aria-invalid"), "true");
  assert.equal(element.shadowRoot.activeElement, failedCode);

  const firstDraft = element._activeDrafts[0];
  element._updateDraft(firstDraft.key, { name: "First edited socket" });
  await settle(element);
  assert.equal(element._saveError.field, "code");
  const secondDraft = element._activeDrafts[1];
  element._updateDraft(secondDraft.key, { name: "Second edited socket" });
  await settle(element);
  assert.equal(element._saveError.field, "code");

  failedCode.value = "SOCKET-2";
  failedCode.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(element);
  assert.equal(element._saveError, null);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);

  assert.match(element.shadowRoot.textContent, /2 assets created/);
  assert.match(element.shadowRoot.textContent, /Only physical inventory was created/);
  assert.equal(element._activeDrafts.length, 0);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create_bulk").length, 2);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create").length, 0);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/list").length, 1);
});


// ---------------------------------------------------------------------------
// UX-4 topology refresh generation tests
// ---------------------------------------------------------------------------

function topologyDeferred() {
  let resolve;
  let reject;

  const promise = new Promise(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    },
  );

  return {
    promise,
    resolve,
    reject,
  };
}

test(
  "out-of-order topology refreshes cannot overwrite the newest snapshot",
  async () => {
    const pending = [];

    const panel = document.createElement(
      "bindhome-panel",
    );

    panel.hass = {
      callWS: (message) => {
        assert.equal(
          message.type,
          "bindhome/registry/get",
        );

        const operation =
          topologyDeferred();

        pending.push(operation);

        return operation.promise;
      },
      states: {},
    };

    panel._initialized = true;

    const first =
      panel._refreshTopologyData();

    const second =
      panel._refreshTopologyData();

    assert.equal(pending.length, 2);

    pending[1].resolve({
      assets: [
        {
          id: "topology-new",
        },
      ],
      relations: [
        {
          id: "relation-new",
        },
      ],
      bindings: [],
      representations: [],
    });

    await second;

    pending[0].resolve({
      assets: [
        {
          id: "topology-old",
        },
      ],
      relations: [
        {
          id: "relation-old",
        },
      ],
      bindings: [],
      representations: [],
    });

    await first;

    assert.deepEqual(
      panel._registry.assets,
      [
        {
          id: "topology-new",
        },
      ],
    );

    assert.deepEqual(
      panel._registry.relations,
      [
        {
          id: "relation-new",
        },
      ],
    );

    assert.deepEqual(
      panel._assets,
      [
        {
          id: "topology-new",
        },
      ],
    );
  },
);

test(
  "a newer full load wins over an older topology refresh",
  async () => {
    const pendingRegistry = [];
    const pendingStatuses = [];

    const callWS = (message) => {
      if (
        message.type ===
        "bindhome/registry/get"
      ) {
        const operation =
          topologyDeferred();

        pendingRegistry.push(
          operation,
        );

        return operation.promise;
      }

      if (
        message.type ===
        "bindhome/bindings/status"
      ) {
        const operation =
          topologyDeferred();

        pendingStatuses.push(
          operation,
        );

        return operation.promise;
      }

      if (
        message.type ===
        "bindhome/presets/list"
      ) {
        return Promise.resolve({
          presets,
        });
      }

      if (
        message.type ===
        "bindhome/assets/list"
      ) {
        return Promise.resolve({
          assets: [
            {
              id: "full-list",
            },
          ],
        });
      }

      if (
        message.type ===
          "config/entity_registry/list" ||
        message.type ===
          "config/device_registry/list"
      ) {
        return Promise.resolve([]);
      }

      if (
        message.type ===
          "config/floor_registry/list" ||
        message.type ===
          "config/area_registry/list"
      ) {
        return Promise.resolve([]);
      }

      if (
        message.type ===
        "frontend/get_translations"
      ) {
        return Promise.resolve({
          resources:
            englishResources,
        });
      }

      throw new Error(
        `Unexpected call: ${message.type}`,
      );
    };

    const panel = document.createElement(
      "bindhome-panel",
    );

    panel.hass = {
      callWS,
      states: {},
    };

    panel._initialized = true;

    const topology =
      panel._refreshTopologyData();

    const full =
      panel._load(false);

    assert.equal(
      pendingRegistry.length,
      2,
    );

    assert.equal(
      pendingStatuses.length,
      1,
    );

    /*
     * Registry call #0 belongs to
     * the older topology refresh.
     *
     * Registry call #1 belongs to
     * the newer full load.
     */
    pendingRegistry[1].resolve({
      assets: [
        {
          id: "full-registry",
        },
      ],
      relations: [
        {
          id: "full-relation",
        },
      ],
      bindings: [],
      representations: [],
    });

    pendingStatuses[0].resolve({
      records: [
        {
          asset_id:
            "full-registry",
        },
      ],
      summary: {},
    });

    await full;

    pendingRegistry[0].resolve({
      assets: [
        {
          id: "stale-topology",
        },
      ],
      relations: [
        {
          id: "stale-relation",
        },
      ],
      bindings: [],
      representations: [],
    });

    await topology;

    assert.deepEqual(
      panel._registry.assets,
      [
        {
          id: "full-registry",
        },
      ],
    );

    assert.deepEqual(
      panel._registry.relations,
      [
        {
          id: "full-relation",
        },
      ],
    );

    assert.deepEqual(
      panel._bindingStatuses.records,
      [
        {
          asset_id:
            "full-registry",
        },
      ],
    );

    /*
     * Full load owns _assets from
     * bindhome/assets/list.
     */
    assert.deepEqual(
      panel._assets,
      [
        {
          id: "full-list",
        },
      ],
    );
  },
);

test(
  "a newer topology refresh wins over an older full load",
  async () => {
    const pendingRegistry = [];
    const pendingStatuses = [];

    const callWS = (message) => {
      if (
        message.type ===
        "bindhome/registry/get"
      ) {
        const operation =
          topologyDeferred();

        pendingRegistry.push(
          operation,
        );

        return operation.promise;
      }

      if (
        message.type ===
        "bindhome/bindings/status"
      ) {
        const operation =
          topologyDeferred();

        pendingStatuses.push(
          operation,
        );

        return operation.promise;
      }

      if (
        message.type ===
        "bindhome/presets/list"
      ) {
        return Promise.resolve({
          presets,
        });
      }

      if (
        message.type ===
        "bindhome/assets/list"
      ) {
        return Promise.resolve({
          assets: [
            {
              id: "old-full-list",
            },
          ],
        });
      }

      if (
        message.type ===
          "config/entity_registry/list" ||
        message.type ===
          "config/device_registry/list"
      ) {
        return Promise.resolve([]);
      }

      if (
        message.type ===
          "config/floor_registry/list" ||
        message.type ===
          "config/area_registry/list"
      ) {
        return Promise.resolve([]);
      }

      if (
        message.type ===
        "frontend/get_translations"
      ) {
        return Promise.resolve({
          resources:
            englishResources,
        });
      }

      throw new Error(
        `Unexpected call: ${message.type}`,
      );
    };

    const panel = document.createElement(
      "bindhome-panel",
    );

    panel.hass = {
      callWS,
      states: {},
    };

    panel._initialized = true;

    const full =
      panel._load(false);

    const topology =
      panel._refreshTopologyData();

    assert.equal(
      pendingRegistry.length,
      2,
    );

    assert.equal(
      pendingStatuses.length,
      1,
    );

    /*
     * Registry #0 belongs to
     * the old full load.
     *
     * Registry #1 belongs to
     * the newer topology refresh.
     */
    pendingRegistry[1].resolve({
      assets: [
        {
          id: "new-topology",
        },
      ],
      relations: [
        {
          id: "new-topology-relation",
        },
      ],
      bindings: [],
      representations: [],
    });

    await topology;

    pendingRegistry[0].resolve({
      assets: [
        {
          id: "old-full",
        },
      ],
      relations: [
        {
          id: "old-full-relation",
        },
      ],
      bindings: [],
      representations: [],
    });

    pendingStatuses[0].resolve({
      records: [
        {
          asset_id:
            "old-full",
        },
      ],
      summary: {},
    });

    await full;

    assert.deepEqual(
      panel._registry.assets,
      [
        {
          id: "new-topology",
        },
      ],
    );

    assert.deepEqual(
      panel._registry.relations,
      [
        {
          id:
            "new-topology-relation",
        },
      ],
    );

    assert.deepEqual(
      panel._assets,
      [
        {
          id: "new-topology",
        },
      ],
    );

    /*
     * The stale full load must not
     * apply its Binding snapshot.
     */
    assert.deepEqual(
      panel._bindingStatuses.records,
      [],
    );
  },
);

test(
  "a newer failed topology refresh prevents an older topology snapshot from applying",
  async () => {
    const pending = [];

    const panel = document.createElement(
      "bindhome-panel",
    );

    panel.hass = {
      callWS: (message) => {
        assert.equal(
          message.type,
          "bindhome/registry/get",
        );

        const operation =
          topologyDeferred();

        pending.push(operation);

        return operation.promise;
      },
      states: {},
    };

    panel._initialized = true;

    panel._registry = {
      assets: [
        {
          id: "baseline",
        },
      ],
      relations: [],
      bindings: [],
      representations: [],
    };

    panel._assets = [
      {
        id: "baseline",
      },
    ];

    const older =
      panel._refreshTopologyData();

    const newer =
      panel._refreshTopologyData();

    assert.equal(pending.length, 2);

    pending[1].reject(
      new Error(
        "new topology refresh failed",
      ),
    );

    await assert.rejects(
      newer,
      /new topology refresh failed/,
    );

    /*
     * The older request eventually
     * succeeds, but its generation is
     * obsolete because a newer refresh
     * was already initiated.
     */
    pending[0].resolve({
      assets: [
        {
          id: "stale-success",
        },
      ],
      relations: [
        {
          id: "stale-relation",
        },
      ],
      bindings: [],
      representations: [],
    });

    await older;

    assert.deepEqual(
      panel._registry.assets,
      [
        {
          id: "baseline",
        },
      ],
    );

    assert.deepEqual(
      panel._registry.relations,
      [],
    );

    assert.deepEqual(
      panel._assets,
      [
        {
          id: "baseline",
        },
      ],
    );
  },
);
