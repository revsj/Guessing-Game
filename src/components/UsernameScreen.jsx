import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase/client.js'
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../lib/username.js'
import DatabaseNotice from './DatabaseNotice.jsx'

export default function UsernameScreen({ player, overlay = false }) {
  const { username, isSaving, saveUsername, cancelChangeName } = player
  const [value, setValue] = useState(username ?? '')
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // Escape closes the rename overlay; the game underneath keeps its state.
  useEffect(() => {
    if (!overlay) return
    function handleKeyDown(event) {
      if (event.key === 'Escape') cancelChangeName()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [overlay, cancelChangeName])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isSupabaseConfigured) return
    const message = await saveUsername(value)
    setError(message)
  }

  function handleChange(event) {
    setValue(event.target.value)
    if (error) setError(null)
  }

  const canCancel = Boolean(username)

  const form = (
    <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col">
      <label htmlFor="username" className="sr-only">
        Your name
      </label>

      <input
        id="username"
        ref={inputRef}
        type="text"
        name="username"
        autoComplete="nickname"
        spellCheck={false}
        value={value}
        onChange={handleChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'username-hint username-error' : 'username-hint'}
        placeholder="e.g. revs_99"
        className="h-14 w-full rounded-sm border border-chalk/20 bg-panel px-4 text-base text-chalk placeholder:text-chalk/60 focus:border-chalk/60"
      />

      <p id="username-hint" className="mt-2 text-sm text-chalk/60">
        {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters: letters, numbers,
        underscore or dash.
      </p>

      {error && (
        <p id="username-error" role="alert" className="mt-2 text-sm text-coral">
          {error}
        </p>
      )}

      {!isSupabaseConfigured && (
        <DatabaseNotice id="username-db-notice" className="mt-2 text-sm" />
      )}

      <button
        type="submit"
        disabled={!isSupabaseConfigured || isSaving}
        aria-describedby={
          isSupabaseConfigured ? undefined : 'username-db-notice'
        }
        className="mt-5 h-12 w-full rounded-sm bg-gold px-5 text-base font-medium text-ink motion-safe:transition-colors motion-safe:active:translate-y-px hover:bg-gold/90 disabled:opacity-60"
      >
        {isSaving ? 'Saving name…' : 'Save name'}
      </button>

      {canCancel && (
        <button
          type="button"
          onClick={cancelChangeName}
          className="mt-1 h-11 w-full rounded-sm text-base text-chalk/70 motion-safe:transition-colors hover:text-chalk"
        >
          Cancel
        </button>
      )}
    </form>
  )

  if (!overlay) {
    return (
      <main className="flex min-h-dvh w-full flex-col">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 sm:px-6">
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-chalk/15 py-4">
            <h1 className="font-display text-lg font-semibold tracking-tight">
              Guessing game
            </h1>
            <Link
              to="/leaderboard"
              className="text-sm text-chalk/60 underline decoration-chalk/30 underline-offset-4 hover:text-chalk"
            >
              Leaderboard
            </Link>
          </header>

          <div className="flex flex-1 items-center py-10">
            <div className="w-full max-w-sm">
              <h2 className="text-2xl font-semibold sm:text-3xl">Pick a name</h2>
              <p className="mt-2 text-base text-chalk/60">
                This is the name on the leaderboard.
              </p>

              {form}
            </div>
          </div>

          <footer className="py-5 text-xs text-chalk/60">Made by revs</footer>
        </div>
      </main>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-title"
        aria-describedby="rename-hint"
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-sm border border-chalk/15 bg-panel p-6"
      >
        <h2 id="rename-title" className="text-xl font-semibold sm:text-2xl">
          Change name
        </h2>
        <p id="rename-hint" className="mt-1 text-sm text-chalk/60">
          Your current game stays where it is.
        </p>

        {form}
      </div>
    </div>
  )
}
