// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { tokens } from "../styles/shared-styles.js";
import { assetPresentation } from "../presentation/asset-types.js";
import { presetDisplayName } from "../i18n/localize.js";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";

const FEATURED = [
  "light_point",
  "socket",
  "circuit",
  "tap",
  "shutoff_valve",
  "window",
  "door",
  "appliance",
];
export class BindHomeAddView extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    presets: { attribute: false },
    areas: { attribute: false },
    contextAreaId: { attribute: false },
    onCreated: { attribute: false },
    _preset: { state: true },
    _name: { state: true },
    _code: { state: true },
    _areaId: { state: true },
    _showAll: { state: true },
    _saving: { state: true },
    _error: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    this.t = (key) => key;
    this.presets = [];
    this.areas = [];
    this.contextAreaId = null;
    this.onCreated = null;
    this._preset = null;
    this._name = "";
    this._code = "";
    this._areaId = "";
    this._showAll = false;
    this._saving = false;
    this._error = null;
    this._identity = null;
  }
  static styles = [
    tokens,
    css`
      .intro {
        margin-top: 5px;
      }
      .picker {
        margin-top: 24px;
      }
      .picker h2,
      .form h2 {
        font-size: 19px;
        font-weight: 500;
      }
      .presets {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 14px;
      }
      .preset {
        min-height: 92px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 9px;
        padding: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        background: var(--card-background-color);
        text-align: left;
      }
      .preset:hover {
        border-color: var(--primary-color);
        background: var(--secondary-background-color);
      }
      .preset ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 27px;
      }
      .more {
        margin-top: 10px;
      }
      .form {
        max-width: 680px;
        margin-top: 24px;
        padding: 22px;
      }
      .form-head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      .form-head ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 30px;
      }
      .fields {
        display: grid;
        gap: 16px;
      }
      label {
        display: block;
        font-weight: 500;
      }
      input,
      select {
        width: 100%;
        min-height: 46px;
        margin-top: 7px;
        padding: 9px 11px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 22px;
      }
      .success {
        margin-top: 16px;
        color: var(--success-color, var(--primary-color));
      }
      @media (max-width: 600px) {
        .presets {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .form {
          padding: 16px;
        }
        .actions > * {
          flex: 1;
        }
      }
    `,
  ];
  willUpdate() {
    if (this.contextAreaId !== this._identity) {
      this._identity = this.contextAreaId;
      this._areaId = this.contextAreaId ?? "";
    }
  }
  _choose(preset) {
    this._preset = preset;
    this._name = presetDisplayName(this.t, preset);
    this._code = "";
    this._error = null;
  }
  async _submit(event) {
    event.preventDefault();
    if (this._saving || !this._preset || !this._name.trim()) return;
    this._saving = true;
    this._error = null;
    try {
      const payload = {
        name: this._name.trim(),
        asset_type: this._preset.asset_type,
        capabilities: [...(this._preset.suggested_capabilities ?? [])],
      };
      if (this._code.trim()) payload.code = this._code.trim();
      if (this._areaId) payload.area_id = this._areaId;
      const response = await createBindHomeApi(this.hass).createAssetsBulk([
        payload,
      ]);
      const created = response?.assets?.[0] ?? response?.created?.[0] ?? null;
      if (this.onCreated) await this.onCreated(created);
      this.dispatchEvent(
        new CustomEvent("asset-created", {
          detail: created,
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      this._error = normalizeWsError(error, this.t("add.create_error")).message;
    } finally {
      this._saving = false;
    }
  }
  render() {
    const visible = this._showAll
      ? this.presets
      : FEATURED.map((id) =>
          this.presets.find((p) => p.preset_id === id),
        ).filter(Boolean);
    return html`<div class="page">
      <h1 class="page-title">${this.t("nav.add")}</h1>
      <p class="intro muted">${this.t("add.intro")}</p>
      ${!this._preset
        ? html`<section class="picker">
            <h2>${this.t("add.what")}</h2>
            <div class="presets">
              ${visible.map((preset) => {
                const meta = assetPresentation(this.t, preset.asset_type);
                return html`<button
                  class="preset"
                  @click=${() => this._choose(preset)}
                >
                  <ha-icon icon=${meta.icon}></ha-icon
                  ><strong>${presetDisplayName(this.t, preset)}</strong>
                </button>`;
              })}
            </div>
            ${!this._showAll
              ? html`<button
                  class="more text-button"
                  @click=${() => (this._showAll = true)}
                >
                  ${this.t("add.show_all")}
                </button>`
              : nothing}
          </section>`
        : html`<form class="form surface" @submit=${this._submit}>
            <div class="form-head">
              <ha-icon
                icon=${assetPresentation(this.t, this._preset.asset_type).icon}
              ></ha-icon>
              <h2>${presetDisplayName(this.t, this._preset)}</h2>
            </div>
            <div class="fields">
              <label
                >${this.t("fields.name")}<input
                  .value=${this._name}
                  @input=${(e) => (this._name = e.target.value)}
                  required /></label
              ><label
                >${this.t("fields.code_optional")}<input
                  .value=${this._code}
                  @input=${(e) => (this._code = e.target.value)} /></label
              ><label
                >${this.t("add.room")}<select
                  .value=${this._areaId}
                  @change=${(e) => (this._areaId = e.target.value)}
                >
                  <option value="">${this.t("add.no_room")}</option>
                  ${this.areas.map(
                    (area) =>
                      html`<option value=${area.area_id}>${area.name}</option>`,
                  )}
                </select></label
              >
            </div>
            ${this._error
              ? html`<div class="error" role="alert">${this._error}</div>`
              : nothing}
            <div class="actions">
              <button
                type="button"
                class="secondary"
                ?disabled=${this._saving}
                @click=${() => {
                  this._preset = null;
                  this._error = null;
                }}
              >
                ${this.t("common.cancel")}</button
              ><button
                class="primary"
                ?disabled=${this._saving || !this._name.trim()}
              >
                ${this._saving ? this.t("add.saving") : this.t("common.add")}
              </button>
            </div>
          </form>`}
    </div>`;
  }
}
customElements.define("bindhome-add-view", BindHomeAddView);
