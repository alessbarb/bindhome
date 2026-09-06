"""Administrative WebSocket API for assisted Home Assistant import."""

from __future__ import annotations

from typing import Any, cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import (
    ERR_INVALID_FORMAT,
    ERR_NOT_FOUND,
)
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from .authorization import admin_read, admin_write
from .const import DOMAIN
from .import_commit import (
    ImportBindingSelector,
    async_commit_reviewed_imports,
    select_proposal_bindings,
)
from .import_discovery import ImportDiscoveryError, discover_import_proposals
from .import_proposals import (
    ImportAssetCandidate,
    ImportBindingCandidate,
    ImportDecision,
    ImportDecisionAction,
    ImportProposal,
)
from .manager import BindHomeManager
from .models import ModelValidationError
from .registry import (
    RegistryConflictError,
    RegistryError,
    RegistryNotFoundError,
    RegistryValidationError,
)

WS_IMPORT_DISCOVER = f"{DOMAIN}/import/discover"
WS_IMPORT_COMMIT = f"{DOMAIN}/import/commit"

_ASSET_REVIEW_SCHEMA = vol.Schema(
    {
        vol.Required("name"): str,
        vol.Required("asset_type"): str,
        vol.Optional("area_id"): str,
        vol.Required("capabilities"): [str],
    }
)
_BINDING_SELECTOR_SCHEMA = vol.Schema(
    {
        vol.Required("capability"): str,
        vol.Optional("role", default="primary"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("entity_registry_id"): str,
    }
)
_DECISION_SCHEMA = vol.Schema(
    {
        vol.Required("proposal_id"): str,
        vol.Required("action"): vol.In(
            [action.value for action in ImportDecisionAction]
        ),
        vol.Optional("asset"): _ASSET_REVIEW_SCHEMA,
        vol.Optional("target_asset_id"): str,
        vol.Optional("bindings"): [_BINDING_SELECTOR_SCHEMA],
    }
)


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        raise RegistryValidationError("BindHome is not configured")
    entry = entries[0]
    if entry.state is not config_entries.ConfigEntryState.LOADED:
        raise RegistryValidationError("BindHome is not loaded")
    return cast(BindHomeManager, entry.runtime_data)


def _send_import_error(
    connection: ActiveConnection,
    msg: dict[str, Any],
    err: Exception,
) -> None:
    """Translate reviewed-import failures to stable WebSocket error classes."""
    if isinstance(err, (RegistryNotFoundError, ServiceValidationError)):
        code = ERR_NOT_FOUND
    elif isinstance(err, RegistryConflictError):
        code = "conflict"
    else:
        code = ERR_INVALID_FORMAT
    connection.send_error(msg["id"], code, str(err))


def _reviewed_asset(payload: dict[str, Any] | None) -> ImportAssetCandidate | None:
    if payload is None:
        return None
    return ImportAssetCandidate.create(
        name=payload["name"],
        asset_type=payload["asset_type"],
        area_id=payload.get("area_id"),
        capabilities=payload["capabilities"],
    )


def _reviewed_bindings(
    proposal: ImportProposal,
    payload: dict[str, Any],
) -> tuple[ImportBindingCandidate, ...] | None:
    if "bindings" not in payload:
        return None
    selectors = tuple(
        ImportBindingSelector.create(
            capability=item["capability"],
            role=item.get("role", "primary"),
            entity_id=item.get("entity_id"),
            entity_registry_id=item.get("entity_registry_id"),
        )
        for item in payload["bindings"]
    )
    return select_proposal_bindings(proposal, selectors)


def _reviewed_decisions(
    proposals: list[ImportProposal],
    payloads: list[dict[str, Any]],
) -> tuple[tuple[ImportProposal, ImportDecision], ...]:
    by_id = {proposal.proposal_id: proposal for proposal in proposals}
    reviewed: list[tuple[ImportProposal, ImportDecision]] = []
    seen: set[str] = set()

    for payload in payloads:
        proposal_id = payload["proposal_id"]
        if proposal_id in seen:
            raise RegistryValidationError(
                f"Import proposal {proposal_id} has multiple decisions"
            )
        seen.add(proposal_id)
        proposal = by_id.get(proposal_id)
        if proposal is None:
            raise RegistryConflictError(
                f"Import proposal {proposal_id} is no longer available; "
                "run discovery again"
            )
        decision = ImportDecision.create(
            action=payload["action"],
            asset=_reviewed_asset(payload.get("asset")),
            target_asset_id=payload.get("target_asset_id"),
            bindings=_reviewed_bindings(proposal, payload),
        )
        reviewed.append((proposal, decision))

    return tuple(reviewed)


@admin_read
@websocket_command(
    {
        vol.Required("type"): WS_IMPORT_DISCOVER,
        vol.Optional("area_id"): str,
    }
)
def ws_import_discover(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return non-mutating assisted-import proposals for review."""
    try:
        manager = _get_manager(hass)
        proposals = discover_import_proposals(
            hass,
            manager.registry,
            area_id=msg.get("area_id"),
        )
    except (ImportDiscoveryError, RegistryValidationError) as err:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, str(err))
        return

    connection.send_result(
        msg["id"],
        {
            "scope": {
                "type": "area" if msg.get("area_id") is not None else "all",
                "area_id": msg.get("area_id"),
            },
            "revision": manager.revision,
            "count": len(proposals),
            "proposals": [proposal.to_dict() for proposal in proposals],
        },
    )


@admin_write
@websocket_command(
    {
        vol.Required("type"): WS_IMPORT_COMMIT,
        vol.Optional("area_id"): str,
        vol.Required("based_on_revision"): vol.All(int, vol.Range(min=0)),
        vol.Required("decisions"): vol.All(
            [_DECISION_SCHEMA],
            vol.Length(min=1),
        ),
    }
)
@async_response
async def ws_import_commit(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Commit explicitly reviewed current proposals as one Registry transaction."""
    try:
        manager = _get_manager(hass)
        proposals = discover_import_proposals(
            hass,
            manager.registry,
            area_id=msg.get("area_id"),
        )
        reviewed = _reviewed_decisions(proposals, msg["decisions"])
        result = await async_commit_reviewed_imports(
            manager,
            reviewed,
            expected_revision=msg["based_on_revision"],
        )
    except (
        ImportDiscoveryError,
        ModelValidationError,
        RegistryError,
        ServiceValidationError,
        ValueError,
    ) as err:
        _send_import_error(connection, msg, err)
        return

    connection.send_result(msg["id"], result.to_dict())


def async_register_import_websocket_commands(hass: HomeAssistant) -> None:
    """Register assisted-import discovery and commit commands."""
    websocket_api.async_register_command(hass, ws_import_discover)
    websocket_api.async_register_command(hass, ws_import_commit)
