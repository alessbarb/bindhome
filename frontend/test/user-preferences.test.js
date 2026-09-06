import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";
import {
  ADVANCED_PINNED_PREFERENCE,
  COLLAPSED_FLOORS_PREFERENCE,
  ONBOARDING_DISMISSED_PREFERENCE,
  loadBooleanPreference,
  loadStringArrayPreference,
  readUserPreference,
  saveUserPreference,
} from "../src/api/user-preferences.js";

const window = new Window({ url: "http://localhost/bindhome" });
Object.assign(globalThis, { window });

function connectionFor(store, calls = []) {
  return {
    async sendMessagePromise(message) {
      calls.push(message);
      if (message.type === "frontend/get_user_data") {
        return { value: store.has(message.key) ? store.get(message.key) : null };
      }
      if (message.type === "frontend/set_user_data") {
        store.set(message.key, message.value);
        return undefined;
      }
      throw new Error(`Unexpected message ${message.type}`);
    },
  };
}

test("user preference API uses Home Assistant frontend user-data contracts", async () => {
  const store = new Map();
  const calls = [];
  const hass = { connection: connectionFor(store, calls) };

  assert.deepEqual(await readUserPreference(hass, ADVANCED_PINNED_PREFERENCE), {
    available: true,
    value: null,
  });
  assert.equal(
    await saveUserPreference(hass, ADVANCED_PINNED_PREFERENCE, true),
    true,
  );
  assert.deepEqual(calls, [
    { type: "frontend/get_user_data", key: ADVANCED_PINNED_PREFERENCE },
    {
      type: "frontend/set_user_data",
      key: ADVANCED_PINNED_PREFERENCE,
      value: true,
    },
  ]);
});

test("server-side user data wins over stale browser-local preferences", async () => {
  window.localStorage.clear();
  window.localStorage.setItem("legacy-advanced", "false");
  const store = new Map([[ADVANCED_PINNED_PREFERENCE, true]]);
  const hass = { connection: connectionFor(store) };

  assert.equal(
    await loadBooleanPreference(
      hass,
      ADVANCED_PINNED_PREFERENCE,
      "legacy-advanced",
    ),
    true,
  );
  assert.equal(window.localStorage.getItem("legacy-advanced"), "false");
});

test("legacy boolean preference migrates once when HA user data is unset", async () => {
  window.localStorage.clear();
  window.localStorage.setItem("legacy-onboarding", "true");
  const store = new Map();
  const hass = { connection: connectionFor(store) };

  assert.equal(
    await loadBooleanPreference(
      hass,
      ONBOARDING_DISMISSED_PREFERENCE,
      "legacy-onboarding",
    ),
    true,
  );
  assert.equal(store.get(ONBOARDING_DISMISSED_PREFERENCE), true);
  assert.equal(window.localStorage.getItem("legacy-onboarding"), null);
});

test("legacy collapsed floors migrate as a normalized independent key", async () => {
  window.localStorage.clear();
  window.localStorage.setItem(
    "legacy-floors",
    JSON.stringify(["upper", "ground", "upper", 3]),
  );
  const store = new Map([[ADVANCED_PINNED_PREFERENCE, true]]);
  const hass = { connection: connectionFor(store) };

  assert.deepEqual(
    await loadStringArrayPreference(
      hass,
      COLLAPSED_FLOORS_PREFERENCE,
      "legacy-floors",
    ),
    ["ground", "upper"],
  );
  assert.equal(store.get(ADVANCED_PINNED_PREFERENCE), true);
  assert.deepEqual(store.get(COLLAPSED_FLOORS_PREFERENCE), ["ground", "upper"]);
});

test("unavailable HA user-data storage fails safe and leaves legacy data intact", async () => {
  window.localStorage.clear();
  window.localStorage.setItem("legacy-advanced", "true");
  const hass = {
    connection: {
      async sendMessagePromise() {
        throw new Error("offline");
      },
    },
  };

  assert.equal(
    await loadBooleanPreference(
      hass,
      ADVANCED_PINNED_PREFERENCE,
      "legacy-advanced",
    ),
    true,
  );
  assert.equal(window.localStorage.getItem("legacy-advanced"), "true");
  assert.equal(
    await saveUserPreference(hass, ADVANCED_PINNED_PREFERENCE, false),
    false,
  );
});
