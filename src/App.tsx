import { HeaderBar } from './components/HeaderBar'
import { ThemeSync } from './components/ThemeSync'
import { SummaryCards } from './components/SummaryCards'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { CategorySpendChart } from './components/CategorySpendChart'
import { InsightsSection } from './components/InsightsSection'
import { WhatIfPanel } from './components/WhatIfPanel'
import { TransactionsPanel } from './components/TransactionsPanel'
import { useFinanceStore } from './store/financeStore'

function App() {
  const theme = useFinanceStore((s) => s.theme)

  return (
    <>
      <ThemeSync theme={theme} />
      <div className="min-h-svh bg-[var(--surface-2)] text-[var(--text-strong)] transition-colors">
        <HeaderBar />
        <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
          <SummaryCards />
          <WhatIfPanel />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <BalanceTrendChart />
            </div>
            <div className="lg:col-span-2">
              <CategorySpendChart />
            </div>
          </div>
          <InsightsSection />
          <TransactionsPanel />
        </main>
        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)]">
          Ledgerly demo — mock data, local persistence, and simulated roles for evaluation.
        </footer>
      </div>
    </>
  )
}

export default App
