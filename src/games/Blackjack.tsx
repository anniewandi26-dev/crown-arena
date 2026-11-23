import { useState } from 'react'
import { PlayingCard } from '../components/PlayingCard'
import { useClub } from '../store/useClub'
import { bjValue, freshDeck, type Card } from '../lib/rng'

export function BlackjackGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(100)
  const [deck, setDeck] = useState<Card[]>([])
  const [player, setPlayer] = useState<Card[]>([])
  const [dealer, setDealer] = useState<Card[]>([])
  const [phase, setPhase] = useState<'idle' | 'play' | 'done'>('idle')
  const [msg, setMsg] = useState('')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const deal = () => {
    if (!debit(bet, `${title} 下注 -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    const d = freshDeck(4)
    const p = [d.pop()!, d.pop()!]
    const dl = [d.pop()!, d.pop()!]
    setDeck(d)
    setPlayer(p)
    setDealer(dl)
    setPhase('play')
    setMsg('')
    setTone('')
    if (bjValue(p) === 21) finish(p, dl, d, true)
  }

  const hit = () => {
    if (phase !== 'play') return
    const d = [...deck]
    const p = [...player, d.pop()!]
    setDeck(d)
    setPlayer(p)
    if (bjValue(p) > 21) settle(p, dealer, 'bust')
  }

  const stand = () => {
    if (phase !== 'play') return
    finish(player, dealer, deck, false)
  }

  const finish = (p: Card[], dl: Card[], d: Card[], natural: boolean) => {
    let dealerHand = [...dl]
    let localDeck = [...d]
    while (bjValue(dealerHand) < 17) {
      dealerHand.push(localDeck.pop()!)
    }
    setDealer(dealerHand)
    setDeck(localDeck)
    if (natural && bjValue(p) === 21) {
      const win = Math.round(bet * 2.5)
      credit(win, `${title} Blackjack +${win}`)
      setMsg(`Blackjack！+${win}`)
      setTone('win')
      setPhase('done')
      return
    }
    settle(p, dealerHand)
  }

  const settle = (p: Card[], dl: Card[], reason?: string) => {
    const pv = bjValue(p)
    const dv = bjValue(dl)
    if (reason === 'bust' || pv > 21) {
      setMsg(`爆牌 ${pv}`)
      setTone('lose')
    } else if (dv > 21 || pv > dv) {
      const win = bet * 2
      credit(win, `${title} 获胜 +${win}`)
      setMsg(`你 ${pv} vs 庄 ${dv} · +${win}`)
      setTone('win')
    } else if (pv === dv) {
      credit(bet, `${title} 推注 +${bet}`)
      setMsg(`推注 ${pv}`)
      setTone('')
    } else {
      setMsg(`你 ${pv} vs 庄 ${dv}`)
      setTone('lose')
    }
    setPhase('done')
  }

  return (
    <div>
      <div className="table-felt">
        <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
          庄家 {phase === 'play' ? bjValue([dealer[0]]) + ' + ?' : dealer.length ? bjValue(dealer) : '—'}
        </p>
        <div className="cards-row">
          {dealer.map((c, i) => (
            <PlayingCard key={i} card={c} hidden={phase === 'play' && i === 1} />
          ))}
        </div>
        <p className="muted" style={{ textAlign: 'center', margin: '16px 0 0' }}>
          你 {player.length ? bjValue(player) : '—'}
        </p>
        <div className="cards-row">
          {player.map((c, i) => (
            <PlayingCard key={i} card={c} />
          ))}
        </div>
        <p className={`result-banner ${tone}`}>{msg}</p>
      </div>
      <div className="bet-chips">
        {[50, 100, 200, 500].map((v) => (
          <button
            key={v}
            type="button"
            className={bet === v ? 'on' : ''}
            disabled={phase === 'play'}
            onClick={() => setBet(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {phase !== 'play' ? (
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={deal}>
            发牌 · {bet}
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-felt" style={{ flex: 1 }} onClick={hit}>
              要牌
            </button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={stand}>
              停牌
            </button>
          </>
        )}
      </div>
    </div>
  )
}
