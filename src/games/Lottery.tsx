import { useMemo, useState } from 'react'
import { useClub } from '../store/useClub'
import { shuffle } from '../lib/rng'

const PAY: Record<number, number> = {
  3: 2,
  4: 8,
  5: 40,
  6: 300,
}

export function LotteryGame({ title, pickCount = 6 }: { title: string; pickCount?: number }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(20)
  const [picks, setPicks] = useState<number[]>([])
  const [drawn, setDrawn] = useState<number[]>([])
  const [special, setSpecial] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(`选 ${pickCount} 个号码后开奖`)
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const max = pickCount === 5 ? 36 : 49
  const hitSet = useMemo(() => new Set(drawn.filter((n) => picks.includes(n))), [drawn, picks])

  const toggle = (n: number) => {
    if (busy) return
    setDrawn([])
    setSpecial(null)
    setTone('')
    setPicks((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n)
      if (prev.length >= pickCount) return prev
      return [...prev, n].sort((a, b) => a - b)
    })
  }

  const play = () => {
    if (busy || picks.length !== pickCount) return
    if (!debit(bet, `${title} 购彩 -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    setBusy(true)
    setMsg('开奖中…')
    const pool = shuffle(Array.from({ length: max }, (_, i) => i + 1))
    const main = pool.slice(0, pickCount).sort((a, b) => a - b)
    const sp = pool[pickCount]
    let i = 0
    const shown: number[] = []
    const timer = setInterval(() => {
      shown.push(main[i])
      setDrawn([...shown])
      i++
      if (i >= pickCount) {
        clearInterval(timer)
        setSpecial(sp)
        const hits = main.filter((n) => picks.includes(n)).length
        const bonus = picks.includes(sp) ? 1 : 0
        let mult = PAY[hits] ?? 0
        if (hits === pickCount) mult = pickCount === 5 ? 200 : 300
        else if (hits === pickCount - 1 && bonus) mult = Math.max(mult, 20)
        if (mult > 0) {
          const win = bet * mult
          credit(win, `${title} 中${hits}码 +${win}`)
          setMsg(`命中 ${hits}/${pickCount}${bonus ? '+特' : ''} · ×${mult} +${win}`)
          setTone('win')
        } else {
          setMsg(`命中 ${hits}/${pickCount} · 未达派彩`)
          setTone('lose')
        }
        setBusy(false)
      }
    }, 120)
  }

  return (
    <div>
      <div className="table-felt">
        <div className="lotto-board">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
            const picked = picks.includes(n)
            const hit = hitSet.has(n)
            const out = drawn.includes(n)
            const isSp = special === n
            return (
              <button
                key={n}
                type="button"
                className={`lotto-cell${picked ? ' pick' : ''}${out ? ' drawn' : ''}${hit ? ' hit' : ''}${isSp ? ' special' : ''}`}
                onClick={() => toggle(n)}
                disabled={busy}
              >
                {n}
              </button>
            )
          })}
        </div>
        <p className={`result-banner ${tone}`}>{msg}</p>
        {special != null && (
          <p className="muted" style={{ textAlign: 'center' }}>
            特别号 {special}
          </p>
        )}
      </div>
      <p className="muted" style={{ textAlign: 'center' }}>
        已选 {picks.length}/{pickCount}
        {picks.length ? `：${picks.join(', ')}` : ''}
      </p>
      <div className="bet-chips">
        {[10, 20, 50, 100].map((v) => (
          <button key={v} type="button" className={bet === v ? 'on' : ''} disabled={busy} onClick={() => setBet(v)}>
            {v}
          </button>
        ))}
        <button type="button" disabled={busy} onClick={() => setPicks([])}>
          清空
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            setPicks(
              shuffle(Array.from({ length: max }, (_, i) => i + 1))
                .slice(0, pickCount)
                .sort((a, b) => a - b),
            )
          }
        >
          机选
        </button>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={play}
        disabled={busy || picks.length !== pickCount}
      >
        {busy ? '开奖中…' : `开奖 · ${bet}`}
      </button>
    </div>
  )
}
