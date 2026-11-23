import { useState } from 'react'
import { PlayingCard } from '../components/PlayingCard'
import { useClub } from '../store/useClub'
import { freshDeck, type Card } from '../lib/rng'

type Phase = 'idle' | 'decide' | 'done'

type HandRank = { score: number; name: string }

function sortedRanks(cards: Card[]) {
  return cards.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a)
}

function evaluateThree(cards: Card[]): HandRank {
  const ranks = sortedRanks(cards)
  const suits = cards.map((c) => c.suit)
  const flush = suits.every((s) => s === suits[0])
  const uniq = [...new Set(ranks)].sort((a, b) => a - b)
  let straight = uniq.length === 3 && uniq[2] - uniq[0] === 2
  // A-2-3 wheel
  const wheel =
    ranks.includes(14) && ranks.includes(2) && ranks.includes(3) && uniq.length === 3
  if (wheel) straight = true

  const counts: Record<number, number> = {}
  for (const r of ranks) counts[r] = (counts[r] ?? 0) + 1
  const trips = Object.values(counts).includes(3)
  const pair = Object.values(counts).includes(2)
  const pairRank = Number(Object.entries(counts).find(([, n]) => n === 2)?.[0] ?? 0)
  const high = ranks[0]

  if (straight && flush) return { score: 600 + (wheel ? 5 : high), name: '同花顺' }
  if (trips) return { score: 500 + ranks[0], name: '三条' }
  if (straight) return { score: 400 + (wheel ? 5 : high), name: '顺子' }
  if (flush) return { score: 300 + high * 20 + ranks[1], name: '同花' }
  if (pair) return { score: 200 + pairRank * 15 + ranks.find((r) => r !== pairRank)!, name: '一对' }
  return { score: 100 + high * 20 + ranks[1] * 2 + ranks[2], name: '高牌' }
}

/** Dealer qualifies with Queen-high or better */
function qualifies(cards: Card[]) {
  const r = evaluateThree(cards)
  if (r.score >= 200) return true // pair+
  const high = sortedRanks(cards)[0]
  return high >= 12
}

/** Ante bonus pays regardless of dealer hand when player has straight+ */
function anteBonusMult(name: string) {
  if (name === '同花顺') return 5
  if (name === '三条') return 4
  if (name === '顺子') return 1
  return 0
}

