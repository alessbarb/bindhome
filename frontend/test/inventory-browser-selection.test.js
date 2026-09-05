import assert from "node:assert/strict";
import test from "node:test";

import {
  NO_AREA_KEY,
  UNKNOWN_AREA_KEY,
  locationKeyForAsset,
  replaceInventoryAsset,
  targetForInventoryKey,
} from "../src/inventory/inventory-browser-selection.js";

const t = (key) => key;
const area = { area_id: "living", name: "Living room", floor_id: "ground" };
const asset = { id: "a1", name: "Lamp", asset_type: "light", area_id: "living" };
const hierarchy = {
  floors: [{ floor: { floor_id: "ground" }, areas: [{ area, assets: [asset] }] }],
  noFloorAreas: [],
  noAreaAssets: [{ id: "a2", name: "Loose", asset_type: "sensor", area_id: null }],
  unknownAreaAssets: [{ id: "a3", name: "Stale", asset_type: "socket", area_id: "gone" }],
};

test("inventory target selection resolves normal and special locations", () => {
  assert.deepEqual(targetForInventoryKey("living", hierarchy, t), {
    kind: "area",
    title: "Living room",
    description: "",
    area,
    assets: [asset],
  });
  assert.equal(targetForInventoryKey(NO_AREA_KEY, hierarchy, t)?.kind, "no-area");
  assert.equal(targetForInventoryKey(UNKNOWN_AREA_KEY, hierarchy, t)?.kind, "unknown-area");
  assert.equal(targetForInventoryKey("missing", hierarchy, t), null);
});

test("location keys distinguish known, missing and stale Areas", () => {
  assert.equal(locationKeyForAsset(asset, [area]), "living");
  assert.equal(
    locationKeyForAsset({ ...asset, area_id: null }, [area]),
    NO_AREA_KEY,
  );
  assert.equal(
    locationKeyForAsset({ ...asset, area_id: "gone" }, [area]),
    UNKNOWN_AREA_KEY,
  );
});

test("replacing an updated Asset is immutable and preserves neighbors", () => {
  const other = { id: "a9", name: "Other", asset_type: "socket" };
  const assets = [asset, other];
  const updated = { ...asset, name: "Updated lamp" };
  const next = replaceInventoryAsset(assets, updated);

  assert.notEqual(next, assets);
  assert.equal(next[0], updated);
  assert.equal(next[1], other);
  assert.equal(assets[0], asset);
});
