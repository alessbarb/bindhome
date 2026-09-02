/** Return the stable frontend identity for a Binding status record. */
export function bindingStatusKey(assetId, capability, role = "primary") {
  return `${assetId}:${capability}:${role}`;
}

export function indexBindingStatuses(response) {
  const records = response?.records ?? [];
  return new Map(
    records.map((record) => [
      bindingStatusKey(record.asset_id, record.capability, record.role),
      record,
    ]),
  );
}

export function getBindingStatus(index, assetId, capability, role = "primary") {
  return index?.get(bindingStatusKey(assetId, capability, role)) ?? null;
}
