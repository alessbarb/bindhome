// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { defineBindHomeElement } from "../custom-elements.js";

export class BindHomeHardwareAdoptionControl extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    bindingStatuses: { attribute: false },
    refreshBindingData: { attribute: false },
    _status: { state: true },
    _loading: { state: true },
    _mutating: { state: true },
    _error: { state: true },
    _confirmingBindingId: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this.t = (key) => key;
    this.asset = null;
    this.bindingStatuses = { records: [], summary: {} };
    this.refreshBindingData = null;
    this._status = null;
    this._loading = false;
    this._mutating = false;
    this._error = null;
    this._confirmingBindingId = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hass && this.asset) void this._refresh();
  }

  updated(changed) {
    if (
      (changed.has("hass") || changed.has("asset") || changed.has("bindingStatuses"))
      && this.hass
      && this.asset
    ) {
      void this._refresh();
    }
  }

  static styles = css`
    :host { display: block; }
    .intro, .muted { color: var(--secondary-text-color); }
    .intro { margin: 0 0 12px; }
    .record {
      border-top: 1px solid var(--divider-color);
      padding: 12px 0;
    }
    .record:first-of-type { border-top: 0; padding-top: 0; }
    .record-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .copy { min-width: 0; }
    .copy strong, .copy span { display: block; }
    .copy span { margin-top: 3px; overflow-wrap: anywhere; }
    .action {
      flex: none;
      border: 0;
      border-radius: 8px;
      padding: 8px 11px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
    }
    .secondary {
      background: transparent;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
    }
    button:disabled { opacity: .55; }
    .consent {
      margin-top: 10px;
      padding: 12px;
      border-radius: 8px;
      background: var(--secondary-background-color);
    }
    .consent strong { display: block; }
    .consent ul { margin: 8px 0 12px; padding-left: 20px; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin: 0 0 12px;
    }
    .pill {
      border-radius: 999px;
      background: var(--secondary-background-color);
      padding: 5px 8px;
      font-size: 12px;
    }
    .error { color: var(--error-color); margin: 10px 0 0; }
    .warning { color: var(--warning-color); }
    .ok { color: var(--success-color, var(--primary-color)); }
    @media (max-width: 600px) {
      .record-head { flex-direction: column; }
      .action { width: 100%; }
      .actions { width: 100%; }
    }
  `;

  _canMutate() {
    return Boolean(this.hass?.user?.is_admin);
  }

  async _refresh() {
    if (!this.hass || !this.asset || this._loading || this._mutating) return;
    this._loading = true;
    this._error = null;
    try {
      this._status = await createBindHomeApi(this.hass).getAdoptionStatus(this.asset.id);
      const ids = new Set((this._status?.records ?? []).map((item) => item.binding?.id));
      if (this._confirmingBindingId && !ids.has(this._confirmingBindingId)) {
        this._confirmingBindingId = null;
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
    }
  }

  _beginAdopt(bindingId) {
    this._error = null;
    this._confirmingBindingId = bindingId;
  }

  _cancelAdopt() {
    this._confirmingBindingId = null;
  }

  async _adopt(bindingId) {
    if (!this._status || this._mutating) return;
    this._mutating = true;
    this._error = null;
    try {
      await createBindHomeApi(this.hass).adoptBinding({
        bindingId,
        revision: this._status.revision,
      });
      this._confirmingBindingId = null;
      await this.refreshBindingData?.();
      await this._refreshAfterMutation();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._mutating = false;
    }
  }

  async _revert(bindingId) {
    if (!this._status || this._mutating) return;
    this._mutating = true;
    this._error = null;
    try {
      await createBindHomeApi(this.hass).revertBindingAdoption({
        bindingId,
        revision: this._status.revision,
      });
      await this.refreshBindingData?.();
      await this._refreshAfterMutation();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._mutating = false;
    }
  }

  async _refreshAfterMutation() {
    const wasMutating = this._mutating;
    this._mutating = false;
    try {
      await this._refresh();
    } finally {
      this._mutating = wasMutating;
    }
  }

  _stateKey(record) {
    if (!record.eligible) return "adoption.state_ineligible";
    if (record.adopted && record.visibility_owned) return "adoption.state_adopted";
    if (record.adopted) return "adoption.state_tracked";
    if (record.hidden_by) return "adoption.state_already_hidden";
    return "adoption.state_visible";
  }

  _renderConsent(record) {
    if (this._confirmingBindingId !== record.binding?.id) return nothing;
    return html`<div class="consent" role="group" aria-label=${this.t("adoption.consent_title")}>
      <strong>${this.t("adoption.consent_title")}</strong>
      <p>${this.t("adoption.consent_intro", { entity: record.entity_id })}</p>
      <ul>
        <li>${this.t("adoption.consent_operational")}</li>
        <li>${this.t("adoption.consent_visibility_only")}</li>
        <li>${this.t("adoption.consent_no_rewrite")}</li>
        <li>${this.t("adoption.consent_reversible")}</li>
      </ul>
      <div class="actions">
        <button class="action" ?disabled=${this._mutating} @click=${() => this._adopt(record.binding.id)}>
          ${this.t(this._mutating ? "adoption.adopting" : "adoption.confirm")}
        </button>
        <button class="action secondary" ?disabled=${this._mutating} @click=${() => this._cancelAdopt()}>
          ${this.t("common.cancel")}
        </button>
      </div>
    </div>`;
  }

  _renderRecord(record) {
    const canMutate = this._canMutate();
    return html`<div class="record">
      <div class="record-head">
        <div class="copy">
          <strong>${record.binding?.capability ?? this.t("fields.capability")}</strong>
          <span>${record.entity_id ?? "—"}</span>
          <span class=${record.adopted ? "ok" : record.eligible ? "warning" : "muted"}>
            ${this.t(this._stateKey(record))}
          </span>
        </div>
        ${canMutate
          ? record.adopted
            ? html`<button class="action secondary" ?disabled=${this._mutating} @click=${() => this._revert(record.binding.id)}>
                ${this.t(this._mutating ? "adoption.restoring" : "adoption.restore")}
              </button>`
            : html`<button class="action" ?disabled=${!record.eligible || this._mutating} @click=${() => this._beginAdopt(record.binding.id)}>
                ${this.t("adoption.adopt")}
              </button>`
          : nothing}
      </div>
      ${!record.eligible
        ? html`<p class="muted">${this.t("adoption.ineligible_help")}</p>`
        : record.adopted && !record.visibility_owned
          ? html`<p class="muted">${this.t("adoption.tracked_help")}</p>`
          : nothing}
      ${this._renderConsent(record)}
    </div>`;
  }

  render() {
    const records = this._status?.records ?? [];
    const summary = this._status?.summary ?? {};
    const references = this._status?.reference_audit?.summary?.references ?? 0;

    return html`
      <p class="intro">${this.t("adoption.intro")}</p>
      ${this._status
        ? html`<div class="summary">
            <span class="pill">${this.t("adoption.summary_adopted", { count: summary.adopted_hardware ?? 0 })}</span>
            <span class="pill">${this.t("adoption.summary_visible", { count: summary.bound_hardware_visible ?? 0 })}</span>
            <span class="pill">${this.t("adoption.summary_references", { count: references })}</span>
          </div>`
        : nothing}
      ${this._loading && !this._status
        ? html`<p class="muted">${this.t("adoption.loading")}</p>`
        : records.length
          ? records.map((record) => this._renderRecord(record))
          : html`<p class="muted">${this.t("adoption.no_bindings")}</p>`}
      ${!this._canMutate() && records.length
        ? html`<p class="muted">${this.t("adoption.read_only")}</p>`
        : nothing}
      ${this._error ? html`<p class="error" role="alert">${this.t("adoption.error", { error: this._error })}</p>` : nothing}
    `;
  }
}

defineBindHomeElement("bindhome-hardware-adoption-control", BindHomeHardwareAdoptionControl);
