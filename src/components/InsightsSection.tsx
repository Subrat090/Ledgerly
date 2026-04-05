import { Lightbulb, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { formatCurrency } from '../lib/formatCurrency'
import {
  highestSpendingCategory,
  monthlyExpenseComparison,
  totalExpenses,
  totalIncome,
} from '../lib/insights'
import { useEffectiveTransactions, useWhatIfScenarioActive } from '../hooks/useEffectiveTransactions'
import { useFinanceStore } from '../store/financeStore'

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y!, m! - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

export function InsightsSection() {
  const raw = useFinanceStore((s) => s.transactions)
  const transactions = useEffectiveTransactions()
  const scenario = useWhatIfScenarioActive()

  const insights = useMemo(() => {
    const top = highestSpendingCategory(transactions)
    const compare = monthlyExpenseComparison(transactions)
    const income = totalIncome(transactions)
    const expense = totalExpenses(transactions)
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : null
    return { top, compare, savingsRate }
  }, [transactions])

  if (raw.length === 0) {
    return (
      <section
        className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 p-8 text-center"
        aria-label="Insights"
      >
        <Lightbulb className="mx-auto h-10 w-10 text-[var(--text-muted)]" aria-hidden />
        <h2 className="mt-3 font-display text-lg font-semibold text-[var(--text-strong)]">
          Insights appear here
        </h2>
        <p className="mt-1 max-w-md mx-auto text-sm text-[var(--text-muted)]">
          Once you have transactions, we will highlight your top spending category, month-over-month
          spending, and savings rate.
        </p>
      </section>
    )
  }

  const { top, compare, savingsRate } = insights

  return (
    <section aria-label="Insights">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-lg font-semibold text-[var(--text-strong)]">Insights</h2>
        {scenario && (
          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            Scenario
          </span>
        )}
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span className="rounded-lg bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
              <TrendingUp className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide">Top category</span>
          </div>
          {top ? (
            <>
              <p className="mt-3 text-xl font-semibold text-[var(--text-strong)]">{top.category}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {formatCurrency(top.amount)} total spend
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">No expenses recorded.</p>
          )}
        </li>

        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span className="rounded-lg bg-amber-500/15 p-2 text-amber-600 dark:text-amber-400">
              {compare && compare.percentChange !== null && compare.percentChange > 0 ? (
                <TrendingUp className="h-4 w-4" aria-hidden />
              ) : (
                <TrendingDown className="h-4 w-4" aria-hidden />
              )}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide">Monthly comparison</span>
          </div>
          {compare ? (
            <>
              <p className="mt-3 text-sm text-[var(--text-strong)]">
                <span className="font-medium">{formatMonthLabel(compare.currentMonth)}</span>
                <span className="text-[var(--text-muted)]"> vs </span>
                <span className="font-medium">{formatMonthLabel(compare.previousMonth)}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Expenses: {formatCurrency(compare.previousTotal)} →{' '}
                <span className="font-medium text-[var(--text-strong)]">
                  {formatCurrency(compare.currentTotal)}
                </span>
              </p>
              {compare.percentChange !== null && (
                <p
                  className={`mt-2 text-sm font-medium ${
                    compare.percentChange > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {compare.percentChange > 0 ? '+' : ''}
                  {compare.percentChange.toFixed(1)}% vs prior month
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Need at least two months with expenses to compare.
            </p>
          )}
        </li>

        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span className="rounded-lg bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
              <Lightbulb className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide">Savings signal</span>
          </div>
          {savingsRate !== null ? (
            <>
              <p className="mt-3 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
                {savingsRate.toFixed(1)}%
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                of income left after expenses (simple cash-flow view).
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">No income recorded yet.</p>
          )}
        </li>
      </ul>
    </section>
  )
}
