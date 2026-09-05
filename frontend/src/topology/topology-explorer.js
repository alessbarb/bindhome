import { defineBindHomeElement } from "../custom-elements.js";
import { LitElement, css, html, nothing } from "lit";
import {
  RESULT_LIMIT,
  SUGGESTION_LIMIT,
  assetAreaName,
  searchAssetCatalogue,
} from "./asset-catalogue.js";
import { relationPartitions } from "./relation-state.js";

export class BindHomeTopologyExplorer extends LitElement {
  static properties = {
    t: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    registry: { attribute: false },
    focalAssetId: { attribute: false },
    onNavigate: { attribute: false },
    _search: { state: true },
  };

  constructor() {
    super();
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.assets = [];
    this.areas = [];
    this.registry = {};
    this.focalAssetId = null;
    this.onNavigate = null;
    this._search = "";
  }

  _asset(assetId) {
    return this.assets.find((asset) => asset.id === assetId) ?? null;
  }

  _focal() {
    return this._asset(this.focalAssetId) ?? this.assets[0] ?? null;
  }

  _neighbors() {
    const focal = this._focal();
    return focal
      ? relationPartitions(this.registry?.relations ?? [], focal.id)
      : { incoming: [], outgoing: [] };
  }

  _focus(assetId) {
    const asset = this._asset(assetId);
    if (!asset) return;

    this.focalAssetId = asset.id;
    this._search = "";
    this.onNavigate?.(asset.id);
  }

  _renderNeighbor(relation, outgoing) {
    const assetId = outgoing
      ? relation.target_asset_id
      : relation.source_asset_id;

    const asset = this._asset(assetId);

    if (!asset) {
      return html`
        <div class="neighbor missing">
          <strong>${this.t("topology.missing_asset")}</strong>
          <span>${relation.relation_type}</span>
        </div>
      `;
    }

    const areaName = assetAreaName(asset, this.areas);

    return html`
      <button
        class="neighbor"
        type="button"
        @click=${() => this._focus(asset.id)}
      >
        <strong>${asset.name}</strong>
        <span>
          ${relation.relation_type}${areaName ? ` · ${areaName}` : ""}
        </span>
      </button>
    `;
  }

  render() {
    const focal = this._focal();

    const all = searchAssetCatalogue(
      this.assets,
      this._search,
      focal?.area_id,
      this.areas,
    );

    const limit = this._search.trim()
      ? RESULT_LIMIT
      : SUGGESTION_LIMIT;

    const shown = all.slice(0, limit);
    const { incoming, outgoing } = this._neighbors();

    return html`
      <section class="explorer">
        <h1>${this.t("topology.explorer")}</h1>

        <label>
          ${this.t("topology.search_assets")}
          <input
            .value=${this._search}
            @input=${(event) => {
              this._search = event.target.value;
            }}
          />
        </label>

        <div class="picker">
          ${shown.length
            ? shown.map(
                (candidate) => html`
                  <button
                    type="button"
                    aria-pressed=${focal?.id === candidate.id
                      ? "true"
                      : "false"}
                    @click=${() => this._focus(candidate.id)}
                  >
                    <strong>${candidate.name}</strong>
                    ${candidate.areaName
                      ? html`<span>${candidate.areaName}</span>`
                      : nothing}
                  </button>
                `,
              )
            : html`
                <p class="muted">
                  ${this.t("topology.no_matches")}
                </p>
              `}
        </div>

        ${all.length > shown.length
          ? html`
              <p class="count">
                ${this.t("topology.showing_results", {
                  shown: shown.length,
                  total: all.length,
                })}
              </p>
            `
          : nothing}

        ${focal
          ? html`
              <h2>${focal.name}</h2>

              <div class="columns">
                <div>
                  <h3>${this.t("topology.incoming")}</h3>

                  ${incoming.length
                    ? incoming.map((relation) =>
                        this._renderNeighbor(relation, false),
                      )
                    : html`
                        <p class="muted">
                          ${this.t("topology.no_relations")}
                        </p>
                      `}
                </div>

                <div>
                  <h3>${this.t("topology.outgoing")}</h3>

                  ${outgoing.length
                    ? outgoing.map((relation) =>
                        this._renderNeighbor(relation, true),
                      )
                    : html`
                        <p class="muted">
                          ${this.t("topology.no_relations")}
                        </p>
                      `}
                </div>
              </div>
            `
          : html`
              <p class="muted">
                ${this.t("topology.no_assets")}
              </p>
            `}
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .explorer {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 24px;
    }

    .explorer label {
      display: grid;
      gap: 4px;
      margin: 16px 0;
    }

    .explorer input {
      min-height: 40px;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      font: inherit;
    }

    .picker {
      display: grid;
      gap: 6px;
      max-height: 280px;
      overflow: auto;
    }

    .picker button,
    .neighbor {
      text-align: left;
      padding: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      border-radius: 6px;
      font: inherit;
    }

    .picker button {
      cursor: pointer;
    }

    .picker button span,
    .neighbor span {
      display: block;
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-top: 2px;
    }

    .columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .columns > div {
      display: grid;
      gap: 8px;
      align-content: start;
    }

    button.neighbor {
      cursor: pointer;
    }

    .neighbor.missing {
      cursor: default;
    }

    .muted,
    .count {
      color: var(--secondary-text-color);
    }

    .count {
      font-size: 12px;
      margin-top: 8px;
    }

    @media (max-width: 600px) {
      .explorer {
        padding: 20px 14px;
      }

      .columns {
        grid-template-columns: 1fr;
      }
    }
  `;
}

defineBindHomeElement(
  "bindhome-topology-explorer",
  BindHomeTopologyExplorer,
);
