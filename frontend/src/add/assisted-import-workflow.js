import { LitElement, css, html, nothing } from "lit";
import { defineBindHomeElement } from "../custom-elements.js";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import {
  createImportReviewState,
  importBatchReady,
  importBindingKey,
  importStatusKey,
  prioritizedMergeAssets,
  serializeImportDecisions,
  setImportAction,
  setImportCapabilities,
  setImportMergeTarget,
  toggleImportBinding,
  updateImportAsset,
} from "./import-review-state.js";

export class BindHomeAssistedImportWorkflow extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    contextAreaId: { attribute: false },
    _scope: { state: true },
    _areaId: { state: true },
    _reviewState: { state: true },
    _loading: { state: true },
    _saving: { state: true },
    _error: { state: true },
    _success: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.areas = [];
    this.assets = [];
    this.contextAreaId = null;
    this._scope = "all";
    this._areaId = "";
    this._reviewState = null;
    this._loading = false;
    this._saving = false;
    this._error = null;
    this._success = null;
    this._initializedContext = false;
  }

  willUpdate(changed) {
    if (!this._initializedContext && changed.has("contextAreaId")) {
      this._initializedContext = true;
      if (this.contextAreaId) {
        this._scope = "area";
        this._areaId = this.contextAreaId;
      }
    }
  }

  static styles = css`
    :host { display:block; margin-top:24px; }
    * { box-sizing:border-box; }
    h2, h3, p { margin:0; }
    button, input, select { font:inherit; color:inherit; }
    .surface { border:1px solid var(--divider-color); border-radius:12px; background:var(--card-background-color); }
    .intro { max-width:760px; color:var(--secondary-text-color); line-height:1.5; }
    .scope { max-width:760px; margin-top:20px; padding:20px; }
    .scope-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    label { display:block; font-size:14px; font-weight:500; }
    input, select { width:100%; min-height:44px; margin-top:7px; padding:8px 11px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); }
    input:focus-visible, select:focus-visible, button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    .actions { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }
    .button { min-height:42px; padding:0 16px; border:1px solid transparent; border-radius:8px; background:transparent; cursor:pointer; font-weight:500; }
    .button.primary { background:var(--primary-color); color:var(--text-primary-color, #fff); }
    .button.secondary { border-color:var(--primary-color); color:var(--primary-color); }
    .button.text { color:var(--primary-color); }
    .button:disabled { opacity:.5; cursor:not-allowed; }
    .review-head { margin-top:20px; display:flex; align-items:start; justify-content:space-between; gap:16px; }
    .review-copy { color:var(--secondary-text-color); margin-top:5px; }
    .proposal-list { display:grid; gap:14px; margin-top:18px; }
    .proposal { padding:18px; }
    .proposal-head { display:flex; justify-content:space-between; gap:16px; align-items:start; }
    .proposal-title { min-width:0; }
    .proposal-title h3 { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .source { margin-top:5px; color:var(--secondary-text-color); font-size:12px; line-height:1.45; overflow-wrap:anywhere; }
    .source-line { display:flex; align-items:center; gap:5px; margin-top:3px; }
    .source-line ha-icon { --mdc-icon-size:16px; }
    .status { flex:none; padding:4px 8px; border-radius:999px; background:var(--secondary-background-color); font-size:12px; font-weight:600; }
    .status.already_bound, .status.ambiguous { color:var(--warning-color, var(--primary-color)); }
    .candidate-bindings { margin-top:12px; display:grid; gap:4px; color:var(--secondary-text-color); font-size:12px; }
    .candidate-bindings strong { color:var(--primary-text-color); font-size:13px; }
    .warning { margin-top:14px; padding:11px 12px; border-left:3px solid var(--warning-color, var(--primary-color)); background:var(--secondary-background-color); font-size:13px; line-height:1.45; }
    .decision { margin-top:16px; display:flex; flex-wrap:wrap; gap:8px; }
    .decision button { min-height:38px; padding:0 13px; border:1px solid var(--divider-color); border-radius:8px; background:transparent; cursor:pointer; }
    .decision button.active { border-color:var(--primary-color); background:var(--primary-color); color:var(--text-primary-color, #fff); }
    .editor { margin-top:16px; padding-top:16px; border-top:1px solid var(--divider-color); }
    .editor-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .bindings { margin-top:16px; }
    .bindings h4 { margin:0 0 8px; font-size:14px; }
    .binding { display:grid; grid-template-columns:auto minmax(0, 1fr); align-items:start; gap:10px; padding:9px 0; border-top:1px solid var(--divider-color); }
    .binding input { width:auto; min-height:auto; margin:3px 0 0; }
    .binding strong, .binding span { display:block; }
    .binding span { color:var(--secondary-text-color); font-size:12px; overflow-wrap:anywhere; }
    .alert { margin-top:16px; padding:14px; border:1px solid var(--error-color, #db4437); border-radius:8px; color:var(--primary-text-color); }
    .alert strong { display:block; margin-bottom:4px; color:var(--error-color, #db4437); }
    .commit { position:sticky; bottom:0; margin-top:18px; padding:12px 0; background:var(--primary-background-color, var(--card-background-color)); border-top:1px solid var(--divider-color); display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .commit-copy { color:var(--secondary-text-color); font-size:13px; }
    .success { margin-top:24px; padding:28px; text-align:center; }
    .success ha-icon { color:var(--success-color, var(--primary-color)); --mdc-icon-size:48px; }
    .success h2 { margin-top:12px; }
    .success p { margin-top:6px; color:var(--secondary-text-color); }
    .success .actions { justify-content:center; }
    @media (max-width:700px) {
      .scope { padding:15px; }
      .scope-grid, .editor-grid { grid-template-columns:1fr; }
      .review-head, .proposal-head, .commit { align-items:stretch; flex-direction:column; }
      .proposal { padding:14px; }
      .status { align-self:flex-start; }
      .decision { display:grid; grid-template-columns:repeat(3, 1fr); }
      .decision button { padding-inline:6px; }
      .commit .button { width:100%; }
    }
  `;

  get _selectedAreaId() {
    return this._scope === "area" ? this._areaId || null : null;
  }

  async _discover() {
    if (this._loading || (this._scope === "area" && !this._areaId)) return;
    this._loading = true;
    this._error = null;
    this._success = null;
    try {
      const response = await createBindHomeApi(this.hass).discoverImport(
        this._selectedAreaId,
      );
      this._reviewState = createImportReviewState(response);
    } catch (error) {
      const normalized = normalizeWsError(error, this.t("import.discover_error"));
      this._error = normalized.message;
    } finally {
      this._loading = false;
    }
  }

  _setAction(proposalId, action) {
    this._reviewState = setImportAction(this._reviewState, proposalId, action);
    this._error = null;
  }

  _updateAsset(proposalId, changes) {
    this._reviewState = updateImportAsset(this._reviewState, proposalId, changes);
    this._error = null;
  }

  _toggleBinding(proposalId, binding) {
    this._reviewState = toggleImportBinding(
      this._reviewState,
      proposalId,
      binding,
    );
  }

  async _commit() {
    if (this._saving || !importBatchReady(this._reviewState)) return;
    this._saving = true;
    this._error = null;
    try {
      const response = await createBindHomeApi(this.hass).commitImport({
        areaId: this._reviewState.scope?.area_id ?? null,
        revision: this._reviewState.revision,
        decisions: serializeImportDecisions(this._reviewState),
      });
      this._success = response;
      this.dispatchEvent(
        new CustomEvent("assets-refreshed", {
          detail: response,
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      const normalized = normalizeWsError(error, this.t("import.commit_error"));
      this._error = normalized.message;
    } finally {
      this._saving = false;
    }
  }

  _startOver() {
    this._reviewState = null;
    this._error = null;
    this._success = null;
  }

  _areaFor(proposal) {
    return this.areas.find((area) => area.area_id === proposal.asset.area_id) ?? null;
  }

  render() {
    if (this._success) return this._renderSuccess();
    if (!this._reviewState) return this._renderScope();
    return this._renderReview();
  }

  _renderScope() {
    return html`
      <section>
        <h2>${this.t("import.title")}</h2>
        <p class="intro">${this.t("import.intro")}</p>
        <div class="scope surface">
          <div class="scope-grid">
            <label>
              ${this.t("import.scope")}
              <select
                .value=${this._scope}
                @change=${(event) => {
                  this._scope = event.target.value;
                  this._error = null;
                }}
              >
                <option value="all">${this.t("import.scope_all")}</option>
                <option value="area">${this.t("import.scope_area")}</option>
              </select>
            </label>
            ${this._scope === "area"
              ? html`<label>
                  ${this.t("common.area")}
                  <select
                    .value=${this._areaId}
                    @change=${(event) => (this._areaId = event.target.value)}
                  >
                    <option value="">${this.t("import.choose_area")}</option>
                    ${this.areas.map(
                      (area) => html`<option value=${area.area_id}>${area.name}</option>`,
                    )}
                  </select>
                </label>`
              : nothing}
          </div>
          ${this._error ? this._renderError() : nothing}
          <div class="actions">
            <button
              class="button primary"
              ?disabled=${this._loading || (this._scope === "area" && !this._areaId)}
              @click=${this._discover}
            >
              ${this._loading ? this.t("import.discovering") : this.t("import.discover")}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  _renderReview() {
    const state = this._reviewState;
    return html`
      <section>
        <div class="review-head">
          <div>
            <h2>${this.t("import.review_title", { count: state.reviews.length })}</h2>
            <p class="review-copy">${this.t("import.review_intro")}</p>
          </div>
          <button class="button text" ?disabled=${this._saving} @click=${this._startOver}>
            ${this.t("import.change_scope")}
          </button>
        </div>
        ${state.reviews.length === 0
          ? html`<div class="scope surface"><p>${this.t("import.empty")}</p></div>`
          : html`<div class="proposal-list">
              ${state.reviews.map((review) => this._renderProposal(review))}
            </div>`}
        ${this._error ? this._renderError() : nothing}
        ${state.reviews.length
          ? html`<div class="commit">
              <div class="commit-copy">${this.t("import.atomic")}</div>
              <button
                class="button primary"
                ?disabled=${this._saving || !importBatchReady(state)}
                @click=${this._commit}
              >
                ${this._saving ? this.t("import.committing") : this.t("import.commit")}
              </button>
            </div>`
          : nothing}
      </section>
    `;
  }

  _renderProposal(review) {
    const proposal = review.proposal;
    const entities = proposal.source?.entity_ids ?? [];
    const status = proposal.duplicate_status ?? "new";
    const area = this._areaFor(proposal);
    return html`
      <article class="proposal surface" data-proposal-id=${proposal.proposal_id}>
        <div class="proposal-head">
          <div class="proposal-title">
            <h3>${proposal.asset.name}</h3>
            <div class="source">
              <div>${this.t("import.source_entities")}: ${entities.length ? entities.join(", ") : this.t("common.not_set")}</div>
              ${proposal.source?.device_id
                ? html`<div>${this.t("import.source_device")}: ${proposal.source.device_id}</div>`
                : nothing}
              <div class="source-line">
                ${area?.icon ? html`<ha-icon icon=${area.icon}></ha-icon>` : nothing}
                <span>${this.t("import.proposed_area")}: ${area?.name ?? proposal.asset.area_id ?? this.t("common.none")}</span>
              </div>
            </div>
          </div>
          <span class="status ${status}">${this.t(importStatusKey(status))}</span>
        </div>
        ${(proposal.bindings ?? []).length
          ? html`<div class="candidate-bindings">
              <strong>${this.t("import.candidate_bindings")}</strong>
              ${(proposal.bindings ?? []).map(
                (binding) => html`<span>${binding.entity_id} → ${binding.capability} · ${binding.role ?? "primary"}</span>`,
              )}
            </div>`
          : nothing}
        ${status !== "new"
          ? html`<div class="warning">${this.t(`import.status_help.${status}`)}</div>`
          : nothing}
        <div class="decision" role="group" aria-label=${this.t("import.action_label")}>
          ${["create", "merge", "skip"].map(
            (action) => html`<button
              class=${review.action === action ? "active" : ""}
              aria-pressed=${review.action === action}
              @click=${() => this._setAction(proposal.proposal_id, action)}
            >${this.t(`import.action.${action}`)}</button>`,
          )}
        </div>
        ${review.action === "create" ? this._renderCreateEditor(review) : nothing}
        ${review.action === "merge" ? this._renderMergeEditor(review) : nothing}
      </article>
    `;
  }

  _renderCreateEditor(review) {
    const proposalId = review.proposal.proposal_id;
    return html`<div class="editor">
      <div class="editor-grid">
        <label>${this.t("fields.name")}<input
          .value=${review.asset.name}
          @input=${(event) => this._updateAsset(proposalId, { name: event.target.value })}
        /></label>
        <label>${this.t("fields.asset_type")}<input
          .value=${review.asset.asset_type}
          @input=${(event) => this._updateAsset(proposalId, { asset_type: event.target.value })}
        /></label>
        <label>${this.t("common.area")}<select
          .value=${review.asset.area_id}
          @change=${(event) => this._updateAsset(proposalId, { area_id: event.target.value })}
        >
          <option value="">${this.t("common.none")}</option>
          ${this.areas.map((area) => html`<option value=${area.area_id}>${area.name}</option>`)}
        </select></label>
        <label>${this.t("fields.capabilities")}<input
          .value=${review.asset.capabilities.join(", ")}
          @change=${(event) => {
            this._reviewState = setImportCapabilities(
              this._reviewState,
              proposalId,
              event.target.value,
            );
          }}
        /></label>
      </div>
      ${this._renderBindings(review)}
    </div>`;
  }

  _renderMergeEditor(review) {
    const proposalId = review.proposal.proposal_id;
    const choices = prioritizedMergeAssets(this.assets, review.proposal);
    return html`<div class="editor">
      <label>${this.t("import.merge_target")}<select
        .value=${review.targetAssetId}
        @change=${(event) => {
          this._reviewState = setImportMergeTarget(
            this._reviewState,
            proposalId,
            event.target.value,
          );
          this._error = null;
        }}
      >
        <option value="">${this.t("import.choose_asset")}</option>
        ${choices.map((asset) => html`<option value=${asset.id}>${asset.name}</option>`)}
      </select></label>
      ${this._renderBindings(review)}
    </div>`;
  }

  _renderBindings(review) {
    const bindings = review.proposal.bindings ?? [];
    if (!bindings.length) return nothing;
    return html`<div class="bindings">
      <h4>${this.t("import.bindings")}</h4>
      ${bindings.map((binding) => {
        const checked = review.selectedBindings.has(importBindingKey(binding));
        return html`<label class="binding">
          <input
            type="checkbox"
            .checked=${checked}
            @change=${() => this._toggleBinding(review.proposal.proposal_id, binding)}
          />
          <span>
            <strong>${binding.capability} · ${binding.role ?? "primary"}</strong>
            <span>${binding.entity_id}</span>
          </span>
        </label>`;
      })}
    </div>`;
  }

  _renderError() {
    return html`<div class="alert" role="alert">
      <strong>${this.t("errors.nothing_saved")}</strong>
      <span>${this._error}</span><br />
      <span>${this.t("import.review_preserved")}</span>
    </div>`;
  }

  _renderSuccess() {
    const result = this._success;
    return html`<section class="success surface">
      <ha-icon icon="mdi:check-circle-outline"></ha-icon>
      <h2>${this.t("import.success")}</h2>
      <p>${this.t("import.success_detail", {
        created: result.created ?? 0,
        merged: result.merged ?? 0,
        skipped: result.skipped ?? 0,
      })}</p>
      <div class="actions">
        <button class="button secondary" @click=${this._startOver}>
          ${this.t("import.run_again")}
        </button>
      </div>
    </section>`;
  }
}

defineBindHomeElement(
  "bindhome-assisted-import-workflow",
  BindHomeAssistedImportWorkflow,
);
