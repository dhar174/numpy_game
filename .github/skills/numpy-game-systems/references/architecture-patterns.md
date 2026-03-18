# Architecture patterns for numpy_game

## 1. Separate simulation from presentation

Prefer a structure where:

- simulation data/state is defined in one place
- update logic transforms that state
- rendering reads current state and updates the DOM
- event listeners call a small set of action functions

### Prefer

- `state` object or module
- `applyAction(...)`
- `updateSystems(...)`
- `renderDashboard(state)`
- `renderNarrative(state)`

### Avoid

- direct DOM reads as core logic
- many independent event handlers mutating shared state
- UI labels being used as authoritative values

---

## 2. Make transitions explicit

When the player takes an action:

1. validate action
2. mutate or compute next state
3. resolve system consequences
4. resolve narrative consequences
5. re-render dependent UI
6. log or expose enough context to debug what changed

---

## 3. Centralize balancing values

Use central constants or data tables for:
- resource caps
- decay rates
- thresholds
- warning limits
- mission timers
- event weights

This makes tuning safer and reduces magic numbers.

---

## 4. Keep content inspectable

Narrative/system triggers should be easy to inspect.

Prefer:
- named flags
- clearly structured trigger conditions
- content data separated from control flow where feasible

---

## 5. Build for testability

Game rules should be testable without full DOM setup where possible.

Prefer extracting:
- state transition helpers
- validation helpers
- mission/event condition evaluators
- derived state calculators
