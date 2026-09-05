"""Constants for BindHome."""

from typing import Final

DOMAIN: Final = "bindhome"
NAME: Final = "BindHome"

STORAGE_KEY: Final = "bindhome.registry"
STORAGE_VERSION: Final = 1
REGISTRY_SCHEMA_VERSION: Final = 2

SIGNAL_REGISTRY_CHANGED: Final = f"{DOMAIN}_registry_changed"
SIGNAL_BINDING_TARGET_CHANGED: Final = f"{DOMAIN}_binding_target_changed"

SERVICE_CREATE_ASSET: Final = "create_asset"
SERVICE_UPDATE_ASSET: Final = "update_asset"
SERVICE_DELETE_ASSET: Final = "delete_asset"
SERVICE_ADD_RELATION: Final = "add_relation"
SERVICE_REMOVE_RELATION: Final = "remove_relation"
SERVICE_SET_BINDING: Final = "set_binding"
SERVICE_REMOVE_BINDING: Final = "remove_binding"
SERVICE_GET_REGISTRY: Final = "get_registry"
SERVICE_RESOLVE: Final = "resolve"
