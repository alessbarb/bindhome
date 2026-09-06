// @ts-check

const DEFAULT_PREFIX = "/bindhome";

/** @returns {import('../types.js').PanelRouteState} */
export function emptyPanelRoute() {
  return {
    view: "home",
    areaId: null,
    assetId: null,
    query: "",
    contextAreaId: null,
    advancedAssetId: null,
  };
}

function decodeSegment(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function normalizedPrefix(prefix) {
  const value = typeof prefix === "string" && prefix ? prefix : DEFAULT_PREFIX;
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

/**
 * Parse the Home Assistant custom-panel route tail plus the current query string.
 * Unknown or malformed routes fail closed to Home instead of leaving stale view state.
 *
 * @param {{prefix?: string, path?: string} | null | undefined} route
 * @param {string} [search]
 * @returns {import('../types.js').PanelRouteState}
 */
export function parsePanelRoute(route, search = "") {
  const fallback = emptyPanelRoute();
  const path = typeof route?.path === "string" ? route.path : "";
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  if (parts.length === 0) return fallback;

  if (parts[0] === "home") {
    if (parts.length > 3) return fallback;
    const areaId = parts.length >= 2 ? decodeSegment(parts[1]) : null;
    const assetId = parts.length >= 3 ? decodeSegment(parts[2]) : null;
    if ((parts.length >= 2 && areaId === null) || (parts.length >= 3 && assetId === null)) {
      return fallback;
    }
    return { ...fallback, areaId, assetId };
  }

  if (parts[0] === "add" && parts.length === 1) {
    const rawArea = params.get("area");
    const contextAreaId = rawArea ? rawArea : null;
    return { ...fallback, view: "add", contextAreaId };
  }

  if (parts[0] === "search" && parts.length === 1) {
    return { ...fallback, view: "search", query: params.get("q") ?? "" };
  }

  if (parts[0] === "advanced") {
    if (parts.length > 2) return fallback;
    const advancedAssetId = parts.length === 2 ? decodeSegment(parts[1]) : null;
    if (parts.length === 2 && advancedAssetId === null) return fallback;
    return { ...fallback, view: "advanced", advancedAssetId };
  }

  return fallback;
}

function encoded(value) {
  return encodeURIComponent(value);
}

/**
 * Serialize one canonical BindHome navigation state into a Home Assistant URL.
 *
 * @param {import('../types.js').PanelRouteState} state
 * @param {string} [prefix]
 */
export function buildPanelUrl(state, prefix = DEFAULT_PREFIX) {
  const base = normalizedPrefix(prefix);

  if (state.view === "add") {
    const params = new URLSearchParams();
    if (state.contextAreaId) params.set("area", state.contextAreaId);
    const query = params.toString();
    return `${base}/add${query ? `?${query}` : ""}`;
  }

  if (state.view === "search") {
    const params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    const query = params.toString();
    return `${base}/search${query ? `?${query}` : ""}`;
  }

  if (state.view === "advanced") {
    return state.advancedAssetId
      ? `${base}/advanced/${encoded(state.advancedAssetId)}`
      : `${base}/advanced`;
  }

  let path = `${base}/home`;
  if (state.areaId) path += `/${encoded(state.areaId)}`;
  if (state.areaId && state.assetId) path += `/${encoded(state.assetId)}`;
  return path;
}

/**
 * Navigate in the same main-window history model Home Assistant uses for custom
 * panels. The shell still treats the `route` property HA sends back as the
 * authoritative state; this helper only commits the browser history entry and
 * asks HA to recompute that route.
 *
 * @param {string} url
 * @param {{replace?: boolean, window?: Window}} [options]
 */
export function navigatePanelUrl(url, options = {}) {
  const targetWindow = options.window ?? window;
  const replace = options.replace === true;
  const current = `${targetWindow.location.pathname}${targetWindow.location.search}`;
  if (current === url) return false;

  const currentState = targetWindow.history.state ?? {};
  if (replace) {
    const nextState = {};
    if (currentState?.root) nextState.root = true;
    if (currentState?.from !== undefined) nextState.from = currentState.from;
    targetWindow.history.replaceState(
      Object.keys(nextState).length ? nextState : null,
      "",
      url,
    );
  } else {
    targetWindow.history.pushState({ from: current }, "", url);
  }

  const event = targetWindow.document.createEvent("CustomEvent");
  event.initCustomEvent("location-changed", false, false, { replace });
  targetWindow.dispatchEvent(event);
  return true;
}
