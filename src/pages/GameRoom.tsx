import { Link, useParams } from 'react-router-dom'
import { GAMES } from '../data/catalog'
import { SlotGame } from '../games/Slot'
import { BlackjackGame } from '../games/Blackjack'
import { BaccaratGame } from '../games/Baccarat'
import { RouletteGame } from '../games/Roulette'
import { SicBoGame } from '../games/SicBo'
import { CrapsGame } from '../games/Craps'
import { BingoGame } from '../games/Bingo'
import { KenoGame } from '../games/Keno'
import { PokerGame } from '../games/Poker'
import { DragonTigerGame } from '../games/DragonTiger'
import { ThreeCardPokerGame } from '../games/ThreeCardPoker'
import { FishGame } from '../games/Fish'
import { LotteryGame } from '../games/Lottery'

export function GameRoom() {
  const { id } = useParams()
  const game = GAMES.find((g) => g.id === id)

  if (!game) {
    return (
      <div className="page">
        <p className="empty">未找到该厅</p>
        <Link className="btn btn-ghost" to="/">
          返回
        </Link>
      </div>
    )
  }

  if (!game.playable) {
    return (
      <div className="page">
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>{game.name}</h2>
          <p className="muted">{game.blurb}</p>
          <p style={{ marginTop: 12 }}>该入口跳转体育或尚未开放独立桌。请从体育页下注。</p>
          <Link className="btn btn-primary" to="/sports" style={{ marginTop: 12 }}>
            去体育
          </Link>
        </div>
      </div>
    )
  }

  const backTo = game.kind === 'slot' ? '/slots' : game.kind === 'fish' || game.kind === 'lottery' ? '/' : '/live'

  return (
    <div className="page game-room wide-pad">
      <div className="room-head">
        <Link className="chip" to={backTo}>
          ← 返回
        </Link>
        <div>
          <strong>{game.name}</strong>
          <div className="muted" style={{ fontSize: '0.78rem' }}>
            RTP {game.rtp}%
            {game.dealer ? ` · ${game.dealer}` : ''}
          </div>
        </div>
      </div>

      {game.kind === 'slot' && <SlotGame title={game.name} gameId={game.id} />}
      {game.kind === 'blackjack' && <BlackjackGame title={game.name} />}
      {game.kind === 'baccarat' && <BaccaratGame title={game.name} />}
      {game.kind === 'roulette' && (
        <RouletteGame title={game.name} american={game.id === 'rou-us'} />
      )}
      {game.kind === 'sicbo' && <SicBoGame title={game.name} />}
      {game.kind === 'craps' && <CrapsGame title={game.name} />}
      {game.kind === 'bingo' && <BingoGame title={game.name} />}
      {game.kind === 'keno' && <KenoGame title={game.name} />}
      {game.kind === 'poker' && <PokerGame title={game.name} />}
      {game.kind === 'dragontiger' && <DragonTigerGame title={game.name} />}
      {game.kind === 'threecard' && <ThreeCardPokerGame title={game.name} />}
      {game.kind === 'fish' && <FishGame title={game.name} />}
      {game.kind === 'lottery' && (
        <LotteryGame title={game.name} pickCount={game.id === 'lotto-quick' ? 5 : 6} />
      )}

      <p className="disclaimer">{game.blurb}</p>
    </div>
  )
}
