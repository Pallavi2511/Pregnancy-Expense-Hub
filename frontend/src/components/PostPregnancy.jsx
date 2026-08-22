import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from '../context/ToastContext'

const categories = ['Pediatric Visits', 'Vaccinations', 'Baby Food', 'Postpartum Care']

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export default function PostPregnancy() {
  const toast = useToast()
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: categories[0],
    bill: '',
  })
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    total: 0,
    highestMonth: { month: null, amount: 0 },
    average: 0,
  })
  const [editingId, setEditingId] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/api/post-pregnancy')
      setExpenses(response.data || [])
    } catch (err) {
      console.error('Failed to load post-pregnancy expenses', err)
      toast.error('Unable to load post-pregnancy expenses')
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/post-pregnancy/summary')
      setSummary(response.data || { total: 0, highestMonth: { month: null, amount: 0 }, average: 0 })
    } catch (err) {
      console.error('Failed to load summary', err)
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchSummary()
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: categories[0],
      bill: '',
    })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.description || !form.amount || !form.date) {
      toast.error('Please complete all required fields.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
        bill: form.bill,
      }

      if (editingId) {
        await api.put(`/api/post-pregnancy/${editingId}`, payload)
        toast.success('Expense updated successfully.')
      } else {
        await api.post('/api/post-pregnancy', payload)
        toast.success('Expense added successfully.')
      }

      resetForm()
      await fetchExpenses()
      await fetchSummary()
    } catch (err) {
      console.error('Save failed', err)
      toast.error('Failed to save the expense.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (expense) => {
    setEditingId(expense.id)
    setForm({
      description: expense.description || '',
      amount: expense.amount?.toString() || '',
      date: expense.date || new Date().toISOString().split('T')[0],
      category: expense.category || categories[0],
      bill: expense.bill || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    setDeleteTargetId(id)
  }

  const cancelDelete = () => {
    if (isDeleting) return
    setDeleteTargetId(null)
  }

  const confirmDelete = async () => {
    const id = deleteTargetId
    if (!id) return

    try {
      setIsDeleting(true)
      await api.delete(`/api/post-pregnancy/${id}`)
      toast.success('Expense deleted successfully.')
      await fetchExpenses()
      await fetchSummary()
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete expense.')
    } finally {
      setIsDeleting(false)
      setDeleteTargetId(null)
    }
  }

  const totalExpenses = useMemo(() => summary.total ?? 0, [summary])

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-teal-100 bg-teal-50 p-6 shadow-lg dark:border-teal-800 dark:bg-teal-950/20 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Total Post-Pregnancy</p>
          <h2 className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">{currencyFormatter.format(totalExpenses)}</h2>
        </div>
        <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-lg dark:border-purple-800 dark:bg-purple-950/20 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-purple-700 dark:text-purple-300">Highest Month</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Month {summary.highestMonth?.month || '—'}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{currencyFormatter.format(summary.highestMonth?.amount ?? 0)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Average Monthly</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{currencyFormatter.format(summary.average ?? 0)}</h2>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition duration-500">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Post-Pregnancy Expense</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Track pediatric visits, vaccines, baby food, and postpartum care costs.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-teal-400 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            Reset form
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Description</span>
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Pediatric consultation, formula, etc."
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Amount</span>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              min="0"
              step="0.01"
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Bill Upload</span>
            <input
              type="text"
              value={form.bill}
              onChange={(e) => handleChange('bill', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Bill file name or URL"
            />
          </label>

          <div className="lg:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-teal-400 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition duration-500">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Bill</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition duration-150">
                  <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100">{expense.description}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-teal-300">{currencyFormatter.format(expense.amount || 0)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100">{expense.category}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{expense.bill || '—'}</td>
                  <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 space-x-2">
                    <button type="button" onClick={() => handleEdit(expense)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">Edit</button>
                    <button type="button" onClick={() => handleDelete(expense.id)} className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete this post-pregnancy expense?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}
