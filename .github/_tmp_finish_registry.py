from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"missing marker: {label}")
    return text.replace(old, new, 1)


# Keep the revision-aware WebSocket contract additive for existing clients.
ws_path = Path("custom_components/bindhome/websocket.py")
ws = ws_path.read_text()
ws = replace_once(
    ws,
    '''_REVISION_FIELD = {
    vol.Optional("based_on_revision"): vol.All(int, vol.Range(min=0)),
}
''',
    '''_REVISION_FIELD = {
    vol.Optional("based_on_revision"): vol.All(int, vol.Range(min=0)),
}


def _revision_kwargs(msg: dict[str, Any]) -> dict[str, int]:
    """Return manager kwargs only for revision-aware clients."""
    if "based_on_revision" not in msg:
        return {}
    return {"expected_revision": msg["based_on_revision"]}


def _revision_result(
    msg: dict[str, Any], manager: BindHomeManager
) -> dict[str, int]:
    """Extend mutation results only for revision-aware clients."""
    if "based_on_revision" not in msg:
        return {}
    return {"revision": manager.revision}
''',
    "websocket revision helpers",
)
ws = replace_once(
    ws,
    '''        result = manager.registry.to_dict()
        result["revision"] = manager.revision''',
    '''        result = {**manager.registry.to_dict(), "revision": manager.revision}''',
    "registry get copy",
)
expected_line = '            expected_revision=msg.get("based_on_revision"),\n'
count = ws.count(expected_line)
if count == 0:
    raise SystemExit("no websocket mutation revision kwargs found")
ws = ws.replace(expected_line, '            **_revision_kwargs(msg),\n')
ws = re.sub(
    r'\{("(?:asset|relation|binding)": [^\n{}]+), "revision": manager\.revision\}',
    r'{\1, **_revision_result(msg, manager)}',
    ws,
)
ws = ws.replace(
    '{"deleted": True, "revision": manager.revision}',
    '{"deleted": True, **_revision_result(msg, manager)}',
)
ws = ws.replace(
    '            "revision": manager.revision,\n',
    '            **_revision_result(msg, manager),\n',
)
if 'expected_revision=msg.get("based_on_revision")' in ws:
    raise SystemExit("unconditional expected_revision remains in websocket.py")
ws_path.write_text(ws)

# Safe dependency deletion follows the same additive contract.
delete_ws_path = Path("custom_components/bindhome/deletion_websocket.py")
delete_ws = delete_ws_path.read_text()
delete_ws = replace_once(
    delete_ws,
    '''    result = impact.to_dict()
    result["revision"] = manager.revision
    connection.send_result(msg["id"], result)''',
    '''    connection.send_result(msg["id"], impact.to_dict())''',
    "delete impact legacy response",
)
delete_ws = replace_once(
    delete_ws,
    '''            expected_revision=msg.get("based_on_revision"),''',
    '''            **(
                {"expected_revision": msg["based_on_revision"]}
                if "based_on_revision" in msg
                else {}
            ),''',
    "safe delete revision kwargs",
)
delete_ws = replace_once(
    delete_ws,
    '''            "revision": manager.revision,
''',
    '''            **(
                {"revision": manager.revision}
                if "based_on_revision" in msg
                else {}
            ),
''',
    "safe delete revision result",
)
delete_ws_path.write_text(delete_ws)

# Live backup restore also remains byte-for-byte compatible for old callers.
backup_ws_path = Path("custom_components/bindhome/backup_websocket.py")
backup_ws = backup_ws_path.read_text()
backup_ws = replace_once(
    backup_ws,
    '''                expected_revision=msg.get("based_on_revision"),''',
    '''                **(
                    {"expected_revision": msg["based_on_revision"]}
                    if "based_on_revision" in msg
                    else {}
                ),''',
    "backup restore revision kwargs",
)
backup_ws = replace_once(
    backup_ws,
    '''    if manager is not None:
        result["revision"] = manager.revision''',
    '''    if manager is not None and "based_on_revision" in msg:
        result["revision"] = manager.revision''',
    "backup restore revision response",
)
backup_ws_path.write_text(backup_ws)

