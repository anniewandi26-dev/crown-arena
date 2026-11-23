import { useState } from 'react'
import { useClub } from '../store/useClub'
import { randInt } from '../lib/rng'

type Line = 'pass' | 'dont'

export function CrapsGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [bet, setBet] = useState(100)
  const [line, setLine] = useState<Line>('pass')
  const [point, setPoint] = useState<number | null>(null)
  const [dice, setDice] = useState([3, 4])
  const [rolling, setRolling] = useState(false)
  const [msg, setMsg] = useState('先下 Pass 或 Don\'t Pass，再掷出来点')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')
  const [activeBet, setActiveBet] = useState(0)

  const comeOut = point === null

  const roll = () => {
    if (rolling) return

    if (comeOut) {
      if (!debit(bet, `${title} ${line} -${bet}`)) {
        setMsg('余额不足')
        setTone('lose')
        return
      }
      setActiveBet(bet)
    }

    setRolling(true)
    setTone('')
    const tick = setInterval(() => setDice([randInt(1, 6), randInt(1, 6)]), 60)

    setTimeout(() => {
      clearInterval(tick)
      const d = [randInt(1, 6), randInt(1, 6)]
      setDice(d)
      setRolling(false)
      const sum = d[0] + d[1]

      if (comeOut) {
        if (sum === 7 || sum === 11) {
          if (line === 'pass') {
            const win = bet * 2
            credit(win, `${title} Pass 自然点 +${win}`)
            setMsg(`${d.join('+')}=${sum} 自然点 · Pass 赢 +${win}`)
            setTone('win')
          } else {
            setMsg(`${d.join('+')}=${sum} 自然点 · Don't Pass 输`)
            setTone('lose')
          }
          setActiveBet(0)
        } else if (sum === 2 || sum === 3) {
          if (line === 'dont') {
            const win = bet * 2
            credit(win, `${title} Don't Pass +${win}`)
            setMsg(`${d.join('+')}=${sum} Craps · Don't Pass 赢 +${win}`)
            setTone('win')
          } else {
            setMsg(`${d.join('+')}=${sum} Craps · Pass 输`)
            setTone('lose')
          }
          setActiveBet(0)
        } else if (sum === 12) {
          if (line === 'pass') {
            setMsg(`${d.join('+')}=12 Craps · Pass 输`)
            setTone('lose')
            setActiveBet(0)
          } else {
            credit(bet, `${title} 12 点退注 +${bet}`)
            setMsg('12 点 · Don\'t Pass 退注')
            setTone('')
            setActiveBet(0)
          }
        } else {
          setPoint(sum)
          setMsg(`${d.join('+')}=${sum} 立点 ${sum}，继续掷到点或 7`)
          setTone('')
        }
        return
      }

      // Point phase
      if (sum === point) {
        if (line === 'pass') {
          const win = activeBet * 2
          credit(win, `${title} 打中点 +${win}`)
          setMsg(`打中点 ${point} · Pass 赢 +${win}`)
          setTone('win')
        } else {
          setMsg(`打中点 ${point} · Don't Pass 输`)
          setTone('lose')
        }
        setPoint(null)
        setActiveBet(0)
      } else if (sum === 7) {
        if (line === 'dont') {
          const win = activeBet * 2
          credit(win, `${title} 七点出 +${win}`)
          setMsg(`七点出 · Don't Pass 赢 +${win}`)
          setTone('win')
        } else {
          setMsg('七点出 · Pass 输')
          setTone('lose')
        }
        setPoint(null)
        setActiveBet(0)
      } else {
        setMsg(`${d.join('+')}=${sum} · 点 ${point} 未开`)
      }
    }, 850)
  }

  return (
    <div>
      <div className="table-felt">
        <p className="muted" style={{ textAlign: 'center', margin: '0 0 8px' }}>
          {comeOut ? '来点局 Come Out' : `点 Point = ${point}`}
        </p>
        <div className="dice-row">
          {dice.map((n, i) => (
            <div key={i} className={`die${rolling ? ' rolling' : ''}`}>
              {n}
            </div>
          ))}
        </div>
        <p className={`result-banner ${tone}`}>{msg}</p>
      </div>

      <div className="bet-chips">
        <button
          type="button"
          className={line === 'pass' ? 'on' : ''}
          disabled={!comeOut}
          onClick={() => setLine('pass')}
        >
          Pass
        </button>
        <button
          type="button"
          className={line === 'dont' ? 'on' : ''}
          disabled={!comeOut}
          onClick={() => setLine('dont')}
        >
          Don't Pass
        </button>
      </div>

      <div className="bet-chips">
        {[50, 100, 200, 500].map((v) => (
          <button
            key={v}
            type="button"
            className={bet === v ? 'on' : ''}
            disabled={!comeOut}
            onClick={() => setBet(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={roll} disabled={rolling}>
        {rolling ? '掷骰中…' : comeOut ? `掷来点 · ${bet}` : `继续掷 · 点 ${point}`}
      </button>
    </div>
  )
}
