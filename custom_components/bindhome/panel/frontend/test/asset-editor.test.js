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
  "../src/inventory/asset-detail-editor.js"
);

await import(
  "../src/inventory/inventory-browser.js"
);

const { createLocalizer } =
  await import("../src/i18n/localize.js");

function panelResources(language) {
  const json = JSON.parse(
    readFileSync(
      new URL(
        `../../../translations/${language}.json`,
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

const resources = panelResources("en");

const t = createLocalizer(
  resources,
  resources,
);

async function settle(element) {
  await element.updateComplete;
  await Promise.all(
    [...element.shadowRoot.querySelectorAll("bindhome-primary-connection-editor")]
      .map((child) => child.updateComplete),
  );
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function baseAsset() {
  return {
    id: "asset-1",
    name: "Living room socket",
    asset_type: "socket",
    code: "SOC-01",
    area_id: "living",
    capabilities: [
      "on_off",
      "power_measurement",
    ],
  };
}

function createEditor(hass) {
  const editor = document.createElement(
    "bindhome-asset-detail-editor",
  );

  editor.hass = hass;
  editor.t = t;
  editor.asset = baseAsset();

  editor.assets = [
    editor.asset,
    {
      id: "panel",
      name: "Electrical panel",
      asset_type: "electrical_panel",
      area_id: null,
      capabilities: [],
    },
  ];

  editor.floors = [
    {
      floor_id: "ground",
      name: "Ground floor",
    },
  ];

  editor.areas = [
    {
      area_id: "living",
      name: "Living room",
      floor_id: "ground",
    },
    {
      area_id: "kitchen",
      name: "Kitchen",
      floor_id: "ground",
    },
  ];

  editor.registry = {
    assets: editor.assets,
    relations: [],
    bindings: [],
    representations: [],
  };

  document.body.append(editor);

  return editor;
}

test(
  "editor initially displays the Asset persisted Home Assistant Area",
  async () => {
    const editor = createEditor({
      states: {},
    });

    await settle(editor);

    editor._startEdit();
    await settle(editor);

    const select =
      editor.shadowRoot.querySelector("select");

    assert.ok(select);

    assert.equal(
      editor._draft.area_id,
      "living",
    );

    assert.equal(
      select.value,
      "living",
    );

    assert.equal(
      editor._dirty,
      false,
    );
  },
);

test(
  "Asset edit saves only changed fields and preserves stable ID",
  async () => {
    const calls = [];

    const hass = {
      states: {},
      async callWS(message) {
        calls.push(message);

        return {
          asset: {
            ...baseAsset(),
            name: "Edited socket",
            area_id: "kitchen",
          },
        };
      },
    };

    const editor = createEditor(hass);
    await settle(editor);

    let updated = null;

    editor.addEventListener(
      "asset-updated",
      (event) => {
        updated = event.detail;
      },
    );

    editor._startEdit();

    editor._updateField(
      "name",
      "Edited socket",
    );

    editor._updateField(
      "area_id",
      "kitchen",
    );

    await editor._save();
    await settle(editor);

    assert.equal(calls.length, 1);

    assert.deepEqual(calls[0], {
      name: "Edited socket",
      area_id: "kitchen",
      type: "bindhome/assets/update",
      asset_id: "asset-1",
    });

    assert.equal(updated.id, "asset-1");
    assert.equal(updated.name, "Edited socket");
    assert.equal(editor._editing, false);
  },
);

test(
  "Cancel restores persisted Asset and performs no write",
  async () => {
    const calls = [];

    const editor = createEditor({
      states: {},
      async callWS(message) {
        calls.push(message);
        throw new Error("Unexpected write");
      },
    });

    await settle(editor);

    editor._startEdit();

    editor._updateField(
      "name",
      "Unsaved name",
    );

    editor._removeCapability(
      "on_off",
    );

    editor._cancel();
    await settle(editor);

    assert.equal(calls.length, 0);
    assert.equal(
      editor._draft.name,
      "Living room socket",
    );

    assert.deepEqual(
      editor._draft.capabilities,
      [
        "on_off",
        "power_measurement",
      ],
    );

    assert.equal(editor._editing, false);
  },
);

test(
  "backend conflict preserves the draft for correction",
  async () => {
    const error = new Error(
      "Cannot remove capabilities that still have active bindings",
    );

    error.code = "conflict";

    const editor = createEditor({
      states: {},
      async callWS() {
        throw error;
      },
    });

    editor.registry = {
      assets: editor.assets,
      relations: [],
      bindings: [
        {
          id: "binding-1",
          asset_id: "asset-1",
          capability: "on_off",
          role: "primary",
          entity_id: "switch.socket",
        },
      ],
      representations: [],
    };

    await settle(editor);

    editor._startEdit();

    editor._removeCapability(
      "on_off",
    );

    await editor._save();
    await settle(editor);

    assert.equal(editor._editing, true);

    assert.deepEqual(
      editor._draft.capabilities,
      ["power_measurement"],
    );

    assert.match(
      editor._error,
      /active bindings/,
    );
  },
);

test(
  "Connections show Relations, friendly HA entity and Representation",
  async () => {
    const editor = createEditor({
      states: {
        "switch.socket": {
          attributes: {
            friendly_name:
              "Smart socket relay",
          },
        },
      },
    });

    editor.registry = {
      assets: editor.assets,
      relations: [
        {
          id: "relation-1",
          source_asset_id: "panel",
          relation_type: "supplies",
          target_asset_id: "asset-1",
        },
      ],
      bindings: [
        {
          id: "binding-1",
          asset_id: "asset-1",
          capability: "on_off",
          role: "primary",
          entity_id: "switch.socket",
        },
      ],
      representations: [
        {
          asset_id: "asset-1",
          platform: "light",
        },
      ],
    };

    await settle(editor);

    const text =
      editor.shadowRoot.textContent +
      [...editor.shadowRoot.querySelectorAll(
        "bindhome-primary-connection-editor",
      )]
        .map((child) => child.shadowRoot?.textContent ?? "")
        .join("\n");

    const topology = editor.shadowRoot.querySelector("bindhome-asset-topology");
    const topologyText = topology?.shadowRoot?.textContent ?? "";

    assert.equal(
      editor.shadowRoot.querySelectorAll(
        "bindhome-primary-connection-editor",
      ).length,
      2,
    );
    assert.doesNotMatch(text, /Other bindings/);

    assert.match(
      topologyText,
      /Electrical panel/,
    );

    assert.match(
      text,
      /Smart socket relay/,
    );

    assert.match(
      text,
      /switch\.socket/,
    );

    assert.match(
      text,
      /light/,
    );
  },
);

test(
  "external refresh during editing does not turn untouched fields into writes",
  async () => {
    const calls = [];

    const original = baseAsset();

    const editor = createEditor({
      states: {},
      async callWS(message) {
        calls.push(message);

        return {
          asset: {
            ...original,
            code: "EXTERNAL-CODE",
            name: "User edit",
          },
        };
      },
    });

    await settle(editor);

    editor._startEdit();

    editor._updateField(
      "name",
      "User edit",
    );

    editor.asset = {
      ...original,
      code: "EXTERNAL-CODE",
    };

    await settle(editor);

    assert.equal(
      editor._draft.code,
      "SOC-01",
    );

    await editor._save();

    assert.deepEqual(calls[0], {
      name: "User edit",
      type: "bindhome/assets/update",
      asset_id: "asset-1",
    });
  },
);

test(
  "browser follows an Asset when its Area changes",
  async () => {
    const browser = document.createElement(
      "bindhome-inventory-browser",
    );

    browser.t = t;
    browser.floors = [
      {
        floor_id: "ground",
        name: "Ground floor",
      },
    ];

    browser.areas = [
      {
        area_id: "living",
        name: "Living room",
        floor_id: "ground",
      },
      {
        area_id: "kitchen",
        name: "Kitchen",
        floor_id: "ground",
      },
    ];

    browser.assets = [baseAsset()];
    browser.registry = {
      assets: browser.assets,
      relations: [],
      bindings: [],
      representations: [],
    };

    document.body.append(browser);
    await settle(browser);

    browser._selectedKey = "living";
    browser._selectedAssetId = "asset-1";

    let refreshed = null;

    browser.addEventListener(
      "assets-refreshed",
      (event) => {
        refreshed = event.detail;
      },
    );

    browser._handleAssetUpdated(
      new CustomEvent(
        "asset-updated",
        {
          detail: {
            ...baseAsset(),
            area_id: "kitchen",
          },
        },
      ),
    );

    await settle(browser);

    assert.equal(
      browser._selectedKey,
      "kitchen",
    );

    assert.equal(
      browser._selectedAssetId,
      "asset-1",
    );

    assert.equal(
      refreshed[0].area_id,
      "kitchen",
    );
  },
);
