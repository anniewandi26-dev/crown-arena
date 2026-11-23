import { useEffect, useMemo, useState } from 'react'
import { useClub } from '../store/useClub'
import { rand, randInt } from '../lib/rng'

type Fish = {
  id: number
  emoji: string
  name: string
  mult: number
  x: number
  y: number
  vx: number
}

const SPECIES = [
  { emoji: '🐟', name: '小鱼', mult: 1.2, w: 0.45 },
  { emoji: '🐠', name: '热带鱼', mult: 2, w: 0.25 },
  { emoji: '🐡', name: '河豚', mult: 3.5, w: 0.15 },
  { emoji: '🦈', name: '鲨鱼', mult: 8, w: 0.1 },
  { emoji: '🐋', name: 'Boss 鲸', mult: 28, w: 0.05 },
]

function spawn(id: number): Fish {
  const roll = rand()
  let acc = 0
  let sp = SPECIES[0]
  for (const s of SPECIES) {
    acc += s.w
    if (roll <= acc) {
      sp = s
      break
    }
  }
  return {
    id,
    emoji: sp.emoji,
    name: sp.name,
    mult: sp.mult,
    x: rand() < 0.5 ? -10 : 110,
    y: randInt(12, 78),
    vx: (rand() < 0.5 ? 1 : -1) * (0.35 + rand() * 0.55),
  }
}

export function FishGame({ title }: { title: string }) {
  const { debit, credit } = useClub()
  const [cannon, setCannon] = useState(10)
  const [fishes, setFishes] = useState<Fish[]>(() => [spawn(1), spawn(2), spawn(3), spawn(4)])
  const [msg, setMsg] = useState('点鱼开炮；炮台越高，命中越稳、消耗越大')
  const [tone, setTone] = useState<'win' | 'lose' | ''>('')

  useEffect(() => {
    const move = setInterval(() => {
      setFishes((list) =>
        list
          .map((f) => ({ ...f, x: f.x + f.vx }))
          .filter((f) => f.x > -15 && f.x < 115)
          .concat(list.length < 5 ? [spawn(Date.now() + Math.random())] : []),
      )
    }, 80)
    const add = setInterval(() => {
      setFishes((list) => (list.length < 7 ? [...list, spawn(Date.now() + Math.random())] : list))
    }, 1600)
    return () => {
      clearInterval(move)
      clearInterval(add)
    }
  }, [])

  const hitChance = useMemo(() => 0.28 + cannon / 80, [cannon])

  const shoot = (f: Fish) => {
    if (!debit(cannon, `${title} 开炮 -${cannon}`)) {
      setMsg('余额不足')
      setTone('lose')
      return
    }
    setFishes((list) => list.filter((x) => x.id !== f.id))
    if (rand() < hitChance) {
      const win = Math.round(cannon * f.mult)
      credit(win, `${title} 击中${f.name} +${win}`)
      setMsg(`击中 ${f.name} ×${f.mult} · +${win}`)
      setTone('win')
    } else {
      setMsg(`${f.name} 溜走了`)
      setTone('lose')
    }
  }

  return (
    <div>
      <div className="table-felt fish-tank">
        {fishes.map((f) => (
          <button
            key={f.id}
            type="button"
            className="fish-sprite"
            style={{ left: `${f.x}%`, top: `${f.y}%`, transform: f.vx < 0 ? 'scaleX(-1)' : undefined }}
            onClick={() => shoot(f)}
            title={`${f.name} ×${f.mult}`}
          >
            {f.emoji}
          </button>
        ))}
        <p className={`result-banner ${tone}`} style={{ position: 'relative', zIndex: 2 }}>
          {msg}
        </p>
      </div>
      <div className="bet-chips">
        {[5, 10, 20, 50, 100].map((v) => (
          <button
            key={v}
            type="button"
            className={cannon === v ? 'on' : ''}
            onClick={() => setCannon(v)}
          >
            炮 {v}
          </button>
        ))}
      </div>
    </div>
  )
}
