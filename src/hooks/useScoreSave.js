import { useCallback, useRef, useState } from 'react'
import { submitScore } from '../lib/supabase/scores.js'

/**
 * Saving state for one round's score. Never throws and never blocks the game.
 */
export default function useScoreSave() {
  const [state, setState] = useState({ status: 'idle', error: null })
  const lastPayloadRef = useRef(null)

  const save = useCallback(async (payload) => {
    lastPayloadRef.current = payload

    if (!payload?.playerId) {
      setState({
        status: 'error',
        error: 'No player profile, so this score was not saved.',
      })
      return
    }

    setState({ status: 'saving', error: null })
    try {
      await submitScore(payload)
      setState({ status: 'saved', error: null })
    } catch {
      setState({
        status: 'error',
        error: 'Score not saved — your game still counts.',
      })
    }
  }, [])

  const retry = useCallback(() => {
    if (lastPayloadRef.current) save(lastPayloadRef.current)
  }, [save])

  const reset = useCallback(() => {
    lastPayloadRef.current = null
    setState({ status: 'idle', error: null })
  }, [])

  return { ...state, save, retry, reset }
}
