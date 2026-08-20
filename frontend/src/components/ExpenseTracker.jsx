import Dashboard from './Dashboard'

export default function ExpenseTracker() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition duration-500">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Expense Tracker</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Track expenses across medical visits, bills, and baby shopping costs.</p>
      </div>
      <Dashboard />
    </div>
  )
}
