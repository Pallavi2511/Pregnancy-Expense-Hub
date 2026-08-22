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
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-glow bg-gradient-to-br from-teal-500 via-cyan-500 to-purple-600 text-white dark:from-slate-800 dark:via-slate-900 dark:to-purple-700 dark:text-slate-100 transition duration-300 min-h-[240px]">
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">💰</span>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Total Expenses</h3>
      </div>

      <p className="relative mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
        {loading ? 'Loading...' : currencyFormatter.format(overview.total)}
      </p>

      <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/15 backdrop-blur-sm p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
            <span>📅</span> Highest Month
          </p>
          <p className="mt-2 text-lg font-bold">Month {overview.highestMonth?.month ?? '—'}</p>
          <p className="text-sm text-white/80">{currencyFormatter.format(overview.highestMonth?.amount ?? 0)}</p>
        </div>
        <div className="rounded-xl bg-white/15 backdrop-blur-sm p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
            <span>📊</span> Average Monthly
          </p>
          <p className="mt-2 text-lg font-bold">{currencyFormatter.format(overview.average)}</p>
        </div>
      </div>

      {error && (
        <p className="relative mt-4 rounded-lg bg-rose-950/40 px-3 py-2 text-sm text-rose-100">{error}</p>
      )}
    </div>
  )
}
