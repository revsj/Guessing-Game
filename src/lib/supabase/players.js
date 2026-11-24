import { ensureAnonymousSession, requireClient } from './client.js'

export async function getMyPlayer() {
  await ensureAnonymousSession()
  const { data, error } = await requireClient().rpc('get_my_player')
  if (error) throw error
  return data ?? null
}

export async function claimUsername(username) {
  await ensureAnonymousSession()
  const { data, error } = await requireClient().rpc('claim_username', {
    p_username: username,
  })
  if (error) throw error
  return data
}
