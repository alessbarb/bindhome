"""Regression tests for BindHome Home Assistant diagnostics and redaction."""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from homeassistant.config_entries import ConfigEntryState

from custom_components.bindhome import diagnostics
from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import StaticEntityProbe


def _asset(
    registry: BindHomeRegistry,
    *,
    name: str = "Socket",
    code: str | None = None,
) -> Asset:
    return registry.add_asset(
        Asset.create(
            name=name,
            asset_type="socket",
            code=code,
            capabilities=["on_off"],
        )
    )


def _bind(
    registry: BindHomeRegistry,
    asset: Asset,
    entity_id: str,
) -> None:
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=entity_id,
        )
    )


def test_empty_registry_diagnostics_are_deterministic() -> None:
    snapshot = diagnostics._registry_diagnostics(
        BindHomeRegistry(),
        StaticEntityProbe(),
    )

    assert snapshot["counts"] == {
        "assets": 0,
        "relations": 0,
        "bindings": 0,
        "representations": 0,
    }
    assert snapshot["resolver"]["configured_bindings"] == 0
    assert snapshot["resolver"]["config_valid"] == 0
    assert snapshot["resolver"]["runtime_available"] == 0
    assert all(count == 0 for count in snapshot["resolver"]["statuses"].values())


def test_unresolved_and_stale_bindings_are_aggregated_without_ids() -> None:
    registry = BindHomeRegistry()
    stale = _asset(registry, name="Stale socket")
    offline = _asset(registry, name="Offline socket")
    _bind(registry, stale, "switch.removed_hardware")
    _bind(registry, offline, "switch.offline_hardware")

    snapshot = diagnostics._registry_diagnostics(
        registry,
        StaticEntityProbe(registered={"switch.offline_hardware"}),
    )

    assert snapshot["resolver"]["configured_bindings"] == 2
    assert snapshot["resolver"]["config_valid"] == 1
    assert snapshot["resolver"]["runtime_available"] == 0
    assert snapshot["resolver"]["statuses"]["entity_not_found"] == 1
    assert snapshot["resolver"]["statuses"]["runtime_unavailable"] == 1
    serialized = json.dumps(snapshot)
    assert "switch.removed_hardware" not in serialized
    assert "switch.offline_hardware" not in serialized


@pytest.mark.asyncio
async def test_loaded_config_entry_diagnostics_snapshot(monkeypatch) -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry)
    _bind(registry, asset, "switch.socket")
    entry = SimpleNamespace(
        entry_id="entry-private-id",
        state=ConfigEntryState.LOADED,
        version=1,
        minor_version=1,
        runtime_data=SimpleNamespace(registry=registry),
    )
    monkeypatch.setattr(
        diagnostics,
        "async_get_integration",
        AsyncMock(return_value=SimpleNamespace(version="1.2.0")),
    )
    monkeypatch.setattr(
        diagnostics,
        "async_get_recovery_state",
        lambda hass, entry_id: None,
    )
    monkeypatch.setattr(
        diagnostics,
        "HomeAssistantEntityProbe",
        lambda hass: StaticEntityProbe(states={"switch.socket": "on"}),
    )

    result = await diagnostics.async_get_config_entry_diagnostics(
        SimpleNamespace(),
        entry,
    )

    assert result == {
        "integration": {
            "version": "1.2.0",
            "storage_version": 1,
            "registry_schema_version": 1,
        },
        "config_entry": {
            "state": ConfigEntryState.LOADED.value,
            "version": 1,
            "minor_version": 1,
        },
        "recovery": {"required": False, "reason": None},
        "registry": {
            "available": True,
            "counts": {
                "assets": 1,
                "relations": 0,
                "bindings": 1,
                "representations": 0,
            },
        },
        "resolver": {
            "configured_bindings": 1,
            "config_valid": 1,
            "runtime_available": 1,
            "statuses": {
                "resolved": 1,
                "asset_not_found": 0,
                "capability_not_declared": 0,
                "binding_not_found": 0,
                "entity_not_found": 0,
                "runtime_unavailable": 0,
                "runtime_unknown": 0,
                "invalid_request": 0,
            },
        },
    }


@pytest.mark.asyncio
async def test_degraded_diagnostics_expose_reason_without_registry_or_message(
    monkeypatch,
) -> None:
    entry = SimpleNamespace(
        entry_id="entry-private-id",
        state=ConfigEntryState.SETUP_ERROR,
        version=1,
        minor_version=1,
    )
    monkeypatch.setattr(
        diagnostics,
        "async_get_integration",
        AsyncMock(return_value=SimpleNamespace(version="1.2.0")),
    )
    monkeypatch.setattr(
        diagnostics,
        "async_get_recovery_state",
        lambda hass, entry_id: SimpleNamespace(
            reason="corrupt_storage",
            message="secret /config/.storage path",
        ),
    )

    result = await diagnostics.async_get_config_entry_diagnostics(
        SimpleNamespace(),
        entry,
    )

    assert result["recovery"] == {
        "required": True,
        "reason": "corrupt_storage",
    }
    assert result["registry"] == {"available": False, "counts": None}
    assert result["resolver"] is None
    serialized = json.dumps(result)
    assert "secret /config/.storage path" not in serialized
    assert "entry-private-id" not in serialized


@pytest.mark.asyncio
async def test_diagnostics_redact_asset_codes_names_and_entity_ids(monkeypatch) -> None:
    registry = BindHomeRegistry()
    asset = _asset(
        registry,
        name="Private kitchen socket",
        code="PRIVATE-01",
    )
    _bind(registry, asset, "switch.private_hardware")
    entry = SimpleNamespace(
        entry_id="private-entry-id",
        state=ConfigEntryState.LOADED,
        version=1,
        minor_version=1,
        runtime_data=SimpleNamespace(registry=registry),
    )
    monkeypatch.setattr(
        diagnostics,
        "async_get_integration",
        AsyncMock(return_value=SimpleNamespace(version="1.2.0")),
    )
    monkeypatch.setattr(
        diagnostics,
        "async_get_recovery_state",
        lambda hass, entry_id: None,
    )
    monkeypatch.setattr(
        diagnostics,
        "HomeAssistantEntityProbe",
        lambda hass: StaticEntityProbe(states={"switch.private_hardware": "off"}),
    )

    result = await diagnostics.async_get_config_entry_diagnostics(
        SimpleNamespace(),
        entry,
    )
    serialized = json.dumps(result)

    for sensitive in (
        "Private kitchen socket",
        "PRIVATE-01",
        "switch.private_hardware",
        asset.id,
        "private-entry-id",
    ):
        assert sensitive not in serialized
