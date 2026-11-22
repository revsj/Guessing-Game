export default function GuessForm({
  inputRef,
  won,
  nextLevel,
  onGuess,
  onReset,
  onNext,
}) {
  function handleSubmit(event) {
    event.preventDefault()
    onGuess()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center">
      <input
        ref={inputRef}
        id="guessInput"
        type="number"
        step="any"
        aria-label="Your guess"
        placeholder="Goodluck:)"
        disabled={won}
        className="w-64 max-w-xs rounded-md border border-gray-300 bg-transparent p-2 text-center text-[2rem] text-[#e8dab2] placeholder:text-2xl focus:outline-none disabled:opacity-60"
      />

      {!won && (
        <button
          type="submit"
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-2xl text-white hover:bg-blue-600"
        >
          Submit
        </button>
      )}

      {won && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-md bg-yellow-500 px-4 py-2 text-2xl text-black hover:bg-yellow-400"
        >
          Play Again
        </button>
      )}

      {won && nextLevel && (
        <button
          type="button"
          onClick={onNext}
          className="mt-4 rounded-md bg-yellow-500 px-4 py-2 text-2xl text-black hover:bg-yellow-400"
        >
          Level {nextLevel.level}
        </button>
      )}
    </form>
  )
}
