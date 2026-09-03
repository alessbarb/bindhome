import test from "node:test";
import assert from "node:assert/strict";
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

const {
  searchAssetCatalogue,
} = await import("../src/topology/asset-catalogue.js");

const {
  relationPartitions,
  relationTypeSuggestions,
  validRelationType,
} = await import("../src/topology/relation-state.js");

const {
  createBindHomeApi,
} = await import("../src/api/bindhome-api.js");

await import("../src/topology/asset-topology.js");
await import("../src/topology/topology-explorer.js");

const labels = {
  "topology.title": "Topology",
  "topology.helper": "Direct infrastructure relationships",
  "topology.add_relation": "Add relation",
  "topology.outgoing": "Outgoing",
  "topology.incoming": "Incoming",
  "topology.no_relations": "No relations",
  "topology.no_matches": "No matching assets.",
  "topology.showing_results":
    "Showing {shown} of {total} results. Refine your search.",
  "topology.delete": "Delete",
  "topology.confirm_delete": "Delete this relation?",
  "topology.delete_error": "Could not delete this relation.",
  "topology.sync_warning":
    "Saved, but the latest topology could not be refreshed.",
  "topology.explorer": "Topology",
  "topology.search_assets": "Search assets",
  "topology.no_assets": "No assets available.",
  "topology.missing_asset": "Missing asset",
  "editor.cancel": "Cancel",
};

function t(key, variables = {}) {
  const template = labels[key] ?? key;

  return template.replace(
    /\{(\w+)\}/g,
    (match, name) => variables[name] ?? match,
  );
}

const areas = [
  {
    area_id: "lab",
    name: "BindHome Lab",
  },
  {
    area_id: "kitchen",
    name: "Kitchen",
  },
];

const assets = [
  {
    id: "a",
    name: "Source",
    code: "SRC",
    asset_type: "panel",
    area_id: "lab",
    capabilities: [],
  },
  {
    id: "b",
    name: "Middle",
    code: "MID",
    asset_type: "panel",
    area_id: "lab",
    capabilities: [],
  },
  {
    id: "c",
    name: "Target",
    code: "TGT",
    asset_type: "sensor",
    area_id: "kitchen",
    capabilities: [],
  },
];

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

function shadowText(element) {
  return element.shadowRoot.textContent
    .replace(/\s+/g, " ")
    .trim();
}

function createAssetTopology({
  asset = assets[1],
  allAssets = assets,
  relations = [],
} = {}) {
  const element = document.createElement(
    "bindhome-asset-topology",
  );

  element.hass = {
    callWS: async () => ({}),
  };
  element.t = t;
  element.asset = asset;
  element.assets = allAssets;
  element.areas = areas;
  element.registry = {
    assets: allAssets,
    relations,
    bindings: [],
    representations: [],
  };

  document.body.append(element);
  return element;
}

function createExplorer({
  allAssets = assets,
  relations = [],
  focalAssetId = "b",
} = {}) {
  const element = document.createElement(
    "bindhome-topology-explorer",
  );

  element.t = t;
  element.assets = allAssets;
  element.areas = areas;
  element.registry = {
    assets: allAssets,
    relations,
  };
  element.focalAssetId = focalAssetId;

  document.body.append(element);
  return element;
}

function findButton(element, text) {
  return [...element.shadowRoot.querySelectorAll("button")]
    .find((button) => button.textContent.includes(text));
}

test(
  "topology catalogue searches name/code/type/area and ranks same Area",
  () => {
    const ranked = searchAssetCatalogue(
      assets,
      "",
      "lab",
      areas,
    );

    assert.deepEqual(
      ranked.map((item) => item.id),
      ["b", "a", "c"],
    );

    assert.equal(
      searchAssetCatalogue(
        assets,
        "kitchen",
        null,
        areas,
      )[0].id,
      "c",
    );

    assert.equal(
      searchAssetCatalogue(
        assets,
        "SRC",
        null,
        areas,
      )[0].id,
      "a",
    );

    assert.equal(
      searchAssetCatalogue(
        assets,
        "sensor",
        null,
        areas,
      )[0].id,
      "c",
    );
  },
);

