import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useMemo } from 'react'
import { formatCurrency } from '../lib/formatCurrency'
import { categoryChartData } from '../lib/insights'
import { useEffectiveTransactions, useWhatIfScenarioActive } from '../hooks/useEffectiveTransactions'
import { useFinanceStore } from '../store/financeStore'

export function CategorySpendChart() {
  const raw = useFinanceStore((s) => s.transactions)
  const transactions = useEffectiveTransactions()
  const scenario = useWhatIfScenarioActive()
  const data = useMemo(() => categoryChartData(transactions), [transactions])

  if (raw.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <header className="mb-4">
          <h2 className="font-display text-base font-semibold text-[var(--text-strong)]">
            Spending by category
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Expense breakdown</p>
        </header>
        <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 px-6 text-center text-sm text-[var(--text-muted)]">
          Add transactions to see spending breakdown.
        </div>
      </section>
    )
  }

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <header className="mb-4">
          <h2 className="font-display text-base font-semibold text-[var(--text-strong)]">
            Spending by category
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {scenario ? 'Expense breakdown (scenario)' : 'Expense breakdown'}
          </p>
        </header>
        <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 px-6 text-center text-sm text-[var(--text-muted)]">
          No expense transactions to visualize yet.
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <header className="mb-2">
        <h2 className="font-display text-base font-semibold text-[var(--text-strong)]">
          Spending by category
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {scenario ? 'Scenario-adjusted category totals' : 'Where your money goes'}
        </p>
      </header>
      <div className="h-[300px] w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-strong)',
              }}
              formatter={(value) =>
                formatCurrency(typeof value === 'number' ? value : Number(value))
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-[var(--text-muted)]">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
