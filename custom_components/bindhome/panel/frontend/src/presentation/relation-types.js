// @ts-check
import { humanizeIdentifier } from "./asset-types.js";

const LABELS = {
  feeds: {
    outgoing: "relations.feeds.outgoing",
    incoming: "relations.feeds.incoming",
  },
  contains: {
    outgoing: "relations.contains.outgoing",
    incoming: "relations.contains.incoming",
  },
  controls: {
    outgoing: "relations.controls.outgoing",
    incoming: "relations.controls.incoming",
  },
  part_of: {
    outgoing: "relations.part_of.outgoing",
    incoming: "relations.part_of.incoming",
  },
};

/** @param {import('../types.js').Localizer} t @param {string} type @param {'incoming'|'outgoing'} direction */
export function relationPresentation(t, type, direction) {
  const key = LABELS[type]?.[direction];
  return {
    type,
    direction,
    label: key
      ? t(key)
      : t("relations.unknown", { type: humanizeIdentifier(type) }),
    known: Boolean(key),
    icon:
      type === "feeds"
        ? "mdi:flash-outline"
        : type === "controls"
          ? "mdi:tune"
          : type === "contains" || type === "part_of"
            ? "mdi:folder-outline"
            : "mdi:vector-link",
  };
}

/** @param {string} assetType */
export function contextualRelationActions(assetType) {
  const actions = {
    socket: [
      {
        direction: "outgoing",
        relationType: "feeds",
        labelKey: "relations.actions.indicate_feeds",
      },
      {
        direction: "incoming",
        relationType: "feeds",
        labelKey: "relations.actions.power_source",
      },
    ],
    circuit: [
      { direction: "outgoing", relationType: "feeds", labelKey: "relations.actions.add_powered" },
      { direction: "incoming", relationType: "feeds", labelKey: "relations.actions.panel_source" },
    ],
    electrical_panel: [
      { direction: "outgoing", relationType: "feeds", labelKey: "relations.actions.add_powered" },
      { direction: "outgoing", relationType: "contains", labelKey: "relations.actions.add_content" },
    ],
    junction_box: [
      { direction: "outgoing", relationType: "contains", labelKey: "relations.actions.add_content" },
    ],
    manifold: [
      { direction: "outgoing", relationType: "contains", labelKey: "relations.actions.add_content" },
    ],
    shutoff_valve: [
      {
        direction: "outgoing",
        relationType: "controls",
        labelKey: "relations.actions.indicate_controls",
      },
    ],
    valve: [
      {
        direction: "outgoing",
        relationType: "controls",
        labelKey: "relations.actions.indicate_controls",
      },
    ],
    light_point: [
      { direction: "incoming", relationType: "feeds", labelKey: "relations.actions.power_source" },
    ],
  };
  return actions[assetType] ?? [];
}
