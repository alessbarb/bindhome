"""Reversible visibility adoption for explicitly bound Home Assistant hardware."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any

from homeassistant.components.homeassistant.exposed_entities import (
    KNOWN_ASSISTANTS,
    async_expose_entity,
)
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.storage import Store

from .const import SIGNAL_REGISTRY_CHANGED
from .registry import BindHomeRegistry

ADOPTION_STORAGE_KEY = "bindhome.adoptions"
ADOPTION_STORAGE_VERSION = 1

STATUS_ADOPTED = "adopted"
STATUS_MODIFIED = "modified"
STATUS_VISIBLE = "visible"
STATUS_HIDDEN_EXTERNAL = "hidden_external"
STATUS_UNSUPPORTED = "unsupported"
STATUS_TARGET_MISSING = "target_missing"


class AdoptionError(RuntimeError):
    """Raised when visibility adoption cannot be completed safely."""


@dataclass(slots=True)
class VoiceChange:
    """One BindHome-owned assistant exposure change and its prior value."""

    previous_present: bool
    previous_value: bool | None

    def to_dict(self) -> dict[str, object]:
        """Serialize the change record."""
        return {
            "previous_present": self.previous_present,
            "previous_value": self.previous_value,
        }

    @classmethod
    def from_dict(cls, payload: object) -> VoiceChange:
        """Validate and deserialize one assistant change record."""
        if not isinstance(payload, dict):
            raise AdoptionError("Invalid assistant adoption record")
        previous_present = payload.get("previous_present")
        previous_value = payload.get("previous_value")
        if not isinstance(previous_present, bool):
            raise AdoptionError("Invalid assistant adoption presence flag")
        if previous_value is not None and not isinstance(previous_value, bool):
            raise AdoptionError("Invalid assistant adoption previous value")
        return cls(
            previous_present=previous_present,
            previous_value=previous_value,
        )


@dataclass(slots=True)
class AdoptionRecord:
    """Persisted ownership record for one Entity Registry-backed target."""

    entity_registry_id: str
    asset_ids: set[str] = field(default_factory=set)
    hidden_changed: bool = False
    hidden_previous: str | None = None
    voice_changes: dict[str, VoiceChange] = field(default_factory=dict)

    def to_dict(self) -> dict[str, object]:
        """Serialize the record for Home Assistant storage."""
        return {
            "entity_registry_id": self.entity_registry_id,
            "asset_ids": sorted(self.asset_ids),
            "hidden_changed": self.hidden_changed,
            "hidden_previous": self.hidden_previous,
            "voice_changes": {
                assistant: change.to_dict()
                for assistant, change in sorted(self.voice_changes.items())
            },
        }

    @classmethod
    def from_dict(cls, payload: object) -> AdoptionRecord:
        """Validate and deserialize one adoption ownership record."""
        if not isinstance(payload, dict):
            raise AdoptionError("Invalid hardware adoption record")
        entity_registry_id = payload.get("entity_registry_id")
        asset_ids = payload.get("asset_ids")
        hidden_changed = payload.get("hidden_changed")
        hidden_previous = payload.get("hidden_previous")
        voice_changes = payload.get("voice_changes")
        if not isinstance(entity_registry_id, str) or not entity_registry_id:
            raise AdoptionError("Invalid adopted Entity Registry identity")
        if not isinstance(asset_ids, list) or not all(
            isinstance(asset_id, str) and asset_id for asset_id in asset_ids
        ):
            raise AdoptionError("Invalid adopted Asset identities")
        if not isinstance(hidden_changed, bool):
            raise AdoptionError("Invalid hidden ownership flag")
        if hidden_previous is not None and not isinstance(hidden_previous, str):
            raise AdoptionError("Invalid previous hidden state")
        if not isinstance(voice_changes, dict):
            raise AdoptionError("Invalid voice adoption changes")
        return cls(
            entity_registry_id=entity_registry_id,
            asset_ids=set(asset_ids),
            hidden_changed=hidden_changed,
            hidden_previous=hidden_previous,
            voice_changes={
                assistant: VoiceChange.from_dict(change)
                for assistant, change in voice_changes.items()
                if isinstance(assistant, str)
            },
        )


class AdoptionManager:
    """Own and reverse only visibility metadata explicitly adopted by BindHome."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(
            hass,
            ADOPTION_STORAGE_VERSION,
            ADOPTION_STORAGE_KEY,
            atomic_writes=True,
        )
        self._records: dict[str, AdoptionRecord] = {}
        self._lock = asyncio.Lock()
        self._loaded = False

    @property
    def loaded(self) -> bool:
        """Return whether persistent adoption ownership has been loaded."""
        return self._loaded

    async def async_load(self) -> None:
        """Load visibility ownership without mutating Home Assistant metadata."""
        payload = await self._store.async_load()
        if payload is None:
            self._records = {}
            self._loaded = True
            return
        if not isinstance(payload, dict) or not isinstance(payload.get("records"), dict):
            raise AdoptionError("Persisted BindHome adoption state is invalid")

        records: dict[str, AdoptionRecord] = {}
        for entity_registry_id, raw_record in payload["records"].items():
            if not isinstance(entity_registry_id, str):
                raise AdoptionError("Invalid adopted Entity Registry key")
            record = AdoptionRecord.from_dict(raw_record)
            if record.entity_registry_id != entity_registry_id:
                raise AdoptionError("Adoption record identity mismatch")
            records[entity_registry_id] = record
        self._records = records
        self._loaded = True

    async def _async_save(self) -> None:
        """Persist current visibility ownership before external mutations."""
        await self._store.async_save(
            {
                "records": {
                    entity_registry_id: record.to_dict()
                    for entity_registry_id, record in sorted(self._records.items())
                }
            }
        )

    def async_setup(self, registry: BindHomeRegistry) -> CALLBACK_TYPE:
        """Reconcile ownership whenever the BindHome Registry changes."""

        @callback
        def _registry_changed() -> None:
            self.hass.async_create_task(
                self.async_reconcile(registry),
                "bindhome adoption reconcile",
            )

        return async_dispatcher_connect(
            self.hass,
            SIGNAL_REGISTRY_CHANGED,
            _registry_changed,
        )

    @staticmethod
    def _target_ids_by_asset(registry: BindHomeRegistry) -> dict[str, set[str]]:
        """Return stable Entity Registry targets currently bound by each Asset."""
        result: dict[str, set[str]] = {}
        for binding in registry.bindings.values():
            if binding.entity_registry_id is None:
                continue
            result.setdefault(binding.asset_id, set()).add(binding.entity_registry_id)
        return result

    @staticmethod
    def _binding_targets_for_asset(
        registry: BindHomeRegistry,
        asset_id: str,
    ) -> tuple[set[str], bool]:
        """Return stable targets plus whether state-only targets are also present."""
        targets: set[str] = set()
        has_state_only = False
        for binding in registry.bindings.values():
            if binding.asset_id != asset_id:
                continue
            if binding.entity_registry_id is None:
                has_state_only = True
            else:
                targets.add(binding.entity_registry_id)
        return targets, has_state_only

    @staticmethod
    def _entry_by_registry_id(
        entity_registry: er.EntityRegistry,
        entity_registry_id: str,
    ) -> er.RegistryEntry | None:
        """Resolve the stable Registry identity without falling back to entity_id."""
        return entity_registry.entities.get_entry(entity_registry_id)

    @staticmethod
    def _hidden_value(value: er.RegistryEntryHider | None) -> str | None:
        """Serialize a Home Assistant hidden owner."""
        return None if value is None else value.value

    @staticmethod
    def _hidden_from_value(value: str | None) -> er.RegistryEntryHider | None:
        """Deserialize a Home Assistant hidden owner."""
        return None if value is None else er.RegistryEntryHider(value)

    @staticmethod
    def _voice_state(
        entry: er.RegistryEntry,
        assistant: str,
    ) -> tuple[bool, bool | None]:
        """Return explicit should_expose presence/value without materializing defaults."""
        options = entry.options.get(assistant, {})
        if "should_expose" not in options:
            return False, None
        value = options["should_expose"]
        return True, value if isinstance(value, bool) else None

    def _capture_record(
        self,
        entry: er.RegistryEntry,
        asset_id: str,
    ) -> AdoptionRecord:
        """Capture only values BindHome will actually change."""
        voice_changes: dict[str, VoiceChange] = {}
        for assistant in KNOWN_ASSISTANTS:
            present, value = self._voice_state(entry, assistant)
            if present and value is False:
                continue
            voice_changes[assistant] = VoiceChange(
                previous_present=present,
                previous_value=value,
            )

        return AdoptionRecord(
            entity_registry_id=entry.id,
            asset_ids={asset_id},
            hidden_changed=entry.hidden_by is None,
            hidden_previous=self._hidden_value(entry.hidden_by),
            voice_changes=voice_changes,
        )

    @staticmethod
    def _matches_previous_voice(
        entry: er.RegistryEntry,
        assistant: str,
        change: VoiceChange,
    ) -> bool:
        options = entry.options.get(assistant, {})
        present = "should_expose" in options
        value = options.get("should_expose") if present else None
        return present == change.previous_present and value == change.previous_value

    def _apply_record(self, record: AdoptionRecord) -> None:
        """Apply owned visibility changes without overriding later user changes."""
        entity_registry = er.async_get(self.hass)
        entry = self._entry_by_registry_id(entity_registry, record.entity_registry_id)
        if entry is None:
            return

        if record.hidden_changed:
            previous = self._hidden_from_value(record.hidden_previous)
            if entry.hidden_by == previous:
                entry = entity_registry.async_update_entity(
                    entry.entity_id,
                    hidden_by=er.RegistryEntryHider.INTEGRATION,
                )

        for assistant, change in record.voice_changes.items():
            present, value = self._voice_state(entry, assistant)
            if present and value is False:
                continue
            if not self._matches_previous_voice(entry, assistant, change):
                continue
            async_expose_entity(self.hass, assistant, entry.entity_id, False)
            refreshed = self._entry_by_registry_id(
                entity_registry,
                record.entity_registry_id,
            )
            if refreshed is not None:
                entry = refreshed

    def _restore_record(self, record: AdoptionRecord) -> None:
        """Restore only values that still equal the value BindHome applied."""
        entity_registry = er.async_get(self.hass)
        entry = self._entry_by_registry_id(entity_registry, record.entity_registry_id)
        if entry is None:
            return

        if (
            record.hidden_changed
            and entry.hidden_by is er.RegistryEntryHider.INTEGRATION
        ):
            entry = entity_registry.async_update_entity(
                entry.entity_id,
                hidden_by=self._hidden_from_value(record.hidden_previous),
            )

        for assistant, change in record.voice_changes.items():
            options = dict(entry.options.get(assistant, {}))
            if options.get("should_expose") is not False:
                continue
            if change.previous_present:
                options["should_expose"] = change.previous_value
            else:
                options.pop("should_expose", None)
            entity_registry.async_update_entity_options(
                entry.entity_id,
                assistant,
                options or None,
            )
            refreshed = self._entry_by_registry_id(
                entity_registry,
                record.entity_registry_id,
            )
            if refreshed is not None:
                entry = refreshed

    async def async_adopt_asset(
        self,
        registry: BindHomeRegistry,
        asset_id: str,
    ) -> dict[str, object]:
        """Adopt every eligible backing target explicitly bound to one Asset."""
        registry.get_asset(asset_id)
        targets, has_state_only = self._binding_targets_for_asset(registry, asset_id)
        if not targets:
            if has_state_only:
                raise AdoptionError(
                    "This Asset only has state-only Bindings; stable Entity Registry "
                    "identity is required for reversible adoption"
                )
            raise AdoptionError("This Asset has no bound hardware to adopt")

        entity_registry = er.async_get(self.hass)
        applied: list[AdoptionRecord] = []
        async with self._lock:
            for entity_registry_id in sorted(targets):
                entry = self._entry_by_registry_id(entity_registry, entity_registry_id)
                if entry is None:
                    continue
                record = self._records.get(entity_registry_id)
                if record is None:
                    record = self._capture_record(entry, asset_id)
                    self._records[entity_registry_id] = record
                else:
                    record.asset_ids.add(asset_id)
                applied.append(record)

            if not applied:
                raise AdoptionError("No bound Entity Registry target is currently available")

            await self._async_save()
            try:
                for record in applied:
                    self._apply_record(record)
            except Exception as err:
                for record in applied:
                    self._restore_record(record)
                    record.asset_ids.discard(asset_id)
                    if not record.asset_ids:
                        self._records.pop(record.entity_registry_id, None)
                await self._async_save()
                raise AdoptionError("Failed to apply Home Assistant visibility changes") from err

        return self.status(registry, asset_id=asset_id)

    async def async_revert_asset(
        self,
        registry: BindHomeRegistry,
        asset_id: str,
    ) -> dict[str, object]:
        """Release one Asset's adoption ownership and restore orphaned targets."""
        async with self._lock:
            restore: list[AdoptionRecord] = []
            changed = False
            for record in self._records.values():
                if asset_id not in record.asset_ids:
                    continue
                record.asset_ids.discard(asset_id)
                changed = True
                if not record.asset_ids:
                    restore.append(record)
            if changed:
                await self._async_save()
            for record in restore:
                self._restore_record(record)
                self._records.pop(record.entity_registry_id, None)
            if restore:
                await self._async_save()
        return self.status(registry, asset_id=asset_id)

    async def async_revert_all(self) -> None:
        """Restore every BindHome-owned visibility value during removal/cleanup."""
        async with self._lock:
            if not self._records:
                return
            records = list(self._records.values())
            for record in records:
                record.asset_ids.clear()
            await self._async_save()
            for record in records:
                self._restore_record(record)
            self._records.clear()
            await self._async_save()

    async def async_reconcile(self, registry: BindHomeRegistry) -> None:
        """Remove stale ownership and conservatively reapply active ownership."""
        targets_by_asset = self._target_ids_by_asset(registry)
        async with self._lock:
            restore: list[AdoptionRecord] = []
            ownership_changed = False
            for record in self._records.values():
                valid_assets = {
                    asset_id
                    for asset_id in record.asset_ids
                    if record.entity_registry_id in targets_by_asset.get(asset_id, set())
                }
                if valid_assets != record.asset_ids:
                    record.asset_ids = valid_assets
                    ownership_changed = True
                if not record.asset_ids:
                    restore.append(record)
            if ownership_changed:
                await self._async_save()

            for record in restore:
                self._restore_record(record)
                self._records.pop(record.entity_registry_id, None)
            if restore:
                await self._async_save()

            for record in self._records.values():
                self._apply_record(record)

    def _record_is_applied(
        self,
        entry: er.RegistryEntry,
        record: AdoptionRecord,
    ) -> bool:
        """Return whether all still-owned changes remain in effect."""
        if record.hidden_changed and entry.hidden_by is not er.RegistryEntryHider.INTEGRATION:
            return False
        for assistant in record.voice_changes:
            present, value = self._voice_state(entry, assistant)
            if not present or value is not False:
                return False
        return True

    def status(
        self,
        registry: BindHomeRegistry,
        *,
        asset_id: str | None = None,
    ) -> dict[str, object]:
        """Return current adoption state without materializing assistant defaults."""
        entity_registry = er.async_get(self.hass)
        bindings = [
            binding
            for binding in registry.bindings.values()
            if asset_id is None or binding.asset_id == asset_id
        ]
        grouped: dict[tuple[str, str], list[str]] = {}
        state_only: dict[tuple[str, str], list[str]] = {}
        for binding in bindings:
            if binding.entity_registry_id is None:
                state_only.setdefault(
                    (binding.asset_id, binding.entity_id),
                    [],
                ).append(binding.id)
            else:
                grouped.setdefault(
                    (binding.asset_id, binding.entity_registry_id),
                    [],
                ).append(binding.id)

        records: list[dict[str, object]] = []
        for (bound_asset_id, entity_registry_id), binding_ids in sorted(grouped.items()):
            entry = self._entry_by_registry_id(entity_registry, entity_registry_id)
            adoption = self._records.get(entity_registry_id)
            if entry is None:
                status = STATUS_TARGET_MISSING
                entity_id = None
            elif adoption is not None and bound_asset_id in adoption.asset_ids:
                status = (
                    STATUS_ADOPTED
                    if self._record_is_applied(entry, adoption)
                    else STATUS_MODIFIED
                )
                entity_id = entry.entity_id
            elif entry.hidden_by is None:
                status = STATUS_VISIBLE
                entity_id = entry.entity_id
            else:
                status = STATUS_HIDDEN_EXTERNAL
                entity_id = entry.entity_id
            records.append(
                {
                    "asset_id": bound_asset_id,
                    "entity_registry_id": entity_registry_id,
                    "entity_id": entity_id,
                    "binding_ids": sorted(binding_ids),
                    "status": status,
                    "adopted_by_assets": sorted(adoption.asset_ids) if adoption else [],
                }
            )

        for (bound_asset_id, entity_id), binding_ids in sorted(state_only.items()):
            records.append(
                {
                    "asset_id": bound_asset_id,
                    "entity_registry_id": None,
                    "entity_id": entity_id,
                    "binding_ids": sorted(binding_ids),
                    "status": STATUS_UNSUPPORTED,
                    "adopted_by_assets": [],
                }
            )

        return {
            "records": records,
            "summary": self._summary(registry, records),
        }

    def _summary(
        self,
        registry: BindHomeRegistry,
        records: list[dict[str, object]],
    ) -> dict[str, int]:
        """Build a unique-hardware surface summary."""
        entity_registry = er.async_get(self.hass)
        bound_targets: set[str] = set()
        visible_targets: set[str] = set()
        for binding in registry.bindings.values():
            key = binding.entity_registry_id or f"state:{binding.entity_id}"
            bound_targets.add(key)
            if binding.entity_registry_id is None:
                visible_targets.add(key)
                continue
            entry = self._entry_by_registry_id(
                entity_registry,
                binding.entity_registry_id,
            )
            if entry is None or entry.hidden_by is None:
                visible_targets.add(key)

        return {
            "logical_entities": len(registry.representations),
            "bound_hardware": len(bound_targets),
            "adopted_hardware": len(
                {
                    record["entity_registry_id"]
                    for record in records
                    if record["entity_registry_id"] is not None
                    and record["status"] in {STATUS_ADOPTED, STATUS_MODIFIED}
                }
            ),
            "bound_hardware_visible": len(visible_targets),
        }
