import assert from "node:assert/strict";
import test from "node:test";

import { createBindHomeApi } from "../src/api/bindhome-api.js";
import {
  bindingStatusKey,
  getBindingStatus,
  indexBindingStatuses,
} from "../src/bindings/binding-state.js";

test("binding API uses exact WebSocket contracts", async () => {
  const calls = [];
  const api = createBindHomeApi({
    async callWS(message) {
      calls.push(message);
      return { records: [], summary: {} };
    },
  });

  await api.listBindingStatuses();
  await api.setBinding({
    assetId: "asset-a",
    capability: "on_off",
    entityId: "switch.a",
  });
  await api.setBinding({
    assetId: "asset-b",
    capability: "temperature",
    entityId: "sensor.b",
    role: "backup",
  });
  await api.deleteBinding("binding-1");

  assert.deepEqual(calls, [
    { type: "bindhome/bindings/status" },
    {
      type: "bindhome/bindings/set",
      asset_id: "asset-a",
      capability: "on_off",
      entity_id: "switch.a",
      role: "primary",
    },
    {
      type: "bindhome/bindings/set",
      asset_id: "asset-b",
      capability: "temperature",
      entity_id: "sensor.b",
      role: "backup",
    },
    { type: "bindhome/bindings/delete", binding_id: "binding-1" },
  ]);
});

test("binding statuses preserve composite identity and semantic states", () => {
  const records = [
    {
      asset_id: "asset-a",
      capability: "on_off",
      role: "primary",
      status: "binding_not_found",
      config_valid: false,
      runtime_available: false,
    },
    {
      asset_id: "asset-a",
      capability: "on_off",
      role: "backup",
      status: "runtime_unavailable",
      config_valid: true,
      runtime_available: false,
    },
    {
      asset_id: "asset-b",
      capability: "temperature",
      role: "primary",
      status: "entity_not_found",
      config_valid: false,
      runtime_available: false,
    },
  ];
  const index = indexBindingStatuses({ records });
  assert.equal(bindingStatusKey("asset-a", "on_off"), "asset-a:on_off:primary");
  assert.notEqual(
    bindingStatusKey("asset-a", "on_off"),
    bindingStatusKey("asset-a", "on_off", "backup"),
  );
  assert.equal(getBindingStatus(index, "asset-a", "on_off").status, "binding_not_found");
  assert.equal(getBindingStatus(index, "asset-a", "on_off", "backup").config_valid, true);
  assert.equal(getBindingStatus(index, "asset-b", "temperature").status, "entity_not_found");
  assert.equal(getBindingStatus(index, "missing", "on_off"), null);
});
