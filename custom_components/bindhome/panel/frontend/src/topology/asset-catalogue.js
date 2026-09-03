export const SUGGESTION_LIMIT = 8;
export const RESULT_LIMIT = 20;

export function assetAreaName(asset, areas = []) {
  return areas.find((area) => area.area_id === asset?.area_id)?.name ?? null;
}

export function normalizeAssetCandidate(asset, areas = []) {
  return { asset, id: asset.id, name: asset.name, code: asset.code ?? "", assetType: asset.asset_type, areaId: asset.area_id ?? null, areaName: assetAreaName(asset, areas) };
}

export function searchAssetCatalogue(assets, query = "", areaId = null, areas = []) {
  const normalized = String(query).trim().toLocaleLowerCase();
  const candidates = assets.map((asset) => normalizeAssetCandidate(asset, areas));
  const matches = normalized ? candidates.filter((candidate) => [candidate.name, candidate.code, candidate.assetType, candidate.areaName ?? ""].join(" ").toLocaleLowerCase().includes(normalized)) : candidates;
  return matches.sort((a, b) => {
    const area = Number(Boolean(areaId && b.areaId === areaId)) - Number(Boolean(areaId && a.areaId === areaId));
    return area || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
  });
}
