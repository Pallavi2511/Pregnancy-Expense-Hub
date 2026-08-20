import { useEffect, useState } from 'react'
import api from '../api'

export default function TotalExpenses() {
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const rupee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

  const loadTotal = async () => {
    try {
      setLoading(true)
      setError(null)
      const resp = await api.get('/api/expenses/total')
      setTotal(resp.data ?? 0)
    } catch (err) {
      console.error('Failed to load total', err)
      setError('Unable to load total')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTotal()
  }, [])

  return (
    <div className="rounded-lg shadow-soft p-8 text-slate-900 dark:text-white bg-gradient-to-br from-primary to-secondary transition-colors duration-500 border border-gray-100 dark:border-transparent">
      <div className="flex items-center justify-between">
        <div>
          <p className="opacity-90 text-lg mb-2">Total Expenses</p>
          <p className="text-5xl font-bold">{loading ? 'Loading...' : rupee.format(total)}</p>
          <p className="opacity-75 text-sm mt-2">All recorded expenses</p>
        </div>
        <div className="text-6xl opacity-25">💸</div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {error && <p className="text-sm text-rose-100 mr-auto">{error}</p>}
        <button onClick={loadTotal} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm">Refresh</button>
      </div>
    </div>
  )
}
