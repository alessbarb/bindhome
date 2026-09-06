import { defineBindHomeElement } from "../custom-elements.js";
// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { tokens } from "../styles/shared-styles.js";
import { assetPresentation } from "../presentation/asset-types.js";
import { categoryPresentation } from "../presentation/asset-types.js";
import { presetDisplayName } from "../i18n/localize.js";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import { buildPresetCatalogue } from "./preset-catalogue.js";
import "../inventory/inventory-workflow.js";
import "./assisted-import-workflow.js";

export class BindHomeAddView extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    presets: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    contextAreaId: { attribute: false },
    sessionId: { attribute: false },
    onCreated: { attribute: false },
    _mode: { state: true },
    _preset: { state: true },
    _name: { state: true },
    _code: { state: true },
    _areaId: { state: true },
    _search: { state: true },
    _saving: { state: true },
    _error: { state: true },
    _sync: { state: true },
    _committed: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.presets = [];
    this.floors = [];
    this.areas = [];
    this.assets = [];
    this.contextAreaId = null;
    this.sessionId = 0;
    this.onCreated = null;
    this._mode = "single";
    this._preset = null;
    this._name = "";
    this._code = "";
    this._areaId = "";
    this._search = "";
    this._saving = false;
    this._error = null;
    this._sync = null;
    this._committed = false;
    this._identity = null;
    this._operation = 0;
  }
  static styles = [
    tokens,
    css`
      .intro { margin-top: 5px; }
      .mode-switch { display:flex; width:fit-content; margin-top:20px; padding:3px; gap:3px; border:1px solid var(--divider-color); border-radius:10px; background:var(--card-background-color); }
      .mode-switch button { min-height:40px; padding:0 14px; border:0; border-radius:7px; background:transparent; color:var(--secondary-text-color); font:inherit; font-weight:500; cursor:pointer; }
      .mode-switch button.active { background:var(--primary-color); color:var(--text-primary-color, #fff); }
      .picker { margin-top: 24px; }
      .picker h2, .form h2, .picker h3 { font-size: 19px; font-weight: 500; }
      .search { display:block; max-width:680px; margin-top:16px; font-weight:500; }
      .search input { width:100%; min-height:46px; margin-top:7px; padding:9px 11px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); }
      .catalogue-section, .catalogue { margin-top:24px; }
      .category { margin-top:10px; border:1px solid var(--divider-color); border-radius:10px; background:var(--card-background-color); overflow:hidden; }
      .category summary { display:flex; align-items:center; gap:10px; min-height:52px; padding:8px 14px; font-weight:500; }
      .category summary ha-icon { color:var(--primary-color); }
      .category .count { margin-left:auto; color:var(--secondary-text-color); font-size:12px; }
      .category .presets { margin:0; padding:0 12px 12px; }
      .presets { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 14px; }
      .preset { min-height: 92px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 9px; padding: 14px; border: 1px solid var(--divider-color); border-radius: 10px; background: var(--card-background-color); text-align: left; }
      .preset:hover { border-color: var(--primary-color); background: var(--secondary-background-color); }
      .preset ha-icon { color: var(--primary-color); --mdc-icon-size: 27px; }
      .form { max-width: 680px; margin-top: 24px; padding: 22px; }
      .form-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
      .form-head ha-icon { color: var(--primary-color); --mdc-icon-size: 30px; }
      .fields { display: grid; gap: 16px; }
      label { display: block; font-weight: 500; }
      input, select { width: 100%; min-height: 46px; margin-top: 7px; padding: 9px 11px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); }
      .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 22px; }
      .success { margin-top: 16px; color: var(--success-color, var(--primary-color)); }
      @media (max-width: 700px) {
        .mode-switch { width:100%; }
        .mode-switch button { flex:1; padding-inline:7px; font-size:13px; }
        .presets { grid-template-columns:1fr; }
        .preset { min-height:56px; flex-direction:row; align-items:center; justify-content:flex-start; }
        .catalogue-section, .catalogue { margin-top:20px; }
        .form { padding: 16px; }
        .actions > * { flex: 1; }
      }
    `,
  ];
  willUpdate() {
    if (this.sessionId !== this._identity) {
      this._identity = this.sessionId;
      this._mode = "single";
      this._preset = null;
      this._name = "";
      this._code = "";
      this._areaId = this.contextAreaId ?? "";
      this._search = "";
      this._operation += 1;
      this._saving = false;
      this._error = null;
      this._sync = null;
      this._committed = false;
    }
  }
  _choose(preset) {
    this._preset = preset;
    this._name = presetDisplayName(this.t, preset);
    this._code = "";
    this._error = null;
    this._sync = null;
    this._committed = false;
  }
  _forwardAssetsRefreshed(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("assets-refreshed", { detail: event.detail, bubbles: true, composed: true }));
  }
  _goHome(event) {
    event?.stopPropagation?.();
    this.dispatchEvent(new CustomEvent("go-home", { bubbles: true, composed: true }));
  }
  async _submit(event) {
    event.preventDefault();
    if (this._saving || this._committed || !this._preset || !this._name.trim()) return;
    const operation = ++this._operation;
    const sessionId = this.sessionId;
    this._saving = true;
    this._error = null;
    this._sync = null;
    try {
      const payload = {
        name: this._name.trim(),
        asset_type: this._preset.asset_type,
        capabilities: [...(this._preset.suggested_capabilities ?? [])],
      };
      if (this._code.trim()) payload.code = this._code.trim();
      if (this._areaId) payload.area_id = this._areaId;
      const response = await createBindHomeApi(this.hass).createAssetsBulk([payload]);
      const created = response?.assets?.[0] ?? response?.created?.[0] ?? null;
      if (operation !== this._operation || sessionId !== this.sessionId) return;
      this._committed = true;
      this._saving = false;
      try {
        if (this.onCreated) await this.onCreated(created);
      } catch {
        if (operation !== this._operation || sessionId !== this.sessionId) return;
        this._sync = this.t("shell.refresh_error");
      }
      if (operation === this._operation && sessionId === this.sessionId) {
        this.dispatchEvent(new CustomEvent("asset-created", { detail: created, bubbles: true, composed: true }));
      }
    } catch (error) {
      if (operation !== this._operation || sessionId !== this.sessionId) return;
      const normalized = normalizeWsError(error, this.t("add.create_error"));
      this._error = normalized.code === "conflict" ? this.t("add.create_error") : normalized.message;
    } finally {
      if (operation === this._operation && sessionId === this.sessionId) this._saving = false;
    }
  }

  render() {
    const catalogue = buildPresetCatalogue(this.t, this.presets, this._search);
    return html`<div class="page">
      <h1 class="page-title">${this.t("nav.add")}</h1>
      <p class="intro muted">${this.t("add.intro")}</p>
      <div class="mode-switch" role="tablist" aria-label=${this.t("add.mode_label")}>
        <button class=${this._mode === "single" ? "active" : ""} role="tab" aria-selected=${this._mode === "single"} @click=${() => (this._mode = "single")}>${this.t("add.single_mode")}</button>
        <button class=${this._mode === "bulk" ? "active" : ""} role="tab" aria-selected=${this._mode === "bulk"} @click=${() => { this._mode = "bulk"; this._preset = null; }}>${this.t("add.bulk_mode")}</button>
        <button class=${this._mode === "import" ? "active" : ""} role="tab" aria-selected=${this._mode === "import"} @click=${() => { this._mode = "import"; this._preset = null; }}>${this.t("add.import_mode")}</button>
      </div>
      ${this._mode === "bulk"
        ? html`<bindhome-inventory-workflow
            .hass=${this.hass}
            .t=${this.t}
            .presets=${this.presets}
            .floors=${this.floors}
            .areas=${this.areas}
            .assets=${this.assets}
            @assets-refreshed=${this._forwardAssetsRefreshed}
            @view-infrastructure=${this._goHome}
          ></bindhome-inventory-workflow>`
        : this._mode === "import"
          ? html`<bindhome-assisted-import-workflow
              .hass=${this.hass}
              .t=${this.t}
              .areas=${this.areas}
              .assets=${this.assets}
              .contextAreaId=${this.contextAreaId}
              @assets-refreshed=${this._forwardAssetsRefreshed}
            ></bindhome-assisted-import-workflow>`
          : !this._preset
            ? html`<section class="picker">
              <h2>${this.t("add.what")}</h2>
              <label class="search">${this.t("add.search_label")}<input type="search" .value=${this._search} placeholder=${this.t("add.search_placeholder")} @input=${(e) => (this._search = e.target.value)}></label>
              ${catalogue.featured.length ? html`<section class="catalogue-section"><h3>${this.t("add.frequent")}</h3><div class="presets">${catalogue.featured.map((item) => this._renderPreset(item))}</div></section>` : nothing}
              <section class="catalogue"><h3>${this.t("add.all_types")}</h3>
                ${catalogue.groups.length ? catalogue.groups.map((group) => { const category = categoryPresentation(this.t, group.category); return html`<details class="category" ?open=${Boolean(this._search)}><summary><ha-icon icon=${category.icon}></ha-icon><span>${category.label}</span><span class="count">${group.items.length}</span></summary><div class="presets">${group.items.map((item) => this._renderPreset(item))}</div></details>`; }) : html`<div class="empty">${this.t("add.no_matches")}</div>`}
              </section>
            </section>`
            : html`<form class="form surface" @submit=${this._submit}>
              <div class="form-head"><ha-icon icon=${assetPresentation(this.t, this._preset.asset_type).icon}></ha-icon><h2>${presetDisplayName(this.t, this._preset)}</h2></div>
              <div class="fields">
                <label>${this.t("fields.name")}<input .value=${this._name} @input=${(e) => (this._name = e.target.value)} required /></label>
                <label>${this.t("fields.code_optional")}<input .value=${this._code} @input=${(e) => (this._code = e.target.value)} /></label>
                <label>${this.t("add.room")}<select .value=${this._areaId} @change=${(e) => (this._areaId = e.target.value)}>
                  <option value="" ?selected=${!this._areaId}>${this.t("add.no_room")}</option>
                  ${this.areas.map((area) => html`<option value=${area.area_id} ?selected=${area.area_id === this._areaId}>${area.name}</option>`)}
                </select></label>
              </div>
              ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}
              ${this._sync ? html`<div class="success" role="status">${this._sync}</div>` : nothing}
              <div class="actions">
                <button type="button" class="secondary" ?disabled=${this._saving} @click=${() => { this._preset = null; this._error = null; this._sync = null; this._committed = false; }}>${this.t("common.cancel")}</button>
                <button class="primary" ?disabled=${this._saving || this._committed || !this._name.trim()}>${this._saving ? this.t("add.saving") : this.t("common.add")}</button>
              </div>
            </form>`}
    </div>`;
  }

  _renderPreset(item) {
    return html`<button class="preset" @click=${() => this._choose(item.preset)}><ha-icon icon=${item.presentation.icon}></ha-icon><strong>${item.name}</strong></button>`;
  }
}
defineBindHomeElement("bindhome-add-view", BindHomeAddView);