# Exercise the raw functions regardless of decorator depth.
live_test_path = Path("tests/test_registry_live_websocket.py")
live_test = live_test_path.read_text()
live_test = replace_once(
    live_test,
    '''def call_async(handler, hass, connection, msg):
    """Call through async response and admin/command wrappers."""
    return handler.__wrapped__.__wrapped__(hass, connection, msg)


def call_sync(handler, hass, connection, msg):
    """Call through admin/command wrappers."""
    return handler.__wrapped__.__wrapped__(hass, connection, msg)''',
    '''def _unwrap(handler):
    while hasattr(handler, "__wrapped__"):
        handler = handler.__wrapped__
    return handler


def call_async(handler, hass, connection, msg):
    """Call the raw async WebSocket implementation."""
    return _unwrap(handler)(hass, connection, msg)


def call_sync(handler, hass, connection, msg):
    """Call the raw synchronous WebSocket implementation."""
    return _unwrap(handler)(hass, connection, msg)''',
    "websocket test decorator unwrapping",
)
live_test_path.write_text(live_test)

panel_path = Path("frontend/src/bindhome-panel.js")
text = panel_path.read_text()
text = replace_once(
    text,
    'import { createBindHomeApi } from "./api/bindhome-api.js";',
    '''import {
  createBindHomeApi,
  subscribeBindHomeConflicts,
} from "./api/bindhome-api.js";''',
    "panel API import",
)
text = replace_once(
    text,
    '    _onboardingVisible: { state: true },\n',
    '    _onboardingVisible: { state: true },\n    _registryConflict: { state: true },\n',
    "panel property",
)
text = replace_once(
    text,
    '''    this._onboardingPreferenceIdentity = null;
    this._hassByView = { home: null, add: null, advanced: null };''',
    '''    this._onboardingPreferenceIdentity = null;
    this._registryConflict = false;
    this._registryUnsubscribe = null;
    this._registrySubscriptionConnection = null;
    this._registrySubscriptionGeneration = 0;
    this._registryRefreshPromise = null;
    this._conflictUnsubscribe = null;
    this._reloadAfterConflictHandler = () => this._reloadAfterConflict();
    this._hassByView = { home: null, add: null, advanced: null };''',
    "panel constructor",
)