export function ThreeCardPokerGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [ante, setAnte] = useState(50)
  const [pairPlus, setPairPlus] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [player, setPlayer] = useState<Card[]>([])
  const [dealer, setDealer] = useState<Card[]>([])
  const [msg, setMsg] = useState('先下 Ante，可选 Pair Plus；看牌后跟注或弃牌')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')
  const [showDealer, setShowDealer] = useState(false)

  const deal = () => {
    const total = ante + pairPlus
    if (total <= 0) return
    if (!debit(total, `${title} Ante/PP -${total}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    const d = freshDeck(1)
    const p = [d.pop()!, d.pop()!, d.pop()!]
    const dl = [d.pop()!, d.pop()!, d.pop()!]
    setPlayer(p)
    setDealer(dl)
    setShowDealer(false)
    setPhase('decide')
    setTone('')
    const ph = evaluateThree(p)
    setMsg(`你的牌：${ph.name}。跟注 Play（等于 Ante）或弃牌。`)
  }

  const fold = () => {
    setShowDealer(true)
    setPhase('done')
    setMsg('弃牌，Ante 与 Pair Plus 已输掉')
    setTone('lose')
  }

  const play = () => {
    if (!debit(ante, `${title} Play -${ante}`)) {
      setMsg('余额不足，无法跟注')
      setTone('lose')
      return
    }
    setShowDealer(true)
    const ph = evaluateThree(player)
    const dh = evaluateThree(dealer)
    let payout = 0
    const notes: string[] = []

    // Pair Plus settles on player hand alone
    if (pairPlus > 0) {
      const ppMult =
        ph.name === '同花顺'
          ? 40
          : ph.name === '三条'
            ? 30
            : ph.name === '顺子'
              ? 6
              : ph.name === '同花'
                ? 3
                : ph.name === '一对'
                  ? 1
                  : 0
      if (ppMult > 0) {
        const w = pairPlus * (ppMult + 1)
        payout += w
        notes.push(`Pair+ ${ph.name} +${w}`)
      } else {
        notes.push('Pair+ 未中')
      }
    }

    const bonus = anteBonusMult(ph.name)
    if (bonus > 0) {
      const w = ante * bonus
      payout += w
      notes.push(`Ante Bonus ×${bonus} +${w}`)
    }

    if (!qualifies(dealer)) {
      // Ante pays 1:1, Play pushes
      const w = ante * 2
      payout += w + ante // return play stake
      notes.push('庄未合格 · Ante 赢，Play 退还')
      credit(payout, `${title} 结算 +${payout}`)
      setMsg(`你 ${ph.name} · 庄 ${dh.name}（未合格）。${notes.join('；')}`)
      setTone('win')
    } else if (ph.score > dh.score) {
      // Ante + Play both 1:1
      const w = ante * 2 + ante * 2
      payout += w
      notes.push('击败庄家')
      credit(payout, `${title} 赢 +${payout}`)
      setMsg(`你 ${ph.name} 胜 庄 ${dh.name}。${notes.join('；')} · +${payout}`)
      setTone('win')
    } else if (ph.score < dh.score) {
      if (payout > 0) credit(payout, `${title} 部分派彩 +${payout}`)
      notes.push('负于庄家')
      setMsg(`你 ${ph.name} 负 庄 ${dh.name}。${notes.join('；')}`)
      setTone(payout > 0 ? 'win' : 'lose')
    } else {
      // push ante+play
      const push = ante * 2
      payout += push
      notes.push('平局退还 Ante+Play')
      credit(payout, `${title} 平局 +${payout}`)
      setMsg(`双方 ${ph.name}。${notes.join('；')}`)
      setTone('')
    }
    setPhase('done')
  }

  return (
    <div>
      <div className="table-felt">
        <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
          庄家 {showDealer && dealer.length ? evaluateThree(dealer).name : '三张'}
          {showDealer && dealer.length && !qualifies(dealer) ? ' · 未合格' : ''}
        </p>
        <div className="cards-row">
          {(dealer.length ? dealer : [0, 1, 2]).map((c, i) =>
            typeof c === 'number' ? (
              <PlayingCard key={i} hidden />
            ) : (
              <PlayingCard key={i} card={c} hidden={!showDealer} />
            ),
          )}
        </div>

        <p className="muted" style={{ textAlign: 'center', margin: '16px 0 4px' }}>
          你 {player.length ? evaluateThree(player).name : '—'}
        </p>
        <div className="cards-row">
          {(player.length ? player : [0, 1, 2]).map((c, i) =>
            typeof c === 'number' ? (
              <PlayingCard key={i} hidden />
            ) : (
              <PlayingCard key={i} card={c} />
            ),
          )}
        </div>
        <p className={`result-banner ${tone}`}>{msg}</p>
      </div>

      {phase === 'idle' || phase === 'done' ? (
        <>
          <div className="field">
            <label>Ante（底注）</label>
            <div className="bet-chips">
              {[25, 50, 100, 200].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={ante === v ? 'on' : ''}
                  onClick={() => setAnte(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Pair Plus（可选边注）</label>
            <div className="bet-chips">
              {[0, 25, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={pairPlus === v ? 'on' : ''}
                  onClick={() => setPairPlus(v)}
                >
                  {v === 0 ? '无' : v}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={deal}>
            发三张 · {ante + pairPlus}
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={fold}>
            弃牌
          </button>
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={play}>
            跟注 Play · {ante}
          </button>
        </div>
      )}
    </div>
  )
}
