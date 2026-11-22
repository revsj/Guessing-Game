import { Outlet } from 'react-router-dom'
import UsernameScreen from './UsernameScreen.jsx'
import { usePlayer } from '../hooks/usePlayer.js'

/**
 * Blocks the game until a username (and its players row) exist. The URL is
 * left alone, so a direct link like /play/2 continues into Level 2 after save.
 */
export default function RequireUsername() {
  const player = usePlayer()

  if (!player.isReady) {
    return (
      <main className="flex min-h-dvh w-full items-center justify-center px-5">
        <p role="status" className="text-base text-chalk/60">
          Loading your player…
        </p>
      </main>
    )
  }

  if (!player.hasUsername) {
    return <UsernameScreen player={player} />
  }

  return <Outlet />
}
