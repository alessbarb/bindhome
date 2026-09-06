from __future__ import annotations

from types import SimpleNamespace

import pytest
from homeassistant.exceptions import Unauthorized

from custom_components.bindhome.authorization import (
    AccessLevel,
    access_level,
    admin_read,
    admin_write,
    household_read,
)
from custom_components.bindhome.backup_websocket import (
    ws_backup_export,
    ws_backup_recovery_status,
    ws_backup_restore,
)
from custom_components.bindhome.csv_websocket import (
    ws_csv_export,
    ws_csv_import,
    ws_csv_validate,
)
from custom_components.bindhome.deletion_websocket import (
    ws_asset_delete_impact,
    ws_asset_delete_with_dependencies,
)
from custom_components.bindhome.import_websocket import (
    ws_import_commit,
    ws_import_discover,
)
from custom_components.bindhome.replacement_websocket import (
    ws_replacement_candidates,
    ws_replacement_commit,
)
from custom_components.bindhome.websocket import (
    ws_asset_create,
    ws_asset_create_bulk,
    ws_asset_delete,
    ws_asset_get,
    ws_asset_list,
    ws_asset_update,
    ws_binding_delete,
    ws_binding_set,
    ws_binding_status,
    ws_graph_path,
    ws_graph_traverse,
    ws_preset_list,
    ws_registry_get,
    ws_registry_subscribe,
    ws_relation_create,
    ws_relation_delete,
    ws_relation_list,
    ws_representation_delete,
    ws_representation_set,
)


def _connection(*, is_admin: bool):
    return SimpleNamespace(user=SimpleNamespace(is_admin=is_admin))


def _handler(_hass, _connection, _msg):
    return "called"


def test_household_read_does_not_require_admin() -> None:
    wrapped = household_read(_handler)
    assert wrapped(None, _connection(is_admin=False), {"id": 1}) == "called"
    assert access_level(wrapped) is AccessLevel.HOUSEHOLD_READ


@pytest.mark.parametrize(
    ("decorator", "level"),
    [
        (admin_read, AccessLevel.ADMIN_READ),
        (admin_write, AccessLevel.ADMIN_WRITE),
    ],
)
def test_admin_access_classes_reject_non_admin(decorator, level) -> None:
    calls = []

    def handler(_hass, _connection, _msg):
        calls.append(True)

    wrapped = decorator(handler)
    assert access_level(wrapped) is level
    with pytest.raises(Unauthorized):
        wrapped(None, _connection(is_admin=False), {"id": 1})
    assert calls == []

    assert wrapped(None, _connection(is_admin=True), {"id": 1}) is None
    assert calls == [True]


def test_every_bindhome_websocket_has_an_explicit_access_class() -> None:
    household = {
        ws_registry_get,
        ws_registry_subscribe,
        ws_preset_list,
        ws_asset_get,
        ws_asset_list,
        ws_relation_list,
        ws_graph_traverse,
        ws_graph_path,
        ws_binding_status,
    }
    admin_reads = {
        ws_backup_export,
        ws_backup_recovery_status,
        ws_csv_export,
        ws_csv_validate,
        ws_asset_delete_impact,
        ws_import_discover,
        ws_replacement_candidates,
    }
    admin_writes = {
        ws_asset_create,
        ws_asset_create_bulk,
        ws_asset_update,
        ws_asset_delete,
        ws_relation_create,
        ws_relation_delete,
        ws_binding_set,
        ws_binding_delete,
        ws_representation_set,
        ws_representation_delete,
        ws_backup_restore,
        ws_csv_import,
        ws_asset_delete_with_dependencies,
        ws_import_commit,
        ws_replacement_commit,
    }

    assert all(
        access_level(handler) is AccessLevel.HOUSEHOLD_READ for handler in household
    )
    assert all(
        access_level(handler) is AccessLevel.ADMIN_READ for handler in admin_reads
    )
    assert all(
        access_level(handler) is AccessLevel.ADMIN_WRITE for handler in admin_writes
    )
    assert len(household | admin_reads | admin_writes) == 31
