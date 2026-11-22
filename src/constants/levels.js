/**
 * Single source of truth for levels and their guessing ranges.
 * Ranges match v2 exactly: both min and max are valid targets.
 */
export const LEVELS = {
  1: { level: 1, name: 'easy', min: 0, max: 100 },
  2: { level: 2, name: 'medium', min: 0, max: 500 },
  3: { level: 3, name: 'hard', min: 0, max: 1000 },
}

export const DEFAULT_LEVEL = 1

export function getLevel(value) {
  return LEVELS[Number(value)] ?? null
}

export function getNextLevel(level) {
  return LEVELS[level + 1] ?? null
}
