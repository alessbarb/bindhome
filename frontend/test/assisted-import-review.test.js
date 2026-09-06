import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";

import { createBindHomeApi } from "../src/api/bindhome-api.js";
import {
  createImportReviewState,
  importBatchReady,
  serializeImportDecisions,
  setImportAction,
  setImportMergeTarget,
  toggleImportBinding,
  updateImportAsset,
} from "../src/add/import-review-state.js";

const proposal = {
  proposal_id: "proposal-1",
  source: {
    area_id: "living",
    device_id: "device-1",
    entity_ids: ["switch.relay"],
    entity_registry_ids: ["registry-1"],
  },
  asset: {
    name: "Relay",
    asset_type: "switch",
    area_id: "living",
    capabilities: ["on_off"],
  },
  bindings: [
    {
      capability: "on_off",
      role: "primary",
      entity_id: "switch.relay",
      entity_registry_id: "registry-1",
    },
  ],
  duplicate_status: "possible_asset_match",
  merge_candidate_asset_ids: ["asset-existing"],
};

const discovery = {
  scope: { type: "area", area_id: "living" },
  revision: 7,
  count: 1,
  proposals: [proposal],
};

test("review state preserves explicit create edits and selected bindings", () => {
  let state = createImportReviewState(discovery);
  state = setImportAction(state, proposal.proposal_id, "create");
  state = updateImportAsset(state, proposal.proposal_id, {
    name: "Ceiling relay",
    asset_type: "relay_point",
  });

  assert.equal(importBatchReady(state), true);
  assert.deepEqual(serializeImportDecisions(state), [
    {
      proposal_id: "proposal-1",
      action: "create",
      asset: {
        name: "Ceiling relay",
        asset_type: "relay_point",
        capabilities: ["on_off"],
        area_id: "living",
      },
      bindings: [
        {
          capability: "on_off",
          role: "primary",
          entity_id: "switch.relay",
          entity_registry_id: "registry-1",
        },
      ],
    },
  ]);

  state = toggleImportBinding(state, proposal.proposal_id, proposal.bindings[0]);
  assert.deepEqual(serializeImportDecisions(state)[0].bindings, []);
});

test("merge review requires an explicit stable Asset target", () => {
  let state = createImportReviewState(discovery);
  state = setImportAction(state, proposal.proposal_id, "merge");
  assert.equal(importBatchReady(state), false);

  state = setImportMergeTarget(state, proposal.proposal_id, "asset-existing");
  assert.equal(importBatchReady(state), true);
  assert.equal(serializeImportDecisions(state)[0].target_asset_id, "asset-existing");
});

test("import commit uses the discovery revision even after another read updates API state", async () => {
  const calls = [];
  const hass = {
    connection: {},
    async callWS(message) {
      calls.push(message);
      if (message.type === "bindhome/import/discover") return discovery;
      if (message.type === "bindhome/registry/get") return { revision: 11 };
      if (message.type === "bindhome/import/commit") return { revision: 8 };
      return {};
    },
  };
  const api = createBindHomeApi(hass);

  const reviewed = await api.discoverImport("living");
  await api.getRegistry();
  await api.commitImport({
    areaId: "living",
    revision: reviewed.revision,
    decisions: [{ proposal_id: "proposal-1", action: "skip" }],
  });

  assert.deepEqual(calls.at(-1), {
    type: "bindhome/import/commit",
    decisions: [{ proposal_id: "proposal-1", action: "skip" }],
    area_id: "living",
    based_on_revision: 7,
  });
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

if (!customElements.get("ha-icon")) {
  customElements.define("ha-icon", class extends HTMLElement {});
}

await import("../src/add/assisted-import-workflow.js");
await import("../src/add/add-view.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("Añadir exposes assisted import and failed commit preserves local review", async () => {
  const calls = [];
  const hass = {
    connection: {},
    async callWS(message) {
      calls.push(message);
      if (message.type === "bindhome/import/discover") return discovery;
      if (message.type === "bindhome/import/commit") {
        const error = new Error("Registry changed");
        error.code = "conflict";
        throw error;
      }
      return {};
    },
  };
  const add = document.createElement("bindhome-add-view");
  add.hass = hass;
  add.t = (key) => key;
  add.areas = [{ area_id: "living", name: "Living room", icon: "mdi:sofa" }];
  add.assets = [{ id: "asset-existing", name: "Existing relay" }];
  add.presets = [];
  document.body.append(add);
  await settle(add);

  add._mode = "import";
  await settle(add);
  const workflow = add.shadowRoot.querySelector("bindhome-assisted-import-workflow");
  assert.ok(workflow);
  await workflow._discover();
  await settle(workflow);

  workflow._setAction("proposal-1", "create");
  workflow._updateAsset("proposal-1", { name: "Edited relay" });
  assert.equal(importBatchReady(workflow._reviewState), true);
  await workflow._commit();
  await settle(workflow);

  assert.equal(workflow._reviewState.reviews[0].asset.name, "Edited relay");
  assert.equal(workflow._reviewState.reviews[0].action, "create");
  assert.match(workflow._error, /Registry changed/);
  assert.equal(calls.at(-1).based_on_revision, 7);
  assert.match(workflow.shadowRoot.textContent, /import\.review_preserved/);
});
