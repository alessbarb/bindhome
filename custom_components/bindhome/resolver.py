"""Binding resolver: map a BindHome capability to its current HA entity.

The resolver is the read-side abstraction that future logical BindHome entities
use to discover which Home Assistant entity currently implements an asset
capability, without knowing hardware identity.

Central operation::

    (asset_id, capability, role) -> current Home Assistant entity_id

Two independent axes are reported:

* configuration validity -- the binding exists and its entity reference still
  points at something Home Assistant knows about (Entity Registry or state
  machine). A device that is merely offline is still a valid configuration.
* runtime availability -- the entity currently has a usable state, i.e. not
  ``unavailable``, ``unknown`` or missing from the state machine.

Home Assistant specific access is isolated behind :class:`EntityProbe` so the
resolver and its tests do not require a running Home Assistant instance.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

from .models import Binding, ModelValidationError, normalize_identifier
from .registry import BindHomeRegistry

STATE_UNAVAILABLE = "unavailable"
STATE_UNKNOWN = "unknown"


class ResolutionStatus(Enum):
    """Outcome of a resolve attempt."""

    RESOLVED = "resolved"
    ASSET_NOT_FOUND = "asset_not_found"
    CAPABILITY_NOT_DECLARED = "capability_not_declared"
    BINDING_NOT_FOUND = "binding_not_found"
    ENTITY_NOT_FOUND = "entity_not_found"
    RUNTIME_UNAVAILABLE = "runtime_unavailable"
    RUNTIME_UNKNOWN = "runtime_unknown"
    INVALID_REQUEST = "invalid_request"


_CONFIG_VALID_STATUSES = frozenset(
    {
        ResolutionStatus.RESOLVED,
        ResolutionStatus.RUNTIME_UNAVAILABLE,
        ResolutionStatus.RUNTIME_UNKNOWN,
    }
)


class ResolverError(Exception):
    """Base error for the strict resolver API."""


class InvalidResolveRequestError(ResolverError):
    """Raised when the requested capability or role is not a valid identifier."""


class AssetNotFoundError(ResolverError):
    """Raised when the asset does not exist."""


class CapabilityNotDeclaredError(ResolverError):
    """Raised when the asset does not declare the requested capability."""


class BindingNotFoundError(ResolverError):
    """Raised when no binding exists for the requested key."""


class StaleBindingError(ResolverError):
    """Raised when the bound entity no longer exists in Home Assistant."""


@dataclass(frozen=True, slots=True)
class Resolution:
    """Typed result of :meth:`BindingResolver.resolve`."""

    asset_id: str
    capability: str
    role: str
    status: ResolutionStatus
    binding: Binding | None = None
    entity_id: str | None = None
    state: str | None = None

    @property
    def config_valid(self) -> bool:
        """Whether the binding configuration references a real HA entity."""
        return self.status in _CONFIG_VALID_STATUSES

    @property
    def runtime_available(self) -> bool:
        """Whether the entity currently has a usable runtime state."""
        return self.status is ResolutionStatus.RESOLVED


class EntityProbe(Protocol):
    """Read-only view of Home Assistant entity existence and state."""

    def is_known(self, entity_id: str) -> bool:
        """Return True if the entity exists in the registry or state machine."""

    def get_state(self, entity_id: str) -> str | None:
        """Return the current state string, or None if the entity has no state."""


class StaticEntityProbe:
    """In-memory :class:`EntityProbe` for tests and offline evaluation.

    ``registered`` is the set of entity ids present in the Entity Registry.
    ``states`` maps entity ids present in the state machine to their state
    string. The union models Home Assistant's "entity exists" definition.
    """

    def __init__(
        self,
        *,
        registered: set[str] | None = None,
        states: dict[str, str] | None = None,
    ) -> None:
        self.registered: set[str] = set(registered or set())
        self.states: dict[str, str] = dict(states or {})

    def is_known(self, entity_id: str) -> bool:
        return entity_id in self.registered or entity_id in self.states

    def get_state(self, entity_id: str) -> str | None:
        return self.states.get(entity_id)


class HomeAssistantEntityProbe:
    """:class:`EntityProbe` backed by a live Home Assistant instance.

    "Entity exists" matches the existing definition in ``services.py``: present
    in the Entity Registry or in the state machine.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    def is_known(self, entity_id: str) -> bool:
        from homeassistant.helpers import entity_registry as er

        if er.async_get(self._hass).async_get(entity_id) is not None:
            return True
        return self._hass.states.get(entity_id) is not None

    def get_state(self, entity_id: str) -> str | None:
        state = self._hass.states.get(entity_id)
        return state.state if state is not None else None


