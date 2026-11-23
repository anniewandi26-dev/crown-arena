import { useState } from 'react'
import { useClub } from '../store/useClub'
import { randInt } from '../lib/rng'

type BetSide = 'big' | 'small' | 'triple' | 'total'

export function SicBoGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(50)
  const [side, setSide] = useState<BetSide>('big')
  const [totalPick, setTotalPick] = useState(10)
  const [dice, setDice] = useState([1, 2, 3])
  const [rolling, setRolling] = useState(false)
  const [msg, setMsg] = useState('')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  const roll = () => {
    if (rolling) return
    if (!debit(bet, `${title} 下注(${side}) -${bet}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    setRolling(true)
    setMsg('')
    setTone('')

    const tick = setInterval(() => {
      setDice([randInt(1, 6), randInt(1, 6), randInt(1, 6)])
    }, 70)

    setTimeout(() => {
      clearInterval(tick)
      const d = [randInt(1, 6), randInt(1, 6), randInt(1, 6)]
      setDice(d)
      setRolling(false)
      const sum = d[0] + d[1] + d[2]
      const isTriple = d[0] === d[1] && d[1] === d[2]
      let hit = false
      let mult = 0

      if (side === 'triple') {
        hit = isTriple
        mult = 30
      } else if (side === 'total') {
        hit = sum === totalPick
        mult = totalPick === 10 || totalPick === 11 ? 6 : totalPick <= 5 || totalPick >= 16 ? 18 : 8
      } else if (side === 'big') {
        hit = !isTriple && sum >= 11
        mult = 2
      } else {
        hit = !isTriple && sum <= 10
        mult = 2
      }

      if (hit) {
        const win = Math.round(bet * mult)
        credit(win, `${title} 中奖 +${win}`)
        setMsg(`${d.join(' · ')} = ${sum}${isTriple ? ' 围骰' : ''} · +${win}`)
        setTone('win')
      } else {
        setMsg(`${d.join(' · ')} = ${sum}${isTriple ? ' 围骰' : ''}`)
        setTone('lose')
      }
    }, 900)
  }

  return (
    <div>
      <div className="table-felt">
        <div className="dice-row">
          {dice.map((n, i) => (
            <div key={i} className={`die${rolling ? ' rolling' : ''}`}>
              {n}
            </div>
          ))}
        </div>
        <p className={`result-banner ${tone}`}>{msg || '大 / 小 / 围骰 / 点数'}</p>
      </div>

      <div className="bet-chips">
        {(
          [
            ['big', '大 11–17'],
            ['small', '小 4–10'],
            ['triple', '围骰'],
            ['total', '点数'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" className={side === k ? 'on' : ''} onClick={() => setSide(k)}>
            {label}
          </button>
        ))}
      </div>

      {side === 'total' && (
        <div className="bet-chips">
          {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((n) => (
            <button
              key={n}
              type="button"
              className={totalPick === n ? 'on' : ''}
              onClick={() => setTotalPick(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <div className="bet-chips">
        {[20, 50, 100, 200, 500].map((v) => (
          <button key={v} type="button" className={bet === v ? 'on' : ''} onClick={() => setBet(v)}>
            {v}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={roll} disabled={rolling}>
        {rolling ? '摇骰中…' : `摇骰 · ${bet}`}
      </button>
    </div>
  )
}
