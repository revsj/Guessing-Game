import { requireClient } from './client.js'

/**
 * Escape LIKE wildcards so a username like `rev_` is matched literally.
 * `_` is legal in usernames but means "any single character" in LIKE.
 */
export function escapeLikePattern(value) {
  return String(value).replace(/[\\%_]/g, (char) => `\\${char}`)
}

/**
 * Case-insensitive lookup (unique index on lower(username) keeps this to one row).
 */
export async function findPlayer(username) {
  const client = requireClient()
  const { data, error } = await client
    .from('players')
    .select('id, username')
    .ilike('username', escapeLikePattern(String(username).trim()))
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw error
  return data?.[0] ?? null
}

export async function getPlayer(id) {
  const client = requireClient()
  const { data, error } = await client
    .from('players')
    .select('id, username')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

/**
 * Fetch the player row for a name, creating it if it does not exist yet.
 * `existed` tells the UI to say "this name was already on another browser".
 */
export async function findOrCreatePlayer(username) {
  const value = String(username).trim()

  const existing = await findPlayer(value)
  if (existing) return { ...existing, existed: true }

  const client = requireClient()
  const { data, error } = await client
    .from('players')
    .insert({ username: value })
    .select('id, username')
    .single()

  if (!error) return { ...data, existed: false }

  // 23505 unique_violation: someone created the same name between our lookup
  // and insert. Adopt their row instead of failing.
  if (error.code === '23505') {
    const raced = await findPlayer(value)
    if (raced) return { ...raced, existed: true }
  }

  throw error
}
