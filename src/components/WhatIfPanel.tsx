import { FlaskConical, RotateCcw } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { formatCurrency } from '../lib/formatCurrency'
import { netBalance, totalExpenses, totalIncome } from '../lib/insights'
import { applyWhatIfToTransactions } from '../lib/whatIf'
import { STARTING_BALANCE } from '../lib/constants'
import { useFinanceStore } from '../store/financeStore'

export function WhatIfPanel() {
  const raw = useFinanceStore((s) => s.transactions)
  const cut = useFinanceStore((s) => s.whatIfExpenseCutPercent)
  const boost = useFinanceStore((s) => s.whatIfIncomeBoostPercent)
  const apply = useFinanceStore((s) => s.whatIfApplyToDashboard)
  const setCut = useFinanceStore((s) => s.setWhatIfExpenseCutPercent)
  const setBoost = useFinanceStore((s) => s.setWhatIfIncomeBoostPercent)
  const setApply = useFinanceStore((s) => s.setWhatIfApplyToDashboard)
  const resetWhatIf = useFinanceStore((s) => s.resetWhatIf)

  useEffect(() => {
    if (cut === 0 && boost === 0 && apply) setApply(false)
  }, [cut, boost, apply, setApply])

  const scenario = useMemo(
    () => applyWhatIfToTransactions(raw, cut, boost),
    [raw, cut, boost]
  )

  const baseline = useMemo(() => {
    const income = totalIncome(raw)
    const expenses = totalExpenses(raw)
    const balance = netBalance(raw, STARTING_BALANCE)
    return { income, expenses, balance }
  }, [raw])

  const projected = useMemo(() => {
    const income = totalIncome(scenario)
    const expenses = totalExpenses(scenario)
    const balance = netBalance(scenario, STARTING_BALANCE)
    return { income, expenses, balance }
  }, [scenario])

  const deltaBalance = projected.balance - baseline.balance
  const hasAdjustment = cut > 0 || boost > 0

  if (raw.length === 0) {
    return null
  }

  return (
    <section
      className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--accent-soft)] p-5 shadow-sm sm:p-6"
      aria-labelledby="what-if-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--accent)] shadow-sm ring-1 ring-[var(--border)]">
            <FlaskConical className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2
              id="what-if-heading"
              className="font-display text-lg font-semibold text-[var(--text-strong)]"
            >
              What-if lab
            </h2>
            <p className="mt-0.5 max-w-xl text-sm text-[var(--text-muted)]">
              Model lower spending or higher income. Compare instantly, then optionally preview the whole
              dashboard with those assumptions.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetWhatIf}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-2)]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <SliderField
            id="what-if-expense-cut"
            label="Cut all expenses"
            hint="Simulates spending discipline across every expense line."
            value={cut}
            onChange={setCut}
            min={0}
            max={50}
            step={1}
            suffix="%"
            display={`${cut}% less than recorded`}
          />
          <SliderField
            id="what-if-income-boost"
            label="Boost all income"
            hint="Simulates raises, side income, or bonuses as a flat % on inflows."
            value={boost}
            onChange={setBoost}
            min={0}
            max={40}
            step={1}
            suffix="%"
            display={`+${boost}% on income`}
          />
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 backdrop-blur-sm sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Projected vs baseline
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
              <dt className="text-[var(--text-muted)]">Ending balance</dt>
              <dd className="text-right">
                <span className="tabular-nums text-[var(--text-strong)]">
                  {formatCurrency(projected.balance)}
                </span>
                <span className="ml-2 text-xs text-[var(--text-muted)]">
                  was {formatCurrency(baseline.balance)}
                </span>
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <dt className="text-[var(--text-muted)]">Balance delta</dt>
              <dd
                className={`font-medium tabular-nums ${
                  deltaBalance > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : deltaBalance < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--text-strong)]'
                }`}
              >
                {deltaBalance > 0 ? '+' : ''}
                {formatCurrency(deltaBalance)}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-xs text-[var(--text-muted)]">
              <span>Income {formatCurrency(projected.income)}</span>
              <span>Expenses {formatCurrency(projected.expenses)}</span>
            </div>
          </dl>
          {!hasAdjustment && (
            <p className="mt-4 text-xs text-[var(--text-muted)]">Move a slider to see numbers change.</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3 sm:items-center">
          <input
            type="checkbox"
            checked={apply}
            onChange={(e) => setApply(e.target.checked)}
            disabled={!hasAdjustment}
            className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] sm:mt-0"
          />
          <span>
            <span className="block text-sm font-medium text-[var(--text-strong)]">
              Apply scenario to dashboard
            </span>
            <span className="block text-xs text-[var(--text-muted)]">
              Summary, charts, insights, and the transaction table reflect adjusted amounts. Your stored data
              stays unchanged; edit still opens real values.
            </span>
          </span>
        </label>
        {apply && hasAdjustment && (
          <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            Live preview on
          </span>
        )}
      </div>
    </section>
  )
}

function SliderField({
  id,
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  display,
}: {
  id: string
  label: string
  hint: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  step: number
  suffix: string
  display: string
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <label htmlFor={id} className="text-sm font-medium text-[var(--text-strong)]">
            {label}
          </label>
          <p className="text-xs text-[var(--text-muted)]">{hint}</p>
        </div>
        <span className="font-display text-xl font-semibold tabular-nums text-[var(--accent)]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] accent-[var(--accent)] dark:accent-[var(--accent)]"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <p className="mt-1 text-xs text-[var(--text-muted)]">{display}</p>
    </div>
  )
}
