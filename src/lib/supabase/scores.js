import { requireClient } from './client.js'

export async function submitScore({ playerId, level, guesses }) {
  if (!playerId) throw new Error('No player profile to attach this score to')

  const client = requireClient()
  const { error } = await client
    .from('scores')
    .insert({ player_id: playerId, level, guesses })

  if (error) throw error
}

/**
 * Top scores for one level from the `leaderboard` view (best guesses per
 * player). Ties go to the earliest created_at.
 */
export async function getLeaderboard(level, limit = 10) {
  const client = requireClient()
  const { data, error } = await client
    .from('leaderboard')
    .select('level, username, guesses, created_at')
    .eq('level', level)
    .order('guesses', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
