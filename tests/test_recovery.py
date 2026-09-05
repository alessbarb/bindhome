"""Tests for fail-closed BindHome Registry recovery state."""

from homeassistant.helpers import issue_registry as ir

from custom_components.bindhome.const import DOMAIN
from custom_components.bindhome.recovery import (
    async_clear_recovery_state,
    async_get_recovery_state,
    async_set_recovery_state,
)
from custom_components.bindhome.store import (
    BindHomeRegistryVersionError,
    BindHomeStoreCorruptionError,
    BindHomeStoreLoadError,
    BindHomeStoreVersionError,
)


def test_recovery_state_creates_and_clears_critical_repair(hass) -> None:
    entry_id = "entry-1"
    state = async_set_recovery_state(
        hass, entry_id, BindHomeStoreCorruptionError("registry corrupt")
    )

    assert state.reason == "corrupt_storage"
    assert async_get_recovery_state(hass, entry_id) is state
    issue = ir.async_get(hass).async_get_issue(DOMAIN, f"registry_recovery_{entry_id}")
    assert issue is not None
    assert issue.severity is ir.IssueSeverity.CRITICAL
    assert issue.is_persistent is True
    assert issue.translation_key == "registry_recovery"

    async_clear_recovery_state(hass, entry_id)

    assert async_get_recovery_state(hass, entry_id) is None
    assert (
        ir.async_get(hass).async_get_issue(DOMAIN, f"registry_recovery_{entry_id}")
        is None
    )


def test_recovery_reason_classification(hass) -> None:
    cases = [
        (BindHomeRegistryVersionError("future"), "future_registry_schema"),
        (BindHomeStoreVersionError("envelope"), "storage_envelope_version"),
        (BindHomeStoreLoadError("invalid"), "invalid_registry"),
    ]

    for index, (error, expected) in enumerate(cases):
        state = async_set_recovery_state(hass, f"entry-{index}", error)
        assert state.reason == expected
