import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { Window } from "happy-dom";

const window = new Window({
  url: "http://localhost/bindhome",
});

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

if (!customElements.get("ha-icon")) {
  customElements.define(
    "ha-icon",
    class extends HTMLElement {},
  );
}

await import(
  "../src/inventory/inventory-browser.js"
);

await import(
  "../src/inventory/inventory-section.js"
);

await import("../src/bindhome-panel.js");

const { createLocalizer } =
  await import("../src/i18n/localize.js");

function panelResources(language) {
  const json = JSON.parse(
    readFileSync(
      new URL(
        `../../custom_components/bindhome/translations/${language}.json`,
        import.meta.url,
      ),
    ),
  );

  return Object.fromEntries(
    Object.entries(json.common)
      .filter(([key]) =>
        key.startsWith("panel_"),
      )
      .map(([key, value]) => [
        `component.bindhome.common.${key}`,
        value,
      ]),
  );
}

const englishResources =
  panelResources("en");

const englishT = createLocalizer(
  englishResources,
  englishResources,
);

async function settle(element) {
  await element.updateComplete;

  if (element._loadPromise) {
    await element._loadPromise;
  }

  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test(
  "browser navigates HA Floor -> Area -> Assets",
  async () => {
    const browser = document.createElement(
      "bindhome-inventory-browser",
    );

    browser.t = englishT;

    browser.floors = [
      {
        floor_id: "ground",
        name: "Ground floor",
        level: 0,
      },
    ];

    browser.areas = [
      {
        area_id: "living",
        name: "Living room",
        floor_id: "ground",
      },
      {
        area_id: "garden",
        name: "Garden",
        floor_id: null,
      },
    ];

    browser.presets = [
      {
        preset_id: "socket",
        group: "electrical",
        asset_type: "socket",
        default_name: "Socket",
        suggested_capabilities: [],
      },
    ];

    browser.assets = [
      {
        id: "socket-2",
        name: "Socket 2",
        asset_type: "socket",
        code: null,
        area_id: "living",
        capabilities: [],
      },
      {
        id: "socket-1",
        name: "Socket 1",
        asset_type: "socket",
        code: "SOC-01",
        area_id: "living",
        capabilities: [],
      },
      {
        id: "tap-1",
        name: "Garden tap",
        asset_type: "tap",
        code: null,
        area_id: "garden",
        capabilities: [],
      },
    ];

    document.body.append(browser);
    await settle(browser);

    const shadow = browser.shadowRoot;

    assert.match(
      shadow.textContent,
      /Ground floor/,
    );

    assert.match(
      shadow.textContent,
      /Garden/,
    );

    const livingButton = [
      ...shadow.querySelectorAll(
        ".area-button",
      ),
    ].find((button) =>
      button.textContent.includes(
        "Living room",
      ),
    );

    assert.ok(livingButton);

    livingButton.click();
    await settle(browser);

    assert.match(
      shadow.textContent,
      /Socket 1/,
    );

    assert.match(
      shadow.textContent,
      /Socket 2/,
    );

    assert.doesNotMatch(
      shadow.querySelector(
        ".results",
      ).textContent,
      /Garden tap/,
    );
  },
);

test(
  "browser keeps unassigned and stale Area Assets visible",
  async () => {
    const browser = document.createElement(
      "bindhome-inventory-browser",
    );

    browser.t = englishT;
    browser.floors = [];
    browser.areas = [];
    browser.presets = [];

    browser.assets = [
      {
        id: "loose",
        name: "Loose asset",
        asset_type: "custom",
        code: null,
        area_id: null,
        capabilities: [],
      },
      {
        id: "stale",
        name: "Stale asset",
        asset_type: "custom",
        code: null,
        area_id: "deleted_area",
        capabilities: [],
      },
    ];

    document.body.append(browser);
    await settle(browser);

    const shadow = browser.shadowRoot;

    const specials = [
      ...shadow.querySelectorAll(
        ".special-button",
      ),
    ];

    assert.equal(specials.length, 2);

    const stale = specials.find(
      (button) =>
        button.textContent.includes(
          "Unknown Area",
        ),
    );

    assert.ok(stale);

    stale.click();
    await settle(browser);

    assert.match(
      shadow.textContent,
      /Stale asset/,
    );

    assert.match(
      shadow.textContent,
      /deleted_area/,
    );
  },
);

test(
  "Inventory subviews stay mounted while switching",
  async () => {
    const section = document.createElement(
      "bindhome-inventory-section",
    );

    section.t = englishT;
    section.presets = [];
    section.floors = [];
    section.areas = [];
    section.assets = [];
    section.hass = {
      language: "en",
      async callWS() {
        throw new Error(
          "No WebSocket call expected",
        );
      },
    };

    document.body.append(section);
    await settle(section);

    const shadow = section.shadowRoot;

    const browserBefore =
      shadow.querySelector(
        "bindhome-inventory-browser",
      );

    const workflowBefore =
      shadow.querySelector(
        "bindhome-inventory-workflow",
      );

    assert.ok(browserBefore);
    assert.ok(workflowBefore);

    const buttons =
      shadow.querySelectorAll(
        ".subnav button",
      );

    buttons[1].click();
    await settle(section);

    assert.equal(
      shadow.querySelector(
        "bindhome-inventory-browser",
      ),
      browserBefore,
    );

    assert.equal(
      shadow.querySelector(
        "bindhome-inventory-workflow",
      ),
      workflowBefore,
    );

    buttons[0].click();
    await settle(section);

    assert.equal(
      shadow.querySelector(
        "bindhome-inventory-workflow",
      ),
      workflowBefore,
    );
  },
);

test(
  "top-level Inventory stays mounted while Infrastructure is shown",
  async () => {
    const calls = [];

    const hass = {
      language: "en",

      async callWS(message) {
        calls.push(message.type);

        if (
          message.type ===
          "bindhome/presets/list"
        ) {
          return { presets: [] };
        }

        if (
          message.type ===
          "bindhome/assets/list"
        ) {
          return { assets: [] };
        }

        if (
          message.type ===
          "bindhome/registry/get"
        ) {
          return {
            assets: [],
            relations: [],
            bindings: [],
            representations: [],
          };
        }

        if (message.type === "bindhome/bindings/status") {
          return { records: [], summary: {} };
        }

        if (message.type === "config/entity_registry/list" || message.type === "config/device_registry/list") {
          return [];
        }

        if (
          message.type ===
          "config/floor_registry/list"
        ) {
          return [];
        }

        if (
          message.type ===
          "config/area_registry/list"
        ) {
          return [];
        }

        if (
          message.type ===
          "frontend/get_translations"
        ) {
          return {
            resources:
              englishResources,
          };
        }

        throw new Error(
          `Unexpected call: ${message.type}`,
        );
      },
    };

    const panel = document.createElement(
      "bindhome-panel",
    );

    panel.hass = hass;

    document.body.append(panel);
    await settle(panel);

    const advanced = panel.shadowRoot.querySelector("bindhome-advanced-view");
    const inventoryBefore =
      advanced.shadowRoot.querySelector(
        "bindhome-inventory-section",
      );

    const infrastructureBefore =
      advanced.shadowRoot.querySelector(
        "bindhome-infrastructure-inspector",
      );

    assert.ok(inventoryBefore);
    assert.ok(infrastructureBefore);

    panel._view = "advanced";
    advanced._tab = "infrastructure";
    await settle(panel);

    assert.equal(
      advanced.shadowRoot.querySelector(
        "bindhome-inventory-section",
      ),
      inventoryBefore,
    );

    advanced._tab = "inventory";
    await settle(panel);

    assert.equal(
      advanced.shadowRoot.querySelector(
        "bindhome-inventory-section",
      ),
      inventoryBefore,
    );

    assert.ok(
      calls.includes(
        "bindhome/registry/get",
      ),
    );
  },
);
