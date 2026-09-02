import { LitElement, css, html, nothing } from "lit";

import { pluralKey, presetDisplayName } from "../i18n/localize.js";
import { buildInventoryHierarchy } from "./inventory-browser-state.js";

const NO_AREA_KEY = "__bindhome_no_area_assets__";
const UNKNOWN_AREA_KEY = "__bindhome_unknown_area_assets__";

export class BindHomeInventoryBrowser extends LitElement {
  static properties = {
    floors: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    presets: { attribute: false },
    t: { attribute: false },
    _selectedKey: { state: true },
  };

  constructor() {
    super();
    this.floors = [];
    this.areas = [];
    this.assets = [];
    this.presets = [];
    this.t = (key) => key;
    this._selectedKey = "";
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100%;
      color: var(--primary-text-color);
    }

    * {
      box-sizing: border-box;
    }

    button {
      font: inherit;
      color: inherit;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-size: 24px;
      line-height: 32px;
      font-weight: 500;
    }

    h2 {
      font-size: 18px;
      line-height: 26px;
      font-weight: 500;
    }

    h3 {
      font-size: 15px;
      line-height: 22px;
      font-weight: 500;
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 24px 48px;
    }

    .intro {
      max-width: 760px;
      margin-top: 6px;
      color: var(--secondary-text-color);
      line-height: 22px;
    }

    .layout {
      display: grid;
      grid-template-columns: 330px minmax(0, 1fr);
      gap: 28px;
      margin-top: 28px;
      align-items: start;
    }

    .tree {
      overflow: hidden;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: var(--card-background-color);
    }

    .tree-heading {
      padding: 14px 16px;
      border-bottom: 1px solid var(--divider-color);
      color: var(--secondary-text-color);
      font-size: 13px;
      font-weight: 500;
    }

    .floor {
      border-bottom: 1px solid var(--divider-color);
    }

    .floor:last-child {
      border-bottom: 0;
    }

    .floor-title {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 48px;
      padding: 8px 14px;
      font-weight: 500;
      background: var(--secondary-background-color);
    }

