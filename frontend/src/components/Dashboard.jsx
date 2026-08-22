import { useState, useEffect } from 'react'
import api from '../api'
import AddExpense from './AddExpense'
import ExpenseList from './ExpenseList'
import TotalExpensesCard from './TotalExpensesCard'
import MonthlyExpenses from './MonthlyExpenses'
import MonthlyChart from './MonthlyChart'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({
    monthly: {},
    billsCount: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [expensesResponse, monthlyResponse, billsCountResponse] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/expenses/summary/monthly'),
        api.get('/api/expenses/summary/bills-count'),
      ])

      setExpenses(expensesResponse.data || [])
      setSummary({
        monthly: monthlyResponse.data ?? {},
        billsCount: billsCountResponse.data?.billsCount ?? 0,
      })
    } catch (err) {
      setError('Failed to load expenses')
      console.error('Error fetching expenses:', err)
      setExpenses([])
      setSummary({
        monthly: {},
        billsCount: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenses = async () => {
    try {
      setError(null)
      const response = await api.get('/api/expenses')
      setExpenses(response.data || [])
    } catch (err) {
      setError('Failed to load expenses')
      console.error('Error fetching expenses:', err)
      setExpenses([])
    }
  }

  const handleExpenseAdded = (newExpense) => {
    if (!newExpense || !newExpense.id) {
      fetchData()
      return
    }
    setExpenses((prev) => [newExpense, ...prev])
    fetchData()
  }

  const handleExpenseDeleted = (deletedId) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== deletedId))
    fetchData()
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-rose-950 border border-red-200 dark:border-rose-700 rounded-lg p-4 transition duration-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-red-800 dark:text-rose-200 font-bold">Unable to load expenses</h3>
              <p className="text-red-600 dark:text-rose-300">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg shadow-md p-10 text-center transition duration-500 border border-gray-200 dark:border-transparent">
          <p className="text-gray-800 dark:text-slate-300 text-lg">Loading expenses...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
          <div className="text-teal-600 dark:text-teal-300 text-3xl mb-2">💰</div>
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-slate-100">Track Expenses</h3>
          <p className="text-gray-800 dark:text-slate-400">Record all your expenses in one place</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
          <div className="text-teal-600 dark:text-purple-300 text-3xl mb-2">📊</div>
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-slate-100">View Analytics</h3>
          <p className="text-gray-800 dark:text-slate-400">Get insights on your spending habits</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
          <div className="text-accent dark:text-teal-200 text-3xl mb-2">📁</div>
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-slate-100">Manage Bills</h3>
          <p className="text-gray-800 dark:text-slate-400">Upload and organize bill receipts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TotalExpensesCard expenses={expenses} />
        <MonthlyChart expenses={expenses} onRefresh={fetchExpenses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-950 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-teal-600 font-semibold">Monthly Totals</p>
              <p className="mt-3 text-base text-gray-700 dark:text-slate-300">Amounts grouped by pregnancy month</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-teal-100 text-teal-700 px-3 py-1 text-xs font-semibold">₹</span>
          </div>
          <div className="mt-6 space-y-3">
            {Object.entries(summary.monthly).map(([month, total]) => (
              <div key={month} className="flex items-center justify-between text-sm text-gray-700 dark:text-slate-300">
                <span>Month {month}</span>
                <span className="font-semibold">{currencyFormatter.format(total)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="self-start bg-white dark:bg-slate-950 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral/15 text-lg">🧾</span>
            <div>
              <p className="text-sm uppercase tracking-wide text-purple-700 dark:text-purple-300 font-semibold">Bill Count</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Expenses with uploaded bills</p>
            </div>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">{summary.billsCount}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Keep bill images attached to support reimbursement and documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <AddExpense onExpenseAdded={handleExpenseAdded} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <ExpenseList
            expenses={expenses}
            onDelete={handleExpenseDeleted}
            onRefresh={fetchExpenses}
          />
        </div>
      </div>

      <MonthlyExpenses expenses={expenses} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-gray-200 shadow-md">
          <h3 className="font-bold text-lg text-teal-600 mb-2">💡 Tips</h3>
          <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li>• Keep receipts organized by pregnancy month</li>
            <li>• Upload bill photos for documentation</li>
            <li>• Track expenses by category for better insights</li>
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-gray-200 shadow-md">
          <h3 className="font-bold text-lg text-purple-700 mb-2">📈 Dashboard Info</h3>
          <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li>• View all expenses in one place</li>
            <li>• Get monthly breakdowns by pregnancy month</li>
            <li>• Monitor total spending with ease</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
