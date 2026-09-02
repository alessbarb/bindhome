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
window.HTMLElement.prototype.scrollIntoView = () => {};
window.confirm = () => true;
if (!customElements.get("ha-icon")) customElements.define("ha-icon", class extends HTMLElement {});

await import("../src/inventory/inventory-workflow.js");

const presets = [
  { preset_id: "light_point", group: "electrical", asset_type: "light_point", default_name: "Light point", suggested_capabilities: ["on_off"] },
  { preset_id: "socket", group: "electrical", asset_type: "socket", default_name: "Socket", suggested_capabilities: [] },
];

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("room workflow preserves and focuses a failed draft, then retries one atomic request", async () => {
  const calls = [];
  let shouldFail = true;
  let assets = [{ id: "existing", name: "Existing window", asset_type: "window", area_id: "living", capabilities: ["open_close"] }];
  const hass = {
    async callWS(message) {
      calls.push(structuredClone(message));
      if (message.type === "bindhome/assets/create_bulk") {
        if (shouldFail) {
          shouldFail = false;
          throw new Error('{"index":1,"field":"code","message":"Duplicate code"}');
        }
        const created = message.assets.map((item, index) => ({ ...item, id: `created-${index}` }));
        assets = [...assets, ...created];
        return { assets: created };
      }
      if (message.type === "bindhome/assets/list") return { assets };
      throw new Error(`Unexpected call: ${message.type}`);
    },
  };
  const element = document.createElement("bindhome-inventory-workflow");
  element.hass = hass;
  element.presets = presets;
  element.floors = [{ floor_id: "ground", name: "Ground floor" }];
  element.areas = [{ area_id: "living", name: "Living room", floor_id: "ground" }];
  element.assets = assets;
  document.body.append(element);
  await settle(element);

  element._floorId = "ground";
  element._areaId = "living";
  element._continue();
  element.requestUpdate();
  await settle(element);

  let increaseSocket = element.shadowRoot.querySelector('button[aria-label="Increase Socket quantity"]');
  if (!increaseSocket) {
    element.shadowRoot.querySelector(".group-toggle").click();
    await settle(element);
    increaseSocket = element.shadowRoot.querySelector('button[aria-label="Increase Socket quantity"]');
  }
  increaseSocket.click();
  increaseSocket.click();
  await settle(element);
  assert.match(element.shadowRoot.textContent, /2 assets/);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);

  assert.match(element.shadowRoot.textContent, /Nothing was saved/);
  assert.equal(element._activeDrafts.length, 2);
  const failedCode = element.shadowRoot.querySelector("#draft-socket-2-code");
  assert.equal(failedCode.getAttribute("aria-invalid"), "true");
  assert.equal(element.shadowRoot.activeElement, failedCode);

  failedCode.value = "SOCKET-2";
  failedCode.dispatchEvent(new Event("input", { bubbles: true }));
  await settle(element);
  element.shadowRoot.querySelector(".bottom-bar .button.primary").click();
  await settle(element);

  assert.match(element.shadowRoot.textContent, /2 assets created/);
  assert.match(element.shadowRoot.textContent, /Only physical inventory was created/);
  assert.equal(element._activeDrafts.length, 0);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create_bulk").length, 2);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/create").length, 0);
  assert.equal(calls.filter((call) => call.type === "bindhome/assets/list").length, 1);
});
