"""Tests for assisted-import WebSocket API."""

from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from homeassistant import config_entries

from custom_components.bindhome import import_websocket
from custom_components.bindhome.import_proposals import (
    ImportAssetCandidate,
    ImportBindingCandidate,
    ImportProposal,
    ImportSource,
)
from custom_components.bindhome.registry import BindHomeRegistry, RegistryConflictError


class FakeConnection:
    """Capture WebSocket responses."""

    def __init__(self) -> None:
        self.user = SimpleNamespace(is_admin=True)
        self.results: list[tuple[str, object]] = []
        self.errors: list[tuple[str, str, str]] = []

    def send_result(self, message_id: str, result: object = None) -> None:
        self.results.append((message_id, result))

    def send_error(self, message_id: str, code: str, message: str) -> None:
        self.errors.append((message_id, code, message))


def _hass() -> tuple[SimpleNamespace, SimpleNamespace]:
    manager = SimpleNamespace(registry=BindHomeRegistry(), revision=4)
    entry = SimpleNamespace(
        state=config_entries.ConfigEntryState.LOADED,
        runtime_data=manager,
    )
    hass = SimpleNamespace(
        config_entries=SimpleNamespace(async_entries=lambda domain: [entry]),
        data={},
    )
    return hass, manager


def _proposal() -> ImportProposal:
    return ImportProposal.create(
        source=ImportSource.create(
            entity_ids=("switch.current",),
            entity_registry_ids=("registry-1",),
        ),
        asset=ImportAssetCandidate.create(
            name="Relay",
            asset_type="switch",
            capabilities=("on_off",),
        ),
        bindings=(
            ImportBindingCandidate.create(
                capability="on_off",
                entity_id="switch.current",
                entity_registry_id="registry-1",
            ),
        ),
    )


def test_registers_import_commands() -> None:
    hass = SimpleNamespace(data={})

    import_websocket.async_register_import_websocket_commands(hass)

    assert set(hass.data["websocket_api"]) == {
        import_websocket.WS_IMPORT_DISCOVER,
        import_websocket.WS_IMPORT_COMMIT,
    }


def test_discovery_response_includes_scope_revision_and_proposals(monkeypatch) -> None:
    hass, manager = _hass()
    proposal = SimpleNamespace(to_dict=lambda: {"proposal_id": "proposal-1"})
    discover = Mock(return_value=[proposal])
    monkeypatch.setattr(import_websocket, "discover_import_proposals", discover)
    connection = FakeConnection()

    import_websocket.ws_import_discover.__wrapped__(
        hass,
        connection,
        {"id": "1", "area_id": "living"},
    )

    discover.assert_called_once_with(hass, manager.registry, area_id="living")
    assert connection.errors == []
    assert connection.results == [
        (
            "1",
            {
                "scope": {"type": "area", "area_id": "living"},
                "revision": 4,
                "count": 1,
                "proposals": [{"proposal_id": "proposal-1"}],
            },
        )
    ]


def test_reviewed_decisions_reject_unknown_proposal() -> None:
    proposal = _proposal()

    with pytest.raises(RegistryConflictError, match="no longer available"):
        import_websocket._reviewed_decisions(
            [proposal],
            [{"proposal_id": "missing", "action": "skip"}],
        )


def test_reviewed_binding_selection_uses_current_candidate() -> None:
    proposal = _proposal()

    reviewed = import_websocket._reviewed_decisions(
        [proposal],
        [
            {
                "proposal_id": proposal.proposal_id,
                "action": "create",
                "asset": {
                    "name": "Reviewed relay",
                    "asset_type": "relay_point",
                    "capabilities": ["on_off"],
                },
                "bindings": [
                    {
                        "capability": "on_off",
                        "role": "primary",
                        "entity_registry_id": "registry-1",
                        "entity_id": "switch.old_name",
                    }
                ],
            }
        ],
    )

    decision = reviewed[0][1]
    assert decision.asset is not None
    assert decision.asset.name == "Reviewed relay"
    assert decision.asset.asset_type == "relay_point"
    assert decision.bindings == proposal.bindings
    assert decision.bindings[0].entity_id == "switch.current"
