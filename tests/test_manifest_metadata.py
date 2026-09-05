"""Tests for BindHome manifest metadata."""

from __future__ import annotations

import json
from pathlib import Path


MANIFEST_PATH = Path("custom_components/bindhome/manifest.json")


def test_bindhome_is_registered_as_hub() -> None:
    """BindHome must not be exposed through Home Assistant's Helpers UI."""
    manifest = json.loads(MANIFEST_PATH.read_text())

    assert manifest["integration_type"] == "hub"
