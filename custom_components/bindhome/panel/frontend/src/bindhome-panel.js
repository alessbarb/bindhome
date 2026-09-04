// Typed contracts live in types.d.ts; shell race behavior is covered by regression tests.
import { LitElement, css, html } from "lit";
import { createBindHomeApi } from "./api/bindhome-api.js";
import { createHomeAssistantApi } from "./api/home-assistant-api.js";
import { createLocalizer, loadPanelTranslations } from "./i18n/localize.js";
import "./home/home-view.js";
import "./add/add-view.js";
import "./search/search-view.js";
import "./advanced/advanced-view.js";
export class BindHomePanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    route: { attribute: false },
    panel: { attribute: false },
    _view: { state: true },
    _loading: { state: true },
    _error: { state: true },
    _presets: { state: true },
    _floors: { state: true },
    _areas: { state: true },
    _assets: { state: true },
    _registry: { state: true },
    _bindingStatuses: { state: true },
    _entityRegistry: { state: true },
    _deviceRegistry: { state: true },
    _refreshError: { state: true },
    _t: { state: true },
    _contextAreaId: { state: true },
    _selectedAssetId: { state: true },
    _selectedAreaId: { state: true },
  };
  constructor() {
    super();
    this.hass = null;
    this.narrow = false;
    this.route = null;
    this.panel = null;
    this._view = "home";
    this._loading = true;
    this._error = null;
    this._refreshError = null;
    this._presets = [];
    this._floors = [];
    this._areas = [];
    this._assets = [];
    this._registry = null;
    this._bindingStatuses = { records: [], summary: {} };
    this._entityRegistry = [];
    this._deviceRegistry = [];
    this._initialized = false;
    this._loadPromise = null;
    this._translationLanguage = null;
    this._dataGeneration = 0;
    this._t = createLocalizer();
    this._contextAreaId = null;
    this._selectedAssetId = null;
    this._selectedAreaId = null;
  }
  static styles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 100vh;
      color: var(--primary-text-color, #212121);
      background: var(--primary-background-color, #fafafa);
      font-family: var(
        --paper-font-body1_-_font-family,
        Roboto,
        Noto,
        sans-serif
      );
    }
    * {
      box-sizing: border-box;
    }
    .shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .top {
      display: flex;
      align-items: center;
      min-height: 60px;
      padding: 0 20px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, #fff);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-right: 30px;
    }
    .brand ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 28px;
    }
    .brand h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .tabs {
      align-self: stretch;
      display: flex;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tabs::-webkit-scrollbar {
      display: none;
    }
    .tabs button {
      flex: none;
      min-width: 86px;
      min-height: 58px;
      padding: 0 16px;
      border: 0;
      border-bottom: 3px solid transparent;
      background: transparent;
      color: var(--secondary-text-color);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
    }
    .tabs button.active {
      color: var(--primary-text-color);
      border-bottom-color: var(--primary-color);
    }
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -3px;
    }
    .refresh {
      width: 44px;
      height: 44px;
      margin-left: auto;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--primary-color);
    }
    main {
      flex: 1;
      min-width: 0;
    }
    .view[hidden] {
      display: none;
    }
    .refresh-error {
      margin: 12px 24px 0;
      padding: 12px;
      border: 1px solid var(--error-color, #db4437);
      border-radius: 8px;
    }
    .state {
      min-height: 60vh;
      display: grid;
      place-items: center;
      padding: 24px;
      text-align: center;
    }
    .state-content {
      max-width: 520px;
    }
    .state h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }
    .state p {
      color: var(--secondary-text-color);
      line-height: 22px;
    }
    .retry {
      min-height: 44px;
      padding: 0 18px;
      border: 0;
      border-radius: 8px;
      color: var(--text-primary-color, #fff);
      background: var(--primary-color);
      font: inherit;
      font-weight: 500;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      border: 4px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (max-width: 650px) {
      .top {
        padding: 0 8px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 44px;
        grid-template-rows: 54px 50px;
      }
      .brand {
        margin: 0;
        padding-left: 6px;
      }
      .tabs {
        grid-column: 1/-1;
        grid-row: 2;
        order: 3;
        margin-inline: -8px;
        padding-inline: 4px;
        border-top: 1px solid var(--divider-color);
      }
      .tabs button {
        min-width: auto;
        flex: 1;
        min-height: 50px;
        padding-inline: 11px;
      }
      .refresh {
        grid-column: 2;
        grid-row: 1;
      }
      .refresh-error {
        margin-inline: 12px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }
  `;
  updated(changed) {
    if (
      changed.has("hass") &&
      this.hass &&
      !this._initialized &&
      !this._loadPromise
    )
      this._load(true);
    else if (
      changed.has("hass") &&
      this.hass &&
      this._initialized &&
      (this.hass.language || "en") !== this._translationLanguage
    )
      this._loadTranslations(this.hass.language || "en");
  }
  async _loadTranslations(language = this.hass?.language || "en") {
    const requestedLanguage = language || "en",
      translator = await loadPanelTranslations(this.hass, requestedLanguage);
    if ((this.hass?.language || "en") === requestedLanguage) {
      this._t = translator;
      this._translationLanguage = requestedLanguage;
    }
  }
  async _load(initial = false) {
    if (!this.hass || this._loadPromise) return this._loadPromise;
    const generation = ++this._dataGeneration;
    if (initial) this._loading = true;
    this._error = null;
    this._refreshError = null;
    const currentHass = this.hass,
      bindhome = createBindHomeApi(currentHass),
      ha = createHomeAssistantApi(currentHass),
      language = currentHass.language || "en";
    this._loadPromise = Promise.all([
      bindhome.listPresets(),
      bindhome.listAssets(),
      bindhome.getRegistry(),
      bindhome.listBindingStatuses(),
      ha.listFloors(),
      ha.listAreas(),
      ha.listEntityRegistry(),
      ha.listDeviceRegistry(),
      loadPanelTranslations(currentHass, language),
    ]);
    try {
      const [
        presets,
        assets,
        registry,
        bindingStatuses,
        floors,
        areas,
        entityRegistry,
        deviceRegistry,
        translator,
      ] = await this._loadPromise;
      if (generation !== this._dataGeneration) return;
      this._presets = presets;
      this._assets = assets;
      this._registry = registry;
      this._bindingStatuses = bindingStatuses;
      this._floors = floors;
      this._areas = areas;
      this._entityRegistry = entityRegistry;
      this._deviceRegistry = deviceRegistry;
      this._t = translator;
      this._translationLanguage = language;
    } catch (error) {
      const message = error?.message || this._t("shell.load_error_detail");
      if (initial || !this._initialized) this._error = message;
      else this._refreshError = message;
    } finally {
      this._initialized = true;
      this._loading = false;
      this._loadPromise = null;
    }
  }
  async _refreshBindingData() {
    if (!this.hass) return;
    const generation = ++this._dataGeneration;
    const api = createBindHomeApi(this.hass);
    const [registry, bindingStatuses] = await Promise.all([
      api.getRegistry(),
      api.listBindingStatuses(),
    ]);
    if (generation !== this._dataGeneration) return;
    this._registry = registry;
    this._assets = registry.assets ?? this._assets;
    this._bindingStatuses = bindingStatuses;
  }
  async _refreshTopologyData() {
    if (!this.hass) return;
    const generation = ++this._dataGeneration;
    const registry = await createBindHomeApi(this.hass).getRegistry();
    if (generation !== this._dataGeneration) return;
    this._registry = registry;
    this._assets = registry.assets ?? this._assets;
  }
  async _refreshAssets() {
    if (!this.hass) return;
    const generation = ++this._dataGeneration;
    const assets = await createBindHomeApi(this.hass).listAssets();
    if (generation !== this._dataGeneration) return;
    this._assets = assets;
    if (this._registry) this._registry = { ...this._registry, assets };
    return assets;
  }
  _assetsRefreshed(event) {
    this._assets = event.detail;
    if (this._registry)
      this._registry = { ...this._registry, assets: event.detail };
  }
  _navigate(view) {
    this._view = view;
    if (view !== "add") this._contextAreaId = null;
  }
  _homeNavigate(event) {
    this._selectedAreaId = event.detail.areaId;
    this._selectedAssetId = event.detail.assetId;
  }
  _openAsset(id) {
    const asset = this._assets.find((item) => item.id === id);
    this._selectedAssetId = id;
    this._selectedAreaId = asset?.area_id ?? null;
    this._view = "home";
  }
  _renderViews() {
    const common = {
      hass: this.hass,
      t: this._t,
      floors: this._floors,
      areas: this._areas,
      assets: this._assets,
      registry: this._registry ?? {},
      bindingStatuses: this._bindingStatuses,
      entityRegistry: this._entityRegistry,
      deviceRegistry: this._deviceRegistry,
      refreshBindingData: () => this._refreshBindingData(),
      refreshTopologyData: () => this._refreshTopologyData(),
    };
    return html`<section class="view" ?hidden=${this._view !== "home"}>
        <bindhome-home-view
          .hass=${common.hass}
          .t=${common.t}
          .floors=${common.floors}
          .areas=${common.areas}
          .assets=${common.assets}
          .registry=${common.registry}
          .bindingStatuses=${common.bindingStatuses}
          .entityRegistry=${common.entityRegistry}
          .deviceRegistry=${common.deviceRegistry}
          .refreshBindingData=${common.refreshBindingData}
          .refreshTopologyData=${common.refreshTopologyData}
          .selectedAssetId=${this._selectedAssetId}
          .selectedAreaId=${this._selectedAreaId}
          @home-navigate=${this._homeNavigate}
          @add-in-area=${(e) => {
            this._contextAreaId = e.detail;
            this._view = "add";
          }}
          @edit-asset=${() => (this._view = "advanced")}
        ></bindhome-home-view>
      </section>
      <section class="view" ?hidden=${this._view !== "add"}>
        <bindhome-add-view
          .hass=${this.hass}
          .t=${this._t}
          .presets=${this._presets}
          .areas=${this._areas}
          .contextAreaId=${this._contextAreaId}
          .onCreated=${async (created) => {
            const assets = await this._refreshAssets();
            const asset = created ?? assets?.at(-1);
            if (asset) this._openAsset(asset.id);
          }}
        ></bindhome-add-view>
      </section>
      <section class="view" ?hidden=${this._view !== "search"}>
        <bindhome-search-view
          .t=${this._t}
          .assets=${this._assets}
          .areas=${this._areas}
          .floors=${this._floors}
          @open-asset=${(e) => this._openAsset(e.detail)}
        ></bindhome-search-view>
      </section>
      <section class="view" ?hidden=${this._view !== "advanced"}>
        <bindhome-advanced-view
          .hass=${common.hass}
          .t=${common.t}
          .presets=${this._presets}
          .floors=${common.floors}
          .areas=${common.areas}
          .assets=${common.assets}
          .registry=${common.registry}
          .bindingStatuses=${common.bindingStatuses}
          .entityRegistry=${common.entityRegistry}
          .deviceRegistry=${common.deviceRegistry}
          .refreshBindingData=${common.refreshBindingData}
          .refreshTopologyData=${common.refreshTopologyData}
          @assets-refreshed=${this._assetsRefreshed}
        ></bindhome-advanced-view>
      </section>`;
  }
  render() {
    let content;
    if (this._loading)
      content = html`<div class="state" aria-busy="true">
        <div>
          <div class="spinner"></div>
          <p>${this._t("shell.loading")}</p>
        </div>
      </div>`;
    else if (this._error)
      content = html`<div class="state">
        <div class="state-content">
          <h2>${this._t("shell.load_error")}</h2>
          <p>${this._error}</p>
          <button class="retry" @click=${() => this._load(true)}>
            ${this._t("common.retry")}
          </button>
        </div>
      </div>`;
    else content = this._renderViews();
    return html`<div class="shell">
      <header class="top">
        <div class="brand">
          <ha-icon icon="mdi:home-switch"></ha-icon>
          <h1>BindHome</h1>
        </div>
        <nav class="tabs" aria-label=${this._t("shell.sections_label")}>
          ${["home", "add", "search", "advanced"].map(
            (view) =>
              html`<button
                class=${this._view === view ? "active" : ""}
                aria-current=${this._view === view ? "page" : "false"}
                @click=${() => this._navigate(view)}
              >
                ${this._t(`nav.${view}`)}
              </button>`,
          )}
        </nav>
        <button
          class="refresh"
          aria-label=${this._t("shell.refresh_label")}
          @click=${() => this._load(false)}
          ?disabled=${this._loading || Boolean(this._loadPromise)}
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
      </header>
      ${this._refreshError
        ? html`<div class="refresh-error" role="alert">
            ${this._t("shell.refresh_error")} ${this._refreshError}
          </div>`
        : null}
      <main>${content}</main>
    </div>`;
  }
}
customElements.define("bindhome-panel", BindHomePanel);