lifecycle = '''  connectedCallback() {
    super.connectedCallback();
    if (this.hass && this._initialized) this._ensureRegistrySubscription();
  }
  disconnectedCallback() {
    this._dropRegistrySubscription();
    this._dropConflictSubscription();
    super.disconnectedCallback();
  }
  _dropRegistrySubscription() {
    this._registrySubscriptionGeneration += 1;
    const unsubscribe = this._registryUnsubscribe;
    this._registryUnsubscribe = null;
    this._registrySubscriptionConnection = null;
    if (typeof unsubscribe === "function") unsubscribe();
  }
  _dropConflictSubscription() {
    const unsubscribe = this._conflictUnsubscribe;
    this._conflictUnsubscribe = null;
    if (typeof unsubscribe === "function") unsubscribe();
  }
  async _ensureRegistrySubscription() {
    const connection = this.hass?.connection;
    if (!connection || connection === this._registrySubscriptionConnection) return;

    this._dropRegistrySubscription();
    this._dropConflictSubscription();
    const generation = ++this._registrySubscriptionGeneration;
    this._registrySubscriptionConnection = connection;
    this._conflictUnsubscribe = subscribeBindHomeConflicts(this.hass, () => {
      this._registryConflict = true;
    });

    try {
      const unsubscribe = await createBindHomeApi(
        this.hass,
      ).subscribeRegistryChanges((event) => this._registryChanged(event));
      if (
        generation !== this._registrySubscriptionGeneration ||
        connection !== this._registrySubscriptionConnection
      ) {
        unsubscribe();
        return;
      }
      this._registryUnsubscribe = unsubscribe;
    } catch (error) {
      if (
        generation === this._registrySubscriptionGeneration &&
        connection === this._registrySubscriptionConnection
      ) {
        this._registrySubscriptionConnection = null;
        this._dropConflictSubscription();
        this._refreshError = error?.message || this._t("shell.refresh_error");
      }
    }
  }
  _registryChanged(event) {
    if (!Number.isInteger(event?.revision) || event.revision < 0) return;
    const current = this._registry?.revision;
    if (Number.isInteger(current) && event.revision <= current) return;
    this._refreshRegistryFromEvent();
  }
  async _refreshRegistryFromEvent() {
    if (!this.hass) return;
    if (this._registryRefreshPromise) return this._registryRefreshPromise;

    const generation = ++this._dataGeneration;
    const api = createBindHomeApi(this.hass);
    this._registryRefreshPromise = Promise.all([
      api.getRegistry(),
      api.listBindingStatuses(),
    ]);
    try {
      const [registry, bindingStatuses] = await this._registryRefreshPromise;
      if (generation !== this._dataGeneration) return;
      this._registry = registry;
      this._assets = registry.assets ?? this._assets;
      this._bindingStatuses = bindingStatuses;
      this._refreshError = null;
      this._syncOnboardingVisibility();
    } catch (error) {
      if (generation === this._dataGeneration) {
        this._refreshError = error?.message || this._t("shell.refresh_error");
      }
    } finally {
      this._registryRefreshPromise = null;
    }
  }
  async _reloadAfterConflict() {
    await this._load(false);
  }
'''
text = replace_once(
    text,
    '  static styles = css`\n',
    lifecycle + '  static styles = css`\n',
    "panel lifecycle insertion",
)
text = replace_once(
    text,
    '''    else if (
      changed.has("hass") &&
      this.hass &&
      this._initialized &&
      (this.hass.language || "en") !== this._translationLanguage
    )
      this._loadTranslations(this.hass.language || "en");''',
    '''    else if (
      changed.has("hass") &&
      this.hass &&
      this._initialized &&
      (this.hass.language || "en") !== this._translationLanguage
    )
      this._loadTranslations(this.hass.language || "en");
    if (changed.has("hass") && this.hass && this._initialized) {
      this._ensureRegistrySubscription();
    }''',
    "panel updated subscription",
)
text = replace_once(
    text,
    '''      this._deviceRegistry = deviceRegistry;
      this._t = translator;
      this._translationLanguage = language;''',
    '''      this._deviceRegistry = deviceRegistry;
      this._t = translator;
      this._translationLanguage = language;
      this._registryConflict = false;
      this._ensureRegistrySubscription();''',
    "panel load subscription",
)
text = replace_once(
    text,
    '''      ${this._refreshError
        ? html`<div class="refresh-error" role="alert">${this._t("shell.refresh_error")} ${this._refreshError}</div>`
        : null}
      <main>''',
    '''      ${this._registryConflict
        ? html`<div class="refresh-error registry-conflict" role="alert">
            <span>${this._t("shell.registry_conflict")}</span>
            <button class="retry" @click=${this._reloadAfterConflictHandler}>
              ${this._t("shell.registry_conflict_reload")}
            </button>
          </div>`
        : null}
      ${this._refreshError
        ? html`<div class="refresh-error" role="alert">${this._t("shell.refresh_error")} ${this._refreshError}</div>`
        : null}
      <main>''',
    "panel conflict banner",
)
panel_path.write_text(text)

translations = {
    "en": (
        '    "panel_shell_refresh_error": "Refresh failed. Your current work was preserved.",',
        '    "panel_shell_refresh_error": "Refresh failed. Your current work was preserved.",\n'
        '    "panel_shell_registry_conflict": "BindHome changed in another session. Reload the latest data before trying again.",\n'
        '    "panel_shell_registry_conflict_reload": "Reload latest",',
    ),
    "es": (
        '    "panel_shell_refresh_error": "Falló la actualización. Tu trabajo actual se ha conservado.",',
        '    "panel_shell_refresh_error": "Falló la actualización. Tu trabajo actual se ha conservado.",\n'
        '    "panel_shell_registry_conflict": "BindHome ha cambiado en otra sesión. Recarga los datos más recientes antes de volver a intentarlo.",\n'
        '    "panel_shell_registry_conflict_reload": "Recargar datos",',
    ),
}
for language, (old, new) in translations.items():
    path = Path(f"custom_components/bindhome/translations/{language}.json")
    path.write_text(replace_once(path.read_text(), old, new, f"{language} translation"))

