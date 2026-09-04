import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createLocalizer, presetDisplayName } from "../src/i18n/localize.js";
import {
  activeDrafts,
  createDraftState,
  serializeActiveDrafts,
  setPresetQuantity,
} from "../src/inventory/draft-state.js";

function translation(language) {
  return JSON.parse(
    readFileSync(
      new URL(
        `../../custom_components/bindhome/translations/${language}.json`,
        import.meta.url,
      ),
    ),
  );
}

function resources(language) {
  const source = translation(language).common;
  return Object.fromEntries(
    Object.entries(source)
      .filter(([key]) => key.startsWith("panel_"))
      .map(([key, value]) => [`component.bindhome.common.${key}`, value]),
  );
}

const en = resources("en");
const es = resources("es");

test("English and Spanish resources render with English and backend preset fallbacks", () => {
  const english = createLocalizer(en, en);
  const spanish = createLocalizer(es, en);
  assert.equal(english("inventory.title"), "Inventory this room");
  assert.equal(spanish("inventory.title"), "Inventariar esta habitación");
  assert.equal(createLocalizer({}, en)("inventory.title"), "Inventory this room");
  assert.equal(
    presetDisplayName(spanish, {
      preset_id: "unknown_preset",
      default_name: "Backend fallback",
    }),
    "Backend fallback",
  );
});

test("English and Spanish expose the same BindHome panel translation keys", () => {
  const panelKeys = (language) =>
    Object.keys(translation(language).common)
      .filter((key) => key.startsWith("panel_"))
      .sort();

  assert.deepEqual(panelKeys("es"), panelKeys("en"));
});

test("Spanish preset names do not translate machine identifiers in payloads", () => {
  const t = createLocalizer(es, en);
  const preset = {
    preset_id: "light_point",
    group: "electrical",
    asset_type: "light_point",
    default_name: presetDisplayName(t, {
      preset_id: "light_point",
      default_name: "Light point",
    }),
    suggested_capabilities: ["on_off"],
  };
  const state = setPresetQuantity(createDraftState([preset]), "light_point", 2);
  assert.deepEqual(
    activeDrafts(state).map((draft) => draft.name),
    ["Punto de luz 1", "Punto de luz 2"],
  );
  assert.deepEqual(
    serializeActiveDrafts(state, "salon").map(
      ({ name, asset_type, capabilities, area_id }) => ({
        name,
        asset_type,
        capabilities,
        area_id,
      }),
    ),
    [
      {
        name: "Punto de luz 1",
        asset_type: "light_point",
        capabilities: ["on_off"],
        area_id: "salon",
      },
      {
        name: "Punto de luz 2",
        asset_type: "light_point",
        capabilities: ["on_off"],
        area_id: "salon",
      },
    ],
  );
});

test("primary UI source does not reintroduce obvious English literals", () => {
  const files = [
    "bindhome-panel.js",
    "inventory/inventory-workflow.js",
    "infrastructure/infrastructure-inspector.js",
  ];
  const forbidden = [
    "Inventory this room",
    "What is physically installed here?",
    "Nothing was saved",
    "Back to quantities",
    "Advanced identifiers",
  ];
  const source = files
    .map((file) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8"))
    .join("\n");
  for (const phrase of forbidden) {
    assert.equal(source.includes(phrase), false, `Hardcoded UI copy: ${phrase}`);
  }
});
