export type Currency = 'CNY' | 'MYR' | 'USDT'
export type Category =
  | 'all'
  | 'slot'
  | 'baccarat'
  | 'blackjack'
  | 'roulette'
  | 'poker'
  | 'dragontiger'
  | 'threecard'
  | 'sicbo'
  | 'craps'
  | 'bingo'
  | 'keno'
  | 'fish'
  | 'lottery'
  | 'sports'

export type GameKind =
  | 'slot'
  | 'baccarat'
  | 'blackjack'
  | 'roulette'
  | 'poker'
  | 'dragontiger'
  | 'threecard'
  | 'sicbo'
  | 'craps'
  | 'bingo'
  | 'keno'
  | 'fish'
  | 'lottery'
  | 'sports'

export interface GameItem {
  id: string
  name: string
  category: Exclude<Category, 'all'>
  kind: GameKind
  rtp: number
  players: number
  badge?: 'live' | 'new' | 'hot'
  dealer?: string
  playable?: boolean
  blurb: string
}

export interface LeaderRow {
  rank: number
  name: string
  amount: number
}

export interface SportMatch {
  id: string
  sport: string
  league: string
  home: string
  away: string
  score: string
  clock: string
  markets: { label: string; odds: number }[]
}

export interface ActivityItem {
  id: string
  text: string
  time: number
  amount?: number
}

export interface BetSlipItem {
  id: string
  matchId: string
  label: string
  selection: string
  odds: number
  stake: number
}

export type TabId = 'home' | 'live' | 'sports' | 'wallet' | 'profile'
