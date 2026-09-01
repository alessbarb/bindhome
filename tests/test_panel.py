"""Tests for the BindHome panel registration module."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

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
            "custom_components.bindhome.panel.panel_custom.async_register_panel"
        ) as mock_register_panel,
        patch.object(hass, "http", MagicMock()) as mock_http,
    ):
        mock_http.async_register_static_paths = AsyncMock()
        await async_register_panel(hass)

        mock_register_panel.assert_awaited_once_with(
            hass,
            frontend_url_path="bindhome",
            webcomponent_name="bindhome-panel",
            sidebar_title="BindHome",
            sidebar_icon="mdi:home-switch",
            js_url="/bindhome_static/bindhome-panel.js",
            require_admin=True,
        )

        mock_http.async_register_static_paths.assert_called_once()
        (path_configs,), _ = mock_http.async_register_static_paths.call_args
        assert len(path_configs) == 1
        assert path_configs[0].url_path == "/bindhome_static/bindhome-panel.js"
        assert path_configs[0].path.endswith("bindhome-panel.js")
        assert path_configs[0].cache_headers is True


@pytest.mark.asyncio
async def test_panel_registration_is_idempotent(hass: HomeAssistant) -> None:
    """Test repeated setup does not register the panel or static path twice."""
    with (
        patch(
            "custom_components.bindhome.panel.panel_custom.async_register_panel"
        ) as mock_register_panel,
        patch(
            "homeassistant.components.frontend.async_panel_exists",
            side_effect=[False, True],
        ),
        patch.object(hass, "http", MagicMock()) as mock_http,
    ):
        mock_http.async_register_static_paths = AsyncMock()
        await async_register_panel(hass)
        await async_register_panel(hass)

        mock_register_panel.assert_awaited_once()
        mock_http.async_register_static_paths.assert_awaited_once()


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
            "custom_components.bindhome.panel.panel_custom.async_register_panel"
        ) as mock_register_panel,
    ):
        await async_register_panel(hass)
        mock_register_panel.assert_not_awaited()


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
