import { defineBindHomeElement } from "./custom-elements.js";
// Typed contracts live in types.d.ts; shell race behavior is covered by regression tests.
import { LitElement, css, html } from "lit";
import { createBindHomeApi } from "./api/bindhome-api.js";
import { createHomeAssistantApi } from "./api/home-assistant-api.js";
import { createLocalizer, loadPanelTranslations } from "./i18n/localize.js";
import { NO_AREA, STALE_AREA } from "./state/home-selectors.js";
import "./home/home-view.js";
import "./add/add-view.js";
import "./search/search-view.js";
import "./advanced/advanced-view.js";
import "./onboarding/onboarding-view.js";
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
    _advancedAssetId: { state: true },
    _addSessionId: { state: true },
    _advancedPinned: { state: true },
    _onboardingVisible: { state: true },
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
    this._advancedAssetId = null;
    this._addSessionId = 0;
    this._advancedPinned = false;
    this._advancedPreferenceIdentity = null;
    this._onboardingVisible = false;
    this._onboardingDismissed = false;
    this._onboardingPreferenceIdentity = null;
    this._hassByView = { home: null, add: null, advanced: null };
    this._refreshBindingDataHandler = () => this._refreshBindingData();
    this._refreshTopologyDataHandler = () => this._refreshTopologyData();
    this._refreshAssetsHandler = () => this._refreshAssets();
    this._addCreatedHandler = async (created) => {
      const assets = await this._refreshAssets();
      const asset = created ?? assets?.at(-1);
      if (asset) this._openAsset(asset.id);
    };
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
    * { box-sizing: border-box; }
    .shell { min-height: 100vh; display: flex; flex-direction: column; }
    .top {
      display: flex;
      align-items: center;
      min-height: 60px;
      padding: 0 20px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, #fff);
    }
    .brand { display: flex; align-items: center; gap: 9px; margin-right: 30px; }
    .brand ha-icon { color: var(--primary-color); --mdc-icon-size: 28px; }
    .brand h1 { margin: 0; font-size: 20px; font-weight: 500; }
    .tabs { align-self: stretch; display: flex; overflow-x: auto; scrollbar-width: none; }
    .tabs::-webkit-scrollbar { display: none; }
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
    .tabs button.active { color: var(--primary-text-color); border-bottom-color: var(--primary-color); }
    .tabs button.advanced[disabled] {
      color: var(--disabled-text-color, var(--secondary-text-color));
      opacity: 0.48;
      cursor: default;
      border-bottom-color: transparent;
    }
    .tabs .advanced-switch { flex: none; align-self: center; margin: 0 14px 0 4px; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: -3px; }
    .refresh {
      width: 44px;
      height: 44px;
      margin-left: auto;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--primary-color);
    }
    main { flex: 1; min-width: 0; }
    .onboarding-overlay {
      position: fixed;
      inset: 60px 0 0;
      z-index: 20;
      overflow: auto;
      background: var(--primary-background-color, #fafafa);
    }
    .view[hidden] { display: none; }
    .refresh-error {
      margin: 12px 24px 0;
      padding: 12px;
      border: 1px solid var(--error-color, #db4437);
      border-radius: 8px;
    }
    .state { min-height: 60vh; display: grid; place-items: center; padding: 24px; text-align: center; }
    .state-content { max-width: 520px; }
    .state h2 { margin: 0; font-size: 22px; font-weight: 500; }
    .state p { color: var(--secondary-text-color); line-height: 22px; }
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
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 650px) {
      .top {
        padding: 0 8px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 44px;
        grid-template-rows: 54px 50px;
      }
      .brand { margin: 0; padding-left: 6px; }
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
        padding-inline: 7px;
        font-size: 12px;
      }
      .tabs .advanced-switch {
        margin-inline: 4px 8px;
        transform: scale(0.88);
        transform-origin: center;
      }
      .refresh { grid-column: 2; grid-row: 1; }
      .refresh-error { margin-inline: 12px; }
      .onboarding-overlay { inset: 104px 0 0; }
    }
    @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
  `;
  updated(changed) {
    if (changed.has("hass")) {
      this._restoreAdvancedPreference();
      this._restoreOnboardingPreference();
    }
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
      this._syncOnboardingVisibility();
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
    this._syncOnboardingVisibility();
    return assets;
  }
  _assetsRefreshed(event) {
    this._assets = event.detail;
    if (this._registry)
      this._registry = { ...this._registry, assets: event.detail };
    this._syncOnboardingVisibility();
  }
  _navigate(view) {
    if (this._onboardingVisible) this._dismissOnboarding();
    if (view === "advanced" && !this._advancedPinned) return;
    if (view === "add") {
      this._openAdd(null);
      return;
    }
    if (this._view === "advanced" && view !== "advanced") this._advancedAssetId = null;
    this._view = view;
    if (view !== "add") this._contextAreaId = null;
  }
  _openAdd(contextAreaId = null) {
    this._addSessionId += 1;
    this._contextAreaId = contextAreaId;
    this._view = "add";
  }
  _advancedPreferenceKey() {
    return `bindhome.advanced-pinned.${this.hass?.user?.id ?? "browser"}`;
  }
  _restoreAdvancedPreference() {
    const identity = this._advancedPreferenceKey();
    if (identity === this._advancedPreferenceIdentity) return;
    this._advancedPreferenceIdentity = identity;
    try { this._advancedPinned = window.localStorage.getItem(identity) === "true"; }
    catch { this._advancedPinned = false; }
  }
  _setAdvancedPinned(pinned) {
    this._advancedPinned = pinned;
    try { window.localStorage.setItem(this._advancedPreferenceKey(), String(pinned)); } catch { /* Browser storage may be unavailable. */ }
    if (!pinned && this._view === "advanced") this._navigate("home");
  }
  _onboardingPreferenceKey() {
    return `bindhome.onboarding.v1.${this.hass?.user?.id ?? "browser"}`;
  }
  _restoreOnboardingPreference() {
    const identity = this._onboardingPreferenceKey();
    if (identity === this._onboardingPreferenceIdentity) return;
    this._onboardingPreferenceIdentity = identity;
    try {
      this._onboardingDismissed = window.localStorage.getItem(identity) === "true";
    } catch {
      this._onboardingDismissed = false;
    }
    this._syncOnboardingVisibility();
  }
  _syncOnboardingVisibility() {
    this._onboardingVisible =
      this._initialized &&
      !this._error &&
      this._assets.length === 0 &&
      !this._onboardingDismissed;
  }
  _dismissOnboarding() {
    this._onboardingDismissed = true;
    this._onboardingVisible = false;
    try {
      window.localStorage.setItem(this._onboardingPreferenceKey(), "true");
    } catch {
      /* Browser storage may be unavailable. */
    }
  }
  _completeOnboarding() {
    this._dismissOnboarding();
    this._contextAreaId = null;
    this._view = "home";
  }
  _homeNavigate(event) {
    this._selectedAreaId = event.detail.areaId;
    this._selectedAssetId = event.detail.assetId;
  }
  _openAsset(id) {
    const asset = this._assets.find((item) => item.id === id);
    this._selectedAssetId = id;
    this._selectedAreaId = !asset?.area_id
      ? NO_AREA
      : this._areas.some((area) => area.area_id === asset.area_id)
        ? asset.area_id
        : STALE_AREA;
    this._view = "home";
  }
  _editAsset(id) {
    if (!this._advancedPinned) return;
    this._advancedAssetId = id;
    this._view = "advanced";
  }
  _humanAssetCommitted(updated) {
    if (!updated?.id) return;
    this._assets = this._assets.map((asset) => asset.id === updated.id ? updated : asset);
    if (this._registry) this._registry = { ...this._registry, assets: this._assets };
    this._selectedAssetId = updated.id;
    this._selectedAreaId = !updated.area_id ? NO_AREA : this._areas.some((area) => area.area_id === updated.area_id) ? updated.area_id : STALE_AREA;
  }
  _hassFor(view) {
    if (this._view === view || this._hassByView[view] == null) {
      this._hassByView[view] = this.hass;
    }
    return this._hassByView[view];
  }
  _renderViews() {
    const common = {
      t: this._t,
      floors: this._floors,
      areas: this._areas,
      assets: this._assets,
      registry: this._registry ?? {},
      bindingStatuses: this._bindingStatuses,
      entityRegistry: this._entityRegistry,
      deviceRegistry: this._deviceRegistry,
      refreshBindingData: this._refreshBindingDataHandler,
      refreshTopologyData: this._refreshTopologyDataHandler,
    };
    return html`<section class="view" ?hidden=${this._view !== "home"}>
        <bindhome-home-view
          .hass=${this._hassFor("home")}
          .t=${common.t}
          .floors=${common.floors}
          .areas=${common.areas}
          .assets=${common.assets}
          .registry=${common.registry}
          .bindingStatuses=${common.bindingStatuses}
          .entityRegistry=${common.entityRegistry}
          .deviceRegistry=${common.deviceRegistry}
          .advancedEnabled=${this._advancedPinned}
          .refreshBindingData=${common.refreshBindingData}
          .refreshTopologyData=${common.refreshTopologyData}
          .refreshAssets=${this._refreshAssetsHandler}
          .selectedAssetId=${this._selectedAssetId}
          .selectedAreaId=${this._selectedAreaId}
          @home-navigate=${this._homeNavigate}
          @add-in-area=${(e) => this._openAdd(e.detail)}
          @open-advanced=${(event) => this._editAsset(event.detail)}
          @asset-committed=${(event) => this._humanAssetCommitted(event.detail)}
        ></bindhome-home-view>
      </section>
      <section class="view" ?hidden=${this._view !== "add"}>
        <bindhome-add-view
          .hass=${this._hassFor("add")}
          .t=${this._t}
          .presets=${this._presets}
          .floors=${this._floors}
          .areas=${this._areas}
          .assets=${this._assets}
          .contextAreaId=${this._contextAreaId}
          .sessionId=${this._addSessionId}
          .onCreated=${this._addCreatedHandler}
          @assets-refreshed=${this._assetsRefreshed}
          @go-home=${() => this._navigate("home")}
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
          .hass=${this._hassFor("advanced")}
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
          .selectedAssetId=${this._advancedAssetId}
          @assets-refreshed=${this._assetsRefreshed}
        ></bindhome-advanced-view>
      </section>`;
  }
  render() {
    let content;
    if (this._loading)
      content = html`<div class="state" aria-busy="true">
        <div><div class="spinner"></div><p>${this._t("shell.loading")}</p></div>
      </div>`;
    else if (this._error)
      content = html`<div class="state">
        <div class="state-content">
          <h2>${this._t("shell.load_error")}</h2>
          <p>${this._error}</p>
          <button class="retry" @click=${() => this._load(true)}>${this._t("common.retry")}</button>
        </div>
      </div>`;
    else content = this._renderViews();
    return html`<div class="shell">
      <header class="top">
        <div class="brand"><ha-icon icon="mdi:home-switch"></ha-icon><h1>BindHome</h1></div>
        <nav class="tabs" aria-label=${this._t("shell.sections_label")}>
          ${["home", "add", "search"].map(
            (view) => html`<button
              class=${this._view === view ? "active" : ""}
              aria-current=${this._view === view ? "page" : "false"}
              @click=${() => this._navigate(view)}
            >${this._t(`nav.${view}`)}</button>`,
          )}
          <button
            class=${this._view === "advanced" ? "advanced active" : "advanced"}
            aria-current=${this._view === "advanced" ? "page" : "false"}
            ?disabled=${!this._advancedPinned}
            @click=${() => this._navigate("advanced")}
          >${this._t("nav.advanced")}</button>
          <ha-switch
            class="advanced-switch"
            .checked=${this._advancedPinned}
            aria-label=${this._t(this._advancedPinned ? "nav.unpin_advanced" : "nav.pin_advanced")}
            title=${this._t(this._advancedPinned ? "nav.unpin_advanced" : "nav.pin_advanced")}
            @change=${(event) => this._setAdvancedPinned(Boolean(event.currentTarget.checked))}
          ></ha-switch>
        </nav>
        <button
          class="refresh"
          aria-label=${this._t("shell.refresh_label")}
          @click=${() => this._load(false)}
          ?disabled=${this._loading || Boolean(this._loadPromise)}
        ><ha-icon icon="mdi:refresh"></ha-icon></button>
      </header>
      ${this._refreshError
        ? html`<div class="refresh-error" role="alert">${this._t("shell.refresh_error")} ${this._refreshError}</div>`
        : null}
      <main>
        ${content}
        ${this._onboardingVisible
          ? html`<div class="onboarding-overlay">
              <bindhome-onboarding-view
                .t=${this._t}
                .floors=${this._floors}
                .areas=${this._areas}
                @onboarding-complete=${this._completeOnboarding}
              ></bindhome-onboarding-view>
            </div>`
          : null}
      </main>
    </div>`;
  }
}
defineBindHomeElement("bindhome-panel", BindHomePanel);
