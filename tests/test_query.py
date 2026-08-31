"""Tests for the pure BindHome infrastructure query layer."""

from __future__ import annotations

import json

import pytest

from custom_components.bindhome import query
from custom_components.bindhome.models import Asset, Binding, Relation
from custom_components.bindhome.registry import BindHomeRegistry, RegistryNotFoundError
from custom_components.bindhome.resolver import StaticEntityProbe


def _asset(asset_id: str, capabilities: tuple[str, ...] = ()) -> Asset:
    return Asset(
        id=asset_id, name=asset_id.upper(), asset_type="node", capabilities=capabilities
    )


def _relation(
    rel_id: str, source: str, target: str, rel_type: str = "feeds"
) -> Relation:
    return Relation(
        id=rel_id,
        source_asset_id=source,
        relation_type=rel_type,
        target_asset_id=target,
    )


def _build(assets, relations, *, order_relations=None) -> BindHomeRegistry:
    registry = BindHomeRegistry()
    for asset in assets:
        registry.add_asset(asset)
    for relation in order_relations if order_relations is not None else relations:
        registry.add_relation(relation)
    return registry


# ---------------------------------------------------------------------------
# Asset + relation reads
# ---------------------------------------------------------------------------


def test_list_assets_is_sorted_by_id() -> None:
    registry = _build([_asset("c"), _asset("a"), _asset("b")], [])
    assert [a.id for a in query.list_assets(registry)] == ["a", "b", "c"]


def test_get_asset_unknown_raises() -> None:
    with pytest.raises(RegistryNotFoundError):
        query.get_asset(BindHomeRegistry(), "missing")


def test_incoming_and_outgoing_relations_respect_direction() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c")],
        [_relation("r1", "a", "b"), _relation("r2", "c", "b")],
    )
    assert [r.source_asset_id for r in query.incoming_relations(registry, "b")] == [
        "a",
        "c",
    ]
    assert query.outgoing_relations(registry, "b") == []
    assert len(query.relations_for_asset(registry, "b")) == 2


def test_relation_type_filter_is_normalized() -> None:
    registry = _build(
        [_asset("a"), _asset("b")],
        [_relation("r1", "a", "b", "powers"), _relation("r2", "a", "b", "monitors")],
    )
    out = query.outgoing_relations(registry, "a", ["POWERS"])
    assert [r.relation_type for r in out] == ["powers"]


def test_relation_query_unknown_asset_raises() -> None:
    with pytest.raises(RegistryNotFoundError):
        query.outgoing_relations(BindHomeRegistry(), "nope")


# ---------------------------------------------------------------------------
# Traversal + cycles
# ---------------------------------------------------------------------------


def test_traverse_direct_neighbours_only_with_max_depth() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c")],
        [_relation("r1", "a", "b"), _relation("r2", "b", "c")],
    )
    hits = query.traverse(registry, "a", "outgoing", max_depth=1)
    assert [(h.asset_id, h.depth) for h in hits] == [("b", 1)]


def test_traverse_recursive_excludes_start() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c")],
        [_relation("r1", "a", "b"), _relation("r2", "b", "c")],
    )
    hits = query.traverse(registry, "a", "outgoing")
    assert [(h.asset_id, h.depth) for h in hits] == [("b", 1), ("c", 2)]


def test_traverse_two_node_cycle_terminates() -> None:
    registry = _build(
        [_asset("a"), _asset("b")],
        [_relation("r1", "a", "b"), _relation("r2", "b", "a")],
    )
    hits = query.traverse(registry, "a", "outgoing")
    assert [h.asset_id for h in hits] == ["b"]


def test_traverse_longer_cycle_terminates() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c")],
        [
            _relation("r1", "a", "b"),
            _relation("r2", "b", "c"),
            _relation("r3", "c", "a"),
        ],
    )
    assert query.reachable_assets(registry, "a", "outgoing") == ["b", "c"]


def test_traverse_diamond_visits_join_once_at_min_depth() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c"), _asset("d")],
        [
            _relation("r1", "a", "b"),
            _relation("r2", "a", "c"),
            _relation("r3", "b", "d"),
            _relation("r4", "c", "d"),
        ],
    )
    hits = {h.asset_id: h.depth for h in query.traverse(registry, "a", "outgoing")}
    assert hits == {"b": 1, "c": 1, "d": 2}


def test_traverse_direction_any_follows_both_edges() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c")],
        [_relation("r1", "a", "b"), _relation("r2", "c", "b")],
    )
    assert query.reachable_assets(registry, "a", "incoming") == []
    assert query.reachable_assets(registry, "a", "any") == ["b", "c"]


def test_traverse_relation_type_filter() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c")],
        [
            _relation("r1", "a", "b", "powers"),
            _relation("r2", "b", "c", "monitors"),
        ],
    )
    assert query.reachable_assets(registry, "a", "outgoing", ["powers"]) == ["b"]


def test_traverse_unknown_asset_raises() -> None:
    with pytest.raises(RegistryNotFoundError):
        query.traverse(BindHomeRegistry(), "ghost")


