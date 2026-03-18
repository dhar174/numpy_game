---
applyTo: '**/*.js, **/*.css, **/*.html'
description: 'Instructions for generating code in a JavaScript, CSS, and HTML browser-based narrative puzzle-strategy game. Use these rules for gameplay logic, UI rendering, DOM interactions, state management, and system-driven narrative features.'
---

# Browser game project instructions

This repository is a browser-based narrative puzzle-strategy game. The player acts as a rookie systems engineer on a damaged colony ship. The game is implemented with JavaScript, CSS, and HTML.

## Project priorities

Prioritize:
- clarity over cleverness
- explicit state over hidden side effects
- small modules over large monoliths
- DOM as presentation, not core game state
- maintainable gameplay logic
- easy debugging of state transitions
- player-readable feedback for system changes

## JavaScript rules

- Prefer small focused modules.
- Keep simulation/state logic separate from rendering logic.
- Avoid mixing business logic directly into event listener callbacks.
- Prefer named functions over long inline anonymous handlers for important behavior.
- Keep update order explicit.
- Centralize gameplay constants where practical.
- Avoid duplicating authoritative state across unrelated modules.
- Prefer pure helper functions where feasible.
- If a function mutates state, make that obvious in naming and placement.

## State management rules

- Treat game/system state as the source of truth.
- Do not use DOM text/content as the canonical value of game state.
- Every player action that changes game behavior should map to an explicit state transition.
- Keep transient UI state distinct from persistent gameplay state.
- Separate:
  - simulation state
  - UI display state
  - content progression flags
  - save/load serialization shape

## DOM and rendering rules

- Rendering code should read state and update UI accordingly.
- Avoid scattered DOM writes across many modules for the same feature.
- Prefer predictable render/update functions for panels and components.
- Keep selectors stable and readable.
- Minimize deep DOM traversal in core logic.
- Use data attributes or clearly named classes when they improve readability.

## Narrative and event rules

- Narrative progression should be driven by explicit conditions, flags, and system outcomes.
- Keep text/content separate from execution logic when practical.
- If an event bypasses normal system rules intentionally, document that behavior in code comments.
- Make trigger conditions inspectable and testable.

## CSS rules

- Prefer consistent naming and scoped component styling.
- Avoid fragile styling that depends on incidental DOM structure.
- Support common desktop viewport sizes first unless the task specifies otherwise.
- Preserve readability for dashboards, control panels, and narrative content areas.
- Use classes for styling state, not inline styles, unless runtime layout requires it.

## Testing expectations

When generating or modifying code, consider:
- normal gameplay path
- edge cases
- repeated clicks / repeated actions
- partial or interrupted transitions
- reset/restart flows
- stale UI after state changes
- accessibility of interactive elements

## Expected answer style

When suggesting code changes:
- mention affected files explicitly
- explain state flow clearly
- call out any assumptions
- note risks of state/render desynchronization
- propose tests when behavior changes
