import { useState } from 'react'
import api from '../api'

export default function AddExpense({ onExpenseAdded }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Doctor Visit',
    pregnancyMonth: '',
    userId: 1,
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const categories = [
    'Doctor Visit',
    'Ultrasound',
    'Medicines',
    'Blood Tests',
    'Supplements',
    'Hospital Bills',
    'Baby Shopping',
    'Travel',
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      setLoading(true)

      if (!formData.description || !formData.amount || !formData.date) {
        throw new Error('Please fill in all required fields')
      }

      const createdExpense = file
        ? await submitWithFile()
        : await submitWithoutFile()

      if (createdExpense && onExpenseAdded) {
        onExpenseAdded(createdExpense)
      }

      setSuccess(true)
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Doctor Visit',
        pregnancyMonth: '',
        userId: 1,
      })
      setFile(null)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error submitting expense:', err)
    } finally {
      setLoading(false)
    }
  }

  const submitWithFile = async () => {
  const formDataMultipart = new FormData()

  const expenseJson = JSON.stringify({
    description: formData.description,
    amount: parseFloat(formData.amount),
    date: formData.date,
    category: formData.category,
    pregnancyMonth: formData.pregnancyMonth
      ? parseInt(formData.pregnancyMonth)
      : null,
    userId: formData.userId,
  })

  formDataMultipart.append(
    'expense',
    new Blob([expenseJson], { type: 'application/json' })
  )

  formDataMultipart.append('file', file)

  const response = await api.post('/api/expenses', formDataMultipart, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  if (response.status >= 200 && response.status < 300) {
    return response.data
  }

  throw new Error(`HTTP error! status: ${response.status}`)
}

const submitWithoutFile = async () => {
  const formDataMultipart = new FormData()

  const expenseJson = JSON.stringify({
    description: formData.description,
    amount: parseFloat(formData.amount),
    date: formData.date,
    category: formData.category,
    pregnancyMonth: formData.pregnancyMonth
      ? parseInt(formData.pregnancyMonth)
      : null,
    userId: formData.userId,
  })

  formDataMultipart.append(
    'expense',
    new Blob([expenseJson], { type: 'application/json' })
  )

  const response = await api.post('/api/expenses', formDataMultipart, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  if (response.status >= 200 && response.status < 300) {
    return response.data
  }

  throw new Error(`HTTP error! status: ${response.status}`)
}

  return (
    <div className="bg-white dark:bg-slate-950 rounded-lg shadow-soft overflow-hidden border border-gray-100 dark:border-slate-700 transition duration-500">
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold">Add New Expense</h2>
        <p className="text-white opacity-90">Record a new expense</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 transition duration-300">
            <p className="text-emerald-800 dark:text-emerald-200 font-semibold">✓ Expense added successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-rose-950 border border-rose-700 rounded-lg p-4">
            <p className="text-rose-200 font-semibold">✗ Error: {error}</p>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            Description <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Prenatal vitamins"
            className="w-full px-4 py-2 border border-slate-700 bg-slate-950 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
            required
          />
        </div>

        {/* Amount and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-slate-700 bg-slate-950 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-700 bg-slate-950 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
              required
            />
          </div>
        </div>

        {/* Category and Pregnancy Month */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Pregnancy Month</label>
            <input
              type="number"
              name="pregnancyMonth"
              value={formData.pregnancyMonth}
              onChange={handleInputChange}
              placeholder="e.g., 3"
              min="1"
              max="9"
              className="w-full px-4 py-2 border border-slate-700 bg-slate-950 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            Upload Bill/Receipt (Optional)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full h-32 border-2 border-slate-700 bg-slate-950 rounded-lg cursor-pointer hover:border-teal-300 hover:bg-slate-800 transition duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="text-sm text-slate-200">
                  <span className="font-bold text-teal-200">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-400">PNG, JPG, PDF up to 10MB</p>
                {file && <p className="text-xs text-green-600 mt-2">📄 {file.name}</p>}
              </div>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-green-600'
            }`}
          >
            {loading ? 'Adding Expense...' : 'Add Expense'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: 'Medical',
                pregnancyMonth: '',
                userId: 1,
              })
              setFile(null)
              setError(null)
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}