# ---------------------------------------------------------------------------
# Determinism
# ---------------------------------------------------------------------------


def test_traversal_is_insertion_order_independent() -> None:
    assets = [_asset(x) for x in ("a", "b", "c", "d")]
    relations = [
        _relation("r1", "a", "b"),
        _relation("r2", "a", "c"),
        _relation("r3", "b", "d"),
        _relation("r4", "c", "d"),
    ]
    forward = _build(assets, relations)
    reverse = _build(
        list(reversed(assets)), relations, order_relations=list(reversed(relations))
    )
    a_forward = json.dumps([h.to_dict() for h in query.traverse(forward, "a", "any")])
    a_reverse = json.dumps([h.to_dict() for h in query.traverse(reverse, "a", "any")])
    assert a_forward == a_reverse


# ---------------------------------------------------------------------------
# Path finding
# ---------------------------------------------------------------------------


def test_find_path_shortest() -> None:
    registry = _build(
        [_asset("a"), _asset("b"), _asset("c"), _asset("d")],
        [
            _relation("r1", "a", "b"),
            _relation("r2", "b", "d"),
            _relation("r3", "a", "c"),
            _relation("r4", "c", "d"),
        ],
    )
    assert query.find_path(registry, "a", "d", "outgoing") in (
        ["a", "b", "d"],
        ["a", "c", "d"],
    )


def test_find_path_equal_length_tie_break_is_deterministic() -> None:
    assets = [_asset(x) for x in ("a", "b", "c", "d")]
    relations = [
        _relation("r1", "a", "c"),
        _relation("r2", "a", "b"),
        _relation("r3", "b", "d"),
        _relation("r4", "c", "d"),
    ]
    one = query.find_path(_build(assets, relations), "a", "d", "outgoing")
    two = query.find_path(
        _build(
            list(reversed(assets)),
            relations,
            order_relations=list(reversed(relations)),
        ),
        "a",
        "d",
        "outgoing",
    )
    assert one == two == ["a", "b", "d"]


def test_find_path_none_when_unreachable() -> None:
    registry = _build([_asset("a"), _asset("b")], [_relation("r1", "a", "b")])
    assert query.find_path(registry, "b", "a", "outgoing") is None


def test_find_path_same_endpoint_is_singleton() -> None:
    registry = _build([_asset("a")], [])
    assert query.find_path(registry, "a", "a") == ["a"]


def test_find_path_respects_direction() -> None:
    registry = _build([_asset("a"), _asset("b")], [_relation("r1", "a", "b")])
    assert query.find_path(registry, "b", "a", "incoming") == ["b", "a"]


def test_find_path_unknown_endpoint_raises() -> None:
    registry = _build([_asset("a")], [])
    with pytest.raises(RegistryNotFoundError):
        query.find_path(registry, "a", "z")


# ---------------------------------------------------------------------------
# Resolver / binding status read model
# ---------------------------------------------------------------------------


def _status_registry() -> BindHomeRegistry:
    registry = BindHomeRegistry()
    registry.add_asset(_asset("a", ("on_off", "dimming")))
    registry.add_asset(_asset("b", ("temperature",)))
    registry.set_binding(
        Binding(id="x1", asset_id="a", capability="on_off", entity_id="light.a")
    )
    registry.set_binding(
        Binding(id="x2", asset_id="a", capability="dimming", entity_id="light.gone")
    )
    registry.set_binding(
        Binding(id="x3", asset_id="b", capability="temperature", entity_id="sensor.b")
    )
    return registry


def test_binding_statuses_cover_declared_but_unbound_capabilities() -> None:
    registry = BindHomeRegistry()
    registry.add_asset(_asset("a", ("on_off",)))
    statuses = query.binding_statuses(registry, StaticEntityProbe())
    assert [(s.capability, s.status) for s in statuses] == [
        ("on_off", "binding_not_found")
    ]


def test_resolver_status_composition_and_serializable() -> None:
    registry = _status_registry()
    probe = StaticEntityProbe(
        registered={"light.a"},
        states={"light.a": "on", "sensor.b": "unknown"},
    )
    result = query.resolver_status(registry, probe)
    json.dumps(result)

    by_key = {(r["asset_id"], r["capability"]): r["status"] for r in result["records"]}
    assert by_key[("a", "on_off")] == "resolved"
    assert by_key[("a", "dimming")] == "entity_not_found"
    assert by_key[("b", "temperature")] == "runtime_unknown"

    summary = result["summary"]
    assert summary["total"] == 3
    assert summary["config_valid"] == 2  # resolved + runtime_unknown
    assert summary["runtime_available"] == 1
    assert summary["by_status"] == {
        "entity_not_found": 1,
        "resolved": 1,
        "runtime_unknown": 1,
    }


def test_resolver_status_records_are_sorted() -> None:
    registry = _status_registry()
    result = query.resolver_status(registry, StaticEntityProbe())
    keys = [(r["asset_id"], r["capability"], r["role"]) for r in result["records"]]
    assert keys == sorted(keys)
