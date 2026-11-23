import { useState } from 'react'
import { PlayingCard, rankLabel } from '../components/PlayingCard'
import { useClub } from '../store/useClub'
import { freshDeck, type Card } from '../lib/rng'

type Side = 'dragon' | 'tiger' | 'tie'

/** Dragon Tiger: Ace high (14). Suit ignored for main bet. */
function power(c: Card) {
  return c.rank === 1 ? 14 : c.rank
}

export function DragonTigerGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(100)
  const [side, setSide] = useState<Side>('dragon')
  const [dragon, setDragon] = useState<Card | null>(null)
  const [tiger, setTiger] = useState<Card | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [dealing, setDealing] = useState(false)
  const [msg, setMsg] = useState('龙虎各一张，点数大者胜；和局赔 8:1')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const deal = () => {
    if (dealing) return
    if (!debit(bet, `${title} 下注(${side}) -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    setDealing(true)
    setRevealed(false)
    setTone('')
    setMsg('发牌中…')

    const d = freshDeck(8)
    const dc = d.pop()!
    const tc = d.pop()!
    setDragon(dc)
    setTiger(tc)

    setTimeout(() => {
      setRevealed(true)
      const dp = power(dc)
      const tp = power(tc)
      const winner: Side = dp === tp ? 'tie' : dp > tp ? 'dragon' : 'tiger'

      if (winner === side) {
        const mult = side === 'tie' ? 9 : 2
        const win = Math.round(bet * mult)
        credit(win, `${title} 赢 +${win}`)
        setMsg(
          `龙 ${rankLabel(dc.rank)} · 虎 ${rankLabel(tc.rank)} · ${
            winner === 'tie' ? '和' : winner === 'dragon' ? '龙胜' : '虎胜'
          } · +${win}`,
        )
        setTone('win')
      } else if (winner === 'tie' && side !== 'tie') {
        // Standard: main bets lose on tie (house edge). Some rooms push — we follow common casino lose-on-tie.
        setMsg(`龙 ${rankLabel(dc.rank)} · 虎 ${rankLabel(tc.rank)} · 和局（龙/虎注作废）`)
        setTone('lose')
      } else {
        setMsg(
          `龙 ${rankLabel(dc.rank)} · 虎 ${rankLabel(tc.rank)} · ${
            winner === 'dragon' ? '龙胜' : '虎胜'
          }`,
        )
        setTone('lose')
      }
      setDealing(false)
    }, 650)
  }

  return (
    <div>
      <div className="table-felt">
        <div className="dt-table">
          <div className="dt-side">
            <div className="dt-label">龙 Dragon</div>
            <PlayingCard card={dragon ?? undefined} hidden={!revealed && !!dragon} />
          </div>
          <div className="dt-vs">VS</div>
          <div className="dt-side">
            <div className="dt-label">虎 Tiger</div>
            <PlayingCard card={tiger ?? undefined} hidden={!revealed && !!tiger} />
          </div>
        </div>
        <p className={`result-banner ${tone}`}>{msg}</p>
      </div>

      <div className="bet-chips">
        {(
          [
            ['dragon', '龙 1:1'],
            ['tiger', '虎 1:1'],
            ['tie', '和 8:1'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={side === k ? 'on' : ''}
            disabled={dealing}
            onClick={() => setSide(k)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bet-chips">
        {[50, 100, 200, 500, 1000].map((v) => (
          <button
            key={v}
            type="button"
            className={bet === v ? 'on' : ''}
            disabled={dealing}
            onClick={() => setBet(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={deal}
        disabled={dealing}
      >
        {dealing ? '开牌中…' : `开牌 · ${bet}`}
      </button>
    </div>
  )
}
