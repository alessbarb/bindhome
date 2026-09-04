// @ts-check

/** @typedef {import('../types.js').Localizer} Localizer */

const TYPES = {
  light_point: ["mdi:lightbulb-outline", "lighting"],
  socket: ["mdi:power-socket-eu", "electricity"],
  switch: ["mdi:light-switch", "electricity"],
  electrical_panel: ["mdi:electric-switch", "electricity"],
  circuit: ["mdi:transmission-tower", "electricity"],
  junction_box: ["mdi:connection", "electricity"],
  ethernet_outlet: ["mdi:ethernet", "network"],
  telephone_outlet: ["mdi:phone-classic", "network"],
  antenna_outlet: ["mdi:television-classic", "network"],
  wifi_access_point: ["mdi:wifi", "network"],
  radiator: ["mdi:radiator", "climate"],
  thermostat: ["mdi:thermostat", "climate"],
  fan: ["mdi:fan", "climate"],
  air_conditioning_unit: ["mdi:air-conditioner", "climate"],
  tap: ["mdi:faucet", "water"],
  shutoff_valve: ["mdi:valve", "water"],
  valve: ["mdi:valve", "water"],
  drain: ["mdi:water-minus", "water"],
  manifold: ["mdi:pipe-valve", "water"],
  door: ["mdi:door", "structure"],
  window: ["mdi:window-closed", "structure"],
  blind: ["mdi:blinds", "structure"],
  skylight: ["mdi:window-open", "structure"],
  boiler: ["mdi:water-boiler", "equipment"],
  water_heater: ["mdi:water-boiler", "equipment"],
  pump: ["mdi:pump", "equipment"],
  freezer: ["mdi:fridge-outline", "equipment"],
  appliance: ["mdi:dishwasher", "equipment"],
  machine: ["mdi:cog-outline", "equipment"],
};

/** @param {Localizer} t @param {string} type */
export function assetPresentation(t, type) {
  const known = TYPES[type];
  const key = `presets.${type}.name`;
  const translated = t(key);
  return {
    type,
    label: translated === key ? humanizeIdentifier(type) : translated,
    icon: known?.[0] ?? "mdi:cube-outline",
    category: known?.[1] ?? "other",
    known: Boolean(known),
  };
}

/** @param {string} value */
export function humanizeIdentifier(value) {
  const normalized = String(value || "")
    .replaceAll("_", " ")
    .trim();
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "—";
}

export const CATEGORY_ORDER = [
  "lighting",
  "electricity",
  "water",
  "climate",
  "equipment",
  "network",
  "structure",
  "other",
];

/** @param {Localizer} t @param {string} category */
export function categoryPresentation(t, category) {
  const icons = {
    lighting: "mdi:lightbulb-outline",
    electricity: "mdi:flash-outline",
    water: "mdi:water-outline",
    climate: "mdi:thermometer",
    equipment: "mdi:tools",
    network: "mdi:lan",
    structure: "mdi:home-outline",
    other: "mdi:dots-horizontal-circle-outline",
  };
  return {
    category,
    label: t(`categories.${category}`),
    icon: icons[category] ?? icons.other,
  };
}
