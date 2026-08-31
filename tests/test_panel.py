"""Tests for the BindHome panel registration module."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.bindhome import (
    async_setup,
    async_setup_entry,
    async_unload_entry,
)
from custom_components.bindhome.const import DOMAIN
from custom_components.bindhome.panel import (
    async_register_panel,
    async_unregister_panel,
)


@pytest.mark.asyncio
async def test_panel_registration(hass: HomeAssistant) -> None:
    """Test panel registration registers custom panel and static path."""
    with (
        patch(
            "homeassistant.components.frontend.async_register_built_in_panel"
        ) as mock_register_panel,
        patch.object(hass, "http", MagicMock()) as mock_http,
    ):
        await async_register_panel(hass)

        mock_register_panel.assert_called_once()
        args, kwargs = mock_register_panel.call_args
        assert kwargs["component_name"] == "custom"
        assert kwargs["frontend_url_path"] == "bindhome"
        assert kwargs["config"]["_name"] == "bindhome-panel"
        assert kwargs["config"]["js_url"] == "/bindhome_static/bindhome-panel.js"
        assert kwargs["require_admin"] is True

        mock_http.register_static_path.assert_called_once()
        path_args, path_kwargs = mock_http.register_static_path.call_args
        assert path_args[0] == "/bindhome_static/bindhome-panel.js"
        assert path_args[1].endswith("bindhome-panel.js")
        assert path_kwargs["cache_headers"] is True


@pytest.mark.asyncio
async def test_panel_registration_missing_bundle(hass: HomeAssistant) -> None:
    """Test panel registration handles missing bundle gracefully."""
    mock_bundle_path = MagicMock()
    mock_bundle_path.is_file.return_value = False

    with (
        patch(
            "custom_components.bindhome.panel.STATIC_PATH",
            new=MagicMock(__truediv__=lambda self, other: mock_bundle_path),
        ),
        patch(
            "homeassistant.components.frontend.async_register_built_in_panel"
        ) as mock_register_panel,
    ):
        await async_register_panel(hass)
        mock_register_panel.assert_not_called()


@pytest.mark.asyncio
async def test_panel_unregistration(hass: HomeAssistant) -> None:
    """Test unregistering the custom panel."""
    with patch(
        "homeassistant.components.frontend.async_remove_panel"
    ) as mock_remove_panel:
        async_unregister_panel(hass)
        mock_remove_panel.assert_called_once_with(hass, "bindhome")


@pytest.mark.asyncio
async def test_setup_entry_registers_panel(hass: HomeAssistant) -> None:
    """Test that setup_entry calls async_register_panel."""
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    await async_setup(hass, {})

    with (
        patch("custom_components.bindhome.async_register_panel") as mock_register,
        patch.object(hass.config_entries, "async_forward_entry_setups") as mock_forward,
    ):
        await async_setup_entry(hass, entry)
        mock_register.assert_awaited_once_with(hass)
        mock_forward.assert_awaited_once_with(entry, [Platform.LIGHT])


@pytest.mark.asyncio
async def test_unload_entry(hass: HomeAssistant) -> None:
    """Test unload_entry."""
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await async_unload_entry(hass, entry) is True
