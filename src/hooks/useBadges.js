import { useCallback, useEffect, useState } from 'react'
import { computeBadges } from '../lib/badges.js'
import { getBadgeData } from '../lib/supabase/badges.js'

/**
 * Read-only badge state for one player. Badges are recomputed from scores on
 * every load; `reload()` re-reads after a score is saved.
 */
export default function useBadges({ playerId, username }) {
  const [state, setState] = useState({
    status: playerId ? 'loading' : 'idle',
    badges: [],
    error: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!playerId) {
      setState({ status: 'idle', badges: [], error: null })
      return
    }

    let cancelled = false
    setState({ status: 'loading', badges: [], error: null })

    getBadgeData(playerId)
      .then(({ scores, topRowsByLevel }) => {
        if (cancelled) return
        setState({
          status: 'ready',
          badges: computeBadges({ scores, topRowsByLevel, username }),
          error: null,
        })
      })
      .catch(() => {
        if (cancelled) return
        setState({
          status: 'error',
          badges: [],
          error: "Couldn't load badges. Check your connection.",
        })
      })

    return () => {
      cancelled = true
    }
  }, [playerId, username, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { ...state, reload }
}
