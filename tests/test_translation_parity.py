"""Translation parity tests for Home Assistant-facing BindHome strings."""

from __future__ import annotations

import json
import re
from pathlib import Path

TRANSLATIONS = Path("custom_components/bindhome/translations")


def _load(language: str) -> dict[str, object]:
    return json.loads((TRANSLATIONS / f"{language}.json").read_text())


def _leaf_paths(value: object, prefix: str = "") -> set[str]:
    if isinstance(value, dict):
        paths: set[str] = set()
        for key, child in value.items():
            child_prefix = f"{prefix}.{key}" if prefix else key
            paths.update(_leaf_paths(child, child_prefix))
        return paths
    return {prefix}


def _strings(value: object, prefix: str = "") -> dict[str, str]:
    if isinstance(value, dict):
        result: dict[str, str] = {}
        for key, child in value.items():
            child_prefix = f"{prefix}.{key}" if prefix else key
            result.update(_strings(child, child_prefix))
        return result
    if not isinstance(value, str):
        raise AssertionError(f"Translation leaf {prefix} is not a string")
    return {prefix: value}


def _placeholders(value: str) -> set[str]:
    return set(re.findall(r"\{(\w+)\}", value))


def test_english_and_spanish_translation_key_parity() -> None:
    assert _leaf_paths(_load("es")) == _leaf_paths(_load("en"))


def test_translation_placeholders_have_parity() -> None:
    en = _strings(_load("en"))
    es = _strings(_load("es"))
    assert en.keys() == es.keys()
    for key in en:
        assert _placeholders(es[key]) == _placeholders(en[key]), key


def test_home_assistant_surfaces_have_complete_translation_coverage() -> None:
    expected_system_health = {
        "loaded",
        "assets",
        "relations",
        "bindings",
        "representations",
    }
    expected_services = {
        "create_asset",
        "delete_asset",
        "add_relation",
        "remove_relation",
        "set_binding",
        "remove_binding",
        "get_registry",
    }
    for language in ("en", "es"):
        data = _load(language)
        assert data["title"] == "BindHome"
        assert "user" in data["config"]["step"]
        assert "single_instance_allowed" in data["config"]["abort"]
        assert set(data["services"]) == expected_services
        assert set(data["system_health"]["info"]) == expected_system_health
        assert "registry_recovery" in data["issues"]


def test_spanish_uses_established_core_model_terms() -> None:
    es = _load("es")
    assert es["services"]["create_asset"]["name"] == "Crear Asset"
    assert es["services"]["set_binding"]["name"] == "Establecer Binding"
    assert es["services"]["set_binding"]["fields"]["capability"]["name"] == "Capability"
    assert es["system_health"]["info"]["representations"] == "Representations"


def test_duplicate_strings_source_is_not_reintroduced() -> None:
    assert not Path("custom_components/bindhome/strings.json").exists()
