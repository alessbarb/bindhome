import { defineBindHomeElement } from "../custom-elements.js";
// @ts-check
import { LitElement, css, html, nothing } from "lit";
import { createBindHomeApi } from "../api/bindhome-api.js";
import { normalizeWsError } from "../api/normalize-ws-error.js";
import {
  LAST_BACKUP_PREFERENCE,
  readUserPreference,
  saveUserPreference,
} from "../api/user-preferences.js";
import { tokens } from "../styles/shared-styles.js";
import { downloadText } from "../utils/download.js";

function backupSummary(backup) {
  const registry = backup?.registry;
  if (!registry || typeof registry !== "object") return null;
  return {
    assets: Array.isArray(registry.assets) ? registry.assets.length : 0,
    relations: Array.isArray(registry.relations) ? registry.relations.length : 0,
    bindings: Array.isArray(registry.bindings) ? registry.bindings.length : 0,
    representations: Array.isArray(registry.representations)
      ? registry.representations.length
      : 0,
  };
}

export class BindHomeBackupRestoreTool extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    revision: { attribute: false },
    _lastBackup: { state: true },
    _recovery: { state: true },
    _restoreFileName: { state: true },
    _restoreBackup: { state: true },
    _restoreSummary: { state: true },
    _confirmed: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _success: { state: true },
  };

  constructor() {
    super();
    this.hass = null;
    /** @type {import("../types.js").Localizer} */
    this.t = (key) => key;
    this.revision = null;
    this._lastBackup = null;
    this._recovery = null;
    this._restoreFileName = "";
    this._restoreBackup = null;
    this._restoreSummary = null;
    this._confirmed = false;
    this._busy = false;
    this._error = null;
    this._success = null;
    this._loadedIdentity = null;
  }

  static styles = [
    tokens,
    css`
      :host { display: block; }
      .tool { padding: 20px; border-top: 1px solid var(--divider-color); }
      h2 { margin: 0 0 6px; font-size: 20px; font-weight: 500; }
      h3 { margin: 0 0 8px; font-size: 16px; font-weight: 500; }
      .muted { color: var(--secondary-text-color); }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
      .pane { min-width: 0; padding: 16px; border: 1px solid var(--divider-color); border-radius: 10px; }
      .actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
      button { min-height: 42px; padding: 0 15px; border: 0; border-radius: 8px; font: inherit; font-weight: 500; }
      button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      button.secondary { background: var(--secondary-background-color); color: var(--primary-text-color); }
      button.danger { background: var(--error-color); color: #fff; }
      button[disabled] { opacity: .5; cursor: default; }
      input[type="file"] { width: 100%; min-height: 42px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 8px; }
      .status { margin-top: 12px; padding: 11px 12px; border-radius: 8px; background: var(--secondary-background-color); }
      .warning { border-left: 4px solid var(--warning-color, #f9a825); }
      .error { color: var(--error-color); }
      .success { color: var(--success-color, #2e7d32); }
      .summary { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
      .pill { padding: 4px 8px; border-radius: 999px; background: var(--secondary-background-color); font-size: 12px; }
      .confirm { display: flex; align-items: flex-start; gap: 9px; margin-top: 14px; line-height: 20px; }
      .confirm input { margin-top: 3px; }
      @media (max-width: 760px) { .tool { padding: 16px 12px; } .grid { grid-template-columns: 1fr; } }
    `,
  ];

  updated(changed) {
    if (!changed.has("hass") || !this.hass) return;
    const identity = this.hass?.user?.id ?? "browser";
    if (identity === this._loadedIdentity) return;
    this._loadedIdentity = identity;
    void this._loadStatus();
  }

  _api() {
    return createBindHomeApi(this.hass);
  }

  async _loadStatus() {
    const identity = this._loadedIdentity;
    const [preference, recovery] = await Promise.all([
      readUserPreference(this.hass, LAST_BACKUP_PREFERENCE),
      this._api().getBackupRecoveryStatus().catch(() => null),
    ]);
    if (identity !== this._loadedIdentity) return;
    this._lastBackup =
      preference.available && typeof preference.value === "string"
        ? preference.value
        : null;
    this._recovery = recovery;
  }

  async _exportBackup() {
    if (!this.hass) return;
    this._busy = true;
    this._error = null;
    this._success = null;
    try {
      const response = await this._api().exportRegistryBackup();
      const text = `${JSON.stringify(response.backup, null, 2)}\n`;
      const date = new Date();
      const day = date.toISOString().slice(0, 10);
      downloadText(`bindhome-registry-backup-${day}.json`, text, "application/json;charset=utf-8");
      this._lastBackup = date.toISOString();
      await saveUserPreference(this.hass, LAST_BACKUP_PREFERENCE, this._lastBackup);
      this._success = this.t("backup.export_success");
    } catch (error) {
      this._error = normalizeWsError(error, this.t("backup.export_error")).message;
    } finally {
      this._busy = false;
    }
  }

  async _restoreFileSelected(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    this._error = null;
    this._success = null;
    this._confirmed = false;
    this._restoreFileName = file.name;
    try {
      const value = JSON.parse(await file.text());
      if (value?.format !== "bindhome.registry" || !value.registry) {
        throw new Error(this.t("backup.invalid_envelope"));
      }
      const summary = backupSummary(value);
      if (!summary) throw new Error(this.t("backup.invalid_envelope"));
      this._restoreBackup = value;
      this._restoreSummary = summary;
    } catch (error) {
      this._restoreBackup = null;
      this._restoreSummary = null;
      this._error = error instanceof Error ? error.message : this.t("backup.invalid_file");
    }
  }

  async _restore() {
    if (!this.hass || !this._restoreBackup || !this._confirmed) return;
    this._busy = true;
    this._error = null;
    this._success = null;
    try {
      const result = await this._api().restoreRegistryBackup({
        backup: this._restoreBackup,
        revision: this._recovery?.recovery_required ? null : this.revision,
      });
      this._confirmed = false;
      this._success = result.reloaded === false
        ? this.t("backup.restore_saved_reload_failed")
        : this.t("backup.restore_success");
      if (result.registry?.assets) {
        this.dispatchEvent(new CustomEvent("assets-refreshed", {
          detail: result.registry.assets,
          bubbles: true,
          composed: true,
        }));
      }
      await this._loadStatus();
    } catch (error) {
      const normalized = normalizeWsError(error, this.t("backup.restore_error"));
      this._error = normalized.code === "conflict"
        ? this.t("backup.conflict")
        : normalized.message;
    } finally {
      this._busy = false;
    }
  }

  _renderSummary() {
    const summary = this._restoreSummary;
    if (!summary) return nothing;
    return html`<div class="summary">
      <span class="pill">${this.t("backup.assets", { count: summary.assets })}</span>
      <span class="pill">${this.t("backup.relations", { count: summary.relations })}</span>
      <span class="pill">${this.t("backup.bindings", { count: summary.bindings })}</span>
      <span class="pill">${this.t("backup.representations", { count: summary.representations })}</span>
    </div>`;
  }

  render() {
    return html`<section class="tool">
      <h2>${this.t("backup.title")}</h2>
      <p class="muted">${this.t("backup.intro")}</p>
      ${this._recovery?.recovery_required
        ? html`<div class="status warning" role="alert">${this.t("backup.recovery_required")}</div>`
        : nothing}
      <div class="grid">
        <section class="pane">
          <h3>${this.t("backup.export_title")}</h3>
          <p class="muted">${this.t("backup.export_hint")}</p>
          <p>${this._lastBackup
            ? this.t("backup.last", { date: new Date(this._lastBackup).toLocaleString() })
            : this.t("backup.never")}</p>
          <div class="actions"><button class="primary" ?disabled=${this._busy} @click=${this._exportBackup}>${this.t("backup.download")}</button></div>
        </section>
        <section class="pane">
          <h3>${this.t("backup.restore_title")}</h3>
          <p class="muted">${this.t("backup.restore_warning")}</p>
          <input type="file" accept=".json,application/json" ?disabled=${this._busy} @change=${this._restoreFileSelected} />
          ${this._restoreFileName ? html`<p class="muted">${this._restoreFileName}</p>` : nothing}
          ${this._renderSummary()}
          ${this._restoreBackup ? html`
            <label class="confirm">
              <input type="checkbox" .checked=${this._confirmed} @change=${(event) => { this._confirmed = Boolean(event.currentTarget.checked); }} />
              <span>${this.t("backup.confirm_overwrite")}</span>
            </label>
            <div class="actions"><button class="danger" ?disabled=${this._busy || !this._confirmed} @click=${this._restore}>${this.t("backup.restore")}</button></div>
          ` : nothing}
        </section>
      </div>
      ${this._error ? html`<div class="status error" role="alert">${this._error}</div>` : nothing}
      ${this._success ? html`<div class="status success" role="status">${this._success}</div>` : nothing}
    </section>`;
  }
}

defineBindHomeElement("bindhome-backup-restore-tool", BindHomeBackupRestoreTool);
