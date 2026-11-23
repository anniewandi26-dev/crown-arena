import { useMemo, useState } from 'react'
import { useClub } from '../store/useClub'
import { shuffle } from '../lib/rng'

const PAY: Record<number, Record<number, number>> = {
  1: { 1: 3 },
  2: { 2: 12 },
  3: { 2: 2, 3: 42 },
  4: { 2: 1, 3: 4, 4: 100 },
  5: { 3: 3, 4: 12, 5: 800 },
  6: { 3: 2, 4: 6, 5: 50, 6: 1500 },
  7: { 3: 1, 4: 4, 5: 20, 6: 100, 7: 2000 },
  8: { 4: 3, 5: 10, 6: 50, 7: 500, 8: 5000 },
}

export function KenoGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(50)
  const [picks, setPicks] = useState<number[]>([])
  const [drawn, setDrawn] = useState<number[]>([])
  const [drawing, setDrawing] = useState(false)
  const [msg, setMsg] = useState('选 1–8 个号码，开出 20 个')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const hitSet = useMemo(() => new Set(drawn.filter((n) => picks.includes(n))), [drawn, picks])

  const toggle = (n: number) => {
    if (drawing) return
    setPicks((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n)
      if (prev.length >= 8) return prev
      return [...prev, n].sort((a, b) => a - b)
    })
    setDrawn([])
    setMsg('选 1–8 个号码，开出 20 个')
    setTone('')
  }

  const play = () => {
    if (drawing || picks.length === 0) return
    if (!debit(bet, `${title} 选号 -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    setDrawing(true)
    setDrawn([])
    setTone('')
    const order = shuffle(Array.from({ length: 80 }, (_, i) => i + 1)).slice(0, 20)
    let i = 0
    const seen: number[] = []
    const timer = setInterval(() => {
      seen.push(order[i])
      setDrawn([...seen])
      i++
      if (i >= 20) {
        clearInterval(timer)
        setDrawing(false)
        const hits = order.filter((n) => picks.includes(n)).length
        const table = PAY[picks.length] ?? {}
        const mult = table[hits] ?? 0
        if (mult > 0) {
          const win = bet * mult
          credit(win, `${title} 中 ${hits} 号 +${win}`)
          setMsg(`命中 ${hits}/${picks.length} · ×${mult} +${win}`)
          setTone('win')
        } else {
          setMsg(`命中 ${hits}/${picks.length} · 未达赔付`)
          setTone('lose')
        }
      }
    }, 80)
  }

  return (
    <div>
      <div className="table-felt">
        <div className="keno-board">
          {Array.from({ length: 80 }, (_, i) => i + 1).map((n) => {
            const picked = picks.includes(n)
            const hit = hitSet.has(n)
            const out = drawn.includes(n)
            return (
              <button
                key={n}
                type="button"
                className={`keno-cell${picked ? ' pick' : ''}${out ? ' drawn' : ''}${hit ? ' hit' : ''}`}
                onClick={() => toggle(n)}
                disabled={drawing}
              >
                {n}
              </button>
            )
          })}
        </div>
        <p className={`result-banner ${tone}`}>{msg}</p>
      </div>

      <p className="muted" style={{ textAlign: 'center' }}>
        已选 {picks.length}/8{picks.length ? `：${picks.join(', ')}` : ''}
      </p>

      <div className="bet-chips">
        {[20, 50, 100, 200].map((v) => (
          <button
            key={v}
            type="button"
            className={bet === v ? 'on' : ''}
            disabled={drawing}
            onClick={() => setBet(v)}
          >
            {v}
          </button>
        ))}
        <button type="button" disabled={drawing} onClick={() => setPicks([])}>
          清空
        </button>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={play}
        disabled={drawing || picks.length === 0}
      >
        {drawing ? '开奖中…' : `开奖 · ${bet}`}
      </button>
    </div>
  )
}
