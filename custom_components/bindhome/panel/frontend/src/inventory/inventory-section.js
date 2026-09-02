import { LitElement, css, html } from "lit";

import "./inventory-browser.js";
import "./inventory-workflow.js";

export class BindHomeInventorySection extends LitElement {
  static properties = {
    hass: { attribute: false },
    registry: { attribute: false },
    t: { attribute: false },
    presets: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    deviceRegistry: { attribute: false },
    _active: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    this.registry = {};
    this.t = (key) => key;
    this.presets = [];
    this.floors = [];
    this.areas = [];
    this.assets = [];
    this.bindingStatuses = { records: [], summary: {} };
    this.entityRegistry = [];
    this.deviceRegistry = [];
    this._active = "browse";
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100%;
    }

    * {
      box-sizing: border-box;
    }

    .subnav {
      min-height: 48px;
      display: flex;
      gap: 4px;
      padding: 0 max(
        12px,
        calc(
          (100% - 1200px) / 2 + 24px
        )
      );
      border-bottom: 1px solid
        var(--divider-color);
      background:
        var(--card-background-color);
      overflow-x: auto;
    }

    .subnav button {
      min-height: 48px;
      padding: 0 14px;
      border: 0;
      border-bottom: 3px solid
        transparent;
      background: transparent;
      color:
        var(--secondary-text-color);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
    }

    .subnav button.active {
      color: var(--primary-color);
      border-bottom-color:
        var(--primary-color);
    }

    .subnav button:focus-visible {
      outline: 2px solid
        var(--primary-color);
      outline-offset: -3px;
    }

    .view[hidden] {
      display: none;
    }

    @media (max-width: 600px) {
      .subnav {
        padding-inline: 8px;
      }

      .subnav button {
        padding-inline: 12px;
      }
    }
  `;

  _show(view) {
    this._active = view;
  }

  _forwardAssetsRefreshed(event) {
    event.stopPropagation();

    this.dispatchEvent(
      new CustomEvent(
        "assets-refreshed",
        {
          detail: event.detail,
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  _showBrowseFromWorkflow(event) {
    event.stopPropagation();
    this._active = "browse";
  }

  render() {
    return html`
      <nav
        class="subnav"
        aria-label=${this.t(
          "inventory.views.label",
        )}
      >
        <button
          class=${this._active === "browse"
            ? "active"
            : ""}
          aria-current=${this._active ===
          "browse"
            ? "page"
            : "false"}
          @click=${() =>
            this._show("browse")}
        >
          ${this.t(
            "inventory.views.browse",
          )}
        </button>

        <button
          class=${this._active === "room"
            ? "active"
            : ""}
          aria-current=${this._active ===
          "room"
            ? "page"
            : "false"}
          @click=${() =>
            this._show("room")}
        >
          ${this.t(
            "inventory.views.room",
          )}
        </button>
      </nav>

      <section
        class="view"
        ?hidden=${this._active !==
        "browse"}
      >
        <bindhome-inventory-browser
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
          @assets-refreshed=${this
            ._forwardAssetsRefreshed}
        ></bindhome-inventory-browser>
      </section>

      <section
        class="view"
        ?hidden=${this._active !==
        "room"}
      >
        <bindhome-inventory-workflow
          .hass=${this.hass}
          .t=${this.t}
          .presets=${this.presets}
          .floors=${this.floors}
          .areas=${this.areas}
          .assets=${this.assets}
          @assets-refreshed=${this
            ._forwardAssetsRefreshed}
          @view-infrastructure=${this
            ._showBrowseFromWorkflow}
        ></bindhome-inventory-workflow>
      </section>
    `;
  }
}

customElements.define(
  "bindhome-inventory-section",
  BindHomeInventorySection,
);
