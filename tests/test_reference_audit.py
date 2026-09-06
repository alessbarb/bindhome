"""Tests for read-only direct-reference auditing."""

from types import SimpleNamespace

import pytest
from homeassistant.components.lovelace.const import LOVELACE_DATA

from custom_components.bindhome import reference_audit
from custom_components.bindhome.reference_audit import (
    CLASS_DETERMINISTIC,
    CLASS_MANUAL,
    ReferenceAuditTarget,
    async_audit_direct_references,
    scan_dashboard_config,
)


def _target(
    *, logical: tuple[str, ...] = ("light.bindhome_ceiling",)
) -> ReferenceAuditTarget:
    return ReferenceAuditTarget(
        entity_id="light.shelly_ceiling",
        bindings=(
            {
                "binding_id": "binding-1",
                "asset_id": "ceiling",
                "capability": "on_off",
                "role": "primary",
            },
        ),
        logical_entity_ids=logical,
    )


def test_dashboard_audit_distinguishes_exact_reference_from_template() -> None:
    targets = {"light.shelly_ceiling": _target()}

    references = scan_dashboard_config(
        {
            "views": [
                {
                    "cards": [
                        {"type": "light", "entity": "light.shelly_ceiling"},
                        {
                            "type": "markdown",
                            "content": "{{ states('light.shelly_ceiling') }}",
                        },
                    ]
                }
            ]
        },
        targets,
        dashboard_id="lovelace",
    )

    assert [(item.match_kind, item.classification) for item in references] == [
        ("direct", CLASS_DETERMINISTIC),
        ("template", CLASS_MANUAL),
    ]
    assert references[0].path == "views[0].cards[0].entity"
    assert references[0].replacement_entity_id == "light.bindhome_ceiling"
    assert references[1].path == "views[0].cards[1].content"


def test_exact_reference_without_unique_representation_requires_manual_review() -> None:
    references = scan_dashboard_config(
        {"entity": "light.shelly_ceiling"},
        {"light.shelly_ceiling": _target(logical=())},
        dashboard_id="lovelace",
    )

    assert len(references) == 1
    assert references[0].classification == CLASS_MANUAL
    assert references[0].replacement_entity_id is None


class _States:
    def get(self, entity_id: str):
        return SimpleNamespace(name=f"Name for {entity_id}")


class _Dashboard:
    async def async_load(self, force: bool):
        assert force is False
        return {"entity": "light.shelly_ceiling"}


class _BrokenDashboard:
    async def async_load(self, force: bool):
        assert force is False
        raise RuntimeError("cannot read")


@pytest.mark.asyncio
async def test_audit_reports_consumers_and_incomplete_dashboard_sources(
    monkeypatch,
) -> None:
    target = _target()
    monkeypatch.setattr(
        reference_audit,
        "reference_audit_targets",
        lambda hass, registry: {target.entity_id: target},
    )
    monkeypatch.setattr(
        reference_audit,
        "automations_with_entity",
        lambda hass, entity_id: ["automation.arrival"],
    )
    monkeypatch.setattr(
        reference_audit,
        "scripts_with_entity",
        lambda hass, entity_id: ["script.movie_mode"],
    )
    monkeypatch.setattr(
        reference_audit,
        "scenes_with_entity",
        lambda hass, entity_id: ["scene.evening"],
    )

    hass = SimpleNamespace(
        config=SimpleNamespace(
            components={"automation", "script", "scene", "lovelace"}
        ),
        data={
            LOVELACE_DATA: SimpleNamespace(
                dashboards={None: _Dashboard(), "tablet-home": _BrokenDashboard()}
            )
        },
        states=_States(),
    )

    result = await async_audit_direct_references(hass, object())

    assert result["summary"] == {
        "bound_backing_entities": 1,
        "referenced_backing_entities": 1,
        "references": 4,
        "deterministic_rewrites": 2,
        "manual_review": 2,
        "incomplete_sources": 1,
    }
    group = result["groups"][0]
    assert group["entity_id"] == "light.shelly_ceiling"
    assert group["reference_count"] == 4
    assert {item["consumer_type"] for item in group["references"]} == {
        "automation",
        "script",
        "scene",
        "dashboard",
    }
    assert any(
        source["status"] == "unreadable" and source["consumer_id"] == "tablet-home"
        for source in result["sources"]
    )


@pytest.mark.asyncio
async def test_unloaded_sources_are_explicit_not_empty(monkeypatch) -> None:
    target = _target()
    monkeypatch.setattr(
        reference_audit,
        "reference_audit_targets",
        lambda hass, registry: {target.entity_id: target},
    )

    hass = SimpleNamespace(
        config=SimpleNamespace(components=set()),
        data={},
        states=_States(),
    )

    result = await async_audit_direct_references(hass, object())

    assert result["summary"]["references"] == 0
    assert result["summary"]["incomplete_sources"] == 4
    assert {source["status"] for source in result["sources"]} == {"not_loaded"}
