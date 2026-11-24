import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true } })
  : null

let sessionRequest = null

/**
 * Every lib/supabase/* call goes through this so a missing .env fails with a
 * readable message instead of `undefined is not an object`.
 */
export function requireClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}

export async function ensureAnonymousSession() {
  if (sessionRequest) return sessionRequest

  sessionRequest = createSession()
  try {
    return await sessionRequest
  } finally {
    sessionRequest = null
  }
}

async function createSession() {
  const client = requireClient()
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession()

  if (sessionError) throw sessionError
  if (sessionData.session) return sessionData.session

  const { data, error } = await client.auth.signInAnonymously()
  if (error) throw error
  if (!data.session) throw new Error('Could not create an anonymous player session.')

  return data.session
}
