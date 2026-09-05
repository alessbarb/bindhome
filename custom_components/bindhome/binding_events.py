"""Follow Home Assistant Entity Registry changes for persisted Binding targets."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)

from .const import SIGNAL_BINDING_TARGET_CHANGED, SIGNAL_REGISTRY_CHANGED

if TYPE_CHECKING:
    from collections.abc import Callable

    from .manager import BindHomeManager


class BindingTargetEventTracker:
    """Track the current entity_id of stable Binding Entity Registry targets.

    Entity Registry removal events contain only the current ``entity_id`` and
    not the stable Registry entry id. BindHome therefore keeps a small runtime
    index from stable target id to current entity_id. The index is rebuilt when
    BindHome's own Registry changes and updated in-place on Home Assistant
    renames. It is never persisted.
    """

    def __init__(self, hass: HomeAssistant, manager: BindHomeManager) -> None:
        self._hass = hass
        self._manager = manager
        self._targets: dict[str, str] = {}
        self._unsub_entity_registry: Callable[[], None] | None = None
        self._unsub_bindhome_registry: Callable[[], None] | None = None

    @callback
    def async_setup(self) -> None:
        """Build the runtime index and subscribe to relevant change sources."""
        if self._unsub_entity_registry is not None:
            return

        self._refresh_targets()
        self._unsub_entity_registry = self._hass.bus.async_listen(
            er.EVENT_ENTITY_REGISTRY_UPDATED,
            self._handle_entity_registry_event,
        )
        self._unsub_bindhome_registry = async_dispatcher_connect(
            self._hass,
            SIGNAL_REGISTRY_CHANGED,
            self._refresh_targets,
        )

    @callback
    def async_unload(self) -> None:
        """Remove listeners exactly once."""
        if self._unsub_entity_registry is not None:
            self._unsub_entity_registry()
            self._unsub_entity_registry = None
        if self._unsub_bindhome_registry is not None:
            self._unsub_bindhome_registry()
            self._unsub_bindhome_registry = None
        self._targets.clear()

    @callback
    def _refresh_targets(self) -> None:
        """Rebuild the target index after a committed BindHome Registry change."""
        registry_entries = er.async_get(self._hass).entities
        target_ids = {
            binding.entity_registry_id
            for binding in self._manager.registry.bindings.values()
            if binding.entity_registry_id is not None
        }

        refreshed: dict[str, str] = {}
        for target_id in target_ids:
            entry = registry_entries.get_entry(target_id)
            if entry is not None:
                refreshed[target_id] = entry.entity_id
        self._targets = refreshed

    @callback
    def _handle_entity_registry_event(self, event: Event[Any]) -> None:
        """Forward only rename/removal events that affect a bound stable target."""
        action = event.data.get("action")
        entity_id = event.data.get("entity_id")
        if not isinstance(entity_id, str):
            return

        if action == "update":
            old_entity_id = event.data.get("old_entity_id")
            if not isinstance(old_entity_id, str) or old_entity_id == entity_id:
                return
            self._handle_rename(old_entity_id, entity_id)
            return

        if action == "remove":
            self._handle_remove(entity_id)

    @callback
    def _handle_rename(self, old_entity_id: str, new_entity_id: str) -> None:
        """Move tracked targets to their current HA entity id and notify consumers."""
        registry_entries = er.async_get(self._hass).entities
        affected = [
            target_id
            for target_id, current_entity_id in self._targets.items()
            if current_entity_id == old_entity_id
        ]

        for target_id in affected:
            entry = registry_entries.get_entry(target_id)
            if entry is None:
                # Defensive fail-closed behavior if HA emitted an unexpected
                # update after the entry disappeared.
                self._targets.pop(target_id, None)
                self._notify(
                    target_id,
                    action="remove",
                    entity_id=None,
                    old_entity_id=old_entity_id,
                )
                continue

            self._targets[target_id] = entry.entity_id
            self._notify(
                target_id,
                action="update",
                entity_id=entry.entity_id,
                old_entity_id=old_entity_id,
            )

    @callback
    def _handle_remove(self, entity_id: str) -> None:
        """Mark every stable target that pointed at the removed entry as stale."""
        affected = [
            target_id
            for target_id, current_entity_id in self._targets.items()
            if current_entity_id == entity_id
        ]
        for target_id in affected:
            self._targets.pop(target_id, None)
            self._notify(
                target_id,
                action="remove",
                entity_id=None,
                old_entity_id=entity_id,
            )

    @callback
    def _notify(
        self,
        entity_registry_id: str,
        *,
        action: str,
        entity_id: str | None,
        old_entity_id: str,
    ) -> None:
        """Publish a non-persistent runtime target change."""
        async_dispatcher_send(
            self._hass,
            SIGNAL_BINDING_TARGET_CHANGED,
            {
                "action": action,
                "entity_registry_id": entity_registry_id,
                "entity_id": entity_id,
                "old_entity_id": old_entity_id,
            },
        )
