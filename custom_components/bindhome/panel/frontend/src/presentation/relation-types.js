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
  if (
    ["socket", "circuit", "electrical_panel", "light_point"].includes(assetType)
  )
    return [
      {
        direction: "outgoing",
        relationType: "feeds",
        labelKey:
          assetType === "circuit"
            ? "relations.actions.add_powered"
            : "relations.actions.indicate_feeds",
      },
      {
        direction: "incoming",
        relationType: "feeds",
        labelKey:
          assetType === "circuit"
            ? "relations.actions.panel_source"
            : "relations.actions.power_source",
      },
    ];
  if (["shutoff_valve", "valve"].includes(assetType))
    return [
      {
        direction: "outgoing",
        relationType: "controls",
        labelKey: "relations.actions.indicate_controls",
      },
    ];
  if (["electrical_panel", "junction_box", "manifold"].includes(assetType))
    return [
      {
        direction: "outgoing",
        relationType: "contains",
        labelKey: "relations.actions.add_content",
      },
    ];
  return [];
}
