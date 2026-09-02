import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createLocalizer, presetDisplayName } from "../src/i18n/localize.js";
import { activeDrafts, createDraftState, serializeActiveDrafts, setPresetQuantity } from "../src/inventory/draft-state.js";

function resources(language) {
  const source = JSON.parse(readFileSync(new URL(`../../../translations/${language}.json`, import.meta.url))).panel;
  const result = {};
  const flatten = (object, prefix = "component.bindhome.panel") => Object.entries(object).forEach(([key, value]) => {
    if (typeof value === "object") flatten(value, `${prefix}.${key}`); else result[`${prefix}.${key}`] = value;
  });
  flatten(source);
  return result;
}

const en = resources("en");
const es = resources("es");

test("English and Spanish resources render with English and backend preset fallbacks", () => {
  const english = createLocalizer(en, en);
  const spanish = createLocalizer(es, en);
  assert.equal(english("inventory.title"), "Inventory this room");
  assert.equal(spanish("inventory.title"), "Inventariar esta habitación");
  assert.equal(createLocalizer({}, en)("inventory.title"), "Inventory this room");
  assert.equal(presetDisplayName(spanish, { preset_id: "unknown_preset", default_name: "Backend fallback" }), "Backend fallback");
});

test("strings.json remains the English integration source", () => {
  const strings = JSON.parse(readFileSync(new URL("../../../strings.json", import.meta.url)));
  const english = JSON.parse(readFileSync(new URL("../../../translations/en.json", import.meta.url)));
  assert.deepEqual(english, strings);
});

test("Spanish preset names do not translate machine identifiers in payloads", () => {
  const t = createLocalizer(es, en);
  const preset = { preset_id: "light_point", group: "electrical", asset_type: "light_point", default_name: presetDisplayName(t, { preset_id: "light_point", default_name: "Light point" }), suggested_capabilities: ["on_off"] };
  const state = setPresetQuantity(createDraftState([preset]), "light_point", 2);
  assert.deepEqual(activeDrafts(state).map((draft) => draft.name), ["Punto de luz 1", "Punto de luz 2"]);
  assert.deepEqual(serializeActiveDrafts(state, "salon").map(({ name, asset_type, capabilities, area_id }) => ({ name, asset_type, capabilities, area_id })), [
    { name: "Punto de luz 1", asset_type: "light_point", capabilities: ["on_off"], area_id: "salon" },
    { name: "Punto de luz 2", asset_type: "light_point", capabilities: ["on_off"], area_id: "salon" },
  ]);
});

test("primary UI source does not reintroduce obvious English literals", () => {
  const files = ["bindhome-panel.js", "inventory/inventory-workflow.js", "infrastructure/infrastructure-inspector.js"];
  const forbidden = ["Inventory this room", "What is physically installed here?", "Nothing was saved", "Back to quantities", "Advanced identifiers"];
  const source = files.map((file) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8")).join("\n");
  for (const phrase of forbidden) assert.equal(source.includes(phrase), false, `Hardcoded UI copy: ${phrase}`);
});
