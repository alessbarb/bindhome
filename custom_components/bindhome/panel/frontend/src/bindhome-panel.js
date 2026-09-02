import { LitElement, css, html } from "lit";
import { createBindHomeApi } from "./api/bindhome-api.js";
import { createHomeAssistantApi } from "./api/home-assistant-api.js";
import "./infrastructure/infrastructure-inspector.js";
import "./inventory/inventory-workflow.js";

export class BindHomePanel extends LitElement {
  static properties = {
    hass: { attribute: false }, narrow: { type: Boolean }, route: { attribute: false }, panel: { attribute: false },
    _view: { state: true }, _loading: { state: true }, _error: { state: true }, _presets: { state: true },
    _floors: { state: true }, _areas: { state: true }, _assets: { state: true }, _registry: { state: true }, _refreshError: { state: true },
  };
  constructor() { super(); this._view = "inventory"; this._loading = true; this._error = null; this._refreshError = null; this._presets = []; this._floors = []; this._areas = []; this._assets = []; this._registry = null; this._initialized = false; this._loadPromise = null; }
  static styles = css`
    :host{display:block;height:100%;min-height:100vh;color:var(--primary-text-color,#212121);background:var(--primary-background-color,#fafafa);font-family:var(--paper-font-body1_-_font-family,Roboto,Noto,sans-serif)}*{box-sizing:border-box}.shell{min-height:100vh;display:flex;flex-direction:column}header{min-height:60px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 24px;border-bottom:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff)}.brand{display:flex;align-items:center;gap:10px}.brand ha-icon{color:var(--primary-color);--mdc-icon-size:28px}.brand h1{margin:0;font-size:20px;font-weight:500}nav{min-height:52px;display:flex;gap:4px;padding:0 20px;border-bottom:1px solid var(--divider-color,#e0e0e0);background:var(--card-background-color,#fff);overflow-x:auto}nav button{min-height:52px;padding:0 16px;border:0;border-bottom:3px solid transparent;background:transparent;color:var(--secondary-text-color);font:inherit;font-size:14px;font-weight:500;cursor:pointer}nav button.active{color:var(--primary-color);border-bottom-color:var(--primary-color)}nav button:focus-visible,.refresh:focus-visible{outline:2px solid var(--primary-color);outline-offset:-3px}main{flex:1;min-height:0}.refresh{width:44px;height:44px;border:0;border-radius:8px;color:var(--primary-color);background:transparent;cursor:pointer}.refresh-error{margin:12px 24px 0;padding:12px;border:1px solid var(--error-color,#db4437);border-radius:8px}.state{min-height:60vh;display:grid;place-items:center;padding:24px;text-align:center}.state-content{max-width:520px}.state h2{margin:0;font-size:22px;font-weight:500}.state p{color:var(--secondary-text-color);line-height:22px}.retry{min-height:44px;padding:0 18px;border:0;border-radius:8px;color:var(--text-primary-color,#fff);background:var(--primary-color);font:inherit;font-weight:500;cursor:pointer}.spinner{width:40px;height:40px;margin:0 auto 16px;border:4px solid var(--divider-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:600px){header{min-height:54px;padding:5px 14px}nav{padding:0 8px}nav button{padding-inline:12px}.refresh-error{margin-inline:14px}}@media(prefers-reduced-motion:reduce){.spinner{animation-duration:1.8s}}
  `;
  updated(changed) { if (changed.has("hass") && this.hass && !this._initialized && !this._loadPromise) this._load(true); }
  async _load(initial = false) {
    if (!this.hass || this._loadPromise) return this._loadPromise;
    if (initial) this._loading = true;
    this._error = null; this._refreshError = null;
    const currentHass = this.hass; const bindhome = createBindHomeApi(currentHass); const ha = createHomeAssistantApi(currentHass);
    this._loadPromise = Promise.all([bindhome.listPresets(), bindhome.listAssets(), bindhome.getRegistry(), ha.listFloors(), ha.listAreas()]);
    try {
      const [presets, assets, registry, floors, areas] = await this._loadPromise;
      this._presets = presets; this._assets = assets; this._registry = registry; this._floors = floors; this._areas = areas;
    } catch (error) {
      const message = error?.message || "BindHome could not load its inventory data.";
      if (initial || !this._initialized) this._error = message; else this._refreshError = message;
    }
    finally { this._initialized = true; this._loading = false; this._loadPromise = null; }
  }
  _assetsRefreshed(event) { this._assets = event.detail; if (this._registry) this._registry = { ...this._registry, assets: event.detail }; }
  render() {
    let content;
    if (this._loading) content = html`<div class="state" aria-busy="true"><div class="state-content"><div class="spinner"></div><p>Loading BindHome inventory…</p></div></div>`;
    else if (this._error) content = html`<div class="state"><div class="state-content"><h2>BindHome could not load</h2><p>${this._error}</p><button class="retry" @click=${() => this._load(true)}>Retry</button></div></div>`;
    else if (this._view === "inventory") content = html`<bindhome-inventory-workflow .hass=${this.hass} .presets=${this._presets} .floors=${this._floors} .areas=${this._areas} .assets=${this._assets} @assets-refreshed=${this._assetsRefreshed} @view-infrastructure=${() => (this._view = "infrastructure")}></bindhome-inventory-workflow>`;
    else content = html`<bindhome-infrastructure-inspector .registry=${this._registry ?? {}} .areas=${this._areas}></bindhome-infrastructure-inspector>`;
    return html`<div class="shell"><header><div class="brand"><ha-icon icon="mdi:home-switch"></ha-icon><h1>BindHome</h1></div><button class="refresh" aria-label="Refresh BindHome data" @click=${() => this._load(false)} ?disabled=${this._loading || Boolean(this._loadPromise)}><ha-icon icon="mdi:refresh"></ha-icon></button></header><nav aria-label="BindHome sections"><button class=${this._view === "inventory" ? "active" : ""} @click=${() => (this._view = "inventory")}>Inventory</button><button class=${this._view === "infrastructure" ? "active" : ""} @click=${() => (this._view = "infrastructure")}>Infrastructure</button></nav>${this._refreshError ? html`<div class="refresh-error" role="alert">Refresh failed. Your current work was preserved. ${this._refreshError}</div>` : null}<main>${content}</main></div>`;
  }
}
customElements.define("bindhome-panel", BindHomePanel);
