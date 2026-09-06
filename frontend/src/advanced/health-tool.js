// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { defineBindHomeElement } from "../custom-elements.js";
import { tokens } from "../styles/shared-styles.js";

const ACTIONABLE_BINDING_STATUSES = new Set(["entity_not_found"]);
const UNBOUND_STATUS = "binding_not_found";
const DOCUMENTED_IMPORT_STATUS = "already_bound";

function countByStatus(records) {
  const counts = {};
  for (const record of records ?? []) {
    const key = record?.status ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export class BindHomeHealthTool extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    bindingStatuses: { attribute: false },
    _recovery: { state: true },
    _drift: { state: true },
    _referenceAudit: { state: true },
    _adoptionStatus: { state: true },
    _confirmRevertAll: { state: true },
    _loading: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    /** @type {(key: string, variables?: Record<string, string | number>) => string} */
    this.t = (key) => key;
    this.areas = [];
    this.assets = [];
    this.bindingStatuses = { records: [], summary: {} };
    this._recovery = null;
    this._drift = [];
    this._referenceAudit = null;
    this._adoptionStatus = null;
    this._confirmRevertAll = false;
    this._loading = false;
    this._error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hass) void this._refreshSupplementalHealth();
  }

  updated(changed) {
    if (changed.has("hass") && this.hass && changed.get("hass") !== this.hass) {
      void this._refreshSupplementalHealth();
    }
  }

  static styles = [
    tokens,
    css`
      :host { display: block; max-width: 1200px; margin: 24px auto 0; padding: 0 24px; }
      .card { border: 1px solid var(--divider-color); border-radius: 14px; background: var(--card-background-color); padding: 20px; }
      .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
      .head h2 { margin: 0; font-size: 20px; }
      .head p { margin: 6px 0 0; }
      .refresh { border: 0; background: transparent; color: var(--primary-color); min-height: 40px; }
      .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
      .metric { border: 1px solid var(--divider-color); border-radius: 10px; padding: 12px; }
      .metric strong { display: block; font-size: 22px; }
      .status-strip { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0; }
      .pill { border-radius: 999px; background: var(--secondary-background-color); padding: 6px 10px; font-size: 12px; }
      .section { margin-top: 22px; }
      .section h3 { margin: 0 0 8px; font-size: 16px; }
      .item { display: flex; justify-content: space-between; align-items: center; gap: 14px; border-top: 1px solid var(--divider-color); padding: 12px 0; }
      .item:first-of-type { border-top: 0; }
      .item-copy { min-width: 0; }
      .item-copy strong, .item-copy span { display: block; }
      .item-copy span { color: var(--secondary-text-color); margin-top: 3px; overflow-wrap: anywhere; }
      .reference-list { display: grid; gap: 6px; margin-top: 8px; }
      .reference { padding: 8px 10px; border-radius: 8px; background: var(--secondary-background-color); }
      .reference code { overflow-wrap: anywhere; }
      .action { flex: none; border: 0; border-radius: 8px; padding: 9px 12px; background: var(--primary-color); color: var(--text-primary-color, white); }
      .secondary-action { flex: none; border: 1px solid var(--divider-color); border-radius: 8px; padding: 9px 12px; background: transparent; color: var(--primary-text-color); }
      .confirm { padding: 12px; border: 1px solid var(--warning-color); border-radius: 8px; margin-top: 10px; }
      .confirm-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .ok { color: var(--success-color, var(--primary-color)); }
      .warning { color: var(--warning-color); }
      .error { color: var(--error-color); }
      .empty { color: var(--secondary-text-color); margin: 8px 0 0; }
      @media (max-width: 760px) {
        .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 600px) {
        :host { padding: 0 12px; }
        .summary { grid-template-columns: 1fr; }
        .item { align-items: flex-start; flex-direction: column; }
        .action, .secondary-action { width: 100%; }
      }
    `,
  ];

  _assetName(assetId) {
    return this.assets.find((asset) => asset.id === assetId)?.name ?? assetId;
  }

  _areaName(areaId) {
    if (!areaId) return this.t("health.no_area");
    return this.areas.find((area) => area.area_id === areaId)?.name ?? areaId;
  }

  _staleAreas() {
    const valid = new Set(this.areas.map((area) => area.area_id));
    return this.assets.filter((asset) => asset.area_id && !valid.has(asset.area_id));
  }

  _bindingRecords(status) {
    return (this.bindingStatuses?.records ?? []).filter((record) => record.status === status);
  }

  _actionableBindings() {
    return (this.bindingStatuses?.records ?? []).filter((record) => ACTIONABLE_BINDING_STATUSES.has(record.status));
  }

  _dispatch(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  _openAsset(assetId) {
    this._dispatch("health-open-asset", assetId);
  }

  _reviewImport(areaId) {
    this._dispatch("health-review-import", areaId || null);
  }

  _openRecovery() {
    this._dispatch("health-open-recovery", null);
  }

  async _refreshSupplementalHealth() {
    if (!this.hass || this._loading) return;
    this._loading = true;
    this._error = null;
    try {
      const api = createBindHomeApi(this.hass);
      const [recovery, discovery, referenceAudit, adoptionStatus] = await Promise.all([
        api.getBackupRecoveryStatus(),
        api.discoverImport(),
        api.auditDirectReferences(),
        api.getAdoptionStatus(),
      ]);
      this._recovery = recovery;
      this._referenceAudit = referenceAudit;
      this._adoptionStatus = adoptionStatus;
      const grouped = new Map();
      for (const proposal of discovery?.proposals ?? []) {
        if (proposal?.duplicate_status === DOCUMENTED_IMPORT_STATUS) continue;
        const areaId = proposal?.asset?.area_id ?? null;
        const count = Math.max(1, proposal?.source?.entity_ids?.length ?? proposal?.bindings?.length ?? 1);
        grouped.set(areaId, (grouped.get(areaId) ?? 0) + count);
      }
      this._drift = [...grouped.entries()]
        .map(([areaId, count]) => ({ areaId, count }))
        .sort((a, b) => this._areaName(a.areaId).localeCompare(this._areaName(b.areaId)));
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
    }
  }

  async _revertAllAdoptions() {
    if (!this.hass || this._loading) return;
    this._loading = true;
    this._error = null;
    try {
      this._adoptionStatus = await createBindHomeApi(this.hass).revertAllHardwareAdoptions();
      this._confirmRevertAll = false;
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
    }
  }

  _renderBindingItems(records, titleKey, detailKey) {
    return html`<div class="section">
      <h3>${this.t(titleKey)}</h3>
      ${records.length
        ? records.map((record) => html`<div class="item">
            <div class="item-copy">
              <strong>${this._assetName(record.asset_id)}</strong>
              <span>${this.t(detailKey, { capability: record.capability, entity: record.entity_id ?? "—" })}</span>
            </div>
            <button class="action" @click=${() => this._openAsset(record.asset_id)}>${this.t("health.open_asset")}</button>
          </div>`)
        : html`<p class="empty">${this.t("health.none")}</p>`}
    </div>`;
  }

  _renderSurfaceSummary() {
    const summary = this._adoptionStatus?.summary ?? {};
    return html`<div class="section">
      <h3>${this.t("health.surface_summary")}</h3>
      <p class="muted">${this.t("health.surface_summary_intro")}</p>
      <div class="summary">
        <div class="metric"><strong>${summary.logical_entities ?? 0}</strong><span>${this.t("health.logical_entities")}</span></div>
        <div class="metric"><strong>${summary.adopted_hardware ?? 0}</strong><span>${this.t("health.adopted_hardware")}</span></div>
        <div class="metric"><strong>${summary.bound_hardware_visible ?? 0}</strong><span>${this.t("health.bound_hardware_visible")}</span></div>
        <div class="metric"><strong>${summary.direct_reference_debt ?? 0}</strong><span>${this.t("health.direct_reference_debt")}</span></div>
      </div>
      ${summary.incomplete_reference_sources
        ? html`<p class="warning">${this.t("health.reference_sources_incomplete", { count: summary.incomplete_reference_sources })}</p>`
        : nothing}
      ${summary.adopted_hardware
        ? html`<button class="secondary-action" ?disabled=${this._loading} @click=${() => (this._confirmRevertAll = true)}>${this.t("health.revert_all_adoptions")}</button>`
        : nothing}
      ${this._confirmRevertAll
        ? html`<div class="confirm">
            <strong>${this.t("health.revert_all_title")}</strong>
            <p>${this.t("health.revert_all_confirm")}</p>
            <div class="confirm-actions">
              <button class="action" ?disabled=${this._loading} @click=${() => this._revertAllAdoptions()}>${this.t("common.confirm")}</button>
              <button class="secondary-action" ?disabled=${this._loading} @click=${() => (this._confirmRevertAll = false)}>${this.t("common.cancel")}</button>
            </div>
          </div>`
        : nothing}
    </div>`;
  }

  _renderReferenceDebt() {
    const groups = this._referenceAudit?.groups ?? [];
    const summary = this._referenceAudit?.summary ?? {};
    return html`<div class="section">
      <h3>${this.t("health.direct_references")}</h3>
      <p class="muted">${this.t("health.direct_references_intro")}</p>
      ${summary.incomplete_sources
        ? html`<p class="warning">${this.t("health.reference_sources_incomplete", { count: summary.incomplete_sources })}</p>`
        : nothing}
      ${groups.length
        ? groups.map((group) => html`<div class="item">
            <div class="item-copy">
              <strong>${group.entity_id}</strong>
              <span>${this.t("health.direct_reference_count", { count: group.reference_count })}</span>
              <div class="reference-list">
                ${(group.references ?? []).map((reference) => html`<div class="reference">
                  <strong>${reference.consumer_name || reference.consumer_id}</strong>
                  <span><code>${reference.consumer_id}</code> · <code>${reference.path}</code></span>
                  <span>${this.t(reference.classification === "deterministic_rewrite" ? "health.reference_deterministic" : "health.reference_manual")}${reference.replacement_entity_id ? ` · ${reference.replacement_entity_id}` : ""}</span>
                </div>`)}
              </div>
            </div>
          </div>`)
        : html`<p class="empty">${this.t("health.no_direct_references")}</p>`}
    </div>`;
  }

  render() {
    const summary = this.bindingStatuses?.summary ?? {};
    const records = this.bindingStatuses?.records ?? [];
    const byStatus = summary.by_status ?? countByStatus(records);
    const staleBindings = this._actionableBindings();
    const unbound = this._bindingRecords(UNBOUND_STATUS);
    const staleAreas = this._staleAreas();
    const referenceSummary = this._referenceAudit?.summary ?? {};
    const referenceCount = referenceSummary.references ?? 0;
    const actionableCount = staleBindings.length + unbound.length + staleAreas.length + (this._recovery?.recovery_required ? 1 : 0) + this._drift.reduce((sum, item) => sum + item.count, 0) + referenceCount;

    return html`<section class="card" aria-busy=${this._loading ? "true" : "false"}>
      <div class="head">
        <div>
          <h2>${this.t("health.title")}</h2>
          <p class="muted">${this.t("health.intro")}</p>
        </div>
        <button class="refresh" ?disabled=${this._loading} @click=${() => this._refreshSupplementalHealth()}>
          ${this.t(this._loading ? "health.refreshing" : "health.refresh")}
        </button>
      </div>

      <div class="summary">
        <div class="metric"><strong>${summary.total ?? records.length}</strong><span>${this.t("health.bindings_total")}</span></div>
        <div class="metric"><strong>${summary.config_valid ?? 0}</strong><span>${this.t("health.config_valid")}</span></div>
        <div class="metric"><strong>${summary.runtime_available ?? 0}</strong><span>${this.t("health.runtime_available")}</span></div>
        <div class="metric"><strong>${referenceCount}</strong><span>${this.t("health.direct_reference_debt")}</span></div>
      </div>
      <div class="status-strip">
        ${Object.entries(byStatus).map(([status, count]) => html`<span class="pill">${this.t(`health.status.${status}`)}: ${count}</span>`)}
      </div>
      <p class=${actionableCount ? "warning" : "ok"}>${this.t(actionableCount ? "health.actionable_count" : "health.all_clear", { count: actionableCount })}</p>

      ${this._renderSurfaceSummary()}

      ${this._recovery?.recovery_required
        ? html`<div class="section">
            <h3>${this.t("health.recovery_title")}</h3>
            <div class="item">
              <div class="item-copy"><strong class="error">${this.t("health.recovery_required")}</strong><span>${this.t("health.recovery_detail")}</span></div>
              <button class="action" @click=${() => this._openRecovery()}>${this.t("health.open_recovery")}</button>
            </div>
          </div>`
        : nothing}

      ${this._renderBindingItems(staleBindings, "health.stale_bindings", "health.stale_binding_detail")}
      ${this._renderBindingItems(unbound, "health.unbound_capabilities", "health.unbound_detail")}

      <div class="section">
        <h3>${this.t("health.stale_areas")}</h3>
        ${staleAreas.length
          ? staleAreas.map((asset) => html`<div class="item">
              <div class="item-copy"><strong>${asset.name}</strong><span>${this.t("health.stale_area_detail", { area: asset.area_id })}</span></div>
              <button class="action" @click=${() => this._openAsset(asset.id)}>${this.t("health.fix_asset")}</button>
            </div>`)
          : html`<p class="empty">${this.t("health.none")}</p>`}
      </div>

      <div class="section">
        <h3>${this.t("health.inverse_drift")}</h3>
        ${this._drift.length
          ? this._drift.map((item) => html`<div class="item">
              <div class="item-copy"><strong>${this._areaName(item.areaId)}</strong><span>${this.t("health.undocumented_entities", { count: item.count })}</span></div>
              <button class="action" @click=${() => this._reviewImport(item.areaId)}>${this.t("health.review_import")}</button>
            </div>`)
          : html`<p class="empty">${this.t("health.no_inverse_drift")}</p>`}
      </div>

      ${this._renderReferenceDebt()}

      ${this._error ? html`<p class="error" role="alert">${this.t("health.load_error", { error: this._error })}</p>` : nothing}
    </section>`;
  }
}

defineBindHomeElement("bindhome-health-tool", BindHomeHealthTool);
