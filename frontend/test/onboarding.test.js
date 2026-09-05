import assert from "node:assert/strict";
import test from "node:test";

import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/bindhome" });

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

await import("../src/onboarding/onboarding-view.js");

const messages = new Map([
  ["nav.home", "Home"],
  ["onboarding.welcome_title", "Stable home, replaceable hardware"],
  ["onboarding.model_title", "The BindHome model"],
  ["onboarding.structure_title", "Your Home Assistant structure"],
  ["onboarding.start_title", "Start with one room"],
  ["onboarding.next", "Next"],
  ["onboarding.back", "Back"],
  ["onboarding.skip", "Skip introduction"],
]);

const t = (key) => messages.get(key) ?? key;

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("onboarding teaches the model before opening Casa", async () => {
  const element = document.createElement("bindhome-onboarding-view");
  element.t = t;
  element.floors = [{ floor_id: "ground", name: "Ground" }];
  element.areas = [{ area_id: "living", name: "Living room", floor_id: "ground" }];
  document.body.append(element);
  await settle(element);

  assert.match(element.shadowRoot.textContent, /Stable home, replaceable hardware/);

  let primary = element.shadowRoot.querySelector("button.primary");
  primary.click();
  await settle(element);
  assert.match(element.shadowRoot.textContent, /The BindHome model/);

  primary = element.shadowRoot.querySelector("button.primary");
  primary.click();
  await settle(element);
  assert.match(element.shadowRoot.textContent, /Your Home Assistant structure/);
  assert.match(element.shadowRoot.textContent, /1/);

  primary = element.shadowRoot.querySelector("button.primary");
  primary.click();
  await settle(element);
  assert.match(element.shadowRoot.textContent, /Start with one room/);
});

test("final onboarding action completes into Casa and requires an HA Area", async () => {
  const element = document.createElement("bindhome-onboarding-view");
  element.t = t;
  element.areas = [];
  document.body.append(element);
  element._step = 3;
  await settle(element);

  let primary = element.shadowRoot.querySelector("button.primary");
  assert.equal(primary.disabled, true);

  element.areas = [{ area_id: "living", name: "Living room" }];
  await settle(element);
  primary = element.shadowRoot.querySelector("button.primary");
  assert.equal(primary.disabled, false);
  assert.match(primary.textContent, /Home/);

  const eventPromise = new Promise((resolve) => {
    element.addEventListener("onboarding-complete", resolve, { once: true });
  });
  primary.click();
  const event = await eventPromise;
  assert.deepEqual(event.detail, { startInventory: false });
});
