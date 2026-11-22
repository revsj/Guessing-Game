import { useEffect, useState } from 'react'

const BALLOON_COUNTS = { normal: 10, sharp: 18, perfect: 18 }

export const TIER_COPY = {
  normal: 'Nice one.',
  sharp: 'Sharp guessing.',
  perfect: 'Near perfect.',
}

export function getWinTier(attempts, optimal) {
  if (attempts <= optimal) return 'perfect'
  if (attempts <= optimal + 2) return 'sharp'
  return 'normal'
}

const COLORS = ['bg-mint', 'bg-chalk', 'bg-gold', 'bg-coral']

// Small deterministic PRNG so one seed produces one layout.
function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeBalloons(tier, seed) {
  const count = BALLOON_COUNTS[tier] ?? BALLOON_COUNTS.normal
  const random = mulberry32(Math.floor(seed * 4294967296))

  return Array.from({ length: count }, (_, index) => {
    const size = 14 + Math.round(random() * 26) // 14-40px
    const rise = 2200 + Math.round(random() * 800)

    return {
      id: index,
      left: 3 + random() * 89, // 3-92%
      size,
      rise,
      delay: Math.round(random() * 320),
      sway: 1200 + Math.round(random() * 600),
      color: COLORS[index % 6 === 0 ? 3 : index % 3],
      opacity: 0.65 + ((size - 14) / 26) * 0.35,
    }
  })
}

/**
 * One burst of balloons on a win, painted behind the page content and removed
 * once the last balloon has left the screen. Presentation only.
 */
export default function WinCelebration({ tier }) {
  // Seeded once per mount: a re-render keeps the layout, a new win gets a new one.
  const [balloons] = useState(() => makeBalloons(tier, Math.random()))
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFinished(true), 3600)
    return () => clearTimeout(timer)
  }, [])

  if (finished) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden motion-reduce:hidden"
    >
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className="absolute"
          style={{
            left: `${balloon.left}%`,
            bottom: '-72px',
            animation: `balloon-rise ${balloon.rise}ms cubic-bezier(0.35, 0.1, 0.4, 1) ${balloon.delay}ms both`,
          }}
        >
          <div
            style={{
              opacity: balloon.opacity,
              animation: `balloon-sway ${balloon.sway}ms ease-in-out ${balloon.delay}ms 2 alternate both`,
            }}
            className="flex flex-col items-center"
          >
            <div
              className={`rounded-[50%] ${balloon.color}`}
              style={{ width: balloon.size, height: Math.round(balloon.size * 1.25) }}
            />
            <div
              className={`-mt-1 h-2 w-2 rotate-45 ${balloon.color}`}
              aria-hidden="true"
            />
            <div className="h-8 w-px bg-chalk/20" aria-hidden="true" />
          </div>
        </div>
      ))}
    </div>
  )
}
