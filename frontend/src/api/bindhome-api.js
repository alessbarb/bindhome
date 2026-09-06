const clients = new WeakMap();

function stateFor(hass) {
  const key = hass?.connection ?? hass;
  if ((typeof key !== "object" && typeof key !== "function") || key === null) {
    throw new TypeError("BindHome API requires a Home Assistant connection");
  }

  let state = clients.get(key);
  if (!state) {
    state = { revision: null, conflictListeners: new Set() };
    clients.set(key, state);
  }
  return state;
}

function acceptRevision(state, revision) {
  if (Number.isInteger(revision) && revision >= 0) state.revision = revision;
}

function errorCode(error) {
  return error?.code ?? error?.body?.code ?? error?.data?.code ?? null;
}

function notifyConflict(state, error) {
  if (errorCode(error) !== "conflict") return;
  for (const listener of state.conflictListeners) listener(error);
}

async function mutate(hass, state, message) {
  const request = { ...message };
  if (state.revision !== null) request.based_on_revision = state.revision;

  try {
    const response = await hass.callWS(request);
    acceptRevision(state, response?.revision);
    return response;
  } catch (error) {
    notifyConflict(state, error);
    throw error;
  }
}

async function mutateAtRevision(hass, state, message, revision) {
  try {
    const response = await hass.callWS({
      ...message,
      based_on_revision: revision,
    });
    acceptRevision(state, response?.revision);
    return response;
  } catch (error) {
    notifyConflict(state, error);
    throw error;
  }
}

export function subscribeBindHomeConflicts(hass, listener) {
  const state = stateFor(hass);
  state.conflictListeners.add(listener);
  return () => state.conflictListeners.delete(listener);
}

export function createBindHomeApi(hass) {
  const state = stateFor(hass);

  return {
    async getRegistry() {
      const response = await hass.callWS({
        type: "bindhome/registry/get",
      });
      acceptRevision(state, response?.revision);
      return response;
    },

    async subscribeRegistryChanges(listener) {
      return hass.connection.subscribeMessage(listener, {
        type: "bindhome/registry/subscribe",
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
      return mutate(hass, state, {
        type: "bindhome/bindings/set",
        asset_id: assetId,
        capability,
        entity_id: entityId,
        role,
      });
    },

    async getReplacementCandidates({ assetId, capability, role = "primary" }) {
      const response = await hass.callWS({
        type: "bindhome/replacement/candidates",
        asset_id: assetId,
        capability,
        role,
      });
      acceptRevision(state, response?.revision);
      return response;
    },

    async commitReplacement({ assetId, capability, entityId, revision, role = "primary" }) {
      return mutateAtRevision(
        hass,
        state,
        {
          type: "bindhome/replacement/commit",
          asset_id: assetId,
          capability,
          entity_id: entityId,
          role,
        },
        revision,
      );
    },

    async deleteBinding(bindingId) {
      return mutate(hass, state, {
        type: "bindhome/bindings/delete",
        binding_id: bindingId,
      });
    },

    async createRelation({ sourceAssetId, relationType, targetAssetId }) {
      return mutate(hass, state, {
        type: "bindhome/relations/create",
        source_asset_id: sourceAssetId,
        relation_type: relationType,
        target_asset_id: targetAssetId,
      });
    },

    async deleteRelation(relationId) {
      return mutate(hass, state, {
        type: "bindhome/relations/delete",
        relation_id: relationId,
      });
    },

    async createAssetsBulk(assets) {
      return mutate(hass, state, {
        type: "bindhome/assets/create_bulk",
        assets,
      });
    },

    async updateAsset(assetId, changes) {
      const response = await mutate(hass, state, {
        ...changes,
        type: "bindhome/assets/update",
        asset_id: assetId,
      });

      return response.asset;
    },

    async deleteAsset(assetId) {
      return mutate(hass, state, {
        type: "bindhome/assets/delete",
        asset_id: assetId,
      });
    },

    async getDeleteImpact(assetId) {
      const response = await hass.callWS({
        type: "bindhome/assets/delete_impact",
        asset_id: assetId,
      });
      acceptRevision(state, response?.revision);
      return response;
    },

    async deleteAssetWithDependencies(assetId) {
      return mutate(hass, state, {
        type: "bindhome/assets/delete_with_dependencies",
        asset_id: assetId,
      });
    },

    async discoverImport(areaId = null) {
      const response = await hass.callWS({
        type: "bindhome/import/discover",
        ...(areaId ? { area_id: areaId } : {}),
      });
      acceptRevision(state, response?.revision);
      return response;
    },

    async commitImport({ areaId = null, revision, decisions }) {
      return mutateAtRevision(
        hass,
        state,
        {
          type: "bindhome/import/commit",
          decisions,
          ...(areaId ? { area_id: areaId } : {}),
        },
        revision,
      );
    },

    async exportInventoryCsv() {
      return hass.callWS({ type: "bindhome/csv/export" });
    },

    async validateInventoryCsv(csv) {
      const response = await hass.callWS({ type: "bindhome/csv/validate", csv });
      acceptRevision(state, response?.revision);
      return response;
    },

    async importInventoryCsv({ csv, revision }) {
      return mutateAtRevision(
        hass,
        state,
        { type: "bindhome/csv/import", csv },
        revision,
      );
    },

    async exportRegistryBackup() {
      return hass.callWS({ type: "bindhome/backup/export" });
    },

    async getBackupRecoveryStatus() {
      return hass.callWS({ type: "bindhome/backup/recovery_status" });
    },

    async restoreRegistryBackup({ backup, revision = null }) {
      if (Number.isInteger(revision)) {
        return mutateAtRevision(hass, state, { type: "bindhome/backup/restore", backup }, revision);
      }
      const response = await hass.callWS({ type: "bindhome/backup/restore", backup });
      acceptRevision(state, response?.revision);
      return response;
    },
  };
}
