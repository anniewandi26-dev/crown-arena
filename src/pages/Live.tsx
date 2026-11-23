import { GAMES } from '../data/catalog'
import { GameCard } from '../components/GameCard'

export function Live() {
  const live = GAMES.filter((g) => g.badge === 'live' || g.playable)

  return (
    <div className="page wide-pad">
      <div className="section-head">
        <h2>直播桌</h2>
        <p>发牌员示意 · 本机结算</p>
      </div>
      <div className="game-grid">
        {live.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
      <p className="disclaimer">
        「直播」为体验标签：画面与结果均在浏览器本地生成，不含真实真人荷官视频流。
      </p>
    </div>
  )
}
