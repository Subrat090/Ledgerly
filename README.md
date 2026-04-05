# Ledgerly — Finance Dashboard (Zorvyn assignment)

A single-page **finance dashboard** built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Zustand** (with **localStorage** persistence), and **Recharts** for visualizations. Data is **mock/static**; there is no backend.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm run build   # production build
npm run preview # serve dist locally
```

## Features (mapped to requirements)

| Requirement | Implementation |
|-------------|----------------|
| **Dashboard overview** | Summary cards: total balance (with configurable starting balance), total income, total expenses. |
| **Time-based chart** | Area chart: **running balance by month** after transactions. |
| **Categorical chart** | Donut-style **pie chart** of **expense totals by category**. |
| **Transactions** | Table with date, description, category, type (income/expense), amount. |
| **Filter / sort / search** | Filter by type and category; search description/category; sort by date, category, or amount (click column headers). |
| **Role-based UI** | Header dropdown: **Viewer** (read-only, no add/edit) vs **Admin** (add + edit via modal). |
| **Insights** | Highest spending category, **month-over-month expense comparison**, simple **savings rate** (income minus expenses as % of income). |
| **State management** | **Zustand** store: transactions, role, theme, filters, sort; **persist** middleware saves transactions, role, theme, last sync time. |
| **UX** | Responsive layout, empty states (no data / no filter matches), keyboard-friendly form labels, sticky header. |

## Optional enhancements included

- **Dark mode** — light / dark / system, with `class="dark"` on `<html>`.
- **Persistence** — transactions and preferences survive reloads (`localStorage` key `zorvyn-finance-v1`).
- **Mock API** — **Mock sync** button simulates a delayed fetch and replaces data with a fresh copy of seed data.
- **Export** — download current transactions as **CSV** or **JSON**.
- **What-if lab** — sliders to **cut all expenses** (0–50%) and **boost all income** (0–40%); live **projected vs baseline** comparison; optional **apply scenario to dashboard** so summary, charts, insights, and the table show adjusted figures (stored data and edits stay real).

## Project structure (high level)

- `src/store/financeStore.ts` — global state, actions, persistence, `selectFilteredTransactions` helper.
- `src/data/seedTransactions.ts` — initial mock transactions.
- `src/lib/insights.ts` — derived metrics for charts and insight cards.
- `src/lib/whatIf.ts` — applies scenario % adjustments to a copy of transactions.
- `src/hooks/useEffectiveTransactions.ts` — raw vs scenario-adjusted list for the dashboard.
- `src/components/*` — layout pieces (header, cards, charts, what-if panel, transactions, modal, theme sync).

## Reasonable assumptions

- Currency is **USD** for display only.
- **Starting balance** (`src/lib/constants.ts`) is used so the **balance trend** and **total balance** card tell a coherent story before the first inflow.
- **Admin** can add/edit only in the UI; there is no server or auth.



Built for evaluation: focuses on UI structure, interactions, and clear state handling rather than production hardening.
