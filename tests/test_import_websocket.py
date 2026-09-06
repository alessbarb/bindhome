"""Tests for assisted-import discovery WebSocket API."""

from types import SimpleNamespace
from unittest.mock import Mock

from homeassistant import config_entries

from custom_components.bindhome import import_websocket
from custom_components.bindhome.registry import BindHomeRegistry


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


def test_registers_import_discovery_command() -> None:
    hass = SimpleNamespace(data={})

    import_websocket.async_register_import_websocket_commands(hass)

    assert set(hass.data["websocket_api"]) == {import_websocket.WS_IMPORT_DISCOVER}


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
