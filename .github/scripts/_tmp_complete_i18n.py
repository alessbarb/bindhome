from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN_PATH = ROOT / "custom_components/bindhome/translations/en.json"
ES_PATH = ROOT / "custom_components/bindhome/translations/es.json"
FRONTEND_TEST = ROOT / "frontend/test/i18n.test.js"
PYTHON_TEST = ROOT / "tests/test_translation_parity.py"
CHANGELOG = ROOT / "CHANGELOG.md"
PR_NUMBER = 66


def update_english() -> None:
    text = EN_PATH.read_text()
    old = '  "system_health": { "info": { "loaded": "Loaded", "assets": "Assets", "relations": "Relations", "bindings": "Bindings" } },'
    new = '  "system_health": { "info": { "loaded": "Loaded", "assets": "Assets", "relations": "Relations", "bindings": "Bindings", "representations": "Representations" } },'
    if old in text:
        text = text.replace(old, new, 1)
    elif new not in text:
        raise RuntimeError("Unexpected English system_health structure")
    EN_PATH.write_text(text)


def update_spanish() -> None:
    text = ES_PATH.read_text()
    if '"config": {' in text:
        return
    anchor = '  "issues": {'
    if anchor not in text:
        raise RuntimeError("Unexpected Spanish translation structure")
    prefix = '''  "title": "BindHome",
  "config": {
    "step": {
      "user": {
        "title": "Configurar BindHome",
        "description": "Crea el Registry de infraestructura de BindHome para esta instalación de Home Assistant."
      }
    },
    "abort": {
      "single_instance_allowed": "BindHome ya está configurado."
    }
  },
  "services": {
    "create_asset": {
      "name": "Crear Asset",
      "description": "Crea un Asset de infraestructura estable.",
      "fields": {
        "name": { "name": "Nombre", "description": "Nombre legible del Asset." },
        "asset_type": { "name": "Tipo de Asset", "description": "Tipo genérico de infraestructura en lower_snake_case." },
        "code": { "name": "Código", "description": "Código opcional del Asset visible para las personas." },
        "area_id": { "name": "Área", "description": "Área opcional de Home Assistant que contiene el Asset." },
        "capabilities": { "name": "Capabilities", "description": "Lista de Capabilities lógicas en lower_snake_case." }
      }
    },
    "delete_asset": {
      "name": "Eliminar Asset",
      "description": "Elimina un Asset que no tenga relaciones ni Bindings activos.",
      "fields": { "asset_id": { "name": "ID del Asset", "description": "ID inmutable del Asset de BindHome." } }
    },
    "add_relation": {
      "name": "Añadir relación",
      "description": "Crea una relación de topología dirigida entre dos Assets.",
      "fields": {
        "source_asset_id": { "name": "ID del Asset de origen", "description": "Asset de origen de BindHome." },
        "relation_type": { "name": "Tipo de relación", "description": "Tipo genérico de relación en lower_snake_case." },
        "target_asset_id": { "name": "ID del Asset de destino", "description": "Asset de destino de BindHome." }
      }
    },
    "remove_relation": {
      "name": "Eliminar relación",
      "description": "Elimina una relación de topología.",
      "fields": { "relation_id": { "name": "ID de la relación", "description": "ID de la relación de BindHome." } }
    },
    "set_binding": {
      "name": "Establecer Binding",
      "description": "Vincula una Capability y un rol de un Asset con la entidad de Home Assistant que la implementa actualmente.",
      "fields": {
        "asset_id": { "name": "ID del Asset", "description": "ID del Asset de BindHome." },
        "capability": { "name": "Capability", "description": "Capability proporcionada por el Asset." },
        "entity_id": { "name": "Entidad", "description": "Implementación actual en Home Assistant." },
        "role": { "name": "Rol", "description": "Rol del Binding; por defecto, primary." }
      }
    },
    "remove_binding": {
      "name": "Eliminar Binding",
      "description": "Elimina un Binding de una Capability sin borrar el Asset de infraestructura.",
      "fields": { "binding_id": { "name": "ID del Binding", "description": "ID del Binding de BindHome." } }
    },
    "get_registry": { "name": "Obtener Registry", "description": "Devuelve el Registry completo de BindHome sin modificarlo." }
  },
  "system_health": { "info": { "loaded": "Cargado", "assets": "Assets", "relations": "Relaciones", "bindings": "Bindings", "representations": "Representations" } },
'''
    ES_PATH.write_text(text.replace(anchor, prefix + anchor, 1))


