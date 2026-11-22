import { useEffect, useRef, useState } from 'react'
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../lib/username.js'

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
    const message = await saveUsername(value)
    setError(message)
  }

  function handleChange(event) {
    setValue(event.target.value)
    if (error) setError(null)
  }

  const canCancel = Boolean(username)

  const form = (
    <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col items-center">
      <label
        htmlFor="username"
        className="text-center text-xl text-yellow-100 sm:text-2xl"
      >
        {canCancel ? 'New username' : 'Choose a username'}
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
        className="mt-3 w-72 max-w-xs rounded-md border border-gray-300 bg-transparent p-2 text-center text-2xl text-[#e8dab2] placeholder:text-lg focus:outline-none"
      />

      <p id="username-hint" className="mt-2 text-center text-sm text-gray-400">
        {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters. Letters, numbers, _ and - only.
      </p>

      {error && (
        <p id="username-error" className="mt-2 text-center text-base text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-5 rounded-md bg-yellow-500 px-4 py-2 text-2xl text-black hover:bg-yellow-400 disabled:opacity-60"
      >
        {isSaving ? 'Saving…' : canCancel ? 'Save name' : 'Start playing'}
      </button>

      {canCancel && (
        <button
          type="button"
          onClick={cancelChangeName}
          className="mt-3 text-base text-yellow-100 underline underline-offset-2 hover:text-green-400"
        >
          Cancel
        </button>
      )}
    </form>
  )

  if (!overlay) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 text-white">
        <h2 className="text-center text-5xl text-green-600 sm:text-5xl md:text-6xl lg:text-7xl">
          Guessing Game
        </h2>

        <p className="mt-4 text-center text-xl leading-snug text-yellow-100 sm:text-2xl md:text-3xl lg:text-4xl">
          Thank you for visiting! <br /> - revs -
        </p>

        <p className="mt-6 text-center text-lg text-[#e8dab2] sm:text-xl md:text-2xl">
          Pick a name to play under.
        </p>

        {form}
      </main>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101720]/90 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-title"
        className="w-full max-w-md rounded-md border border-gray-600 bg-[#101720] p-6 shadow-xl"
      >
        <h2
          id="rename-title"
          className="text-center text-2xl text-green-600 sm:text-3xl"
        >
          Change name
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Your current game stays where it is.
        </p>

        {form}
      </div>
    </div>
  )
}
