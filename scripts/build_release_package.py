#!/usr/bin/env python3
"""Build and validate the HACS release archive for BindHome."""

from __future__ import annotations

import argparse
import json
from pathlib import Path, PurePosixPath
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
INTEGRATION_DIR = ROOT / "custom_components" / "bindhome"
REQUIRED_RUNTIME_FILES = (
    "__init__.py",
    "manifest.json",
    "panel/static/bindhome-panel.js",
)
EXCLUDED_PARTS = {"__pycache__"}
EXCLUDED_SUFFIXES = {".pyc", ".pyo"}


def _validate_required_source_files() -> str:
    """Validate release-critical source files and return the manifest version."""
    for relative in REQUIRED_RUNTIME_FILES:
        path = INTEGRATION_DIR / relative
        if not path.is_file():
            raise SystemExit(f"Missing required runtime file: {relative}")
        if path.stat().st_size == 0:
            raise SystemExit(f"Required runtime file is empty: {relative}")

    manifest_path = INTEGRATION_DIR / "manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as err:
        raise SystemExit(f"Invalid manifest.json: {err}") from err

    version = manifest.get("version")
    if not isinstance(version, str) or not version:
        raise SystemExit("manifest.json has no non-empty version")
    return version


def _runtime_files() -> list[tuple[Path, str]]:
    """Return deterministic runtime files with integration-root archive paths."""
    files: list[tuple[Path, str]] = []
    for path in sorted(INTEGRATION_DIR.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(INTEGRATION_DIR)
        if any(part in EXCLUDED_PARTS for part in relative.parts):
            continue
        if path.suffix in EXCLUDED_SUFFIXES:
            continue
        files.append((path, relative.as_posix()))
    return files


def _validate_archive(output: Path, expected_version: str) -> None:
    """Fail closed unless the archive is a valid HACS integration package."""
    with ZipFile(output) as archive:
        names = archive.namelist()
        name_set = set(names)

        if not names:
            raise SystemExit("Release archive is empty")
        if len(names) != len(name_set):
            raise SystemExit("Release archive contains duplicate paths")

        for name in names:
            path = PurePosixPath(name)
            if path.is_absolute() or ".." in path.parts:
                raise SystemExit(f"Unsafe archive path: {name}")
            if name.startswith("custom_components/"):
                raise SystemExit(
                    "Release archive must be rooted at the integration, not custom_components/"
                )

        for relative in REQUIRED_RUNTIME_FILES:
            if relative not in name_set:
                raise SystemExit(f"Release archive is missing {relative}")
            if archive.getinfo(relative).file_size == 0:
                raise SystemExit(f"Release archive contains empty {relative}")

        try:
            manifest = json.loads(archive.read("manifest.json").decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as err:
            raise SystemExit(f"Packaged manifest.json is invalid: {err}") from err

        if manifest.get("version") != expected_version:
            raise SystemExit(
                "Packaged manifest version does not match source manifest version"
            )


def build_release_package(output: Path) -> None:
    """Build the release ZIP and validate exactly what HACS will extract."""
    version = _validate_required_source_files()
    files = _runtime_files()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)

    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path, relative in files:
            archive.write(path, relative)

    _validate_archive(output, version)
    print(
        f"Validated BindHome {version} release package: "
        f"{output} ({len(files)} files, {output.stat().st_size} bytes)"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "dist" / "bindhome.zip",
        help="Output ZIP path",
    )
    args = parser.parse_args()
    build_release_package(args.output)


if __name__ == "__main__":
    main()