def write_python_tests() -> None:
    PYTHON_TEST.write_text('''"""Translation parity tests for Home Assistant-facing BindHome strings."""\n\nfrom __future__ import annotations\n\nimport json\nfrom pathlib import Path\nimport re\n\nTRANSLATIONS = Path("custom_components/bindhome/translations")\n\n\ndef _load(language: str) -> dict[str, object]:\n    return json.loads((TRANSLATIONS / f"{language}.json").read_text())\n\n\ndef _leaf_paths(value: object, prefix: str = "") -> set[str]:\n    if isinstance(value, dict):\n        paths: set[str] = set()\n        for key, child in value.items():\n            child_prefix = f"{prefix}.{key}" if prefix else key\n            paths.update(_leaf_paths(child, child_prefix))\n        return paths\n    return {prefix}\n\n\ndef _strings(value: object, prefix: str = "") -> dict[str, str]:\n    if isinstance(value, dict):\n        result: dict[str, str] = {}\n        for key, child in value.items():\n            child_prefix = f"{prefix}.{key}" if prefix else key\n            result.update(_strings(child, child_prefix))\n        return result\n    if not isinstance(value, str):\n        raise AssertionError(f"Translation leaf {prefix} is not a string")\n    return {prefix: value}\n\n\ndef _placeholders(value: str) -> set[str]:\n    return set(re.findall(r"\\{(\\w+)\\}", value))\n\n\ndef test_english_and_spanish_translation_key_parity() -> None:\n    assert _leaf_paths(_load("es")) == _leaf_paths(_load("en"))\n\n\ndef test_translation_placeholders_have_parity() -> None:\n    en = _strings(_load("en"))\n    es = _strings(_load("es"))\n    assert en.keys() == es.keys()\n    for key in en:\n        assert _placeholders(es[key]) == _placeholders(en[key]), key\n\n\ndef test_home_assistant_surfaces_have_complete_translation_coverage() -> None:\n    expected_system_health = {\n        "loaded",\n        "assets",\n        "relations",\n        "bindings",\n        "representations",\n    }\n    expected_services = {\n        "create_asset",\n        "delete_asset",\n        "add_relation",\n        "remove_relation",\n        "set_binding",\n        "remove_binding",\n        "get_registry",\n    }\n    for language in ("en", "es"):\n        data = _load(language)\n        assert data["title"] == "BindHome"\n        assert "user" in data["config"]["step"]\n        assert "single_instance_allowed" in data["config"]["abort"]\n        assert set(data["services"]) == expected_services\n        assert set(data["system_health"]["info"]) == expected_system_health\n        assert "registry_recovery" in data["issues"]\n\n\ndef test_spanish_uses_established_core_model_terms() -> None:\n    es = _load("es")\n    assert es["services"]["create_asset"]["name"] == "Crear Asset"\n    assert es["services"]["set_binding"]["name"] == "Establecer Binding"\n    assert es["services"]["set_binding"]["fields"]["capability"]["name"] == "Capability"\n    assert es["system_health"]["info"]["representations"] == "Representations"\n\n\ndef test_duplicate_strings_source_is_not_reintroduced() -> None:\n    assert not Path("custom_components/bindhome/strings.json").exists()\n''')


def update_frontend_test() -> None:
    text = FRONTEND_TEST.read_text()
    marker = 'test("localizer preserves unresolved optional placeholders"'
    if marker in text:
        return
    insert = '''\n\ntest("localizer preserves unresolved optional placeholders", () => {\n  const t = createLocalizer(\n    {\n      "component.bindhome.common.panel_example_optional":\n        "Connected {name}; optional {detail}",\n    },\n    {},\n  );\n\n  assert.equal(\n    t("example.optional", { name: "Socket" }),\n    "Connected Socket; optional {detail}",\n  );\n});\n'''
    anchor = '\ntest("Spanish preset names do not translate machine identifiers in payloads"'
    if anchor not in text:
        raise RuntimeError("Unexpected frontend i18n test structure")
    FRONTEND_TEST.write_text(text.replace(anchor, insert + anchor, 1))


def update_changelog() -> None:
    text = CHANGELOG.read_text()
    entry = (
        "- Home Assistant-facing English and Spanish translations now have enforced key and placeholder parity across config flow, services, system health, Repairs and panel resources; system health also covers Representations, and frontend localization preserves unresolved optional placeholders. "
        f"([#{PR_NUMBER}](https://github.com/alessbarb/bindhome/pull/{PR_NUMBER}))\n"
    )
    if entry in text:
        return
    anchor = "### Changed\n\n"
    if anchor not in text:
        raise RuntimeError("Unreleased Changed section not found")
    CHANGELOG.write_text(text.replace(anchor, anchor + entry, 1))


def validate_json() -> None:
    for path in (EN_PATH, ES_PATH):
        json.loads(path.read_text())


update_english()
update_spanish()
write_python_tests()
update_frontend_test()
update_changelog()
validate_json()
