import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const rupee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleDateString('en-IN') : 'N/A')

const csvEscape = (value) => {
    const str = String(value ?? '')
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

const EXPENSE_COLUMNS = ['Description', 'Amount', 'Date', 'Category', 'Pregnancy Month', 'Bill Attached']

const toRow = (expense) => [
    expense.description || 'N/A',
    expense.amount || 0,
    formatDate(expense.date),
    expense.category || 'Uncategorized',
    expense.pregnancyMonth ? `Month ${expense.pregnancyMonth}` : '-',
    expense.billFilePath ? 'Yes' : 'No',
]

export function exportExpensesToCSV(expenses = [], filename = 'expenses.csv') {
    const rows = expenses.map(toRow)
    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    const csvLines = [
        EXPENSE_COLUMNS.join(','),
        ...rows.map((row) => row.map(csvEscape).join(',')),
        '',
        `Total,${csvEscape(total)}`,
    ]

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, filename)
}

export function exportExpensesToPDF(expenses = [], filename = 'expenses.pdf', title = 'Expense Report') {
    const doc = new jsPDF()
    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    doc.setFontSize(16)
    doc.text(title, 14, 16)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 22)
    doc.text(`Total Expenses: ${rupee.format(total)}`, 14, 28)

    autoTable(doc, {
        startY: 34,
        head: [EXPENSE_COLUMNS],
        body: expenses.map((expense) => {
            const row = toRow(expense)
            row[1] = rupee.format(row[1])
            return row
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [20, 184, 166] },
    })

    doc.save(filename)
}
