// @ts-check
import { assetPresentation, CATEGORY_ORDER } from "../presentation/asset-types.js";
import { presetDisplayName } from "../i18n/localize.js";

export const FEATURED_PRESET_IDS = [
  "light_point", "socket", "circuit", "tap", "shutoff_valve", "window", "door", "appliance",
];

/** @param {import('../types.js').Localizer} t @param {import('../types.js').CreationPreset[]} presets @param {string} query */
export function buildPresetCatalogue(t, presets, query = "") {
  const normalized = query.trim().toLocaleLowerCase();
  const matches = presets
    .map((preset) => ({ preset, name: presetDisplayName(t, preset), presentation: assetPresentation(t, preset.asset_type) }))
    .filter(({ preset, name }) => !normalized || [name, preset.asset_type].some((value) => value.toLocaleLowerCase().includes(normalized)))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base", numeric: true }));
  const groups = new Map();
  for (const item of matches) {
    const category = item.presentation.category;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(item);
  }
  return {
    featured: normalized ? [] : FEATURED_PRESET_IDS.map((id) => matches.find(({ preset }) => preset.preset_id === id)).filter(Boolean),
    groups: CATEGORY_ORDER.filter((category) => groups.has(category)).map((category) => ({ category, items: groups.get(category) })),
    count: matches.length,
  };
}
