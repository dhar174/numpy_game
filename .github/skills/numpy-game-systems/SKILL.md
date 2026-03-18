---
name: numpy-game-systems
description: 'Toolkit for working on the numpy_game browser-based narrative puzzle-strategy game. Use when asked to implement or refactor ship systems, resource arrays, state transitions, mission logic, UI dashboards, narrative triggers, or browser-game testing flows in JavaScript, CSS, and HTML.'
license: Complete terms in LICENSE.txt
---

# NumPy Game Systems

This skill helps with gameplay architecture, ship system modeling, UI-state alignment, narrative progression, and testing for the `numpy_game` repository.

## When to Use This Skill

Use this skill when asked to:

- implement or refactor ship systems
- model system state, resources, or array-like structures
- add mission logic or event triggers
- separate simulation state from UI rendering
- debug stale or incorrect dashboard/state displays
- design save/load shapes
- plan gameplay features
- add tests for browser-visible behavior
- improve narrative/system integration

## Prerequisites

- Familiarity with JavaScript, CSS, and HTML
- Understanding of the repository's main gameplay loop/state update flow
- Ability to inspect current modules before changing architecture

## Working assumptions for this repository

- Core game state should be the source of truth.
- UI should render from state.
- Narrative outcomes should align with system rules and explicit progression flags.
- Resource/system relationships should be inspectable and predictable.
- New complexity should be introduced in small, testable increments.

## Step-by-Step Workflows

### 1. Add or refactor a gameplay system
1. Identify the current state owner and update path.
2. Define the system's inputs, outputs, and dependencies.
3. Add or refactor the state representation.
4. Add transition/update logic.
5. Update rendering/UI functions.
6. Add manual and automated verification cases.
7. Check for reset/load implications.

See:
- [architecture patterns](./references/architecture-patterns.md)
- [testing checklist](./references/testing-checklist.md)
- [system module template](./templates/system-module.template.js)

### 2. Diagnose a UI/state mismatch
1. Determine the authoritative state source.
2. Identify where UI is rendered from that state.
3. Check whether state mutation and rendering happen in the correct order.
4. Look for duplicated derived state or stale cached values.
5. Confirm reset/reload/update flows clear and rebuild the UI correctly.

See:
- [testing checklist](./references/testing-checklist.md)

### 3. Add a narrative-triggered system event
1. Define the trigger conditions explicitly.
2. Separate content text from execution logic when practical.
3. Identify state flags and visible outcomes.
4. Ensure UI and system dashboards reflect the event result.
5. Add checks for repeat-trigger prevention or intended repeatability.

See:
- [architecture patterns](./references/architecture-patterns.md)

## Troubleshooting

| Problem | Likely cause | Recommended check |
|---|---|---|
| UI shows wrong values | DOM became de facto source of truth | Trace canonical state and render function |
| Repeated clicks break behavior | Action not guarded during transition | Add action gating or idempotent handling |
| Narrative event fires at wrong time | Trigger conditions too implicit | Make conditions explicit and testable |
| Reset leaves stale panels | Derived UI not fully rebuilt | Add a clean reset/render path |
| New feature is hard to test | Logic mixed with DOM | Extract core rules into state/update helpers |

## References

- [architecture patterns](./references/architecture-patterns.md)
- [testing checklist](./references/testing-checklist.md)
- [system module template](./templates/system-module.template.js)
