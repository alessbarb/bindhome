from pathlib import Path

ROOT = Path(__file__).parent


def replace_once(path: str, old: str, new: str) -> None:
    file = ROOT / path
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"{path}: replacement target not found: {old[:100]!r}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


# Extend the resolver helper so tests can construct stable-identity Bindings.
replace_once(
    "tests/test_resolver.py",
    "def _bind(\n"
    "    registry: BindHomeRegistry,\n"
    "    asset: Asset,\n"
    "    cap: str,\n"
    "    entity: str,\n"
    "    role: str = \"primary\",\n"
    ") -> Binding:\n"
    "    return registry.set_binding(\n"
    "        Binding.create(asset_id=asset.id, capability=cap, entity_id=entity, role=role)\n"
    "    )\n",
    "def _bind(\n"
    "    registry: BindHomeRegistry,\n"
    "    asset: Asset,\n"
    "    cap: str,\n"
    "    entity: str,\n"
    "    role: str = \"primary\",\n"
    "    entity_registry_id: str | None = None,\n"
    ") -> Binding:\n"
    "    return registry.set_binding(\n"
    "        Binding.create(\n"
    "            asset_id=asset.id,\n"
    "            capability=cap,\n"
    "            entity_id=entity,\n"
    "            entity_registry_id=entity_registry_id,\n"
    "            role=role,\n"
    "        )\n"
    "    )\n",
)
replace_once(
    "tests/test_resolver.py",
    "    assert callable(ha_probe.is_known)\n"
    "    assert callable(ha_probe.get_state)\n",
    "    assert callable(ha_probe.entity_id_for_registry_id)\n"
    "    assert callable(ha_probe.is_known)\n"
    "    assert callable(ha_probe.get_state)\n",
)

resolver_tests = ROOT / "tests/test_resolver.py"
text = resolver_tests.read_text(encoding="utf-8")
text += '''


def test_stable_registry_identity_resolves_current_entity_id_after_rename() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(
        registry,
        asset,
        "on_off",
        "switch.before_rename",
        entity_registry_id="registry-entry-1",
    )
    probe = StaticEntityProbe(
        registry_entries={"registry-entry-1": "switch.after_rename"},
        states={"switch.after_rename": "on"},
    )
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.RESOLVED
    assert result.entity_id == "switch.after_rename"
    assert result.binding is not None
    assert result.binding.entity_id == "switch.before_rename"
    assert resolver.resolve_entity_id(asset.id, "on_off") == "switch.after_rename"


def test_missing_stable_registry_entry_never_falls_back_to_reused_entity_id() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(
        registry,
        asset,
        "on_off",
        "switch.old_name",
        entity_registry_id="deleted-registry-entry",
    )
    # A different entity may later reuse the old entity_id. Stable identity must
    # fail closed instead of silently rebinding to that unrelated entity.
    probe = StaticEntityProbe(states={"switch.old_name": "on"})
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.ENTITY_NOT_FOUND
    assert result.entity_id == "switch.old_name"
    assert result.config_valid is False
    with pytest.raises(StaleBindingError):
        resolver.resolve_entity_id(asset.id, "on_off")


def test_entity_id_fallback_remains_supported_without_stable_registry_identity() -> None:
    registry = BindHomeRegistry()
    asset = _asset(registry, ["on_off"])
    _bind(registry, asset, "on_off", "switch.state_machine_only")
    probe = StaticEntityProbe(states={"switch.state_machine_only": "off"})
    resolver = BindingResolver(registry, probe)

    result = resolver.resolve(asset.id, "on_off")

    assert result.status is ResolutionStatus.RESOLVED
    assert result.entity_id == "switch.state_machine_only"
    assert result.binding is not None
    assert result.binding.entity_registry_id is None
'''
resolver_tests.write_text(text, encoding="utf-8")

