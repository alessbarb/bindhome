function text(value) {
  return String(value ?? "").trim();
}

function lower(value) {
  return text(value).toLocaleLowerCase();
}

function compareCandidates(left, right) {
  return (
    lower(left.name).localeCompare(lower(right.name), undefined, {
      numeric: true,
      sensitivity: "base",
    }) || left.entityId.localeCompare(right.entityId)
  );
}

function rankCandidate(candidate, query, areaId) {
  const normalizedQuery = lower(query);
  if (!normalizedQuery) {
    return areaId && candidate.areaId === areaId ? 0 : 1;
  }

  const fields = [
    candidate.name,
    candidate.entityId,
    candidate.areaName,
    candidate.deviceName,
    candidate.domain,
  ].map(lower);
  const exact = fields.some((field) => field === normalizedQuery);
  const prefix = fields.some((field) => field.startsWith(normalizedQuery));
  const areaBonus = areaId && candidate.areaId === areaId ? 0 : 1;
  return (exact ? 0 : prefix ? 1 : 2) * 2 + areaBonus;
}

export function normalizeEntityCandidates({
  entityRegistry = [],
  deviceRegistry = [],
  states = {},
  areas = [],
} = {}) {
  const registryByEntity = new Map(
    entityRegistry
      .filter((entry) => entry?.entity_id)
      .map((entry) => [entry.entity_id, entry]),
  );
  const devices = new Map(
    deviceRegistry
      .filter((device) => device?.id)
      .map((device) => [device.id, device]),
  );
  const areaNames = new Map(
    areas
      .filter((area) => area?.area_id)
      .map((area) => [area.area_id, area.name]),
  );
  const entityIds = new Set([
    ...registryByEntity.keys(),
    ...Object.keys(states ?? {}),
  ]);

  return [...entityIds]
    .map((entityId) => {
      const entry = registryByEntity.get(entityId) ?? null;
      const state = states?.[entityId] ?? null;
      const device = entry?.device_id ? devices.get(entry.device_id) : null;
      const [domain] = entityId.split(".");
      const areaId = entry?.area_id ?? device?.area_id ?? null;
      const name =
        state?.attributes?.friendly_name ??
        entry?.name ??
        entry?.original_name ??
        entityId;
      return {
        entityId,
        domain,
        name,
        state: state?.state ?? null,
        registryEntry: entry,
        deviceId: entry?.device_id ?? null,
        deviceName: device?.name_by_user ?? device?.name ?? null,
        areaId,
        areaName: areaId ? areaNames.get(areaId) ?? null : null,
        disabled: Boolean(entry?.disabled_by),
        hidden: Boolean(entry?.hidden_by),
        isBindHome: entry?.platform === "bindhome",
      };
    })
    .sort(compareCandidates);
}

export function searchEntityCandidates(candidates, query = "", areaId = null) {
  const normalizedQuery = lower(query);
  return [...(candidates ?? [])]
    .filter((candidate) => {
      if (!normalizedQuery) return true;
      return [
        candidate.name,
        candidate.entityId,
        candidate.areaName,
        candidate.deviceName,
        candidate.domain,
      ].some((value) => lower(value).includes(normalizedQuery));
    })
    .sort(
      (left, right) =>
        rankCandidate(left, normalizedQuery, areaId) -
          rankCandidate(right, normalizedQuery, areaId) ||
        compareCandidates(left, right),
    );
}
