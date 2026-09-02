import assert from "node:assert/strict";
import test from "node:test";

import { createHomeAssistantApi } from "../src/api/home-assistant-api.js";
import {
  normalizeEntityCandidates,
  searchEntityCandidates,
} from "../src/bindings/entity-catalogue.js";

test("HA registry API reads entity and device registries", async () => {
  const calls = [];
  const api = createHomeAssistantApi({
    async callWS(message) {
      calls.push(message);
      return message.type === "config/entity_registry/list" ? [{ entity_id: "switch.a" }] : [{ id: "device-a" }];
    },
  });
  assert.deepEqual(await api.listEntityRegistry(), [{ entity_id: "switch.a" }]);
  assert.deepEqual(await api.listDeviceRegistry(), [{ id: "device-a" }]);
  assert.deepEqual(calls, [
    { type: "config/entity_registry/list" },
    { type: "config/device_registry/list" },
  ]);
});

test("candidate catalogue unions registry and state-only entities without duplicates", () => {
  const candidates = normalizeEntityCandidates({
    entityRegistry: [
      {
        entity_id: "switch.registry_only",
        name: "Registry name",
        device_id: "device-a",
        area_id: null,
        disabled_by: "user",
        hidden_by: "integration",
        platform: "demo",
      },
      {
        entity_id: "light.logical",
        original_name: "Logical light",
        platform: "bindhome",
        device_id: "device-a",
      },
      { entity_id: "switch.lookalike", platform: "other" },
    ],
    deviceRegistry: [{ id: "device-a", name: "Panel", area_id: "utility" }],
    states: {
      "switch.registry_only": {
        state: "off",
        attributes: { friendly_name: "Live registry name" },
      },
      "sensor.state_only": {
        state: "on",
        attributes: { friendly_name: "State sensor" },
      },
    },
    areas: [{ area_id: "utility", name: "Utility room" }],
  });

  assert.equal(candidates.length, 4);
  const byId = Object.fromEntries(candidates.map((candidate) => [candidate.entityId, candidate]));
  assert.equal(byId["switch.registry_only"].name, "Live registry name");
  assert.equal(byId["switch.registry_only"].state, "off");
  assert.equal(byId["switch.registry_only"].areaId, "utility");
  assert.equal(byId["switch.registry_only"].areaName, "Utility room");
  assert.equal(byId["switch.registry_only"].disabled, true);
  assert.equal(byId["switch.registry_only"].hidden, true);
  assert.equal(byId["light.logical"].isBindHome, true);
  assert.equal(byId["switch.lookalike"].isBindHome, false);
  assert.equal(byId["sensor.state_only"].name, "State sensor");
  assert.equal(byId["sensor.state_only"].registryEntry, null);
});

test("candidate metadata applies name and Area precedence", () => {
  const [candidate] = normalizeEntityCandidates({
    entityRegistry: [{ entity_id: "switch.a", name: "Entity name", device_id: "device-a", area_id: "entity-area" }],
    deviceRegistry: [{ id: "device-a", name_by_user: "User device", name: "Native device", area_id: "device-area" }],
    states: { "switch.a": { state: "unavailable", attributes: {} } },
    areas: [
      { area_id: "entity-area", name: "Entity room" },
      { area_id: "device-area", name: "Device room" },
    ],
  });
  assert.equal(candidate.name, "Entity name");
  assert.equal(candidate.deviceName, "User device");
  assert.equal(candidate.areaId, "entity-area");
  assert.equal(candidate.areaName, "Entity room");
  assert.equal(candidate.state, "unavailable");

  const [fallback] = normalizeEntityCandidates({
    entityRegistry: [{ entity_id: "switch.b", device_id: "device-b" }],
    deviceRegistry: [{ id: "device-b", name: "Native", area_id: "device-area" }],
    areas: [{ area_id: "device-area", name: "Device room" }],
  });
  assert.equal(fallback.name, "switch.b");
  assert.equal(fallback.areaName, "Device room");
});

test("candidate search matches metadata and ranks same Area without filtering", () => {
  const candidates = normalizeEntityCandidates({
    entityRegistry: [
      { entity_id: "switch.kitchen", name: "Counter outlet", area_id: "kitchen" },
      { entity_id: "light.living", name: "Living lamp", area_id: "living" },
    ],
    areas: [
      { area_id: "kitchen", name: "Kitchen" },
      { area_id: "living", name: "Living room" },
    ],
  });
  assert.deepEqual(searchEntityCandidates(candidates, "outlet").map((item) => item.entityId), ["switch.kitchen"]);
  assert.deepEqual(searchEntityCandidates(candidates, "living").map((item) => item.entityId), ["light.living"]);
  assert.deepEqual(searchEntityCandidates(candidates, "", "living").map((item) => item.entityId), ["light.living", "switch.kitchen"]);
});
