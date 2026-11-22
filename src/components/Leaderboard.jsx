import { usernameKey } from '../lib/username.js'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
}

export default function Leaderboard({
  level,
  status,
  rows,
  error,
  normalizedUsername,
  onReload,
}) {
  if (status === 'loading') {
    return (
      <p className="py-6 text-center text-lg text-yellow-100">Loading scores…</p>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-center text-base text-red-400">{error}</p>
        <button
          type="button"
          onClick={onReload}
          className="rounded-md bg-yellow-500 px-4 py-2 text-lg text-black hover:bg-yellow-400"
        >
          Try again
        </button>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-lg text-yellow-100">
        No scores on Level {level} yet. Be the first!
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-base sm:text-lg">
        <thead>
          <tr className="border-b border-gray-600 text-yellow-100/70">
            <th scope="col" className="py-2 pr-3 font-normal">
              #
            </th>
            <th scope="col" className="py-2 pr-3 font-normal">
              Player
            </th>
            <th scope="col" className="py-2 pr-3 text-right font-normal">
              Guesses
            </th>
            <th scope="col" className="py-2 font-normal">
              When
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isYou =
              Boolean(normalizedUsername) &&
              usernameKey(row.username) === normalizedUsername

            return (
              <tr
                key={`${row.username}-${row.created_at}`}
                className={isYou ? 'bg-yellow-500/10' : undefined}
              >
                <td className="py-2 pr-3 text-yellow-100">{index + 1}</td>
                <td className="py-2 pr-3">
                  <span className={isYou ? 'text-yellow-400' : 'text-[#e8dab2]'}>
                    {row.username}
                  </span>
                  {isYou && (
                    <span className="ml-2 rounded bg-yellow-500 px-1.5 py-0.5 text-xs text-black">
                      you
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right text-[#e8dab2]">
                  {row.guesses}
                </td>
                <td className="py-2 text-sm text-gray-400">
                  {formatDate(row.created_at)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
