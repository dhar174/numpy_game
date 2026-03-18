/**
 * Template for a gameplay/system module in numpy_game.
 *
 * Adapt this file for ship systems, mission subsystems, event resolution,
 * or other state-driven mechanics.
 */

export const SYSTEM_DEFAULTS = {
  value: 0,
  min: 0,
  max: 100,
  status: 'nominal',
};

export function createSystemState(overrides = {}) {
  return {
    ...SYSTEM_DEFAULTS,
    ...overrides,
  };
}

export function clampSystemValue(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function deriveSystemStatus(system) {
  if (system.value <= 10) return 'critical';
  if (system.value <= 30) return 'warning';
  return 'nominal';
}

export function applySystemDelta(system, delta) {
  const nextValue = clampSystemValue(system.value + delta, system.min, system.max);
  const next = {
    ...system,
    value: nextValue,
  };

  return {
    ...next,
    status: deriveSystemStatus(next),
  };
}

/**
 * Example integration pattern:
 *
 * const nextPower = applySystemDelta(state.power, -10);
 * return {
 *   ...state,
 *   power: nextPower,
 * };
 */
