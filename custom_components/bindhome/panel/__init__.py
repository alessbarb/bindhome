"""BindHome panel registration module."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Final

from homeassistant.components import frontend
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

PANEL_URL_PATH: Final = "bindhome"
PANEL_TITLE: Final = "BindHome"
PANEL_ICON: Final = "mdi:home-switch"
PANEL_COMPONENT_NAME: Final = "bindhome-panel"

STATIC_PATH: Final = Path(__file__).parent / "static"
BUNDLE_FILENAME: Final = "bindhome-panel.js"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register static path and custom panel in Home Assistant."""
    bundle_path = STATIC_PATH / BUNDLE_FILENAME
    if not bundle_path.is_file():
        _LOGGER.error("BindHome panel bundle file not found at %s", bundle_path)
        return

    # Register static file URL path for panel bundle
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL_PATH,
        config={
            "_name": PANEL_COMPONENT_NAME,
            "js_url": f"/{PANEL_URL_PATH}_static/{BUNDLE_FILENAME}",
        },
        require_admin=True,
    )

    if hass.http is not None:
        hass.http.register_static_path(
            f"/{PANEL_URL_PATH}_static/{BUNDLE_FILENAME}",
            str(bundle_path),
            cache_headers=True,
        )


def async_unregister_panel(hass: HomeAssistant) -> None:
    """Unregister BindHome panel."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