test(
  "relation partitions and extensible type validation are deterministic",
  () => {
    const relations = [
      {
        id: "r1",
        source_asset_id: "a",
        target_asset_id: "b",
        relation_type: "feeds",
      },
      {
        id: "r2",
        source_asset_id: "c",
        target_asset_id: "a",
        relation_type: "serves",
      },
    ];

    assert.equal(
      relationPartitions(relations, "a").outgoing.length,
      1,
    );

    assert.equal(
      relationPartitions(relations, "a").incoming.length,
      1,
    );

    assert.deepEqual(
      relationTypeSuggestions([
        ...relations,
        relations[0],
      ]),
      ["feeds", "serves"],
    );

    assert.equal(
      validRelationType("feeds_power"),
      true,
    );

    assert.equal(
      validRelationType("Feeds"),
      false,
    );
  },
);

test(
  "relation API emits exact create/delete contracts",
  async () => {
    const messages = [];

    const api = createBindHomeApi({
      callWS: async (message) => {
        messages.push(message);
        return {
          relation: {
            id: "r",
          },
        };
      },
    });

    await api.createRelation({
      sourceAssetId: "a",
      relationType: "feeds",
      targetAssetId: "b",
    });

    await api.deleteRelation("r");

    assert.deepEqual(messages, [
      {
        type: "bindhome/relations/create",
        source_asset_id: "a",
        relation_type: "feeds",
        target_asset_id: "b",
      },
      {
        type: "bindhome/relations/delete",
        relation_id: "r",
      },
    ]);
  },
);

test(
  "Asset topology renders incoming and outgoing neighbours with human Areas",
  async () => {
    const element = createAssetTopology({
      relations: [
        {
          id: "r-in",
          source_asset_id: "a",
          target_asset_id: "b",
          relation_type: "feeds",
        },
        {
          id: "r-out",
          source_asset_id: "b",
          target_asset_id: "c",
          relation_type: "serves",
        },
      ],
    });

    await settle(element);

    const text = shadowText(element);

    assert.match(text, /Source/);
    assert.match(text, /feeds · BindHome Lab/);
    assert.match(text, /Target/);
    assert.match(text, /serves · Kitchen/);

    element.remove();
  },
);

test(
  "Asset topology never exposes a missing related Asset ID",
  async () => {
    const missingId =
      "077e1122-3344-5566-7788-99aabbccddee";

    const element = createAssetTopology({
      relations: [
        {
          id: "r-missing",
          source_asset_id: "b",
          target_asset_id: missingId,
          relation_type: "serves",
        },
      ],
    });

    await settle(element);

    const text = shadowText(element);

    assert.match(text, /Missing asset/);
    assert.doesNotMatch(text, new RegExp(missingId));

    const neighborButtons =
      element.shadowRoot.querySelectorAll(
        "button.neighbor",
      );

    assert.equal(neighborButtons.length, 0);

    element.remove();
  },
);

test(
  "Topology explorer renders focal, incoming, outgoing, Areas and empty states",
  async () => {
    const element = createExplorer({
      relations: [
        {
          id: "r-in",
          source_asset_id: "a",
          target_asset_id: "b",
          relation_type: "feeds",
        },
        {
          id: "r-out",
          source_asset_id: "b",
          target_asset_id: "c",
          relation_type: "serves",
        },
      ],
    });

    await settle(element);

    let text = shadowText(element);

    assert.match(text, /Middle/);
    assert.match(text, /Source/);
    assert.match(text, /feeds · BindHome Lab/);
    assert.match(text, /Target/);
    assert.match(text, /serves · Kitchen/);

    element.registry = {
      assets,
      relations: [],
    };

    await settle(element);

    text = shadowText(element);

    assert.equal(
      (text.match(/No relations/g) ?? []).length,
      2,
    );

    element.remove();
  },
);

