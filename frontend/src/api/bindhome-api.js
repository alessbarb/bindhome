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

    async listBindingStatuses() {
      return hass.callWS({
        type: "bindhome/bindings/status",
      });
    },

    async setBinding({ assetId, capability, entityId, role = "primary" }) {
      return hass.callWS({
        type: "bindhome/bindings/set",
        asset_id: assetId,
        capability,
        entity_id: entityId,
        role,
      });
    },

    async deleteBinding(bindingId) {
      return hass.callWS({
        type: "bindhome/bindings/delete",
        binding_id: bindingId,
      });
    },

    async createRelation({ sourceAssetId, relationType, targetAssetId }) {
      return hass.callWS({
        type: "bindhome/relations/create",
        source_asset_id: sourceAssetId,
        relation_type: relationType,
        target_asset_id: targetAssetId,
      });
    },

    async deleteRelation(relationId) {
      return hass.callWS({
        type: "bindhome/relations/delete",
        relation_id: relationId,
      });
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
