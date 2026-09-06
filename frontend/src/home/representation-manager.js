// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { createHomeAssistantApi } from "../api/home-assistant-api.js";
import { defineBindHomeElement } from "../custom-elements.js";

const PLATFORM = "light";
const REQUIRED_CAPABILITY = "on_off";
const REQUIRED_ROLE = "primary";

export class BindHomeRepresentationManager extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    registry: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    readOnly: { type: Boolean, attribute: false },
    refreshBindingData: { attribute: false },
    _entityRegistrySnapshot: { state: true },
    _committedRepresentation: { state: true },
    _removed: { state: true },
    _busy: { state: true },
    _confirmRemove: { state: true },
    _error: { state: true },
    _syncWarning: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    /** @type {import('../types.js').Asset | null} */
    this.asset = null;
    /** @type {Partial<import('../types.js').Registry>} */
    this.registry = {};
    this.bindingStatuses = { records: [], summary: {} };
    /** @type {import('../types.js').HaEntityRegistryEntry[]} */
    this.entityRegistry = [];
    this.readOnly = false;
    this.refreshBindingData = null;
    this._entityRegistrySnapshot = [];
    this._committedRepresentation = null;
    this._removed = false;
    this._busy = false;
    this._confirmRemove = false;
    this._error = null;
    this._syncWarning = null;
    this._identity = null;
  }

  willUpdate(changed) {
    if (changed.has("entityRegistry")) this._entityRegistrySnapshot = this.entityRegistry ?? [];
    if (this.asset?.id !== this._identity) {
      this._identity = this.asset?.id ?? null;
      this._committedRepresentation = null;
      this._removed = false;
      this._busy = false;
      this._confirmRemove = false;
      this._error = null;
      this._syncWarning = null;
    }
  }

  static styles = css`
    :host { display: block; }
    .box { padding: 14px; border-radius: 8px; background: var(--secondary-background-color); }
    h4 { margin: 0 0 7px; font-size: 15px; font-weight: 500; }
    p { margin: 6px 0 0; line-height: 1.45; }
    .muted { color: var(--secondary-text-color); }
    .logical { overflow-wrap: anywhere; font-family: var(--code-font-family, monospace); }
    .contract { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
    .warning { color: var(--warning-color); }
    .error { color: var(--error-color); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button { min-height: 40px; }
    @media (max-width: 600px) { .actions button { flex: 1 1 100%; } }
  `;

  _persistedRepresentation() {
    if (!this.asset) return null;
    return (this.registry?.representations ?? []).find((item) => item.asset_id === this.asset.id) ?? null;
  }

  _representation() {
    if (this._removed) return null;
    return this._committedRepresentation ?? this._persistedRepresentation();
  }

  _requiredStatus() {
    if (!this.asset) return null;
    return (this.bindingStatuses?.records ?? []).find(
      (status) => status.asset_id === this.asset.id && status.capability === REQUIRED_CAPABILITY && status.role === REQUIRED_ROLE,
    ) ?? null;
  }

  _hasRequiredBinding() {
    const status = this._requiredStatus();
    return Boolean(status && status.status !== "binding_not_found" && (status.binding || status.entity_id));
  }

  _logicalEntityId() {
    if (!this.asset || !this._representation()) return null;
    const uniqueId = `bindhome_${this.asset.id}`;
    return this._entityRegistrySnapshot.find(
      (entry) => entry.platform === "bindhome" && entry.unique_id === uniqueId && entry.entity_id?.startsWith("light."),
    )?.entity_id ?? null;
  }

  _backingEntityId() {
    const status = this._requiredStatus();
    return status?.binding?.entity_id ?? status?.entity_id ?? null;
  }

  _isBackingLight() {
    return this._backingEntityId()?.startsWith("light.") ?? false;
  }

  async _refreshEntityRegistry() {
    if (!this.hass) return;
    this._entityRegistrySnapshot = await createHomeAssistantApi(this.hass).listEntityRegistry();
  }

  async _refreshAfterMutation() {
    const tasks = [this._refreshEntityRegistry()];
    if (this.refreshBindingData) tasks.push(Promise.resolve(this.refreshBindingData()));
    const results = await Promise.allSettled(tasks);
    if (results.some((result) => result.status === "rejected")) {
      this._syncWarning = this.t("representation.sync_warning");
    } else {
      this._syncWarning = null;
    }
  }

  async _createRepresentation() {
    if (!this.hass || !this.asset || !this._hasRequiredBinding() || this._busy) return;
    const identity = this.asset.id;
    this._busy = true;
    this._error = null;
    this._syncWarning = null;
    try {
      const response = await createBindHomeApi(this.hass).setRepresentation({ assetId: identity, platform: PLATFORM });
      if (this.asset?.id !== identity) return;
      this._committedRepresentation = response?.representation ?? { asset_id: identity, platform: PLATFORM };
      this._removed = false;
      await this._refreshAfterMutation();
    } catch (error) {
      if (this.asset?.id === identity) this._error = error instanceof Error ? error.message : String(error);
    } finally {
      if (this.asset?.id === identity) this._busy = false;
    }
  }

  async _removeRepresentation() {
    if (!this.hass || !this.asset || !this._representation() || this._busy || !this._confirmRemove) return;
    const identity = this.asset.id;
    this._busy = true;
    this._error = null;
    this._syncWarning = null;
    try {
      await createBindHomeApi(this.hass).deleteRepresentation(identity);
      if (this.asset?.id !== identity) return;
      this._removed = true;
      this._committedRepresentation = null;
      this._confirmRemove = false;
      await this._refreshAfterMutation();
    } catch (error) {
      if (this.asset?.id === identity) this._error = error instanceof Error ? error.message : String(error);
    } finally {
      if (this.asset?.id === identity) this._busy = false;
    }
  }

  render() {
    if (!this.asset) return nothing;
    const representation = this._representation();
    const status = this._requiredStatus();
    const hasBinding = this._hasRequiredBinding();
    const entityId = this._logicalEntityId();

    return html`<div class="box">
      <h4>${this.t("representation.title")}</h4>
      ${representation
        ? html`
            <p>${this.t("representation.exposed_as", { platform: representation.platform })}</p>
            <p class=${entityId ? "logical" : "muted"}>${entityId ?? this.t("representation.entity_pending", { name: this.asset.name })}</p>
          `
        : html`<p class="muted">${this.t("representation.not_exposed")}</p>`}

      <div class="contract">
        <strong>${this.t("representation.contract_title")}</strong>
        <p>${this.t("representation.contract_light")}</p>
        ${status?.status === "entity_not_found"
          ? html`<p class="warning">${this.t("representation.stale_binding_warning")}</p>`
          : hasBinding && !this._isBackingLight()
            ? html`<p class="warning">${this.t("representation.onoff_only_warning")}</p>`
            : hasBinding
              ? html`<p class="muted">${this.t("representation.light_fidelity")}</p>`
              : html`<p class="warning">${this.t("representation.binding_required")}</p>`}
      </div>

      ${this.readOnly
        ? nothing
        : representation
          ? html`<div class="actions">
              ${this._confirmRemove
                ? html`
                    <button class="danger" ?disabled=${this._busy} @click=${this._removeRepresentation}>${this.t("representation.confirm_remove")}</button>
                    <button class="secondary" ?disabled=${this._busy} @click=${() => (this._confirmRemove = false)}>${this.t("common.cancel")}</button>
                  `
                : html`<button class="secondary" ?disabled=${this._busy} @click=${() => (this._confirmRemove = true)}>${this.t("representation.remove")}</button>`}
            </div>`
          : html`<div class="actions">
              <button class="primary" ?disabled=${this._busy || !hasBinding} @click=${this._createRepresentation}>${this.t("representation.create")}</button>
            </div>`}

      ${this._syncWarning ? html`<p class="warning" role="status">${this._syncWarning}</p>` : nothing}
      ${this._error ? html`<p class="error" role="alert">${this.t("representation.write_error", { error: this._error })}</p>` : nothing}
    </div>`;
  }
}

defineBindHomeElement("bindhome-representation-manager", BindHomeRepresentationManager);
