import { LitElement, css, html } from "lit";

export class BindHomeOnboardingView extends LitElement {
  static properties = {
    t: { attribute: false },
    floors: { attribute: false },
    areas: { attribute: false },
    _step: { state: true },
  };

  constructor() {
    super();
    this.t = (key) => key;
    this.floors = [];
    this.areas = [];
    this._step = 0;
  }

  static styles = css`
    :host {
      display: block;
    }
    * {
      box-sizing: border-box;
    }
    .page {
      width: min(760px, calc(100% - 32px));
      margin: 0 auto;
      padding: 48px 0 64px;
    }
    .eyebrow {
      margin: 0 0 8px;
      color: var(--primary-color);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(28px, 5vw, 38px);
      line-height: 1.15;
      font-weight: 500;
    }
    .lead {
      max-width: 680px;
      margin: 16px 0 0;
      color: var(--secondary-text-color);
      font-size: 17px;
      line-height: 1.55;
    }
    .progress {
      display: flex;
      gap: 8px;
      margin: 30px 0;
    }
    .progress span {
      height: 4px;
      flex: 1;
      border-radius: 999px;
      background: var(--divider-color);
    }
    .progress span.active {
      background: var(--primary-color);
    }
    .example,
    .model,
    .structure,
    .next-steps {
      margin-top: 28px;
      padding: 20px;
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      background: var(--card-background-color);
    }
    .example-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      gap: 12px;
      align-items: center;
    }
    .example-box {
      min-height: 86px;
      padding: 14px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }
    .example-box strong,
    .model strong {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    .muted {
      color: var(--secondary-text-color);
      line-height: 1.45;
    }
    .arrow {
      color: var(--secondary-text-color);
      font-size: 24px;
    }
    .model {
      display: grid;
      gap: 0;
      padding: 0;
      overflow: hidden;
    }
    .model-row {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      gap: 12px;
      padding: 16px 18px;
      border-bottom: 1px solid var(--divider-color);
    }
    .model-row:last-child {
      border-bottom: 0;
    }
    .number {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--secondary-background-color, var(--primary-background-color));
      font-weight: 600;
    }
    .counts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }
    .count {
      padding: 14px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }
    .count strong {
      display: block;
      font-size: 24px;
      font-weight: 500;
    }
    .warning {
      margin-top: 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--warning-color, #f9a825);
      background: var(--secondary-background-color, var(--primary-background-color));
    }
    .next-steps ol {
      margin: 12px 0 0;
      padding-left: 22px;
      color: var(--secondary-text-color);
      line-height: 1.6;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 32px;
    }
    button {
      min-height: 44px;
      padding: 0 18px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      font-weight: 500;
    }
    button.primary {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    button.skip {
      margin-left: auto;
      border-color: transparent;
      background: transparent;
      color: var(--secondary-text-color);
    }
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    @media (max-width: 600px) {
      .page {
        width: min(100% - 24px, 760px);
        padding-top: 28px;
      }
      .example-row {
        grid-template-columns: 1fr;
      }
      .arrow {
        transform: rotate(90deg);
        justify-self: center;
      }
      .actions {
        flex-wrap: wrap;
      }
      button.skip {
        width: 100%;
        margin-left: 0;
      }
    }
  `;

  _complete(startInventory) {
    this.dispatchEvent(
      new CustomEvent("onboarding-complete", {
        detail: { startInventory },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _renderWelcome() {
    return html`
      <p class="eyebrow">${this.t("onboarding.welcome_eyebrow")}</p>
      <h1>${this.t("onboarding.welcome_title")}</h1>
      <p class="lead">${this.t("onboarding.welcome_body")}</p>
      <div class="example">
        <div class="example-row">
          <div class="example-box">
            <strong>${this.t("onboarding.stable_title")}</strong>
            <span class="muted">${this.t("onboarding.stable_example")}</span>
          </div>
          <span class="arrow" aria-hidden="true">→</span>
          <div class="example-box">
            <strong>${this.t("onboarding.replaceable_title")}</strong>
            <span class="muted">${this.t("onboarding.replaceable_example")}</span>
          </div>
        </div>
      </div>
    `;
  }

  _renderModel() {
    const rows = ["asset", "capability", "binding", "representation"];
    return html`
      <p class="eyebrow">${this.t("onboarding.model_eyebrow")}</p>
      <h1>${this.t("onboarding.model_title")}</h1>
      <p class="lead">${this.t("onboarding.model_body")}</p>
      <div class="model">
        ${rows.map(
          (row, index) => html`
            <div class="model-row">
              <span class="number">${index + 1}</span>
              <div>
                <strong>${this.t(`onboarding.${row}_title`)}</strong>
                <span class="muted">${this.t(`onboarding.${row}_body`)}</span>
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }

  _renderStructure() {
    return html`
      <p class="eyebrow">${this.t("onboarding.structure_eyebrow")}</p>
      <h1>${this.t("onboarding.structure_title")}</h1>
      <p class="lead">${this.t("onboarding.structure_body")}</p>
      <div class="structure">
        <div class="counts">
          <div class="count">
            <strong>${this.floors.length}</strong>
            <span class="muted">${this.t("onboarding.floors_detected")}</span>
          </div>
          <div class="count">
            <strong>${this.areas.length}</strong>
            <span class="muted">${this.t("onboarding.areas_detected")}</span>
          </div>
        </div>
        ${this.areas.length === 0
          ? html`<div class="warning">${this.t("onboarding.no_areas")}</div>`
          : html`<p class="muted">${this.t("onboarding.structure_ready")}</p>`}
      </div>
    `;
  }

  _renderStart() {
    return html`
      <p class="eyebrow">${this.t("onboarding.start_eyebrow")}</p>
      <h1>${this.t("onboarding.start_title")}</h1>
      <p class="lead">${this.t("onboarding.start_body")}</p>
      <div class="next-steps">
        <strong>${this.t("onboarding.after_inventory_title")}</strong>
        <ol>
          <li>${this.t("onboarding.after_inventory_binding")}</li>
          <li>${this.t("onboarding.after_inventory_topology")}</li>
          <li>${this.t("onboarding.after_inventory_representation")}</li>
        </ol>
      </div>
    `;
  }

  render() {
    const views = [
      () => this._renderWelcome(),
      () => this._renderModel(),
      () => this._renderStructure(),
      () => this._renderStart(),
    ];

    return html`
      <div class="page">
        <div class="progress" aria-label=${this.t("onboarding.progress_label")}>
          ${views.map(
            (_, index) => html`<span class=${index <= this._step ? "active" : ""}></span>`,
          )}
        </div>
        ${views[this._step]()}
        <div class="actions">
          ${this._step > 0
            ? html`<button @click=${() => (this._step -= 1)}>
                ${this.t("onboarding.back")}
              </button>`
            : null}
          ${this._step < views.length - 1
            ? html`<button class="primary" @click=${() => (this._step += 1)}>
                ${this.t("onboarding.next")}
              </button>`
            : html`<button
                class="primary"
                ?disabled=${this.areas.length === 0}
                @click=${() => this._complete(true)}
              >
                ${this.t("onboarding.start_inventory")}
              </button>`}
          <button class="skip" @click=${() => this._complete(false)}>
            ${this.t("onboarding.skip")}
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("bindhome-onboarding-view", BindHomeOnboardingView);
