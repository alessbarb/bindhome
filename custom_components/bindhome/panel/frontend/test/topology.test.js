import test from "node:test";
import assert from "node:assert/strict";
import { searchAssetCatalogue } from "../src/topology/asset-catalogue.js";
import { relationPartitions, relationTypeSuggestions, validRelationType } from "../src/topology/relation-state.js";
import { createBindHomeApi } from "../src/api/bindhome-api.js";

const assets = [
  { id: "a", name: "Source", code: "SRC", asset_type: "panel", area_id: "lab", capabilities: [] },
  { id: "b", name: "Middle", code: "MID", asset_type: "panel", area_id: "lab", capabilities: [] },
  { id: "c", name: "Target", code: "TGT", asset_type: "sensor", area_id: "kitchen", capabilities: [] },
];

test("topology catalogue searches name/code/type/area and ranks same Area", () => {
  const areas = [{ area_id: "lab", name: "BindHome Lab" }, { area_id: "kitchen", name: "Kitchen" }];
  const ranked = searchAssetCatalogue(assets, "", "lab", areas);
  assert.deepEqual(ranked.map((item) => item.id), ["b", "a", "c"]);
  assert.equal(searchAssetCatalogue(assets, "kitchen", null, areas)[0].id, "c");
  assert.equal(searchAssetCatalogue(assets, "SRC", null, areas)[0].id, "a");
  assert.equal(searchAssetCatalogue(assets, "sensor", null, areas)[0].id, "c");
});

test("relation partitions and extensible type validation are deterministic", () => {
  const relations = [{ id: "r1", source_asset_id: "a", target_asset_id: "b", relation_type: "feeds" }, { id: "r2", source_asset_id: "c", target_asset_id: "a", relation_type: "serves" }];
  assert.equal(relationPartitions(relations, "a").outgoing.length, 1);
  assert.equal(relationPartitions(relations, "a").incoming.length, 1);
  assert.deepEqual(relationTypeSuggestions([...relations, relations[0]]), ["feeds", "serves"]);
  assert.equal(validRelationType("feeds_power"), true);
  assert.equal(validRelationType("Feeds"), false);
});

test("relation API emits exact create/delete contracts", async () => {
  const messages = [];
  const api = createBindHomeApi({ callWS: async (message) => { messages.push(message); return { relation: { id: "r" } }; } });
  await api.createRelation({ sourceAssetId: "a", relationType: "feeds", targetAssetId: "b" });
  await api.deleteRelation("r");
  assert.deepEqual(messages, [
    { type: "bindhome/relations/create", source_asset_id: "a", relation_type: "feeds", target_asset_id: "b" },
    { type: "bindhome/relations/delete", relation_id: "r" },
  ]);
});
