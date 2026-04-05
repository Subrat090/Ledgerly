import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react'
import { useMemo } from 'react'
import { formatCurrency } from '../lib/formatCurrency'
import {
  netBalance,
  totalExpenses,
  totalIncome,
} from '../lib/insights'
import { STARTING_BALANCE } from '../lib/constants'
import { useEffectiveTransactions, useWhatIfScenarioActive } from '../hooks/useEffectiveTransactions'
import { useFinanceStore } from '../store/financeStore'

export function SummaryCards() {
  const raw = useFinanceStore((s) => s.transactions)
  const effective = useEffectiveTransactions()
  const scenarioActive = useWhatIfScenarioActive()

  const baseline = useMemo(() => {
    return {
      income: totalIncome(raw),
      expenses: totalExpenses(raw),
      balance: netBalance(raw, STARTING_BALANCE),
    }
  }, [raw])

  const display = useMemo(() => {
    return {
      income: totalIncome(effective),
      expenses: totalExpenses(effective),
      balance: netBalance(effective, STARTING_BALANCE),
    }
  }, [effective])

  if (raw.length === 0) {
    return (
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Financial summary">
        <SummaryCardPlaceholder title="Total balance" />
        <SummaryCardPlaceholder title="Income" />
        <SummaryCardPlaceholder title="Expenses" />
      </section>
    )
  }

  return (
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Financial summary">
      {scenarioActive && (
        <p className="sm:col-span-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-2 text-center text-xs font-medium text-[var(--accent)]">
          Showing what-if scenario — totals differ from stored data
        </p>
      )}
      <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Total balance
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-[var(--text-strong)]">
              {formatCurrency(display.balance)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Includes starting balance {formatCurrency(STARTING_BALANCE)}
            </p>
            {scenarioActive && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                vs baseline{' '}
                <span className="font-medium text-[var(--text-strong)]">
                  {formatCurrency(baseline.balance)}
                </span>
                <DeltaInline value={display.balance - baseline.balance} />
              </p>
            )}
          </div>
          <span className="rounded-xl bg-[var(--accent-soft)] p-2.5 text-[var(--accent)] transition group-hover:scale-105">
            <Scale className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </article>

      <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Income
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(display.income)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">All credited amounts</p>
            {scenarioActive && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                vs {formatCurrency(baseline.income)}
                <DeltaInline value={display.income - baseline.income} />
              </p>
            )}
          </div>
          <span className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400 transition group-hover:scale-105">
            <ArrowDownLeft className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </article>

      <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Expenses
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
              {formatCurrency(display.expenses)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">All debited amounts</p>
            {scenarioActive && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                vs {formatCurrency(baseline.expenses)}
                <DeltaInline value={display.expenses - baseline.expenses} expenseStyle />
              </p>
            )}
          </div>
          <span className="rounded-xl bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-400 transition group-hover:scale-105">
            <ArrowUpRight className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </article>
    </section>
  )
}

function DeltaInline({ value, expenseStyle }: { value: number; expenseStyle?: boolean }) {
  if (value === 0) return null
  const lowerExpenseIsGood = expenseStyle && value < 0
  const higherIsGood = !expenseStyle && value > 0
  const good = lowerExpenseIsGood || higherIsGood
  return (
    <span
      className={`ml-1 font-medium tabular-nums ${
        good ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
      }`}
    >
      ({value > 0 ? '+' : ''}
      {formatCurrency(value)})
    </span>
  )
}

function SummaryCardPlaceholder({ title }: { title: string }) {
  return (
    <article className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/50 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </p>
      <p className="mt-3 text-sm text-[var(--text-muted)]">No data yet</p>
    </article>
  )
}
