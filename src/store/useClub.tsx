import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ActivityItem, BetSlipItem, Currency } from '../types'

const STORAGE_KEY = 'aureum-club-v1'
const START_BALANCE = 54400

interface Persisted {
  balance: number
  currency: Currency
  hideBalance: boolean
  displayName: string
  joined: boolean
  activity: ActivityItem[]
}

interface ClubCtx {
  balance: number
  currency: Currency
  hideBalance: boolean
  displayName: string
  joined: boolean
  activity: ActivityItem[]
  slip: BetSlipItem[]
  setCurrency: (c: Currency) => void
  toggleHide: () => void
  joinClub: () => void
  setDisplayName: (n: string) => void
  credit: (amount: number, note: string) => void
  debit: (amount: number, note: string) => boolean
  addToSlip: (item: Omit<BetSlipItem, 'id' | 'stake'> & { stake?: number }) => void
  updateStake: (id: string, stake: number) => void
  removeFromSlip: (id: string) => void
  clearSlip: () => void
  placeSlip: () => { ok: boolean; message: string }
  resetDemo: () => void
}

const ClubContext = createContext<ClubCtx | null>(null)

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Persisted
  } catch {
    /* ignore */
  }
  return {
    balance: START_BALANCE,
    currency: 'CNY',
    hideBalance: false,
    displayName: '访客',
    joined: false,
    activity: [
      {
        id: 'a0',
        text: '试玩钱包已注资，午夜前赢得的试玩金会计入今日榜。',
        time: Date.now(),
      },
    ],
  }
}

export function ClubProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => load())
  const [slip, setSlip] = useState<BetSlipItem[]>([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const pushActivity = useCallback((text: string, amount?: number) => {
    setState((s) => ({
      ...s,
      activity: [
        { id: `a${Date.now()}`, text, time: Date.now(), amount },
        ...s.activity,
      ].slice(0, 40),
    }))
  }, [])

  const credit = useCallback(
    (amount: number, note: string) => {
      setState((s) => ({ ...s, balance: Math.round((s.balance + amount) * 100) / 100 }))
      pushActivity(note, amount)
    },
    [pushActivity],
  )

  const debit = useCallback(
    (amount: number, note: string) => {
      let ok = false
      setState((s) => {
        if (s.balance < amount) return s
        ok = true
        return { ...s, balance: Math.round((s.balance - amount) * 100) / 100 }
      })
      if (ok) pushActivity(note, -amount)
      return ok
    },
    [pushActivity],
  )

  const placeSlip = useCallback(() => {
    if (slip.length === 0) return { ok: false, message: '注单为空' }
    const total = slip.reduce((sum, b) => sum + b.stake, 0)
    if (total <= 0) return { ok: false, message: '请设置注额' }
    let ok = false
    setState((s) => {
      if (s.balance < total) return s
      ok = true
      return { ...s, balance: Math.round((s.balance - total) * 100) / 100 }
    })
    if (!ok) return { ok: false, message: '试玩余额不足' }

    // Simple settle: each pick has ~45% hit chance weighted lightly by odds
    let payout = 0
    const results: string[] = []
    for (const b of slip) {
      const hit = Math.random() < Math.min(0.55, 0.9 / b.odds)
      if (hit) {
        const win = Math.round(b.stake * b.odds * 100) / 100
        payout += win
        results.push(`${b.selection} 命中 +${win}`)
      } else {
        results.push(`${b.selection} 未中`)
      }
    }
    if (payout > 0) {
      setState((s) => ({ ...s, balance: Math.round((s.balance + payout) * 100) / 100 }))
    }
    pushActivity(`体育结算：${results.join('；')}`, payout - total)
    setSlip([])
    return {
      ok: true,
      message: payout > total ? `净赢 ${Math.round(payout - total)}` : `本单结果已入账`,
    }
  }, [slip, pushActivity])

  const value = useMemo<ClubCtx>(
    () => ({
      ...state,
      slip,
      setCurrency: (currency) => setState((s) => ({ ...s, currency })),
      toggleHide: () => setState((s) => ({ ...s, hideBalance: !s.hideBalance })),
      joinClub: () =>
        setState((s) => ({
          ...s,
          joined: true,
          displayName: s.displayName === '访客' ? '金钥会员' : s.displayName,
        })),
      setDisplayName: (displayName) => setState((s) => ({ ...s, displayName })),
      credit,
      debit,
      addToSlip: (item) =>
        setSlip((s) => [
          ...s.filter((x) => !(x.matchId === item.matchId && x.selection === item.selection)),
          {
            id: `b${Date.now()}${Math.random()}`,
            stake: item.stake ?? 100,
            matchId: item.matchId,
            label: item.label,
            selection: item.selection,
            odds: item.odds,
          },
        ]),
      updateStake: (id, stake) =>
        setSlip((s) => s.map((b) => (b.id === id ? { ...b, stake: Math.max(0, stake) } : b))),
      removeFromSlip: (id) => setSlip((s) => s.filter((b) => b.id !== id)),
      clearSlip: () => setSlip([]),
      placeSlip,
      resetDemo: () => {
        setSlip([])
        setState({
          balance: START_BALANCE,
          currency: 'CNY',
          hideBalance: false,
          displayName: '访客',
          joined: false,
          activity: [
            {
              id: `a${Date.now()}`,
              text: '演示已重置，试玩钱包恢复初始额度。',
              time: Date.now(),
            },
          ],
        })
      },
    }),
    [state, slip, credit, debit, placeSlip],
  )

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>
}

export function useClub() {
  const ctx = useContext(ClubContext)
  if (!ctx) throw new Error('useClub must be used within ClubProvider')
  return ctx
}
