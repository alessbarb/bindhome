// @ts-check
import { LitElement, css, html } from "lit";
import { tokens } from "../styles/shared-styles.js";
import "../inventory/inventory-section.js";
import "../infrastructure/infrastructure-inspector.js";
export class BindHomeAdvancedView extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    presets: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    registry: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    deviceRegistry: { attribute: false },
    refreshBindingData: { attribute: false },
    refreshTopologyData: { attribute: false },
    selectedAssetId: { attribute: false },
    _tab: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    this.t = (k) => k;
    this.presets = [];
    this.floors = [];
    this.areas = [];
    this.assets = [];
    this.registry = {};
    this.bindingStatuses = { records: [], summary: {} };
    this.entityRegistry = [];
    this.deviceRegistry = [];
    this.refreshBindingData = null;
    this.refreshTopologyData = null;
    this.selectedAssetId = null;
    this._tab = "inventory";
  }
  willUpdate(changed) {
    if (changed.has("selectedAssetId") && this.selectedAssetId) {
      this._tab = "inventory";
    }
  }
  static styles = [
    tokens,
    css`
      .intro {
        max-width: 760px;
        margin-top: 5px;
      }
      .tabs {
        display: flex;
        overflow-x: auto;
        margin-top: 18px;
        border-bottom: 1px solid var(--divider-color);
      }
      .tabs button {
        flex: none;
        min-height: 48px;
        padding: 0 15px;
        border: 0;
        border-bottom: 3px solid transparent;
        background: transparent;
        color: var(--secondary-text-color);
      }
      .tabs button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }
      .view[hidden] {
        display: none;
      }
      .content-head {
        max-width: 1200px;
        margin: auto;
        padding: 28px 24px 0;
      }
      @media (max-width: 600px) {
        .content-head {
          padding: 20px 12px 0;
        }
        .tabs button {
          padding-inline: 12px;
        }
      }
    `,
  ];
  render() {
    return html`<div class="content-head">
        <h1 class="page-title">${this.t("nav.advanced")}</h1>
        <p class="intro muted">${this.t("advanced.intro")}</p>
        <nav class="tabs" aria-label=${this.t("advanced.views_label")}>
          <button
            class=${this._tab === "inventory" ? "active" : ""}
            aria-current=${this._tab === "inventory" ? "page" : "false"}
            @click=${() => (this._tab = "inventory")}
          >
            ${this.t("advanced.inventory")}</button
          ><button
            class=${this._tab === "infrastructure" ? "active" : ""}
            aria-current=${this._tab === "infrastructure" ? "page" : "false"}
            @click=${() => (this._tab = "infrastructure")}
          >
            ${this.t("nav.infrastructure")}
          </button>
        </nav>
      </div>
      <section class="view" ?hidden=${this._tab !== "inventory"}>
        <bindhome-inventory-section
          .hass=${this.hass}
          .t=${this.t}
          .presets=${this.presets}
          .floors=${this.floors}
          .areas=${this.areas}
          .assets=${this.assets}
          .registry=${this.registry}
          .bindingStatuses=${this.bindingStatuses}
          .entityRegistry=${this.entityRegistry}
          .deviceRegistry=${this.deviceRegistry}
          .refreshBindingData=${this.refreshBindingData}
          .refreshTopologyData=${this.refreshTopologyData}
          .selectedAssetId=${this.selectedAssetId}
          @assets-refreshed=${(e) =>
            this.dispatchEvent(
              new CustomEvent("assets-refreshed", {
                detail: e.detail,
                bubbles: true,
                composed: true,
              }),
            )}
        ></bindhome-inventory-section>
      </section>
      <section class="view" ?hidden=${this._tab !== "infrastructure"}>
        <bindhome-infrastructure-inspector
          .t=${this.t}
          .registry=${this.registry}
          .areas=${this.areas}
        ></bindhome-infrastructure-inspector>
      </section>`;
  }
}
customElements.define("bindhome-advanced-view", BindHomeAdvancedView);
