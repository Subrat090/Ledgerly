import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo, type ReactNode } from 'react'
import { formatCurrency } from '../lib/formatCurrency'
import { balanceTrendByMonth } from '../lib/insights'
import { STARTING_BALANCE } from '../lib/constants'
import { useEffectiveTransactions, useWhatIfScenarioActive } from '../hooks/useEffectiveTransactions'
import { useFinanceStore } from '../store/financeStore'

export function BalanceTrendChart() {
  const raw = useFinanceStore((s) => s.transactions)
  const transactions = useEffectiveTransactions()
  const scenario = useWhatIfScenarioActive()
  const data = useMemo(
    () => balanceTrendByMonth(transactions, STARTING_BALANCE),
    [transactions]
  )

  if (raw.length === 0) {
    return (
      <ChartShell title="Balance trend" subtitle="Net balance by month">
        <EmptyChart message="Add transactions to see your balance trajectory." />
      </ChartShell>
    )
  }

  if (data.length === 0) {
    return (
      <ChartShell title="Balance trend" subtitle="Net balance by month">
        <EmptyChart message="Not enough dated activity to plot a trend." />
      </ChartShell>
    )
  }

  return (
    <ChartShell
      title="Balance trend"
      subtitle={
        scenario ? 'Running balance (what-if scenario)' : 'Running balance after each month'
      }
    >
      <div className="h-[280px] w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${v / 1000}k`}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-strong)',
              }}
              formatter={(value) => [
                formatCurrency(typeof value === 'number' ? value : Number(value)),
                'Balance',
              ]}
              labelFormatter={(label) => String(label)}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#balanceFill)"
              dot={{ r: 3, fill: 'var(--accent)' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  )
}

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="font-display text-base font-semibold text-[var(--text-strong)]">{title}</h2>
        <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 px-6 text-center text-sm text-[var(--text-muted)]">
      {message}
    </div>
  )
}
