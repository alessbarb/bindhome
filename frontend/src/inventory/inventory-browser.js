import { defineBindHomeElement } from "../custom-elements.js";
import { LitElement, css, html, nothing } from "lit";

import { pluralKey, presetDisplayName } from "../i18n/localize.js";
import { buildInventoryHierarchy } from "./inventory-browser-state.js";
import {
  NO_AREA_KEY,
  UNKNOWN_AREA_KEY,
  locationKeyForAsset,
  replaceInventoryAsset,
  targetForInventoryKey,
} from "./inventory-browser-selection.js";

import "./asset-detail-editor.js";

export class BindHomeInventoryBrowser extends LitElement {
  static properties = {
    hass: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    presets: { attribute: false },
    registry: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    deviceRegistry: { attribute: false },
    refreshBindingData: { attribute: false },
    refreshTopologyData: { attribute: false },
    selectedAssetId: { attribute: false },
    t: { attribute: false },
    _selectedKey: { state: true },
    _selectedAssetId: { state: true },
    _editorLocked: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this.floors = [];
    this.areas = [];
    this.assets = [];
    this.presets = [];
    this.registry = {};
    this.bindingStatuses = { records: [], summary: {} };
    this.entityRegistry = [];
    this.deviceRegistry = [];
    this.refreshBindingData = null;
    this.refreshTopologyData = null;
    this.selectedAssetId = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this._selectedKey = "";
    this._selectedAssetId = null;
    this._editorLocked = false;
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

    .area-button:hover:not(:disabled),
    .special-button:hover:not(:disabled) {
      background: var(--secondary-background-color);
    }

    .area-button:disabled,
    .special-button:disabled {
      cursor: not-allowed;
      opacity: .6;
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

    .asset-open {
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--primary-color);
      font-weight: 500;
      line-height: 22px;
      text-align: left;
      overflow-wrap: anywhere;
    }

    .asset-open:hover {
      text-decoration: underline;
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

  _targetForKey(key, hierarchy = this._hierarchy) {
  return targetForInventoryKey(key, hierarchy, this.t);
}

  willUpdate(changed) {
    if (changed.has("selectedAssetId") && this.selectedAssetId) {
      const requested = this.assets.find((asset) => asset.id === this.selectedAssetId);
      if (requested) {
        this._selectedKey = this._locationKeyForAsset(requested);
        this._selectedAssetId = requested.id;
      }
    }
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

      if (
        this._selectedAssetId &&
        !this.assets.some(
          (asset) =>
            asset.id ===
            this._selectedAssetId,
        )
      ) {
        this._selectedAssetId = null;
        this._editorLocked = false;
      }
    }
  }

  _select(key) {
    if (this._editorLocked) {
      return;
    }

    this._selectedAssetId = null;
    this._selectedKey = key;
  }

  _openAsset(assetId) {
    this._selectedAssetId = assetId;
  }

  _closeAsset() {
    if (this._editorLocked) {
      return;
    }

    this._selectedAssetId = null;
  }

  _locationKeyForAsset(asset) {
  return locationKeyForAsset(asset, this.areas);
}

  _handleEditingChanged(event) {
    this._editorLocked =
      Boolean(event.detail);
  }

  _handleAssetUpdated(event) {
    event.stopPropagation();

    const updated = event.detail;

    const nextAssets = replaceInventoryAsset(
    this.assets,
    updated,
  );

    this.assets = nextAssets;

    this._selectedKey =
      this._locationKeyForAsset(
        updated,
      );

    this._selectedAssetId =
      updated.id;

    this.dispatchEvent(
      new CustomEvent(
        "assets-refreshed",
        {
          detail: nextAssets,
          bubbles: true,
          composed: true,
        },
      ),
    );
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
        ?disabled=${this._editorLocked}
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
                ?disabled=${this._editorLocked}
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
                ?disabled=${this._editorLocked}
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
          <button
            class="asset-open"
            @click=${() =>
              this._openAsset(
                asset.id,
              )}
          >
            ${asset.name}
          </button>
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

    const selectedAsset =
      this.assets.find(
        (asset) =>
          asset.id ===
          this._selectedAssetId,
      );

    if (selectedAsset) {
      return html`
        <bindhome-asset-detail-editor
          .hass=${this.hass}
          .t=${this.t}
          .asset=${selectedAsset}
          .assets=${this.assets}
          .areas=${this.areas}
          .floors=${this.floors}
          .registry=${this.registry}
          .bindingStatuses=${this.bindingStatuses}
          .entityRegistry=${this.entityRegistry}
          .deviceRegistry=${this.deviceRegistry}
          .refreshBindingData=${this.refreshBindingData}
          .refreshTopologyData=${this.refreshTopologyData}
          @close=${this._closeAsset}
          @editing-changed=${this
            ._handleEditingChanged}
          @asset-updated=${this
            ._handleAssetUpdated}
          @navigate-asset=${(event) => this._openAsset(event.detail)}
        ></bindhome-asset-detail-editor>
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

defineBindHomeElement(
  "bindhome-inventory-browser",
  BindHomeInventoryBrowser,
);