    .floor-title ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }

    .empty-floor {
      padding: 12px 16px;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 19px;
    }

    .area-button,
    .special-button {
      width: 100%;
      min-height: 52px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 8px 14px 8px 18px;
      border: 0;
      border-top: 1px solid var(--divider-color);
      border-left: 3px solid transparent;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    .area-button:hover,
    .special-button:hover {
      background: var(--secondary-background-color);
    }

    .area-button.selected,
    .special-button.selected {
      border-left-color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .area-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }

    .count {
      color: var(--secondary-text-color);
      font-size: 12px;
      white-space: nowrap;
    }

    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }

    .specials {
      border-top: 1px solid var(--divider-color);
    }

    .special-button {
      border-top: 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .special-button:last-child {
      border-bottom: 0;
    }

    .results {
      min-width: 0;
    }

    .results-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
    }

    .results-copy {
      min-width: 0;
    }

    .results-description {
      margin-top: 5px;
      color: var(--secondary-text-color);
      line-height: 20px;
    }

    .results-count {
      flex: none;
      padding-top: 3px;
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .empty {
      min-height: 220px;
      display: grid;
      place-items: center;
      margin-top: 20px;
      padding: 28px;
      border: 1px dashed var(--divider-color);
      border-radius: 10px;
      color: var(--secondary-text-color);
      text-align: center;
      line-height: 22px;
    }

    .assets {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .asset {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(140px, 220px);
      gap: 18px;
      min-height: 72px;
      padding: 13px 4px;
      border-bottom: 1px solid var(--divider-color);
    }

    .asset-main {
      min-width: 0;
    }

    .asset-name {
      overflow-wrap: anywhere;
      font-weight: 500;
      line-height: 22px;
    }

    .asset-type {
      margin-top: 3px;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 18px;
    }

    .asset-meta {
      min-width: 0;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 19px;
    }

    .asset-meta span {
      display: block;
      overflow-wrap: anywhere;
    }

    .stale {
      color: var(--warning-color, var(--secondary-text-color));
    }

    @media (max-width: 760px) {
      .content {
        padding: 20px 14px 36px;
      }

      .layout {
        grid-template-columns: 1fr;
        gap: 22px;
        margin-top: 22px;
      }

      .asset {
        grid-template-columns: 1fr;
        gap: 6px;
      }

      .results-header {
        align-items: end;
      }
    }
  `;

  get _hierarchy() {
    return buildInventoryHierarchy(
      this.floors,
      this.areas,
      this.assets,
    );
  }

  _countAssets(count) {
    return this.t(
      pluralKey("counts.asset", count),
      { count },
    );
  }

  _allAreaNodes(hierarchy = this._hierarchy) {
    return [
      ...hierarchy.floors.flatMap(
        (floorNode) => floorNode.areas,
      ),
      ...hierarchy.noFloorAreas,
    ];
  }

  _areaNode(areaId, hierarchy = this._hierarchy) {
    return this._allAreaNodes(hierarchy).find(
      ({ area }) => area.area_id === areaId,
    );
  }

  _targetForKey(
    key,
    hierarchy = this._hierarchy,
  ) {
    if (!key) {
      return null;
    }

    if (key === NO_AREA_KEY) {
      if (!hierarchy.noAreaAssets.length) {
        return null;
      }

      return {
        kind: "no-area",
        title: this.t("browser.no_area"),
        description: this.t(
          "browser.no_area_intro",
        ),
        assets: hierarchy.noAreaAssets,
      };
    }

    if (key === UNKNOWN_AREA_KEY) {
      if (!hierarchy.unknownAreaAssets.length) {
        return null;
      }

      return {
        kind: "unknown-area",
        title: this.t(
          "browser.unknown_area",
        ),
        description: this.t(
          "browser.unknown_area_intro",
        ),
        assets: hierarchy.unknownAreaAssets,
      };
    }

    const node = this._areaNode(
      key,
      hierarchy,
    );

    if (!node) {
      return null;
    }

    return {
      kind: "area",
      title: node.area.name,
      description: "",
      area: node.area,
      assets: node.assets,
    };
  }

  willUpdate(changed) {
    if (
      this._selectedKey &&
      (
        changed.has("floors") ||
        changed.has("areas") ||
        changed.has("assets")
      )
    ) {
      const hierarchy =
        buildInventoryHierarchy(
          this.floors,
          this.areas,
          this.assets,
        );

      if (
        !this._targetForKey(
          this._selectedKey,
          hierarchy,
        )
      ) {
        this._selectedKey = "";
      }
    }
  }

  _select(key) {
    this._selectedKey = key;
  }

  _assetTypeLabel(asset) {
    const preset = this.presets.find(
      (item) =>
        item.asset_type === asset.asset_type,
    );

    return preset
      ? presetDisplayName(this.t, preset)
      : asset.asset_type;
  }

  _renderAreaButton(node) {
    const selected =
      this._selectedKey ===
      node.area.area_id;

    return html`
      <button
        class="area-button ${selected
          ? "selected"
          : ""}"
        aria-pressed=${selected
          ? "true"
          : "false"}
        @click=${() =>
          this._select(node.area.area_id)}
      >
        <span class="area-name">
          ${node.area.name}
        </span>
        <span class="count">
          ${this._countAssets(
            node.assets.length,
          )}
        </span>
      </button>
    `;
  }

  _renderFloor(floorNode) {
    return html`
      <section class="floor">
        <div class="floor-title">
          <ha-icon
            icon="mdi:layers-outline"
          ></ha-icon>
          <span>${floorNode.floor.name}</span>
        </div>

        ${floorNode.areas.length
          ? floorNode.areas.map(
              (node) =>
                this._renderAreaButton(node),
            )
          : html`
              <p class="empty-floor">
                ${this.t(
                  "browser.floor_no_areas",
                )}
              </p>
            `}
      </section>
    `;
  }

  _renderNoFloor(hierarchy) {
    if (!hierarchy.noFloorAreas.length) {
      return nothing;
    }

    return html`
      <section class="floor">
        <div class="floor-title">
          <ha-icon
            icon="mdi:layers-off-outline"
          ></ha-icon>
          <span>
            ${this.t("common.no_floor")}
          </span>
        </div>

        ${hierarchy.noFloorAreas.map(
          (node) =>
            this._renderAreaButton(node),
        )}
      </section>
    `;
  }

  _renderSpecials(hierarchy) {
    if (
      !hierarchy.noAreaAssets.length &&
      !hierarchy.unknownAreaAssets.length
    ) {
      return nothing;
    }

    const noAreaSelected =
      this._selectedKey === NO_AREA_KEY;

    const unknownSelected =
      this._selectedKey === UNKNOWN_AREA_KEY;

    return html`
      <div class="specials">
        ${hierarchy.noAreaAssets.length
          ? html`
              <button
                class="special-button ${noAreaSelected
                  ? "selected"
                  : ""}"
                aria-pressed=${noAreaSelected
                  ? "true"
                  : "false"}
                @click=${() =>
                  this._select(NO_AREA_KEY)}
              >
                <span class="area-name">
                  ${this.t(
                    "browser.no_area",
                  )}
                </span>
                <span class="count">
                  ${this._countAssets(
                    hierarchy
                      .noAreaAssets
                      .length,
                  )}
                </span>
              </button>
            `
          : nothing}

        ${hierarchy
          .unknownAreaAssets.length
          ? html`
              <button
                class="special-button ${unknownSelected
                  ? "selected"
                  : ""}"
                aria-pressed=${unknownSelected
                  ? "true"
                  : "false"}
                @click=${() =>
                  this._select(
                    UNKNOWN_AREA_KEY,
                  )}
              >
                <span class="area-name">
                  ${this.t(
                    "browser.unknown_area",
                  )}
                </span>
                <span class="count">
                  ${this._countAssets(
                    hierarchy
                      .unknownAreaAssets
                      .length,
                  )}
                </span>
              </button>
            `
          : nothing}
      </div>
    `;
  }

  _renderAsset(asset, target) {
    return html`
      <li class="asset">
        <div class="asset-main">
          <div class="asset-name">
            ${asset.name}
          </div>
          <div class="asset-type">
            ${this._assetTypeLabel(asset)}
          </div>
        </div>

        <div class="asset-meta">
          ${asset.code
            ? html`
                <span>
                  ${this.t("fields.code")}:
                  ${asset.code}
                </span>
              `
            : nothing}

          ${asset.capabilities?.length
            ? html`
                <span>
                  ${this.t(
                    "fields.capabilities",
                  )}:
                  ${asset.capabilities.join(
                    ", ",
                  )}
                </span>
              `
            : nothing}

          ${target.kind ===
          "unknown-area"
            ? html`
                <span class="stale">
                  ${this.t(
                    "browser.stale_area",
                    {
                      area_id:
                        asset.area_id,
                    },
                  )}
                </span>
              `
            : nothing}
        </div>
      </li>
    `;
  }

  _renderResults(hierarchy) {
    const target = this._targetForKey(
      this._selectedKey,
      hierarchy,
    );

    if (!this.assets.length) {
      return html`
        <div class="empty">
          ${this.t(
            "browser.no_assets_home",
          )}
        </div>
      `;
    }

    if (!target) {
      return html`
        <div class="empty">
          ${this.t(
            "browser.select_area",
          )}
        </div>
      `;
    }

    return html`
      <div class="results-header">
        <div class="results-copy">
          <h2>${target.title}</h2>

          ${target.description
            ? html`
                <p
                  class="results-description"
                >
                  ${target.description}
                </p>
              `
            : nothing}
        </div>

        <span class="results-count">
          ${this._countAssets(
            target.assets.length,
          )}
        </span>
      </div>

      ${target.assets.length
        ? html`
            <ul
              class="assets"
              aria-label=${this.t(
                "browser.asset_list_label",
                {
                  location:
                    target.title,
                },
              )}
            >
              ${target.assets.map(
                (asset) =>
                  this._renderAsset(
                    asset,
                    target,
                  ),
              )}
            </ul>
          `
        : html`
            <div class="empty">
              ${this.t(
                "browser.no_assets_area",
              )}
            </div>
          `}
    `;
  }

  render() {
    const hierarchy = this._hierarchy;

    return html`
      <div class="content">
        <header>
          <h1>
            ${this.t("browser.title")}
          </h1>
          <p class="intro">
            ${this.t("browser.intro")}
          </p>
        </header>

        <div class="layout">
          <nav
            class="tree"
            aria-label=${this.t(
              "browser.navigation_label",
            )}
          >
            <div class="tree-heading">
              ${this.t(
                "browser.navigation_label",
              )}
            </div>

            ${hierarchy.floors.map(
              (floorNode) =>
                this._renderFloor(
                  floorNode,
                ),
            )}

            ${this._renderNoFloor(
              hierarchy,
            )}

            ${this._renderSpecials(
              hierarchy,
            )}
          </nav>

          <section
            class="results"
            aria-live="polite"
          >
            ${this._renderResults(
              hierarchy,
            )}
          </section>
        </div>
      </div>
    `;
  }
}

customElements.define(
  "bindhome-inventory-browser",
  BindHomeInventoryBrowser,
);
