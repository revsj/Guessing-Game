import { useCallback, useEffect, useState } from 'react'
import { getLeaderboard } from '../lib/supabase/scores.js'

export default function useLeaderboard(level) {
  const [state, setState] = useState({
    status: 'loading',
    rows: [],
    error: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', rows: [], error: null })

    getLeaderboard(level)
      .then((rows) => {
        if (!cancelled) setState({ status: 'ready', rows, error: null })
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: 'error',
            rows: [],
            error: 'Could not load the leaderboard.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [level, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { ...state, reload }
}
