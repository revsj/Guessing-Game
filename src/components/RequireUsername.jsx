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
      <main className="flex min-h-screen w-full items-center justify-center px-4 text-lg text-yellow-100">
        Checking your player…
      </main>
    )
  }

  if (!player.hasUsername) {
    return <UsernameScreen player={player} />
  }

  return <Outlet />
}
