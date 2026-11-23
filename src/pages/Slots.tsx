import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SLOT_CATALOG, SLOT_TYPES, STUDIOS } from '../data/slots'
import { GameCard } from '../components/GameCard'
import { GAMES } from '../data/catalog'

export function Slots() {
  const [q, setQ] = useState('')
  const [studio, setStudio] = useState('all')
  const [type, setType] = useState('all')

  const filtered = useMemo(() => {
    return SLOT_CATALOG.filter((s) => {
      if (studio !== 'all' && s.studio !== studio) return false
      if (type !== 'all' && s.type !== type) return false
      if (q.trim() && !s.name.toLowerCase().includes(q.trim().toLowerCase())) return false
      return true
    })
  }, [q, studio, type])

  const featured = SLOT_CATALOG.filter((s) => s.featured)
  const gameMap = useMemo(() => new Map(GAMES.map((g) => [g.id, g])), [])

  return (
    <div className="page wide-pad">
      <section className="hero slots-hero">
        <h1>老虎机大厅</h1>
        <p>搜索机台、按厂牌与类型筛选。全部为原创试玩金机台，不含第三方商标游戏。</p>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/play/slot-aureum-royal">
            玩金钥皇家
          </Link>
          <Link className="btn btn-ghost" to="/play/fish-reef">
            去捕鱼
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="field" style={{ marginBottom: 10 }}>
          <label htmlFor="slot-search">搜索机台</label>
          <input
            id="slot-search"
            placeholder="输入游戏名称"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="cat-scroll" style={{ marginBottom: 8 }}>
          {STUDIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`cat-pill${studio === s.id ? ' active' : ''}`}
              onClick={() => setStudio(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="cat-scroll">
          {SLOT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`cat-pill${type === t.id ? ' active' : ''}`}
              onClick={() => setType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {!q && studio === 'all' && type === 'all' && (
        <section className="section">
          <div className="section-head">
            <h2>精选</h2>
            <p>大厅焦点机</p>
          </div>
          <div className="game-grid">
            {featured.map((s) => {
              const g = gameMap.get(s.id)
              return g ? <GameCard key={s.id} game={g} /> : null
            })}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>机台列表</h2>
          <p>{filtered.length} 台</p>
        </div>
        <div className="game-grid">
          {filtered.map((s) => {
            const g = gameMap.get(s.id)
            return g ? <GameCard key={s.id} game={g} /> : null
          })}
        </div>
        {filtered.length === 0 && <p className="empty">没有匹配的机台</p>}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>机台类型</h2>
        </div>
        <div className="panel rules-list">
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
            经典三轴 · 五轴视频 · 累积奖池 · 多层奖励 · Megaways 风格高波动。另有捕鱼与彩票入口可从导航进入。
          </p>
        </div>
      </section>

      <p className="disclaimer">
        本页为金钥会原创试玩大厅。厂牌名为虚构工作室，不接入、不复制任何外部赌场或供应商内容。
      </p>
    </div>
  )
}
