# Resolve action

`bindhome.resolve` exposes BindHome's stable Binding resolver to Home Assistant automations and scripts without requiring a logical Representation.

The action is read-only. It never calls the resolved entity and never mutates the BindHome Registry or Home Assistant.

## Inputs

- `asset_id` — stable BindHome Asset ID.
- `capability` — lower_snake_case Capability declared by the Asset.
- `role` — optional lower_snake_case Binding role; defaults to `primary`.

The action requires response data and always returns one structured resolution result for a syntactically valid request.

## Response contract

```yaml
asset_id: 9f2e2c1e-...
capability: on_off
role: primary
status: resolved
entity_id: switch.living_room_relay
config_valid: true
runtime_available: true
state: "on"
```

The response keys are stable across resolved and unresolved outcomes:

- `status` is one of the resolver status values such as `resolved`, `asset_not_found`, `capability_not_declared`, `binding_not_found`, `entity_not_found`, `runtime_unavailable` or `runtime_unknown`.
- `entity_id` is the current Home Assistant entity identifier when the stable Binding target can be resolved; otherwise it is `null`.
- `config_valid` distinguishes a real configured target from missing/stale configuration.
- `runtime_available` is true only when the current target has a usable runtime state.
- `state` contains the current Home Assistant state string when one is available; otherwise it is `null`.

Normal lookup misses are data, not exceptions. For example, an Asset with no matching Binding returns `status: binding_not_found` with `config_valid: false`.

Malformed requests are different: an empty Asset ID or a Capability/role that does not follow BindHome's lower_snake_case identifier contract raises a Home Assistant validation error before resolution.

## Script example

```yaml
sequence:
  - action: bindhome.resolve
    data:
      asset_id: 9f2e2c1e-0000-0000-0000-000000000000
      capability: on_off
    response_variable: resolved_light

  - if:
      - condition: template
        value_template: "{{ resolved_light.runtime_available }}"
    then:
      - action: homeassistant.turn_on
        target:
          entity_id: "{{ resolved_light.entity_id }}"
```

This keeps the automation dependent on the stable Asset/capability identity while leaving Home Assistant responsible for actual service routing.

## Unavailable hardware example

A configured relay that is currently offline returns data such as:

```yaml
status: runtime_unavailable
entity_id: switch.living_room_relay
config_valid: true
runtime_available: false
state: unavailable
```

The distinction matters: the Binding is still valid and does not need repair merely because the hardware is temporarily offline.

Any future template helper for resolution should reuse this same resolver/result contract rather than implement separate Binding lookup rules.
