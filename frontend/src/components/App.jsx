import React, { useState } from 'react'
import Home from './Home.jsx'
import ExpenseTracker from './ExpenseTracker.jsx'
import BabyShopping from './BabyShopping.jsx'
import PostPregnancy from './PostPregnancy.jsx'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderTab = () => {
    switch (activeTab) {
      case 'expenses':
        return <ExpenseTracker />
      case 'shopping':
        return <BabyShopping />
      case 'postPregnancy':
        return <PostPregnancy />
      default:
        return <Home setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Pregnancy Expense Tracker</h1>
          <nav className="space-x-3">
            <button onClick={() => setActiveTab('home')} className="rounded-md px-3 py-1 text-sm bg-white ring-1 ring-slate-200">Home</button>
            <button onClick={() => setActiveTab('expenses')} className="rounded-md px-3 py-1 text-sm bg-white ring-1 ring-slate-200">Expenses</button>
            <button onClick={() => setActiveTab('shopping')} className="rounded-md px-3 py-1 text-sm bg-white ring-1 ring-slate-200">Shopping</button>
            <button onClick={() => setActiveTab('postPregnancy')} className="rounded-md px-3 py-1 text-sm bg-white ring-1 ring-slate-200">Post-Pregnancy</button>
          </nav>
        </header>

        <main>{renderTab()}</main>
      </div>
    </div>
  )
}
