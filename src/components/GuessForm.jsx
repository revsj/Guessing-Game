export default function GuessForm({ inputRef, onGuess }) {
  function handleSubmit(event) {
    event.preventDefault()
    onGuess()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row">
      <input
        ref={inputRef}
        id="guessInput"
        type="number"
        step="any"
        inputMode="numeric"
        aria-label="Your guess"
        placeholder="e.g. 42"
        className="h-14 w-full rounded-sm border border-chalk/20 bg-panel px-4 text-center font-display text-3xl leading-none tabular-nums text-chalk placeholder:font-sans placeholder:text-base placeholder:text-chalk/60 focus:border-chalk/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="submit"
        className="h-14 shrink-0 rounded-sm bg-gold px-8 text-base font-medium text-ink motion-safe:transition-colors motion-safe:active:translate-y-px hover:bg-gold/90"
      >
        Guess
      </button>
    </form>
  )
}
