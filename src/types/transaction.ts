export type TransactionType = 'income' | 'expense'

export type UserRole = 'viewer' | 'admin'

export interface Transaction {
  id: string
  date: string
  amount: number
  category: string
  type: TransactionType
  description: string
}

export type SortField = 'date' | 'amount' | 'category'
export type SortDirection = 'asc' | 'desc'
