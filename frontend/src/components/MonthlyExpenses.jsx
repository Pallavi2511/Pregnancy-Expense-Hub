import { useEffect, useMemo, useState } from 'react'
import api from '../api'

export default function MonthlyExpenses({ defaultMonth = 1 }) {
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const resp = await api.get(`/api/expenses/month/${selectedMonth}`)
        const data = resp.data
        if (!mounted) return
        if (Array.isArray(data)) {
          setExpenses(data)
        } else if (data && typeof data === 'object') {
          // backend may return { expenses: [...]} or { total:..., count:... }
          setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
        } else {
          setExpenses([])
        }
      } catch (err) {
        if (!mounted) return
        console.error('Failed to load monthly expenses', err)
        setError('Failed to load monthly data')
        setExpenses([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [selectedMonth])

  const total = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses])

  const rupee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

  const months = Array.from({ length: 9 }, (_, i) => ({ value: i + 1, label: `Month ${i + 1}` }))

  return (
    <div className="bg-white dark:bg-slate-950 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-slate-700 transition duration-500">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 via-teal-500 to-cyan-500 text-white">
        <h2 className="text-2xl font-bold">Monthly Expenses</h2>
        <p className="text-white opacity-90">Select a pregnancy month to view totals</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Pregnancy Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 px-3 py-2"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-gray-100 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-slate-400">Selected Month</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-100">Month {selectedMonth}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-gray-100 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-slate-400">Total Amount</div>
            <div className="mt-2 text-2xl font-extrabold text-primary dark:text-teal-300">{loading ? 'Loading...' : rupee.format(total)}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-gray-100 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-slate-400">Number of Expenses</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-100">{loading ? '...' : expenses.length}</div>
          </div>
        </div>

        {error && <div className="text-sm text-red-600 dark:text-rose-400">{error}</div>}

        {expenses.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400">No expenses recorded for Month {selectedMonth}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenses.map((expense, idx) => (
              <div key={expense.id ?? idx} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-100 dark:border-slate-700 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-slate-100">{expense.description || 'Unnamed'}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{expense.date ? new Date(expense.date).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent dark:text-teal-300">{rupee.format(expense.amount || 0)}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">{expense.category || 'Other'}</span>
                  {expense.billFilePath && (
                    <a href={`http://localhost:8080/api/bills/${encodeURIComponent(expense.billFilePath)}`} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-teal-300 text-xs font-semibold">View Bill</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
