import { useState } from 'react'
import { PlayingCard } from '../components/PlayingCard'
import { useClub } from '../store/useClub'
import { freshDeck, type Card } from '../lib/rng'

type RankScore = { score: number; name: string }

function evaluate(cards: Card[]): RankScore {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a)
  const suits = cards.map((c) => c.suit)
  const count: Record<number, number> = {}
  for (const r of ranks) count[r] = (count[r] ?? 0) + 1
  const groups = Object.entries(count)
    .map(([r, n]) => ({ r: Number(r), n }))
    .sort((a, b) => b.n - a.n || b.r - a.r)

  const isFlush = suits.every((s) => s === suits[0])
  const uniq = [...new Set(ranks)].sort((a, b) => a - b)
  let isStraight = false
  let high = ranks[0]
  if (uniq.length === 5) {
    if (uniq[4] - uniq[0] === 4) {
      isStraight = true
      high = uniq[4]
    }
    if (uniq.join() === '1,2,3,4,5') {
      isStraight = true
      high = 5
    }
  }

  if (isStraight && isFlush) return { score: 800 + high, name: '同花顺' }
  if (groups[0].n === 4) return { score: 700 + groups[0].r, name: '四条' }
  if (groups[0].n === 3 && groups[1]?.n === 2) return { score: 600 + groups[0].r, name: '葫芦' }
  if (isFlush) return { score: 500 + high, name: '同花' }
  if (isStraight) return { score: 400 + high, name: '顺子' }
  if (groups[0].n === 3) return { score: 300 + groups[0].r, name: '三条' }
  if (groups[0].n === 2 && groups[1]?.n === 2)
    return { score: 200 + groups[0].r * 15 + groups[1].r, name: '两对' }
  if (groups[0].n === 2) return { score: 100 + groups[0].r, name: '一对' }
  return { score: high, name: '高牌' }
}

function bestFive(hole: Card[], board: Card[]): RankScore {
  const all = [...hole, ...board]
  if (all.length < 5) return evaluate(all)
  let best: RankScore = { score: -1, name: '' }
  const n = all.length
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++) {
            const hand = [all[a], all[b], all[c], all[d], all[e]]
            const ev = evaluate(hand)
            if (ev.score > best.score) best = ev
          }
  return best
}

export function PokerGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const blinds = 50
  const [phase, setPhase] = useState<'idle' | 'flop' | 'turn' | 'river' | 'done'>('idle')
  const [deck, setDeck] = useState<Card[]>([])
  const [hero, setHero] = useState<Card[]>([])
  const [villain, setVillain] = useState<Card[]>([])
  const [board, setBoard] = useState<Card[]>([])
  const [pot, setPot] = useState(0)
  const [msg, setMsg] = useState('简化单挑：盲注入池，跟注到河牌比牌')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const settle = (nextBoard: Card[], nextPot: number, h: Card[], v: Card[]) => {
    const hs = bestFive(h, nextBoard)
    const vs = bestFive(v, nextBoard)
    if (hs.score > vs.score) {
      credit(nextPot, `${title} 赢底池 +${nextPot}`)
      setMsg(`你 ${hs.name} 胜 对手 ${vs.name} · +${nextPot}`)
      setTone('win')
    } else if (hs.score < vs.score) {
      setMsg(`你 ${hs.name} 负 对手 ${vs.name}`)
      setTone('lose')
    } else {
      const half = Math.round(nextPot / 2)
      credit(half, `${title} 平分 +${half}`)
      setMsg(`双方 ${hs.name} · 平分 +${half}`)
      setTone('')
    }
    setPhase('done')
  }

  const deal = () => {
    const buyIn = blinds * 2
    if (!debit(buyIn, `${title} 盲注 -${buyIn}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    const d = freshDeck(1)
    const h = [d.pop()!, d.pop()!]
    const v = [d.pop()!, d.pop()!]
    setHero(h)
    setVillain(v)
    setBoard([])
    setDeck(d)
    setPot(buyIn * 2)
    setPhase('flop')
    setMsg('底牌已发，跟注看翻牌')
    setTone('')
  }

  const go = (street: 'flop' | 'turn' | 'river') => {
    if (!debit(blinds, `${title} 跟注 -${blinds}`)) {
      setMsg('余额不足，本局弃牌')
      setTone('lose')
      setPhase('idle')
      return
    }
    const d = [...deck]
    d.pop() // burn
    const count = street === 'flop' ? 3 : 1
    const add: Card[] = []
    for (let i = 0; i < count; i++) add.push(d.pop()!)
    const nextBoard = [...board, ...add]
    const nextPot = pot + blinds * 2
    setDeck(d)
    setBoard(nextBoard)
    setPot(nextPot)

    if (street === 'flop') {
      setPhase('turn')
      setMsg('翻牌完成，跟注看转牌')
    } else if (street === 'turn') {
      setPhase('river')
      setMsg('转牌完成，跟注看河牌')
    } else {
      settle(nextBoard, nextPot, hero, villain)
    }
  }

  return (
    <div>
      <div className="table-felt">
        <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
          对手 {phase === 'done' ? bestFive(villain, board).name : '底牌'}
        </p>
        <div className="cards-row">
          {villain.map((c, i) => (
            <PlayingCard key={i} card={c} hidden={phase !== 'done'} />
          ))}
        </div>

        <p className="muted" style={{ textAlign: 'center', margin: '14px 0 4px' }}>
          公共牌 · 底池 {pot}
        </p>
        <div className="cards-row">
          {board.map((c, i) => (
            <PlayingCard key={i} card={c} />
          ))}
          {board.length === 0 && <span className="muted">等待翻牌</span>}
        </div>

        <p className="muted" style={{ textAlign: 'center', margin: '14px 0 4px' }}>
          你的底牌
        </p>
        <div className="cards-row">
          {hero.map((c, i) => (
            <PlayingCard key={i} card={c} />
          ))}
        </div>
        <p className={`result-banner ${tone}`}>{msg}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {phase === 'idle' || phase === 'done' ? (
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={deal}>
            新局 · 盲注 {blinds * 2}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-felt"
              style={{ flex: 1 }}
              onClick={() => go(phase)}
            >
              跟注
              {phase === 'flop' ? '翻牌' : phase === 'turn' ? '转牌' : '河牌'} · {blinds}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMsg('你弃牌')
                setTone('lose')
                setPhase('idle')
              }}
            >
              弃牌
            </button>
          </>
        )}
      </div>
      <p className="muted" style={{ marginTop: 10, fontSize: '0.8rem', textAlign: 'center' }}>
        单挑 AI 示意桌：对手始终跟注到摊牌，便于体验牌力比较。
      </p>
    </div>
  )
}
