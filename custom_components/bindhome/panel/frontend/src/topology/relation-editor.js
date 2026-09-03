import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import {
  RESULT_LIMIT,
  SUGGESTION_LIMIT,
  searchAssetCatalogue,
} from "./asset-catalogue.js";
import {
  relationTypeSuggestions,
  validRelationType,
} from "./relation-state.js";

export class BindHomeRelationEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    asset: { attribute: false },
    assets: { attribute: false },
    areas: { attribute: false },
    registry: { attribute: false },
    onRefresh: { attribute: false },
    onDone: { attribute: false },
    onSyncWarning: { attribute: false },
    _direction: { state: true },
    _type: { state: true },
    _other: { state: true },
    _search: { state: true },
    _saving: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();

    this.hass = null;
    this.t = (key) => key;
    this.asset = null;
    this.assets = [];
    this.areas = [];
    this.registry = {};
    this.onRefresh = null;
    this.onDone = null;
    this.onSyncWarning = null;

    this._direction = "outgoing";
    this._type = "";
    this._other = "";
    this._search = "";
    this._saving = false;
    this._error = null;

    this._identity = "";
    this._token = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this._resetIdentity();
  }

  willUpdate(changed) {
    if (!changed.has("asset")) return;

    const identity = this.asset?.id ?? "";

    if (
      this._identity &&
      identity !== this._identity
    ) {
      this._resetIdentity();
    }

    this._identity = identity;
  }

  _resetIdentity() {
    this._token += 1;
    this._direction = "outgoing";
    this._type = "";
    this._other = "";
    this._search = "";
    this._error = null;
    this._saving = false;
    this._identity = this.asset?.id ?? "";
  }

  _isCurrent(token, identity) {
    return (
      token === this._token &&
      this.asset?.id === identity
    );
  }

  _candidates() {
    const all = searchAssetCatalogue(
      this.assets.filter(
        (asset) => asset.id !== this.asset?.id,
      ),
      this._search,
      this.asset?.area_id,
      this.areas,
    );

    const limit = this._search.trim()
      ? RESULT_LIMIT
      : SUGGESTION_LIMIT;

    return {
      all,
      shown: all.slice(0, limit),
    };
  }

  async _save() {
    if (
      this._saving ||
      !this._other ||
      !validRelationType(this._type)
    ) {
      return;
    }

    const token = ++this._token;
    const identity = this.asset?.id;

    const source =
      this._direction === "outgoing"
        ? identity
        : this._other;

    const target =
      this._direction === "outgoing"
        ? this._other
        : identity;

    this._saving = true;
    this._error = null;

    try {
      await createBindHomeApi(
        this.hass,
      ).createRelation({
        sourceAssetId: source,
        relationType: this._type.trim(),
        targetAssetId: target,
      });

      if (!this._isCurrent(token, identity)) {
        return;
      }

      this._saving = false;

      /*
       * The remote write is committed at this point.
       * Close the draft before synchronizing the local snapshot.
       */
      this.onDone?.();

      try {
        await this.onRefresh?.();
      } catch {
        /*
         * The user may have navigated to another Asset while
         * refresh was pending. Never attach A's warning to B.
         */
        if (!this._isCurrent(token, identity)) {
          return;
        }

        this.onSyncWarning?.(
          this.t("topology.sync_warning"),
        );
      }
    } catch (error) {
      if (!this._isCurrent(token, identity)) {
        return;
      }

      this._error = normalizeWsError(
        error,
        this.t("topology.save_error"),
      ).message;

      this._saving = false;
    }
  }

  _cancel() {
    this.onDone?.();
  }

  render() {
    const { all, shown } = this._candidates();

    return html`
      <form
        class="editor"
        @submit=${(event) => {
          event.preventDefault();
          this._save();
        }}
      >
        <label>
          ${this.t("topology.direction")}

          <select
            .value=${this._direction}
            @change=${(event) => {
              this._direction =
                event.target.value;
            }}
          >
            <option value="outgoing">
              ${this.t(
                "topology.outgoing_direction",
              )}
            </option>

            <option value="incoming">
              ${this.t(
                "topology.incoming_direction",
              )}
            </option>
          </select>
        </label>

        <label>
          ${this.t("topology.relation_type")}

          <input
            .value=${this._type}
            @input=${(event) => {
              this._type = event.target.value;
            }}
            pattern="[a-z][a-z0-9_]*"
            required
            list="relation-types"
          />

          <datalist id="relation-types">
            ${relationTypeSuggestions(
              this.registry?.relations,
            ).map(
              (type) => html`
                <option value=${type}></option>
              `,
            )}
          </datalist>
        </label>

        <label>
          ${this.t("topology.other_asset")}

          <input
            .value=${this._search}
            @input=${(event) => {
              this._search =
                event.target.value;
            }}
            placeholder=${this.t(
              "topology.search_assets",
            )}
          />
        </label>

        <div class="candidates">
          ${shown.length
            ? shown.map(
                (candidate) => html`
                  <button
                    type="button"
                    class="candidate"
                    aria-pressed=${this._other ===
                    candidate.id
                      ? "true"
                      : "false"}
                    @click=${() => {
                      this._other =
                        candidate.id;

                      this._search =
                        candidate.name;
                    }}
                  >
                    <strong>
                      ${candidate.name}
                    </strong>

                    <span>
                      ${candidate.code ||
                      candidate.assetType}${candidate.areaName
                        ? ` · ${candidate.areaName}`
                        : ""}
                    </span>
                  </button>
                `,
              )
            : html`
                <p>
                  ${this.t(
                    "topology.no_matches",
                  )}
                </p>
              `}
        </div>

        ${all.length > shown.length
          ? html`
              <p class="count">
                ${this.t(
                  "topology.showing_results",
                  {
                    shown: shown.length,
                    total: all.length,
                  },
                )}
              </p>
            `
          : nothing}

        ${this._error
          ? html`
              <p
                class="error"
                role="alert"
              >
                ${this._error}
              </p>
            `
          : nothing}

        <div class="actions">
          <button
            type="button"
            @click=${this._cancel}
            ?disabled=${this._saving}
          >
            ${this.t("editor.cancel")}
          </button>

          <button
            type="submit"
            ?disabled=${this._saving ||
            !this._other ||
            !validRelationType(
              this._type,
            )}
          >
            ${this.t("editor.save")}
          </button>
        </div>
      </form>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .editor {
      display: grid;
      gap: 12px;
      padding: 12px 0;
    }

    label {
      display: grid;
      gap: 4px;
      font-size: 13px;
    }

    input,
    select {
      min-height: 40px;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      font: inherit;
    }

    .candidates {
      display: grid;
      gap: 6px;
    }

    .candidate {
      text-align: left;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 7px;
      background:
        var(--card-background-color);
      cursor: pointer;
    }

    .candidate span {
      display: block;
      color:
        var(--secondary-text-color);
      font-size: 12px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .actions button {
      min-height: 40px;
      padding: 0 14px;
    }

    .error {
      color: var(--error-color);
    }

    .count {
      font-size: 12px;
      color:
        var(--secondary-text-color);
    }
  `;
}

customElements.define(
  "bindhome-relation-editor",
  BindHomeRelationEditor,
);
