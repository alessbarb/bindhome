// @ts-check
import {
  assetPresentation,
  CATEGORY_ORDER,
} from "../presentation/asset-types.js";

export const NO_AREA = "__bindhome_no_area__";
export const STALE_AREA = "__bindhome_stale_area__";

/** @param {import('../types.js').HaFloor[]} floors @param {import('../types.js').HaArea[]} areas @param {import('../types.js').Asset[]} assets */
export function buildHomeProjection(floors, areas, assets) {
  const areaById = new Map(areas.map((area) => [area.area_id, area]));
  const assetsByArea = new Map();
  for (const asset of assets) {
    const key = !asset.area_id
      ? NO_AREA
      : areaById.has(asset.area_id)
        ? asset.area_id
        : STALE_AREA;
    assetsByArea.set(key, [...(assetsByArea.get(key) ?? []), asset]);
  }
  const sortedFloors = [...floors].sort(
    (a, b) =>
      (a.level ?? 999) - (b.level ?? 999) || a.name.localeCompare(b.name),
  );
  const groups = sortedFloors.map((floor) => ({
    id: floor.floor_id,
    name: floor.name,
    icon: floor.icon,
    level: floor.level,
    areas: areas
      .filter((area) => area.floor_id === floor.floor_id)
      .sort(byName),
  }));
  const noFloorAreas = areas.filter((area) => !area.floor_id).sort(byName);
  if (noFloorAreas.length)
    groups.push({
      id: "__no_floor__",
      name: null,
      icon: null,
      level: null,
      areas: noFloorAreas,
    });
  return {
    groups,
    assetsByArea,
    unassigned: assetsByArea.get(NO_AREA) ?? [],
    stale: assetsByArea.get(STALE_AREA) ?? [],
  };
}

/** @param {{name:string}} a @param {{name:string}} b */
function byName(a, b) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

/** @param {import('../types.js').Localizer} t @param {import('../types.js').Asset[]} assets */
export function groupRoomAssets(t, assets) {
  const groups = new Map();
  for (const asset of assets) {
    const presentation = assetPresentation(t, asset.asset_type);
    groups.set(presentation.category, [
      ...(groups.get(presentation.category) ?? []),
      asset,
    ]);
  }
  return CATEGORY_ORDER.filter((key) => groups.has(key)).map((category) => ({
    category,
    assets: groups.get(category).sort(byName),
  }));
}

/** @param {import('../types.js').Localizer} t @param {import('../types.js').Asset[]} assets @param {import('../types.js').HaArea[]} areas @param {import('../types.js').HaFloor[]} floors @param {string} query */
export function searchAssets(t, assets, areas, floors, query) {
  const areaById = new Map(areas.map((area) => [area.area_id, area]));
  const floorById = new Map(floors.map((floor) => [floor.floor_id, floor]));
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return assets.slice().sort(byName).slice(0, 8);
  return assets
    .map((asset) => {
      const area = asset.area_id ? areaById.get(asset.area_id) : null;
      const floor = area?.floor_id ? floorById.get(area.floor_id) : null;
      const type = assetPresentation(t, asset.asset_type);
      const fields = [
        asset.name,
        asset.code,
        type.label,
        asset.asset_type,
        area?.name,
        floor?.name,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLocaleLowerCase());
      const score = fields.reduce(
        (total, value, index) =>
          total +
          (value === needle
            ? 100 - index
            : value.startsWith(needle)
              ? 50 - index
              : value.includes(needle)
                ? 10 - index
                : 0),
        0,
      );
      return { asset, area, floor, type, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || byName(a.asset, b.asset))
    .slice(0, 30);
}
