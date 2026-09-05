"""Actionable Home Assistant Repairs for BindHome integrity problems."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN, SIGNAL_BINDING_TARGET_CHANGED, SIGNAL_REGISTRY_CHANGED
from .manager import BindHomeManager
from .resolver import ResolutionStatus

_STALE_AREAS_PREFIX = "stale_areas"
_STALE_BINDINGS_PREFIX = "stale_bindings"
_SUMMARY_LIMIT = 8


def _issue_id(prefix: str, entry_id: str) -> str:
    return f"{prefix}_{entry_id}"


def _summary(values: list[str]) -> str:
    """Return a bounded human summary without exposing raw UUID-heavy output."""
    visible = values[:_SUMMARY_LIMIT]
    text = ", ".join(visible)
    if len(values) > _SUMMARY_LIMIT:
        text += "…"
    return text


class IntegrityRepairTracker:
    """Keep actionable integrity Repairs synchronized with live BindHome state."""

    def __init__(
        self,
        hass: HomeAssistant,
        manager: BindHomeManager,
        entry_id: str,
    ) -> None:
        self._hass = hass
        self._manager = manager
        self._entry_id = entry_id
        self._unsubs: list[Callable[[], None]] = []

    def async_setup(self) -> None:
        """Subscribe to changes that can create or resolve integrity problems."""
        self._unsubs = [
            async_dispatcher_connect(
                self._hass,
                SIGNAL_REGISTRY_CHANGED,
                self._handle_change,
            ),
            async_dispatcher_connect(
                self._hass,
                SIGNAL_BINDING_TARGET_CHANGED,
                self._handle_change,
            ),
            self._hass.bus.async_listen(
                ar.EVENT_AREA_REGISTRY_UPDATED,
                self._handle_area_registry_change,
            ),
        ]
        self._refresh()

    def async_unload(self) -> None:
        """Release listeners while leaving persistent Repairs for next setup."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()

    @callback
    def _handle_change(self, *_args: Any) -> None:
        self._refresh()

    @callback
    def _handle_area_registry_change(self, _event: Event) -> None:
        self._refresh()

    @callback
    def _refresh(self) -> None:
        """Reconcile grouped Repairs from the current authoritative read model."""
        self._sync_stale_areas()
        self._sync_stale_bindings()

    @callback
    def _sync_stale_areas(self) -> None:
        area_registry = ar.async_get(self._hass)
        affected = sorted(
            (
                asset
                for asset in self._manager.registry.assets.values()
                if asset.area_id is not None
                and area_registry.async_get_area(asset.area_id) is None
            ),
            key=lambda asset: (asset.name.casefold(), asset.id),
        )
        issue_id = _issue_id(_STALE_AREAS_PREFIX, self._entry_id)
        if not affected:
            ir.async_delete_issue(self._hass, DOMAIN, issue_id)
            return

        ir.async_create_issue(
            self._hass,
            DOMAIN,
            issue_id,
            is_fixable=False,
            is_persistent=True,
            severity=ir.IssueSeverity.WARNING,
            translation_key="stale_areas",
            translation_placeholders={
                "count": str(len(affected)),
                "assets": _summary([asset.name for asset in affected]),
            },
        )

    @callback
    def _sync_stale_bindings(self) -> None:
        affected: list[str] = []
        for binding in self._manager.registry.bindings.values():
            resolution = self._manager.resolver.resolve(
                binding.asset_id,
                binding.capability,
                binding.role,
            )
            if resolution.status is not ResolutionStatus.ENTITY_NOT_FOUND:
                continue

            asset = self._manager.registry.assets.get(binding.asset_id)
            asset_name = asset.name if asset is not None else binding.asset_id
            affected.append(f"{asset_name} — {binding.capability}/{binding.role}")

        affected.sort(key=str.casefold)
        issue_id = _issue_id(_STALE_BINDINGS_PREFIX, self._entry_id)
        if not affected:
            ir.async_delete_issue(self._hass, DOMAIN, issue_id)
            return

        ir.async_create_issue(
            self._hass,
            DOMAIN,
            issue_id,
            is_fixable=False,
            is_persistent=True,
            severity=ir.IssueSeverity.WARNING,
            translation_key="stale_bindings",
            translation_placeholders={
                "count": str(len(affected)),
                "bindings": _summary(affected),
            },
        )
