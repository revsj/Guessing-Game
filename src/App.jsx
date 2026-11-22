import { Navigate, Route, Routes } from 'react-router-dom'
import Play from './pages/Play.jsx'
import { DEFAULT_LEVEL } from './constants/levels.js'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/play/${DEFAULT_LEVEL}`} replace />} />
      <Route path="/play/:level" element={<Play />} />
      <Route path="*" element={<Navigate to={`/play/${DEFAULT_LEVEL}`} replace />} />
    </Routes>
  )
}
