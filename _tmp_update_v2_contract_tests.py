from pathlib import Path

ROOT = Path(__file__).parent


def replace_once(path: str, old: str, new: str) -> None:
    file = ROOT / path
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"{path}: replacement target not found: {old[:100]!r}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


# Tests that describe the *current* canonical schema should follow the constant,
# not pin historical v1 after #50 deliberately advances the Registry to v2.
replace_once(
    "tests/test_registry.py",
    "from custom_components.bindhome.models import Asset, Binding, Relation\n",
    "from custom_components.bindhome.const import REGISTRY_SCHEMA_VERSION\n"
    "from custom_components.bindhome.models import Asset, Binding, Relation\n",
)
registry_path = ROOT / "tests/test_registry.py"
registry_text = registry_path.read_text(encoding="utf-8")
registry_text = registry_text.replace(
    'assert data["schema_version"] == 1',
    'assert data["schema_version"] == REGISTRY_SCHEMA_VERSION',
)
# All schema_version=1 dictionaries in this strict parser test module are current
# canonical-shape tests, not migration fixtures; migration coverage lives in
# test_registry_migrations.py.
registry_text = registry_text.replace(
    '"schema_version": 1,',
    '"schema_version": REGISTRY_SCHEMA_VERSION,',
)
registry_path.write_text(registry_text, encoding="utf-8")

replace_once(
    "tests/test_diagnostics.py",
    "from custom_components.bindhome import diagnostics\n",
    "from custom_components.bindhome import diagnostics\n"
    "from custom_components.bindhome.const import REGISTRY_SCHEMA_VERSION\n",
)
replace_once(
    "tests/test_diagnostics.py",
    '"registry_schema_version": 1,',
    '"registry_schema_version": REGISTRY_SCHEMA_VERSION,',
)

replace_once(
    "tests/test_services.py",
    "    DOMAIN,\n",
    "    DOMAIN,\n    REGISTRY_SCHEMA_VERSION,\n",
)
replace_once(
    "tests/test_services.py",
    'assert registry_data["schema_version"] == 1',
    'assert registry_data["schema_version"] == REGISTRY_SCHEMA_VERSION',
)

replace_once(
    "tests/test_representation.py",
    'def test_explicit_empty_representation_list_disables_legacy_inference() -> None:\n'
    '    registry = BindHomeRegistry.from_dict(\n'
    '        {\n'
    '            "schema_version": 1,',
    'def test_explicit_empty_representation_list_disables_legacy_inference() -> None:\n'
    '    registry = BindHomeRegistry.from_dict(\n'
    '        {\n'
    '            "schema_version": REGISTRY_SCHEMA_VERSION,',
)
replace_once(
    "tests/test_representation.py",
    "from custom_components.bindhome.models import Asset, Representation\n",
    "from custom_components.bindhome.const import REGISTRY_SCHEMA_VERSION\n"
    "from custom_components.bindhome.models import Asset, Representation\n",
)

# This test specifically asserts that *current canonical* payloads do not write.
replace_once(
    "tests/test_store_recovery.py",
    'async def test_canonical_registry_is_not_rewritten_on_load(\n'
    '    hass: HomeAssistant,\n'
    ') -> None:\n'
    '    store = BindHomeStore(hass)\n'
    '    store._async_path_exists = AsyncMock(return_value=True)\n'
    '    store._store.async_load = AsyncMock(\n'
    '        return_value={\n'
    '            "schema_version": 1,',
    'async def test_canonical_registry_is_not_rewritten_on_load(\n'
    '    hass: HomeAssistant,\n'
    ') -> None:\n'
    '    store = BindHomeStore(hass)\n'
    '    store._async_path_exists = AsyncMock(return_value=True)\n'
    '    store._store.async_load = AsyncMock(\n'
    '        return_value={\n'
    '            "schema_version": REGISTRY_SCHEMA_VERSION,',
)
replace_once(
    "tests/test_store_recovery.py",
    "from custom_components.bindhome.registry import BindHomeRegistry\n",
    "from custom_components.bindhome.const import REGISTRY_SCHEMA_VERSION\n"
    "from custom_components.bindhome.registry import BindHomeRegistry\n",
)

# The recovery handler test intentionally uses a tiny SimpleNamespace instead of
# a real HomeAssistant object. Identity enrichment is covered with real HA in
# test_binding_target_identity.py, so isolate this test to its recovery contract.
replace_once(
    "tests/test_backup_websocket.py",
    '    connection = FakeConnection()\n\n    await call(\n'
    '        backup_websocket.ws_backup_restore,\n'
    '        hass,\n'
    '        connection,\n'
    '        {"id": "recovery", "backup": export_registry_backup(restored)},\n'
    '    )\n',
    '    connection = FakeConnection()\n'
    '    monkeypatch.setattr(\n'
    '        backup_websocket,\n'
    '        "parse_registry_backup",\n'
    '        lambda data, *, hass=None: restored,\n'
    '    )\n\n'
    '    await call(\n'
    '        backup_websocket.ws_backup_restore,\n'
    '        hass,\n'
    '        connection,\n'
    '        {"id": "recovery", "backup": export_registry_backup(restored)},\n'
    '    )\n',
)

print("Current-schema tests aligned with Registry v2")
