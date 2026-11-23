import { useMemo, useState } from 'react'
import { useClub } from '../store/useClub'
import { shuffle } from '../lib/rng'

function makeCard() {
  const pool = Array.from({ length: 75 }, (_, i) => i + 1)
  return shuffle(pool).slice(0, 24)
}

export function BingoGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(40)
  const [card, setCard] = useState(() => makeCard())
  const [called, setCalled] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState('买卡后自动叫号，5 个命中即中小奖')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const marked = useMemo(() => new Set(called.filter((n) => card.includes(n))), [called, card])

  const cells = useMemo(() => {
    const c = [...card]
    c.splice(12, 0, 0) // free center
    return c
  }, [card])

  const buy = () => {
    if (running) return
    if (!debit(bet, `${title} 购卡 -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    const nextCard = makeCard()
    setCard(nextCard)
    setCalled([])
    setRunning(true)
    setMsg('叫号中…')
    setTone('')

    const order = shuffle(Array.from({ length: 75 }, (_, i) => i + 1))
    let i = 0
    const drawn: number[] = []

    const timer = setInterval(() => {
      drawn.push(order[i])
      setCalled([...drawn])
      i++
      const hits = drawn.filter((n) => nextCard.includes(n)).length

      if (hits >= 5 || i >= 30) {
        clearInterval(timer)
        setRunning(false)
        if (hits >= 12) {
          const win = bet * 20
          credit(win, `${title} 宾果大奖 +${win}`)
          setMsg(`命中 ${hits}/24 · 大奖 +${win}`)
          setTone('win')
        } else if (hits >= 8) {
          const win = bet * 6
          credit(win, `${title} 连线奖 +${win}`)
          setMsg(`命中 ${hits}/24 · 连线 +${win}`)
          setTone('win')
        } else if (hits >= 5) {
          const win = bet * 2
          credit(win, `${title} 小奖 +${win}`)
          setMsg(`命中 ${hits}/24 · 小奖 +${win}`)
          setTone('win')
        } else {
          setMsg(`命中 ${hits}/24 · 未达派彩线`)
          setTone('lose')
        }
      }
    }, 120)
  }

  return (
    <div>
      <div className="table-felt">
        <div className="bingo-grid">
          {cells.map((n, idx) =>
            n === 0 ? (
              <div key="free" className="bingo-cell free">
                ★
              </div>
            ) : (
              <div key={`${n}-${idx}`} className={`bingo-cell${marked.has(n) ? ' on' : ''}`}>
                {n}
              </div>
            ),
          )}
        </div>
        <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
          已叫 {called.length} 号
          {called.length > 0 ? ` · 最新 ${called[called.length - 1]}` : ''}
        </p>
        <p className={`result-banner ${tone}`}>{msg}</p>
      </div>

      <div className="bet-chips">
        {[20, 40, 80, 160].map((v) => (
          <button
            key={v}
            type="button"
            className={bet === v ? 'on' : ''}
            disabled={running}
            onClick={() => setBet(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={buy} disabled={running}>
        {running ? '叫号中…' : `购卡开局 · ${bet}`}
      </button>
    </div>
  )
}
