import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBulkError } from "../src/api/normalize-ws-error.js";
import { createDraftState, setPresetQuantity } from "../src/inventory/draft-state.js";
import { InventorySaveController } from "../src/inventory/inventory-controller.js";

const preset = { preset_id: "socket", group: "electrical", asset_type: "socket", default_name: "Socket", suggested_capabilities: [] };

test("structured and malformed Home Assistant errors normalize safely", () => {
  assert.deepEqual(normalizeBulkError({ message: '{"index":1,"field":"code","message":"Duplicate"}' }), { structured: true, index: 1, field: "code", message: "Duplicate" });
  assert.deepEqual(normalizeBulkError({ message: "not-json" }), { structured: false, index: null, field: null, message: "not-json" });
  assert.match(normalizeBulkError(null).message, /could not be saved/);
});

test("save uses one bulk call, no individual create, then refreshes Assets", async () => {
  const calls = [];
  const api = {
    async createAssetsBulk(assets) { calls.push(["bulk", assets]); return { assets: [{ id: "new" }] }; },
    async listAssets() { calls.push(["list"]); return [{ id: "new", area_id: "area-1" }]; },
    async createAsset() { calls.push(["individual"]); },
  };
  const state = setPresetQuantity(createDraftState([preset]), "socket", 2);
  const result = await new InventorySaveController(api).save(state, "area-1");
  assert.equal(result.ok, true);
  assert.equal(calls.filter(([type]) => type === "bulk").length, 1);
  assert.equal(calls.filter(([type]) => type === "individual").length, 0);
  assert.deepEqual(calls.map(([type]) => type), ["bulk", "list"]);
});

test("failure preserves caller draft state and identifies affected field", async () => {
  const state = setPresetQuantity(createDraftState([preset]), "socket", 2);
  const api = { async createAssetsBulk() { throw new Error('{"index":1,"field":"code","message":"Duplicate"}'); }, async listAssets() { throw new Error("must not refresh after failure"); } };
  const result = await new InventorySaveController(api).save(state, "area-1");
  assert.equal(result.ok, false);
  assert.deepEqual(result.error, { structured: true, index: 1, field: "code", message: "Duplicate" });
  assert.equal(state.quantities.get("socket"), 2);
});

test("duplicate submission is blocked while the first request is pending", async () => {
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  let bulkCalls = 0;
  const api = { async createAssetsBulk() { bulkCalls += 1; await pending; return { assets: [] }; }, async listAssets() { return []; } };
  const controller = new InventorySaveController(api);
  const state = setPresetQuantity(createDraftState([preset]), "socket", 1);
  const first = controller.save(state, "area-1");
  const second = await controller.save(state, "area-1");
  assert.deepEqual(second, { ok: false, duplicate: true });
  assert.equal(bulkCalls, 1);
  release();
  await first;
});
