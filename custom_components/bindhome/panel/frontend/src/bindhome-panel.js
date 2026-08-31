import { LitElement, html, css } from "lit";

export class BindHomePanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
      _loading: { type: Boolean },
      _error: { type: String },
      _registry: { type: Object },
      _currentView: { type: String },
      _selectedAssetId: { type: String },
      _filterQuery: { type: String },
      _filterType: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        height: 100vh;
        background-color: var(--primary-background-color, #fafafa);
        color: var(--primary-text-color, #212121);
        font-family: var(--paper-font-body1_-_font-family, Roboto, Noto, sans-serif);
        box-sizing: border-box;
      }

      .panel-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      header {
        background-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
        padding: 12px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 4px rgba(0,0,0,0.14);
        z-index: 1;
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-title h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .badge-v0 {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      nav {
        display: flex;
        gap: 4px;
        background: var(--card-background-color, #ffffff);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding: 0 16px;
        overflow-x: auto;
      }

      nav button {
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color, #727272);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      nav button:hover {
        color: var(--primary-color, #03a9f4);
      }

      nav button.active {
        color: var(--primary-color, #03a9f4);
        border-bottom-color: var(--primary-color, #03a9f4);
      }

      main {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }

      @media (max-width: 600px) {
        main {
          padding: 12px;
        }
        header {
          padding: 12px 16px;
        }
      }

      /* Utility & Component Styles */
      .card {
        background: var(--card-background-color, #ffffff);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        padding: 20px;
        margin-bottom: 20px;
      }

      .card h2 {
        margin-top: 0;
        font-size: 18px;
        color: var(--primary-text-color, #212121);
      }

      .grid-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
      }

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: var(--primary-color, #03a9f4);
      }

      .stat-label {
        font-size: 14px;
        color: var(--secondary-text-color, #727272);
        margin-top: 4px;
      }

      .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-right: 4px;
        margin-bottom: 4px;
      }

      .badge-infra {
        background-color: var(--accent-color, #e3f2fd);
        color: var(--primary-color, #1565c0);
        border: 1px solid rgba(21, 101, 192, 0.3);
      }

      .badge-ha {
        background-color: #f3e5f5;
        color: #7b1fa2;
        border: 1px solid rgba(123, 31, 162, 0.3);
      }

      .badge-capability {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .filter-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .filter-bar input, .filter-bar select {
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
        font-size: 14px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
      }

      .filter-bar input {
        flex: 1;
        min-width: 200px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }

      th, td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      th {
        background-color: var(--table-row-alternative-background-color, #f5f5f5);
        font-weight: 600;
        font-size: 13px;
        color: var(--secondary-text-color, #666);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      tr:hover {
        background-color: var(--table-row-hover-background-color, rgba(0,0,0,0.02));
      }

      .clickable-row {
        cursor: pointer;
      }

      /* State views */
      .center-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        text-align: center;
      }

      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border-left-color: var(--primary-color, #03a9f4);
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .error-box {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        width: 100%;
        box-sizing: border-box;
      }

      .empty-box {
        background-color: #f5f5f5;
        color: #616161;
        border: 1px dashed #bdbdbd;
        padding: 32px;
        border-radius: 8px;
        width: 100%;
        box-sizing: border-box;
      }

      .btn {
        background-color: var(--primary-color, #03a9f4);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }

      .btn-secondary {
        background-color: transparent;
        color: var(--primary-color, #03a9f4);
        border: 1px solid var(--primary-color, #03a9f4);
      }

      .detail-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }

      .detail-property {
        margin-bottom: 12px;
      }

      .detail-property label {
        font-size: 12px;
        color: var(--secondary-text-color, #777);
        text-transform: uppercase;
        display: block;
        margin-bottom: 4px;
      }

      .detail-property span {
        font-size: 16px;
        font-weight: 500;
      }

      .arrow {
        color: var(--secondary-text-color, #999);
        margin: 0 8px;
      }

      .asset-link {
        color: var(--primary-color, #03a9f4);
        text-decoration: none;
        cursor: pointer;
        font-weight: 500;
      }

      .asset-link:hover {
        text-decoration: underline;
      }
    `;
  }

  constructor() {
    super();
    this._loading = true;
    this._error = null;
    this._registry = null;
    this._currentView = "overview";
    this._selectedAssetId = null;
    this._filterQuery = "";
    this._filterType = "";
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchRegistry();
  }

  updated(changedProps) {
    if (changedProps.has("hass") && this.hass && !this._registry && !this._error && this._loading) {
      this._fetchRegistry();
    }
  }

  async _fetchRegistry() {
    if (!this.hass) return;
    this._loading = true;
    this._error = null;

    try {
      const response = await this.hass.callWS({
        type: "bindhome/registry/get",
      });
      this._registry = response;
      this._loading = false;
    } catch (err) {
      this._loading = false;
      this._error = err.message || "Failed to load BindHome registry via WebSocket.";
    }
  }

  _navigate(view, assetId = null) {
    this._currentView = view;
    if (assetId) {
      this._selectedAssetId = assetId;
    }
  }

  render() {
    return html`
      <div class="panel-container">
        <header>
          <div class="header-title">
            <h1>BindHome Panel</h1>
            <span class="badge-v0">Read-First V0</span>
          </div>
          <div>
            <button class="btn btn-secondary" style="color: white; border-color: white;" @click=${this._fetchRegistry}>
              Refresh
            </button>
          </div>
        </header>

        <nav>
          <button
            class=${this._currentView === "overview" ? "active" : ""}
            @click=${() => this._navigate("overview")}
          >
            Overview
          </button>
          <button
            class=${this._currentView === "assets" || this._currentView === "asset_detail" ? "active" : ""}
            @click=${() => this._navigate("assets")}
          >
            Assets
          </button>
          <button
            class=${this._currentView === "relations" ? "active" : ""}
            @click=${() => this._navigate("relations")}
          >
            Relations
          </button>
          <button
            class=${this._currentView === "bindings" ? "active" : ""}
            @click=${() => this._navigate("bindings")}
          >
            Bindings
          </button>
        </nav>

        <main>
          ${this._renderContent()}
        </main>
      </div>
    `;
  }

  _renderContent() {
    if (this._loading) {
      return html`
        <div class="center-state">
          <div class="spinner"></div>
          <p>Connecting to BindHome WebSocket API...</p>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="center-state">
          <div class="error-box">
            <h3>WebSocket Connection Error</h3>
            <p>${this._error}</p>
          </div>
          <button class="btn" @click=${this._fetchRegistry}>Retry Connection</button>
        </div>
      `;
    }

    if (!this._registry) {
      return html`
        <div class="center-state">
          <div class="error-box">
            <p>No registry data available.</p>
          </div>
        </div>
      `;
    }

    switch (this._currentView) {
      case "overview":
        return this._renderOverview();
      case "assets":
        return this._renderAssets();
      case "asset_detail":
        return this._renderAssetDetail();
      case "relations":
        return this._renderRelations();
      case "bindings":
        return this._renderBindings();
      default:
        return this._renderOverview();
    }
  }

  _renderOverview() {
    const assetsCount = this._registry.assets ? this._registry.assets.length : 0;
    const relationsCount = this._registry.relations ? this._registry.relations.length : 0;
    const bindingsCount = this._registry.bindings ? this._registry.bindings.length : 0;

    const isEmpty = assetsCount === 0 && relationsCount === 0 && bindingsCount === 0;

    return html`
      <div class="grid-stats">
        <div class="stat-card">
          <div class="stat-value">${assetsCount}</div>
          <div class="stat-label">Infrastructure Assets</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${relationsCount}</div>
          <div class="stat-label">Topology Relations</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${bindingsCount}</div>
          <div class="stat-label">Hardware Bindings</div>
        </div>
      </div>

      ${isEmpty
        ? html`
            <div class="empty-box center-state">
              <h3>Empty Registry</h3>
              <p>No assets, relations, or bindings have been registered in BindHome yet.</p>
            </div>
          `
        : html`
            <div class="card">
              <h2>Architecture Principle</h2>
              <p>
                BindHome models <strong>stable physical home infrastructure</strong> independently from replaceable Home Assistant hardware entities.
              </p>
              <div style="margin-top: 16px;">
                <span class="badge badge-infra">Stable Infrastructure Identity</span>
                <span class="arrow">&rarr;</span>
                <span class="badge badge-capability">Capability & Role</span>
                <span class="arrow">&rarr;</span>
                <span class="badge badge-ha">Replaceable HA Hardware Entity</span>
              </div>
            </div>

            <div class="card">
              <h2>Recent Assets</h2>
              ${assetsCount === 0
                ? html`<p>No assets found.</p>`
                : html`
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Type</th>
                          <th>Area</th>
                          <th>Capabilities</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this._registry.assets.slice(0, 5).map(
                          (asset) => html`
                            <tr class="clickable-row" @click=${() => this._navigate("asset_detail", asset.id)}>
                              <td><strong>${asset.name}</strong></td>
                              <td>${asset.code || "-"}</td>
                              <td><span class="badge badge-infra">${asset.asset_type}</span></td>
                              <td>${asset.area_id || "-"}</td>
                              <td>
                                ${(asset.capabilities || []).map(
                                  (c) => html`<span class="badge badge-capability">${c}</span>`
                                )}
                              </td>
                            </tr>
                          `
                        )}
                      </tbody>
                    </table>
                  `}
            </div>
          `}
    `;
  }

  _renderAssets() {
    const assets = this._registry.assets || [];
    if (assets.length === 0) {
      return html`
        <div class="empty-box center-state">
          <h3>No Assets Registered</h3>
          <p>There are no stable infrastructure assets in the registry.</p>
        </div>
      `;
    }

    const assetTypes = Array.from(new Set(assets.map((a) => a.asset_type)));

    const filteredAssets = assets.filter((asset) => {
      const q = this._filterQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        asset.name.toLowerCase().includes(q) ||
        (asset.code && asset.code.toLowerCase().includes(q)) ||
        asset.asset_type.toLowerCase().includes(q);

      const matchesType = !this._filterType || asset.asset_type === this._filterType;

      return matchesQuery && matchesType;
    });

    return html`
      <div class="card">
        <h2>Infrastructure Assets</h2>
        <div class="filter-bar">
          <input
            type="text"
            placeholder="Filter by name, code, or type..."
            .value=${this._filterQuery}
            @input=${(e) => (this._filterQuery = e.target.value)}
          />
          <select
            .value=${this._filterType}
            @change=${(e) => (this._filterType = e.target.value)}
          >
            <option value="">All Asset Types</option>
            ${assetTypes.map((t) => html`<option value=${t}>${t}</option>`)}
          </select>
        </div>

        ${filteredAssets.length === 0
          ? html`<p>No assets match the current filter criteria.</p>`
          : html`
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Area ID</th>
                    <th>Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredAssets.map(
                    (asset) => html`
                      <tr class="clickable-row" @click=${() => this._navigate("asset_detail", asset.id)}>
                        <td><strong>${asset.name}</strong></td>
                        <td>${asset.code || "-"}</td>
                        <td><span class="badge badge-infra">${asset.asset_type}</span></td>
                        <td>${asset.area_id || "-"}</td>
                        <td>
                          ${(asset.capabilities || []).map(
                            (c) => html`<span class="badge badge-capability">${c}</span>`
                          )}
                        </td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            `}
      </div>
    `;
  }

  _renderAssetDetail() {
    const assets = this._registry.assets || [];
    const asset = assets.find((a) => a.id === this._selectedAssetId);

    if (!asset) {
      return html`
        <div class="center-state">
          <div class="error-box">
            <h3>Asset Not Found</h3>
            <p>The requested asset ID "${this._selectedAssetId}" does not exist in the registry.</p>
          </div>
          <button class="btn" @click=${() => this._navigate("assets")}>Back to Assets List</button>
        </div>
      `;
    }

    const relations = (this._registry.relations || []).filter(
      (r) => r.source_asset_id === asset.id || r.target_asset_id === asset.id
    );

    const bindings = (this._registry.bindings || []).filter((b) => b.asset_id === asset.id);

    const getAssetName = (id) => {
      const target = assets.find((a) => a.id === id);
      return target ? target.name : id;
    };

    return html`
      <div class="detail-header">
        <button class="btn btn-secondary" @click=${() => this._navigate("assets")}>&larr; Back</button>
        <h2 style="margin: 0;">Asset: ${asset.name}</h2>
      </div>

      <div class="card">
        <h2>Infrastructure Specification</h2>
        <div class="detail-property">
          <label>Stable Infrastructure ID</label>
          <span>${asset.id}</span>
        </div>
        <div class="detail-property">
          <label>Asset Name</label>
          <span>${asset.name}</span>
        </div>
        <div class="detail-property">
          <label>Human Code</label>
          <span>${asset.code || "None"}</span>
        </div>
        <div class="detail-property">
          <label>Asset Type</label>
          <span><span class="badge badge-infra">${asset.asset_type}</span></span>
        </div>
        <div class="detail-property">
          <label>Area ID</label>
          <span>${asset.area_id || "None"}</span>
        </div>
        <div class="detail-property">
          <label>Capabilities</label>
          <div>
            ${(asset.capabilities || []).length === 0
              ? html`<span>None</span>`
              : asset.capabilities.map((c) => html`<span class="badge badge-capability">${c}</span>`)}
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Topology Relations</h2>
        ${relations.length === 0
          ? html`<p>No topology relations connected to this asset.</p>`
          : html`
              <table>
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>Relation Type</th>
                    <th>Connected Asset</th>
                  </tr>
                </thead>
                <tbody>
                  ${relations.map((r) => {
                    const isSource = r.source_asset_id === asset.id;
                    const otherId = isSource ? r.target_asset_id : r.source_asset_id;
                    return html`
                      <tr>
                        <td>${isSource ? "Outgoing (\u2192)" : "Incoming (\u2190)"}</td>
                        <td><strong>${r.relation_type}</strong></td>
                        <td>
                          <span
                            class="asset-link"
                            @click=${() => this._navigate("asset_detail", otherId)}
                          >
                            ${getAssetName(otherId)}
                          </span>
                        </td>
                      </tr>
                    `;
                  })}
                </tbody>
              </table>
            `}
      </div>

      <div class="card">
        <h2>Hardware Bindings</h2>
        ${bindings.length === 0
          ? html`<p>No hardware bindings set for this asset.</p>`
          : html`
              <table>
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Role</th>
                    <th>Bound HA Entity</th>
                  </tr>
                </thead>
                <tbody>
                  ${bindings.map(
                    (b) => html`
                      <tr>
                        <td><span class="badge badge-capability">${b.capability}</span></td>
                        <td>${b.role}</td>
                        <td><span class="badge badge-ha">${b.entity_id}</span></td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            `}
      </div>
    `;
  }

  _renderRelations() {
    const relations = this._registry.relations || [];
    const assets = this._registry.assets || [];

    if (relations.length === 0) {
      return html`
        <div class="empty-box center-state">
          <h3>No Topology Relations</h3>
          <p>There are no directed relations connecting assets in the registry.</p>
        </div>
      `;
    }

    const getAssetName = (id) => {
      const asset = assets.find((a) => a.id === id);
      return asset ? asset.name : id;
    };

    return html`
      <div class="card">
        <h2>Topology Relations</h2>
        <table>
          <thead>
            <tr>
              <th>Source Asset</th>
              <th>Relation Type</th>
              <th>Target Asset</th>
            </tr>
          </thead>
          <tbody>
            ${relations.map(
              (r) => html`
                <tr>
                  <td>
                    <span class="asset-link" @click=${() => this._navigate("asset_detail", r.source_asset_id)}>
                      ${getAssetName(r.source_asset_id)}
                    </span>
                  </td>
                  <td><strong>${r.relation_type}</strong></td>
                  <td>
                    <span class="asset-link" @click=${() => this._navigate("asset_detail", r.target_asset_id)}>
                      ${getAssetName(r.target_asset_id)}
                    </span>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  _renderBindings() {
    const bindings = this._registry.bindings || [];
    const assets = this._registry.assets || [];

    if (bindings.length === 0) {
      return html`
        <div class="empty-box center-state">
          <h3>No Hardware Bindings</h3>
          <p>No Home Assistant entities have been bound to asset capabilities.</p>
        </div>
      `;
    }

    const getAssetName = (id) => {
      const asset = assets.find((a) => a.id === id);
      return asset ? asset.name : id;
    };

    return html`
      <div class="card">
        <h2>Hardware Bindings</h2>
        <p style="font-size: 14px; color: var(--secondary-text-color, #666); margin-bottom: 16px;">
          Bindings map generic asset capabilities to specific, replaceable Home Assistant entities.
        </p>
        <table>
          <thead>
            <tr>
              <th>Infrastructure Asset</th>
              <th>Capability</th>
              <th>Role</th>
              <th>Bound Home Assistant Entity</th>
            </tr>
          </thead>
          <tbody>
            ${bindings.map(
              (b) => html`
                <tr>
                  <td>
                    <span class="asset-link" @click=${() => this._navigate("asset_detail", b.asset_id)}>
                      ${getAssetName(b.asset_id)}
                    </span>
                  </td>
                  <td><span class="badge badge-capability">${b.capability}</span></td>
                  <td>${b.role}</td>
                  <td><span class="badge badge-ha">${b.entity_id}</span></td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define("bindhome-panel", BindHomePanel);
