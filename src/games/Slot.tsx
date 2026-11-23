import { useEffect, useMemo, useState } from 'react'
import { useClub } from '../store/useClub'
import { rand, pick } from '../lib/rng'
import { SLOT_CATALOG } from '../data/slots'

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '7️⃣', '💎', '🐉']

export function SlotGame({ title, gameId }: { title: string; gameId?: string }) {
  const { debit, credit } = useClub()
  const def = useMemo(() => SLOT_CATALOG.find((s) => s.id === gameId), [gameId])
  const reelCount = def?.reels ?? 3
  const symbols = def?.symbols ?? DEFAULT_SYMBOLS
  const progressive = !!def?.progressive
  const isBonus = def?.type === 'bonus' || def?.type === 'megaways'

  const [bet, setBet] = useState(50)
  const [reels, setReels] = useState<string[]>(() =>
    Array.from({ length: reelCount }, () => pick(symbols)),
  )
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState('')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')
  const [jackpot, setJackpot] = useState(125000)

  useEffect(() => {
    setReels(Array.from({ length: reelCount }, () => pick(symbols)))
  }, [reelCount, symbols])

  useEffect(() => {
    if (!progressive) return
    const t = setInterval(() => setJackpot((j) => j + Math.floor(Math.random() * 18) + 3), 1200)
    return () => clearInterval(t)
  }, [progressive])

  const spin = () => {
    if (spinning) return
    if (!debit(bet, `${title} 旋转 -${bet}`)) {
      setResult('余额不足')
      setTone('lose')
      return
    }
    if (progressive) setJackpot((j) => j + Math.round(bet * 0.05))

    setSpinning(true)
    setResult('')
    setTone('')
    const timer = setInterval(() => {
      setReels(Array.from({ length: reelCount }, () => pick(symbols)))
    }, 70)

    setTimeout(() => {
      clearInterval(timer)
      const final = Array.from({ length: reelCount }, () => pick(symbols))
      // Soft line bias
      if (rand() < 0.18) {
        const s = pick(symbols)
        for (let i = 0; i < final.length; i++) final[i] = s
      } else if (rand() < 0.3) {
        final[1] = final[0]
        if (reelCount >= 5 && rand() < 0.4) final[2] = final[0]
      }
      setReels(final)
      setSpinning(false)

      const line = final.slice(0, Math.min(3, final.length))
      const all3 = line.every((x) => x === line[0])
      const pair = line[0] === line[1] || line[1] === line[2]
      const sevens = final.filter((x) => x === '7️⃣').length

      let mult = 0
      let note = ''

      if (progressive && sevens >= 3) {
        const pot = Math.round(jackpot * (0.08 + rand() * 0.12))
        setJackpot((j) => Math.max(50000, j - pot))
        credit(pot, `${title} 奖池 +${pot}`)
        setResult(`累积奖池击中 · +${pot}`)
        setTone('win')
        return
      }

      if (all3) {
        mult = line[0] === '7️⃣' || line[0] === '💎' || line[0] === '🐉' ? 14 : 6
        note = '三连'
      } else if (reelCount === 5 && final.filter((x) => x === final[0]).length >= 4) {
        mult = 8
        note = '四连'
      } else if (pair) {
        mult = 1.5
        note = '两连'
      }

      if (isBonus && mult > 0 && rand() < 0.35) {
        mult = Math.round(mult * 1.8 * 10) / 10
        note += ' · 奖励加成'
      }

      if (mult > 0) {
        const win = Math.round(bet * mult)
        credit(win, `${title} 中奖 +${win}`)
        setResult(`${note} ×${mult} · +${win}`)
        setTone('win')
      } else {
        setResult('未中线')
        setTone('lose')
      }
    }, 1200)
  }

  return (
    <div>
      {progressive && (
        <div className="jackpot-banner">
          <span>累积奖池</span>
          <strong>{jackpot.toLocaleString()}</strong>
        </div>
      )}
      <div className="table-felt">
        <div className={`slot-reels cols-${reelCount}`}>
          {reels.map((s, i) => (
            <div key={i} className={`slot-reel${spinning ? ' spinning' : ''}`}>
              <span className="slot-sym">{s}</span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ textAlign: 'center', marginTop: 8 }}>
          {reelCount} 轴
          {def ? ` · ${def.volatility}波动 · RTP ${def.rtp}%` : ''}
          {def?.studio ? ` · ${def.studio}` : ''}
        </p>
        <p className={`result-banner ${tone}`}>
          {result || (reelCount === 3 ? '三连同符即大奖' : '左起连线；奖池机看 7️⃣')}
        </p>
      </div>
      <div className="bet-chips">
        {[20, 50, 100, 200, 500].map((v) => (
          <button key={v} type="button" className={bet === v ? 'on' : ''} onClick={() => setBet(v)}>
            {v}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={spin}
        disabled={spinning}
      >
        {spinning ? '旋转中…' : `旋转 · 注 ${bet}`}
      </button>
    </div>
  )
}
