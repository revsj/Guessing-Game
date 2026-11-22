/**
 * Username rules and persistence.
 *
 * This module is the ONLY place that touches localStorage. Phase 3 will swap
 * loadUsername/saveUsername for a Supabase `players` row lookup and keep the
 * rest of the app unchanged.
 */
export const USERNAME_KEY = 'gg:username'
export const PLAYER_KEY = 'gg:player'
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 16

const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
    return { ok: false, error: 'Please enter a username' }
  }

  if (value.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
    }
  }

  if (value.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Username must be ${USERNAME_MAX_LENGTH} characters or fewer`,
    }
  }

  if (!USERNAME_PATTERN.test(value)) {
    return {
      ok: false,
      error: 'Use only letters, numbers, underscores and dashes',
    }
  }

  return { ok: true, value }
}

export function loadUsername() {
  try {
    const stored = window.localStorage.getItem(USERNAME_KEY)
    const result = validateUsername(stored)
    return result.ok ? result.value : null
  } catch {
    return null
  }
}

export function saveUsername(value) {
  try {
    window.localStorage.setItem(USERNAME_KEY, value)
  } catch {
    // Storage can be unavailable (private mode); the session still works.
  }
}

export function clearUsername() {
  try {
    window.localStorage.removeItem(USERNAME_KEY)
  } catch {
    // Ignore, same as above.
  }
}

/**
 * Stored player: { id, username, adopted }.
 * A phase-2 bare username (no id yet) is returned as { id: null, username }.
 * Anything malformed returns null so the app falls back to the username screen.
 */
export function loadPlayer() {
  try {
    const raw = window.localStorage.getItem(PLAYER_KEY)

    if (raw) {
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        clearPlayer()
        return null
      }

      const result = validateUsername(parsed?.username)
      if (!result.ok || typeof parsed?.id !== 'string' || !UUID_PATTERN.test(parsed.id)) {
        clearPlayer()
        return null
      }

      return {
        id: parsed.id,
        username: result.value,
        adopted: false,
      }
    }

    // Phase 2 stored only the name; it still needs a players row.
    const legacy = validateUsername(
      window.localStorage.getItem(USERNAME_KEY) ?? '',
    )
    return legacy.ok ? { id: null, username: legacy.value, adopted: false } : null
  } catch {
    return null
  }
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
    window.localStorage.removeItem(USERNAME_KEY)
  } catch {
    // Storage unavailable: this session still works, next visit asks again.
  }
}

export function clearPlayer() {
  try {
    window.localStorage.removeItem(PLAYER_KEY)
    window.localStorage.removeItem(USERNAME_KEY)
  } catch {
    // Ignore, same as above.
  }
}
