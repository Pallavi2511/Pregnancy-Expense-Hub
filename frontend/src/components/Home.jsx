export default function Home({ setActiveTab }) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40 transition duration-500">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">Welcome to Pregnancy Expense Tracker</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
          Manage your maternity spending, keep every bill and category organized, and track your journey month by month.
          This website helps you stay in control of prenatal costs, plan baby shopping, and monitor post-pregnancy essentials on one dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab && setActiveTab('expenses')}
            className="rounded-2xl bg-sky-600 text-white px-4 py-2 text-sm font-medium"
          >
            Track Expenses
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab('shopping')}
            className="rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium"
          >
            Baby Shopping
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab('postPregnancy')}
            className="rounded-2xl bg-violet-600 text-white px-4 py-2 text-sm font-medium"
          >
            Post-Pregnancy
          </button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-teal-100 bg-teal-50 p-6 dark:border-teal-800 dark:bg-teal-950/30">
            <p className="text-sm uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">Quick Start</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Track expenses</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Add and view pregnancy expenses in one place with clear monthly summaries.</p>
          </div>
          <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">Explore</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Baby shopping & post-pregnancy</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Plan and save for baby essentials and track post-pregnancy care with dedicated sections.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why use this tracker?</h3>
          <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
            <li>• Keep all prenatal receipts in one place.</li>
            <li>• Monitor pregnancy month spending trends.</li>
            <li>• Get a clear view of total maternity costs.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">How it works</h3>
          <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
            <li>• Add expenses with descriptions, categories, and bill uploads.</li>
            <li>• View summaries for total spend, highest month, and average costs.</li>
            <li>• Navigate between the tracker, baby shopping, and post-pregnancy sections.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
