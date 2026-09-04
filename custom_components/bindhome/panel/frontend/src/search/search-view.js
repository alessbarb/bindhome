// Typed contracts live in types.d.ts; view behavior is covered by DOM tests.
import { LitElement, css, html } from "lit";
import { tokens } from "../styles/shared-styles.js";
import { searchAssets } from "../state/home-selectors.js";
import { assetPresentation } from "../presentation/asset-types.js";
export class BindHomeSearchView extends LitElement {
  static properties = {
    t: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    floors: { attribute: false },
    _query: { state: true },
  };
  constructor() {
    super();
    this.t = (key) => key;
    this.assets = [];
    this.areas = [];
    this.floors = [];
    this._query = "";
  }
  static styles = [
    tokens,
    css`
      .search {
        position: relative;
        max-width: 720px;
        margin-top: 22px;
      }
      .search ha-icon {
        position: absolute;
        left: 14px;
        top: 12px;
        color: var(--secondary-text-color);
      }
      input {
        width: 100%;
        min-height: 50px;
        padding: 10px 14px 10px 48px;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        background: var(--card-background-color);
        font-size: 16px;
      }
      .results {
        max-width: 820px;
        margin-top: 20px;
      }
      .result {
        width: 100%;
        min-height: 68px;
        display: grid;
        grid-template-columns: 36px minmax(0, 1fr) 24px;
        gap: 12px;
        align-items: center;
        padding: 10px 14px;
        border: 0;
        border-bottom: 1px solid var(--divider-color);
        background: transparent;
        text-align: left;
      }
      .result:hover {
        background: var(--secondary-background-color);
      }
      .result > ha-icon:first-child {
        color: var(--primary-color);
      }
      .meta {
        display: block;
        margin-top: 3px;
        color: var(--secondary-text-color);
        font-size: 13px;
      }
      .hint {
        margin-top: 10px;
      }
      .empty {
        max-width: 820px;
        margin-top: 20px;
      }
    `,
  ];
  render() {
    const found = searchAssets(
      this.t,
      this.assets,
      this.areas,
      this.floors,
      this._query,
    );
    const normalized = found.map((item) =>
      item.asset
        ? item
        : {
            asset: item,
            area: this.areas.find((a) => a.area_id === item.area_id),
            type: assetPresentation(this.t, item.asset_type),
          },
    );
    return html`<div class="page">
      <h1 class="page-title">${this.t("nav.search")}</h1>
      <div class="search">
        <ha-icon icon="mdi:magnify"></ha-icon
        ><input
          type="search"
          aria-label=${this.t("search.label")}
          placeholder=${this.t("search.placeholder")}
          .value=${this._query}
          @input=${(e) => (this._query = e.target.value)}
        />
      </div>
      <p class="hint muted">
        ${this._query
          ? this.t("search.results", { count: normalized.length })
          : this.t("search.suggestions")}
      </p>
      ${normalized.length
        ? html`<div class="results surface">
            ${normalized.map(
              ({ asset, area, type }) =>
                html`<button
                  class="result"
                  @click=${() =>
                    this.dispatchEvent(
                      new CustomEvent("open-asset", {
                        detail: asset.id,
                        bubbles: true,
                        composed: true,
                      }),
                    )}
                >
                  <ha-icon icon=${type.icon}></ha-icon
                  ><span
                    ><strong>${asset.name}</strong
                    ><span class="meta"
                      >${type.label} ·
                      ${area?.name ??
                      this.t(
                        asset.area_id ? "home.stale_area" : "home.unassigned",
                      )}</span
                    ></span
                  ><ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`,
            )}
          </div>`
        : html`<div class="empty">${this.t("search.empty")}</div>`}
    </div>`;
  }
}
customElements.define("bindhome-search-view", BindHomeSearchView);
