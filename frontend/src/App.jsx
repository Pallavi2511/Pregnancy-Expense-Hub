import { useEffect, useState } from 'react'
import { BrowserRouter as Router, NavLink, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import ExpenseTracker from './components/ExpenseTracker'
import BabyShopping from './components/BabyShopping'
import PostPregnancy from './components/PostPregnancy'
import PregnancyJourney from './components/PregnancyJourney'

function App() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="container mx-auto px-4 py-6">
          <nav className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40 transition duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pregnancy Expense Hub</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Track expenses and plan baby shopping in one place.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-teal-500 text-white shadow-lg dark:bg-teal-400/90' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/tracker"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-teal-500 text-white shadow-lg dark:bg-teal-400/90' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
                  }
                >
                  Expense Tracker
                </NavLink>
                <NavLink
                  to="/shopping"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-teal-500 text-white shadow-lg dark:bg-teal-400/90' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
                  }
                >
                  Baby Shopping
                </NavLink>
                <NavLink
                  to="/journey"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-teal-500 text-white shadow-lg dark:bg-teal-400/90' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
                  }
                >
                  Pregnancy Journey
                </NavLink>
                <NavLink
                  to="/post-pregnancy"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-teal-500 text-white shadow-lg dark:bg-teal-400/90' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
                  }
                >
                  Post-Pregnancy
                </NavLink>
                <button
                  type="button"
                  onClick={() => setIsDark((prev) => !prev)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition duration-300 hover:border-teal-400 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-teal-300 dark:hover:bg-slate-800"
                >
                  {isDark ? 'Light' : 'Dark'} Mode
                </button>
              </div>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tracker" element={<ExpenseTracker />} />
              <Route path="/shopping" element={<BabyShopping />} />
              <Route path="/journey" element={<PregnancyJourney />} />
              <Route path="/post-pregnancy" element={<PostPregnancy />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
