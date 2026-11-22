/**
 * Single source of truth for levels and their guessing ranges.
 * Ranges match v2 exactly: both min and max are valid targets.
 */
const LEVEL_RANGES = {
  1: { level: 1, name: 'easy', min: 0, max: 100 },
  2: { level: 2, name: 'medium', min: 0, max: 500 },
  3: { level: 3, name: 'hard', min: 0, max: 1000 },
}

/**
 * Smallest worst-case binary search depth for a range: ceil(log2(count)).
 * Level 1 -> 7, Level 2 -> 9, Level 3 -> 10.
 */
function optimalGuesses({ min, max }) {
  return Math.ceil(Math.log2(max - min + 1))
}

export const LEVELS = Object.fromEntries(
  Object.entries(LEVEL_RANGES).map(([key, level]) => [
    key,
    { ...level, optimal: optimalGuesses(level) },
  ]),
)

export const DEFAULT_LEVEL = 1

export function getLevel(value) {
  return LEVELS[Number(value)] ?? null
}

export function getNextLevel(level) {
  return LEVELS[level + 1] ?? null
}
