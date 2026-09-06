import { defineBindHomeElement } from "../custom-elements.js";
// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { tokens } from "../styles/shared-styles.js";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";

export class BindHomeRepresentationControl extends LitElement {
  static properties = {
    hass: { attribute: false }, t: { attribute: false }, asset: { attribute: false },
    registry: { attribute: false }, bindingStatuses: { attribute: false },
    readOnly: { type: Boolean, attribute: false }, onRefresh: { attribute: false },
    _confirmation: { state: true }, _busy: { state: true }, _error: { state: true },
    _notice: { state: true }, _needsRefresh: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.asset = null;
    /** @type {Partial<import('../types.js').Registry>} */
    this.registry = {};
    this.bindingStatuses = { records: [] };
    this.readOnly = false;
    this.onRefresh = null;
    this._confirmation = null;
    this._busy = false;
    this._error = null;
    this._notice = null;
    this._needsRefresh = false;
    this._identity = null;
    this._generation = 0;
  }
  static styles = [tokens, css`
    :host { display:block; }
    h3 { margin:0 0 12px; font-size:17px; font-weight:500; }
    p { margin:8px 0; line-height:1.45; overflow-wrap:anywhere; }
    .muted { color:var(--secondary-text-color); }
    .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
    .confirmation { padding:14px; margin-top:12px; border:1px solid var(--divider-color); border-radius:8px; }
    .warning { border-left:3px solid var(--warning-color, #f9a825); padding-left:12px; }
  `];
  willUpdate() {
    if (this.asset?.id !== this._identity) {
      this._identity = this.asset?.id;
      this._generation++;
      this._confirmation = null;
      this._busy = false;
      this._error = null;
      this._notice = null;
      this._needsRefresh = false;
    }
    if (this.readOnly || this.hass?.user?.is_admin === false) this._confirmation = null;
  }
  _representation() {
    return this.registry.representations?.find((r) => r.asset_id === this.asset?.id);
  }
  _binding() {
    return this.bindingStatuses.records.find((s) => s.asset_id === this.asset?.id && s.capability === "on_off" && s.role === "primary");
  }
  _reason() {
    if (this._needsRefresh || !Number.isInteger(this.registry.revision)) return "representation.refresh_required";
    if (!this.asset?.capabilities?.includes("on_off")) return "representation.missing_capability";
    const binding = this._binding();
    if (!binding?.config_valid) return "representation.missing_binding";
    return null;
  }
  _canWrite() {
    return !this.readOnly && this.hass && this.hass.user?.is_admin !== false;
  }
  _prepare() {
    if (!this._canWrite() || this._busy || this._needsRefresh || !Number.isInteger(this.registry.revision)) return;
    const remove = Boolean(this._representation());
    if (!remove && this._reason()) return;
    this._error = null;
    this._notice = null;
    this._confirmation = { assetId: this.asset.id, revision: this.registry.revision, remove };
  }
  async _commit() {
    const confirmation = this._confirmation;
    if (!this._canWrite() || this._busy || !confirmation || confirmation.assetId !== this.asset?.id) return;
    this._busy = true;
    this._error = null;
    const generation = this._generation;
    try {
      const api = createBindHomeApi(this.hass);
      const args = { assetId: confirmation.assetId, revision: confirmation.revision };
      if (confirmation.remove) await api.deleteRepresentation(args);
      else await api.setRepresentation(args);
      if (generation !== this._generation) return;
      this._confirmation = null;
      this._needsRefresh = true;
      this._notice = this.t(confirmation.remove ? "representation.removed" : "representation.created");
      try {
        if (!this.onRefresh) throw new Error("Refresh unavailable");
        await this.onRefresh();
        if (generation === this._generation) this._needsRefresh = false;
      } catch {
        if (generation === this._generation) this._error = this.t("representation.saved_refresh_failed");
      }
    } catch (error) {
      if (generation !== this._generation) return;
      this._confirmation = null;
      const normalized = normalizeWsError(error, this.t("representation.error"));
      this._error = normalized.code === "conflict" ? this.t("representation.conflict") : normalized.message;
      this._needsRefresh = true;
    } finally {
      if (generation === this._generation) this._busy = false;
    }
  }
  async _refresh() {
    if (this._busy || !this.onRefresh) return;
    const generation = this._generation;
    this._busy = true;
    this._confirmation = null;
    try {
      await this.onRefresh();
      if (generation === this._generation) {
        this._needsRefresh = false;
        this._error = null;
      }
    } catch (error) {
      if (generation === this._generation) this._error = normalizeWsError(error, this.t("representation.error")).message;
    } finally {
      if (generation === this._generation) this._busy = false;
    }
  }
  render() {
    if (!this.asset) return nothing;
    const representation = this._representation();
    const binding = this._binding();
    const entityId = this.registry.representation_entities?.[this.asset.id];
    const state = entityId ? this.hass?.states?.[entityId] : null;
    const active = state && !["unavailable", "unknown"].includes(state.state);
    const reason = this._reason();
    const status = representation
      ? active ? "active" : "unavailable"
      : reason ? "not_ready" : "ready";
    const limited = Boolean(binding?.entity_id && !binding.entity_id.startsWith("light."));
    return html`<h3>${this.t("representation.title")}</h3>
      <p>${this.t("representation.intro")}</p>
      <p class="muted">${this.t("representation.dependency")}</p>
      <p><strong>${this.t(`representation.${status}`)}</strong></p>
      ${representation && entityId ? html`<p class="entity">${entityId}</p>` : nothing}
      ${representation && !entityId ? html`<p class="muted">${this.t("representation.pending_entity")}</p>` : nothing}
      <p class=${limited ? "warning" : "muted"}>${this.t(limited ? "representation.limited" : "representation.mirrored")}</p>
      ${reason ? html`<p class="warning">${this.t(reason)}</p>` : nothing}
      ${!representation && binding?.config_valid && !binding.runtime_available ? html`<p class="warning">${this.t("representation.backing_unavailable")}</p>` : nothing}
      <div class="actions">
        ${this._canWrite() ? html`<button class="secondary manage" ?disabled=${this._busy || Boolean(this._confirmation) || this._needsRefresh || !Number.isInteger(this.registry.revision) || (!representation && Boolean(reason))} @click=${this._prepare}>${this.t(representation ? "representation.remove" : "representation.create")}</button>` : nothing}
        ${this.onRefresh ? html`<button class="text-button refresh" ?disabled=${this._busy} @click=${this._refresh}>${this.t("representation.refresh")}</button>` : nothing}
      </div>
      ${this._canWrite() && this._confirmation ? html`<div class="confirmation" role="group" aria-label=${this.t("representation.confirm_title")}>
        <p>${this.t(this._confirmation.remove ? "representation.confirm_remove" : "representation.confirm_create")}</p>
        <div class="actions"><button class="secondary" ?disabled=${this._busy} @click=${() => (this._confirmation = null)}>${this.t("common.cancel")}</button>
        <button class="primary confirm" ?disabled=${this._busy} @click=${this._commit}>${this.t("representation.confirm")}</button></div>
      </div>` : nothing}
      ${this._notice ? html`<p role="status">${this._notice}</p>` : nothing}
      ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}`;
  }
}
defineBindHomeElement("bindhome-representation-control", BindHomeRepresentationControl);
