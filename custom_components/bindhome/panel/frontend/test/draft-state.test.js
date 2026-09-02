import assert from "node:assert/strict";
import test from "node:test";
import { activeDrafts, createDraftState, filterAssetsByArea, serializeActiveDrafts, setPresetQuantity, updateDraft } from "../src/inventory/draft-state.js";

const presets = [
  { preset_id: "light_point", group: "electrical", asset_type: "light_point", default_name: "Light point", suggested_capabilities: ["on_off"] },
  { preset_id: "socket", group: "electrical", asset_type: "socket", default_name: "Socket", suggested_capabilities: [] },
];

test("quantities generate deterministic drafts only from preset metadata", () => {
  let state = createDraftState(presets);
  state = setPresetQuantity(state, "light_point", 2);
  state = setPresetQuantity(state, "socket", 1);
  assert.deepEqual(activeDrafts(state).map(({ name, asset_type, code, capabilities }) => ({ name, asset_type, code, capabilities })), [
    { name: "Light point 1", asset_type: "light_point", code: null, capabilities: ["on_off"] },
    { name: "Light point 2", asset_type: "light_point", code: null, capabilities: ["on_off"] },
    { name: "Socket 1", asset_type: "socket", code: null, capabilities: [] },
  ]);
});

test("decreasing hides drafts and increasing restores retained edits", () => {
  let state = setPresetQuantity(createDraftState(presets), "socket", 2);
  state = updateDraft(state, "draft:socket:2", { name: "Desk socket", asset_type: "custom_socket", capabilities: ["custom_measurement"] });
  state = setPresetQuantity(state, "socket", 1);
  assert.equal(activeDrafts(state).length, 1);
  assert.equal(serializeActiveDrafts(state, "living_room").length, 1, "inactive retained drafts are excluded");
  state = setPresetQuantity(state, "socket", 2);
  assert.deepEqual(activeDrafts(state)[1], { key: "draft:socket:2", presetId: "socket", name: "Desk socket", asset_type: "custom_socket", code: null, capabilities: ["custom_measurement"] });
});

test("serialization preserves custom fields and omits blank optional code", () => {
  let state = setPresetQuantity(createDraftState(presets), "socket", 1);
  state = updateDraft(state, "draft:socket:1", { asset_type: "custom_type", code: "  S-1  ", capabilities: ["custom_capability"] });
  assert.deepEqual(serializeActiveDrafts(state, "area-1"), [{ name: "Socket 1", asset_type: "custom_type", code: "S-1", area_id: "area-1", capabilities: ["custom_capability"] }]);
  state = updateDraft(state, "draft:socket:1", { code: " " });
  assert.equal("code" in serializeActiveDrafts(state, "area-1")[0], false);
});

test("existing assets are filtered by exact Home Assistant Area reference", () => {
  const assets = [{ id: "1", area_id: "living_room" }, { id: "2", area_id: "kitchen" }, { id: "3", area_id: null }];
  assert.deepEqual(filterAssetsByArea(assets, "living_room"), [assets[0]]);
});
