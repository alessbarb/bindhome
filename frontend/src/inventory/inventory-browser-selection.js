export const NO_AREA_KEY = "__bindhome_no_area_assets__";
export const UNKNOWN_AREA_KEY = "__bindhome_unknown_area_assets__";

/**
 * @typedef {{
 *   floors: Array<{areas: Array<{area: import('../types.js').HaArea, assets: import('../types.js').Asset[]}>}>,
 *   noFloorAreas: Array<{area: import('../types.js').HaArea, assets: import('../types.js').Asset[]}>,
 *   noAreaAssets: import('../types.js').Asset[],
 *   unknownAreaAssets: import('../types.js').Asset[],
 * }} InventoryHierarchy
 */

/**
 * Resolve the visible result target for one selected navigation key.
 *
 * @param {string} key
 * @param {InventoryHierarchy} hierarchy
 * @param {import('../types.js').Localizer} t
 * @returns {{kind: string, title: string, description: string, area?: import('../types.js').HaArea, assets: import('../types.js').Asset[]} | null}
 */
export function targetForInventoryKey(key, hierarchy, t) {
  if (!key) return null;

  if (key === NO_AREA_KEY) {
    if (!hierarchy.noAreaAssets.length) return null;
    return {
      kind: "no-area",
      title: t("browser.no_area"),
      description: t("browser.no_area_intro"),
      assets: hierarchy.noAreaAssets,
    };
  }

  if (key === UNKNOWN_AREA_KEY) {
    if (!hierarchy.unknownAreaAssets.length) return null;
    return {
      kind: "unknown-area",
      title: t("browser.unknown_area"),
      description: t("browser.unknown_area_intro"),
      assets: hierarchy.unknownAreaAssets,
    };
  }

  const areaNodes = [
    ...hierarchy.floors.flatMap((floorNode) => floorNode.areas),
    ...hierarchy.noFloorAreas,
  ];
  const node = areaNodes.find(({ area }) => area.area_id === key);
  if (!node) return null;

  return {
    kind: "area",
    title: node.area.name,
    description: "",
    area: node.area,
    assets: node.assets,
  };
}

/**
 * Return the browser navigation key for an Asset's current location.
 *
 * @param {import('../types.js').Asset} asset
 * @param {import('../types.js').HaArea[]} areas
 * @returns {string}
 */
export function locationKeyForAsset(asset, areas) {
  if (!asset.area_id) return NO_AREA_KEY;
  return areas.some((area) => area.area_id === asset.area_id)
    ? asset.area_id
    : UNKNOWN_AREA_KEY;
}

/**
 * Replace one Asset immutably after the detail editor commits an update.
 *
 * @param {import('../types.js').Asset[]} assets
 * @param {import('../types.js').Asset} updated
 * @returns {import('../types.js').Asset[]}
 */
export function replaceInventoryAsset(assets, updated) {
  return assets.map((asset) => asset.id === updated.id ? updated : asset);
}
