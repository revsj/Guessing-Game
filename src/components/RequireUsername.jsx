import { Outlet } from 'react-router-dom'
import UsernameScreen from './UsernameScreen.jsx'
import DatabaseNotice from './DatabaseNotice.jsx'
import { usePlayer } from '../hooks/usePlayer.js'
import { isSupabaseConfigured } from '../lib/supabase/client.js'

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

  if (player.loadError) {
    return (
      <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 px-5">
        {isSupabaseConfigured ? (
          <p role="alert" className="text-center text-coral">
            {player.loadError}
          </p>
        ) : (
          <DatabaseNotice className="text-center" />
        )}
        <button
          type="button"
          onClick={player.retryPlayerLoad}
          className="h-11 rounded-sm border border-chalk/25 px-4 text-sm text-chalk motion-safe:transition-colors hover:border-chalk/50 hover:bg-chalk/5"
        >
          Retry
        </button>
      </main>
    )
  }

  if (!player.hasUsername) {
    return <UsernameScreen player={player} />
  }

  return <Outlet />
}
