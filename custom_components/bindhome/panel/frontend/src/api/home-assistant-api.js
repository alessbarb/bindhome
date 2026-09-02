export const NO_FLOOR_ID = "__bindhome_no_floor__";

export function createHomeAssistantApi(hass) {
  return {
    async listFloors() {
      const floors = await hass.callWS({ type: "config/floor_registry/list" });
      return (floors ?? []).map((floor) => ({
        floor_id: floor.floor_id,
        name: floor.name,
        level: floor.level ?? null,
        icon: floor.icon ?? null,
      }));
    },
    async listAreas() {
      const areas = await hass.callWS({ type: "config/area_registry/list" });
      return (areas ?? []).map((area) => ({
        area_id: area.area_id,
        name: area.name,
        floor_id: area.floor_id ?? null,
        icon: area.icon ?? null,
      }));
    },
    async listEntityRegistry() {
      return hass.callWS({ type: "config/entity_registry/list" });
    },
    async listDeviceRegistry() {
      return hass.callWS({ type: "config/device_registry/list" });
    },
  };
}

export function areasForFloor(areas, floorId) {
  if (floorId === NO_FLOOR_ID) {
    return areas.filter((area) => !area.floor_id);
  }
  return areas.filter((area) => area.floor_id === floorId);
}
