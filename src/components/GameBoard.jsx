import GameMessage from './GameMessage.jsx'
import GuessForm from './GuessForm.jsx'

export default function GameBoard({
  level,
  game,
  username,
  onChangeName,
  nextLevel,
  onNext,
}) {
  const won = game.status === 'won'

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 text-white">
      <h2 className="mt-8 text-center text-5xl text-green-600 sm:text-5xl md:text-6xl lg:text-7xl">
        Guessing Game
      </h2>

      <div className="mt-2 text-center text-lg text-yellow-400 sm:text-xl md:text-2xl lg:text-3xl">
        Level {level.level}
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-base text-yellow-100 sm:text-lg">
        <span>
          Playing as <span className="text-yellow-400">{username}</span>
        </span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={onChangeName}
          aria-haspopup="dialog"
          className="underline underline-offset-2 hover:text-green-400"
        >
          Change name
        </button>
      </div>

      <p className="mt-4 text-center text-xl leading-snug text-yellow-100 sm:text-2xl md:text-3xl lg:text-4xl">
        Thank you for visiting! <br /> - revs -
      </p>

      <GameMessage message={game.message} target={game.target} won={won} />

      <h1 className="mt-4 text-center text-lg text-[#e8dab2] sm:text-xl md:text-2xl lg:text-3xl">
        NOW GUESS THE NUMBER BETWEEN {level.min}-{level.max}
      </h1>

      <GuessForm
        inputRef={game.inputRef}
        won={won}
        nextLevel={nextLevel}
        onGuess={game.guess}
        onReset={game.reset}
        onNext={onNext}
      />
    </main>
  )
}
