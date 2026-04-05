const INR_LOCALE = 'en-IN'

/** Indian Rupees — used across UI, charts, and exports. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(INR_LOCALE, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(value)
}

/** Number only (no symbol) — PDF / plain text where fonts may lack ₹. */
export function formatInrAmountPlain(value: number): string {
  return new Intl.NumberFormat(INR_LOCALE, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(value)
}

/** Short tick labels for chart Y-axis (k / L / Cr). */
export function formatCompactInr(value: number): string {
  const v = Math.abs(value)
  const sign = value < 0 ? '−' : ''
  if (v >= 1e7) return `${sign}₹${(v / 1e7).toFixed(v >= 1e8 ? 0 : 1)}Cr`
  if (v >= 1e5) return `${sign}₹${(v / 1e5).toFixed(v >= 1e6 ? 0 : 1)}L`
  if (v >= 1e3) return `${sign}₹${(v / 1e3).toFixed(0)}k`
  return formatCurrency(value)
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(INR_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso + 'T12:00:00'))
}
