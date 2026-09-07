from pathlib import Path

path = Path("custom_components/bindhome/__init__.py")
path.write_text(path.read_text(encoding="utf-8").rstrip() + "\n", encoding="utf-8")
Path(".github/scripts/fix_visibility_patch.py").unlink()
