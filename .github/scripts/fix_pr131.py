from pathlib import Path


def replace(path: str, old: str, new: str, count: int = 1) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Anchor missing in {path}: {old[:120]!r}")
    file.write_text(text.replace(old, new, count), encoding="utf-8")


replace(
    "tests/test_representation.py",
    '            "representations": [],\n        }',
    '            "representations": [],\n            "adoptions": [],\n        }',
)
replace(
    "tests/test_store_recovery.py",
    '            "representations": [],\n        }',
    '            "representations": [],\n            "adoptions": [],\n        }',
)
replace(
    "custom_components/bindhome/registry.py",
    '                    "Hardware adoption owner does not target the adopted Entity Registry entry",',
    '                    (\n                        "Hardware adoption owner does not target the adopted "\n                        "Entity Registry entry"\n                    ),',
)

Path(".github/scripts/fix_pr131.py").unlink()
