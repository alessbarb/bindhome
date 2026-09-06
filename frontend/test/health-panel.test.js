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
});

await import("../src/advanced/health-tool.js");

function healthElement() {
  const element = document.createElement("bindhome-health-tool");
  element.t = (key, vars = {}) => `${key}${vars.count !== undefined ? `:${vars.count}` : ""}`;
  element.areas = [{ area_id: "kitchen", name: "Kitchen" }];
  element.assets = [
    { id: "a1", name: "Kitchen light", area_id: "kitchen" },
    { id: "a2", name: "Old sensor", area_id: "removed-area" },
  ];
  element.bindingStatuses = {
    summary: { total: 4, config_valid: 2, runtime_available: 1, by_status: { resolved: 1, entity_not_found: 1, binding_not_found: 1, runtime_unavailable: 1 } },
    records: [
      { asset_id: "a1", capability: "light", status: "resolved", entity_id: "light.kitchen" },
      { asset_id: "a1", capability: "power", status: "entity_not_found", entity_id: "switch.old" },
      { asset_id: "a2", capability: "temperature", status: "binding_not_found", entity_id: null },
      { asset_id: "a1", capability: "light", status: "runtime_unavailable", entity_id: "light.kitchen" },
    ],
  };
  return element;
}

test("health surface uses backend binding summary and keeps transient unavailability non-actionable", async () => {
  const element = healthElement();
  element._recovery = { recovery_required: false };
  element._drift = [];
  element._referenceAudit = {
    summary: { references: 1, incomplete_sources: 0 },
    groups: [
      {
        entity_id: "light.kitchen",
        reference_count: 1,
        references: [
          {
            consumer_type: "automation",
            consumer_id: "automation.arrival",
            consumer_name: "Arrival",
            path: "automation.arrival",
            classification: "manual_review",
            replacement_entity_id: "light.bindhome_a1",
          },
        ],
      },
    ],
  };
  document.body.append(element);
  await element.updateComplete;
  const text = element.shadowRoot.textContent;
  assert.match(text, /health.bindings_total/);
  assert.match(text, /health.status.runtime_unavailable/);
  assert.match(text, /health.direct_reference_debt/);
  assert.match(text, /automation\.arrival/);
  assert.match(text, /health.reference_manual/);
  assert.equal(element._actionableBindings().length, 1);
  assert.equal(element._staleAreas().length, 1);
  element.remove();
});

test("supplemental health reuses recovery, import discovery and reference audit", async () => {
  const calls = [];
  const element = healthElement();
  element.hass = {
    connection: {},
    callWS: async (message) => {
      calls.push(message.type);
      if (message.type === "bindhome/backup/recovery_status") return { recovery_required: true, entry_state: "setup_error", recovery: {} };
      if (message.type === "bindhome/import/discover") return {
        proposals: [
          { duplicate_status: "new", asset: { area_id: "kitchen" }, source: { entity_ids: ["sensor.one", "switch.two"] }, bindings: [] },
          { duplicate_status: "already_bound", asset: { area_id: "kitchen" }, source: { entity_ids: ["light.bound"] }, bindings: [] },
        ],
      };
      if (message.type === "bindhome/references/audit") return {
        summary: { references: 2, incomplete_sources: 1 },
        groups: [],
        sources: [{ source: "dashboard", status: "unreadable", consumer_id: "wall" }],
      };
      throw new Error(`Unexpected ${message.type}`);
    },
  };
  await element._refreshSupplementalHealth();
  assert.equal(element._recovery.recovery_required, true);
  assert.deepEqual(element._drift, [{ areaId: "kitchen", count: 2 }]);
  assert.equal(element._referenceAudit.summary.references, 2);
  assert.deepEqual(calls.sort(), [
    "bindhome/backup/recovery_status",
    "bindhome/import/discover",
    "bindhome/references/audit",
  ]);
});

test("health actions route to existing remediation workflows", async () => {
  const element = healthElement();
  let opened = null;
  let imported = null;
  let recovery = false;
  element.addEventListener("health-open-asset", (event) => { opened = event.detail; });
  element.addEventListener("health-review-import", (event) => { imported = event.detail; });
  element.addEventListener("health-open-recovery", () => { recovery = true; });
  element._openAsset("a1");
  element._reviewImport("kitchen");
  element._openRecovery();
  assert.equal(opened, "a1");
  assert.equal(imported, "kitchen");
  assert.equal(recovery, true);
});
