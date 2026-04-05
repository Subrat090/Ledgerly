import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEED_TRANSACTIONS } from '../data/seedTransactions'
import type {
  SortDirection,
  SortField,
  Transaction,
  TransactionType,
  UserRole,
} from '../types/transaction'

const STORAGE_KEY = 'zorvyn-finance-v1'

export type ThemeMode = 'light' | 'dark' | 'system'

interface FinanceState {
  transactions: Transaction[]
  role: UserRole
  theme: ThemeMode
  typeFilter: 'all' | TransactionType
  categoryFilter: string
  search: string
  sortField: SortField
  sortDir: SortDirection
  isRefreshing: boolean
  lastSyncedAt: string | null

  /** What-if: % reduction applied to every expense amount (0–50) */
  whatIfExpenseCutPercent: number
  /** What-if: % increase applied to every income amount (0–40) */
  whatIfIncomeBoostPercent: number
  /** When true, dashboard charts/tables use adjusted transactions */
  whatIfApplyToDashboard: boolean

  setRole: (role: UserRole) => void
  setTheme: (theme: ThemeMode) => void
  setTypeFilter: (v: 'all' | TransactionType) => void
  setCategoryFilter: (v: string) => void
  setSearch: (v: string) => void
  setSort: (field: SortField) => void
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id'>>) => void
  deleteTransaction: (id: string) => void
  resetToSeed: () => void
  applyRemoteTransactions: (list: Transaction[], fetchedAt: string) => void
  setRefreshing: (v: boolean) => void
  setWhatIfExpenseCutPercent: (n: number) => void
  setWhatIfIncomeBoostPercent: (n: number) => void
  setWhatIfApplyToDashboard: (v: boolean) => void
  resetWhatIf: () => void
}

function nextId(list: Transaction[]): string {
  const max = list.reduce((m, t) => Math.max(m, Number(t.id) || 0), 0)
  return String(max + 1)
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: SEED_TRANSACTIONS,
      role: 'admin',
      theme: 'system',
      typeFilter: 'all',
      categoryFilter: 'all',
      search: '',
      sortField: 'date',
      sortDir: 'desc',
      isRefreshing: false,
      lastSyncedAt: null,

      whatIfExpenseCutPercent: 0,
      whatIfIncomeBoostPercent: 0,
      whatIfApplyToDashboard: false,

      setRole: (role) => set({ role }),
      setTheme: (theme) => set({ theme }),
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      setSearch: (search) => set({ search }),
      setSort: (field) =>
        set((s) => {
          if (s.sortField === field) {
            return { sortDir: s.sortDir === 'asc' ? 'desc' : 'asc' }
          }
          return {
            sortField: field,
            sortDir: field === 'category' ? 'asc' : 'desc',
          }
        }),

      addTransaction: (payload) =>
        set((s) => ({
          transactions: [
            ...s.transactions,
            { ...payload, id: nextId(s.transactions) },
          ],
        })),

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      resetToSeed: () => set({ transactions: [...SEED_TRANSACTIONS] }),

      applyRemoteTransactions: (list, fetchedAt) =>
        set({ transactions: list, lastSyncedAt: fetchedAt }),

      setRefreshing: (isRefreshing) => set({ isRefreshing }),

      setWhatIfExpenseCutPercent: (whatIfExpenseCutPercent) =>
        set({ whatIfExpenseCutPercent }),
      setWhatIfIncomeBoostPercent: (whatIfIncomeBoostPercent) =>
        set({ whatIfIncomeBoostPercent }),
      setWhatIfApplyToDashboard: (whatIfApplyToDashboard) =>
        set({ whatIfApplyToDashboard }),
      resetWhatIf: () =>
        set({
          whatIfExpenseCutPercent: 0,
          whatIfIncomeBoostPercent: 0,
          whatIfApplyToDashboard: false,
        }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        transactions: s.transactions,
        role: s.role,
        theme: s.theme,
        lastSyncedAt: s.lastSyncedAt,
      }),
    }
  )
)

export type TransactionListParams = Pick<
  FinanceState,
  'transactions' | 'typeFilter' | 'categoryFilter' | 'search' | 'sortField' | 'sortDir'
>

export function selectFilteredTransactions(s: TransactionListParams): Transaction[] {
  let list = [...s.transactions]

  if (s.typeFilter !== 'all') {
    list = list.filter((t) => t.type === s.typeFilter)
  }
  if (s.categoryFilter !== 'all') {
    list = list.filter((t) => t.category === s.categoryFilter)
  }
  const q = s.search.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    )
  }

  const dir = s.sortDir === 'asc' ? 1 : -1
  list.sort((a, b) => {
    if (s.sortField === 'amount') return (a.amount - b.amount) * dir
    if (s.sortField === 'category') return a.category.localeCompare(b.category) * dir
    return a.date.localeCompare(b.date) * dir
  })

  return list
}

export function allCategories(transactions: Transaction[]): string[] {
  return [...new Set(transactions.map((t) => t.category))].sort()
}
