export function createBindHomeApi(hass) {
  return {
    async getRegistry() {
      return hass.callWS({ type: "bindhome/registry/get" });
    },
    async listAssets() {
      const response = await hass.callWS({ type: "bindhome/assets/list" });
      return response.assets ?? [];
    },
    async listPresets() {
      const response = await hass.callWS({ type: "bindhome/presets/list" });
      return response.presets ?? [];
    },
    async createAssetsBulk(assets) {
      return hass.callWS({ type: "bindhome/assets/create_bulk", assets });
    },
  };
}
