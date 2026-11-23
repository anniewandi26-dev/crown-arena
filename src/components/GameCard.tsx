import { Link } from 'react-router-dom'
import type { GameItem } from '../types'
import { formatPlayers } from '../lib/format'

const THUMB: Record<string, { bg: string; mark: string }> = {
  slot: { bg: 'linear-gradient(145deg,#3a2a12,#1a1208)', mark: 'SLOT' },
  baccarat: { bg: 'linear-gradient(145deg,#1f3d32,#0e1a16)', mark: 'BAC' },
  dragontiger: { bg: 'linear-gradient(145deg,#3a2410,#181008)', mark: 'DT' },
  blackjack: { bg: 'linear-gradient(145deg,#1a2430,#0c1218)', mark: 'BJ' },
  threecard: { bg: 'linear-gradient(145deg,#2a1a30,#140e18)', mark: '3CP' },
  roulette: { bg: 'linear-gradient(145deg,#3a1218,#14080a)', mark: 'ROU' },
  poker: { bg: 'linear-gradient(145deg,#24301a,#10180c)', mark: 'TX' },
  sicbo: { bg: 'linear-gradient(145deg,#30241a,#18120c)', mark: 'SIC' },
  craps: { bg: 'linear-gradient(145deg,#2a2030,#120e18)', mark: 'CRP' },
  bingo: { bg: 'linear-gradient(145deg,#1a3030,#0c1818)', mark: 'BIN' },
  keno: { bg: 'linear-gradient(145deg,#30201a,#18100c)', mark: 'KEN' },
  fish: { bg: 'linear-gradient(145deg,#0e2a36,#081418)', mark: 'FISH' },
  lottery: { bg: 'linear-gradient(145deg,#3a2010,#180e08)', mark: 'LOT' },
  sports: { bg: 'linear-gradient(145deg,#1a3024,#0c1812)', mark: 'SP' },
}

export function GameCard({ game }: { game: GameItem }) {
  const thumb = THUMB[game.category] ?? THUMB.slot
  const to = game.playable
    ? `/play/${game.id}`
    : game.category === 'sports'
      ? '/sports'
      : '/live'

  return (
    <Link to={to} className="game-card">
      <div className="game-thumb" style={{ background: thumb.bg }}>
        {game.badge && (
          <span className={`badge ${game.badge}`}>
            {game.badge === 'live' ? '直播' : game.badge === 'new' ? '新' : '热'}
          </span>
        )}
        {thumb.mark}
      </div>
      <div className="game-meta">
        <h3>{game.name}</h3>
        <p>
          {formatPlayers(game.players)} 人在线
          {game.dealer ? ` · ${game.dealer}` : ''}
        </p>
      </div>
      <div className="game-side">
        <strong>RTP {game.rtp}%</strong>
        {game.playable ? '可玩' : '示意'}
      </div>
    </Link>
  )
}