test(
  "Topology explorer limits empty-query suggestions to eight",
  async () => {
    const manyAssets = Array.from(
      { length: 12 },
      (_, index) => ({
        id: `asset-${index}`,
        name: `Asset ${String(index).padStart(2, "0")}`,
        code: `CODE-${index}`,
        asset_type: "test_point",
        area_id: "lab",
        capabilities: [],
      }),
    );

    const element = createExplorer({
      allAssets: manyAssets,
      focalAssetId: manyAssets[0].id,
    });

    await settle(element);

    assert.equal(
      element.shadowRoot.querySelectorAll(
        ".picker button",
      ).length,
      8,
    );

    element.remove();
  },
);

test(
  "Topology explorer limits active search to twenty and reports real totals",
  async () => {
    const manyAssets = Array.from(
      { length: 25 },
      (_, index) => ({
        id: `asset-${index}`,
        name: `Result Asset ${String(index).padStart(2, "0")}`,
        code: `RESULT-${index}`,
        asset_type: "test_point",
        area_id: index % 2 ? "lab" : "kitchen",
        capabilities: [],
      }),
    );

    const element = createExplorer({
      allAssets: manyAssets,
      focalAssetId: manyAssets[0].id,
    });

    await settle(element);

    element._search = "result";
    await settle(element);

    assert.equal(
      element.shadowRoot.querySelectorAll(
        ".picker button",
      ).length,
      20,
    );

    assert.match(
      shadowText(element),
      /Showing 20 of 25 results/,
    );

    element.remove();
  },
);

test(
  "Topology explorer omits truncation text when all search results fit",
  async () => {
    const element = createExplorer();

    await settle(element);

    element._search = "target";
    await settle(element);

    assert.equal(
      element.shadowRoot.querySelector(".count"),
      null,
    );

    element.remove();
  },
);

test(
  "Topology explorer picker identifies the focal Asset accessibly",
  async () => {
    const element = createExplorer();

    await settle(element);

    const pressed = [
      ...element.shadowRoot.querySelectorAll(
        ".picker button",
      ),
    ].filter(
      (button) =>
        button.getAttribute("aria-pressed") === "true",
    );

    assert.equal(pressed.length, 1);
    assert.match(pressed[0].textContent, /Middle/);

    element.remove();
  },
);

test(
  "Topology explorer neighbour navigation recentres the focal Asset",
  async () => {
    const element = createExplorer({
      relations: [
        {
          id: "r",
          source_asset_id: "b",
          target_asset_id: "c",
          relation_type: "serves",
        },
      ],
    });

    await settle(element);

    const target = findButton(element, "Target");

    assert.ok(target);
    target.click();
    await settle(element);

    assert.equal(element.focalAssetId, "c");
    assert.match(
      element.shadowRoot.querySelector("h2").textContent,
      /Target/,
    );

    element.remove();
  },
);

test(
  "Topology explorer picker changes the focal Asset",
  async () => {
    const element = createExplorer();

    await settle(element);

    const source = [
      ...element.shadowRoot.querySelectorAll(
        ".picker button",
      ),
    ].find((button) =>
      button.textContent.includes("Source"),
    );

    assert.ok(source);
    source.click();
    await settle(element);

    assert.equal(element.focalAssetId, "a");

    element.remove();
  },
);

test(
  "Topology explorer missing neighbour is human and non-navigable",
  async () => {
    const missingId =
      "98887766-5544-3322-1100-aabbccddeeff";

    const element = createExplorer({
      relations: [
        {
          id: "r",
          source_asset_id: "b",
          target_asset_id: missingId,
          relation_type: "serves",
        },
      ],
    });

    await settle(element);

    const text = shadowText(element);

    assert.match(text, /Missing asset/);
    assert.doesNotMatch(text, new RegExp(missingId));

    const missing =
      element.shadowRoot.querySelector(
        ".columns .neighbor.missing",
      );

    assert.ok(missing);
    assert.notEqual(
      missing.tagName.toLowerCase(),
      "button",
    );

    element.remove();
  },
);

