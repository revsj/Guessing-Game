import { Navigate, Route, Routes } from 'react-router-dom'
import Play from './pages/Play.jsx'
import RequireUsername from './components/RequireUsername.jsx'
import UsernameScreen from './components/UsernameScreen.jsx'
import { PlayerProvider, usePlayer } from './hooks/usePlayer.js'
import { DEFAULT_LEVEL } from './constants/levels.js'

export default function App() {
  return (
    <PlayerProvider>
      <AppRoutes />
    </PlayerProvider>
  )
}

function AppRoutes() {
  const player = usePlayer()

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={`/play/${DEFAULT_LEVEL}`} replace />} />

        <Route element={<RequireUsername />}>
          <Route path="/play/:level" element={<Play />} />
        </Route>

        <Route path="*" element={<Navigate to={`/play/${DEFAULT_LEVEL}`} replace />} />
      </Routes>

      {player.isChangingName && <UsernameScreen player={player} overlay />}
    </>
  )
}
