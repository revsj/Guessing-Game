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
  const currentLevel = LEVELS[level]

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 text-white">
      <h2 className="text-center text-5xl text-green-600 sm:text-5xl md:text-6xl lg:text-7xl">
        Guessing Game
      </h2>

      <h1 className="mt-4 text-center text-2xl text-[#e8dab2] sm:text-3xl md:text-4xl">
        Leaderboard
      </h1>

      <div
        role="tablist"
        aria-label="Leaderboard level"
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {Object.values(LEVELS).map((option) => {
          const active = option.level === level

          return (
            <button
              key={option.level}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setLevel(option.level)}
              className={
                active
                  ? 'rounded-md bg-yellow-500 px-4 py-2 text-lg text-black'
                  : 'rounded-md border border-gray-600 px-4 py-2 text-lg text-yellow-100 hover:bg-gray-800'
              }
            >
              Level {option.level}
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-center text-base text-gray-400">
        {currentLevel.name} · range {currentLevel.min}–{currentLevel.max} · best
        guesses per player
      </p>

      <div className="mt-6 w-full max-w-2xl rounded-md border border-gray-700 p-4 sm:p-6">
        <Leaderboard
          level={level}
          {...board}
          normalizedUsername={normalizedUsername}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-base">
        <Link
          to={`/play/${level}`}
          className="text-yellow-100 underline underline-offset-2 hover:text-green-400"
        >
          Play Level {level}
        </Link>

        <Link
          to={`/play/${DEFAULT_LEVEL}`}
          className="text-yellow-100 underline underline-offset-2 hover:text-green-400"
        >
          {hasUsername ? 'Play from Level 1' : 'Choose a name'}
        </Link>
      </div>
    </main>
  )
}