test(
  "Topology explorer navigates an A to B to C to A cycle without recursion",
  async () => {
    const cycleAssets = [
      {
        id: "a",
        name: "Cycle A",
        asset_type: "test_point",
        area_id: "lab",
      },
      {
        id: "b",
        name: "Cycle B",
        asset_type: "test_point",
        area_id: "lab",
      },
      {
        id: "c",
        name: "Cycle C",
        asset_type: "test_point",
        area_id: "lab",
      },
    ];

    const element = createExplorer({
      allAssets: cycleAssets,
      focalAssetId: "a",
      relations: [
        {
          id: "ab",
          source_asset_id: "a",
          target_asset_id: "b",
          relation_type: "next",
        },
        {
          id: "bc",
          source_asset_id: "b",
          target_asset_id: "c",
          relation_type: "next",
        },
        {
          id: "ca",
          source_asset_id: "c",
          target_asset_id: "a",
          relation_type: "next",
        },
      ],
    });

    await settle(element);

    for (const [name, expected] of [
      ["Cycle B", "b"],
      ["Cycle C", "c"],
      ["Cycle A", "a"],
    ]) {
      const button = [
        ...element.shadowRoot.querySelectorAll(
          ".columns button.neighbor",
        ),
      ].find((item) =>
        item.textContent.includes(name),
      );

      assert.ok(button);
      button.click();
      await settle(element);
      assert.equal(element.focalAssetId, expected);
    }

    element.remove();
  },
);


// ---------------------------------------------------------------------------
// UX-4 direct mutation and async identity tests
// ---------------------------------------------------------------------------

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    },
  );

  return {
    promise,
    resolve,
    reject,
  };
}

function createRelationEditor({
  asset = assets[1],
  allAssets = assets,
  callWS = async () => ({}),
  onRefresh = async () => {},
  onDone = () => {},
  onSyncWarning = () => {},
} = {}) {
  const editor = document.createElement(
    "bindhome-relation-editor",
  );

  editor.hass = {
    callWS,
  };

  editor.t = t;
  editor.asset = asset;
  editor.assets = allAssets;
  editor.areas = areas;

  editor.registry = {
    assets: allAssets,
    relations: [],
    bindings: [],
    representations: [],
  };

  editor.onRefresh = onRefresh;
  editor.onDone = onDone;
  editor.onSyncWarning = onSyncWarning;

  document.body.append(editor);

  return editor;
}

function createDeleteTopology({
  asset = assets[1],
  allAssets = assets,
  relations = [],
  callWS = async () => ({}),
  onRefresh = async () => {},
} = {}) {
  const element = document.createElement(
    "bindhome-asset-topology",
  );

  element.hass = {
    callWS,
  };

  element.t = t;
  element.asset = asset;
  element.assets = allAssets;
  element.areas = areas;

  element.registry = {
    assets: allAssets,
    relations,
    bindings: [],
    representations: [],
  };

  element.onRefresh = onRefresh;

  document.body.append(element);

  return element;
}

test(
  "Relation editor excludes the current Asset but keeps same and other Areas",
  async () => {
    const editor = createRelationEditor();

    await settle(editor);

    const candidates =
      editor._candidates().all;

    assert.deepEqual(
      candidates.map(
        (candidate) => candidate.id,
      ),
      ["a", "c"],
    );

    assert.equal(
      candidates.some(
        (candidate) =>
          candidate.id === "b",
      ),
      false,
    );

    editor.remove();
  },
);

