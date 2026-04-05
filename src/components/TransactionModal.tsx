import { X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { Transaction, TransactionType } from '../types/transaction'

const PRESET_CATEGORIES = [
  'Salary',
  'Freelance',
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Other',
]

function defaultFormState(mode: 'create' | 'edit', initial: Partial<Transaction> | null) {
  if (mode === 'edit' && initial) {
    return {
      date: initial.date ?? '',
      amount: initial.amount != null ? String(initial.amount) : '',
      category: initial.category ?? '',
      type: (initial.type ?? 'expense') as TransactionType,
      description: initial.description ?? '',
    }
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    category: 'Food',
    type: 'expense' as TransactionType,
    description: '',
  }
}

export function TransactionModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'create' | 'edit'
  initial: Partial<Transaction> | null
  onClose: () => void
  onSave: (payload: {
    date: string
    amount: number
    category: string
    type: TransactionType
    description: string
  }) => void
}) {
  const defaults = defaultFormState(mode, initial)
  const [date, setDate] = useState(defaults.date)
  const [amount, setAmount] = useState(defaults.amount)
  const [category, setCategory] = useState(defaults.category)
  const [type, setType] = useState<TransactionType>(defaults.type)
  const [description, setDescription] = useState(defaults.description)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const num = Number.parseFloat(amount)
    if (!date || !category.trim() || !description.trim()) {
      setError('Please fill in date, category, and description.')
      return
    }
    if (Number.isNaN(num) || num <= 0) {
      setError('Amount must be a positive number.')
      return
    }
    onSave({
      date,
      amount: num,
      category: category.trim(),
      type,
      description: description.trim(),
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="tx-modal-title" className="font-display text-lg font-semibold text-[var(--text-strong)]">
              {mode === 'create' ? 'Add transaction' : 'Edit transaction'}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Changes apply to your local dashboard state.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)]" htmlFor="tx-date">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)]" htmlFor="tx-type">
              Type
            </label>
            <select
              id="tx-type"
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)]" htmlFor="tx-amount">
              Amount (USD)
            </label>
            <input
              id="tx-amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)]" htmlFor="tx-category">
              Category
            </label>
            <input
              id="tx-category"
              list="category-presets"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
            />
            <datalist id="category-presets">
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)]" htmlFor="tx-desc">
              Description
            </label>
            <input
              id="tx-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
              placeholder="What was this for?"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] hover:bg-[var(--surface-2)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              {mode === 'create' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
