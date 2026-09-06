import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";

import {
  buildPanelUrl,
  emptyPanelRoute,
  navigatePanelUrl,
  parsePanelRoute,
} from "../src/routing/panel-route.js";

test("empty and unknown route tails fail closed to Home", () => {
  assert.deepEqual(parsePanelRoute({ prefix: "/bindhome", path: "" }), emptyPanelRoute());
  assert.deepEqual(
    parsePanelRoute({ prefix: "/bindhome", path: "/unknown/thing" }),
    emptyPanelRoute(),
  );
  assert.deepEqual(
    parsePanelRoute({ prefix: "/bindhome", path: "/home/a/b/extra" }),
    emptyPanelRoute(),
  );
});

test("Home routes preserve encoded Area and stable Asset identity", () => {
  assert.deepEqual(
    parsePanelRoute({ prefix: "/bindhome", path: "/home/Kitchen%20West/socket%2F1" }),
    {
      ...emptyPanelRoute(),
      areaId: "Kitchen West",
      assetId: "socket/1",
    },
  );
  assert.equal(
    buildPanelUrl({
      ...emptyPanelRoute(),
      areaId: "Kitchen West",
      assetId: "socket/1",
    }),
    "/bindhome/home/Kitchen%20West/socket%2F1",
  );
});

test("malformed encoded route identities do not leak stale selection", () => {
  assert.deepEqual(
    parsePanelRoute({ prefix: "/bindhome", path: "/home/%E0%A4%A/a" }),
    emptyPanelRoute(),
  );
});

test("Add and Search round-trip their supported query context", () => {
  const add = parsePanelRoute(
    { prefix: "/bindhome", path: "/add" },
    "?area=kitchen%20west",
  );
  assert.deepEqual(add, {
    ...emptyPanelRoute(),
    view: "add",
    contextAreaId: "kitchen west",
  });
  assert.equal(buildPanelUrl(add), "/bindhome/add?area=kitchen+west");

  const search = parsePanelRoute(
    { prefix: "/bindhome", path: "/search" },
    "?q=breaker+panel",
  );
  assert.deepEqual(search, {
    ...emptyPanelRoute(),
    view: "search",
    query: "breaker panel",
  });
  assert.equal(buildPanelUrl(search), "/bindhome/search?q=breaker+panel");
});

test("Advanced route addresses one technical Asset without changing pin preference", () => {
  const route = parsePanelRoute({
    prefix: "/bindhome",
    path: "/advanced/panel%2Fmain",
  });
  assert.deepEqual(route, {
    ...emptyPanelRoute(),
    view: "advanced",
    advancedAssetId: "panel/main",
  });
  assert.equal(buildPanelUrl(route), "/bindhome/advanced/panel%2Fmain");
});

test("serializer uses the supplied Home Assistant panel prefix", () => {
  assert.equal(
    buildPanelUrl({ ...emptyPanelRoute(), view: "search", query: "socket" }, "/my-bindhome/"),
    "/my-bindhome/search?q=socket",
  );
});

test("history push mirrors Home Assistant from bookkeeping and fires location change", () => {
  const window = new Window({ url: "http://localhost/bindhome/home" });
  const events = [];
  window.addEventListener("location-changed", (event) => events.push(event.detail));

  assert.equal(
    navigatePanelUrl("/bindhome/search?q=socket", { window }),
    true,
  );
  assert.equal(window.location.pathname, "/bindhome/search");
  assert.equal(window.location.search, "?q=socket");
  assert.equal(window.history.state.from, "/bindhome/home");
  assert.deepEqual(events, [{ replace: false }]);

  assert.equal(
    navigatePanelUrl("/bindhome/search?q=socket", { window }),
    false,
  );
  assert.deepEqual(events, [{ replace: false }]);
});

test("history replace preserves HA root/from bookkeeping but drops transient state", () => {
  const window = new Window({ url: "http://localhost/bindhome/search?q=a" });
  window.history.replaceState(
    { root: true, from: "/bindhome/home", dialog: "temporary" },
    "",
    "/bindhome/search?q=a",
  );
  const events = [];
  window.addEventListener("location-changed", (event) => events.push(event.detail));

  assert.equal(
    navigatePanelUrl("/bindhome/search?q=ab", { replace: true, window }),
    true,
  );
  assert.deepEqual(window.history.state, {
    root: true,
    from: "/bindhome/home",
  });
  assert.deepEqual(events, [{ replace: true }]);
});
