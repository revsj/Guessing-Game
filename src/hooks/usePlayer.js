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
  USERNAME_KEY,
  loadUsername,
  saveUsername as persistUsername,
  usernameKey,
  validateUsername,
} from '../lib/username.js'

const PlayerContext = createContext(null)

/**
 * Username + player state. Phase 3 turns saveUsername into a Supabase player
 * lookup; the Promise/isSaving shape is already in place for that.
 */
export function PlayerProvider({ children }) {
  const [username, setUsername] = useState(loadUsername)
  const [isChangingName, setIsChangingName] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const returnFocusRef = useRef(null)

  // Keep the header in sync when the name changes in another tab.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== USERNAME_KEY) return
      const result = validateUsername(event.newValue)
      setUsername(result.ok ? result.value : null)
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
      // Sync today; awaited so phase 3 can await a Supabase write.
      await persistUsername(result.value)
      setUsername(result.value)
      setIsChangingName(false)
      return null
    } catch {
      return 'Could not save your name. Please try again.'
    } finally {
      setIsSaving(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      username,
      normalizedUsername: username ? usernameKey(username) : null,
      hasUsername: Boolean(username),
      isChangingName,
      isSaving,
      saveUsername,
      startChangeName,
      cancelChangeName,
    }),
    [username, isChangingName, isSaving, saveUsername, startChangeName, cancelChangeName],
  )

  // createElement keeps this hook in a .js file (JSX needs .jsx here).
  return createElement(PlayerContext.Provider, { value }, children)
}

export function usePlayer() {
  const player = useContext(PlayerContext)
  if (!player) throw new Error('usePlayer must be used inside a PlayerProvider')
  return player
}
