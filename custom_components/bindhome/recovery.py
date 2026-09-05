"""Fail-closed Registry recovery state and Home Assistant Repair integration."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.util.hass_dict import HassKey

from .const import DOMAIN
from .store import (
    BindHomeRegistryVersionError,
    BindHomeStoreCorruptionError,
    BindHomeStoreError,
    BindHomeStoreVersionError,
)

_RECOVERY_STATES: HassKey[dict[str, RegistryRecoveryState]] = HassKey(
    f"{DOMAIN}_registry_recovery_states"
)
_ISSUE_PREFIX = "registry_recovery"


@dataclass(frozen=True, slots=True)
class RegistryRecoveryState:
    """Describe why one BindHome config entry could not load its Registry."""

    entry_id: str
    reason: str
    message: str

    def to_dict(self) -> dict[str, str]:
        """Return a safe administrative recovery status payload."""
        return {
            "entry_id": self.entry_id,
            "reason": self.reason,
            "message": self.message,
        }


def _issue_id(entry_id: str) -> str:
    return f"{_ISSUE_PREFIX}_{entry_id}"


def _reason_for_error(error: BindHomeStoreError) -> str:
    if isinstance(error, BindHomeStoreCorruptionError):
        return "corrupt_storage"
    if isinstance(error, BindHomeRegistryVersionError):
        return "future_registry_schema"
    if isinstance(error, BindHomeStoreVersionError):
        return "storage_envelope_version"
    return "invalid_registry"


def async_get_recovery_state(
    hass: HomeAssistant,
    entry_id: str,
) -> RegistryRecoveryState | None:
    """Return the degraded recovery state for one config entry, if any."""
    return hass.data.get(_RECOVERY_STATES, {}).get(entry_id)


def async_set_recovery_state(
    hass: HomeAssistant,
    entry_id: str,
    error: BindHomeStoreError,
) -> RegistryRecoveryState:
    """Record degraded state and surface a persistent Home Assistant Repair."""
    state = RegistryRecoveryState(
        entry_id=entry_id,
        reason=_reason_for_error(error),
        message=str(error),
    )
    hass.data.setdefault(_RECOVERY_STATES, {})[entry_id] = state

    ir.async_create_issue(
        hass,
        DOMAIN,
        _issue_id(entry_id),
        is_fixable=False,
        is_persistent=True,
        severity=ir.IssueSeverity.CRITICAL,
        translation_key="registry_recovery",
        translation_placeholders={
            "reason": state.reason,
            "message": state.message,
        },
    )
    return state


def async_clear_recovery_state(hass: HomeAssistant, entry_id: str) -> None:
    """Clear degraded state and its Repair after normal setup succeeds."""
    states = hass.data.get(_RECOVERY_STATES)
    if states is not None:
        states.pop(entry_id, None)
        if not states:
            hass.data.pop(_RECOVERY_STATES, None)
    ir.async_delete_issue(hass, DOMAIN, _issue_id(entry_id))