test(
  "Relation editor outgoing Save writes current to other exactly once",
  async () => {
    const calls = [];
    let refreshes = 0;
    let done = 0;

    const editor = createRelationEditor({
      callWS: async (message) => {
        calls.push(message);

        return {
          relation: {
            id: "relation-new",
          },
        };
      },
      onRefresh: async () => {
        refreshes += 1;
      },
      onDone: () => {
        done += 1;
      },
    });

    await settle(editor);

    editor._direction = "outgoing";
    editor._type = "feeds";
    editor._other = "a";

    await editor._save();

    assert.deepEqual(
      calls,
      [
        {
          type:
            "bindhome/relations/create",
          source_asset_id: "b",
          relation_type: "feeds",
          target_asset_id: "a",
        },
      ],
    );

    assert.equal(refreshes, 1);
    assert.equal(done, 1);

    editor.remove();
  },
);

test(
  "Relation editor incoming Save writes other to current exactly once",
  async () => {
    const calls = [];

    const editor = createRelationEditor({
      callWS: async (message) => {
        calls.push(message);
        return {};
      },
    });

    await settle(editor);

    editor._direction = "incoming";
    editor._type = "supplies";
    editor._other = "c";

    await editor._save();

    assert.deepEqual(
      calls,
      [
        {
          type:
            "bindhome/relations/create",
          source_asset_id: "c",
          relation_type: "supplies",
          target_asset_id: "b",
        },
      ],
    );

    editor.remove();
  },
);

test(
  "Relation editor Save is enabled only for a complete valid draft",
  async () => {
    const editor = createRelationEditor();

    await settle(editor);

    let save =
      editor.shadowRoot.querySelector(
        'button[type="submit"]',
      );

    assert.equal(save.disabled, true);

    editor._other = "a";
    editor._type = "Feeds";

    await settle(editor);

    save =
      editor.shadowRoot.querySelector(
        'button[type="submit"]',
      );

    assert.equal(save.disabled, true);

    editor._type = "feeds";

    await settle(editor);

    save =
      editor.shadowRoot.querySelector(
        'button[type="submit"]',
      );

    assert.equal(save.disabled, false);

    editor.remove();
  },
);

test(
  "Relation editor Cancel performs zero writes",
  async () => {
    const calls = [];
    let done = 0;

    const editor = createRelationEditor({
      callWS: async (message) => {
        calls.push(message);
        return {};
      },
      onDone: () => {
        done += 1;
      },
    });

    await settle(editor);

    editor._type = "feeds";
    editor._other = "a";
    editor._search = "Source";

    editor._cancel();

    assert.deepEqual(calls, []);
    assert.equal(done, 1);

    editor.remove();
  },
);

test(
  "Relation create failure preserves the complete draft for retry",
  async () => {
    const editor = createRelationEditor({
      callWS: async () => {
        throw new Error(
          "duplicate relation",
        );
      },
    });

    await settle(editor);

    editor._direction = "incoming";
    editor._type = "feeds";
    editor._other = "a";
    editor._search = "Source";

    await editor._save();

    assert.equal(
      editor._direction,
      "incoming",
    );
    assert.equal(editor._type, "feeds");
    assert.equal(editor._other, "a");
    assert.equal(
      editor._search,
      "Source",
    );
    assert.ok(editor._error);

    editor.remove();
  },
);

test(
  "Committed Relation create closes the draft and reports refresh failure once",
  async () => {
    const calls = [];
    const warnings = [];
    let done = 0;
    let refreshes = 0;

    const editor = createRelationEditor({
      callWS: async (message) => {
        calls.push(message);
        return {};
      },
      onDone: () => {
        done += 1;
      },
      onRefresh: async () => {
        refreshes += 1;
        throw new Error(
          "refresh failed",
        );
      },
      onSyncWarning: (message) => {
        warnings.push(message);
      },
    });

    await settle(editor);

    editor._type = "feeds";
    editor._other = "a";

    await editor._save();

    assert.equal(calls.length, 1);
    assert.equal(done, 1);
    assert.equal(refreshes, 1);

    assert.deepEqual(
      warnings,
      [
        "Saved, but the latest topology could not be refreshed.",
      ],
    );

    assert.equal(editor._error, null);

    editor.remove();
  },
);

