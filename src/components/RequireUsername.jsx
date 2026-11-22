import { Outlet } from 'react-router-dom'
import UsernameScreen from './UsernameScreen.jsx'
import { usePlayer } from '../hooks/usePlayer.js'

/**
 * Blocks the game until a username exists. The URL is left alone, so a direct
 * link like /play/2 continues into Level 2 once the name is saved.
 */
export default function RequireUsername() {
  const player = usePlayer()

  if (!player.hasUsername) {
    return <UsernameScreen player={player} />
  }

  return <Outlet />
}
