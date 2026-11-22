import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Same formula as v2, so the max value is reachable too.
 */
function randomTarget(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * All guessing game state and rules. Components only render and call these.
 * `onWin(attempts)` fires exactly once, on the winning guess.
 */
export default function useGame(level, { onWin } = {}) {
  const { min, max } = level

  const [target, setTarget] = useState(() => randomTarget(min, max))
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState('playing')
  const [message, setMessage] = useState(null)
  const inputRef = useRef(null)

  // Focus the input on mount and again whenever a new round starts.
  useEffect(() => {
    if (status === 'playing') inputRef.current?.focus()
  }, [status, target])

  const guess = useCallback(() => {
    const input = inputRef.current
    if (!input || status !== 'playing') return

    const raw = input.value.trim()

    // v2 treated "" as 0; we ask for a number instead and don't count it.
    if (raw === '') {
      setMessage({ kind: 'invalid', text: 'Type a number to guess.' })
      return
    }

    const value = Number(raw)
    if (Number.isNaN(value)) {
      setMessage({ kind: 'invalid', text: 'Use digits only.' })
      input.value = ''
      return
    }

    if (value < min || value > max) {
      setMessage({
        kind: 'invalid',
        text: `Type a number from ${min} to ${max}.`,
      })
      input.value = ''
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    if (value < target) {
      setMessage({ kind: 'low', text: 'Too low. Try a bigger number.' })
    } else if (value > target) {
      setMessage({ kind: 'high', text: 'Too high. Try a smaller number.' })
    } else {
      setStatus('won')
      setMessage({
        kind: 'win',
        text:
          nextAttempts === 1
            ? 'You got it in 1 guess.'
            : `You got it in ${nextAttempts} guesses.`,
      })
      onWin?.(nextAttempts)
    }

    input.value = ''
  }, [attempts, max, min, onWin, status, target])

  const reset = useCallback(() => {
    setTarget(randomTarget(min, max))
    setAttempts(0)
    setStatus('playing')
    setMessage(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [max, min])

  return { target, attempts, status, message, guess, reset, inputRef }
}
