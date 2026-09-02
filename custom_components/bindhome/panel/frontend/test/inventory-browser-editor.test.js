import assert from "node:assert/strict";
import test from "node:test";

import { createBindHomeApi } from "../src/api/bindhome-api.js";
import {
  assetEditHasChanges,
  buildAssetUpdatePatch,
  buildInventoryHierarchy,
  createAssetEditDraft,
} from "../src/inventory/inventory-browser-state.js";

test("inventory hierarchy uses live HA Floors and Areas without duplicating them", () => {
  const floor = {
    floor_id: "ground",
    name: "Ground floor",
    level: 0,
  };

  const floorlessArea = {
    area_id: "garden",
    name: "Garden",
    floor_id: null,
  };

  const room = {
    area_id: "living_room",
    name: "Living room",
    floor_id: "ground",
  };

  const assets = [
    {
      id: "a2",
      name: "Socket 2",
      area_id: "living_room",
    },
    {
      id: "a1",
      name: "Socket 1",
      area_id: "living_room",
    },
    {
      id: "a3",
      name: "Garden tap",
      area_id: "garden",
    },
    {
      id: "a4",
      name: "Loose spare",
      area_id: null,
    },
    {
      id: "a5",
      name: "Stale reference",
      area_id: "deleted_area",
    },
  ];

  const result = buildInventoryHierarchy(
    [floor],
    [room, floorlessArea],
    assets,
  );

  assert.equal(result.floors.length, 1);
  assert.equal(result.floors[0].floor, floor);
  assert.equal(result.floors[0].areas[0].area, room);

  assert.deepEqual(
    result.floors[0].areas[0].assets.map(
      (asset) => asset.id,
    ),
    ["a1", "a2"],
  );

  assert.equal(result.noFloorAreas.length, 1);
  assert.equal(
    result.noFloorAreas[0].area,
    floorlessArea,
  );

  assert.deepEqual(
    result.noAreaAssets.map((asset) => asset.id),
    ["a4"],
  );

  assert.deepEqual(
    result.unknownAreaAssets.map(
      (asset) => asset.id,
    ),
    ["a5"],
  );
});

test("asset edit draft copies editable values without mutating persisted Asset", () => {
  const asset = {
    id: "asset-1",
    name: "Window",
    asset_type: "custom_window",
    code: null,
    area_id: "living_room",
    capabilities: [
      "open_close",
      "custom_sensor",
    ],
  };

  const draft = createAssetEditDraft(asset);

  assert.deepEqual(draft, {
    asset_id: "asset-1",
    name: "Window",
    asset_type: "custom_window",
    code: "",
    area_id: "living_room",
    capabilities: [
      "open_close",
      "custom_sensor",
    ],
  });

  draft.name = "Edited window";
  draft.capabilities.push("another_custom_capability");

  assert.equal(asset.name, "Window");

  assert.deepEqual(asset.capabilities, [
    "open_close",
    "custom_sensor",
  ]);
});

test("asset update patch contains only changed fields and supports clearing optional values", () => {
  const asset = {
    id: "asset-1",
    name: "Radiator",
    asset_type: "radiator",
    code: "RAD-01",
    area_id: "bedroom",
    capabilities: ["temperature"],
  };

  const unchanged = createAssetEditDraft(asset);

  assert.deepEqual(
    buildAssetUpdatePatch(asset, unchanged),
    {
      asset_id: "asset-1",
    },
  );

  assert.equal(
    assetEditHasChanges(asset, unchanged),
    false,
  );

  const edited = {
    ...unchanged,
    name: "Main radiator",
    code: "   ",
    area_id: "",
    asset_type: "custom_heater",
    capabilities: [
      "temperature",
      "custom_heat_output",
    ],
  };

  assert.deepEqual(
    buildAssetUpdatePatch(asset, edited),
    {
      asset_id: "asset-1",
      name: "Main radiator",
      asset_type: "custom_heater",
      code: null,
      area_id: null,
      capabilities: [
        "temperature",
        "custom_heat_output",
      ],
    },
  );

  assert.equal(
    assetEditHasChanges(asset, edited),
    true,
  );
});

test("asset update draft identity cannot be retargeted", () => {
  const asset = {
    id: "asset-a",
    name: "Door",
    asset_type: "door",
    code: null,
    area_id: null,
    capabilities: [],
  };

  const draft = {
    ...createAssetEditDraft(asset),
    asset_id: "asset-b",
  };

  assert.throws(
    () => buildAssetUpdatePatch(asset, draft),
    /identity does not match/,
  );
});

test("BindHome API update and delete use existing WebSocket contracts", async () => {
  const calls = [];

  const updatedAsset = {
    id: "asset-1",
    name: "Edited",
    asset_type: "socket",
    code: null,
    area_id: "living_room",
    capabilities: [],
  };

  const hass = {
    async callWS(payload) {
      calls.push(payload);

      if (
        payload.type ===
        "bindhome/assets/update"
      ) {
        return {
          asset: updatedAsset,
        };
      }

      if (
        payload.type ===
        "bindhome/assets/delete"
      ) {
        return {
          deleted: true,
        };
      }

      throw new Error(
        `Unexpected call: ${payload.type}`,
      );
    },
  };

  const api = createBindHomeApi(hass);

  const result = await api.updateAsset(
    "asset-1",
    {
      name: "Edited",
      code: null,
    },
  );

  assert.equal(result, updatedAsset);

  assert.deepEqual(calls[0], {
    name: "Edited",
    code: null,
    type: "bindhome/assets/update",
    asset_id: "asset-1",
  });

  const deleted = await api.deleteAsset(
    "asset-1",
  );

  assert.deepEqual(deleted, {
    deleted: true,
  });

  assert.deepEqual(calls[1], {
    type: "bindhome/assets/delete",
    asset_id: "asset-1",
  });
});
