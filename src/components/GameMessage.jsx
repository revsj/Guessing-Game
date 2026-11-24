import { TIER_COPY } from './WinCelebration.jsx'

const GLOW = {
  sharp: 'motion-safe:animate-[answer-glow_1600ms_ease-out_both]',
  perfect: 'motion-safe:animate-[answer-glow_2000ms_ease-out_both]',
}

export default function GameMessage({ message, target, won, tier }) {
  if (!message) return null

  if (won) {
    const copy = TIER_COPY[tier] ?? TIER_COPY.normal
    const lit = tier === 'sharp' || tier === 'perfect'

    return (
      <div role="status" aria-live="polite" className="mt-6">
        <div className="relative mx-auto w-full max-w-md">
          {tier === 'perfect' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2 rounded-sm border border-mint/70 motion-safe:animate-[ring-pulse_900ms_ease-out_300ms_both] motion-reduce:hidden"
            />
          )}

          <div
            className={`relative overflow-hidden rounded-sm border border-chalk/15 bg-panel px-4 py-6 sm:py-8 ${
              lit
                ? `${GLOW[tier] ?? ''} motion-reduce:ring-1 motion-reduce:ring-mint/50`
                : ''
            }`}
          >
            {/* Split-flap: tinted top half, hinge at the middle, number across it. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-chalk/[0.04]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-chalk/20"
            />
            <p className="relative text-center font-display text-[clamp(3rem,17vw,9rem)] font-semibold leading-none tabular-nums text-mint motion-safe:animate-reveal">
              {target}
            </p>
          </div>
        </div>

        <p
          className={`mt-4 text-center text-lg font-medium ${
            tier === 'perfect' ? 'text-mint' : 'text-chalk'
          }`}
        >
          {copy}
        </p>
        <p className="mt-1 text-center text-sm text-chalk/60">{message.text}</p>
      </div>
    )
  }

  return (
    <div role="status" aria-live="polite" className="mt-5">
      <p
        className={`text-lg ${
          message.kind === 'invalid' || message.kind === 'error'
            ? 'text-coral'
            : 'text-chalk'
        }`}
      >
        {message.text}
      </p>
    </div>
  )
}
