
import { useEffect, useState } from 'react'
import api from '../api'
import { exportExpensesToCSV, exportExpensesToPDF } from '../utils/exportUtils'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from '../context/ToastContext'

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

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp)$/i

function BillThumbnail({ filename, url }) {
  const [imgError, setImgError] = useState(false)
  const isImage = IMAGE_EXTENSIONS.test(filename)

  if (isImage && !imgError) {
    return (
      <img
        src={url}
        alt="Bill preview"
        loading="lazy"
        onError={() => setImgError(true)}
        className="h-12 w-12 rounded-md object-cover border border-gray-200 dark:border-slate-600 bg-white"
      />
    )
  }

  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 text-xl">
      📄
    </span>
  )
}

export default function ExpenseList({ expenses = [], onDelete, onRefresh }) {
  const toast = useToast()
  const [localExpenses, setLocalExpenses] = useState(expenses)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    id: '',
    description: '',
    amount: '',
    date: '',
    category: '',
    pregnancyMonth: '',
    billFilePath: '',
    billFile: null,
  })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExportingBills, setIsExportingBills] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setLocalExpenses(expenses)
  }, [expenses])

  const totalPages = Math.max(1, Math.ceil(localExpenses.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedExpenses = localExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  const getBillUrl = (filename) =>
    `http://localhost:8080/api/bills/${encodeURIComponent(filename)}`

  const handleExportCSV = () => {
    exportExpensesToCSV(localExpenses, `expenses-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleExportPDF = () => {
    exportExpensesToPDF(localExpenses, `expenses-${new Date().toISOString().split('T')[0]}.pdf`, 'Pregnancy Expense Report')
  }

  const handleExportBillsZip = async () => {
    try {
      setIsExportingBills(true)
      const response = await api.get('/api/expenses/bills/export-zip', { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'bills-export.zip'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export bills', err)
      toast.error('Failed to export bills')
    } finally {
      setIsExportingBills(false)
    }
  }

  const handleDelete = (id) => {
    if (!id) return
    setDeleteTargetId(id)
  }

  const cancelDelete = () => {
    if (deletingId) return
    setDeleteTargetId(null)
  }

  const confirmDelete = async () => {
    const id = deleteTargetId
    if (!id) return

    try {
      setDeletingId(id)
      await api.delete(`/api/expenses/${id}`)
      toast.success('Expense deleted successfully')
      setLocalExpenses((prev) => prev.filter((expense) => expense.id !== id))
      if (onDelete) {
        onDelete(id)
      }
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete expense')
    } finally {
      setDeletingId(null)
      setDeleteTargetId(null)
    }
  }

  const openEditModal = (expense) => {
    setEditForm({
      id: expense.id,
      description: expense.description || '',
      amount: expense.amount || '',
      date: expense.date ? expense.date.split('T')[0] : '',
      category: expense.category || '',
      pregnancyMonth: expense.pregnancyMonth || '',
      billFilePath: expense.billFilePath || '',
      billFile: null,
    })
    setEditingId(expense.id)
    setIsEditOpen(true)
  }

  const closeEditModal = () => {
    setIsEditOpen(false)
    setEditingId(null)
    setEditForm({
      id: '',
      description: '',
      amount: '',
      date: '',
      category: '',
      pregnancyMonth: '',
      billFilePath: '',
      billFile: null,
    })
  }

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditSave = async () => {
    if (!editingId || isSaving) return
    setIsSaving(true)
    try {
      const updatedExpense = {
        description: editForm.description,
        amount: Number(editForm.amount) || 0,
        date: editForm.date,
        category: editForm.category,
        pregnancyMonth: editForm.pregnancyMonth ? Number(editForm.pregnancyMonth) : null,
        billFilePath: editForm.billFilePath,
      }

      let savedExpense = null
      if (editForm.billFile) {
        const formData = new FormData()
        formData.append('expense', new Blob([JSON.stringify(updatedExpense)], { type: 'application/json' }))
        formData.append('file', editForm.billFile)

        const response = await api.put(`/api/expenses/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        savedExpense = response.data
      } else {
        const response = await api.put(`/api/expenses/${editingId}`, updatedExpense)
        savedExpense = response.data
      }

      setLocalExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingId ? { ...expense, ...savedExpense } : expense
        )
      )
      toast.success('Expense updated successfully')
      closeEditModal()
    } catch (err) {
      console.error('Update failed', err)
      toast.error('Failed to update expense')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const rupee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="bg-gray-50 dark:bg-slate-950 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700 transition duration-500">
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-purple-600">
        <h2 className="text-2xl font-bold text-black dark:text-white">Expense History</h2>
        <p className="text-black dark:text-white">Total Expenses: {localExpenses.length}</p>
      </div>

      {expenses.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-900 dark:text-white text-lg font-semibold">No expenses recorded yet</p>
          <p className="text-gray-600 dark:text-slate-300 mt-2">Add your first expense to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-black dark:text-white">Description</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black dark:text-white">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black dark:text-white">Date</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black dark:text-white">Category</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black dark:text-white">Pregnancy Month</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black dark:text-white">Bill</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((expense, index) => (
                <tr
                  key={expense.id || index}
                  className="border-b border-gray-200 hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800 transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 text-lg font-bold text-gray-900 dark:text-white">{expense.description || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-teal-300">
                    {rupee.format(expense.amount || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-300">{formatDate(expense.date)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-pink-200 transition-colors duration-200 dark:bg-pink-200/10 dark:text-gray-300">
                      {expense.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {expense.pregnancyMonth ? (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Month {expense.pregnancyMonth}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {expense.billFilePath ? (
                      <a
                        href={getBillUrl(expense.billFilePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Bill"
                        className="group flex w-fit items-center gap-2"
                      >
                        <BillThumbnail filename={expense.billFilePath} url={getBillUrl(expense.billFilePath)} />
                        <span className="text-accent group-hover:text-blue-700 font-semibold underline text-xs">View</span>
                      </a>
                    ) : (
                      <span className="text-gray-800 dark:text-slate-300">No Bill</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(expense)}
                        title="Edit"
                        className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        title="Delete"
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === expense.id ? 'Deleting...' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {localExpenses.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-700 flex flex-wrap justify-end gap-3 transition duration-500">
        <button
          onClick={handleExportCSV}
          disabled={localExpenses.length === 0}
          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-600 font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
        <button
          onClick={handleExportPDF}
          disabled={localExpenses.length === 0}
          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-600 font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export PDF
        </button>
        <button
          onClick={handleExportBillsZip}
          disabled={isExportingBills}
          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-600 font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExportingBills ? 'Preparing ZIP...' : 'Download Bills (ZIP)'}
        </button>
        <button
          onClick={handleRefresh}
          className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition duration-200"
        >
          Refresh
        </button>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-semibold text-black dark:text-white">Edit Expense</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">Update the details and save your changes.</p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                aria-label="Close edit modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-black dark:text-white">
                <span>Description</span>
                <input
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="space-y-2 text-sm text-black dark:text-white">
                <span>Amount</span>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => handleEditChange('amount', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="space-y-2 text-sm text-black dark:text-white">
                <span>Date</span>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => handleEditChange('date', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="space-y-2 text-sm text-black dark:text-white">
                <span>Category</span>
                <input
                  value={editForm.category}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="space-y-2 text-sm text-black dark:text-white">
                <span>Pregnancy Month</span>
                <input
                  type="number"
                  min="0"
                  value={editForm.pregnancyMonth}
                  onChange={(e) => handleEditChange('pregnancyMonth', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="space-y-2 text-sm text-black dark:text-white sm:col-span-2">
                <span>Bill File</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleEditChange('billFile', e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition file:cursor-pointer focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                {editForm.billFilePath && !editForm.billFile && (
                  <p className="text-sm text-gray-600 dark:text-slate-300">Current bill: {editForm.billFilePath}</p>
                )}
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={isSaving}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete this expense?"
        message="This action cannot be undone. The expense and its attached bill link will be permanently removed."
        confirmLabel="Delete"
        isConfirming={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}



