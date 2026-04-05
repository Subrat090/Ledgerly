import { ArrowUpDown, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency, formatShortDate } from '../lib/formatCurrency'
import type { SortField, Transaction } from '../types/transaction'
import { useEffectiveTransactions, useWhatIfScenarioActive } from '../hooks/useEffectiveTransactions'
import {
  allCategories,
  selectFilteredTransactions,
  useFinanceStore,
} from '../store/financeStore'
import { TransactionModal } from './TransactionModal'

export function TransactionsPanel() {
  const role = useFinanceStore((s) => s.role)
  const rawTransactions = useFinanceStore((s) => s.transactions)
  const displayTransactions = useEffectiveTransactions()
  const scenarioActive = useWhatIfScenarioActive()
  const typeFilter = useFinanceStore((s) => s.typeFilter)
  const setTypeFilter = useFinanceStore((s) => s.setTypeFilter)
  const categoryFilter = useFinanceStore((s) => s.categoryFilter)
  const setCategoryFilter = useFinanceStore((s) => s.setCategoryFilter)
  const search = useFinanceStore((s) => s.search)
  const setSearch = useFinanceStore((s) => s.setSearch)
  const sortField = useFinanceStore((s) => s.sortField)
  const sortDir = useFinanceStore((s) => s.sortDir)
  const setSort = useFinanceStore((s) => s.setSort)
  const addTransaction = useFinanceStore((s) => s.addTransaction)
  const updateTransaction = useFinanceStore((s) => s.updateTransaction)
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction)
  const resetToSeed = useFinanceStore((s) => s.resetToSeed)

  const filtered = useMemo(
    () =>
      selectFilteredTransactions({
        transactions: displayTransactions,
        typeFilter,
        categoryFilter,
        search,
        sortField,
        sortDir,
      }),
    [displayTransactions, typeFilter, categoryFilter, search, sortField, sortDir]
  )

  const categories = useMemo(
    () => ['all', ...allCategories(rawTransactions)],
    [rawTransactions]
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<Transaction | null>(null)

  const isAdmin = role === 'admin'

  function openCreate() {
    setModalMode('create')
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    if (!isAdmin) return
    setModalMode('edit')
    const stored = rawTransactions.find((x) => x.id === t.id)
    setEditing(stored ?? t)
    setModalOpen(true)
  }

  function handleDelete(id: string, description: string) {
    if (
      !window.confirm(
        `Delete this transaction?\n\n“${description.slice(0, 80)}${description.length > 80 ? '…' : ''}”\n\nThis cannot be undone.`
      )
    ) {
      return
    }
    deleteTransaction(id)
  }

  function handleSave(payload: {
    date: string
    amount: number
    category: string
    type: Transaction['type']
    description: string
  }) {
    if (modalMode === 'create') {
      addTransaction(payload)
    } else if (editing) {
      updateTransaction(editing.id, payload)
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--text-strong)]">
            Transactions
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {rawTransactions.length === 0
              ? 'No rows yet — add one as admin or use Mock sync.'
              : `${filtered.length} shown · ${rawTransactions.length} total`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Add transaction
            </button>
          )}
          {isAdmin && rawTransactions.length === 0 && (
            <button
              type="button"
              onClick={() => resetToSeed()}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] hover:bg-[var(--surface-2)]"
            >
              Load sample data
            </button>
          )}
        </div>
      </div>

      {scenarioActive && rawTransactions.length > 0 && (
        <p className="mt-4 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-2 text-xs text-[var(--accent)]">
          Amounts below reflect the what-if scenario. <strong>Edit</strong> still updates your real stored
          transactions.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search description or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-10 pr-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
            aria-label="Search transactions"
          />
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
          Type
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)]"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
          Category
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All categories' : c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
              <th className="px-4 py-3 font-medium text-[var(--text-muted)]">
                <SortButton
                  label="Date"
                  field="date"
                  active={sortField}
                  dir={sortDir}
                  onSort={setSort}
                />
              </th>
              <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Description</th>
              <th className="px-4 py-3 font-medium text-[var(--text-muted)]">
                <SortButton
                  label="Category"
                  field="category"
                  active={sortField}
                  dir={sortDir}
                  onSort={setSort}
                />
              </th>
              <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Type</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                <SortButton
                  label="Amount"
                  field="amount"
                  active={sortField}
                  dir={sortDir}
                  onSort={setSort}
                  align="right"
                />
              </th>
              {isAdmin && (
                <th className="px-4 py-3 w-[8.5rem] text-right font-medium text-[var(--text-muted)]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rawTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="px-4 py-16 text-center text-[var(--text-muted)]"
                >
                  <p className="font-medium text-[var(--text-strong)]">No transactions yet</p>
                  <p className="mt-1 max-w-sm mx-auto text-sm">
                    Switch to <strong>Admin</strong> to add entries, or use <strong>Mock sync</strong> in the
                    header to load demo data.
                  </p>
                </td>
              </tr>
            )}
            {rawTransactions.length > 0 && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="px-4 py-12 text-center text-[var(--text-muted)]"
                >
                  No transactions match your filters. Try clearing search or setting filters to “All”.
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--surface-2)]/60"
              >
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[var(--text-strong)]">
                  {formatShortDate(t.date)}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-[var(--text-strong)]" title={t.description}>
                  {t.description}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{t.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.type === 'income'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {t.type}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium tabular-nums ${
                    t.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {t.type === 'income' ? '+' : '−'}
                  {formatCurrency(t.amount)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text-strong)] hover:bg-[var(--surface-2)]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.description)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                        aria-label={`Delete transaction: ${t.description}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isAdmin && rawTransactions.length > 0 && (
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          You are viewing as <strong>Viewer</strong>. Switch role to Admin to add, edit, or delete transactions.
        </p>
      )}

      {modalOpen && (
        <TransactionModal
          key={`${modalMode}-${editing?.id ?? 'new'}`}
          mode={modalMode}
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </section>
  )
}

function SortButton({
  label,
  field,
  active,
  dir,
  onSort,
  align,
}: {
  label: string
  field: SortField
  active: SortField
  dir: 'asc' | 'desc'
  onSort: (f: SortField) => void
  align?: 'right'
}) {
  const on = active === field
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-left hover:text-[var(--text-strong)] ${
        align === 'right' ? 'ml-auto w-full justify-end' : ''
      }`}
    >
      {label}
      <ArrowUpDown
        className={`h-3.5 w-3.5 ${on ? 'text-[var(--accent)]' : 'opacity-40'}`}
        aria-hidden
      />
      {on && <span className="sr-only">sorted {dir === 'asc' ? 'ascending' : 'descending'}</span>}
    </button>
  )
}
