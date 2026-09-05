import { defineBindHomeElement } from "../custom-elements.js";
import { LitElement, css, html, nothing } from "lit";

import { indexBindingStatuses } from "../bindings/binding-state.js";
import "../bindings/primary-connection-editor.js";
import "../topology/asset-topology.js";

/**
 * Connection/topology/Representation surface for one Asset.
 *
 * This component deliberately owns presentation and wiring only. Registry
 * mutation semantics remain in the existing child components/APIs.
 */
export class BindHomeAssetConnections extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    registry: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    deviceRegistry: { attribute: false },
    refreshBindingData: { attribute: false },
    refreshTopologyData: { attribute: false },
  };

  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    /** @type {import('../types.js').Asset | null} */
    this.asset = null;
    /** @type {import('../types.js').Asset[]} */
    this.assets = [];
    /** @type {import('../types.js').HaArea[]} */
    this.areas = [];
    /** @type {Partial<import('../types.js').Registry>} */
    this.registry = {};
    this.bindingStatuses = { records: [], summary: {} };
    /** @type {import('../types.js').HaEntityRegistryEntry[]} */
    this.entityRegistry = [];
    /** @type {import('../types.js').HaDeviceRegistryEntry[]} */
    this.deviceRegistry = [];
    this.refreshBindingData = null;
    this.refreshTopologyData = null;
  }

  static styles = css`
    :host { display: block; }
    .connections { margin-top: 24px; }
    .connections h3 {
      margin: 0 0 14px;
      font-size: 17px;
      line-height: 24px;
      font-weight: 500;
    }
    .connection-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      align-items: start;
    }
    .connection-card {
      min-width: 0;
      padding: 15px;
      border: 1px solid var(--divider-color);
      border-radius: 9px;
      background: var(--card-background-color);
    }
    .connection-card h4 {
      margin: 0 0 10px;
      font-size: 14px;
      font-weight: 500;
    }
    .connection-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .muted { color: var(--secondary-text-color); }
    @media (max-width: 760px) {
      .connection-grid { grid-template-columns: 1fr; }
    }
  `;

  _bindings() {
    if (!this.asset) return [];
    return (this.registry?.bindings ?? []).filter(
      (binding) => binding.asset_id === this.asset.id,
    );
  }

  _primaryStatus(capability) {
    if (!this.asset) return null;
    const indexed = indexBindingStatuses(this.bindingStatuses).get(
      `${this.asset.id}:${capability}:primary`,
    );
    if (indexed) return indexed;

    const binding = this._bindings().find(
      (candidate) => candidate.capability === capability && candidate.role === "primary",
    );
    return binding
      ? {
          asset_id: this.asset.id,
          capability,
          role: "primary",
          status: "resolved",
          config_valid: true,
          runtime_available: true,
          entity_id: binding.entity_id,
          binding,
        }
      : null;
  }

  _representation() {
    if (!this.asset) return null;
    return (this.registry?.representations ?? []).find(
      (representation) => representation.asset_id === this.asset.id,
    );
  }

  _forwardTopologyWarning(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("topology-sync-warning", {
      detail: event.detail,
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.asset) return nothing;
    const representation = this._representation();

    return html`
      <section class="connections">
        <h3>${this.t("editor.connections")}</h3>
        <div class="connection-grid">
          <article class="connection-card">
            <bindhome-asset-topology
              .hass=${this.hass}
              .t=${this.t}
              .asset=${this.asset}
              .assets=${this.assets}
              .areas=${this.areas}
              .registry=${this.registry}
              .onRefresh=${this.refreshTopologyData}
              @topology-sync-warning=${this._forwardTopologyWarning}
            ></bindhome-asset-topology>
          </article>

          <article class="connection-card">
            <h4>${this.t("editor.bindings")}</h4>
            <div class="connection-list">
              ${(this.asset.capabilities ?? []).map(
                (capability) => html`
                  <bindhome-primary-connection-editor
                    .hass=${this.hass}
                    .t=${this.t}
                    .asset=${this.asset}
                    .capability=${capability}
                    .status=${this._primaryStatus(capability)}
                    .areas=${this.areas}
                    .entityRegistry=${this.entityRegistry}
                    .deviceRegistry=${this.deviceRegistry}
                    .refreshBindingData=${this.refreshBindingData}
                  ></bindhome-primary-connection-editor>
                `,
              )}
            </div>
          </article>

          <article class="connection-card">
            <h4>${this.t("editor.representation")}</h4>
            ${representation
              ? html`<p>${this.t("editor.platform")}: <strong>${representation.platform}</strong></p>`
              : html`<p class="muted">${this.t("editor.no_representation")}</p>`}
          </article>
        </div>
      </section>
    `;
  }
}

defineBindHomeElement("bindhome-asset-connections", BindHomeAssetConnections);
