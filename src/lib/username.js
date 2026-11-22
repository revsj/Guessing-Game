/**
 * Username rules and persistence.
 *
 * This module is the ONLY place that touches localStorage. Phase 3 will swap
 * loadUsername/saveUsername for a Supabase `players` row lookup and keep the
 * rest of the app unchanged.
 */
export const USERNAME_KEY = 'gg:username'
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
