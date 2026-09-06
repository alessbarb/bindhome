import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/bindhome/home" });
Object.assign(globalThis, {
  window,
  document: window.document,
  customElements: window.customElements,
  HTMLElement: window.HTMLElement,
  ShadowRoot: window.ShadowRoot,
  Document: window.Document,
  CSSStyleSheet: window.CSSStyleSheet,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  CSS: window.CSS,
});
for (const tag of ["ha-icon", "ha-switch", "ha-menu-button"]) {
  if (!customElements.get(tag))
    customElements.define(tag, class extends HTMLElement {});
}

await import("../src/bindhome-panel.js");

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function fixture() {
  const panel = document.createElement("bindhome-panel");
  panel.hass = {
    user: { id: "user", is_admin: true },
    language: "en",
    callWS: async () => [],
    connection: null,
  };
  panel.route = { prefix: "/bindhome", path: "/home" };
  panel._loading = false;
  panel._initialized = true;
  panel._t = (key) => key;
  panel._registry = { assets: [], relations: [], bindings: [], representations: [] };
  document.body.append(panel);
  return panel;
}

test("BindHome header exposes exactly one native Home Assistant menu button", async () => {
  const panel = fixture();
  await settle(panel);

  const leading = panel.shadowRoot.querySelector("header.top > .leading");
  const buttons = panel.shadowRoot.querySelectorAll("ha-menu-button");
  assert.equal(buttons.length, 1);
  assert.equal(leading.firstElementChild, buttons[0]);
  assert.equal(buttons[0].attributes.length, 0);
});

test("BindHome does not duplicate narrow or sidebar logic around ha-menu-button", async () => {
  const panel = fixture();
  panel.narrow = true;
  await settle(panel);
  const menu = panel.shadowRoot.querySelector("ha-menu-button");
  assert.equal(menu.hasAttribute("narrow"), false);
  assert.equal(menu.hasAttribute("hass"), false);

  panel.narrow = false;
  await settle(panel);
  assert.equal(panel.shadowRoot.querySelector("ha-menu-button"), menu);
});

test("native hass-toggle-menu event remains owned by Home Assistant without remounting views", async () => {
  const panel = fixture();
  await settle(panel);
  const home = panel.shadowRoot.querySelector("bindhome-home-view");
  let toggles = 0;
  panel.addEventListener("hass-toggle-menu", () => {
    toggles += 1;
  });

  panel.shadowRoot.querySelector("ha-menu-button").dispatchEvent(
    new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }),
  );
  await settle(panel);

  assert.equal(toggles, 1);
  assert.equal(panel.shadowRoot.querySelector("bindhome-home-view"), home);
});
