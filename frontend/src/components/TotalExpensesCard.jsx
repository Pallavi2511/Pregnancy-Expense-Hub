import { useEffect, useState } from 'react'
import api from '../api'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export default function TotalExpensesCard({ expenses }) {
  const [overview, setOverview] = useState({
    total: 0,
    highestMonth: { month: null, amount: 0 },
    average: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/api/expenses/summary/overview')
        setOverview(response.data || {
          total: 0,
          highestMonth: { month: null, amount: 0 },
          average: 0,
        })
      } catch (err) {
        console.error('Failed to load overview', err)
        setError('Unable to load summary')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [expenses])

  return (
    <div className="rounded-lg p-6 shadow-lg bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-600 text-white dark:from-slate-800 dark:via-slate-900 dark:to-purple-700 dark:text-slate-100 transition duration-300 min-h-[240px]">
      <div>
        <h3 className="text-lg font-bold">Total Expenses</h3>
        {loading ? (
          <p className="text-3xl font-semibold mt-4">Loading...</p>
        ) : (
          <p className="text-3xl font-semibold mt-4">{currencyFormatter.format(overview.total)}</p>
        )}
      </div>

      <div className="mt-6 space-y-3 text-sm sm:text-base">
        <p className="inline-flex items-center gap-2">
          <span>📅</span>
          <span>
            Highest Month: Month {overview.highestMonth?.month ?? '—'} ({currencyFormatter.format(overview.highestMonth?.amount ?? 0)})
          </span>
        </p>
        <p className="inline-flex items-center gap-2">
          <span>📊</span>
          <span>Average Monthly: {currencyFormatter.format(overview.average)}</span>
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-rose-100">{error}</p>}
    </div>
  )
}
