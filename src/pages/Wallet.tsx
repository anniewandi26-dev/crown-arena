import { useState } from 'react'
import { formatMoney } from '../lib/format'
import { useClub } from '../store/useClub'

export function Wallet() {
  const { balance, currency, credit, debit } = useClub()
  const [amount, setAmount] = useState(1000)
  const [method, setMethod] = useState<'card' | 'usdt' | 'bank'>('usdt')
  const [note, setNote] = useState('')

  return (
    <div className="page wide-pad">
      <div className="section-head">
        <h2>钱包</h2>
        <p>沙盒充提 · 本地余额</p>
      </div>

      <div className="wallet-grid">
        <div className="stat">
          <div className="label">可用试玩金</div>
          <div className="value">{formatMoney(balance, currency)}</div>
        </div>
        <div className="stat">
          <div className="label">支付通道</div>
          <div className="value" style={{ fontSize: '1.1rem', marginTop: 10 }}>
            卡 / USDT / 银行示意
          </div>
        </div>
      </div>

      <section className="section">
        <div className="panel">
          <div className="field">
            <label>金额（按 CNY 本位记账）</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="field">
            <label>方式</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
              <option value="usdt">USDT 沙盒</option>
              <option value="card">银行卡示意</option>
              <option value="bank">本地银行示意</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                credit(amount, `充值示意（${method}）+${amount}`)
                setNote(`已记入试玩金 ${amount}`)
              }}
            >
              充值
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const ok = debit(amount, `提现示意（${method}）-${amount}`)
                setNote(ok ? `已扣减试玩金 ${amount}` : '余额不足')
              }}
            >
              提现
            </button>
          </div>
          {note && (
            <p className="muted" style={{ marginTop: 12 }}>
              {note}
            </p>
          )}
        </div>
      </section>

      <p className="disclaimer">
        充提仅为界面演示：不会发起链上转账或真实收单。余额保存在本机 localStorage。
      </p>
    </div>
  )
}
