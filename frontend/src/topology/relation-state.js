export function relationPartitions(relations = [], assetId) {
  return {
    outgoing: relations.filter((relation) => relation.source_asset_id === assetId),
    incoming: relations.filter((relation) => relation.target_asset_id === assetId),
  };
}

export function relationTypeSuggestions(relations = []) {
  return [...new Set(relations.map((relation) => relation.relation_type).filter(Boolean))].sort();
}

export function validRelationType(value) {
  return /^[a-z][a-z0-9_]*$/.test(String(value).trim());
}
