import { LitElement, css, html } from "lit";
import { createBindHomeApi } from "./api/bindhome-api.js";
import { createHomeAssistantApi } from "./api/home-assistant-api.js";
import { createLocalizer, loadPanelTranslations } from "./i18n/localize.js";
import "./infrastructure/infrastructure-inspector.js";
import "./inventory/inventory-section.js";

export class BindHomePanel extends LitElement {
  static properties = {
    hass: { attribute: false }, narrow: { type: Boolean }, route: { attribute: false }, panel: { attribute: false },
    _view: { state: true }, _loading: { state: true }, _error: { state: true }, _presets: { state: true },
    _floors: { state: true }, _areas: { state: true }, _assets: { state: true }, _registry: { state: true }, _refreshError: { state: true }, _t: { state: true },
  };
  constructor() { super(); this._view = "inventory"; this._loading = true; this._error = null; this._refreshError = null; this._presets = []; this._floors = []; this._areas = []; this._assets = []; this._registry = null; this._initialized = false; this._loadPromise = null; this._translationLanguage = null; this._t = createLocalizer(); }
  static styles = css`
    :host{display:block;height:100%;min-height:100vh;color:var(--primary-text-color,#212121);background:var(--primary-background-color,#fafafa);font-family:var(--paper-font-body1_-_font-family,Roboto,Noto,sans-serif)}*{box-sizing:border-box}.shell{min-height:100vh;display:flex;flex-direction:column}header{min-height:60px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 24px;border-bottom:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff)}.brand{display:flex;align-items:center;gap:10px}.brand ha-icon{color:var(--primary-color);--mdc-icon-size:28px}.brand h1{margin:0;font-size:20px;font-weight:500}nav{min-height:52px;display:flex;gap:4px;padding:0 20px;border-bottom:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff);overflow-x:auto}nav button{min-height:52px;padding:0 16px;border:0;border-bottom:3px solid transparent;background:transparent;color:var(--secondary-text-color);font:inherit;font-size:14px;font-weight:500;cursor:pointer}nav button.active{color:var(--primary-color);border-bottom-color:var(--primary-color)}nav button:focus-visible,.refresh:focus-visible{outline:2px solid var(--primary-color);outline-offset:-3px}main{flex:1;min-height:0}.view[hidden]{display:none}.refresh{width:44px;height:44px;border:0;border-radius:8px;color:var(--primary-color);background:transparent;cursor:pointer}.refresh-error{margin:12px 24px 0;padding:12px;border:1px solid var(--error-color,#db4437);border-radius:8px}.state{min-height:60vh;display:grid;place-items:center;padding:24px;text-align:center}.state-content{max-width:520px}.state h2{margin:0;font-size:22px;font-weight:500}.state p{color:var(--secondary-text-color);line-height:22px}.retry{min-height:44px;padding:0 18px;border:0;border-radius:8px;color:var(--text-primary-color,#fff);background:var(--primary-color);font:inherit;font-weight:500;cursor:pointer}.spinner{width:40px;height:40px;margin:0 auto 16px;border:4px solid var(--divider-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:600px){header{min-height:54px;padding:5px 14px}nav{padding:0 8px}nav button{padding-inline:12px}.refresh-error{margin-inline:14px}}@media(prefers-reduced-motion:reduce){.spinner{animation-duration:1.8s}}
  `;
  updated(changed) {
    if (changed.has("hass") && this.hass && !this._initialized && !this._loadPromise) this._load(true);
    else if (changed.has("hass") && this.hass && this._initialized && (this.hass.language || "en") !== this._translationLanguage) this._loadTranslations(this.hass.language || "en");
  }
  async _loadTranslations(language = this.hass?.language || "en") {
    const requestedLanguage = language || "en";
    const translator = await loadPanelTranslations(this.hass, requestedLanguage);
    if ((this.hass?.language || "en") === requestedLanguage) { this._t = translator; this._translationLanguage = requestedLanguage; }
  }
  async _load(initial = false) {
    if (!this.hass || this._loadPromise) return this._loadPromise;
    if (initial) this._loading = true;
    this._error = null; this._refreshError = null;
    const currentHass = this.hass; const bindhome = createBindHomeApi(currentHass); const ha = createHomeAssistantApi(currentHass);
    const language = currentHass.language || "en";
    this._loadPromise = Promise.all([bindhome.listPresets(), bindhome.listAssets(), bindhome.getRegistry(), ha.listFloors(), ha.listAreas(), loadPanelTranslations(currentHass, language)]);
    try {
      const [presets, assets, registry, floors, areas, translator] = await this._loadPromise;
      this._presets = presets; this._assets = assets; this._registry = registry; this._floors = floors; this._areas = areas; this._t = translator; this._translationLanguage = language;
    } catch (error) {
      const message = error?.message || this._t("shell.load_error_detail");
      if (initial || !this._initialized) this._error = message; else this._refreshError = message;
    }
    finally { this._initialized = true; this._loading = false; this._loadPromise = null; }
  }
  _assetsRefreshed(event) { this._assets = event.detail; if (this._registry) this._registry = { ...this._registry, assets: event.detail }; }
  render() {
    let content;
    const t = this._t;
    if (this._loading) content = html`<div class="state" aria-busy="true"><div class="state-content"><div class="spinner"></div><p>${t("shell.loading")}</p></div></div>`;
    else if (this._error) content = html`<div class="state"><div class="state-content"><h2>${t("shell.load_error")}</h2><p>${this._error}</p><button class="retry" @click=${() => this._load(true)}>${t("common.retry")}</button></div></div>`;
    else content = html`
      <section
        class="view"
        ?hidden=${this._view !== "inventory"}
      >
        <bindhome-inventory-section
          .hass=${this.hass}
          .t=${t}
          .presets=${this._presets}
          .floors=${this._floors}
          .areas=${this._areas}
          .assets=${this._assets}
          .registry=${this._registry ?? {}}
          @assets-refreshed=${this._assetsRefreshed}
        ></bindhome-inventory-section>
      </section>

      <section
        class="view"
        ?hidden=${this._view !== "infrastructure"}
      >
        <bindhome-infrastructure-inspector
          .t=${t}
          .registry=${this._registry ?? {}}
          .areas=${this._areas}
        ></bindhome-infrastructure-inspector>
      </section>
    `;
    return html`<div class="shell"><header><div class="brand"><ha-icon icon="mdi:home-switch"></ha-icon><h1>BindHome</h1></div><button class="refresh" aria-label=${t("shell.refresh_label")} @click=${() => this._load(false)} ?disabled=${this._loading || Boolean(this._loadPromise)}><ha-icon icon="mdi:refresh"></ha-icon></button></header><nav aria-label=${t("shell.sections_label")}><button class=${this._view === "inventory" ? "active" : ""} @click=${() => (this._view = "inventory")}>${t("nav.inventory")}</button><button class=${this._view === "infrastructure" ? "active" : ""} @click=${() => (this._view = "infrastructure")}>${t("nav.infrastructure")}</button></nav>${this._refreshError ? html`<div class="refresh-error" role="alert">${t("shell.refresh_error")} ${this._refreshError}</div>` : null}<main>${content}</main></div>`;
  }
}
customElements.define("bindhome-panel", BindHomePanel);
