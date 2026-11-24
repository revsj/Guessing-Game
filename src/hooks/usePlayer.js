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
  clearPlayer,
  savePlayer,
  usernameKey,
  validateUsername,
} from '../lib/username.js'
import { claimUsername, getMyPlayer } from '../lib/supabase/players.js'

const PlayerContext = createContext(null)

/**
 * Player identity comes from the signed-in Supabase session. The local profile
 * cache is display-only and is never used to authorize a database operation.
 */
export function PlayerProvider({ children }) {
  const [player, setPlayer] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [isChangingName, setIsChangingName] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const returnFocusRef = useRef(null)

  const refreshPlayer = useCallback(async () => {
    setIsReady(false)
    setLoadError(null)
    try {
      const row = await getMyPlayer()
      const next = row ? { id: row.id, username: row.username } : null
      setPlayer(next)
      if (next) savePlayer(next)
      else clearPlayer()
    } catch {
      setLoadError("Couldn't verify your player session. Check your connection and retry.")
    } finally {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    refreshPlayer()
  }, [refreshPlayer])

  // Reload the authoritative profile if the auth session changes in another tab.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === PLAYER_KEY) refreshPlayer()
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refreshPlayer])

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
      const row = await claimUsername(result.value)
      const next = { id: row.id, username: row.username }
      savePlayer(next)
      setPlayer(next)
      setLoadError(null)
      setIsChangingName(false)
      return null
    } catch {
      return 'That name is unavailable or could not be saved. Check your connection and try again.'
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
      isReady,
      loadError,
      retryPlayerLoad: refreshPlayer,
      isChangingName,
      isSaving,
      saveUsername,
      startChangeName,
      cancelChangeName,
    }),
    [
      username,
      player?.id,
      isReady,
      loadError,
      refreshPlayer,
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
