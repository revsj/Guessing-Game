import { Link } from 'react-router-dom'
import BadgeList from './BadgeList.jsx'
import GameMessage from './GameMessage.jsx'
import GuessForm from './GuessForm.jsx'
import WinCelebration, { getWinTier } from './WinCelebration.jsx'

const MAX_NEW_BADGES = 3

const PRIMARY_BUTTON =
  'h-14 rounded-sm bg-gold px-6 text-base font-medium text-ink motion-safe:transition-colors motion-safe:active:translate-y-px hover:bg-gold/90'

const SECONDARY_BUTTON =
  'h-14 rounded-sm border border-chalk/25 px-6 text-base font-medium text-chalk motion-safe:transition-colors motion-safe:active:translate-y-px hover:border-chalk/50 hover:bg-chalk/5'

export default function GameBoard({
  level,
  game,
  username,
  isExistingPlayer,
  onChangeName,
  score,
  newBadges = [],
  onReset,
  nextLevel,
  onNext,
}) {
  const won = game.status === 'won'
  const tier = won ? getWinTier(game.attempts, level.optimal) : null

  // Only after a successful save, rarest first, at most three.
  const freshBadges = score.status === 'saved' ? newBadges : []
  const shownBadges = freshBadges.slice(0, MAX_NEW_BADGES)
  const hiddenCount = freshBadges.length - shownBadges.length

  return (
    <main className="isolate flex min-h-dvh w-full flex-col">
      {won && <WinCelebration tier={tier} />}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 sm:px-6">
        <header className="flex flex-col gap-1 border-b border-chalk/15 py-4 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6 sm:gap-y-1">
          <h1 className="font-display text-lg font-semibold tracking-tight sm:mr-auto">
            Guessing game
          </h1>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-chalk/60">
            <span>
              Playing as <span className="font-display text-chalk">{username}</span>
            </span>
            <button
              type="button"
              onClick={onChangeName}
              aria-haspopup="dialog"
              className="underline decoration-chalk/30 underline-offset-4 hover:text-chalk"
            >
              Change name
            </button>
            <Link
              to="/leaderboard"
              state={{ level: level.level }}
              className="underline decoration-chalk/30 underline-offset-4 hover:text-chalk"
            >
              Leaderboard
            </Link>
          </div>
        </header>

        {isExistingPlayer && (
          <p className="pt-3 text-xs text-chalk/60">
            This name already has scores on the board.
          </p>
        )}

        <div className="flex flex-1 flex-col pt-8 pb-4 sm:pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-display text-xs font-medium tracking-wide text-gold">
              Level {level.level}
            </p>
            {!won && (
              <p className="ml-auto font-display text-xs text-chalk/60">
                Guesses {game.attempts}
              </p>
            )}
          </div>

          {won ? (
            <>
              <GameMessage message={game.message} target={game.target} won tier={tier} />

              {/* Opaque: keeps celebration balloons behind the status and actions. */}
              <div className="-mx-2 mt-3 bg-ink px-2 pb-2">
                {/* One live region: the save line and any new badges announce together. */}
                <div role="status" className="min-h-6 text-sm">
                  {score.status === 'saving' && (
                    <p className="text-chalk/60">Saving score…</p>
                  )}

                  {score.status === 'saved' && (
                    <p className="text-chalk/60">
                      Saved to the Level {level.level} leaderboard.
                    </p>
                  )}

                  {score.status === 'error' && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <p className="text-coral">{score.error}</p>
                      <button
                        type="button"
                        onClick={score.retry}
                        className="h-11 rounded-sm border border-chalk/25 px-4 text-sm text-chalk motion-safe:transition-colors hover:border-chalk/50 hover:bg-chalk/5"
                      >
                        Retry save
                      </button>
                    </div>
                  )}

                  {shownBadges.length > 0 && (
                    <div className="mt-2">
                      <p className="font-display text-xs font-medium tracking-wide text-gold">
                        {shownBadges.length === 1 && hiddenCount === 0
                          ? 'New badge'
                          : 'New badges'}
                      </p>

                      <BadgeList badges={shownBadges} variant="new" />

                      {hiddenCount > 0 && (
                        <p className="mt-1 text-xs text-chalk/60">
                          +{hiddenCount} more, see the leaderboard
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  {nextLevel && (
                    <button
                      type="button"
                      onClick={onNext}
                      autoFocus
                      className={PRIMARY_BUTTON}
                    >
                      Next level
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onReset}
                    autoFocus={!nextLevel}
                    className={nextLevel ? SECONDARY_BUTTON : PRIMARY_BUTTON}
                  >
                    Play again
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-lg text-chalk sm:text-xl">
                Guess a number from {level.min} to {level.max}
              </p>

              <GuessForm inputRef={game.inputRef} onGuess={game.guess} />

              <GameMessage message={game.message} target={game.target} won={false} />
            </>
          )}
        </div>

        <footer className="py-5 text-xs text-chalk/60">Made by revs</footer>
      </div>
    </main>
  )
}
