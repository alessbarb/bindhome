import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { NO_FLOOR_ID, areasForFloor } from "../api/home-assistant-api.js";
import {
  activeDrafts,
  createDraftState,
  filterAssetsByArea,
  groupExistingAssets,
  setPresetQuantity,
  updateDraft,
} from "./draft-state.js";
import { InventorySaveController } from "./inventory-controller.js";
import { pluralKey, presetDisplayName } from "../i18n/localize.js";

export class BindHomeInventoryWorkflow extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    presets: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    assets: { attribute: false },
    _step: { state: true },
    _floorId: { state: true },
    _areaId: { state: true },
    _draftState: { state: true },
    _openGroups: { state: true },
    _openDrafts: { state: true },
    _saveError: { state: true },
    _saving: { state: true },
    _success: { state: true },
    _confirmRoomChange: { state: true },
  };

  constructor() {
    super();
    this.presets = [];
    this.t = (key) => key;
    this.floors = [];
    this.areas = [];
    this.assets = [];
    this._step = "select";
    this._floorId = "";
    this._areaId = "";
    this._draftState = createDraftState();
    this._openGroups = new Set();
    this._openDrafts = new Set();
    this._saveError = null;
    this._saving = false;
    this._success = null;
    this._confirmRoomChange = false;
    this._controller = null;
  }

  willUpdate(changed) {
    if ((changed.has("presets") || changed.has("t")) && this.presets.length && this._activeDrafts.length === 0) {
      this._draftState = createDraftState(this._localizedPresets());
      this._openGroups = new Set([this.presets[0].group]);
    }
    if ((changed.has("hass") || changed.has("t")) && this.hass) {
      this._controller = new InventorySaveController(createBindHomeApi(this.hass), this.t("errors.batch_fallback"));
    }
  }

  static styles = css`
    :host { display: block; min-height: 100%; color: var(--primary-text-color); }
    * { box-sizing: border-box; }
    button, input, select { font: inherit; }
    button { color: inherit; }
    .content { max-width: 1200px; margin: 0 auto; padding: 28px 24px 104px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 24px; line-height: 32px; font-weight: 500; }
    h2 { font-size: 20px; line-height: 28px; font-weight: 500; }
    h3 { font-size: 16px; line-height: 24px; font-weight: 500; }
    .muted { color: var(--secondary-text-color); }
    .intro { margin-top: 6px; line-height: 22px; }
    .context { position: sticky; top: 0; z-index: 4; background: var(--card-background-color); border-bottom: 1px solid var(--divider-color); }
    .context-inner { max-width: 1200px; min-height: 66px; margin: auto; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .context-values { display: flex; align-items: center; gap: 28px; }
    .context-item { display: grid; grid-template-columns: 24px auto; column-gap: 10px; align-items: center; }
    .context-item ha-icon { grid-row: 1 / 3; color: var(--secondary-text-color); }
    .context-label { font-size: 12px; color: var(--secondary-text-color); }
    .context-value { font-size: 15px; font-weight: 500; }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 32px; align-items: start; }
    .selection { max-width: 720px; }
    .field-block { padding: 24px 0; border-bottom: 1px solid var(--divider-color); }
    label { display: block; font-size: 14px; font-weight: 500; }
    input, select { width: 100%; min-height: 44px; margin-top: 8px; padding: 9px 12px; color: var(--primary-text-color); background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 8px; }
    input:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    input[aria-invalid="true"] { border-color: var(--error-color, #db4437); outline: 2px solid var(--error-color, #db4437); }
    .helper, .field-error { margin-top: 6px; font-size: 13px; line-height: 18px; }
    .field-error { color: var(--error-color, #db4437); }
    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .button { min-height: 44px; padding: 0 18px; border-radius: 8px; border: 1px solid transparent; background: none; cursor: pointer; font-weight: 500; }
    .button.primary { color: var(--text-primary-color, #fff); background: var(--primary-color); }
    .button.secondary { color: var(--primary-color); border-color: var(--primary-color); }
    .button.text { color: var(--primary-color); }
    .button:disabled { cursor: not-allowed; opacity: .5; }
    .groups { margin-top: 26px; border-top: 1px solid var(--divider-color); }
    .group { border-bottom: 1px solid var(--divider-color); }
    .group-toggle { width: 100%; min-height: 56px; padding: 8px 4px; display: flex; align-items: center; gap: 10px; justify-content: space-between; border: 0; background: transparent; cursor: pointer; text-align: left; }
    .group-title { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .quantity-row { min-height: 68px; margin-left: 28px; padding: 10px 4px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-top: 1px solid var(--divider-color); }
    .preset-name { line-height: 22px; font-weight: 500; }
    .suggestions { margin-top: 2px; font-size: 12px; color: var(--secondary-text-color); }
    .stepper { height: 44px; display: grid; grid-template-columns: 44px 48px 44px; flex: none; border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden; background: var(--card-background-color); }
    .stepper button { border: 0; background: transparent; cursor: pointer; }
    .stepper button:hover { background: var(--secondary-background-color); }
    .stepper output { display: grid; place-items: center; border-inline: 1px solid var(--divider-color); font-weight: 500; }
    .rail { position: sticky; top: 92px; padding-left: 24px; border-left: 1px solid var(--divider-color); }
    .existing-summary { margin-top: 14px; border-block: 1px solid var(--divider-color); }
    .existing-group { padding: 13px 0; border-bottom: 1px solid var(--divider-color); }
    .existing-group:last-child { border-bottom: 0; }
    .existing-heading { display: flex; justify-content: space-between; gap: 12px; }
    .existing-list { margin: 6px 0 0; padding-left: 18px; color: var(--secondary-text-color); font-size: 13px; }
    .draft-count { margin-top: 20px; padding: 14px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); }
    .draft-count strong { display: block; margin-top: 4px; font-size: 22px; font-weight: 500; }
    .bottom-bar { position: fixed; z-index: 6; left: var(--mdc-drawer-width, 0); right: 0; bottom: 0; padding: 10px 24px calc(10px + env(safe-area-inset-bottom)); border-top: 1px solid var(--divider-color); background: var(--card-background-color); box-shadow: 0 -2px 4px rgba(0,0,0,.08); }
    .bottom-inner { max-width: 1200px; margin: auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .review-header, .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
    .existing-review { margin-top: 24px; padding: 16px 0; border-block: 1px solid var(--divider-color); }
    .drafts { margin-top: 28px; }
    .draft-row { border-bottom: 1px solid var(--divider-color); scroll-margin-top: 92px; }
    .draft-row.error { margin: 8px 0; padding: 0 12px; border: 2px solid var(--error-color, #db4437); border-radius: 8px; }
    .draft-summary { min-height: 62px; display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 12px; }
    .draft-number { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; background: var(--secondary-background-color); color: var(--secondary-text-color); font-size: 13px; }
    .draft-title { overflow: hidden; }
    .draft-title strong, .draft-title span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .draft-title span { margin-top: 2px; font-size: 12px; color: var(--secondary-text-color); }
    .draft-toggle { width: 44px; height: 44px; padding: 0; border: 0; background: transparent; cursor: pointer; }
    .draft-fields { padding: 0 0 20px 46px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .capabilities { grid-column: 1 / -1; }
    .capability-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .capability { min-height: 36px; display: inline-flex; align-items: center; gap: 4px; padding-left: 10px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); }
    .capability button { width: 36px; height: 36px; border: 0; background: transparent; cursor: pointer; }
    .add-capability { display: flex; align-items: end; gap: 8px; margin-top: 10px; }
    .add-capability label { flex: 1; }
    .alert { margin-bottom: 20px; padding: 15px; display: flex; gap: 12px; border: 1px solid var(--error-color, #db4437); border-radius: 8px; background: var(--card-background-color); }
    .alert ha-icon { color: var(--error-color, #db4437); }
    .success { min-height: 55vh; display: grid; place-items: center; text-align: center; }
    .success ha-icon { --mdc-icon-size: 52px; color: var(--success-color, var(--primary-color)); }
    .success h1 { margin-top: 14px; }
    .success .actions { justify-content: center; }
    .mobile-existing { display: none; }
    @media (max-width: 700px) {
      .content { padding: 20px 14px 104px; }
      .context-inner { padding: 8px 14px; min-height: 58px; }
      .context-values { gap: 14px; min-width: 0; }
      .context-item { grid-template-columns: auto; }
      .context-item ha-icon, .context-label { display: none; }
      .context-value { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .layout { display: block; }
      .rail { display: none; }
      .mobile-existing { display: block; margin-top: 20px; border-block: 1px solid var(--divider-color); }
      .mobile-existing summary { min-height: 52px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
      .mobile-existing .existing-summary { margin: 0 0 12px; border-top: 1px solid var(--divider-color); border-bottom: 0; }
      .quantity-row { min-height: 62px; margin-left: 0; gap: 8px; }
      .suggestions { display: none; }
      .stepper { grid-template-columns: 44px 40px 44px; }
      .bottom-bar { left: 0; padding-inline: 12px; }
      .bottom-copy { display: none; }
      .bottom-inner .button.primary { flex: 1; }
      .review-header { align-items: start; }
      .draft-fields { padding-left: 0; grid-template-columns: 1fr; }
      .capabilities { grid-column: auto; }
      .add-capability { align-items: stretch; flex-direction: column; }
      .add-capability .button { align-self: start; }
      .success .actions { flex-direction: column; }
      .success .button { width: 100%; }
    }
    @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
  `;

  get _selectedArea() { return this.areas.find((area) => area.area_id === this._areaId); }
  get _selectedFloor() { return this._floorId === NO_FLOOR_ID ? null : this.floors.find((floor) => floor.floor_id === this._floorId); }
  get _areaAssets() { return filterAssetsByArea(this.assets, this._areaId); }
  get _activeDrafts() { return activeDrafts(this._draftState); }
  _localizedPresets() { return this.presets.map((preset) => ({ ...preset, default_name: presetDisplayName(this.t, preset) })); }
  _groupLabel(group) { return this.t(`groups.${group}`) === `groups.${group}` ? group : this.t(`groups.${group}`); }
  _count(key, count) { return this.t(pluralKey(key, count), { count }); }

  _selectFloor(event) {
    this._floorId = event.target.value;
    const visibleAreas = areasForFloor(this.areas, this._floorId);
    if (!visibleAreas.some((area) => area.area_id === this._areaId)) this._areaId = "";
  }

  _continue() { if (this._areaId) this._step = "quantity"; }
  _changeQuantity(presetId, delta) {
    if (this._saving) return;
    const current = this._draftState.quantities.get(presetId) ?? 0;
    this._draftState = setPresetQuantity(this._draftState, presetId, current + delta);
    this._saveError = null;
  }
  _toggleGroup(group) {
    const next = new Set(this._openGroups);
    next.has(group) ? next.delete(group) : next.add(group);
    this._openGroups = next;
  }
  _toggleDraft(key) {
    const next = new Set(this._openDrafts);
    next.has(key) ? next.delete(key) : next.add(key);
    this._openDrafts = next;
  }
  _updateDraft(key, changes) {
    if (this._saving) return;
    const changedFields = Object.keys(changes);
    const draftIndex = this._activeDrafts.findIndex((draft) => draft.key === key);
    this._draftState = updateDraft(this._draftState, key, changes);
    if (!this._saveError?.structured || (this._saveError.index === draftIndex && changedFields.includes(this._saveError.field))) this._saveError = null;
  }
  _removeCapability(draft, capability) {
    this._updateDraft(draft.key, { capabilities: draft.capabilities.filter((item) => item !== capability) });
  }
  _addCapability(draft, input) {
    const value = input.value.trim();
    if (!value || draft.capabilities.includes(value)) return;
    this._updateDraft(draft.key, { capabilities: [...draft.capabilities, value] });
    input.value = "";
  }

  async _save() {
    if (this._saving || !this._controller || !this._activeDrafts.length) return;
    this._saving = true;
    this._saveError = null;
    const result = await this._controller.save(this._draftState, this._areaId);
    this._saving = false;
    if (result.duplicate) return;
    if (!result.ok) {
      this._saveError = result.error;
      this._step = "review";
      if (result.error.structured) {
        const draft = this._activeDrafts[result.error.index];
        if (draft) {
          this._openDrafts = new Set([...this._openDrafts, draft.key]);
          await this.updateComplete;
          const field = this.renderRoot.querySelector(`#${CSS.escape(this._fieldId(draft, result.error.field))}`) ?? this.renderRoot.querySelector(".alert");
          if (field?.classList.contains("alert")) field.setAttribute("tabindex", "-1");
          field?.scrollIntoView({ behavior: "smooth", block: "center" });
          field?.focus({ preventScroll: true });
        }
      }
      return;
    }
    const refreshedAssets = result.assets ?? [...this.assets, ...result.created];
    this.assets = refreshedAssets;
    this.dispatchEvent(new CustomEvent("assets-refreshed", { detail: refreshedAssets, bubbles: true, composed: true }));
    this._success = { count: result.created.length, areaName: this._selectedArea?.name ?? this.t("inventory.selected_area") };
    this._draftState = createDraftState(this._localizedPresets());
    this._openGroups = new Set([this.presets[0]?.group].filter(Boolean));
    this._openDrafts = new Set();
    this._step = "success";
  }

  _backToQuantities() {
    this._step = "quantity";
  }
  _requestRoomChange() {
    if (this._activeDrafts.length) { this._confirmRoomChange = true; return; }
    this._step = "select";
  }
  _discardAndChangeRoom() {
    this._draftState = createDraftState(this._localizedPresets());
    this._saveError = null;
    this._openDrafts = new Set();
    this._confirmRoomChange = false;
    this._floorId = "";
    this._areaId = "";
    this._step = "select";
  }
  _fieldId(draft, field) { return `${draft.key.replaceAll(":", "-")}-${field}`; }
  _fieldError(draftIndex, field) { return this._saveError?.structured && this._saveError.index === draftIndex && this._saveError.field === field; }

  _renderContext() {
    return html`<div class="context"><div class="context-inner">
      <div class="context-values">
        <div class="context-item"><ha-icon icon="mdi:layers-outline"></ha-icon><span class="context-label">${this.t("common.floor")}</span><span class="context-value">${this._selectedFloor?.name ?? this.t("common.no_floor")}</span></div>
        <div class="context-item"><ha-icon icon="mdi:floor-plan"></ha-icon><span class="context-label">${this.t("common.area")}</span><span class="context-value">${this._selectedArea?.name}</span></div>
      </div>
      <button class="button text" @click=${this._requestRoomChange} ?disabled=${this._saving}>${this.t("inventory.change_room")}</button>
    </div></div>`;
  }

  _renderSelection() {
    const floorOptions = [...this.floors, { floor_id: NO_FLOOR_ID, name: this.t("common.no_floor") }];
    const visibleAreas = areasForFloor(this.areas, this._floorId);
    return html`<div class="content selection">
      <h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.selection_intro")}</p>
      <div class="field-block"><label for="floor">${this.t("common.floor")}</label><select id="floor" .value=${this._floorId} @change=${this._selectFloor}><option value="">${this.t("inventory.select_floor")}</option>${floorOptions.map((floor) => html`<option value=${floor.floor_id}>${floor.name}</option>`)}</select><p class="muted helper">${this.t("inventory.no_floor_helper")}</p></div>
      <div class="field-block"><label for="area">${this.t("common.area")}</label><select id="area" .value=${this._areaId} @change=${(event) => (this._areaId = event.target.value)} ?disabled=${!this._floorId}><option value="">${this.t("inventory.select_area")}</option>${visibleAreas.map((area) => html`<option value=${area.area_id}>${area.name}</option>`)}</select>${this._floorId && !visibleAreas.length ? html`<p class="muted helper">${this.t("inventory.no_areas")}</p>` : nothing}</div>
      <div class="actions"><button class="button primary" @click=${this._continue} ?disabled=${!this._areaId}>${this.t("inventory.continue")}</button></div>
    </div>`;
  }

  _renderExisting() {
    const groups = groupExistingAssets(this._areaAssets, this.presets);
    if (!this._areaAssets.length) return html`<p class="muted helper">${this.t("inventory.no_existing")}</p>`;
    return html`<div class="existing-summary">${[...groups].map(([group, assets]) => html`<div class="existing-group"><div class="existing-heading"><strong>${this._groupLabel(group)}</strong><span class="muted">${assets.length}</span></div><ul class="existing-list">${assets.map((asset) => html`<li>${asset.name}</li>`)}</ul></div>`)}</div>`;
  }

  _renderQuantity() {
    const grouped = new Map();
    for (const preset of this.presets) grouped.set(preset.group, [...(grouped.get(preset.group) ?? []), preset]);
    return html`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content layout"><section><h1>${this.t("inventory.quantity_title")}</h1><p class="muted intro">${this.t("inventory.quantity_intro")}</p>
      <details class="mobile-existing"><summary><strong>${this.t("inventory.existing")}</strong><span class="muted">${this._areaAssets.length}</span></summary>${this._renderExisting()}</details>
      <div class="groups">${[...grouped].map(([group, presets]) => {
        const selected = presets.reduce((total, preset) => total + (this._draftState.quantities.get(preset.preset_id) ?? 0), 0);
        const open = this._openGroups.has(group);
        return html`<section class="group"><button class="group-toggle" @click=${() => this._toggleGroup(group)} aria-expanded=${open} aria-label=${this.t(open ? "actions.collapse_group" : "actions.expand_group", { group: this._groupLabel(group) })}><span class="group-title"><ha-icon icon=${open ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>${this._groupLabel(group)}</span><span class="muted">${this._count("counts.selected", selected)}</span></button>${open ? presets.map((preset) => {
          const quantity = this._draftState.quantities.get(preset.preset_id) ?? 0;
          const displayName = presetDisplayName(this.t, preset);
          return html`<div class="quantity-row"><div><div class="preset-name">${displayName}</div>${preset.suggested_capabilities?.length ? html`<div class="suggestions">${this.t("inventory.suggested", { capabilities: preset.suggested_capabilities.join(", ") })}</div>` : nothing}</div><div class="stepper"><button aria-label=${this.t("actions.decrease_quantity", { name: displayName })} @click=${() => this._changeQuantity(preset.preset_id, -1)} ?disabled=${quantity === 0 || this._saving}><ha-icon icon="mdi:minus"></ha-icon></button><output aria-live="polite">${quantity}</output><button aria-label=${this.t("actions.increase_quantity", { name: displayName })} @click=${() => this._changeQuantity(preset.preset_id, 1)} ?disabled=${this._saving}><ha-icon icon="mdi:plus"></ha-icon></button></div></div>`;
        }) : nothing}</section>`;
      })}</div></section><aside class="rail"><h2>${this.t("inventory.existing")}</h2><p class="muted helper">${this.t("inventory.existing_unchanged")}</p>${this._renderExisting()}<div class="draft-count"><span class="muted">${this.t("inventory.being_added")}</span><strong>${this._count("counts.asset", this._activeDrafts.length)}</strong><p class="muted helper">${this.t("inventory.not_saved_yet")}</p></div></aside></div>${this._renderBottom("quantity")}`;
  }

  _renderDraft(draft, index) {
    const open = this._openDrafts.has(draft.key) || ["name", "asset_type", "code", "capabilities"].some((field) => this._fieldError(index, field));
    const rowError = this._saveError?.structured && this._saveError.index === index;
    return html`<article class="draft-row ${rowError ? "error" : ""}" data-draft-index=${index}><div class="draft-summary"><span class="draft-number">${index + 1}</span><div class="draft-title"><strong>${draft.name}</strong><span>${draft.asset_type}</span></div><button class="draft-toggle" aria-label=${this.t(open ? "actions.collapse_draft" : "actions.edit_draft", { name: draft.name })} aria-expanded=${open} @click=${() => this._toggleDraft(draft.key)}><ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button></div>${open ? html`<div class="draft-fields">
      ${this._renderInput(draft, index, "name", this.t("fields.name"), draft.name)}
      ${this._renderInput(draft, index, "asset_type", this.t("fields.asset_type"), draft.asset_type)}
      ${this._renderInput(draft, index, "code", this.t("fields.code_optional"), draft.code ?? "")}
      <div class="capabilities"><label>${this.t("fields.capabilities")}</label><div class="capability-list">${draft.capabilities.length ? draft.capabilities.map((capability) => html`<span class="capability">${capability}<button aria-label=${this.t("actions.remove_capability", { capability })} @click=${() => this._removeCapability(draft, capability)} ?disabled=${this._saving}><ha-icon icon="mdi:close"></ha-icon></button></span>`) : html`<span class="muted helper">${this.t("fields.no_capabilities")}</span>`}</div><div class="add-capability"><label>${this.t("fields.custom_capability")}<input id=${this._fieldId(draft, "capabilities")} placeholder=${this.t("fields.capability_placeholder")} aria-invalid=${this._fieldError(index, "capabilities")} aria-describedby=${this._fieldError(index, "capabilities") ? `${this._fieldId(draft, "capabilities")}-error` : nothing} @keydown=${(event) => { if (event.key === "Enter") { event.preventDefault(); this._addCapability(draft, event.target); } }}></label><button class="button secondary" @click=${(event) => this._addCapability(draft, event.currentTarget.previousElementSibling.querySelector("input"))} ?disabled=${this._saving}>${this.t("common.add")}</button></div>${this._fieldError(index, "capabilities") ? html`<p class="field-error" id=${`${this._fieldId(draft, "capabilities")}-error`}>${this._saveError.message}</p>` : nothing}</div>
    </div>` : nothing}</article>`;
  }

  _renderInput(draft, index, field, label, value) {
    const error = this._fieldError(index, field);
    const id = this._fieldId(draft, field);
    return html`<label for=${id}>${label}<input id=${id} .value=${value} aria-invalid=${error} aria-describedby=${error ? `${id}-error` : nothing} @input=${(event) => this._updateDraft(draft.key, { [field]: field === "code" ? event.target.value || null : event.target.value })} ?disabled=${this._saving}>${error ? html`<span class="field-error" id=${`${id}-error`}>${this._saveError.message}</span>` : nothing}</label>`;
  }

  _renderReview() {
    return html`${this._renderContext()}${this._renderRoomChangeConfirmation()}<div class="content">${this._saveError ? html`<div class="alert" role="alert"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div><h3>${this.t("errors.nothing_saved")}</h3><p class="muted helper">${this._saveError.structured ? this.t("errors.correct_field") : (this._saveError.message || this.t("errors.batch_fallback"))} ${this.t("errors.drafts_preserved")}</p></div></div>` : nothing}<div class="review-header"><div><h1>${this._count("review.title", this._activeDrafts.length)}</h1><p class="muted intro">${this.t("review.intro")}</p></div></div><section class="existing-review"><div class="section-heading"><div><h2>${this.t("review.registered")}</h2><p class="muted helper">${this.t("review.registered_helper")}</p></div><strong>${this._areaAssets.length}</strong></div></section><section class="drafts"><div class="section-heading"><div><h2>${this.t("inventory.being_added")}</h2><p class="muted helper">${this.t("review.atomic_batch")}</p></div><strong>${this._activeDrafts.length}</strong></div><div>${this._activeDrafts.map((draft, index) => this._renderDraft(draft, index))}</div></section></div>${this._renderBottom("review")}`;
  }

  _renderRoomChangeConfirmation() {
    if (!this._confirmRoomChange) return nothing;
    return html`<div class="content"><section class="alert" role="alertdialog" aria-labelledby="change-room-title" aria-describedby="change-room-description"><ha-icon icon="mdi:alert-outline"></ha-icon><div><h3 id="change-room-title">${this.t("discard.title")}</h3><p class="muted helper" id="change-room-description">${this.t("discard.description")}</p><div class="actions"><button class="button secondary" @click=${() => (this._confirmRoomChange = false)}>${this.t("discard.stay")}</button><button class="button primary" @click=${this._discardAndChangeRoom}>${this.t("discard.confirm")}</button></div></div></section></div>`;
  }

  _renderBottom(step) {
    const count = this._activeDrafts.length;
    return html`<div class="bottom-bar" aria-busy=${this._saving}><div class="bottom-inner"><p class="muted bottom-copy">${step === "review" ? this._count("review.save_explanation", count) : this._count("review.before_save", count)}</p>${step === "review" ? html`<div><button class="button secondary" @click=${this._backToQuantities} ?disabled=${this._saving}>${this.t("review.back_quantities")}</button> <button class="button primary" @click=${this._save} ?disabled=${this._saving || !count}>${this._saving ? this.t("review.saving") : this._count("review.save", count)}</button></div>` : html`<button class="button primary" @click=${() => (this._step = "review")} ?disabled=${!count}>${this._count("review.review_items", count)}</button>`}</div></div>`;
  }

  _renderSuccess() {
    return html`${this._renderContext()}<div class="content success"><div><ha-icon icon="mdi:check-circle-outline"></ha-icon><h1>${this._count("success.created", this._success.count)}</h1><p class="intro">${this._success.areaName}</p><p class="muted intro">${this.t("success.explanation")}</p><div class="actions"><button class="button primary" @click=${() => (this._step = "quantity")}>${this.t("success.back")}</button><button class="button secondary" @click=${() => this.dispatchEvent(new CustomEvent("view-infrastructure", { bubbles: true, composed: true }))}>${this.t("success.view")}</button></div></div></div>`;
  }

  render() {
    if (!this.floors.length && !this.areas.length) return html`<div class="content selection"><h1>${this.t("inventory.title")}</h1><p class="muted intro">${this.t("inventory.no_floor_area")}</p></div>`;
    if (this._step === "select") return this._renderSelection();
    if (this._step === "quantity") return this._renderQuantity();
    if (this._step === "review") return this._renderReview();
    return this._renderSuccess();
  }
}

customElements.define("bindhome-inventory-workflow", BindHomeInventoryWorkflow);
