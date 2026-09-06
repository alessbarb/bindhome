// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { defineBindHomeElement } from "../custom-elements.js";

const ACTIVE = new Set(["adopted", "modified"]);

export class BindHomeHardwareAdoptionControl extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    bindingStatuses: { attribute: false },
    readOnly: { type: Boolean, attribute: false },
    _status: { state: true },
    _loading: { state: true },
    _error: { state: true },
    _confirm: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this.t = (key) => key;
    this.asset = null;
    this.bindingStatuses = { records: [], summary: {} };
    this.readOnly = false;
    this._status = null;
    this._loading = false;
    this._error = null;
    this._confirm = null;
    this._assetIdentity = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hass && this.asset && !this.readOnly) void this._load();
  }

  updated(changed) {
    const assetId = this.asset?.id ?? null;
    const assetChanged = assetId !== this._assetIdentity;
    if (assetChanged) {
      this._assetIdentity = assetId;
      this._status = null;
      this._confirm = null;
      this._error = null;
    }
    if (
      !this.readOnly
      && this.hass
      && assetId
      && (assetChanged || changed.has("bindingStatuses"))
    ) {
      void this._load();
    }
  }

  static styles = css`
    :host { display: block; }
    h3 { margin: 0 0 8px; font-size: 17px; font-weight: 500; }
    p { line-height: 1.45; }
    .muted { color: var(--secondary-text-color); }
    .records { display: grid; gap: 8px; margin-top: 12px; }
    .record { padding: 10px 12px; border-radius: 8px; background: var(--secondary-background-color); }
    .record strong, .record span { display: block; overflow-wrap: anywhere; }
    .record span { margin-top: 2px; color: var(--secondary-text-color); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button { min-height: 38px; }
    .confirm { margin-top: 12px; padding: 12px; border: 1px solid var(--warning-color); border-radius: 8px; }
    .error { color: var(--error-color); }
    .warning { color: var(--warning-color); }
  `;

  async _load() {
    if (!this.hass || !this.asset || this._loading) return;
    const identity = this.asset.id;
    this._loading = true;
    this._error = null;
    try {
      const result = await createBindHomeApi(this.hass).getAdoptionStatus(identity);
      if (this.asset?.id === identity) this._status = result;
    } catch (error) {
      if (this.asset?.id === identity) {
        this._error = error instanceof Error ? error.message : String(error);
      }
    } finally {
      if (this.asset?.id === identity) this._loading = false;
    }
  }

  _records() {
    return this._status?.records ?? [];
  }

  _hasAdoption() {
    return this._records().some((record) => ACTIVE.has(record.status));
  }

  _canAdopt() {
    return this._records().some((record) =>
      ["visible", "hidden_external", "modified"].includes(record.status),
    );
  }

  _statusLabel(status) {
    return this.t(`adoption.status.${status}`);
  }

  async _commit(action) {
    if (!this.hass || !this.asset) return;
    this._loading = true;
    this._error = null;
    try {
      const api = createBindHomeApi(this.hass);
      this._status = action === "adopt"
        ? await api.adoptHardware(this.asset.id)
        : await api.revertHardwareAdoption(this.asset.id);
      this._confirm = null;
      this.dispatchEvent(new CustomEvent("adoption-changed", {
        bubbles: true,
        composed: true,
      }));
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this.readOnly) return nothing;
    const records = this._records();
    const hasUnsupported = records.some((record) => record.status === "unsupported");

    return html`
      <h3>${this.t("adoption.title")}</h3>
      <p class="muted">${this.t("adoption.intro")}</p>
      ${records.length
        ? html`<div class="records">${records.map((record) => html`
            <div class="record">
              <strong>${record.entity_id || this.t("common.not_set")}</strong>
              <span>${this._statusLabel(record.status)}</span>
            </div>
          `)}</div>`
        : html`<p class="muted">${this.t("adoption.no_hardware")}</p>`}
      ${hasUnsupported
        ? html`<p class="warning">${this.t("adoption.stable_identity_required")}</p>`
        : nothing}
      <div class="actions">
        ${this._canAdopt()
          ? html`<button class="primary" ?disabled=${this._loading} @click=${() => (this._confirm = "adopt")}>${this.t("adoption.adopt")}</button>`
          : nothing}
        ${this._hasAdoption()
          ? html`<button class="secondary" ?disabled=${this._loading} @click=${() => (this._confirm = "revert")}>${this.t("adoption.revert")}</button>`
          : nothing}
        <button class="text-button" ?disabled=${this._loading} @click=${() => this._load()}>${this.t("common.refresh")}</button>
      </div>
      ${this._confirm
        ? html`<div class="confirm">
            <strong>${this.t(this._confirm === "adopt" ? "adoption.confirm_adopt_title" : "adoption.confirm_revert_title")}</strong>
            <p>${this.t(this._confirm === "adopt" ? "adoption.confirm_adopt" : "adoption.confirm_revert")}</p>
            <div class="actions">
              <button class="primary" ?disabled=${this._loading} @click=${() => this._commit(this._confirm)}>${this.t("common.confirm")}</button>
              <button class="secondary" ?disabled=${this._loading} @click=${() => (this._confirm = null)}>${this.t("common.cancel")}</button>
            </div>
          </div>`
        : nothing}
      ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
    `;
  }
}

defineBindHomeElement("bindhome-hardware-adoption-control", BindHomeHardwareAdoptionControl);
