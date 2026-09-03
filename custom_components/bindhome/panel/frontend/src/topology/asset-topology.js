import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import { relationPartitions } from "./relation-state.js";
import "./relation-editor.js";

export class BindHomeAssetTopology extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    registry: { attribute: false },
    onRefresh: { attribute: false },
    onNavigate: { attribute: false },
    _editing: { state: true },
    _deleting: { state: true },
    _error: { state: true },
    _sync: { state: true },
    _confirm: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this.t = (key) => key;
    this.asset = null;
    this.assets = [];
    this.areas = [];
    this.registry = {};
    this.onRefresh = null;
    this.onNavigate = null;
    this._editing = false;
    this._deleting = null;
    this._error = null;
    this._sync = null;
    this._confirm = null;
    this._identity = "";
    this._token = 0;
  }

  willUpdate(changed) {
    if (
      changed.has("asset") &&
      this.asset &&
      this._identity &&
      this.asset.id !== this._identity
    ) {
      this._token += 1;
      this._deleting = null;
      this._confirm = null;
      this._error = null;
      this._sync = null;
    }

    if (this.asset) {
      this._identity = this.asset.id;
    }
  }

  _asset(assetId) {
    return this.assets.find((item) => item.id === assetId) ?? null;
  }

  _area(asset) {
    if (!asset?.area_id) return null;

    return (
      this.areas.find((area) => area.area_id === asset.area_id)?.name ??
      null
    );
  }

  async _delete(relation) {
    if (this._deleting) return;

    const token = ++this._token;
    const identity = this.asset?.id;

    this._deleting = relation.id;
    this._error = null;

    try {
      await createBindHomeApi(this.hass).deleteRelation(relation.id);

      if (
        token !== this._token ||
        this.asset?.id !== identity
      ) {
        return;
      }

      this._deleting = null;
      this._confirm = null;

      try {
        await this.onRefresh?.();
      } catch {
        if (
          token !== this._token ||
          this.asset?.id !== identity
        ) {
          return;
        }

        this._sync = this.t("topology.sync_warning");
      }
    } catch (error) {
      if (
        token !== this._token ||
        this.asset?.id !== identity
      ) {
        return;
      }

      this._deleting = null;
      this._error = normalizeWsError(
        error,
        this.t("topology.delete_error"),
      ).message;
    }
  }

  _navigate(assetId) {
    if (!this._asset(assetId)) return;

    this.onNavigate?.(assetId);

    this.dispatchEvent(
      new CustomEvent("navigate-asset", {
        detail: assetId,
        bubbles: true,
        composed: true,
      }),
    );
  }

  _renderNeighbor(relation, outgoing) {
    const otherId = outgoing
      ? relation.target_asset_id
      : relation.source_asset_id;

    const other = this._asset(otherId);

    if (!other) {
      return html`
        <div class="neighbor missing">
          <strong>${this.t("topology.missing_asset")}</strong>
          <span>${relation.relation_type}</span>
        </div>
      `;
    }

    const area = this._area(other);

    return html`
      <button
        class="neighbor"
        type="button"
        @click=${() => this._navigate(other.id)}
      >
        <strong>${other.name}</strong>
        <span>
          ${relation.relation_type}${area ? ` · ${area}` : ""}
        </span>
      </button>
    `;
  }

  _renderRelation(relation, outgoing) {
    return html`
      <li>
        ${this._renderNeighbor(relation, outgoing)}

        ${this._confirm === relation.id
          ? html`
              <span
                class="confirm"
                role="alertdialog"
                aria-label=${this.t("topology.confirm_delete")}
              >
                <span>${this.t("topology.confirm_delete")}</span>

                <button
                  type="button"
                  @click=${() => {
                    this._confirm = null;
                  }}
                >
                  ${this.t("editor.cancel")}
                </button>

                <button
                  type="button"
                  @click=${() => this._delete(relation)}
                  ?disabled=${Boolean(this._deleting)}
                >
                  ${this.t("topology.delete")}
                </button>
              </span>
            `
          : html`
              <button
                class="delete"
                type="button"
                @click=${() => {
                  this._confirm = relation.id;
                }}
                ?disabled=${Boolean(this._deleting)}
              >
                ${this.t("topology.delete")}
              </button>
            `}
      </li>
    `;
  }

  render() {
    const { outgoing, incoming } = relationPartitions(
      this.registry?.relations ?? [],
      this.asset?.id,
    );

    return html`
      <section class="topology">
        <header>
          <div>
            <h3>${this.t("topology.title")}</h3>
            <p>${this.t("topology.helper")}</p>
          </div>

          <button
            type="button"
            @click=${() => {
              this._editing = true;
            }}
            ?disabled=${this._editing}
          >
            ${this.t("topology.add_relation")}
          </button>
        </header>

        ${this._editing
          ? html`
              <bindhome-relation-editor
                .hass=${this.hass}
                .t=${this.t}
                .asset=${this.asset}
                .assets=${this.assets}
                .areas=${this.areas}
                .registry=${this.registry}
                .onRefresh=${this.onRefresh}
                .onDone=${() => {
                  this._editing = false;
                }}
                .onSyncWarning=${(message) => {
                  this._sync = message;
                }}
              ></bindhome-relation-editor>
            `
          : nothing}

        ${this._sync
          ? html`
              <p class="warning" role="alert">
                ${this._sync}
              </p>
            `
          : nothing}

        ${this._error
          ? html`
              <p class="error" role="alert">
                ${this._error}
              </p>
            `
          : nothing}

        <div class="columns">
          <div>
            <h4>${this.t("topology.outgoing")}</h4>

            ${outgoing.length
              ? html`
                  <ul>
                    ${outgoing.map((relation) =>
                      this._renderRelation(relation, true),
                    )}
                  </ul>
                `
              : html`
                  <p class="muted">
                    ${this.t("topology.no_relations")}
                  </p>
                `}
          </div>

          <div>
            <h4>${this.t("topology.incoming")}</h4>

            ${incoming.length
              ? html`
                  <ul>
                    ${incoming.map((relation) =>
                      this._renderRelation(relation, false),
                    )}
                  </ul>
                `
              : html`
                  <p class="muted">
                    ${this.t("topology.no_relations")}
                  </p>
                `}
          </div>
        </div>
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .topology {
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: var(--card-background-color);
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
    }

    h3,
    h4,
    p {
      margin: 0;
    }

    header p {
      color: var(--secondary-text-color);
      font-size: 13px;
      margin-top: 4px;
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
      margin-top: 16px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 8px 0;
      display: grid;
      gap: 8px;
    }

    li {
      display: flex;
      gap: 8px;
      align-items: stretch;
    }

    .neighbor {
      flex: 1;
      text-align: left;
      padding: 9px;
      border: 1px solid var(--divider-color);
      background: transparent;
      border-radius: 6px;
    }

    button.neighbor {
      cursor: pointer;
    }

    .neighbor span {
      display: block;
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .neighbor.missing {
      cursor: default;
    }

    .delete {
      border: 0;
      background: transparent;
      color: var(--error-color);
      cursor: pointer;
    }

    .topology button {
      font: inherit;
    }

    .error {
      color: var(--error-color);
    }

    .warning {
      color: var(--warning-color);
    }

    .muted {
      color: var(--secondary-text-color);
    }

    @media (max-width: 600px) {
      .columns {
        grid-template-columns: 1fr;
      }

      header {
        flex-direction: column;
      }

      .delete {
        padding-inline: 4px;
      }
    }
  `;
}

customElements.define(
  "bindhome-asset-topology",
  BindHomeAssetTopology,
);
