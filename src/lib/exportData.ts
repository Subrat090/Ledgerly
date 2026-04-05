import type { Transaction } from '../types/transaction'

export function exportTransactionsJson(transactions: Transaction[]): void {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], {
    type: 'application/json',
  })
  downloadBlob(blob, `transactions-${todayStamp()}.json`)
}

export function exportTransactionsCsv(transactions: Transaction[]): void {
  const header = ['id', 'date', 'amount', 'category', 'type', 'description']
  const rows = transactions.map((t) =>
    [t.id, t.date, String(t.amount), t.category, t.type, escapeCsv(t.description)].join(',')
  )
  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `transactions-${todayStamp()}.csv`)
}

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}
