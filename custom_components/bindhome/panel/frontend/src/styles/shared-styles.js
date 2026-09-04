import { css } from "lit";

export const tokens = css`
  :host {
    --bh-space-1: 4px;
    --bh-space-2: 8px;
    --bh-space-3: 12px;
    --bh-space-4: 16px;
    --bh-space-5: 24px;
    --bh-space-6: 32px;
    --bh-content: 1180px;
    --bh-reading: 760px;
    --bh-touch: 44px;
    --bh-radius: var(--ha-card-border-radius, 12px);
    color: var(--primary-text-color, #212121);
    font-family: var(
      --paper-font-body1_-_font-family,
      Roboto,
      Noto,
      sans-serif
    );
  }
  * {
    box-sizing: border-box;
  }
  button,
  input,
  select {
    color: inherit;
    font: inherit;
  }
  button {
    cursor: pointer;
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
  h1,
  h2,
  h3,
  p,
  dl,
  dd {
    margin: 0;
  }
  .page {
    width: 100%;
    max-width: var(--bh-content);
    margin: 0 auto;
    padding: var(--bh-space-6) var(--bh-space-5) 56px;
  }
  .page-title {
    font-size: 26px;
    line-height: 34px;
    font-weight: 500;
  }
  .muted {
    color: var(--secondary-text-color, #727272);
  }
  .primary,
  .secondary,
  .text-button {
    min-height: var(--bh-touch);
    padding: 0 18px;
    border-radius: 8px;
    font-weight: 500;
  }
  .primary {
    border: 1px solid var(--primary-color);
    color: var(--text-primary-color, #fff);
    background: var(--primary-color);
  }
  .secondary {
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    background: transparent;
  }
  .text-button {
    border: 0;
    color: var(--primary-color);
    background: transparent;
  }
  .surface {
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: var(--bh-radius);
    background: var(--card-background-color, #fff);
    overflow: hidden;
  }
  .empty {
    padding: var(--bh-space-6);
    border: 1px dashed var(--divider-color);
    border-radius: var(--bh-radius);
    color: var(--secondary-text-color);
    text-align: center;
    line-height: 1.5;
  }
  .error {
    padding: var(--bh-space-3);
    border: 1px solid var(--error-color, #db4437);
    border-radius: 8px;
    color: var(--error-color, #db4437);
  }
  @media (max-width: 600px) {
    .page {
      padding: 20px 12px 40px;
    }
    .page-title {
      font-size: 24px;
    }
  }
`;
