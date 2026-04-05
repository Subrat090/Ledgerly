import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { Transaction } from '../types/transaction'
import { STARTING_BALANCE } from './constants'
import { formatInrAmountPlain, formatShortDate } from './formatCurrency'
import { netBalance, totalExpenses, totalIncome } from './insights'

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Full report: summary + all transactions (stored amounts in INR). */
export function exportFinanceReportPdf(transactions: Transaction[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = 16

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Ledgerly — Finance report', 14, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, y)
  y += 10

  const income = totalIncome(transactions)
  const expenses = totalExpenses(transactions)
  const balance = netBalance(transactions, STARTING_BALANCE)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Total income: Rs. ${formatInrAmountPlain(income)}`, 14, y)
  y += 5
  doc.text(`Total expenses: Rs. ${formatInrAmountPlain(expenses)}`, 14, y)
  y += 5
  doc.text(`Net balance (incl. starting balance): Rs. ${formatInrAmountPlain(balance)}`, 14, y)
  y += 5
  doc.text(`Starting balance assumed: Rs. ${formatInrAmountPlain(STARTING_BALANCE)}`, 14, y)
  y += 10

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text('Amounts in Indian Rupees (INR). Rs. used in PDF for font compatibility.', 14, y)
  y += 6
  doc.setTextColor(0)

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount (Rs.)']],
    body: sorted.map((t) => [
      formatShortDate(t.date),
      t.description.length > 55 ? `${t.description.slice(0, 55)}…` : t.description,
      t.category,
      t.type,
      `${t.type === 'expense' ? '−' : '+'}${formatInrAmountPlain(t.amount)}`,
    ]),
    styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    showHead: 'everyPage',
  })

  doc.save(`ledgerly-report-${todayStamp()}.pdf`)
}
