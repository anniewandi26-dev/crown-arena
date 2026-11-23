import { useState } from 'react'
import { PlayingCard } from '../components/PlayingCard'
import { useClub } from '../store/useClub'
import { bacPoint, freshDeck, type Card } from '../lib/rng'

type Side = 'player' | 'banker' | 'tie'

export function BaccaratGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(100)
  const [side, setSide] = useState<Side>('player')
  const [player, setPlayer] = useState<Card[]>([])
  const [banker, setBanker] = useState<Card[]>([])
  const [msg, setMsg] = useState('')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const deal = () => {
    if (!debit(bet, `${title} 下注(${side}) -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    const d = freshDeck(6)
    let p = [d.pop()!, d.pop()!]
    let b = [d.pop()!, d.pop()!]
    let pp = bacPoint(p)
    let bp = bacPoint(b)

    // Simplified third-card rules
    if (pp < 8 && bp < 8) {
      if (pp <= 5) {
        p = [...p, d.pop()!]
        pp = bacPoint(p)
      }
      if (bp <= 5) {
        b = [...b, d.pop()!]
        bp = bacPoint(b)
      }
    }

    setPlayer(p)
    setBanker(b)

    const winner: Side = pp === bp ? 'tie' : pp > bp ? 'player' : 'banker'
    if (winner === side) {
      const mult = side === 'tie' ? 9 : side === 'banker' ? 1.95 : 2
      const win = Math.round(bet * mult)
      credit(win, `${title} 赢 +${win}`)
      setMsg(`闲 ${pp} · 庄 ${bp} · 你赢 +${win}`)
      setTone('win')
    } else if (winner === 'tie' && side !== 'tie') {
      credit(bet, `${title} 和局退注 +${bet}`)
      setMsg(`和局 ${pp} · 退注`)
      setTone('')
    } else {
      setMsg(`闲 ${pp} · 庄 ${bp}`)
      setTone('lose')
    }
  }

  return (
    <div>
      <div className="table-felt">
        <p className="muted" style={{ textAlign: 'center' }}>
          庄 {banker.length ? bacPoint(banker) : '—'}
        </p>
        <div className="cards-row">
          {banker.map((c, i) => (
            <PlayingCard key={i} card={c} />
          ))}
        </div>
        <p className="muted" style={{ textAlign: 'center', marginTop: 16 }}>
          闲 {player.length ? bacPoint(player) : '—'}
        </p>
        <div className="cards-row">
          {player.map((c, i) => (
            <PlayingCard key={i} card={c} />
          ))}
        </div>
        <p className={`result-banner ${tone}`}>{msg || '选择闲 / 庄 / 和'}</p>
      </div>
      <div className="bet-chips">
        {(
          [
            ['player', '闲'],
            ['banker', '庄'],
            ['tie', '和'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" className={side === k ? 'on' : ''} onClick={() => setSide(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="bet-chips">
        {[50, 100, 200, 500].map((v) => (
          <button key={v} type="button" className={bet === v ? 'on' : ''} onClick={() => setBet(v)}>
            {v}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={deal}>
        开牌 · {bet}
      </button>
    </div>
  )
}
