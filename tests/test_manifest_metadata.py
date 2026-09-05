"""Tests for BindHome manifest metadata."""

import json


MANIFEST_PATH = "custom_components/bindhome/manifest.json"


def test_bindhome_is_registered_as_hub() -> None:
    """BindHome must not be exposed through Home Assistant's Helpers UI."""
    with open(MANIFEST_PATH, encoding="utf-8") as manifest_file:
        manifest = json.load(manifest_file)

    assert manifest["integration_type"] == "hub"
