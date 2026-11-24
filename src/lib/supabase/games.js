import { ensureAnonymousSession, requireClient } from './client.js'

export async function startGame(level) {
  await ensureAnonymousSession()
  const { data, error } = await requireClient().rpc('start_game', {
    p_level: level,
  })

  if (error) throw error
  if (!data?.game_id) throw new Error('The server did not start a game.')
  return data
}

export async function submitGuess(gameId, guess) {
  await ensureAnonymousSession()
  const { data, error } = await requireClient().rpc('submit_guess', {
    p_game_id: gameId,
    p_guess: guess,
  })

  if (error) throw error
  if (!data?.status) throw new Error('The server did not return a guess result.')
  return data
}
