# BindHome Inventory design system

## Product and job

BindHome is an admin-only Home Assistant custom panel for recording stable,
physical home infrastructure independently from replaceable smart hardware.
The primary job is: while standing in a room, record quantities of physical
elements quickly, review editable drafts, and save the entire batch atomically.

Lifecycle language is `Inventory -> Connect -> Topology -> Expose / Automate`.
Inventory must never imply automation, bindings, entities, representations, or
topology.

## Information architecture

- Primary: Inventory
- Future-ready navigation labels: Infrastructure, Topology, Issues, Settings
- Existing diagnostics remain reachable from Inventory/Infrastructure, without
  raw IDs dominating normal mode.
- Primary action: `Inventory this room`

## Home Assistant-native visual language

- Use the host font and Home Assistant CSS variables. Do not introduce a brand
  font or arbitrary fixed palette.
- Background: `var(--primary-background-color)`.
- Surfaces: `var(--card-background-color)`.
- Main text: `var(--primary-text-color)`; supporting text:
  `var(--secondary-text-color)`.
- Action/accent: `var(--primary-color)`; borders: `var(--divider-color)`.
- Semantic states use HA semantic variables when present, with accessible local
  fallbacks only at implementation time.
- Use modest 8-12px rounding, thin borders, and restrained elevation. Prefer
  open sections, rows, and one purposeful review surface over nested cards.
- Typography follows HA/Roboto with a compact app hierarchy: 24px page title,
  20px section title, 16px row title/body, 14px supporting/control text.
- Spacing scale: 4, 8, 12, 16, 24, 32px.
- Controls are at least 44px high; quantity decrement/value/increment is a single
  grouped stepper with generous touch targets.
- Icons follow Material Design Icons/Home Assistant conventions and only aid
  scanning or action recognition.
- Focus rings must be conspicuous in both themes; do not rely on color alone.
- Motion is restrained (150-200ms) and communicates expansion, focus, saving,
  and successful completion; honor reduced-motion preferences.

## Desktop composition

- Keep Home Assistant's host shell/sidebar outside the custom-panel concept.
- Within BindHome, use a quiet top app bar and compact navigation.
- The workflow has persistent Floor and Area context near the top.
- Quantity entry uses a broad main column and a lighter contextual side rail for
  existing room inventory and the current `being added` count.
- Preset groups are accordions. Open Electrical initially; other groups stay
  collapsed but show their selected-count summary.
- Presets are dense rows, not cards: name and suggested functions at left,
  quantity stepper at right.
- Review uses editable rows with clear names/types and a progressive details
  area for code and capabilities. The save bar clearly states the batch count
  and atomic behavior.

## Narrow/mobile composition

- Single task-focused column with compact sticky room context.
- Area selection occurs before quantities and remains editable through a clear
  context control.
- Quantity rows keep label and stepper on one line where possible; stepper touch
  targets remain 44px.
- Existing inventory is a collapsible summary, visually distinct from drafts.
- Review is one draft per open row; no horizontal tables.
- A bottom action bar keeps `Review N items` or `Save N items` reachable without
  obscuring content or device safe areas.

## Required states and copy

1. Selection: `Inventory this room`; choose Floor then Area. Handle areas with
   no floor under `No floor` rather than hiding them.
2. Quantity entry: room context, existing inventory summary, six ordered preset
   groups, zero meaning no draft, and `Review N items`.
3. Review: `Already registered` remains read-only and separate from `Being added
   now`; generated names are editable; asset type and capabilities are editable,
   including custom identifiers; explicit Cancel and `Save N assets`.
4. Validation error: persistent drafts; inline field message; failing row gets
   error border and focus; top summary announces that nothing was saved.
5. Success: created count and room name; explain that no devices or automations
   were created; primary `Back to room inventory`, secondary `View inventory`.
6. Loading/empty/read failure: clear retry; no floors and no areas explain how
   to create them in Home Assistant Settings rather than within BindHome.

## Prohibitions

- No marketing hero, fake statistics, SaaS dashboard styling, decorative pills,
  bento grid, gradients, arbitrary colors, or nested-card clutter.
- No raw UUIDs or HA entity IDs in the primary room workflow.
- No BindHome-owned Floor/Area catalogue and no apparent creation of devices,
  entities, bindings, representations, automations, or topology.
- Use ONLY this design system's fonts, variables, spacing, and component styles.
