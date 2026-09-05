import {
  LitElement,
  css,
  html,
  nothing,
} from "lit";

import {
  createBindHomeApi,
} from "../api/bindhome-api.js";
import "./asset-connections.js";

import {
  normalizeWsError,
} from "../api/normalize-ws-error.js";

import {
  assetEditHasChanges,
  buildAssetUpdatePatch,
  createAssetEditDraft,
} from "./inventory-browser-state.js";

function snapshotAsset(asset) {
  return {
    ...asset,
    capabilities: [
      ...(asset.capabilities ?? []),
    ],
  };
}

export class BindHomeAssetDetailEditor
  extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    floors: { attribute: false },
    registry: { attribute: false },
    bindingStatuses: { attribute: false },
    entityRegistry: { attribute: false },
    deviceRegistry: { attribute: false },
    refreshBindingData: { attribute: false },
    refreshTopologyData: { attribute: false },

    _editing: { state: true },
    _draft: { state: true },
    _snapshot: { state: true },
    _saving: { state: true },
    _error: { state: true },
    _saved: { state: true },
    _newCapability: { state: true },
  };

  constructor() {
    super();

    this.hass = null;
    /** @type {import('../types.js').Localizer} */
    this.t = (key) => key;
    this.asset = null;
    this.assets = [];
    this.areas = [];
    this.floors = [];
    this.registry = {};
    this.bindingStatuses = { records: [], summary: {} };
    this.entityRegistry = [];
    this.deviceRegistry = [];
    this.refreshBindingData = null;
    this.refreshTopologyData = null;

    this._editing = false;
    this._draft = null;
    this._snapshot = null;
    this._saving = false;
    this._error = null;
    this._saved = false;
    this._newCapability = "";
  }

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input,
    select {
      font: inherit;
      color: inherit;
    }

    button {
      cursor: pointer;
    }

    h2,
    h3,
    p,
    dl,
    dd {
      margin: 0;
    }

    .back {
      min-height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--primary-color);
      font-weight: 500;
    }

    .back:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    .header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 16px;
      margin-top: 12px;
      padding-bottom: 18px;
      border-bottom: 1px solid
        var(--divider-color);
    }

    .title {
      min-width: 0;
    }

    .title h2 {
      overflow-wrap: anywhere;
      font-size: 22px;
      line-height: 30px;
      font-weight: 500;
    }

    .subtitle {
      margin-top: 4px;
      color: var(--secondary-text-color);
      line-height: 20px;
    }

    .button {
      min-height: 44px;
      padding: 0 18px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      font-weight: 500;
    }

    .button.primary {
      color:
        var(--text-primary-color, #fff);
      background: var(--primary-color);
    }

    .button.secondary {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .button.text {
      color: var(--primary-color);
    }

    .button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    button:focus-visible,
    input:focus-visible,
    select:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .notice,
    .error {
      margin-top: 16px;
      padding: 13px 14px;
      border-radius: 8px;
      line-height: 20px;
    }

    .notice {
      border: 1px solid var(--divider-color);
      background:
        var(--secondary-background-color);
    }

    .error {
      border: 1px solid
        var(--error-color, #db4437);
      color:
        var(--error-color, #db4437);
    }

    .saved {
      margin-top: 14px;
      color:
        var(--success-color, var(--primary-color));
      font-size: 14px;
      font-weight: 500;
    }

    .details,
    .form,
    .connections {
      margin-top: 24px;
    }

    .details h3,
    .form h3,
    .connections h3 {
      margin-bottom: 14px;
      font-size: 17px;
      line-height: 24px;
      font-weight: 500;
    }

    dl {
      display: grid;
      grid-template-columns: 170px minmax(0, 1fr);
      gap: 12px 18px;
    }

    dt {
      color: var(--secondary-text-color);
    }

    dd {
      overflow-wrap: anywhere;
    }

    .cap-list {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .cap {
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 7px;
      background:
        var(--secondary-background-color);
      font-size: 13px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .field {
      min-width: 0;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }

    input,
    select {
      width: 100%;
      min-height: 44px;
      margin-top: 7px;
      padding: 9px 11px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background:
        var(--card-background-color);
    }

    .helper {
      margin-top: 5px;
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 18px;
    }

    .editable-caps {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .editable-cap {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding-left: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background:
        var(--secondary-background-color);
    }

    .editable-cap button {
      width: 38px;
      height: 38px;
      padding: 0;
      border: 0;
      background: transparent;
    }

    .add-capability {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: end;
      margin-top: 10px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }

    .connection-grid {
      display: grid;
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
      gap: 14px;
      align-items: start;
    }

    .connection-card {
      min-width: 0;
      padding: 15px;
      border: 1px solid var(--divider-color);
      border-radius: 9px;
      background:
        var(--card-background-color);
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

    .connection-list li {
      padding: 8px 0;
      border-top: 1px solid
        var(--divider-color);
      overflow-wrap: anywhere;
      font-size: 13px;
      line-height: 19px;
    }

    .connection-list li:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .muted {
      color: var(--secondary-text-color);
    }

    .advanced {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
    }

    .advanced summary {
      min-height: 44px;
      display: flex;
      align-items: center;
      color: var(--secondary-text-color);
      cursor: pointer;
    }

    @media (max-width: 760px) {
      .header {
        align-items: stretch;
        flex-direction: column;
      }

      .header .button {
        align-self: start;
      }

      .grid {
        grid-template-columns: 1fr;
      }

      .field.full {
        grid-column: auto;
      }

      dl {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      dd {
        margin-bottom: 9px;
      }

      .connection-grid {
        grid-template-columns: 1fr;
      }

      .add-capability {
        grid-template-columns: 1fr;
      }

      .add-capability .button {
        justify-self: start;
      }

      .actions {
        flex-direction: column-reverse;
      }

      .actions .button {
        width: 100%;
      }
    }
  `;

  willUpdate(changed) {
    if (
      changed.has("asset") &&
      this.asset &&
      !this._editing
    ) {
      this._snapshot =
        snapshotAsset(this.asset);

      this._draft =
        createAssetEditDraft(this.asset);
    }
  }

  get _dirty() {
    if (
      !this._editing ||
      !this._snapshot ||
      !this._draft
    ) {
      return false;
    }

    return assetEditHasChanges(
      this._snapshot,
      this._draft,
    );
  }

  _emitEditing(editing) {
    this.dispatchEvent(
      new CustomEvent(
        "editing-changed",
        {
          detail: editing,
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  _startEdit() {
    this._snapshot =
      snapshotAsset(this.asset);

    this._draft =
      createAssetEditDraft(this.asset);

    this._editing = true;
    this._error = null;
    this._saved = false;
    this._newCapability = "";

    this._emitEditing(true);
  }

  _cancel() {
    this._draft =
      createAssetEditDraft(this.asset);

    this._snapshot =
      snapshotAsset(this.asset);

    this._editing = false;
    this._error = null;
    this._newCapability = "";

    this._emitEditing(false);
  }

  _close() {
    if (this._editing) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(
        "close",
        {
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  _updateField(field, value) {
    if (!this._draft || this._saving) {
      return;
    }

    this._draft = {
      ...this._draft,
      [field]: value,
    };

    this._error = null;
    this._saved = false;
  }

  _removeCapability(capability) {
    this._updateField(
      "capabilities",
      this._draft.capabilities.filter(
        (item) => item !== capability,
      ),
    );
  }

  _addCapability() {
    const value =
      this._newCapability.trim();

    if (
      !value ||
      this._draft.capabilities.includes(
        value,
      )
    ) {
      this._newCapability = "";
      return;
    }

    this._updateField(
      "capabilities",
      [
        ...this._draft.capabilities,
        value,
      ],
    );

    this._newCapability = "";
  }

  async _save(event = null) {
    event?.preventDefault();

    if (
      this._saving ||
      !this._snapshot ||
      !this._draft
    ) {
      return;
    }

    const patch =
      buildAssetUpdatePatch(
        this._snapshot,
        this._draft,
      );

    if (Object.keys(patch).length === 1) {
      this._editing = false;
      this._emitEditing(false);
      return;
    }

    const {
      asset_id: assetId,
      ...changes
    } = patch;

    this._saving = true;
    this._error = null;
    this._saved = false;

    try {
      const api =
        createBindHomeApi(this.hass);

      const updated =
        await api.updateAsset(
          assetId,
          changes,
        );

      this.asset = updated;
      this._snapshot =
        snapshotAsset(updated);
      this._draft =
        createAssetEditDraft(updated);
      this._editing = false;
      this._saved = true;

      this._emitEditing(false);

      this.dispatchEvent(
        new CustomEvent(
          "asset-updated",
          {
            detail: updated,
            bubbles: true,
            composed: true,
          },
        ),
      );
    } catch (error) {
      const normalized =
        normalizeWsError(
          error,
          this.t(
            "editor.save_error",
          ),
        );

      this._error =
        normalized.message ??
        this.t("editor.save_error");
    } finally {
      this._saving = false;
    }
  }

  _areaName(areaId) {
    if (!areaId) {
      return this.t(
        "browser.no_area",
      );
    }

    return (
      this.areas.find(
        (area) =>
          area.area_id === areaId,
      )?.name ??
      this.t(
        "infrastructure.unknown_area",
      )
    );
  }

  _renderAreaOptions() {
    const knownFloorIds =
      new Set(
        this.floors.map(
          (floor) => floor.floor_id,
        ),
      );

    const knownAreaIds =
      new Set(
        this.areas.map(
          (area) => area.area_id,
        ),
      );

    const staleAreaId =
      this._draft?.area_id &&
      !knownAreaIds.has(
        this._draft.area_id,
      )
        ? this._draft.area_id
        : null;

    const noFloorAreas =
      this.areas.filter(
        (area) =>
          !area.floor_id ||
          !knownFloorIds.has(
            area.floor_id,
          ),
      );

    return html`
      <option
        value=""
        ?selected=${!this._draft?.area_id}
      >
        ${this.t("browser.no_area")}
      </option>

      ${staleAreaId
        ? html`
            <option
              value=${staleAreaId}
              ?selected=${this._draft?.area_id === staleAreaId}
            >
              ${this.t(
                "editor.unknown_area_option",
                {
                  area_id:
                    staleAreaId,
                },
              )}
            </option>
          `
        : nothing}

      ${this.floors.map(
        (floor) => {
          const floorAreas =
            this.areas.filter(
              (area) =>
                area.floor_id ===
                floor.floor_id,
            );

          if (!floorAreas.length) {
            return nothing;
          }

          return html`
            <optgroup
              label=${floor.name}
            >
              ${floorAreas.map(
                (area) => html`
                  <option
                    value=${area.area_id}
                    ?selected=${this._draft?.area_id === area.area_id}
                  >
                    ${area.name}
                  </option>
                `,
              )}
            </optgroup>
          `;
        },
      )}

      ${noFloorAreas.length
        ? html`
            <optgroup
              label=${this.t(
                "common.no_floor",
              )}
            >
              ${noFloorAreas.map(
                (area) => html`
                  <option
                    value=${area.area_id}
                    ?selected=${this._draft?.area_id === area.area_id}
                  >
                    ${area.name}
                  </option>
                `,
              )}
            </optgroup>
          `
        : nothing}
    `;
  }

  _renderCapabilitiesReadOnly() {
    if (!this.asset.capabilities?.length) {
      return this.t("common.none");
    }

    return html`
      <div class="cap-list">
        ${this.asset.capabilities.map(
          (capability) => html`
            <span class="cap">
              ${capability}
            </span>
          `,
        )}
      </div>
    `;
  }

  _renderReadOnly() {
    return html`
      <section class="details">
        <h3>
          ${this.t(
            "editor.details",
          )}
        </h3>

        <dl>
          <dt>
            ${this.t(
              "fields.asset_type",
            )}
          </dt>
          <dd>
            ${this.asset.asset_type}
          </dd>

          <dt>
            ${this.t(
              "fields.code",
            )}
          </dt>
          <dd>
            ${this.asset.code ||
            this.t(
              "common.not_set",
            )}
          </dd>

          <dt>
            ${this.t(
              "common.area",
            )}
          </dt>
          <dd>
            ${this._areaName(
              this.asset.area_id,
            )}
          </dd>

          <dt>
            ${this.t(
              "fields.capabilities",
            )}
          </dt>
          <dd>
            ${this
              ._renderCapabilitiesReadOnly()}
          </dd>
        </dl>
      </section>
    `;
  }

  _renderForm() {
    return html`
      <form
        class="form"
        @submit=${this._save}
        aria-busy=${this._saving
          ? "true"
          : "false"}
      >
        <h3>
          ${this.t(
            "editor.edit_title",
          )}
        </h3>

        <p class="notice">
          ${this.t(
            "editor.identity_note",
          )}
        </p>

        ${this._error
          ? html`
              <div
                class="error"
                role="alert"
              >
                ${this._error}
              </div>
            `
          : nothing}

        <div class="grid">
          <div class="field">
            <label>
              ${this.t(
                "fields.name",
              )}
              <input
                required
                .value=${this._draft.name}
                ?disabled=${this._saving}
                @input=${(event) =>
                  this._updateField(
                    "name",
                    event.target.value,
                  )}
              />
            </label>
          </div>

          <div class="field">
            <label>
              ${this.t(
                "fields.asset_type",
              )}
              <input
                required
                .value=${this._draft
                  .asset_type}
                ?disabled=${this._saving}
                @input=${(event) =>
                  this._updateField(
                    "asset_type",
                    event.target.value,
                  )}
              />
            </label>
          </div>

          <div class="field">
            <label>
              ${this.t(
                "fields.code_optional",
              )}
              <input
                .value=${this._draft.code}
                ?disabled=${this._saving}
                @input=${(event) =>
                  this._updateField(
                    "code",
                    event.target.value,
                  )}
              />
            </label>
          </div>

          <div class="field">
            <label>
              ${this.t(
                "common.area",
              )}
              <select
                ?disabled=${this._saving}
                @change=${(event) =>
                  this._updateField(
                    "area_id",
                    event.target.value,
                  )}
              >
                ${this._renderAreaOptions()}
              </select>
            </label>
          </div>

          <div class="field full">
            <label>
              ${this.t(
                "fields.capabilities",
              )}
            </label>

            ${this._draft
              .capabilities.length
              ? html`
                  <div
                    class="editable-caps"
                  >
                    ${this._draft
                      .capabilities.map(
                        (capability) =>
                          html`
                            <span
                              class="editable-cap"
                            >
                              ${capability}

                              <button
                                type="button"
                                aria-label=${this.t(
                                  "actions.remove_capability",
                                  {
                                    capability,
                                  },
                                )}
                                ?disabled=${this._saving}
                                @click=${() =>
                                  this._removeCapability(
                                    capability,
                                  )}
                              >
                                <ha-icon
                                  icon="mdi:close"
                                ></ha-icon>
                              </button>
                            </span>
                          `,
                      )}
                  </div>
                `
              : html`
                  <p class="helper">
                    ${this.t(
                      "fields.no_capabilities",
                    )}
                  </p>
                `}

            <div class="add-capability">
              <label>
                ${this.t(
                  "fields.custom_capability",
                )}
                <input
                  .value=${this
                    ._newCapability}
                  placeholder=${this.t(
                    "fields.capability_placeholder",
                  )}
                  ?disabled=${this._saving}
                  @input=${(event) =>
                    (this._newCapability =
                      event.target.value)}
                  @keydown=${(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      this._addCapability();
                    }
                  }}
                />
              </label>

              <button
                type="button"
                class="button secondary"
                ?disabled=${this._saving}
                @click=${this
                  ._addCapability}
              >
                ${this.t(
                  "common.add",
                )}
              </button>
            </div>
          </div>
        </div>

        <div class="actions">
          <button
            type="button"
            class="button text"
            ?disabled=${this._saving}
            @click=${this._cancel}
          >
            ${this.t(
              "editor.cancel",
            )}
          </button>

          <button
            type="submit"
            class="button primary"
            ?disabled=${this._saving ||
            !this._dirty}
          >
            ${this._saving
              ? this.t(
                  "editor.saving",
                )
              : this.t(
                  "editor.save",
                )}
          </button>
        </div>
      </form>
    `;
  }

  _renderConnections() {
  return html`
    <bindhome-asset-connections
      .hass=${this.hass}
      .t=${this.t}
      .asset=${this.asset}
      .assets=${this.assets}
      .areas=${this.areas}
      .registry=${this.registry}
      .bindingStatuses=${this.bindingStatuses}
      .entityRegistry=${this.entityRegistry}
      .deviceRegistry=${this.deviceRegistry}
      .refreshBindingData=${this.refreshBindingData}
      .refreshTopologyData=${this.refreshTopologyData}
      @topology-sync-warning=${(event) => { this._error = event.detail; }}
    ></bindhome-asset-connections>
  `;
}

  render() {
    if (!this.asset) {
      return nothing;
    }

    return html`
      <button
        class="back"
        ?disabled=${this._editing}
        @click=${this._close}
      >
        ←
        ${this.t(
          "editor.back",
        )}
      </button>

      <div class="header">
        <div class="title">
          <h2>${this.asset.name}</h2>

          <p class="subtitle">
            ${this.t(
              "editor.subtitle",
            )}
          </p>
        </div>

        ${!this._editing
          ? html`
              <button
                class="button secondary"
                @click=${this
                  ._startEdit}
              >
                ${this.t(
                  "editor.edit",
                )}
              </button>
            `
          : nothing}
      </div>

      ${this._saved
        ? html`
            <p
              class="saved"
              role="status"
            >
              ${this.t(
                "editor.saved",
              )}
            </p>
          `
        : nothing}

      ${this._editing
        ? this._renderForm()
        : this._renderReadOnly()}

      ${this._renderConnections()}

      <details class="advanced">
        <summary>
          ${this.t(
            "infrastructure.advanced",
          )}
        </summary>

        <dl>
          <dt>
            ${this.t(
              "infrastructure.asset_id",
            )}
          </dt>
          <dd>${this.asset.id}</dd>
        </dl>
      </details>
    `;
  }
}

customElements.define(
  "bindhome-asset-detail-editor",
  BindHomeAssetDetailEditor,
);
