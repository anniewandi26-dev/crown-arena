import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, GAMES, LEADERBOARD } from '../data/catalog'
import { GameCard } from '../components/GameCard'
import { formatMoney } from '../lib/format'
import { useClub } from '../store/useClub'
import type { Category } from '../types'

export function Home() {
  const { joined, joinClub, currency } = useClub()
  const [cat, setCat] = useState<Category>('all')

  const games = useMemo(
    () => (cat === 'all' ? GAMES : GAMES.filter((g) => g.category === cat)),
    [cat],
  )

  return (
    <div className="page wide-pad">
      <section className="hero">
        <h1>十张桌，一个试玩钱包。</h1>
        <p>今晚赢取的试玩金计入日榜，直至午夜重置展示。本地结算，无需真钱。</p>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/slots">
            老虎机大厅
          </Link>
          <Link className="btn btn-ghost" to="/live">
            直播桌
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>日榜</h2>
          <p>试玩金计入至午夜</p>
        </div>
        <div className="leader-box">
          {!joined ? (
            <button
              type="button"
              className="btn btn-felt"
              style={{ width: '100%', marginBottom: 10 }}
              onClick={joinClub}
            >
              加入金钥会 · 占一座
            </button>
          ) : (
            <p className="muted" style={{ marginBottom: 10 }}>
              你已入座。继续游戏即可冲击日榜。
            </p>
          )}
          <ol>
            {LEADERBOARD.map((row) => (
              <li key={row.rank}>
                <span className="rank">{row.rank}</span>
                <span>{row.name}</span>
                <span className="amt">{formatMoney(row.amount, currency, true)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>今晚</h2>
          <p>{games.length} 个厅</p>
        </div>
        <div className="cat-scroll" role="tablist" aria-label="游戏分类">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={cat === c.id}
              className={`cat-pill${cat === c.id ? ' active' : ''}`}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="game-grid" style={{ marginTop: 12 }}>
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>私人沙龙</h2>
        </div>
        <div className="panel">
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>十个沙龙，一个试玩钱包。</p>
          <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
            靴、轮盘与发牌员均在本机运行。赔率会动，截止前可从注单撤出。支持沙盒加密货币与卡支付示意。
          </p>
        </div>
      </section>

      <p className="disclaimer">
        金钥会 AUREUM 是设备上的试玩金原型。不含真实货币下注，不连接真实赌场或支付通道。
      </p>
    </div>
  )
}
