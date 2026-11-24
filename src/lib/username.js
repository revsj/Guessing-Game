/**
 * Username rules and persistence.
 *
 * This module is the ONLY place that touches the display-only local profile
 * cache. Server identity is established by Supabase Auth, not this cache.
 */
export const PLAYER_KEY = 'gg:player'
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 16

const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/

/**
 * Case-insensitive key used for comparisons (uniqueness, matching a stored
 * name). Display keeps the case the player typed.
 */
export function usernameKey(raw) {
  return String(raw ?? '').trim().toLowerCase()
}

export function isSameUsername(a, b) {
  const keyA = usernameKey(a)
  return keyA !== '' && keyA === usernameKey(b)
}

/**
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function validateUsername(raw) {
  const value = String(raw ?? '').trim()

  if (value === '') {
    return { ok: false, error: 'Enter a name to keep playing.' }
  }

  if (value.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      error: `Use at least ${USERNAME_MIN_LENGTH} characters.`,
    }
  }

  if (value.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Use ${USERNAME_MAX_LENGTH} characters or fewer.`,
    }
  }

  if (!USERNAME_PATTERN.test(value)) {
    return {
      ok: false,
      error: 'Use letters, numbers, underscores or dashes.',
    }
  }

  return { ok: true, value }
}

export function savePlayer(player) {
  try {
    window.localStorage.setItem(
      PLAYER_KEY,
      JSON.stringify({
        id: player.id,
        username: player.username,
      }),
    )
  } catch {
    // The local profile is only a cache; the Supabase session remains authoritative.
  }
}

export function clearPlayer() {
  try {
    window.localStorage.removeItem(PLAYER_KEY)
  } catch {
    // Ignore unavailable storage; this cache is not used for authorization.
  }
}
