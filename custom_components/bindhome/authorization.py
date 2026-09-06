"""Explicit authorization policy for BindHome WebSocket surfaces."""

from __future__ import annotations

from enum import StrEnum

from homeassistant.components.websocket_api.const import WebSocketCommandHandler
from homeassistant.components.websocket_api.decorators import require_admin


class AccessLevel(StrEnum):
    """Stable access classes for BindHome API surfaces."""

    HOUSEHOLD_READ = "household_read"
    ADMIN_READ = "admin_read"
    ADMIN_WRITE = "admin_write"


_ACCESS_ATTRIBUTE = "__bindhome_access_level__"


def _mark(
    handler: WebSocketCommandHandler,
    level: AccessLevel,
) -> WebSocketCommandHandler:
    setattr(handler, _ACCESS_ATTRIBUTE, level)
    return handler


def household_read(handler: WebSocketCommandHandler) -> WebSocketCommandHandler:
    """Classify an authenticated Home Assistant read as household-readable."""
    return _mark(handler, AccessLevel.HOUSEHOLD_READ)


def admin_read(handler: WebSocketCommandHandler) -> WebSocketCommandHandler:
    """Require an administrator for a sensitive/non-household read."""
    return _mark(require_admin(handler), AccessLevel.ADMIN_READ)


def admin_write(handler: WebSocketCommandHandler) -> WebSocketCommandHandler:
    """Require an administrator for every mutation/destructive operation."""
    return _mark(require_admin(handler), AccessLevel.ADMIN_WRITE)


def access_level(handler: WebSocketCommandHandler) -> AccessLevel | None:
    """Return the explicit BindHome access class attached to a handler."""
    return getattr(handler, _ACCESS_ATTRIBUTE, None)
