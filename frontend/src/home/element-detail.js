import { defineBindHomeElement } from "../custom-elements.js";
// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { tokens } from "../styles/shared-styles.js";
import { assetPresentation } from "../presentation/asset-types.js";
import {
  relationPresentation,
  contextualRelationActions,
} from "../presentation/relation-types.js";
import { relationPartitions } from "../topology/relation-state.js";
import "../bindings/primary-connection-editor.js";
import "./contextual-relation-editor.js";
import "./human-asset-editor.js";
import "./asset-delete-control.js";

export class BindHomeElementDetail extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    floors: { attribute: false },
    registry: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    deviceRegistry: { attribute: false },
    advancedEnabled: { type: Boolean, attribute: false },
    refreshBindingData: { attribute: false },
    refreshTopologyData: { attribute: false },
    refreshAssets: { attribute: false },
    _action: { state: true },
    _sync: { state: true },
    _editingAsset: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.asset = null;
    this.assets = [];
    this.areas = [];
    this.floors = [];
    this.registry = {};
    this.bindingStatuses = { records: [], summary: {} };
    this.entityRegistry = [];
    this.deviceRegistry = [];
    this.advancedEnabled = false;
    this.refreshBindingData = null;
    this.refreshTopologyData = null;
    this.refreshAssets = null;
    this._action = null;
    this._sync = null;
    this._editingAsset = false;
    this._identity = null;
  }
  willUpdate() {
    if (this.asset?.id !== this._identity) {
      this._identity = this.asset?.id;
      this._action = null;
      this._sync = null;
      this._editingAsset = false;
    }
  }
  static styles = [
    tokens,
    css`
      :host { display: block; min-width: 0; }
      .back { display: inline-flex; align-items: center; gap: 6px; padding: 0; }
      .card { margin-top: 8px; }
      .header { display: flex; gap: 14px; align-items: flex-start; padding: 20px; border-bottom: 1px solid var(--divider-color); }
      .hero-icon { display: grid; place-items: center; flex: none; width: 52px; height: 52px; border-radius: 12px; color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); --mdc-icon-size: 30px; }
      .grow { min-width: 0; flex: 1; }
      .header h2 { overflow-wrap: anywhere; font-size: 23px; line-height: 30px; font-weight: 500; }
      .location { margin-top: 3px; color: var(--secondary-text-color); }
      .type { display: flex; align-items: center; gap: 7px; margin-top: 10px; }
      .section { padding: 18px 20px; border-bottom: 1px solid var(--divider-color); }
      .section:last-child { border-bottom: 0; }
      .section h3 { margin-bottom: 12px; font-size: 17px; font-weight: 500; }
      .relations { display: grid; gap: 8px; }
      .relation { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 0; }
      .relation ha-icon { color: var(--primary-color); }
      .relation button { display: block; padding: 0; border: 0; background: transparent; text-align: left; font-weight: 500; }
      .relation small { display: block; margin-top: 2px; color: var(--secondary-text-color); }
      .device { padding: 14px; border-radius: 8px; background: var(--secondary-background-color); }
      .passive { color: var(--secondary-text-color); line-height: 1.45; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      details { overflow: hidden; }
      summary { min-height: 52px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500; }
      dl { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 10px 16px; padding-bottom: 16px; }
      dt { color: var(--secondary-text-color); }
      dd { overflow-wrap: anywhere; }
      .raw { font-family: var(--code-font-family, monospace); font-size: 12px; }
      @media (max-width: 600px) {
        .header { display: grid; grid-template-columns: 46px minmax(0, 1fr); padding: 16px 14px; }
        .header > .text-button { grid-column: 2; justify-self: start; padding: 0; }
        .section { padding: 16px 14px; }
        .hero-icon { width: 46px; height: 46px; }
        .header h2 { font-size: 21px; line-height: 27px; }
        dl { grid-template-columns: 1fr; gap: 3px; }
        dd { margin-bottom: 8px; }
      }
    `,
  ];
  _area() {
    return this.areas.find((a) => a.area_id === this.asset?.area_id) ?? null;
  }
  _asset(id) {
    return this.assets.find((a) => a.id === id) ?? null;
  }
  _relations() {
    const parts = relationPartitions(this.registry?.relations ?? [], this.asset?.id);
    return /** @type {Array<{relation: import('../types.js').Relation, direction: 'incoming'|'outgoing', other: import('../types.js').Asset|null}>} */ ([
      ...parts.incoming.map((relation) => ({ relation, direction: "incoming", other: this._asset(relation.source_asset_id) })),
      ...parts.outgoing.map((relation) => ({ relation, direction: "outgoing", other: this._asset(relation.target_asset_id) })),
    ]);
  }
  _devices() {
    const capabilities = this.asset?.capabilities ?? [];
    const configured = (this.bindingStatuses?.records ?? [])
      .filter((status) => status.asset_id === this.asset?.id && status.role === "primary" && Boolean(status.binding || status.entity_id))
      .map((status) => ({ capability: status.capability, status }));
    const shown = configured.length ? configured : capabilities.length ? [{ capability: capabilities[0], status: null }] : [];
    const identities = new Set();
    return shown.filter(({ capability, status }) => {
      const entityId = status?.binding?.entity_id ?? status?.entity_id;
      const deviceId = this.entityRegistry.find((entity) => entity.entity_id === entityId)?.device_id;
      const identity = deviceId ? `device:${deviceId}` : entityId ? `entity:${entityId}` : `capability:${capability}`;
      if (identities.has(identity)) return false;
      identities.add(identity);
      return true;
    });
  }
  _forwardDeleted(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("asset-deleted", { detail: event.detail, bubbles: true, composed: true }));
  }
  render() {
    if (!this.asset) return nothing;
    if (this._editingAsset) return html`<bindhome-human-asset-editor
      .hass=${this.hass} .t=${this.t} .asset=${this.asset} .areas=${this.areas}
      .refreshAssets=${this.refreshAssets}
      @cancel=${() => (this._editingAsset = false)}
      @done=${() => (this._editingAsset = false)}
      @sync-warning=${(event) => (this._sync = event.detail)}
    ></bindhome-human-asset-editor>`;
    const type = assetPresentation(this.t, this.asset.asset_type),
      area = this._area(),
      relations = this._relations(),
      devices = this._devices(),
      representations = (this.registry.representations ?? []).filter((r) => r.asset_id === this.asset.id),
      actions = contextualRelationActions(this.asset.asset_type);
    return html`<button class="back text-button" @click=${() => this.dispatchEvent(new CustomEvent("back", { bubbles: true, composed: true }))}>
        <ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("home.back_room")}
      </button>
      <article class="card surface">
        <header class="header">
          <div class="hero-icon"><ha-icon icon=${type.icon}></ha-icon></div>
          <div class="grow">
            <h2>${this.asset.name}</h2>
            <p class="location">${area?.name ?? (this.asset.area_id ? this.t("home.stale_area") : this.t("home.unassigned"))}</p>
            <p class="type"><ha-icon icon=${type.icon}></ha-icon>${type.label}</p>
          </div>
          <button class="text-button" @click=${() => (this._editingAsset = true)}>${this.t("common.edit")}</button>
        </header>
        <section class="section">
          <h3>${this.t("detail.connections")}</h3>
          ${relations.length
            ? html`<div class="relations">${relations.map(({ relation, direction, other }) => {
                const presentation = relationPresentation(this.t, relation.relation_type, direction);
                return html`<div class="relation"><ha-icon icon=${presentation.icon}></ha-icon><div><small>${presentation.label}</small>${other
                  ? html`<button @click=${() => this.dispatchEvent(new CustomEvent("navigate-asset", { detail: other.id, bubbles: true, composed: true }))}>${other.name}</button>`
                  : html`<strong>${this.t("detail.missing_element")}</strong>`}</div></div>`;
              })}</div>`
            : html`<p class="passive">${this.t("detail.no_connections")}</p>`}
          ${actions.length
            ? html`<div class="actions">${actions.map((action) => html`<button class="secondary" ?disabled=${Boolean(this._action)} @click=${() => (this._action = action)}>${this.t(action.labelKey)}</button>`)}</div>`
            : nothing}
          ${this._action
            ? html`<bindhome-contextual-relation-editor .hass=${this.hass} .t=${this.t} .asset=${this.asset} .assets=${this.assets} .areas=${this.areas} .action=${this._action} .onRefresh=${this.refreshTopologyData} @cancel=${() => (this._action = null)} @done=${() => (this._action = null)} @sync-warning=${(event) => (this._sync = event.detail)}></bindhome-contextual-relation-editor>`
            : nothing}
          ${this._sync ? html`<div class="error" role="alert">${this._sync}</div>` : nothing}
        </section>
        <section class="section">
          <h3>${this.t(this.asset.asset_type === "radiator" ? "detail.control" : "detail.device")}</h3>
          ${devices.length
            ? devices.map((device) => html`<div class="device"><bindhome-primary-connection-editor .hass=${this.hass} .t=${this.t} .asset=${this.asset} .capability=${device.capability} .status=${device.status} .areas=${this.areas} .entityRegistry=${this.entityRegistry} .deviceRegistry=${this.deviceRegistry} .refreshBindingData=${this.refreshBindingData} .showEntityId=${false}></bindhome-primary-connection-editor></div>`)
            : html`<p class="passive">${this.t("detail.passive")}</p>`}
        </section>
        <section class="section">
          <details>
            <summary><ha-icon icon="mdi:code-tags"></ha-icon>${this.t("detail.technical")}</summary>
            <dl>
              <dt>${this.t("fields.asset_type")}</dt><dd class="raw">${this.asset.asset_type}</dd>
              <dt>${this.t("detail.asset_id")}</dt><dd class="raw">${this.asset.id}</dd>
              <dt>${this.t("fields.code")}</dt><dd>${this.asset.code || this.t("common.not_set")}</dd>
              <dt>${this.t("fields.capabilities")}</dt><dd class="raw">${this.asset.capabilities?.join(", ") || this.t("common.none")}</dd>
              <dt>${this.t("detail.representations")}</dt><dd class="raw">${representations.length ? representations.map((r) => r.platform).join(", ") : this.t("common.none")}</dd>
            </dl>
            ${this.advancedEnabled
              ? html`<button class="secondary open-advanced" @click=${() => this.dispatchEvent(new CustomEvent("open-advanced", { detail: this.asset.id, bubbles: true, composed: true }))}>${this.t("detail.open_advanced")}</button>`
              : nothing}
          </details>
        </section>
        <section class="section">
          <bindhome-asset-delete-control
            .hass=${this.hass}
            .t=${this.t}
            .asset=${this.asset}
            .refreshBindingData=${this.refreshBindingData}
            .refreshTopologyData=${this.refreshTopologyData}
            .refreshAssets=${this.refreshAssets}
            @asset-deleted=${this._forwardDeleted}
          ></bindhome-asset-delete-control>
        </section>
      </article>`;
  }
}
defineBindHomeElement("bindhome-element-detail", BindHomeElementDetail);
