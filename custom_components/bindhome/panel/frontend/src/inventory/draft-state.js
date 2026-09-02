function newDraft(preset, index) {
  return {
    key: `draft:${preset.preset_id}:${index}`,
    presetId: preset.preset_id,
    name: `${preset.default_name} ${index}`,
    asset_type: preset.asset_type,
    code: null,
    capabilities: [...(preset.suggested_capabilities ?? [])],
  };
}

export function createDraftState(presets = []) {
  return {
    presetOrder: presets.map((preset) => preset.preset_id),
    presets: new Map(presets.map((preset) => [preset.preset_id, preset])),
    quantities: new Map(presets.map((preset) => [preset.preset_id, 0])),
    retained: new Map(presets.map((preset) => [preset.preset_id, []])),
  };
}

export function setPresetQuantity(state, presetId, requestedQuantity) {
  const preset = state.presets.get(presetId);
  if (!preset) return state;
  const quantity = Math.max(0, Math.floor(Number(requestedQuantity) || 0));
  const retained = [...(state.retained.get(presetId) ?? [])];
  while (retained.length < quantity) retained.push(newDraft(preset, retained.length + 1));
  return {
    ...state,
    quantities: new Map(state.quantities).set(presetId, quantity),
    retained: new Map(state.retained).set(presetId, retained),
  };
}

export function updateDraft(state, key, changes) {
  const retained = new Map(state.retained);
  for (const [presetId, drafts] of retained) {
    const index = drafts.findIndex((draft) => draft.key === key);
    if (index === -1) continue;
    const next = [...drafts];
    next[index] = { ...next[index], ...changes };
    retained.set(presetId, next);
    break;
  }
  return { ...state, retained };
}

export function activeDrafts(state) {
  return state.presetOrder.flatMap((presetId) => {
    const quantity = state.quantities.get(presetId) ?? 0;
    return (state.retained.get(presetId) ?? []).slice(0, quantity);
  });
}

export function serializeActiveDrafts(state, areaId) {
  return activeDrafts(state).map((draft) => {
    const item = {
      name: draft.name,
      asset_type: draft.asset_type,
      area_id: areaId,
      capabilities: [...draft.capabilities],
    };
    if (draft.code?.trim()) item.code = draft.code.trim();
    return item;
  });
}

export function filterAssetsByArea(assets, areaId) {
  return (assets ?? []).filter((asset) => asset.area_id === areaId);
}

export function groupExistingAssets(assets, presets) {
  const groupByType = new Map(presets.map((preset) => [preset.asset_type, preset.group]));
  const groups = new Map();
  for (const asset of assets) {
    const group = groupByType.get(asset.asset_type) ?? "other";
    const entries = groups.get(group) ?? [];
    entries.push(asset);
    groups.set(group, entries);
  }
  return groups;
}
