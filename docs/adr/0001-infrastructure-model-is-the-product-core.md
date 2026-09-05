# ADR 0001: The infrastructure model is the product core

- **Status:** Accepted
- **Date:** 2026-09-05

## Context

BindHome has two visible value surfaces:

1. documenting and querying a stable physical model of the home; and
2. exposing selected Assets back into Home Assistant through stable logical Representations.

Both are useful, but treating them as equal product centers makes prioritization ambiguous. It becomes unclear whether to spend the next unit of effort on inventory/import/topology/export workflows or on implementing more Home Assistant entity platforms.

The project also has a deliberate ownership boundary: Home Assistant remains authoritative for Devices, Entities, Areas, Floors, runtime state and hardware behaviour, while BindHome owns the additional physical infrastructure model.

## Decision

**The stable physical infrastructure model is BindHome's product core.**

Assets, Capabilities, Relations and Bindings form the durable model. Inventory, topology, diagnostics, replacement workflows, reporting and resolution APIs are ways to create, maintain and exploit that model.

Representations are an important exploitation surface of the model, but they are not the product by themselves. BindHome should implement Representations where they provide clear user value without attempting to recreate Home Assistant's entity platform ecosystem.

In practical terms:

- a passive Asset with no smart hardware remains a first-class BindHome object;
- a useful BindHome installation does not require every Asset to have a Representation;
- Representation quality must be high where offered, but platform breadth is secondary to model integrity and useful workflows;
- import, inventory, topology, recovery, migration, diagnostics, resolver APIs and export are core product work, not supporting extras;
- Home Assistant remains the runtime and automation engine rather than something BindHome duplicates.

## Consequences

### Roadmap ordering

When priorities conflict, prefer work that strengthens the durable infrastructure model or reduces the cost of creating/maintaining it before broad platform expansion.

Examples:

- recovery and schema migration before schema expansion;
- stable Binding identity before large import/rebinding workflows;
- reliable inventory/topology/export workflows before implementing many new Representation platforms;
- correct event-driven/proxy behavior for existing Representations before adding more platforms.

### Representation scope

New Representation platforms should be added deliberately and platform by platform. They must reuse the stable Asset/Binding model and must not introduce a parallel device/entity abstraction inside BindHome.

### Product evaluation

A feature should be evaluated by whether it improves at least one of these outcomes:

- makes the physical model easier to create;
- makes it safer/easier to maintain over hardware changes;
- makes the model more useful for diagnostics, automation, topology or documentation;
- exposes a stable Home Assistant interface without weakening the ownership boundary.

## Rejected alternatives

### BindHome as an inventory-only application

Rejected because stable runtime abstraction and hardware replacement are valuable consequences of the model and are central to the original motivation.

### BindHome as primarily a logical-entity proxy framework

Rejected because it would make passive infrastructure, topology, inventory and documentation secondary and would push BindHome toward reimplementing Home Assistant entity semantics platform by platform.

### Maintain both as equal product centers

Rejected because it provides no rule for prioritization and encourages simultaneous expansion in incompatible directions.

## Non-goals reinforced by this ADR

This decision does not change the existing non-goals:

- no replacement of Home Assistant Devices, Entities, Areas or Floors;
- no automatic physical-topology inference;
- no BindHome automation engine;
- no complete infrastructure ontology/CAD system;
- no generic entity platform that guesses semantics from Home Assistant domain names.
