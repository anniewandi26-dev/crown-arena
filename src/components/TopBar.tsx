import { useState } from 'react'
import type { Currency } from '../types'
import { formatMoney } from '../lib/format'
import { useClub } from '../store/useClub'

const CURRENCIES: Currency[] = ['CNY', 'MYR', 'USDT']

export function TopBar() {
  const { balance, currency, hideBalance, setCurrency, toggleHide } = useClub()
  const [openFx, setOpenFx] = useState(false)

  return (
    <header className="top-bar">
      <div className="brand-mark">
        <div className="logo">钥</div>
        <div className="name">
          金钥会
          <small>AUREUM</small>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <button className="chip" type="button" onClick={() => setOpenFx((v) => !v)}>
          {currency === 'CNY' ? '🇨🇳' : currency === 'MYR' ? '🇲🇾' : '₮'} {currency}
        </button>
        {openFx && (
          <div
            className="panel"
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              zIndex: 30,
              minWidth: 120,
              padding: 8,
            }}
          >
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                className="nav-item"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: c === currency ? 'rgba(212,180,131,0.12)' : 'transparent',
                }}
                onClick={() => {
                  setCurrency(c)
                  setOpenFx(false)
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="chip balance" type="button" onClick={toggleHide} title="显示/隐藏余额">
        {hideBalance ? '••••' : formatMoney(balance, currency, true)}
      </button>
    </header>
  )
}
