import { defineBindHomeElement } from "../custom-elements.js";
// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { tokens } from "../styles/shared-styles.js";
import {
  buildHomeProjection,
  groupRoomAssets,
  NO_AREA,
  STALE_AREA,
} from "../state/home-selectors.js";
import {
  assetPresentation,
  categoryPresentation,
} from "../presentation/asset-types.js";
import "./element-detail.js";

export class BindHomeHomeView extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    registry: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    deviceRegistry: { attribute: false },
    advancedEnabled: { type: Boolean, attribute: false },
    readOnly: { type: Boolean, attribute: false },
    refreshBindingData: { attribute: false },
    refreshTopologyData: { attribute: false },
    refreshAssets: { attribute: false },
    selectedAssetId: { attribute: false },
    selectedAreaId: { attribute: false },
    _collapsedFloorIds: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.floors = [];
    this.areas = [];
    this.assets = [];
    this.registry = {};
    this.bindingStatuses = { records: [], summary: {} };
    this.entityRegistry = [];
    this.deviceRegistry = [];
    this.advancedEnabled = false;
    this.readOnly = false;
    this.refreshBindingData = null;
    this.refreshTopologyData = null;
    this.refreshAssets = null;
    this.selectedAssetId = null;
    this.selectedAreaId = null;
    this._collapsedFloorIds = new Set();
  }
  static styles = [
    tokens,
    css`
      .layout { display: grid; grid-template-columns: minmax(260px, 360px) minmax(0, 1fr); gap: 18px; margin-top: 22px; align-items: start; }
      .floor-title, .area-row, .category-title, .asset-row { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 8px 14px; border: 0; border-bottom: 1px solid var(--divider-color); background: transparent; text-align: left; }
      .floor-title { font:inherit; color:inherit; font-weight: 500; background: var(--secondary-background-color); cursor:pointer; }
      .floor-title ha-icon, .category-title ha-icon { color: var(--primary-color); }
      .floor-title .collapse-icon { color:var(--secondary-text-color); }
      .area-row:hover, .asset-row:hover { background: var(--secondary-background-color); }
      .area-row.selected { border-left: 3px solid var(--primary-color); background: var(--secondary-background-color); }
      .grow { min-width: 0; flex: 1; overflow-wrap: anywhere; }
      .count { color: var(--secondary-text-color); font-size: 12px; }
      .room-head { display: flex; align-items: center; gap: 14px; padding: 16px; border-bottom: 1px solid var(--divider-color); }
      .room-head > ha-icon { color: var(--primary-color); --mdc-icon-size: 30px; }
      .room-head .primary { margin-left: auto; display: flex; align-items: center; gap: 8px; }
      .room-head .primary ha-icon { color: var(--text-primary-color, #fff); }
      .category-title { font-weight: 500; }
      .asset-row { padding-left: 30px; }
      .asset-row ha-icon { color: var(--secondary-text-color); }
      .asset-meta { display: block; margin-top: 2px; color: var(--secondary-text-color); font-size: 12px; }
      .specials { margin-top: 16px; }
      .special { border-bottom: 1px solid var(--divider-color); }
      .special:last-child { border-bottom: 0; }
      .detail { min-width: 0; }
      .back { display: none; }
      .intro { margin-top: 4px; }
      .layout > .room.hidden-mobile { display: none; }
      @media (max-width: 760px) {
        .layout { display: block; }
        .tree.hidden-mobile, .room.hidden-mobile { display: none; }
        .detail .back, .room .back { display: inline-flex; margin-bottom: 8px; }
        .page { padding-top: 18px; }
        .room-head { align-items: flex-start; }
        .room-head .primary { padding: 0 12px; }
        .room-head .primary span { display: none; }
      }
    `,
  ];
  _areaAssets(id) {
    if (id === NO_AREA) return this.assets.filter((asset) => !asset.area_id);
    if (id === STALE_AREA)
      return this.assets.filter(
        (asset) =>
          asset.area_id &&
          !this.areas.some((area) => area.area_id === asset.area_id),
      );
    return this.assets.filter((asset) => asset.area_id === id);
  }
  _selectArea(id) {
    this.dispatchEvent(
      new CustomEvent("home-navigate", {
        detail: { areaId: id, assetId: null },
        bubbles: true,
        composed: true,
      }),
    );
  }
  _selectAsset(id) {
    const target = this.assets.find((asset) => asset.id === id);
    if (!target) return;
    const areaId = !target.area_id
      ? NO_AREA
      : this.areas.some((area) => area.area_id === target.area_id)
        ? target.area_id
        : STALE_AREA;
    this.dispatchEvent(
      new CustomEvent("home-navigate", {
        detail: { areaId, assetId: id },
        bubbles: true,
        composed: true,
      }),
    );
  }
  _toggleFloor(id) {
    const next = new Set(this._collapsedFloorIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this._collapsedFloorIds = next;
  }
  _areaName() {
    if (this.selectedAreaId === NO_AREA) return this.t("home.unassigned");
    if (this.selectedAreaId === STALE_AREA) return this.t("home.stale_area");
    return (
      this.areas.find((a) => a.area_id === this.selectedAreaId)?.name ??
      this.t("home.choose_room")
    );
  }
  _renderTree() {
    const projection = buildHomeProjection(this.floors, this.areas, this.assets);
    return html`<section
      class="tree surface ${this.selectedAreaId || this.selectedAssetId ? "hidden-mobile" : ""}"
      aria-label=${this.t("home.navigation_label")}
    >
      ${projection.groups.map((group) => {
        const collapsed = this._collapsedFloorIds.has(group.id);
        return html`<div>
          <button class="floor-title" aria-expanded=${!collapsed} @click=${() => this._toggleFloor(group.id)}>
            <ha-icon icon=${group.icon || "mdi:layers-outline"}></ha-icon>
            <span class="grow">${group.name ?? this.t("common.no_floor")}</span>
            <span class="count">${group.areas.length}</span>
            <ha-icon class="collapse-icon" icon=${collapsed ? "mdi:chevron-down" : "mdi:chevron-up"}></ha-icon>
          </button>
          ${collapsed
            ? nothing
            : group.areas.map((area) => {
                const count = projection.assetsByArea.get(area.area_id)?.length ?? 0;
                return html`<button
                  class="area-row ${this.selectedAreaId === area.area_id ? "selected" : ""}"
                  aria-current=${this.selectedAreaId === area.area_id ? "location" : "false"}
                  @click=${() => this._selectArea(area.area_id)}
                >
                  <ha-icon icon=${area.icon || "mdi:floor-plan"}></ha-icon>
                  <span class="grow">${area.name}</span>
                  <span class="count">${count}</span>
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`;
              })}
        </div>`;
      })}
      ${projection.unassigned.length || projection.stale.length
        ? html`<div class="specials">
            ${projection.unassigned.length
              ? html`<button class="area-row special ${this.selectedAreaId === NO_AREA ? "selected" : ""}" @click=${() => this._selectArea(NO_AREA)}>
                  <ha-icon icon="mdi:map-marker-off-outline"></ha-icon><span class="grow">${this.t("home.unassigned")}</span><span class="count">${projection.unassigned.length}</span>
                </button>`
              : nothing}
            ${projection.stale.length
              ? html`<button class="area-row special ${this.selectedAreaId === STALE_AREA ? "selected" : ""}" @click=${() => this._selectArea(STALE_AREA)}>
                  <ha-icon icon="mdi:map-marker-alert-outline"></ha-icon><span class="grow">${this.t("home.stale_area")}</span><span class="count">${projection.stale.length}</span>
                </button>`
              : nothing}
          </div>`
        : nothing}
    </section>`;
  }
  _renderRoom() {
    if (!this.selectedAreaId)
      return html`<div class="empty room">${this.t("home.choose_room")}</div>`;
    const items = this._areaAssets(this.selectedAreaId);
    const groups = groupRoomAssets(this.t, items);
    return html`<section class="room surface ${this.selectedAssetId ? "hidden-mobile" : ""}">
      <button class="back text-button" @click=${() => this._selectArea(null)}><ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("home.back_floors")}</button>
      <header class="room-head">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        <div class="grow"><h2>${this._areaName()}</h2><span class="muted">${this.t("home.element_count", { count: items.length })}</span></div>
        ${!this.readOnly && ![NO_AREA, STALE_AREA].includes(this.selectedAreaId)
          ? html`<button class="primary" @click=${() => this.dispatchEvent(new CustomEvent("add-in-area", { detail: this.selectedAreaId, bubbles: true, composed: true }))}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${this.t("home.add_element")}</span>
            </button>`
          : nothing}
      </header>
      ${groups.length
        ? groups.map((group) => {
            const meta = categoryPresentation(this.t, group.category);
            return html`<section>
              <div class="category-title"><ha-icon icon=${meta.icon}></ha-icon><span class="grow">${meta.label}</span><span class="count">${group.assets.length}</span></div>
              ${group.assets.map((asset) => {
                const type = assetPresentation(this.t, asset.asset_type);
                return html`<button class="asset-row" @click=${() => this._selectAsset(asset.id)}>
                  <ha-icon icon=${type.icon}></ha-icon><span class="grow"><strong>${asset.name}</strong><span class="asset-meta">${type.label}</span></span><ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>`;
              })}
            </section>`;
          })
        : html`<div class="empty">${this.t("home.room_empty")}</div>`}
    </section>`;
  }
  render() {
    const asset = this.assets.find((item) => item.id === this.selectedAssetId);
    return html`<div class="page">
      <h1 class="page-title">${this.t("nav.home")}</h1>
      <p class="intro muted">${this.t("home.intro")}</p>
      <div class="layout">
        ${this._renderTree()}
        <div class="room ${asset ? "hidden-mobile" : ""}">${this._renderRoom()}</div>
        ${asset
          ? html`<bindhome-element-detail
              class="detail"
              .hass=${this.hass}
              .t=${this.t}
              .asset=${asset}
              .assets=${this.assets}
              .areas=${this.areas}
              .floors=${this.floors}
              .registry=${this.registry}
              .bindingStatuses=${this.bindingStatuses}
              .entityRegistry=${this.entityRegistry}
              .deviceRegistry=${this.deviceRegistry}
              .advancedEnabled=${this.advancedEnabled}
              .readOnly=${this.readOnly}
              .refreshBindingData=${this.refreshBindingData}
              .refreshTopologyData=${this.refreshTopologyData}
              .refreshAssets=${this.refreshAssets}
              @back=${() => this.dispatchEvent(new CustomEvent("home-navigate", { detail: { areaId: this.selectedAreaId, assetId: null }, bubbles: true, composed: true }))}
              @navigate-asset=${(e) => this._selectAsset(e.detail)}
              @asset-deleted=${() => this._selectArea(this.selectedAreaId)}
            ></bindhome-element-detail>`
          : nothing}
      </div>
    </div>`;
  }
}
defineBindHomeElement("bindhome-home-view", BindHomeHomeView);
