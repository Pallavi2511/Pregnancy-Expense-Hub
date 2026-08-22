import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import BabyShoppingCategoryChart from './BabyShoppingCategoryChart'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from '../context/ToastContext'

const categories = ['Clothes', 'Toys', 'Furniture', 'Essentials']
const priorities = ['High', 'Medium', 'Low']

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp)$/i

function BillPreview({ filename }) {
  const [imageError, setImageError] = useState(false)
  const url = `http://localhost:8080/api/bills/${encodeURIComponent(filename)}`

  if (IMAGE_EXTENSIONS.test(filename) && !imageError) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" title="View bill">
        <img
          src={url}
          alt="Bill preview"
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-12 w-12 rounded-md border border-slate-200 object-cover dark:border-slate-700"
        />
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xl dark:border-slate-700 dark:bg-slate-950"
      title="View bill"
    >
      📄
    </a>
  )
}

export default function BabyShopping() {
  const toast = useToast()
  const [expenses, setExpenses] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [wishlistForm, setWishlistForm] = useState({
    name: '',
    estimatedCost: '',
    priority: priorities[1],
  })
  const [form, setForm] = useState({
    description: '',
    itemName: '',
    quantity: '1',
    sizeAgeRange: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: categories[0],
    bill: '',
  })
  const [loading, setLoading] = useState(false)
  const [billFile, setBillFile] = useState(null)
  const [summary, setSummary] = useState({
    total: 0,
    highestMonth: { month: null, amount: 0 },
    average: 0,
  })
  const [editingId, setEditingId] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [purchaseTarget, setPurchaseTarget] = useState(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/api/baby-shopping')
      setExpenses(response.data || [])
    } catch (err) {
      console.error('Failed to load baby shopping expenses', err)
      toast.error('Unable to load baby shopping expenses')
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/baby-shopping/summary')
      setSummary(response.data || { total: 0, highestMonth: { month: null, amount: 0 }, average: 0 })
    } catch (err) {
      console.error('Failed to load summary', err)
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/api/baby-shopping/wishlist')
      setWishlist(response.data || [])
    } catch (err) {
      console.error('Failed to load wishlist', err)
      toast.error('Unable to load the shopping checklist.')
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchSummary()
    fetchWishlist()
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setForm({
      description: '',
      itemName: '',
      quantity: '1',
      sizeAgeRange: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: categories[0],
      bill: '',
    })
    setBillFile(null)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.description || !form.itemName || !form.quantity || !form.amount || !form.date) {
      toast.error('Please complete all required fields.')
      return
    }

    setLoading(true)
    try {
      const expenseData = {
        description: form.description,
        itemName: form.itemName,
        quantity: Number(form.quantity),
        sizeAgeRange: form.sizeAgeRange,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
        bill: form.bill,
      }

      if (editingId) {
        if (billFile) {
          const payload = new FormData()
          payload.append('expense', new Blob([JSON.stringify(expenseData)], { type: 'application/json' }))
          payload.append('file', billFile)
          await api.put(`/api/baby-shopping/${editingId}`, payload)
        } else {
          await api.put(`/api/baby-shopping/${editingId}`, expenseData)
        }
        toast.success('Expense updated successfully.')
      } else {
        if (billFile) {
          const payload = new FormData()
          payload.append('expense', new Blob([JSON.stringify(expenseData)], { type: 'application/json' }))
          payload.append('file', billFile)
          await api.post('/api/baby-shopping', payload)
        } else {
          await api.post('/api/baby-shopping', expenseData)
        }
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
      itemName: expense.itemName || '',
      quantity: expense.quantity?.toString() || '1',
      sizeAgeRange: expense.sizeAgeRange || '',
      amount: expense.amount?.toString() || '',
      date: expense.date || new Date().toISOString().split('T')[0],
      category: expense.category || categories[0],
      bill: expense.bill || '',
    })
    setBillFile(null)
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
      await api.delete(`/api/baby-shopping/${id}`)
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

  const handleWishlistChange = (field, value) => {
    setWishlistForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleWishlistSubmit = async (event) => {
    event.preventDefault()
    if (!wishlistForm.name || !wishlistForm.estimatedCost) {
      toast.error('Please enter an item name and estimated cost.')
      return
    }

    try {
      await api.post('/api/baby-shopping/wishlist', {
        name: wishlistForm.name,
        estimatedCost: Number(wishlistForm.estimatedCost),
        priority: wishlistForm.priority,
      })
      setWishlistForm({ name: '', estimatedCost: '', priority: priorities[1] })
      await fetchWishlist()
      toast.success('Item added to the shopping checklist.')
    } catch (err) {
      console.error('Failed to add wishlist item', err)
      toast.error('Failed to add the checklist item.')
    }
  }

  const removeWishlistItem = async (id) => {
    try {
      await api.delete(`/api/baby-shopping/wishlist/${id}`)
      await fetchWishlist()
      toast.success('Checklist item removed.')
    } catch (err) {
      console.error('Failed to remove wishlist item', err)
      toast.error('Failed to remove the checklist item.')
    }
  }

  const confirmPurchase = async () => {
    if (!purchaseTarget) return

    try {
      setIsPurchasing(true)
      await api.post(`/api/baby-shopping/wishlist/${purchaseTarget.id}/purchase`)
      await Promise.all([fetchWishlist(), fetchExpenses(), fetchSummary()])
      toast.success(`${purchaseTarget.name} was added to your expenses.`)
      setPurchaseTarget(null)
    } catch (err) {
      console.error('Failed to mark wishlist item as purchased', err)
      toast.error('Failed to convert the checklist item into an expense.')
    } finally {
      setIsPurchasing(false)
    }
  }

  const totalExpenses = useMemo(() => summary.total ?? 0, [summary])

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-teal-100 bg-teal-50 p-6 shadow-lg dark:border-teal-800 dark:bg-teal-950/20 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Total Baby Shopping</p>
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

      <BabyShoppingCategoryChart expenses={expenses} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-lg dark:border-amber-900/70 dark:bg-amber-950/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shopping Checklist</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Plan purchases before they become expenses.</p>
          <form onSubmit={handleWishlistSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <span>Item name</span>
              <input
                type="text"
                value={wishlistForm.name}
                onChange={(event) => handleWishlistChange('name', event.target.value)}
                placeholder="Cot mattress"
                className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 dark:border-amber-900 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <span>Estimated cost</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={wishlistForm.estimatedCost}
                onChange={(event) => handleWishlistChange('estimatedCost', event.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 dark:border-amber-900 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <span>Priority</span>
              <select
                value={wishlistForm.priority}
                onChange={(event) => handleWishlistChange('priority', event.target.value)}
                className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 dark:border-amber-900 dark:bg-slate-950 dark:text-slate-100"
              >
                {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>
            <button type="submit" className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600">
              Add to Checklist
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Planned Purchases</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">{wishlist.length} open</span>
          </div>
          {wishlist.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Your checklist is clear.</p>
          ) : (
            <ul className="mt-5 divide-y divide-slate-200 dark:divide-slate-700">
              {wishlist.map((item) => (
                <li key={item.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{currencyFormatter.format(item.estimatedCost || 0)}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200' : item.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200' : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200'}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => setPurchaseTarget(item)} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
                      Mark Purchased
                    </button>
                    <button type="button" onClick={() => removeWishlistItem(item.id)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-200">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition duration-500">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Baby Shopping Expense</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Capture clothes, toys, furniture, and essentials purchases.</p>
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
              placeholder="Baby blanket, feeding set, etc."
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Item name</span>
            <input
              type="text"
              value={form.itemName}
              onChange={(e) => handleChange('itemName', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Newborn diapers"
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>Size / age range</span>
            <input
              type="text"
              value={form.sizeAgeRange}
              onChange={(e) => handleChange('sizeAgeRange', e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="0-3 months, 6-9 months, or 12-18M"
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
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setBillFile(e.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition file:cursor-pointer focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {billFile && <p className="text-xs text-slate-500 dark:text-slate-400">Selected: {billFile.name}</p>}
            {!billFile && form.bill && <p className="text-xs text-slate-500 dark:text-slate-400">Current bill: {form.bill}</p>}
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Item</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Qty</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Size / Age</th>
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
                  <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100">{expense.itemName || '—'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{expense.quantity || '—'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {expense.sizeAgeRange ? <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-200">{expense.sizeAgeRange}</span> : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-teal-300">{currencyFormatter.format(expense.amount || 0)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100">{expense.category}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {expense.bill ? <BillPreview filename={expense.bill} /> : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(expense)}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete this baby shopping expense?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <ConfirmDialog
        isOpen={purchaseTarget !== null}
        title="Mark this item as purchased?"
        message={purchaseTarget ? `${purchaseTarget.name} will be added to your Baby Shopping expenses for ${currencyFormatter.format(purchaseTarget.estimatedCost || 0)}.` : ''}
        confirmLabel="Mark Purchased"
        isConfirming={isPurchasing}
        onConfirm={confirmPurchase}
        onCancel={() => !isPurchasing && setPurchaseTarget(null)}
      />
    </div>
  )
}
