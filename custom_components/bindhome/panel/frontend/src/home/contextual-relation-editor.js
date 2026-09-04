// @ts-check
import { LitElement, css, html } from "lit";
import { tokens } from "../styles/shared-styles.js";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
export class BindHomeContextualRelationEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    action: { attribute: false },
    onRefresh: { attribute: false },
    _target: { state: true },
    _query: { state: true },
    _saving: { state: true },
    _error: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    this.t = (k) => k;
    this.asset = null;
    this.assets = [];
    this.areas = [];
    this.action = null;
    this.onRefresh = null;
    this._target = "";
    this._query = "";
    this._saving = false;
    this._error = null;
    this._token = 0;
    this._identity = "";
    this._committed = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this._resetIdentity();
  }
  willUpdate() {
    const identity = this._currentIdentity();
    if (this._identity && identity !== this._identity) this._resetIdentity();
    this._identity = identity;
  }
  _currentIdentity() {
    return `${this.asset?.id ?? ""}:${this.action?.direction ?? ""}:${this.action?.relationType ?? ""}`;
  }
  _resetIdentity() {
    this._token += 1;
    this._target = "";
    this._query = "";
    this._saving = false;
    this._error = null;
    this._committed = false;
    this._identity = this._currentIdentity();
  }
  _isCurrent(token, identity) {
    return token === this._token && identity === this._currentIdentity();
  }
  static styles = [
    tokens,
    css`
      :host {
        display: block;
        margin-top: 12px;
        padding: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
      }
      .search {
        width: 100%;
        min-height: 44px;
        padding: 8px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
      }
      .candidates {
        max-height: 220px;
        overflow: auto;
        margin-top: 8px;
      }
      .candidate {
        display: block;
        width: 100%;
        min-height: 46px;
        padding: 7px 9px;
        border: 0;
        border-bottom: 1px solid var(--divider-color);
        background: transparent;
        text-align: left;
      }
      .candidate.selected {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }
      small {
        display: block;
        color: var(--secondary-text-color);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      }
    `,
  ];
  async _save() {
    if (this._saving || this._committed || !this._target || !this.asset || !this.action) return;
    const token = ++this._token;
    const identity = this._currentIdentity();
    this._saving = true;
    this._error = null;
    const incoming = this.action.direction === "incoming";
    try {
      await createBindHomeApi(this.hass).createRelation({
        sourceAssetId: incoming ? this._target : this.asset.id,
        relationType: this.action.relationType,
        targetAssetId: incoming ? this.asset.id : this._target,
      });
      if (!this._isCurrent(token, identity)) return;
      this._committed = true;
      this._saving = false;
      try {
        await this.onRefresh?.();
      } catch {
        if (!this._isCurrent(token, identity)) return;
        this.dispatchEvent(
          new CustomEvent("sync-warning", {
            detail: this.t("topology.sync_warning"),
            bubbles: true,
            composed: true,
          }),
        );
      }
      if (!this._isCurrent(token, identity)) return;
      this.dispatchEvent(
        new CustomEvent("done", { bubbles: true, composed: true }),
      );
    } catch (error) {
      if (!this._isCurrent(token, identity)) return;
      const normalized = normalizeWsError(error, this.t("topology.create_error"));
      this._error = normalized.code === "conflict"
        ? this.t("topology.duplicate_relation")
        : normalized.message;
    } finally {
      if (this._isCurrent(token, identity) && !this._committed) this._saving = false;
    }
  }
  render() {
    const needle = this._query.toLocaleLowerCase();
    const options = this.assets
      .filter(
        (a) =>
          a.id !== this.asset?.id &&
          (!needle ||
            [a.name, a.code, a.asset_type]
              .filter(Boolean)
              .some((v) => String(v).toLocaleLowerCase().includes(needle))),
      )
      .slice(0, 20);
    return html`<label
        >${this.t("search.label")}<input
          class="search"
          .value=${this._query}
          @input=${(e) => (this._query = e.target.value)}
      /></label>
      <div class="candidates">
        ${options.map(
          (candidate) =>
            html`<button
              class="candidate ${this._target === candidate.id
                ? "selected"
                : ""}"
              aria-pressed=${this._target === candidate.id}
              @click=${() => (this._target = candidate.id)}
            >
              <strong>${candidate.name}</strong
              ><small
                >${this.areas.find((a) => a.area_id === candidate.area_id)
                  ?.name ?? this.t("home.unassigned")}</small
              >
            </button>`,
        )}
      </div>
      ${this._error
        ? html`<div class="error" role="alert">${this._error}</div>`
        : null}
      <div class="actions">
        <button
          class="secondary"
          @click=${() =>
            this.dispatchEvent(
              new CustomEvent("cancel", { bubbles: true, composed: true }),
            )}
        >
          ${this.t("common.cancel")}</button
        ><button
          class="primary"
          ?disabled=${this._saving || this._committed || !this._target}
          @click=${this._save}
        >
          ${this._saving ? this.t("add.saving") : this.t("common.save")}
        </button>
      </div>`;
  }
}
customElements.define(
  "bindhome-contextual-relation-editor",
  BindHomeContextualRelationEditor,
);
