import type { Transaction } from '../types/transaction'
import { SEED_TRANSACTIONS } from '../data/seedTransactions'

/** Simulated network delay for demo "refresh from server" */
export function fetchMockTransactions(
  delayMs = 800
): Promise<{ transactions: Transaction[]; fetchedAt: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
        fetchedAt: new Date().toISOString(),
      })
    }, delayMs)
  })
}
