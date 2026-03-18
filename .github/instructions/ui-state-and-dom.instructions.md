---
applyTo: '**/*.js, **/*.html, **/*.css'
description: 'Instructions for UI state, DOM updates, and interaction handling in the browser game. Use when changing menus, dashboards, panels, overlays, controls, alerts, or any interface that reflects game/system state.'
---

# UI state and DOM instructions

These instructions apply when working on the game UI.

## Core rule

The UI must reflect the game state; the UI must not become a hidden substitute for game state.

## Interaction rules

- Keep event listeners thin.
- Move meaningful logic into reusable functions.
- Validate whether an action is allowed before applying UI changes.
- Disable or guard unavailable actions explicitly.
- Avoid allowing multiple rapid interactions to create inconsistent state.

## Rendering rules

- Prefer one clear render/update path per panel or feature.
- Re-render from state rather than patching arbitrary DOM fragments when correctness would otherwise be unclear.
- If partial updates are used for performance, document the ownership of those updates.

## Consistency rules

When a state change occurs, verify all dependent UI surfaces update, including:
- labels
- counters
- status badges
- alerts
- action availability
- narrative/context text

## Accessibility rules

- Interactive elements should be semantic when possible.
- Preserve keyboard usability where feasible.
- Ensure focus states remain visible.
- Use clear button and control labels.
- Avoid conveying critical state only through color.

## Common failure modes to guard against

- stale text after state mutation
- duplicate event listeners
- UI implying an action succeeded when state rejected it
- hidden assumptions about initialization order
- reset/reload not clearing derived UI properly
