import { defineBindHomeElement } from "../custom-elements.js";
// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import { tokens } from "../styles/shared-styles.js";
import { csvFilename, scopeInventoryCsv } from "./csv-inventory.js";
import { downloadText } from "../utils/download.js";

export class BindHomeCsvInventoryTool extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    _scope: { state: true },
    _floorId: { state: true },
    _areaId: { state: true },
    _fileName: { state: true },
    _csvText: { state: true },
    _validation: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _success: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    /** @type {import("../types.js").Localizer} */
    this.t = (key) => key;
    this.floors = [];
    this.areas = [];
    /** @type {"all" | "floor" | "area"} */
    this._scope = "all";
    this._floorId = "";
    this._areaId = "";
    this._fileName = "";
    this._csvText = "";
    this._validation = null;
    this._busy = false;
    this._error = null;
    this._success = null;
  }

  static styles = [
    tokens,
    css`
      :host { display: block; }
      .tool { padding: 20px; }
      h2 { margin: 0 0 6px; font-size: 20px; font-weight: 500; }
      h3 { margin: 0 0 10px; font-size: 16px; font-weight: 500; }
      .muted { color: var(--secondary-text-color); }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
      label { display: grid; gap: 6px; font-size: 13px; color: var(--secondary-text-color); }
      select, input[type="file"] { min-height: 42px; padding: 8px 10px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); }
      .actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
      button { min-height: 42px; padding: 0 15px; border: 0; border-radius: 8px; font: inherit; font-weight: 500; }
      button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      button.secondary { background: var(--secondary-background-color); color: var(--primary-text-color); }
      button[disabled] { opacity: .5; cursor: default; }
      .split { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 22px; }
      .pane { min-width: 0; padding: 16px; border: 1px solid var(--divider-color); border-radius: 10px; }
      .status { margin-top: 12px; padding: 11px 12px; border-radius: 8px; background: var(--secondary-background-color); }
      .error { color: var(--error-color); }
      .success { color: var(--success-color, #2e7d32); }
      .table-wrap { overflow-x: auto; margin-top: 12px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { padding: 8px 9px; border-bottom: 1px solid var(--divider-color); text-align: left; vertical-align: top; }
      th { color: var(--secondary-text-color); font-weight: 500; }
      .summary { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .pill { padding: 4px 8px; border-radius: 999px; background: var(--secondary-background-color); font-size: 12px; }
      @media (max-width: 760px) {
        .tool { padding: 16px 12px; }
        .grid, .split { grid-template-columns: 1fr; }
      }
    `,
  ];

  _api() {
    return createBindHomeApi(this.hass);
  }

  _selectedScopeId() {
    return this._scope === "floor" ? this._floorId : this._scope === "area" ? this._areaId : null;
  }

  _scopeReady() {
    return this._scope === "all" || (this._scope === "floor" ? Boolean(this._floorId) : Boolean(this._areaId));
  }

  async _export() {
    if (!this.hass || !this._scopeReady()) return;
    this._busy = true;
    this._error = null;
    this._success = null;
    try {
      const response = await this._api().exportInventoryCsv();
      const id = this._selectedScopeId();
      const csv = scopeInventoryCsv(response.csv, {
        scope: this._scope,
        floorId: this._floorId || null,
        areaId: this._areaId || null,
        areas: this.areas,
      });
      downloadText(csvFilename(this._scope, id), csv, "text/csv;charset=utf-8");
      this._success = this.t("csv.export_success");
    } catch (error) {
      this._error = normalizeWsError(error, this.t("csv.export_error")).message;
    } finally {
      this._busy = false;
    }
  }

  async _fileSelected(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    this._fileName = file.name;
    this._csvText = await file.text();
    await this._validate();
  }

  async _validate() {
    if (!this.hass || !this._csvText) return;
    this._busy = true;
    this._error = null;
    this._success = null;
    this._validation = null;
    try {
      this._validation = await this._api().validateInventoryCsv(this._csvText);
    } catch (error) {
      this._error = normalizeWsError(error, this.t("csv.validate_error")).message;
    } finally {
      this._busy = false;
    }
  }

  async _commit() {
    if (!this.hass || !this._validation?.valid || !Number.isInteger(this._validation.revision)) return;
    this._busy = true;
    this._error = null;
    this._success = null;
    try {
      const result = await this._api().importInventoryCsv({
        csv: this._csvText,
        revision: this._validation.revision,
      });
      const assets = await this._api().listAssets();
      this.dispatchEvent(new CustomEvent("assets-refreshed", { detail: assets, bubbles: true, composed: true }));
      this._validation = { ...result, revision: result.revision };
      this._success = this.t("csv.import_success", {
        created: result.preview?.created ?? 0,
        updated: result.preview?.updated ?? 0,
      });
    } catch (error) {
      const normalized = normalizeWsError(error, this.t("csv.import_error"));
      this._error = normalized.code === "conflict" ? this.t("csv.conflict") : normalized.message;
    } finally {
      this._busy = false;
    }
  }

  _renderValidation() {
    const validation = this._validation;
    if (!validation) return html`<p class="muted">${this.t("csv.import_hint")}</p>`;
    if (!validation.valid) {
      const errors = validation.errors ?? [];
      return html`<div class="status error" role="alert">${this.t("csv.invalid", { count: errors.length })}</div>
        <div class="table-wrap"><table><thead><tr><th>${this.t("csv.row")}</th><th>${this.t("csv.field")}</th><th>${this.t("csv.problem")}</th></tr></thead><tbody>
          ${errors.map((item) => html`<tr><td>${item.row}</td><td>${item.field || this.t("common.not_set")}</td><td>${item.message}</td></tr>`)}
        </tbody></table></div>`;
    }
    const preview = validation.preview ?? { created: 0, updated: 0, total: 0, changes: [] };
    return html`<div class="status success">${this.t("csv.valid")}</div>
      <div class="summary">
        <span class="pill">${this.t("csv.created", { count: preview.created })}</span>
        <span class="pill">${this.t("csv.updated", { count: preview.updated })}</span>
        <span class="pill">${this.t("csv.total", { count: preview.total })}</span>
      </div>
      <div class="table-wrap"><table><thead><tr><th>${this.t("csv.row")}</th><th>${this.t("csv.operation")}</th><th>${this.t("fields.name")}</th></tr></thead><tbody>
        ${(preview.changes ?? []).map((change) => html`<tr><td>${change.row}</td><td>${this.t(`csv.operation_${change.operation}`)}</td><td>${change.name}</td></tr>`)}
      </tbody></table></div>
      <div class="actions"><button class="primary" ?disabled=${this._busy} @click=${this._commit}>${this.t("csv.commit")}</button></div>`;
  }

  render() {
    return html`<section class="tool surface">
      <h2>${this.t("csv.title")}</h2>
      <p class="muted">${this.t("csv.intro")}</p>
      <div class="split">
        <section class="pane">
          <h3>${this.t("csv.export_title")}</h3>
          <p class="muted">${this.t("csv.export_hint")}</p>
          <div class="grid">
            <label>${this.t("csv.scope")}
              <select .value=${this._scope} @change=${(event) => {
                const value = event.currentTarget.value;
                if (value === "all" || value === "floor" || value === "area") this._scope = value;
              }}>
                <option value="all">${this.t("csv.scope_all")}</option>
                <option value="floor">${this.t("csv.scope_floor")}</option>
                <option value="area">${this.t("csv.scope_area")}</option>
              </select>
            </label>
            ${this._scope === "floor" ? html`<label>${this.t("fields.floor")}
              <select .value=${this._floorId} @change=${(event) => { this._floorId = event.currentTarget.value; }}>
                <option value="">${this.t("csv.choose")}</option>
                ${this.floors.map((floor) => html`<option value=${floor.floor_id}>${floor.name}</option>`)}
              </select></label>` : nothing}
            ${this._scope === "area" ? html`<label>${this.t("fields.area")}
              <select .value=${this._areaId} @change=${(event) => { this._areaId = event.currentTarget.value; }}>
                <option value="">${this.t("csv.choose")}</option>
                ${this.areas.map((area) => html`<option value=${area.area_id}>${area.name}</option>`)}
              </select></label>` : nothing}
          </div>
          <div class="actions"><button class="primary" ?disabled=${this._busy || !this._scopeReady()} @click=${this._export}>${this.t("csv.export")}</button></div>
        </section>
        <section class="pane">
          <h3>${this.t("csv.import_title")}</h3>
          <p class="muted">${this.t("csv.import_warning")}</p>
          <label>${this.t("csv.file")}
            <input type="file" accept=".csv,text/csv" ?disabled=${this._busy} @change=${this._fileSelected} />
          </label>
          ${this._fileName ? html`<p class="muted">${this._fileName}</p>` : nothing}
          ${this._renderValidation()}
        </section>
      </div>
      ${this._error ? html`<div class="status error" role="alert">${this._error}</div>` : nothing}
      ${this._success ? html`<div class="status success" role="status">${this._success}</div>` : nothing}
    </section>`;
  }
}

defineBindHomeElement("bindhome-csv-inventory-tool", BindHomeCsvInventoryTool);
