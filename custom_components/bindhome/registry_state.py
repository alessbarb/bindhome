"""Helpers for replacing persisted BindHome Registry contents safely."""

from __future__ import annotations

from .registry import BindHomeRegistry, RegistryValidationError

_SCHEMA_KEYS = {"schema_version"}


def _persisted_collection_names(registry: BindHomeRegistry) -> tuple[str, ...]:
    """Return persisted collection names and verify their in-memory shape.

    The list is derived from ``to_dict()`` rather than duplicated manually so a
    future persisted collection cannot be silently omitted from live adoption.
    Persisted top-level scalar fields require an explicit adoption design and
    therefore fail closed here instead of being ignored.
    """
    names = sorted(set(registry.to_dict()) - _SCHEMA_KEYS)
    invalid = [
        name for name in names if not isinstance(getattr(registry, name, None), dict)
    ]
    if invalid:
        raise RegistryValidationError(
            "Persisted Registry fields require explicit adoption semantics: "
            + ", ".join(invalid)
        )
    return tuple(names)


def replace_registry_contents(
    target: BindHomeRegistry,
    source: BindHomeRegistry,
) -> None:
    """Replace persisted collections while preserving ``target`` identity."""
    if target is source:
        return

    target_names = _persisted_collection_names(target)
    source_names = _persisted_collection_names(source)
    if target_names != source_names:
        raise RegistryValidationError(
            "Live and staged Registry persisted collections do not match"
        )

    collections: list[tuple[dict[object, object], dict[object, object]]] = []
    for name in target_names:
        target_collection = getattr(target, name)
        source_collection = getattr(source, name)
        collections.append((target_collection, source_collection))

    # Validate every collection before mutating any live state.
    for target_collection, source_collection in collections:
        if not isinstance(target_collection, dict) or not isinstance(
            source_collection, dict
        ):
            raise RegistryValidationError(
                "Persisted Registry collection adoption requires dictionaries"
            )

    for target_collection, source_collection in collections:
        target_collection.clear()
        target_collection.update(source_collection)
