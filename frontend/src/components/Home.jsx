import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const priorityOrder = { High: 0, Medium: 1, Low: 2 }

export default function Home() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [shoppingExpenses, setShoppingExpenses] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [isChecklistAvailable, setIsChecklistAvailable] = useState(true)

  useEffect(() => {
    const fetchOverview = async () => {
      const [expenseResult, shoppingResult, wishlistResult] = await Promise.allSettled([
        api.get('/api/expenses'),
        api.get('/api/baby-shopping'),
        api.get('/api/baby-shopping/wishlist'),
      ])

      if (expenseResult.status === 'fulfilled') setExpenses(expenseResult.value.data || [])
      if (shoppingResult.status === 'fulfilled') setShoppingExpenses(shoppingResult.value.data || [])
      if (wishlistResult.status === 'fulfilled') {
        setWishlist(wishlistResult.value.data || [])
      } else {
        setIsChecklistAvailable(false)
      }
    }

    fetchOverview()
  }, [])

  const totals = useMemo(() => {
    const allExpenses = [...expenses, ...shoppingExpenses]
    const today = new Date()
    const totalSpent = allExpenses.reduce((total, expense) => total + (expense.amount || 0), 0)
    const thisMonthSpent = allExpenses
      .filter((expense) => {
        const expenseDate = new Date(`${expense.date}T00:00:00`)
        return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear()
      })
      .reduce((total, expense) => total + (expense.amount || 0), 0)
    const plannedCost = wishlist.reduce((total, item) => total + (item.estimatedCost || 0), 0)

    return { totalSpent, thisMonthSpent, plannedCost }
  }, [expenses, shoppingExpenses, wishlist])

  const urgentItems = useMemo(() => [...wishlist]
    .sort((first, second) => (priorityOrder[first.priority] ?? 3) - (priorityOrder[second.priority] ?? 3))
    .slice(0, 3), [wishlist])

  return (
    <div className="space-y-8">
      <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:shadow-slate-950/40">
        <img
          src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1800&q=85"
          alt="Baby shoes on a soft blanket"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-white/90 dark:bg-slate-950/85" />
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-2/5 bg-gradient-to-l from-white/10 to-white/90 dark:from-slate-950/10 dark:to-slate-950/85 lg:block" />
        <div className="p-8 sm:p-10">
          <h1 className="max-w-3xl text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">Welcome to Pregnancy Expense Tracker</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700 dark:text-slate-200">
            Manage your maternity spending, keep every bill and category organized, and track your journey month by month.
            This website helps you stay in control of prenatal costs, plan baby shopping, and monitor post-pregnancy essentials on one dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/tracker')}
              className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Track Expenses
            </button>
            <button
              type="button"
              onClick={() => navigate('/shopping')}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Baby Shopping
            </button>
            <button
              type="button"
              onClick={() => navigate('/post-pregnancy')}
              className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Post-Pregnancy
            </button>
          </div>
          <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/tracker')}
              className="rounded-3xl border border-teal-100 bg-teal-50/95 p-6 text-left transition hover:border-teal-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:border-teal-800 dark:bg-teal-950/80 dark:focus:ring-offset-slate-900"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">Quick Start</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Track expenses</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Add and view pregnancy expenses in one place with clear monthly summaries.</p>
            </button>
            <div className="rounded-3xl border border-purple-100 bg-purple-50/95 p-6 dark:border-purple-800 dark:bg-purple-950/80">
              <p className="text-sm uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">Explore</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Baby shopping & post-pregnancy</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Plan and save for baby essentials and track post-pregnancy care with dedicated sections.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Today&apos;s Overview</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your recorded spending and planned baby purchases at a glance.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 dark:border-teal-900/70 dark:bg-teal-950/30">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Total spent</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{currencyFormatter.format(totals.totalSpent)}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-900/70 dark:bg-sky-950/30">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">This month</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{currencyFormatter.format(totals.thisMonthSpent)}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/30">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Planned shopping</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{currencyFormatter.format(totals.plannedCost)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button type="button" onClick={() => navigate('/tracker')} className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
              Add Expense
            </button>
            <button type="button" onClick={() => navigate('/shopping')} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Add Baby Purchase
            </button>
            <button type="button" onClick={() => navigate('/shopping')} className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50">
              Add Checklist Item
            </button>
            <button type="button" onClick={() => navigate('/tracker')} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              View Bills
            </button>
          </div>
        </div>

        <aside className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-lg dark:border-amber-900/70 dark:bg-amber-950/20">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Priority Checklist</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">The next planned purchases to keep in view.</p>
            </div>
            <button type="button" onClick={() => navigate('/shopping')} className="shrink-0 text-sm font-semibold text-amber-800 underline decoration-amber-400 underline-offset-4 dark:text-amber-200">
              Open
            </button>
          </div>
          {!isChecklistAvailable ? (
            <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">Checklist data is unavailable until the backend is restarted.</p>
          ) : urgentItems.length === 0 ? (
            <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">No planned purchases yet. Add an item before the next shopping trip.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {urgentItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-white/80 px-4 py-3 dark:border-amber-900/70 dark:bg-slate-900/70">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{currencyFormatter.format(item.estimatedCost || 0)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${item.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200' : item.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200' : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200'}`}>
                    {item.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  )
}
