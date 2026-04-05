import { useMemo } from 'react'
import { applyWhatIfToTransactions } from '../lib/whatIf'
import { useFinanceStore } from '../store/financeStore'

/** Transactions used for dashboard when "apply scenario" is on; otherwise stored data. */
export function useEffectiveTransactions() {
  const raw = useFinanceStore((s) => s.transactions)
  const apply = useFinanceStore((s) => s.whatIfApplyToDashboard)
  const cut = useFinanceStore((s) => s.whatIfExpenseCutPercent)
  const boost = useFinanceStore((s) => s.whatIfIncomeBoostPercent)

  return useMemo(() => {
    if (!apply) return raw
    return applyWhatIfToTransactions(raw, cut, boost)
  }, [raw, apply, cut, boost])
}

export function useWhatIfScenarioActive(): boolean {
  const apply = useFinanceStore((s) => s.whatIfApplyToDashboard)
  const cut = useFinanceStore((s) => s.whatIfExpenseCutPercent)
  const boost = useFinanceStore((s) => s.whatIfIncomeBoostPercent)
  return apply && (cut > 0 || boost > 0)
}
