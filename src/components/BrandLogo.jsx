/**
 * The brand lockup used as the page heading. One file keeps the header
 * consistent across the game, username and leaderboard screens.
 */
export default function BrandLogo({ className = 'h-9 sm:h-10' }) {
  return (
    <img
      src="/brand/logo.png"
      alt="Guess The Number"
      width="720"
      height="266"
      className={`block w-auto ${className}`}
    />
  )
}