test(
  "Same-identity Asset refresh preserves an active Relation draft",
  async () => {
    const editor = createRelationEditor();

    await settle(editor);

    editor._direction = "incoming";
    editor._type = "feeds";
    editor._other = "a";
    editor._search = "Source";

    editor.asset = {
      ...assets[1],
      name: "Middle refreshed",
    };

    await settle(editor);

    assert.equal(
      editor._direction,
      "incoming",
    );
    assert.equal(editor._type, "feeds");
    assert.equal(editor._other, "a");
    assert.equal(
      editor._search,
      "Source",
    );

    editor.remove();
  },
);

test(
  "Asset identity change clears a Relation draft",
  async () => {
    const editor = createRelationEditor();

    await settle(editor);

    editor._direction = "incoming";
    editor._type = "feeds";
    editor._other = "a";
    editor._search = "Source";

    editor.asset = assets[2];

    await settle(editor);

    assert.equal(
      editor._direction,
      "outgoing",
    );
    assert.equal(editor._type, "");
    assert.equal(editor._other, "");
    assert.equal(editor._search, "");

    editor.remove();
  },
);

test(
  "Late Relation create success cannot close or refresh a new Asset identity",
  async () => {
    const operation = deferred();
    let done = 0;
    let refreshes = 0;

    const editor = createRelationEditor({
      callWS: async () =>
        operation.promise,
      onDone: () => {
        done += 1;
      },
      onRefresh: async () => {
        refreshes += 1;
      },
    });

    await settle(editor);

    editor._type = "feeds";
    editor._other = "a";

    const save = editor._save();

    editor.asset = assets[2];

    await settle(editor);

    operation.resolve({});
    await save;

    assert.equal(done, 0);
    assert.equal(refreshes, 0);
    assert.equal(editor._error, null);

    assert.equal(
      editor.asset.id,
      "c",
    );

    assert.equal(editor._type, "");
    assert.equal(editor._other, "");

    editor.remove();
  },
);

test(
  "Late Relation create rejection cannot leak an error into a new Asset identity",
  async () => {
    const operation = deferred();

    const editor = createRelationEditor({
      callWS: async () =>
        operation.promise,
    });

    await settle(editor);

    editor._type = "feeds";
    editor._other = "a";

    const save = editor._save();

    editor.asset = assets[2];

    await settle(editor);

    operation.reject(
      new Error("old Asset failed"),
    );

    await save;

    assert.equal(editor._error, null);
    assert.equal(editor.asset.id, "c");

    editor.remove();
  },
);

test(
  "Late create refresh failure cannot attach a sync warning to a new Asset",
  async () => {
    const refresh = deferred();
    const refreshStarted = deferred();
    const warnings = [];

    const editor = createRelationEditor({
      callWS: async () => ({}),
      onRefresh: async () => {
        refreshStarted.resolve();
        return refresh.promise;
      },
      onSyncWarning: (message) => {
        warnings.push(message);
      },
    });

    await settle(editor);

    editor._type = "feeds";
    editor._other = "a";

    const save = editor._save();

    /*
     * Synchronize explicitly with the point where
     * the committed write is waiting on refresh.
     */
    await refreshStarted.promise;

    editor.asset = assets[2];
    await settle(editor);

    refresh.reject(
      new Error("old refresh failed"),
    );

    await save;

    assert.deepEqual(warnings, []);
    assert.equal(editor.asset.id, "c");
    assert.equal(editor._error, null);

    editor.remove();
  },
);

