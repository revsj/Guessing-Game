import { Navigate, useNavigate, useParams } from 'react-router-dom'
import GameBoard from '../components/GameBoard.jsx'
import useGame from '../hooks/useGame.js'
import { usePlayer } from '../hooks/usePlayer.js'
import { DEFAULT_LEVEL, getLevel, getNextLevel } from '../constants/levels.js'

export default function Play() {
  const { level: levelParam } = useParams()
  const level = getLevel(levelParam)

  if (!level) {
    return <Navigate to={`/play/${DEFAULT_LEVEL}`} replace />
  }

  // key remounts the game (and useGame) when the level changes.
  return <LevelGame key={level.level} level={level} />
}

function LevelGame({ level }) {
  const navigate = useNavigate()
  const game = useGame(level)
  const { username, startChangeName } = usePlayer()
  const nextLevel = getNextLevel(level.level)

  return (
    <GameBoard
      level={level}
      game={game}
      username={username}
      onChangeName={startChangeName}
      nextLevel={nextLevel}
      onNext={nextLevel ? () => navigate(`/play/${nextLevel.level}`) : null}
    />
  )
}
