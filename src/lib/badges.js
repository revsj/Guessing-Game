import { LEVELS } from '../constants/levels.js'
import { usernameKey } from './username.js'

/**
 * Badge catalog. Names and copy live here so the UI never hardcodes state;
 * every badge is derived from the scores the player already has.
 */
export const BADGES = [
  {
    code: 'first_win',
    name: 'First win',
    description: 'Win any level.',
  },
  {
    code: 'sharp',
    name: 'Sharp',
    description: 'Win within two guesses of the optimal for that level.',
  },
  {
    code: 'near_perfect',
    name: 'Near perfect',
    description: 'Win at or under the optimal guesses for that level.',
  },
  {
    code: 'lucky_guess',
    name: 'Lucky guess',
    description: 'Win in two guesses or fewer.',
  },
  {
    code: 'hard_cleared',
    name: 'Hard mode cleared',
    description: 'Win Level 3.',
  },
  {
    code: 'all_levels',
    name: 'All levels cleared',
    description: 'Win on Levels 1, 2 and 3.',
  },
  {
    code: 'top_10',
    name: 'Top 10',
    description: 'Be in the top 10 on any level right now.',
  },
]

/** Rarest first: the order new badges are introduced on the win screen. */
const RARITY = [
  'near_perfect',
  'sharp',
  'lucky_guess',
  'hard_cleared',
  'all_levels',
  'top_10',
  'first_win',
]

export function sortByRarity(badges) {
  const rank = (code) => {
    const index = RARITY.indexOf(code)
    return index === -1 ? RARITY.length : index
  }

  return [...badges].sort((a, b) => rank(a.code) - rank(b.code))
}

export function earnedCodes(badges) {
  return new Set(badges.filter((badge) => badge.earned).map((badge) => badge.code))
}

/**
 * Pure mapping from scores (plus the per-level top 10 rows) to the catalog.
 *
 * `topRowsByLevel` holds the `leaderboard` view rows for each level; the view
 * has no player_id, so Top 10 matches on the case-insensitive username key.
 */
export function computeBadges({ scores = [], topRowsByLevel = {}, username }) {
  const key = usernameKey(username)
  const wonLevels = new Set()
  let sharp = false
  let nearPerfect = false
  let lucky = false
  let hardCleared = false

  for (const score of scores) {
    const level = LEVELS[Number(score?.level)]
    const guesses = Number(score?.guesses)
    if (!level || !Number.isFinite(guesses) || guesses < 1) continue

    wonLevels.add(level.level)
    if (guesses <= level.optimal) nearPerfect = true
    if (guesses <= level.optimal + 2) sharp = true
    if (guesses <= 2) lucky = true
    if (level.level === 3) hardCleared = true
  }

  const topTen =
    key !== '' &&
    Object.values(LEVELS).some((level) =>
      (topRowsByLevel[level.level] ?? []).some(
        (row) => usernameKey(row?.username) === key,
      ),
    )

  const allLevels = Object.values(LEVELS).every((level) =>
    wonLevels.has(level.level),
  )

  const earnedByCode = {
    first_win: scores.length > 0,
    sharp,
    near_perfect: nearPerfect,
    lucky_guess: lucky,
    hard_cleared: hardCleared,
    all_levels: allLevels,
    top_10: topTen,
  }

  return BADGES.map((badge) => ({
    ...badge,
    earned: Boolean(earnedByCode[badge.code]),
  }))
}