test(
  "Relation delete requires confirmation and Cancel performs zero writes",
  async () => {
    const calls = [];

    const relation = {
      id: "delete-me",
      source_asset_id: "b",
      target_asset_id: "c",
      relation_type: "serves",
    };

    const element =
      createDeleteTopology({
        relations: [relation],
        callWS: async (message) => {
          calls.push(message);
          return {};
        },
      });

    await settle(element);

    const deleteButton =
      element.shadowRoot.querySelector(
        "button.delete",
      );

    assert.ok(deleteButton);
    deleteButton.click();

    await settle(element);

    assert.equal(
      element._confirm,
      relation.id,
    );

    const cancel = [
      ...element.shadowRoot.querySelectorAll(
        ".confirm button",
      ),
    ].find((button) =>
      button.textContent.includes(
        "Cancel",
      ),
    );

    assert.ok(cancel);
    cancel.click();

    await settle(element);

    assert.equal(element._confirm, null);
    assert.deepEqual(calls, []);

    element.remove();
  },
);

test(
  "Relation delete sends exactly the selected relation_id",
  async () => {
    const calls = [];
    let refreshes = 0;

    const relation = {
      id: "relation-exact-id",
      source_asset_id: "b",
      target_asset_id: "c",
      relation_type: "serves",
    };

    const element =
      createDeleteTopology({
        relations: [relation],
        callWS: async (message) => {
          calls.push(message);
          return {};
        },
        onRefresh: async () => {
          refreshes += 1;
        },
      });

    await settle(element);

    element._confirm = relation.id;

    await element._delete(relation);

    assert.deepEqual(
      calls,
      [
        {
          type:
            "bindhome/relations/delete",
          relation_id:
            "relation-exact-id",
        },
      ],
    );

    assert.equal(refreshes, 1);
    assert.equal(element._confirm, null);

    element.remove();
  },
);

test(
  "Relation delete refresh removes only the intended Relation from presentation",
  async () => {
    const first = {
      id: "first",
      source_asset_id: "b",
      target_asset_id: "c",
      relation_type: "serves",
    };

    const second = {
      id: "second",
      source_asset_id: "a",
      target_asset_id: "b",
      relation_type: "feeds",
    };

    let element;

    element = createDeleteTopology({
      relations: [
        first,
        second,
      ],
      onRefresh: async () => {
        element.registry = {
          ...element.registry,
          relations: [second],
        };

        await settle(element);
      },
    });

    await settle(element);

    await element._delete(first);
    await settle(element);

    const text = shadowText(element);

    assert.doesNotMatch(
      text,
      /Target.*serves/,
    );

    assert.match(text, /Source/);
    assert.match(text, /feeds/);

    element.remove();
  },
);

test(
  "Relation delete failure preserves confirmation and exposes an error",
  async () => {
    const relation = {
      id: "relation-fail",
      source_asset_id: "b",
      target_asset_id: "c",
      relation_type: "serves",
    };

    const element =
      createDeleteTopology({
        relations: [relation],
        callWS: async () => {
          throw new Error(
            "delete failed",
          );
        },
      });

    await settle(element);

    element._confirm = relation.id;

    await element._delete(relation);
    await settle(element);

    assert.equal(
      element._confirm,
      relation.id,
    );

    assert.ok(element._error);
    assert.match(
      shadowText(element),
      /delete failed|Could not delete/,
    );

    element.remove();
  },
);

test(
  "Committed Relation delete reports refresh failure without retrying the delete",
  async () => {
    const calls = [];

    const relation = {
      id: "relation-refresh-fail",
      source_asset_id: "b",
      target_asset_id: "c",
      relation_type: "serves",
    };

    const element =
      createDeleteTopology({
        relations: [relation],
        callWS: async (message) => {
          calls.push(message);
          return {};
        },
        onRefresh: async () => {
          throw new Error(
            "refresh failed",
          );
        },
      });

    await settle(element);

    await element._delete(relation);
    await settle(element);

    assert.equal(calls.length, 1);

    assert.equal(
      element._sync,
      "Saved, but the latest topology could not be refreshed.",
    );

    assert.equal(element._error, null);

    element.remove();
  },
);

