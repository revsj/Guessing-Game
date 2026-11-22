import { usernameKey } from '../lib/username.js'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
      <p role="status" className="py-8 text-center text-base text-chalk/60">
        Loading scores…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-start gap-3 py-8 sm:items-center">
        <p className="text-base text-coral">{error}</p>
        <button
          type="button"
          onClick={onReload}
          className="h-11 rounded-sm border border-chalk/25 px-4 text-sm text-chalk motion-safe:transition-colors hover:border-chalk/50 hover:bg-chalk/5"
        >
          Reload scores
        </button>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-base text-chalk/60">
        No scores on Level {level} yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Best guesses on Level {level}</caption>
        <thead>
          <tr className="border-b border-chalk/15 text-xs text-chalk/60">
            <th scope="col" className="border-l-2 border-transparent py-2 pr-3 pl-2 font-medium">
              Rank
            </th>
            <th scope="col" className="w-full py-2 pr-3 font-medium">
              Player
            </th>
            <th scope="col" className="py-2 pr-6 text-right font-medium">
              Guesses
            </th>
            <th scope="col" className="hidden py-2 text-right font-medium sm:table-cell">
              Date
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
                className={`border-b border-chalk/10 ${isYou ? 'bg-gold/[0.06]' : ''}`}
              >
                <td
                  className={`border-l-2 py-3 pr-3 pl-2 font-display text-sm tabular-nums ${
                    isYou ? 'border-gold bg-gold/[0.06]' : 'border-transparent'
                  } ${index === 0 ? 'text-gold' : 'text-chalk/60'}`}
                >
                  {index + 1}
                </td>
                <td className="w-full py-3 pr-3 text-base text-chalk">
                  <span className="inline-flex flex-wrap items-baseline gap-2">
                    {row.username}
                    {isYou && (
                      <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[11px] font-medium text-ink">
                        You
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3 pr-6 text-right font-display text-sm whitespace-nowrap tabular-nums text-chalk">
                  {row.guesses}
                </td>
                <td className="hidden py-3 text-right text-sm whitespace-nowrap tabular-nums text-chalk/60 sm:table-cell">
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
