import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard.jsx'
import useLeaderboard from '../hooks/useLeaderboard.js'
import { usePlayer } from '../hooks/usePlayer.js'
import { DEFAULT_LEVEL, LEVELS, getLevel } from '../constants/levels.js'

export default function LeaderboardPage() {
  const { normalizedUsername, hasUsername } = usePlayer()
  const location = useLocation()

  // Coming from the game keeps you on that level.
  const [level, setLevel] = useState(
    () => getLevel(location.state?.level)?.level ?? DEFAULT_LEVEL,
  )
  const board = useLeaderboard(level)

  return (
    <main className="flex min-h-dvh w-full flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 sm:px-6">
        <header className="border-b border-chalk/15 py-4">
          <h1 className="font-display text-lg font-semibold tracking-tight">
            Guessing game
          </h1>
        </header>

        <div className="flex-1 pt-8 pb-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">Leaderboard</h2>
          <p className="mt-1 text-base text-chalk/60">Best guesses per player.</p>

          <div
            role="group"
            aria-label="Leaderboard level"
            className="mt-6 flex w-full max-w-md divide-x divide-chalk/15 overflow-hidden rounded-sm border border-chalk/15"
          >
            {Object.values(LEVELS).map((option) => {
              const active = option.level === level

              return (
                <button
                  key={option.level}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLevel(option.level)}
                  className={`flex-1 px-2 py-2 text-center motion-safe:transition-colors ${
                    active
                      ? 'bg-gold text-ink'
                      : 'text-chalk/60 hover:bg-chalk/5 hover:text-chalk'
                  }`}
                >
                  <span className="block font-display text-xs font-medium">
                    Level {option.level}
                  </span>
                  <span
                    className={`mt-0.5 block font-display text-[11px] ${
                      active ? 'text-ink/80' : 'text-chalk/60'
                    }`}
                  >
                    {option.min}–{option.max}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 rounded-sm border border-chalk/15 p-4 sm:p-6">
            <Leaderboard
              level={level}
              {...board}
              normalizedUsername={normalizedUsername}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-3 text-base">
            <Link
              to={`/play/${level}`}
              className="text-chalk underline decoration-chalk/30 underline-offset-4 hover:decoration-chalk"
            >
              Play Level {level}
            </Link>

            <Link
              to={`/play/${DEFAULT_LEVEL}`}
              className="text-chalk/70 underline decoration-chalk/30 underline-offset-4 hover:text-chalk hover:decoration-chalk"
            >
              {hasUsername ? 'Play from Level 1' : 'Enter your name'}
            </Link>
          </div>
        </div>

        <footer className="py-5 text-xs text-chalk/60">Made by revs</footer>
      </div>
    </main>
  )
}