ws_test = Path("tests/test_websocket.py")
source = ws_test.read_text()
source = replace_once(
    source,
    '''    def __init__(self) -> None:
        self.registry = Mock()''',
    '''    def __init__(self) -> None:
        self.revision = 0
        self.registry = Mock()''',
    "websocket fake manager revision",
)
source = replace_once(
    source,
    '    assert connection.results == [("1", manager.registry.to_dict.return_value)]',
    '''    assert connection.results == [
        ("1", {**manager.registry.to_dict.return_value, "revision": 0})
    ]''',
    "registry get assertion",
)
source = replace_once(
    source,
    '''        websocket.WS_REGISTRY_GET,
        websocket.WS_ASSET_CREATE,''',
    '''        websocket.WS_REGISTRY_GET,
        websocket.WS_REGISTRY_SUBSCRIBE,
        websocket.WS_ASSET_CREATE,''',
    "registered websocket command set",
)
ws_test.write_text(source)

Path("frontend/test/registry-live-panel.test.js").write_text(r'''import assert from "node:assert/strict";
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

const { createBindHomeApi } = await import("../src/api/bindhome-api.js");
await import("../src/bindhome-panel.js");

function harness() {
  let listener = null;
  let unsubscribeCount = 0;
  let revision = 1;
  let assets = [
    { id: "asset-1", name: "Before", asset_type: "socket", capabilities: [] },
  ];
  let conflictNext = false;
  const connection = {
    async subscribeMessage(callback, message) {
      assert.deepEqual(message, { type: "bindhome/registry/subscribe" });
      listener = callback;
      return () => {
        unsubscribeCount += 1;
        listener = null;
      };
    },
  };
  const hass = {
    connection,
    language: "en",
    user: { id: "user-1" },
    async callWS(message) {
      if (message.type === "bindhome/registry/get") {
        return {
          schema_version: 2,
          assets,
          relations: [],
          bindings: [],
          representations: [],
          revision,
        };
      }
      if (message.type === "bindhome/bindings/status") {
        return { records: [], summary: {} };
      }
      if (conflictNext) {
        conflictNext = false;
        throw { code: "conflict", message: "stale" };
      }
      return { revision: ++revision };
    },
  };
  return {
    hass,
    emit(event) {
      listener?.(event);
    },
    setAssets(next) {
      assets = next;
      revision += 1;
    },
    conflict() {
      conflictNext = true;
    },
    unsubscribeCount: () => unsubscribeCount,
  };
}

async function settle(element) {
  await element.updateComplete;
  await window.happyDOM.waitUntilComplete();
  await element.updateComplete;
}

test("a Registry event refreshes another panel without polling", async () => {
  const h = harness();
  const panel = document.createElement("bindhome-panel");
  panel.hass = h.hass;
  panel._initialized = true;
  panel._registry = { revision: 1, assets: [] };
  await panel._ensureRegistrySubscription();

  h.setAssets([
    { id: "asset-1", name: "After", asset_type: "socket", capabilities: [] },
  ]);
  h.emit({ revision: 2 });
  await panel._registryRefreshPromise;

  assert.equal(panel._assets[0].name, "After");
  assert.equal(panel._registry.revision, 2);
});

test("a stale mutation exposes reload and cleanup removes the listener", async () => {
  const h = harness();
  const panel = document.createElement("bindhome-panel");
  panel.hass = h.hass;
  panel._initialized = true;
  panel._t = (key) => key;
  await createBindHomeApi(h.hass).getRegistry();
  await panel._ensureRegistrySubscription();

  h.conflict();
  await assert.rejects(
    createBindHomeApi(h.hass).deleteBinding("binding-1"),
    (error) => error.code === "conflict",
  );
  await settle(panel);

  assert.equal(panel._registryConflict, true);
  assert.ok(panel.shadowRoot.querySelector(".registry-conflict .retry"));

  panel._dropRegistrySubscription();
  panel._dropConflictSubscription();
  assert.equal(h.unsubscribeCount(), 1);
});
''')
