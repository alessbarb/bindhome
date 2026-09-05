"""Integration setup tests for Registry recovery mode."""

from unittest.mock import AsyncMock

import pytest
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome import async_setup_entry
from custom_components.bindhome.const import DOMAIN
from custom_components.bindhome.recovery import async_get_recovery_state
from custom_components.bindhome.store import BindHomeStoreCorruptionError


@pytest.mark.asyncio
async def test_setup_failure_records_recovery_state_and_repair(
    hass, monkeypatch
) -> None:
    load = AsyncMock(side_effect=BindHomeStoreCorruptionError("registry corrupt"))
    register_panel = AsyncMock()
    monkeypatch.setattr("custom_components.bindhome.BindHomeManager.async_load", load)
    monkeypatch.setattr(
        "custom_components.bindhome.async_register_panel", register_panel
    )
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)

    with pytest.raises(ConfigEntryError, match="registry corrupt"):
        await async_setup_entry(hass, entry)

    state = async_get_recovery_state(hass, entry.entry_id)
    assert state is not None
    assert state.reason == "corrupt_storage"
    assert (
        ir.async_get(hass).async_get_issue(
            DOMAIN, f"registry_recovery_{entry.entry_id}"
        )
        is not None
    )
    register_panel.assert_not_awaited()
