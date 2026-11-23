/**
 * `progress` lists the whole catalog for the leaderboard strip; `new` lists the
 * badges just earned on the win screen. State is always spelled out in text,
 * never shown by color alone.
 */
export default function BadgeList({ badges, variant = 'progress' }) {
  if (variant === 'new') {
    return (
      <ul className="mt-1 flex flex-col gap-1">
        {badges.map((badge) => (
          <li key={badge.code} className="text-sm">
            <span className="font-medium text-chalk">{badge.name}</span>{' '}
            <span className="text-chalk/60">— {badge.description}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {badges.map((badge) => (
        <li
          key={badge.code}
          className={`rounded-sm border p-3 ${
            badge.earned ? 'border-chalk/15' : 'border-chalk/10'
          }`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p
              className={`text-sm font-medium ${
                badge.earned ? 'text-chalk' : 'text-chalk/60'
              }`}
            >
              {badge.name}
            </p>
            <span
              className={`rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${
                badge.earned
                  ? 'bg-gold text-ink'
                  : 'border border-chalk/20 text-chalk/60'
              }`}
            >
              {badge.earned ? 'Earned' : 'Locked'}
            </span>
          </div>

          <p className="mt-1 text-xs text-chalk/60">{badge.description}</p>
        </li>
      ))}
    </ul>
  )
}
