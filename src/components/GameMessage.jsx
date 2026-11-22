export default function GameMessage({ message, target, won }) {
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 flex flex-col items-center"
    >
      {won && (
        <p className="my-5 text-center text-7xl leading-none text-[#80ef80] sm:text-8xl lg:text-[200px]">
          {target}
        </p>
      )}
      <p className="text-center text-xl text-yellow-100 sm:text-2xl md:text-3xl">
        {message.text}
      </p>
    </div>
  )
}
