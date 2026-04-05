import {
  ChevronDown,
  Download,
  Moon,
  RefreshCw,
  Sun,
  Monitor,
  Wallet,
} from 'lucide-react'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { fetchMockTransactions } from '../lib/mockApi'
import { exportTransactionsCsv, exportTransactionsJson } from '../lib/exportData'
import type { UserRole } from '../types/transaction'
import { useFinanceStore } from '../store/financeStore'

export function HeaderBar() {
  const role = useFinanceStore((s) => s.role)
  const setRole = useFinanceStore((s) => s.setRole)
  const theme = useFinanceStore((s) => s.theme)
  const setTheme = useFinanceStore((s) => s.setTheme)
  const transactions = useFinanceStore((s) => s.transactions)
  const applyRemote = useFinanceStore((s) => s.applyRemoteTransactions)
  const setRefreshing = useFinanceStore((s) => s.setRefreshing)
  const isRefreshing = useFinanceStore((s) => s.isRefreshing)
  const lastSynced = useFinanceStore((s) => s.lastSyncedAt)

  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  async function handleMockRefresh() {
    setRefreshing(true)
    try {
      const { transactions: remote, fetchedAt } = await fetchMockTransactions()
      applyRemote(remote, fetchedAt)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Wallet className="h-5 w-5" aria-hidden />
          </div>
          <div className="text-left">
            <h1 className="font-display text-lg font-semibold tracking-tight text-[var(--text-strong)]">
              Ledgerly
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Personal finance overview</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="sr-only" htmlFor="role-select">
            Demo role
          </label>
          <div className="relative">
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="h-10 cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface-2)] pl-3 pr-9 text-sm text-[var(--text-strong)] transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="admin">Admin (edit)</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
          </div>

          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5">
            <ThemeIconButton
              active={theme === 'light'}
              onClick={() => setTheme('light')}
              label="Light theme"
            >
              <Sun className="h-4 w-4" />
            </ThemeIconButton>
            <ThemeIconButton
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
              label="Dark theme"
            >
              <Moon className="h-4 w-4" />
            </ThemeIconButton>
            <ThemeIconButton
              active={theme === 'system'}
              onClick={() => setTheme('system')}
              label="System theme"
            >
              <Monitor className="h-4 w-4" />
            </ThemeIconButton>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={handleMockRefresh}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)] disabled:opacity-60"
              title={lastSynced ? `Last mock sync: ${new Date(lastSynced).toLocaleString()}` : undefined}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing…' : 'Mock sync'}
            </button>

            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportOpen((o) => !o)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-white transition hover:brightness-110 sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg transition-opacity">
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--text-strong)] hover:bg-[var(--surface-2)]"
                    onClick={() => {
                      exportTransactionsCsv(transactions)
                      setExportOpen(false)
                    }}
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--text-strong)] hover:bg-[var(--surface-2)]"
                    onClick={() => {
                      exportTransactionsJson(transactions)
                      setExportOpen(false)
                    }}
                  >
                    Download JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function ThemeIconButton({
  children,
  active,
  onClick,
  label,
}: {
  children: ReactNode
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`rounded-md p-2 transition ${
        active
          ? 'bg-[var(--accent)] text-white shadow-sm'
          : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
      }`}
    >
      {children}
    </button>
  )
}
