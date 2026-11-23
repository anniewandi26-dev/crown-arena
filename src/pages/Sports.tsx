import { useState } from 'react'
import { MATCHES } from '../data/catalog'
import { formatMoney } from '../lib/format'
import { useClub } from '../store/useClub'

export function Sports() {
  const { currency, slip, addToSlip, updateStake, removeFromSlip, clearSlip, placeSlip } =
    useClub()
  const [msg, setMsg] = useState('')

  const totalStake = slip.reduce((s, b) => s + b.stake, 0)
  const potential = slip.reduce((s, b) => s + b.stake * b.odds, 0)

  return (
    <div className="page wide-pad">
      <div className="section-head">
        <h2>体育</h2>
        <p>滚球 · 亚盘示意</p>
      </div>

      {MATCHES.map((m) => (
        <article key={m.id} className="match-card">
          <div className="sport-tag">
            {m.sport} · {m.league} · {m.clock}
          </div>
          <div className="teams">
            <div>
              <strong>
                {m.home} vs {m.away}
              </strong>
            </div>
            <div className="score">{m.score}</div>
          </div>
          <div className={`odds-row${m.markets.length === 2 ? ' two' : ''}`}>
            {m.markets.map((mk) => {
              const on = slip.some((b) => b.matchId === m.id && b.selection === mk.label)
              return (
                <button
                  key={mk.label}
                  type="button"
                  className={`odds-btn${on ? ' on' : ''}`}
                  onClick={() =>
                    addToSlip({
                      matchId: m.id,
                      label: `${m.home} vs ${m.away}`,
                      selection: mk.label,
                      odds: mk.odds,
                    })
                  }
                >
                  <small>{mk.label}</small>
                  <strong>{mk.odds.toFixed(2)}</strong>
                </button>
              )
            })}
          </div>
        </article>
      ))}

      <section className="section">
        <div className="section-head">
          <h2>注单</h2>
          {slip.length > 0 && (
            <button type="button" className="muted" onClick={clearSlip}>
              清空
            </button>
          )}
        </div>
        <div className="panel">
          {slip.length === 0 ? (
            <p className="empty" style={{ padding: 12 }}>
              点选赔率加入注单
            </p>
          ) : (
            <>
              {slip.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 8,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.selection}</div>
                    <div className="muted" style={{ fontSize: '0.78rem' }}>
                      {b.label} · @{b.odds.toFixed(2)}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={b.stake}
                      onChange={(e) => updateStake(b.id, Number(e.target.value) || 0)}
                      style={{
                        marginTop: 6,
                        width: 120,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid var(--line)',
                        background: 'var(--bg-soft)',
                      }}
                    />
                  </div>
                  <button type="button" className="muted" onClick={() => removeFromSlip(b.id)}>
                    移除
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">合计注额</span>
                <strong>{formatMoney(totalStake, currency)}</strong>
              </div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">潜在返还</span>
                <strong style={{ color: 'var(--brass)' }}>{formatMoney(potential, currency)}</strong>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 14 }}
                onClick={() => {
                  const r = placeSlip()
                  setMsg(r.message)
                }}
              >
                提交试玩注单
              </button>
              {msg && (
                <p className="muted" style={{ marginTop: 10, textAlign: 'center' }}>
                  {msg}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