test(
  "Late Relation delete success cannot contaminate a new Asset identity",
  async () => {
    const operation = deferred();

    const relation = {
      id: "old-relation",
      source_asset_id: "b",
      target_asset_id: "a",
      relation_type: "feeds",
    };

    let refreshes = 0;

    const element =
      createDeleteTopology({
        relations: [relation],
        callWS: async () =>
          operation.promise,
        onRefresh: async () => {
          refreshes += 1;
        },
      });

    await settle(element);

    element._confirm = relation.id;

    const deletion =
      element._delete(relation);

    element.asset = assets[2];

    await settle(element);

    operation.resolve({});
    await deletion;

    assert.equal(refreshes, 0);
    assert.equal(element.asset.id, "c");
    assert.equal(element._error, null);
    assert.equal(element._sync, null);
    assert.equal(element._confirm, null);

    element.remove();
  },
);

test(
  "Late Relation delete rejection cannot leak an error into a new Asset identity",
  async () => {
    const operation = deferred();

    const relation = {
      id: "old-relation",
      source_asset_id: "b",
      target_asset_id: "a",
      relation_type: "feeds",
    };

    const element =
      createDeleteTopology({
        relations: [relation],
        callWS: async () =>
          operation.promise,
      });

    await settle(element);

    const deletion =
      element._delete(relation);

    element.asset = assets[2];

    await settle(element);

    operation.reject(
      new Error("old delete failed"),
    );

    await deletion;

    assert.equal(element.asset.id, "c");
    assert.equal(element._error, null);
    assert.equal(element._sync, null);

    element.remove();
  },
);

test(
  "Late delete refresh failure cannot attach a sync warning to a new Asset",
  async () => {
    const refresh = deferred();
    const refreshStarted = deferred();

    const relation = {
      id: "refresh-race",
      source_asset_id: "b",
      target_asset_id: "a",
      relation_type: "feeds",
    };

    const element =
      createDeleteTopology({
        relations: [relation],
        callWS: async () => ({}),
        onRefresh: async () => {
          refreshStarted.resolve();
          return refresh.promise;
        },
      });

    await settle(element);

    const deletion =
      element._delete(relation);

    /*
     * Synchronize explicitly with the point where
     * the committed delete is waiting on refresh.
     */
    await refreshStarted.promise;

    element.asset = assets[2];
    await settle(element);

    refresh.reject(
      new Error("old refresh failed"),
    );

    await deletion;

    assert.equal(element.asset.id, "c");
    assert.equal(element._sync, null);
    assert.equal(element._error, null);

    element.remove();
  },
);


test(
  "Relation conflict is localized instead of exposing the backend English message",
  async () => {
    const editor = createRelationEditor({
      callWS: async () => {
        const error = new Error(
          "The same topology relation already exists",
        );

        error.code = "conflict";
        throw error;
      },
    });

    editor.t = (key) => {
      if (key === "topology.duplicate_relation") {
        return "Esta relación de topología ya existe.";
      }

      if (key === "topology.save_error") {
        return "No se pudo guardar esta relación.";
      }

      return key;
    };

    await settle(editor);

    editor._direction = "incoming";
    editor._type = "feeds";
    editor._other = "a";
    editor._search = "UX-4 Source";

    await editor._save();

    assert.equal(
      editor._error,
      "Esta relación de topología ya existe.",
    );

    assert.equal(editor._direction, "incoming");
    assert.equal(editor._type, "feeds");
    assert.equal(editor._other, "a");
    assert.equal(editor._search, "UX-4 Source");

    assert.doesNotMatch(
      editor._error,
      /The same topology relation already exists/,
    );

    editor.remove();
  },
);
