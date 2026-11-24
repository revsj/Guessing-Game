import { useCallback, useEffect, useRef, useState } from 'react'
import { startGame, submitGuess } from '../lib/supabase/games.js'

/**
 * The server owns the target and attempt count; this hook only renders results.
 */
export default function useGame(level, { onWin } = {}) {
  const [round, setRound] = useState({
    gameId: null,
    min: level.min,
    max: level.max,
    attempts: 0,
    status: 'loading',
    message: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef(null)
  const pendingRef = useRef(false)
  const requestIdRef = useRef(0)

  const startRound = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setRound((current) => ({
      ...current,
      gameId: null,
      attempts: 0,
      status: 'loading',
      message: null,
    }))

    try {
      const game = await startGame(level.level)
      if (requestId !== requestIdRef.current) return
      setRound({
        gameId: game.game_id,
        min: game.min_value,
        max: game.max_value,
        attempts: 0,
        status: 'playing',
        message: null,
      })
    } catch {
      if (requestId !== requestIdRef.current) return
      setRound((current) => ({
        ...current,
        status: 'error',
        message: 'Could not start a verified game. Check your connection and retry.',
      }))
    }
  }, [level.level])

  useEffect(() => {
    startRound()
    return () => {
      requestIdRef.current += 1
    }
  }, [startRound])

  useEffect(() => {
    if (round.status === 'playing') inputRef.current?.focus()
  }, [round.status])

  const guess = useCallback(async () => {
    const input = inputRef.current
    if (
      !input ||
      round.status !== 'playing' ||
      !round.gameId ||
      pendingRef.current
    ) {
      return
    }

    const raw = input.value.trim()
    if (raw === '') {
      setRound((current) => ({
        ...current,
        message: { kind: 'invalid', text: 'Type a number to guess.' },
      }))
      return
    }

    const value = Number(raw)
    if (!Number.isFinite(value)) {
      setRound((current) => ({
        ...current,
        message: { kind: 'invalid', text: 'Use digits only.' },
      }))
      input.value = ''
      return
    }

    if (value < round.min || value > round.max) {
      setRound((current) => ({
        ...current,
        message: {
          kind: 'invalid',
          text: `Type a number from ${round.min} to ${round.max}.`,
        },
      }))
      input.value = ''
      return
    }

    pendingRef.current = true
    setIsSubmitting(true)
    try {
      const result = await submitGuess(round.gameId, value)
      input.value = ''

      if (result.status === 'won') {
        setRound((current) => ({
          ...current,
          attempts: result.attempts,
          status: 'won',
          target: result.target,
          message: {
            kind: 'win',
            text:
              result.attempts === 1
                ? 'You got it in 1 guess.'
                : `You got it in ${result.attempts} guesses.`,
          },
        }))
        onWin?.(result.attempts)
      } else {
        setRound((current) => ({
          ...current,
          attempts: result.attempts,
          message: {
            kind: result.result,
            text:
              result.result === 'low'
                ? 'Too low. Try a bigger number.'
                : 'Too high. Try a smaller number.',
          },
        }))
      }
    } catch {
      setRound((current) => ({
        ...current,
        message: {
          kind: 'error',
          text: 'Could not check that guess. Submit the same guess to retry.',
        },
      }))
    } finally {
      pendingRef.current = false
      setIsSubmitting(false)
    }
  }, [onWin, round.gameId, round.max, round.min, round.status])

  const reset = useCallback(() => {
    if (inputRef.current) inputRef.current.value = ''
    startRound()
  }, [startRound])

  return {
    ...round,
    guess,
    reset,
    retry: startRound,
    isSubmitting,
    inputRef,
  }
}
