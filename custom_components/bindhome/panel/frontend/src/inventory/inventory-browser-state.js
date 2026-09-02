function compareByName(a, b) {
  return (a?.name ?? "").localeCompare(b?.name ?? "", undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

function sortedAssets(assets) {
  return [...assets].sort(compareByName);
}

export function buildInventoryHierarchy(floors, areas, assets) {
  const floorById = new Map(
    (floors ?? []).map((floor) => [floor.floor_id, floor]),
  );

  const areaById = new Map(
    (areas ?? []).map((area) => [area.area_id, area]),
  );

  const assetsByArea = new Map();

  for (const asset of assets ?? []) {
    if (!asset.area_id || !areaById.has(asset.area_id)) {
      continue;
    }

    const list = assetsByArea.get(asset.area_id) ?? [];
    list.push(asset);
    assetsByArea.set(asset.area_id, list);
  }

  const areaNodes = (areas ?? [])
    .map((area) => ({
      area,
      assets: sortedAssets(assetsByArea.get(area.area_id) ?? []),
    }))
    .sort((a, b) => compareByName(a.area, b.area));

  const floorNodes = (floors ?? [])
    .map((floor) => ({
      floor,
      areas: areaNodes.filter(
        ({ area }) => area.floor_id === floor.floor_id,
      ),
    }))
    .sort((a, b) => {
      const levelA = a.floor.level;
      const levelB = b.floor.level;

      if (
        typeof levelA === "number" &&
        typeof levelB === "number" &&
        levelA !== levelB
      ) {
        return levelA - levelB;
      }

      return compareByName(a.floor, b.floor);
    });

  const noFloorAreas = areaNodes.filter(
    ({ area }) =>
      !area.floor_id ||
      !floorById.has(area.floor_id),
  );

  const noAreaAssets = sortedAssets(
    (assets ?? []).filter((asset) => !asset.area_id),
  );

  const unknownAreaAssets = sortedAssets(
    (assets ?? []).filter(
      (asset) =>
        asset.area_id &&
        !areaById.has(asset.area_id),
    ),
  );

  return {
    floors: floorNodes,
    noFloorAreas,
    noAreaAssets,
    unknownAreaAssets,
  };
}

export function createAssetEditDraft(asset) {
  return {
    asset_id: asset.id,
    name: asset.name,
    asset_type: asset.asset_type,
    code: asset.code ?? "",
    area_id: asset.area_id ?? "",
    capabilities: [...(asset.capabilities ?? [])],
  };
}

function normalizeOptional(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
}

function capabilitiesEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every(
    (value, index) => value === right[index],
  );
}

export function buildAssetUpdatePatch(asset, draft) {
  if (draft.asset_id !== asset.id) {
    throw new Error(
      "Asset edit draft identity does not match the persisted Asset",
    );
  }

  const next = {
    name: draft.name,
    asset_type: draft.asset_type,
    code: normalizeOptional(draft.code),
    area_id: normalizeOptional(draft.area_id),
    capabilities: [...(draft.capabilities ?? [])],
  };

  const patch = {
    asset_id: asset.id,
  };

  if (next.name !== asset.name) {
    patch.name = next.name;
  }

  if (next.asset_type !== asset.asset_type) {
    patch.asset_type = next.asset_type;
  }

  if (next.code !== (asset.code ?? null)) {
    patch.code = next.code;
  }

  if (next.area_id !== (asset.area_id ?? null)) {
    patch.area_id = next.area_id;
  }

  const existingCapabilities = [
    ...(asset.capabilities ?? []),
  ];

  if (
    !capabilitiesEqual(
      next.capabilities,
      existingCapabilities,
    )
  ) {
    patch.capabilities = next.capabilities;
  }

  return patch;
}

export function assetEditHasChanges(asset, draft) {
  return (
    Object.keys(
      buildAssetUpdatePatch(asset, draft),
    ).length > 1
  );
}
