# Testing checklist for numpy_game

## Manual validation checklist

### Gameplay/system checks
- [ ] New action changes the intended state only
- [ ] System dependencies update in the right order
- [ ] Warning/error thresholds appear at the correct times
- [ ] Narrative text matches the actual underlying outcome
- [ ] Repeated actions do not create invalid state
- [ ] Reset/restart returns to a clean baseline

### UI checks
- [ ] Visible counters and status labels match state
- [ ] Buttons disable when actions are unavailable
- [ ] Alerts appear and clear appropriately
- [ ] Panel transitions do not leave stale content behind
- [ ] Layout remains usable at common viewport sizes

### Edge cases
- [ ] Fast repeated clicking
- [ ] Action during modal/overlay transitions
- [ ] Empty or minimum-resource states
- [ ] Threshold boundary values
- [ ] Reload or restore after partial progress

### Regression checks
- [ ] Existing early-game loop still works
- [ ] Existing mission/event triggers still work
- [ ] No unrelated dashboard values changed unexpectedly
- [ ] No console errors from the updated flow

## Suggested automated test targets

- pure state transition helpers
- resource threshold evaluators
- narrative trigger evaluators
- derived UI-state selectors
- feature-specific integration scenarios
