import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import GameBoard from '../components/GameBoard.jsx'
import useBadges from '../hooks/useBadges.js'
import useGame from '../hooks/useGame.js'
import { usePlayer } from '../hooks/usePlayer.js'
import { DEFAULT_LEVEL, getLevel, getNextLevel } from '../constants/levels.js'
import { earnedCodes, sortByRarity } from '../lib/badges.js'

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
  const { username, playerId, startChangeName } = usePlayer()
  const [score, setScore] = useState({ status: 'idle', error: null })
  const badges = useBadges({ playerId, username })
  const { reload: reloadBadges } = badges
  const [baseline, setBaseline] = useState(null)

  const handleWin = useCallback(() => {
    setScore({ status: 'saved', error: null })
  }, [])

  const game = useGame(level, { onWin: handleWin })
  const nextLevel = getNextLevel(level.level)

  // Baseline = the first successful load. A failed first load means this round
  // shows no "new" badges rather than claiming the whole list.
  useEffect(() => {
    if (baseline || badges.status !== 'ready') return
    setBaseline(earnedCodes(badges.badges))
  }, [baseline, badges.status, badges.badges])

  // The saved score changes the board: recompute badges once it lands.
  useEffect(() => {
    if (score.status === 'saved') reloadBadges()
  }, [score.status, reloadBadges])

  const newBadges = useMemo(() => {
    if (!baseline || badges.status !== 'ready') return []
    return sortByRarity(
      badges.badges.filter((badge) => badge.earned && !baseline.has(badge.code)),
    )
  }, [baseline, badges.badges, badges.status])

  function handleReset() {
    game.reset()
    setScore({ status: 'idle', error: null })
    // This round is over; the badges just earned become the new baseline.
    setBaseline(badges.status === 'ready' ? earnedCodes(badges.badges) : null)
  }

  return (
    <GameBoard
      level={level}
      game={game}
      username={username}
      onChangeName={startChangeName}
      score={score}
      newBadges={newBadges}
      onReset={handleReset}
      nextLevel={nextLevel}
      onNext={nextLevel ? () => navigate(`/play/${nextLevel.level}`) : null}
    />
  )
}
