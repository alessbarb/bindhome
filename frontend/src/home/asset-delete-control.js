// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";

export class BindHomeAssetDeleteControl extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    refreshBindingData: { attribute: false },
    refreshTopologyData: { attribute: false },
    refreshAssets: { attribute: false },
    _impact: { state: true },
    _loading: { state: true },
    _deleting: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.asset = null;
    this.refreshBindingData = null;
    this.refreshTopologyData = null;
    this.refreshAssets = null;
    this._impact = null;
    this._loading = false;
    this._deleting = false;
    this._error = null;
    this._identity = null;
  }

  static styles = css`
    :host { display:block; }
    .danger { padding:14px; border:1px solid var(--error-color, #db4437); border-radius:10px; }
    .danger h3 { margin:0 0 8px; color:var(--error-color, #db4437); font-size:17px; font-weight:500; }
    .danger p { margin:8px 0 0; line-height:1.45; }
    .muted { color:var(--secondary-text-color); }
    .warning { padding:10px 12px; background:var(--secondary-background-color); border-left:3px solid var(--warning-color, #f9a825); overflow-wrap:anywhere; }
    .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    button { min-height:40px; padding:0 14px; border-radius:8px; font:inherit; font-weight:500; }
    .danger-button { border:1px solid var(--error-color, #db4437); background:var(--error-color, #db4437); color:#fff; }
    .secondary { border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color); }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .error { margin-top:10px; color:var(--error-color, #db4437); }
  `;

  willUpdate() {
    if (this.asset?.id !== this._identity) {
      this._identity = this.asset?.id;
      this._impact = null;
      this._loading = false;
      this._deleting = false;
      this._error = null;
    }
  }

  async _prepare() {
    if (!this.hass || !this.asset || this._loading || this._deleting) return;
    this._loading = true;
    this._error = null;
    try {
      this._impact = await createBindHomeApi(this.hass).getDeleteImpact(this.asset.id);
    } catch (error) {
      this._error = normalizeWsError(error, this.t("delete.error")).message;
    } finally {
      this._loading = false;
    }
  }

  async _delete() {
    if (!this.hass || !this.asset || !this._impact || this._deleting) return;
    this._deleting = true;
    this._error = null;
    try {
      await createBindHomeApi(this.hass).deleteAssetWithDependencies(this.asset.id);
      await Promise.allSettled([
        this.refreshBindingData?.(),
        this.refreshTopologyData?.(),
        this.refreshAssets?.(),
      ]);
      this.dispatchEvent(
        new CustomEvent("asset-deleted", {
          detail: this.asset.id,
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      this._error = normalizeWsError(error, this.t("delete.error")).message;
      this._deleting = false;
    }
  }

  render() {
    if (!this.asset) return nothing;
    const impact = this._impact;
    const relationCount = impact?.relations?.length ?? 0;
    const ownedBindingCount = impact?.owned_bindings?.length ?? 0;
    const dependentBindingCount = impact?.dependent_bindings?.length ?? 0;

    return html`<div class="danger">
      <h3>${this.t("delete.title")}</h3>
      ${!impact
        ? html`<p class="muted">${this.t("delete.prepare_body")}</p>
            <div class="actions">
              <button class="danger-button" ?disabled=${this._loading} @click=${this._prepare}>
                ${this._loading ? this.t("delete.loading") : this.t("delete.prepare")}
              </button>
            </div>`
        : html`<p>${this.t("delete.impact", {
              relations: relationCount,
              bindings: ownedBindingCount,
              dependent: dependentBindingCount,
            })}</p>
            <p class="muted">${this.t("delete.hardware_safe")}</p>
            ${impact.logical_entity_id
              ? html`<p class="warning">${this.t("delete.logical_warning", {
                  entity_id: impact.logical_entity_id,
                })}</p>`
              : nothing}
            <div class="actions">
              <button class="secondary" ?disabled=${this._deleting} @click=${() => (this._impact = null)}>
                ${this.t("common.cancel")}
              </button>
              <button class="danger-button" ?disabled=${this._deleting} @click=${this._delete}>
                ${this._deleting ? this.t("delete.deleting") : this.t("delete.confirm")}
              </button>
            </div>`}
      ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}
    </div>`;
  }
}

customElements.define("bindhome-asset-delete-control", BindHomeAssetDeleteControl);
