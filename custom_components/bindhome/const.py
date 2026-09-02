"""Constants for BindHome."""

from typing import Final

DOMAIN: Final = "bindhome"
NAME: Final = "BindHome"

STORAGE_KEY: Final = "bindhome.registry"
STORAGE_VERSION: Final = 1
REGISTRY_SCHEMA_VERSION: Final = 1

SIGNAL_REGISTRY_CHANGED: Final = f"{DOMAIN}_registry_changed"

# BindHome-owned logical representation contracts.
#
# This is deliberately NOT a Home Assistant domain catalogue. It lists only
# logical entity platforms implemented by BindHome itself and the BindHome
# capabilities each implementation requires.
REPRESENTATION_REQUIREMENTS: Final[dict[str, frozenset[str]]] = {
    "light": frozenset({"on_off"}),
}

SERVICE_CREATE_ASSET: Final = "create_asset"
SERVICE_UPDATE_ASSET: Final = "update_asset"
SERVICE_DELETE_ASSET: Final = "delete_asset"
SERVICE_ADD_RELATION: Final = "add_relation"
SERVICE_REMOVE_RELATION: Final = "remove_relation"
SERVICE_SET_BINDING: Final = "set_binding"
SERVICE_REMOVE_BINDING: Final = "remove_binding"
SERVICE_GET_REGISTRY: Final = "get_registry"