class BindingResolver:
    """Resolve BindHome capabilities to current Home Assistant entities."""

    def __init__(self, registry: BindHomeRegistry, probe: EntityProbe) -> None:
        self._registry = registry
        self._probe = probe

    def resolve(
        self, asset_id: str, capability: str, role: str = "primary"
    ) -> Resolution:
        """Resolve a capability binding, returning an explicit typed result."""
        try:
            capability = normalize_identifier(capability, "capability")
            role = normalize_identifier(role, "role")
        except ModelValidationError:
            return Resolution(
                asset_id=asset_id,
                capability=capability,
                role=role,
                status=ResolutionStatus.INVALID_REQUEST,
            )

        asset = self._registry.assets.get(asset_id)
        if asset is None:
            return self._miss(
                asset_id, capability, role, ResolutionStatus.ASSET_NOT_FOUND
            )
        if capability not in asset.capabilities:
            return self._miss(
                asset_id, capability, role, ResolutionStatus.CAPABILITY_NOT_DECLARED
            )

        binding = self._registry.get_binding(asset_id, capability, role)
        if binding is None:
            return self._miss(
                asset_id, capability, role, ResolutionStatus.BINDING_NOT_FOUND
            )

        entity_id = binding.entity_id
        if not self._probe.is_known(entity_id):
            return Resolution(
                asset_id=asset_id,
                capability=capability,
                role=role,
                status=ResolutionStatus.ENTITY_NOT_FOUND,
                binding=binding,
                entity_id=entity_id,
            )

        state = self._probe.get_state(entity_id)
        status = _runtime_status(state)
        return Resolution(
            asset_id=asset_id,
            capability=capability,
            role=role,
            status=status,
            binding=binding,
            entity_id=entity_id,
            state=state,
        )

    def resolve_entity_id(
        self, asset_id: str, capability: str, role: str = "primary"
    ) -> str:
        """Return the current entity id, raising on configuration failures.

        Runtime unavailability is not a configuration failure: the entity id is
        returned even when the entity is ``unavailable`` or ``unknown`` so a
        caller can still render that state.
        """
        result = self.resolve(asset_id, capability, role)
        if result.status is ResolutionStatus.INVALID_REQUEST:
            raise InvalidResolveRequestError(
                f"Invalid capability/role: {capability!r}/{role!r}"
            )
        if result.status is ResolutionStatus.ASSET_NOT_FOUND:
            raise AssetNotFoundError(f"Asset {asset_id} was not found")
        if result.status is ResolutionStatus.CAPABILITY_NOT_DECLARED:
            raise CapabilityNotDeclaredError(
                f"Asset {asset_id} does not declare capability {capability}"
            )
        if result.status is ResolutionStatus.BINDING_NOT_FOUND:
            raise BindingNotFoundError(
                f"No binding for ({asset_id}, {capability}, {role})"
            )
        if result.status is ResolutionStatus.ENTITY_NOT_FOUND:
            raise StaleBindingError(f"Bound entity {result.entity_id} no longer exists")
        assert result.entity_id is not None
        return result.entity_id

    @staticmethod
    def _miss(
        asset_id: str, capability: str, role: str, status: ResolutionStatus
    ) -> Resolution:
        return Resolution(
            asset_id=asset_id, capability=capability, role=role, status=status
        )


def _runtime_status(state: str | None) -> ResolutionStatus:
    if state is None or state == STATE_UNAVAILABLE:
        return ResolutionStatus.RUNTIME_UNAVAILABLE
    if state == STATE_UNKNOWN:
        return ResolutionStatus.RUNTIME_UNKNOWN
    return ResolutionStatus.RESOLVED


# ---------------------------------------------------------------------------
# Lightweight, vendor-neutral capability/entity compatibility
# ---------------------------------------------------------------------------


class Compatibility(Enum):
    """Tri-state compatibility verdict."""

    COMPATIBLE = "compatible"
    INCOMPATIBLE = "incompatible"
    UNKNOWN = "unknown"


# Generic Home Assistant domains that can plausibly implement a capability.
# Intentionally small and extensible; no manufacturer or protocol knowledge.
DEFAULT_CAPABILITY_DOMAINS: dict[str, frozenset[str]] = {
    "on_off": frozenset({"switch", "light", "fan", "input_boolean", "climate"}),
    "dimming": frozenset({"light"}),
    "temperature": frozenset({"sensor", "climate"}),
    "setpoint": frozenset({"climate", "number", "input_number"}),
    "power_measurement": frozenset({"sensor"}),
}


@dataclass(frozen=True, slots=True)
class CompatibilityResult:
    """Result of a compatibility check."""

    verdict: Compatibility
    capability: str
    entity_id: str
    reason: str | None = None

    def __bool__(self) -> bool:
        """A rejection is falsy; COMPATIBLE and UNKNOWN are truthy (advisory)."""
        return self.verdict is not Compatibility.INCOMPATIBLE


class CapabilityCompatibility:
    """Advisory checks based on generic Home Assistant entity domains."""

    def __init__(
        self, capability_domains: dict[str, frozenset[str]] | None = None
    ) -> None:
        source = (
            DEFAULT_CAPABILITY_DOMAINS
            if capability_domains is None
            else capability_domains
        )
        self._domains: dict[str, frozenset[str]] = dict(source)

    def register(self, capability: str, domains: set[str] | frozenset[str]) -> None:
        """Add or replace the allowed domains for a capability."""
        key = normalize_identifier(capability, "capability")
        self._domains[key] = frozenset(domains)

    def allowed_domains(self, capability: str) -> frozenset[str] | None:
        """Return the configured domain allow-list for a capability, if any."""
        return self._domains.get(capability)

    def check(self, capability: str, entity_id: str) -> CompatibilityResult:
        """Return a tri-state verdict for binding ``entity_id`` to ``capability``.

        Unmapped capabilities and un-parseable entity ids yield ``UNKNOWN`` so
        that extensible capabilities are never rejected by default.
        """
        allowed = self._domains.get(capability)
        if allowed is None:
            return CompatibilityResult(
                Compatibility.UNKNOWN, capability, entity_id, "capability not mapped"
            )
        domain = entity_id.split(".", 1)[0] if "." in entity_id else ""
        if not domain:
            return CompatibilityResult(
                Compatibility.UNKNOWN, capability, entity_id, "entity id has no domain"
            )
        if domain in allowed:
            return CompatibilityResult(Compatibility.COMPATIBLE, capability, entity_id)
        return CompatibilityResult(
            Compatibility.INCOMPATIBLE,
            capability,
            entity_id,
            f"domain {domain} not in {sorted(allowed)}",
        )
