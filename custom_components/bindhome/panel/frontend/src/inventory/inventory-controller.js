import { normalizeBulkError } from "../api/normalize-ws-error.js";
import { serializeActiveDrafts } from "./draft-state.js";

export class InventorySaveController {
  constructor(api) {
    this.api = api;
    this.saving = false;
  }

  async save(draftState, areaId) {
    if (this.saving) return { ok: false, duplicate: true };
    this.saving = true;
    const payload = serializeActiveDrafts(draftState, areaId);
    let response;
    try {
      response = await this.api.createAssetsBulk(payload);
    } catch (error) {
      this.saving = false;
      return { ok: false, duplicate: false, error: normalizeBulkError(error) };
    }
    try {
      const assets = await this.api.listAssets();
      return { ok: true, created: response.assets ?? [], assets, payload, refreshError: null };
    } catch (refreshError) {
      return { ok: true, created: response.assets ?? [], assets: null, payload, refreshError };
    } finally {
      this.saving = false;
    }
  }
}
