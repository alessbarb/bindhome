import assert from "node:assert/strict";
import test from "node:test";

import {
  createBindHomeApi,
  subscribeBindHomeConflicts,
} from "../src/api/bindhome-api.js";

function createHarness() {
  const calls = [];
  const subscriptions = [];
  let revision = 4;
  let conflictNext = false;
  const connection = {
    async subscribeMessage(listener, message) {
      subscriptions.push({ listener, message });
      return () => subscriptions.splice(0, subscriptions.length);
    },
  };
  const hass = {
    connection,
    async callWS(message) {
      calls.push(message);
      if (message.type === "bindhome/registry/get") {
        return {
          schema_version: 2,
          assets: [],
          relations: [],
          bindings: [],
          representations: [],
          revision,
        };
      }
      if (conflictNext) {
        conflictNext = false;
        throw { code: "conflict", message: "stale Registry revision" };
      }
      revision += 1;
      return { revision };
    },
  };
  return {
    hass,
    calls,
    subscriptions,
    setConflictNext() {
      conflictNext = true;
    },
  };
}

test("mutations use and advance the last Registry revision read by the client", async () => {
  const harness = createHarness();
  const api = createBindHomeApi(harness.hass);

  await api.getRegistry();
  await api.setBinding({
    assetId: "asset-1",
    capability: "on_off",
    entityId: "light.kitchen",
  });
  await api.deleteBinding("binding-1");

  assert.equal(harness.calls[1].based_on_revision, 4);
  assert.equal(harness.calls[2].based_on_revision, 5);
});

test("conflict listeners are scoped to the Home Assistant connection", async () => {
  const harness = createHarness();
  const api = createBindHomeApi(harness.hass);
  await api.getRegistry();

  const conflicts = [];
  const unsubscribe = subscribeBindHomeConflicts(
    harness.hass,
    (error) => conflicts.push(error),
  );
  harness.setConflictNext();

  await assert.rejects(
    api.deleteBinding("binding-1"),
    (error) => error.code === "conflict",
  );
  assert.equal(conflicts.length, 1);

  unsubscribe();
});

test("Registry subscription delegates to the Home Assistant WebSocket connection", async () => {
  const harness = createHarness();
  const api = createBindHomeApi(harness.hass);
  const events = [];

  const unsubscribe = await api.subscribeRegistryChanges((event) => events.push(event));

  assert.deepEqual(harness.subscriptions[0].message, {
    type: "bindhome/registry/subscribe",
  });
  harness.subscriptions[0].listener({ revision: 9 });
  assert.deepEqual(events, [{ revision: 9 }]);

  unsubscribe();
  assert.equal(harness.subscriptions.length, 0);
});
