// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import { assetPresentation } from "../presentation/asset-types.js";
import { tokens } from "../styles/shared-styles.js";

export class BindHomeHumanAssetEditor extends LitElement {
  static properties = {
    hass: { attribute: false }, t: { attribute: false }, asset: { attribute: false },
    areas: { attribute: false }, refreshAssets: { attribute: false },
    _name: { state: true }, _code: { state: true }, _areaId: { state: true },
    _saving: { state: true }, _error: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.asset = null;
    this.areas = [];
    this.refreshAssets = null;
    this._name = "";
    this._code = "";
    this._areaId = "";
    this._saving = false;
    this._error = null;
    this._identity = null;
    this._operation = 0;
    this._committed = false;
  }
  static styles = [tokens, css`
    :host { display:block; }
    form { padding:20px; }
    .head { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .head ha-icon { color:var(--primary-color); --mdc-icon-size:30px; }
    h2 { font-size:21px; font-weight:500; }
    .type { color:var(--secondary-text-color); margin-top:3px; }
    .fields { display:grid; gap:16px; }
    label { display:block; font-weight:500; }
    input, select { width:100%; min-height:46px; margin-top:7px; padding:9px 11px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); }
    .actions { display:flex; justify-content:flex-end; gap:8px; margin-top:22px; }
    @media (max-width:600px) { form { padding:16px; } .actions > * { flex:1; } }
  `];
  willUpdate() {
    if (this.asset?.id === this._identity) return;
    this._identity = this.asset?.id ?? null;
    this._operation += 1;
    this._name = this.asset?.name ?? "";
    this._code = this.asset?.code ?? "";
    this._areaId = this.asset?.area_id ?? "";
    this._saving = false;
    this._error = null;
    this._committed = false;
  }
  async _save(event) {
    event?.preventDefault();
    if (this._saving || this._committed || !this.asset || !this._name.trim()) return;
    const changes = {};
    if (this._name.trim() !== this.asset.name) changes.name = this._name.trim();
    if ((this._code.trim() || null) !== (this.asset.code || null)) changes.code = this._code.trim() || null;
    if ((this._areaId || null) !== (this.asset.area_id || null)) changes.area_id = this._areaId || null;
    if (!Object.keys(changes).length) { this.dispatchEvent(new CustomEvent("done", { bubbles: true, composed: true })); return; }
    this._saving = true;
    this._error = null;
    const operation = ++this._operation;
    const assetId = this.asset.id;
    try {
      const updated = await createBindHomeApi(this.hass).updateAsset(assetId, changes);
      if (operation !== this._operation || assetId !== this.asset?.id) return;
      this._committed = true;
      this.dispatchEvent(new CustomEvent("asset-committed", { detail: updated, bubbles: true, composed: true }));
      try {
        if (this.refreshAssets) await this.refreshAssets();
      } catch {
        if (operation !== this._operation || assetId !== this.asset?.id) return;
        this.dispatchEvent(new CustomEvent("sync-warning", { detail: this.t("editor.sync_warning"), bubbles: true, composed: true }));
      }
      if (operation === this._operation && assetId === this.asset?.id) this.dispatchEvent(new CustomEvent("done", { bubbles: true, composed: true }));
    } catch (error) {
      if (
        operation !== this._operation ||
        assetId !== this.asset?.id
      ) {
        return;
      }

      const normalized = normalizeWsError(
        error,
        this.t("editor.save_error"),
      );

      this._error =
        normalized.code === "conflict"
          ? this.t("editor.save_error")
          : normalized.message;
    } finally {
      if (operation === this._operation) this._saving = false;
    }
  }
  render() {
    if (!this.asset) return nothing;
    const type = assetPresentation(this.t, this.asset.asset_type);
    return html`<form class="surface" @submit=${this._save}>
      <div class="head"><ha-icon icon=${type.icon}></ha-icon><div><h2>${this.t("editor.human_title")}</h2><div class="type">${type.label}</div></div></div>
      <div class="fields">
        <label>${this.t("fields.name")}<input .value=${this._name} @input=${(e) => (this._name = e.target.value)} required></label>
        <label>${this.t("fields.code_optional")}<input .value=${this._code} @input=${(e) => (this._code = e.target.value)}></label>
        <label>${this.t("add.room")}<select .value=${this._areaId} @change=${(e) => (this._areaId = e.target.value)}><option value="" ?selected=${!this._areaId}>${this.t("add.no_room")}</option>${this.areas.map((area) => html`<option value=${area.area_id} ?selected=${area.area_id === this._areaId}>${area.name}</option>`)}</select></label>
      </div>
      ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}
      <div class="actions"><button type="button" class="secondary" ?disabled=${this._saving} @click=${() => this.dispatchEvent(new CustomEvent("cancel", { bubbles:true, composed:true }))}>${this.t("common.cancel")}</button><button class="primary" ?disabled=${this._saving || this._committed || !this._name.trim()}>${this._saving ? this.t("editor.saving") : this.t("common.save")}</button></div>
    </form>`;
  }
}
customElements.define("bindhome-human-asset-editor", BindHomeHumanAssetEditor);
