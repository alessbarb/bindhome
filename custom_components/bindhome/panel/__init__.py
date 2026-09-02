"""BindHome panel registration module."""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Final

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http.server import StaticPathConfig
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

PANEL_URL_PATH: Final = "bindhome"
PANEL_TITLE: Final = "BindHome"
PANEL_ICON: Final = "mdi:home-switch"
PANEL_COMPONENT_NAME: Final = "bindhome-panel"

STATIC_PATH: Final = Path(__file__).parent / "static"
BUNDLE_FILENAME: Final = "bindhome-panel.js"
STATIC_REGISTERED_KEY: Final = "static_registered"
BUNDLE_VERSION_LENGTH: Final = 12


def _bundle_version(bundle_path: Path) -> str:
    """Return a deterministic cache version for the frontend bundle."""
    return hashlib.sha256(bundle_path.read_bytes()).hexdigest()[:BUNDLE_VERSION_LENGTH]


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register static path and custom panel in Home Assistant."""
    bundle_path = STATIC_PATH / BUNDLE_FILENAME
    if not bundle_path.is_file():
        _LOGGER.error("BindHome panel bundle file not found at %s", bundle_path)
        return

    if frontend.async_panel_exists(hass, PANEL_URL_PATH):
        return

    bundle_version = await hass.async_add_executor_job(
        _bundle_version,
        bundle_path,
    )

    panel_data = hass.data.setdefault("bindhome_panel", {})
    if not panel_data.get(STATIC_REGISTERED_KEY):
        if hass.http is not None:
            await hass.http.async_register_static_paths(
                [
                    StaticPathConfig(
                        f"/{PANEL_URL_PATH}_static/{BUNDLE_FILENAME}",
                        str(bundle_path),
                        cache_headers=True,
                    )
                ]
            )
        panel_data[STATIC_REGISTERED_KEY] = True

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT_NAME,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        js_url=(f"/{PANEL_URL_PATH}_static/{BUNDLE_FILENAME}?v={bundle_version}"),
        require_admin=True,
    )


def async_unregister_panel(hass: HomeAssistant) -> None:
    """Unregister BindHome panel."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
