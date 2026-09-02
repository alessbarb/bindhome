import { LitElement, css, html, nothing } from "lit";

import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import { pluralKey } from "../i18n/localize.js";
import { normalizeEntityCandidates, searchEntityCandidates } from "./entity-catalogue.js";

function capabilityLabel(t, capability) {
  const key = `capabilities.${capability}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return capability.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export class BindHomePrimaryConnectionEditor extends LitElement {
  static properties = {
    hass: { attribute: false }, t: { attribute: false }, asset: { attribute: false },
    capability: { type: String }, status: { attribute: false }, areas: { attribute: false },
    entityRegistry: { attribute: false }, deviceRegistry: { attribute: false },
    refreshBindingData: { attribute: false }, _editing: { state: true }, _search: { state: true },
    _selectedEntityId: { state: true }, _saving: { state: true }, _error: { state: true },
    _confirmDisconnect: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this.t = (key) => key;
    this.asset = null;
    this.capability = "";
    this.status = null;
    this.areas = [];
    this.entityRegistry = [];
    this.deviceRegistry = [];
    this.refreshBindingData = null;
    this._editing = false;
    this._search = "";
    this._selectedEntityId = null;
    this._saving = false;
    this._error = null;
    this._confirmDisconnect = false;
    this._bindingIdentity = null;
    this._operation = 0;
    this._committedDisconnectId = null;
  }

  static styles = css`
    :host { display: block; }
    .row { display: grid; gap: 8px; }
    .summary { color: var(--secondary-text-color); font-size: 13px; line-height: 19px; }
    .entity { font-weight: 500; overflow-wrap: anywhere; }
    .technical { color: var(--secondary-text-color); font-size: 12px; overflow-wrap: anywhere; }
    .actions, .confirm { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    button { min-height: 40px; padding: 7px 12px; border: 1px solid var(--divider-color); border-radius: 7px; background: var(--card-background-color); color: inherit; font: inherit; cursor: pointer; }
    button.primary { border-color: var(--primary-color); background: var(--primary-color); color: var(--text-primary-color, #fff); }
    button.danger { color: var(--error-color); }
    button:disabled { cursor: wait; opacity: .6; }
    input { width: 100%; min-height: 44px; box-sizing: border-box; padding: 8px 10px; border: 1px solid var(--divider-color); border-radius: 7px; background: var(--card-background-color); color: inherit; font: inherit; }
    .picker { display: grid; gap: 8px; margin-top: 10px; }
    .candidate { display: grid; gap: 2px; width: 100%; min-height: 52px; text-align: left; }
    .candidate.selected { outline: 2px solid var(--primary-color); outline-offset: -2px; }
    .candidate-meta { color: var(--secondary-text-color); font-size: 12px; overflow-wrap: anywhere; }
    .muted { color: var(--secondary-text-color); }
    .error { color: var(--error-color); line-height: 19px; }
  `;

  _candidates() {
    return normalizeEntityCandidates({
      entityRegistry: this.entityRegistry,
      deviceRegistry: this.deviceRegistry,
      states: this.hass?.states,
      areas: this.areas,
    });
  }

  willUpdate() {
    const identity = this.asset
      ? JSON.stringify([this.asset.id, this.capability, "primary"])
      : null;
    if (this._bindingIdentity !== null && identity !== this._bindingIdentity) {
      this._editing = false;
      this._selectedEntityId = null;
      this._search = "";
      this._error = null;
      this._confirmDisconnect = false;
      this._saving = false;
      this._committedDisconnectId = null;
      this._operation += 1;
    }
    this._bindingIdentity = identity;
  }

  _currentEntityId() {
    return this.status?.entity_id ?? this.status?.binding?.entity_id ?? null;
  }

  _currentCandidate() {
    const entityId = this._currentEntityId();
    return this._candidates().find((candidate) => candidate.entityId === entityId) ?? null;
  }

  _runtimeLabel(candidate) {
    if (!candidate) return this.t("connection.stale");
    if (candidate.state === "unavailable") return this.t("connection.unavailable");
    if (candidate.state === "unknown") return this.t("connection.unknown");
    if (candidate.state === null) return this.t("connection.no_runtime");
    return this.t("connection.available");
  }

  _configurationLabel() {
    if (this.status?.status === "entity_not_found" || this.status?.config_valid !== false) {
      return this.t("connection.configured");
    }
    return this.t("connection.invalid_configuration");
  }

  _candidateStateLabel(candidate) {
    if (!candidate || candidate.state === null) return this.t("connection.no_runtime");
    if (candidate.state === "unavailable") return this.t("connection.unavailable");
    if (candidate.state === "unknown") return this.t("connection.unknown");
    return candidate.state;
  }

  _beginEdit() {
    if (this._saving) return;
    this._editing = true;
    this._selectedEntityId = this._currentEntityId();
    this._search = "";
    this._error = null;
    this._confirmDisconnect = false;
  }

  _cancelEdit() {
    if (this._saving) return;
    this._editing = false;
    this._selectedEntityId = null;
    this._search = "";
    this._error = null;
    this._confirmDisconnect = false;
  }

  _select(entityId) {
    if (this._saving) return;
    this._selectedEntityId = entityId;
    this._error = null;
  }

  async _save() {
    if (this._saving || !this._selectedEntityId || !this.asset) return;
    this._saving = true;
    this._error = null;
    const operation = ++this._operation;
    try {
      await createBindHomeApi(this.hass).setBinding({
        assetId: this.asset.id,
        capability: this.capability,
        entityId: this._selectedEntityId,
        role: "primary",
      });
      if (operation !== this._operation) return;
      this._editing = false;
      this._selectedEntityId = null;
      this._search = "";
      try {
        if (this.refreshBindingData) await this.refreshBindingData();
      } catch {
        this._error = this.t("connection.sync_warning");
      }
    } catch (error) {
      if (operation !== this._operation) return;
      const normalized = normalizeWsError(error, this.t("connection.save_error"));
      this._error = normalized.code === "binding_cycle"
        ? this.t("connection.cycle_error")
        : normalized.message;
    } finally {
      this._saving = false;
    }
  }

  async _disconnect() {
    const binding = this.status?.binding;
    if (this._saving || !binding || this._committedDisconnectId === binding.id) return;
    this._saving = true;
    this._error = null;
    this._editing = false;
    const operation = ++this._operation;
    try {
      await createBindHomeApi(this.hass).deleteBinding(binding.id);
      if (operation !== this._operation) return;
      this._committedDisconnectId = binding.id;
      this._confirmDisconnect = false;
      try {
        if (this.refreshBindingData) await this.refreshBindingData();
      } catch {
        this._error = this.t("connection.sync_warning");
      }
    } catch (error) {
      if (operation !== this._operation) return;
      this._error = normalizeWsError(error, this.t("connection.disconnect_error")).message;
      this._confirmDisconnect = true;
    } finally {
      this._saving = false;
    }
  }

  _renderSummary() {
    const binding = this.status?.binding;
    const entityId = this._currentEntityId();
    const candidate = this._currentCandidate();
    if (!binding || this.status?.status === "binding_not_found") {
      return html`<div class="summary">${this.t("connection.not_connected")}</div><div class="actions"><button class="primary" @click=${this._beginEdit}>${this.t("connection.connect")}</button></div>`;
    }
    return html`
      <div class="entity">${candidate?.name ?? entityId}</div>
      ${entityId ? html`<div class="technical">${entityId}</div>` : nothing}
      ${candidate?.areaName || candidate?.deviceName ? html`<div class="summary">${[candidate.areaName, candidate.deviceName].filter(Boolean).join(" · ")}</div>` : nothing}
      <div class="summary">${this._configurationLabel()} · ${this.status?.status === "entity_not_found" ? this.t("connection.stale") : this._runtimeLabel(candidate)}</div>
      <div class="actions">
        <button class="primary" @click=${this._beginEdit}>${this.t("connection.change")}</button>
        <button class="danger" @click=${() => (this._confirmDisconnect = true)} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button>
      </div>
      ${this._confirmDisconnect ? html`<div class="confirm" role="alertdialog" aria-label=${this.t("connection.confirm_disconnect")}><span>${this.t("connection.confirm_disconnect")}</span><button @click=${() => (this._confirmDisconnect = false)} ?disabled=${this._saving}>${this.t("common.cancel")}</button><button class="danger" @click=${this._disconnect} ?disabled=${this._saving}>${this.t("connection.disconnect")}</button></div>` : nothing}
    `;
  }

  _renderEditor() {
    const candidates = searchEntityCandidates(this._candidates(), this._search, this.asset?.area_id);
    return html`
      <div class="picker">
        <label>${this.t("connection.search_label")}<input aria-label=${this.t("connection.search_label")} .value=${this._search} @input=${(event) => (this._search = event.target.value)} /></label>
        ${candidates.length ? candidates.map((candidate) => html`<button class="candidate ${candidate.entityId === this._selectedEntityId ? "selected" : ""}" aria-pressed=${candidate.entityId === this._selectedEntityId} @click=${() => this._select(candidate.entityId)}><span class="entity">${candidate.name}</span><span class="candidate-meta">${candidate.entityId}${candidate.areaName ? ` · ${candidate.areaName}` : ""}${candidate.deviceName ? ` · ${candidate.deviceName}` : ""} · ${this._candidateStateLabel(candidate)}${candidate.disabled ? ` · ${this.t("connection.disabled")}` : ""}${candidate.hidden ? ` · ${this.t("connection.hidden")}` : ""}</span></button>`) : html`<div class="muted">${this.t("connection.no_matches")}</div>`}
        <div class="actions"><button @click=${this._cancelEdit} ?disabled=${this._saving}>${this.t("common.cancel")}</button><button class="primary" @click=${this._save} ?disabled=${this._saving || !this._selectedEntityId}>${this._saving ? this.t("connection.saving") : this.t("common.save")}</button></div>
      </div>
    `;
  }

  render() {
    if (!this.asset) return nothing;
    return html`<article class="row"><strong>${capabilityLabel(this.t, this.capability)}</strong>${this._editing ? this._renderEditor() : this._renderSummary()}${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}</article>`;
  }
}

customElements.define("bindhome-primary-connection-editor", BindHomePrimaryConnectionEditor);
