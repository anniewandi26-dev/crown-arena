import type { Currency } from '../types'

const RATES: Record<Currency, number> = {
  CNY: 1,
  MYR: 0.62,
  USDT: 0.14,
}

const SYMBOL: Record<Currency, string> = {
  CNY: '¥',
  MYR: 'RM',
  USDT: '₮',
}

export function convert(cny: number, currency: Currency) {
  return cny * RATES[currency]
}

export function formatMoney(cny: number, currency: Currency, compact = false) {
  const v = convert(cny, currency)
  const symbol = SYMBOL[currency]
  if (compact && Math.abs(v) >= 1000) {
    return `${symbol}${(v / 1000).toFixed(1)}k`
  }
  return `${symbol}${v.toLocaleString(undefined, {
    minimumFractionDigits: currency === 'USDT' ? 2 : 0,
    maximumFractionDigits: currency === 'USDT' ? 2 : 0,
  })}`
}

export function formatPlayers(n: number) {
  return n.toLocaleString()
}
