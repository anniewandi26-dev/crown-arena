import { Link } from 'react-router-dom'
import { formatMoney } from '../lib/format'
import { useClub } from '../store/useClub'

export function Profile() {
  const { displayName, setDisplayName, joined, joinClub, activity, currency, balance, resetDemo } =
    useClub()

  return (
    <div className="page wide-pad">
      <div className="section-head">
        <h2>会员</h2>
        <p>{joined ? '已入座' : '访客'}</p>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="field">
          <label>显示名</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!joined && (
            <button type="button" className="btn btn-felt" onClick={joinClub}>
              加入金钥会
            </button>
          )}
          <Link className="btn btn-ghost" to="/rules">
            玩法规则
          </Link>
          <button type="button" className="btn btn-ghost" onClick={resetDemo}>
            重置演示
          </button>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          余额 {formatMoney(balance, currency)} · 数据仅存本机
        </p>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>活动</h2>
        </div>
        <div className="panel">
          <ul className="activity" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {activity.map((a) => (
              <li key={a.id}>
                <span>{a.text}</span>
                {typeof a.amount === 'number' && (
                  <span className={`amt ${a.amount >= 0 ? 'pos' : 'neg'}`}>
                    {a.amount >= 0 ? '+' : ''}
                    {Math.round(a.amount)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
