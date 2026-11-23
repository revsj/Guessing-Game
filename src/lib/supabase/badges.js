import { LEVELS } from '../../constants/levels.js'
import { requireClient } from './client.js'
import { getLeaderboard } from './scores.js'

/**
 * Everything the badge rules need, read once: the player's scores and the
 * top 10 per level for the Top 10 badge. Nothing is written.
 */
export async function getBadgeData(playerId) {
  const client = requireClient()
  const levels = Object.values(LEVELS)

  const [scoresResult, ...boards] = await Promise.all([
    client.from('scores').select('level, guesses').eq('player_id', playerId),
    ...levels.map((level) => getLeaderboard(level.level, 10)),
  ])

  if (scoresResult.error) throw scoresResult.error

  return {
    scores: scoresResult.data ?? [],
    topRowsByLevel: Object.fromEntries(
      levels.map((level, index) => [level.level, boards[index] ?? []]),
    ),
  }
}
