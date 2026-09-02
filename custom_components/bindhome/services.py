"""Home Assistant service actions for BindHome."""

from __future__ import annotations

from typing import cast

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import (
    DOMAIN,
    SERVICE_ADD_RELATION,
    SERVICE_CREATE_ASSET,
    SERVICE_DELETE_ASSET,
    SERVICE_GET_REGISTRY,
    SERVICE_REMOVE_BINDING,
    SERVICE_REMOVE_RELATION,
    SERVICE_SET_BINDING,
    SERVICE_UPDATE_ASSET,
)
from .manager import BindHomeManager
from .models import ModelValidationError
from .registry import RegistryError
from .validation import validate_area

_CREATE_ASSET_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("asset_type"): cv.string,
        vol.Optional("code"): cv.string,
        vol.Optional("area_id"): cv.string,
        vol.Optional("capabilities", default=[]): [cv.string],
    }
)
_UPDATE_ASSET_SCHEMA = vol.Schema(
    {
        vol.Required("asset_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("asset_type"): cv.string,
        vol.Optional("code"): vol.Any(None, cv.string),
        vol.Optional("area_id"): vol.Any(None, cv.string),
        vol.Optional("capabilities"): [cv.string],
    }
)
_DELETE_ASSET_SCHEMA = vol.Schema({vol.Required("asset_id"): cv.string})
_ADD_RELATION_SCHEMA = vol.Schema(
    {
        vol.Required("source_asset_id"): cv.string,
        vol.Required("relation_type"): cv.string,
        vol.Required("target_asset_id"): cv.string,
    }
)
_REMOVE_RELATION_SCHEMA = vol.Schema({vol.Required("relation_id"): cv.string})
_SET_BINDING_SCHEMA = vol.Schema(
    {
        vol.Required("asset_id"): cv.string,
        vol.Required("capability"): cv.string,
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("role", default="primary"): cv.string,
    }
)
_REMOVE_BINDING_SCHEMA = vol.Schema({vol.Required("binding_id"): cv.string})


def _get_manager(hass: HomeAssistant) -> BindHomeManager:
    """Return the single loaded BindHome manager."""
    entries = [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is config_entries.ConfigEntryState.LOADED
    ]
    if not entries:
        raise ServiceValidationError("BindHome is not configured or loaded")
    return cast(BindHomeManager, entries[0].runtime_data)


def _translate_registry_error(err: Exception) -> ServiceValidationError:
    return ServiceValidationError(str(err))


def async_register_services(hass: HomeAssistant) -> None:
    """Register BindHome actions."""

    async def create_asset(call: ServiceCall) -> ServiceResponse | None:
        manager = _get_manager(hass)
        area_id = call.data.get("area_id")
        validate_area(hass, area_id)
        try:
            asset = await manager.async_create_asset(
                name=call.data["name"],
                asset_type=call.data["asset_type"],
                code=call.data.get("code"),
                area_id=area_id,
                capabilities=list(call.data.get("capabilities", [])),
            )
        except (ModelValidationError, RegistryError) as err:
            raise _translate_registry_error(err) from err
        return {"asset": asset.to_dict()} if call.return_response else None

    async def update_asset(call: ServiceCall) -> ServiceResponse | None:
        manager = _get_manager(hass)

        try:
            existing = manager.registry.get_asset(call.data["asset_id"])

            area_id = call.data.get("area_id", existing.area_id)
            validate_area(hass, area_id)

            asset = await manager.async_update_asset(
                asset_id=existing.id,
                name=call.data.get("name", existing.name),
                asset_type=call.data.get(
                    "asset_type",
                    existing.asset_type,
                ),
                code=call.data.get("code", existing.code),
                area_id=area_id,
                capabilities=list(
                    call.data.get(
                        "capabilities",
                        existing.capabilities,
                    )
                ),
            )
        except (
            ModelValidationError,
            RegistryError,
            ServiceValidationError,
        ) as err:
            raise _translate_registry_error(err) from err

        return {"asset": asset.to_dict()} if call.return_response else None

    async def delete_asset(call: ServiceCall) -> ServiceResponse | None:
        manager = _get_manager(hass)
        try:
            await manager.async_delete_asset(call.data["asset_id"])
        except RegistryError as err:
            raise _translate_registry_error(err) from err
        return {"deleted": True} if call.return_response else None

    async def add_relation(call: ServiceCall) -> ServiceResponse | None:
        manager = _get_manager(hass)
        try:
            relation = await manager.async_add_relation(
                source_asset_id=call.data["source_asset_id"],
                relation_type=call.data["relation_type"],
                target_asset_id=call.data["target_asset_id"],
            )
        except (ModelValidationError, RegistryError) as err:
            raise _translate_registry_error(err) from err
        return (
            cast(ServiceResponse, {"relation": relation.to_dict()})
            if call.return_response
            else None
        )

    async def remove_relation(call: ServiceCall) -> ServiceResponse | None:
        manager = _get_manager(hass)
        try:
            await manager.async_remove_relation(call.data["relation_id"])
        except RegistryError as err:
            raise _translate_registry_error(err) from err
        return {"deleted": True} if call.return_response else None

    async def set_binding(call: ServiceCall) -> ServiceResponse | None:
        manager = _get_manager(hass)
        entity_id = call.data["entity_id"]
        try:
            binding = await manager.async_set_binding(
                asset_id=call.data["asset_id"],
                capability=call.data["capability"],
                entity_id=entity_id,
                role=call.data["role"],
            )
        except (ModelValidationError, RegistryError) as err:
            raise _translate_registry_error(err) from err
        return (
            cast(ServiceResponse, {"binding": binding.to_dict()})
            if call.return_response
            else None
        )

    async def remove_binding(call: ServiceCall) -> ServiceResponse | None:
        manager = _get_manager(hass)
        try:
            await manager.async_remove_binding(call.data["binding_id"])
        except RegistryError as err:
            raise _translate_registry_error(err) from err
        return {"deleted": True} if call.return_response else None

    async def get_registry(call: ServiceCall) -> ServiceResponse:
        manager = _get_manager(hass)
        return manager.registry.to_dict()

    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_ASSET,
        create_asset,
        schema=_CREATE_ASSET_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_ASSET,
        update_asset,
        schema=_UPDATE_ASSET_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_ASSET,
        delete_asset,
        schema=_DELETE_ASSET_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_RELATION,
        add_relation,
        schema=_ADD_RELATION_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_RELATION,
        remove_relation,
        schema=_REMOVE_RELATION_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_BINDING,
        set_binding,
        schema=_SET_BINDING_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_BINDING,
        remove_binding,
        schema=_REMOVE_BINDING_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_REGISTRY,
        get_registry,
        supports_response=SupportsResponse.ONLY,
    )
