import { useState } from 'react'
import { useClub } from '../store/useClub'
import { randInt } from '../lib/rng'

type BetKind = 'red' | 'black' | 'odd' | 'even' | 'number'

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

export function RouletteGame({ title, american = false }: { title: string; american?: boolean }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(50)
  const [kind, setKind] = useState<BetKind>('red')
  const [number, setNumber] = useState(7)
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [hub, setHub] = useState<string>('—')
  const [msg, setMsg] = useState('')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const maxN = american ? 37 : 36 // 37 => treat as 00 display only for spin range

  const spin = () => {
    if (spinning) return
    if (!debit(bet, `${title} 下注 -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    setSpinning(true)
    setMsg('')
    setTone('')
    const n = american ? randInt(0, 37) : randInt(0, 36)
    const display = n === 37 ? '00' : String(n)
    setAngle((a) => a + 1080 + n * 10)
    setTimeout(() => {
      setHub(display)
      setSpinning(false)
      const value = n === 37 ? 0 : n
      const isRed = RED.has(value)
      const isBlack = value !== 0 && !isRed
      let hit = false
      let mult = 0
      if (kind === 'red' && isRed) {
        hit = true
        mult = 2
      } else if (kind === 'black' && isBlack) {
        hit = true
        mult = 2
      } else if (kind === 'odd' && value % 2 === 1) {
        hit = true
        mult = 2
      } else if (kind === 'even' && value !== 0 && value % 2 === 0) {
        hit = true
        mult = 2
      } else if (kind === 'number' && value === number) {
        hit = true
        mult = 36
      }

      if (hit) {
        const win = bet * mult
        credit(win, `${title} 中奖 +${win}`)
        setMsg(`${display} · +${win}`)
        setTone('win')
      } else {
        setMsg(`${display} · 未中`)
        setTone('lose')
      }
    }, 2400)
  }

  return (
    <div>
      <div className="table-felt">
        <div className="roulette-wheel" style={{ transform: `rotate(${angle}deg)` }}>
          <div className="hub">{hub}</div>
        </div>
        <p className={`result-banner ${tone}`}>{msg || (american ? '双零美式' : '单零欧式')}</p>
      </div>
      <div className="bet-chips">
        {(
          [
            ['red', '红'],
            ['black', '黑'],
            ['odd', '单'],
            ['even', '双'],
            ['number', '直注'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>
            {label}
          </button>
        ))}
      </div>
      {kind === 'number' && (
        <div className="field">
          <label>号码 0–{american ? '00/36' : 36}</label>
          <input
            type="number"
            min={0}
            max={maxN}
            value={number}
            onChange={(e) => setNumber(Number(e.target.value) || 0)}
          />
        </div>
      )}
      <div className="bet-chips">
        {[20, 50, 100, 200].map((v) => (
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
        {spinning ? '旋转中…' : `旋转 · ${bet}`}
      </button>
    </div>
  )
}
