import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  PLAYER_KEY,
  USERNAME_KEY,
  clearPlayer,
  loadPlayer,
  savePlayer,
  usernameKey,
  validateUsername,
} from '../lib/username.js'
import { findOrCreatePlayer, getPlayer } from '../lib/supabase/players.js'

const PlayerContext = createContext(null)

/**
 * Player identity: a stored { id, username } backed by the `players` table.
 * Names are matched case-insensitively; the typed case is kept for display.
 */
export function PlayerProvider({ children }) {
  const [stored] = useState(loadPlayer)
  const [player, setPlayer] = useState(stored)
  const [isReady, setIsReady] = useState(!stored?.id)
  const [isChangingName, setIsChangingName] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const returnFocusRef = useRef(null)

  // A stored id must still exist; if it was deleted, ask for a name again.
  useEffect(() => {
    if (!stored?.id) return
    let cancelled = false

    async function verify() {
      try {
        const row = await getPlayer(stored.id)
        if (cancelled) return
        if (!row) {
          clearPlayer()
          setPlayer(null)
        }
      } catch {
        // Supabase unreachable: keep playing with the stored id.
      } finally {
        if (!cancelled) setIsReady(true)
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [stored])

  // A phase-2 name without a row id gets its players row now.
  useEffect(() => {
    if (!stored?.username || stored.id) return
    let cancelled = false

    async function upgrade() {
      try {
        const row = await findOrCreatePlayer(stored.username)
        if (cancelled) return
        const next = { id: row.id, username: stored.username, adopted: false }
        savePlayer(next)
        setPlayer(next)
      } catch {
        // Offline: keep the name so the game still works without scores.
      }
    }

    upgrade()
    return () => {
      cancelled = true
    }
  }, [stored])

  // Keep the header in sync when the player changes in another tab.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== PLAYER_KEY && event.key !== USERNAME_KEY) return
      const next = loadPlayer()
      setPlayer(next)
      setIsReady(true)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Move focus back to whatever opened the rename overlay.
  useEffect(() => {
    if (isChangingName || !returnFocusRef.current) return
    const target = returnFocusRef.current
    returnFocusRef.current = null
    target.focus()
  }, [isChangingName])

  const startChangeName = useCallback(() => {
    const active = document.activeElement
    returnFocusRef.current = active instanceof HTMLElement ? active : null
    setIsChangingName(true)
  }, [])

  const cancelChangeName = useCallback(() => setIsChangingName(false), [])

  const saveUsername = useCallback(async (raw) => {
    const result = validateUsername(raw)
    if (!result.ok) return result.error

    setIsSaving(true)
    try {
      const row = await findOrCreatePlayer(result.value)
      const next = {
        id: row.id,
        username: result.value,
        adopted: Boolean(row.existed),
      }
      savePlayer(next)
      setPlayer(next)
      setIsChangingName(false)
      return null
    } catch {
      return 'Could not save your name. Please try again.'
    } finally {
      setIsSaving(false)
    }
  }, [])

  const username = player?.username ?? null

  const value = useMemo(
    () => ({
      username,
      normalizedUsername: username ? usernameKey(username) : null,
      playerId: player?.id ?? null,
      hasUsername: Boolean(username),
      isExistingPlayer: Boolean(player?.adopted),
      isReady,
      isChangingName,
      isSaving,
      saveUsername,
      startChangeName,
      cancelChangeName,
    }),
    [
      username,
      player?.id,
      player?.adopted,
      isReady,
      isChangingName,
      isSaving,
      saveUsername,
      startChangeName,
      cancelChangeName,
    ],
  )

  // createElement keeps this hook in a .js file (JSX needs .jsx here).
  return createElement(PlayerContext.Provider, { value }, children)
}

export function usePlayer() {
  const player = useContext(PlayerContext)
  if (!player) throw new Error('usePlayer must be used inside a PlayerProvider')
  return player
}
