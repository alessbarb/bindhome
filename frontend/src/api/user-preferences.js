// @ts-check

export const ADVANCED_PINNED_PREFERENCE = "bindhome.advanced-pinned";
export const ONBOARDING_DISMISSED_PREFERENCE = "bindhome.onboarding.v1";
export const COLLAPSED_FLOORS_PREFERENCE = "bindhome.home-collapsed-floors";
export const LAST_BACKUP_PREFERENCE = "bindhome.backup.last-exported-at";

function preferenceConnection(hass) {
  const connection = hass?.connection;
  return connection && typeof connection.sendMessagePromise === "function"
    ? connection
    : null;
}

export async function readUserPreference(hass, key) {
  const connection = preferenceConnection(hass);
  if (!connection) return { available: false, value: null };
  try {
    const result = await connection.sendMessagePromise({
      type: "frontend/get_user_data",
      key,
    });
    return { available: true, value: result?.value ?? null };
  } catch {
    return { available: false, value: null };
  }
}

export async function saveUserPreference(hass, key, value) {
  const connection = preferenceConnection(hass);
  if (!connection) return false;
  try {
    await connection.sendMessagePromise({
      type: "frontend/set_user_data",
      key,
      value,
    });
    return true;
  } catch {
    return false;
  }
}

function readLegacyValue(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function removeLegacyValue(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* Browser storage may be unavailable. */
  }
}

export async function loadBooleanPreference(
  hass,
  key,
  legacyKey,
  fallback = false,
) {
  const server = await readUserPreference(hass, key);
  if (server.available && server.value !== null) {
    return typeof server.value === "boolean" ? server.value : fallback;
  }

  const legacy = readLegacyValue(legacyKey);
  if (legacy === null) return fallback;
  const value = legacy === "true" ? true : legacy === "false" ? false : fallback;

  if (server.available && (await saveUserPreference(hass, key, value))) {
    removeLegacyValue(legacyKey);
  }
  return value;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string"))].sort();
}

export async function loadStringArrayPreference(hass, key, legacyKey) {
  const server = await readUserPreference(hass, key);
  if (server.available && server.value !== null) {
    return normalizeStringArray(server.value);
  }

  const legacy = readLegacyValue(legacyKey);
  if (legacy === null) return [];

  let value = [];
  try {
    value = normalizeStringArray(JSON.parse(legacy));
  } catch {
    value = [];
  }

  if (server.available && (await saveUserPreference(hass, key, value))) {
    removeLegacyValue(legacyKey);
  }
  return value;
}
