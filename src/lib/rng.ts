export function rand() {
  return Math.random()
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

export function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min
}

export type Suit = 'S' | 'H' | 'D' | 'C'
export type Rank = number // 1-13

export interface Card {
  suit: Suit
  rank: Rank
}

const SUITS: Suit[] = ['S', 'H', 'D', 'C']

export function freshDeck(decks = 1): Card[] {
  const out: Card[] = []
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) {
        out.push({ suit, rank })
      }
    }
  }
  return shuffle(out)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function cardLabel(c: Card) {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const suits = { S: '♠', H: '♥', D: '♦', C: '♣' }
  return `${ranks[c.rank - 1]}${suits[c.suit]}`
}

export function bjValue(cards: Card[]) {
  let total = 0
  let aces = 0
  for (const c of cards) {
    if (c.rank === 1) {
      aces++
      total += 11
    } else if (c.rank >= 10) total += 10
    else total += c.rank
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

export function bacPoint(cards: Card[]) {
  let t = 0
  for (const c of cards) {
    if (c.rank >= 10) continue
    t += c.rank === 1 ? 1 : c.rank
  }
  return t % 10
}
