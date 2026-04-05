import type { Transaction } from '../types/transaction'

const monthKey = (iso: string) => iso.slice(0, 7)

export function sumByCategoryExpenses(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }
  return map
}

export function highestSpendingCategory(
  transactions: Transaction[]
): { category: string; amount: number } | null {
  const map = sumByCategoryExpenses(transactions)
  let best: { category: string; amount: number } | null = null
  for (const [category, amount] of map) {
    if (!best || amount > best.amount) best = { category, amount }
  }
  return best
}

export function monthlyExpenseTotals(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const k = monthKey(t.date)
    map.set(k, (map.get(k) ?? 0) + t.amount)
  }
  return map
}

/** Compare two most recent months that have expense data */
export function monthlyExpenseComparison(transactions: Transaction[]): {
  currentMonth: string
  currentTotal: number
  previousMonth: string
  previousTotal: number
  percentChange: number | null
} | null {
  const map = monthlyExpenseTotals(transactions)
  const months = [...map.keys()].sort()
  if (months.length < 2) return null
  const previousMonth = months[months.length - 2]!
  const currentMonth = months[months.length - 1]!
  const previousTotal = map.get(previousMonth) ?? 0
  const currentTotal = map.get(currentMonth) ?? 0
  const percentChange =
    previousTotal === 0 ? null : ((currentTotal - previousTotal) / previousTotal) * 100
  return { currentMonth, currentTotal, previousMonth, previousTotal, percentChange }
}

export function totalIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
}

export function totalExpenses(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
}

export function netBalance(transactions: Transaction[], startingBalance = 0): number {
  return startingBalance + totalIncome(transactions) - totalExpenses(transactions)
}

/** Points for line chart: cumulative balance by calendar month end */
export function balanceTrendByMonth(
  transactions: Transaction[],
  startingBalance: number
): { month: string; balance: number; label: string }[] {
  const byMonth = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const k = monthKey(t.date)
    if (!byMonth.has(k)) byMonth.set(k, [])
    byMonth.get(k)!.push(t)
  }
  const months = [...byMonth.keys()].sort()
  let running = startingBalance
  return months.map((m) => {
    const txs = byMonth.get(m) ?? []
    for (const t of txs.sort((a, b) => a.date.localeCompare(b.date))) {
      running += t.type === 'income' ? t.amount : -t.amount
    }
    const [y, mo] = m.split('-')
    const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    })
    return { month: m, balance: running, label }
  })
}

export function categoryChartData(transactions: Transaction[]) {
  const map = sumByCategoryExpenses(transactions)
  const palette = [
    '#0d9488',
    '#6366f1',
    '#d946ef',
    '#f59e0b',
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#a855f7',
  ]
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      fill: palette[i % palette.length],
    }))
}
