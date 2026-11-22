import { useCallback } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import GameBoard from '../components/GameBoard.jsx'
import useGame from '../hooks/useGame.js'
import { usePlayer } from '../hooks/usePlayer.js'
import useScoreSave from '../hooks/useScoreSave.js'
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
  const { username, playerId, isExistingPlayer, startChangeName } = usePlayer()
  const score = useScoreSave()
  const { save } = score

  const handleWin = useCallback(
    (attempts) => {
      // Fire and forget: a failed save must never block the game.
      save({ playerId, level: level.level, guesses: attempts })
    },
    [save, playerId, level.level],
  )

  const game = useGame(level, { onWin: handleWin })
  const nextLevel = getNextLevel(level.level)

  function handleReset() {
    game.reset()
    score.reset()
  }

  return (
    <GameBoard
      level={level}
      game={game}
      username={username}
      isExistingPlayer={isExistingPlayer}
      onChangeName={startChangeName}
      score={score}
      onReset={handleReset}
      nextLevel={nextLevel}
      onNext={nextLevel ? () => navigate(`/play/${nextLevel.level}`) : null}
    />
  )
}
