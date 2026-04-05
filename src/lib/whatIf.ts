import type { Transaction } from '../types/transaction'

/**
 * Returns a shallow copy of transactions with scenario adjustments:
 * - All expenses multiplied by (1 - expenseCutPercent/100)
 * - All income multiplied by (1 + incomeBoostPercent/100)
 */
export function applyWhatIfToTransactions(
  transactions: Transaction[],
  expenseCutPercent: number,
  incomeBoostPercent: number
): Transaction[] {
  const cut = Math.min(100, Math.max(0, expenseCutPercent)) / 100
  const boost = Math.min(100, Math.max(0, incomeBoostPercent)) / 100

  return transactions.map((t) => {
    if (t.type === 'expense') {
      const next = Math.round(t.amount * (1 - cut) * 100) / 100
      return { ...t, amount: Math.max(0, next) }
    }
    if (t.type === 'income') {
      return { ...t, amount: Math.round(t.amount * (1 + boost) * 100) / 100 }
    }
    return { ...t }
  })
}