# Real HA contract: EntityRegistry.async_get accepts the stable entry id and
# returns the RegistryEntry with its current entity_id.
(ROOT / "tests/test_runtime_binding_identity.py").write_text(
    '''"""Home Assistant integration tests for stable Binding runtime identity."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.bindhome.models import Asset, Binding
from custom_components.bindhome.registry import BindHomeRegistry
from custom_components.bindhome.resolver import (
    BindingResolver,
    HomeAssistantEntityProbe,
    ResolutionStatus,
)


async def test_ha_probe_follows_entity_registry_rename(hass: HomeAssistant) -> None:
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "stable-relay",
        suggested_object_id="before_rename",
    )
    stable_id = entry.id
    old_entity_id = entry.entity_id
    renamed = entity_registry.async_update_entity(
        old_entity_id,
        new_entity_id="switch.after_rename",
    )

    probe = HomeAssistantEntityProbe(hass)

    assert probe.entity_id_for_registry_id(stable_id) == renamed.entity_id
    assert renamed.entity_id == "switch.after_rename"


async def test_resolver_uses_ha_registry_identity_after_rename(
    hass: HomeAssistant,
) -> None:
    entity_registry = er.async_get(hass)
    entry = entity_registry.async_get_or_create(
        "switch",
        "demo",
        "bound-relay",
        suggested_object_id="original",
    )
    stable_id = entry.id
    original_entity_id = entry.entity_id
    entity_registry.async_update_entity(
        original_entity_id,
        new_entity_id="switch.renamed",
    )
    hass.states.async_set("switch.renamed", "on")

    registry = BindHomeRegistry()
    asset = registry.add_asset(
        Asset.create(
            name="Relay",
            asset_type="relay",
            capabilities=["on_off"],
        )
    )
    registry.set_binding(
        Binding.create(
            asset_id=asset.id,
            capability="on_off",
            entity_id=original_entity_id,
            entity_registry_id=stable_id,
        )
    )

    resolution = BindingResolver(
        registry,
        HomeAssistantEntityProbe(hass),
    ).resolve(asset.id, "on_off")

    assert resolution.status is ResolutionStatus.RESOLVED
    assert resolution.entity_id == "switch.renamed"
    assert resolution.state == "on"
''',
    encoding="utf-8",
)

# Technical architecture now reflects the runtime semantics delivered by #51.
architecture = ROOT / "docs/architecture.md"
text = architecture.read_text(encoding="utf-8")
old = (
    "Home Assistant's Entity Registry is authoritative for registered entity "
    "identity, but BindHome 1.1.x currently persists the mutable `entity_id` "
    "string in hardware Bindings. Renaming a bound entity in Home Assistant can "
    "therefore make that Binding stale until it is rebound. Stable Entity "
    "Registry target identity is planned in issue #31.\n"
)
new = (
    "Home Assistant's Entity Registry owns durable entity identity. Schema-v2 "
    "Bindings persist that stable Entity Registry entry id when available, and "
    "runtime resolution maps it to the current `entity_id`, so normal Home "
    "Assistant entity-id renames do not break the Binding. `entity_id` remains "
    "the explicit compatibility fallback for targets that are not represented "
    "in the Entity Registry. A missing stable Registry entry fails closed rather "
    "than falling back to a possibly reused old entity id.\n"
)
if old not in text:
    raise SystemExit("architecture rename-warning paragraph not found")
architecture.write_text(text.replace(old, new, 1), encoding="utf-8")

changelog = ROOT / "CHANGELOG.md"
text = changelog.read_text(encoding="utf-8")
needle = "### Reliability\n\n"
entry = (
    "- Runtime Binding resolution now prefers persisted Home Assistant Entity "
    "Registry identity and resolves it to the current `entity_id`, so ordinary "
    "entity-id renames keep working without changing the BindHome Binding. "
    "Missing stable Registry entries fail closed instead of falling back to a "
    "possibly reused old entity id; state-machine-only Bindings retain their "
    "documented `entity_id` fallback. "
    "([#51](https://github.com/alessbarb/bindhome/issues/51))\n"
)
if entry not in text:
    text = text.replace(needle, needle + entry, 1)
changelog.write_text(text, encoding="utf-8")
