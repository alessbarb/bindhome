export function createBindHomeApi(hass) {
  return {
    async getRegistry() {
      return hass.callWS({
        type: "bindhome/registry/get",
      });
    },

    async listAssets() {
      const response = await hass.callWS({
        type: "bindhome/assets/list",
      });

      return response.assets ?? [];
    },

    async listPresets() {
      const response = await hass.callWS({
        type: "bindhome/presets/list",
      });

      return response.presets ?? [];
    },

    async createAssetsBulk(assets) {
      return hass.callWS({
        type: "bindhome/assets/create_bulk",
        assets,
      });
    },

    async updateAsset(assetId, changes) {
      const response = await hass.callWS({
        ...changes,
        type: "bindhome/assets/update",
        asset_id: assetId,
      });

      return response.asset;
    },

    async deleteAsset(assetId) {
      return hass.callWS({
        type: "bindhome/assets/delete",
        asset_id: assetId,
      });
    },
  };
}
