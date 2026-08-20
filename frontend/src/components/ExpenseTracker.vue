<template>
  <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
    <div class="mx-auto max-w-6xl">
      <h1 class="text-3xl font-semibold text-slate-900 mb-6">Expense Tracker</h1>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Top dashboard panels -->
      </div>

      <div class="grid gap-4 sm:grid-cols-3 mb-6">
        <div class="rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-5 shadow">
          <p class="text-xs uppercase tracking-wider opacity-80">Track Expenses</p>
          <h3 class="mt-2 text-lg font-semibold">Record all your expenses in one place.</h3>
        </div>
        <div class="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white p-5 shadow">
          <p class="text-xs uppercase tracking-wider opacity-80">View Analytics</p>
          <h3 class="mt-2 text-lg font-semibold">Get insights on your spending habits.</h3>
        </div>
        <div class="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white p-5 shadow">
          <p class="text-xs uppercase tracking-wider opacity-80">Manage Bills</p>
          <h3 class="mt-2 text-lg font-semibold">Upload and organize bill receipts.</h3>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Left: Form -->
        <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <div class="rounded-xl overflow-hidden mb-4">
            <div class="bg-gradient-to-r from-sky-500 to-cyan-400 p-4">
              <h2 class="text-xl font-semibold text-white">Add New Expense</h2>
              <p class="text-sm text-sky-100 mt-1">Quickly add an expense and attach a receipt.</p>
            </div>
          </div>
          <form @submit.prevent="submitExpense" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" for="description">Description</label>
              <input id="description" v-model="form.description" type="text" placeholder="Description"
                     class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" required />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" for="amount">Amount</label>
                <input id="amount" v-model.number="form.amount" type="number" min="0" step="0.01" placeholder="0.00"
                       class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" for="date">Date</label>
                <input id="date" v-model="form.date" type="date"
                       class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" required />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" for="category">Category</label>
                <select id="category" v-model="form.category" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" required>
                  <option value="" disabled>Select category</option>
                  <option>Medical</option>
                  <option>Baby Shopping</option>
                  <option>Post-Pregnancy</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" for="pregnancyMonth">Pregnancy Month</label>
                <select id="pregnancyMonth" v-model.number="form.pregnancyMonth" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
                  <option value="" disabled>Select month</option>
                  <option v-for="m in 9" :key="m" :value="m">Month {{ m }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" for="file">Bill / Receipt (PNG, JPG, PDF up to 10MB)</label>
              <input id="file" ref="fileInput" @change="onFileChange" type="file" accept="image/png, image/jpeg, application/pdf" class="block w-full text-sm text-slate-600" />
              <p v-if="selectedFileName" class="mt-2 text-xs text-slate-500">Selected: {{ selectedFileName }}</p>
            </div>

            <div class="flex gap-3">
              <button type="submit" class="flex-1 rounded-2xl bg-sky-600 text-white px-4 py-3">{{ editId ? 'Update Expense' : 'Add Expense' }}</button>
              <button type="button" @click="clearForm" class="rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-3">Clear</button>
            </div>
          </form>
        </section>

        <!-- Right: History -->
        <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Expense History</h2>
            <div class="text-sm text-slate-500 dark:text-slate-300">Total Expenses: <span class="font-semibold text-slate-900 dark:text-white">{{ formatAmount(total) }}</span></div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead>
                <tr class="text-slate-600 dark:text-slate-300">
                  <th class="py-2 pr-4">Description</th>
                  <th class="py-2 pr-4">Amount</th>
                  <th class="py-2 pr-4">Date</th>
                  <th class="py-2 pr-4">Category</th>
                  <th class="py-2 pr-4">Pregnancy Month</th>
                  <th class="py-2 pr-4">Bill</th>
                  <th class="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="exp in expenses" :key="exp.id" class="bg-slate-50 dark:bg-slate-800">
                  <td class="py-3 pr-4">{{ exp.description }}</td>
                  <td class="py-3 pr-4">${{ formatAmount(exp.amount) }}</td>
                  <td class="py-3 pr-4">{{ formatDate(exp.date) }}</td>
                  <td class="py-3 pr-4">{{ exp.category }}</td>
                  <td class="py-3 pr-4">{{ exp.pregnancyMonth || '-' }}</td>
                  <td class="py-3 pr-4">
                    <a
                      v-if="getBillFilename(exp)"
                      :href="`http://localhost:8080/api/bills/${getBillFilename(exp)}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-500 underline"
                    >
                      View Bill
                    </a>
                    <span v-else class="text-slate-400">-</span>
                  </td>
                  <td class="py-3 pr-4">
                    <div class="flex gap-2">
                      <button @click="editExpense(exp)" title="Edit" class="text-amber-600">Edit</button>
                      <button @click="deleteExpense(exp.id)" title="Delete" class="text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Analytics -->
      <div class="mt-8">
        <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Pregnancy Expenses Overview (9 Months)</h2>
              <p class="text-sm text-slate-500 dark:text-slate-300">Bar chart showing expenses per pregnancy month.</p>
            </div>
            <div>
              <button @click="renderChart" class="rounded-2xl bg-sky-600 text-white px-3 py-2">Refresh Chart</button>
            </div>
          </div>
          <div>
            <canvas ref="chartRef" id="pregnancyChart" height="120"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const expenses = ref([])
const form = ref({
  description: '',
  amount: null,
  category: '',
  date: '',
  pregnancyMonth: null,
  billFilePath: null,
})

const editId = ref(null)
const selectedFile = ref(null)
const selectedFileName = ref('')
const fileInput = ref(null)

const loadExpenses = async () => {
  try {
    const response = await api.get('/api/expenses')
    expenses.value = response.data || []
  } catch (error) {
    console.error('Failed to load expenses', error)
  }
}

const onFileChange = (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) {
    selectedFile.value = null
    selectedFileName.value = ''
    return
  }
  if (f.size > 10 * 1024 * 1024) {
    alert('File too large. Max 10MB.')
    e.target.value = ''
    selectedFile.value = null
    selectedFileName.value = ''
    return
  }
  selectedFile.value = f
  selectedFileName.value = f.name
}

const clearForm = () => {
  form.value = { description: '', amount: null, category: '', date: '', pregnancyMonth: null, billFilePath: null }
  editId.value = null
  selectedFile.value = null
  selectedFileName.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const submitExpense = async () => {
  try {
    const expensePayload = {
      description: form.value.description,
      amount: form.value.amount,
      category: form.value.category,
      date: form.value.date,
      pregnancyMonth: form.value.pregnancyMonth,
      billFilePath: form.value.billFilePath,
    }

    const fd = new FormData()
    fd.append('expense', new Blob([JSON.stringify(expensePayload)], { type: 'application/json' }))
    if (selectedFile.value) {
      fd.append('file', selectedFile.value)
    }

    if (editId.value) {
      await api.put(`/api/expenses/${editId.value}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/api/expenses', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }

    await loadExpenses()
    clearForm()
  } catch (error) {
    console.error('Failed to submit expense', error)
  }
}

const editExpense = (exp) => {
  editId.value = exp.id
  form.value.description = exp.description
  form.value.amount = exp.amount
  form.value.category = exp.category
  form.value.date = exp.date
  form.value.pregnancyMonth = exp.pregnancyMonth
  form.value.billFilePath = exp.billFilePath
  selectedFileName.value = exp.billFilePath || ''
}

const deleteExpense = async (id) => {
  if (!confirm('Delete this expense?')) return
  try {
    await api.delete(`/api/expenses/${id}`)
    await loadExpenses()
  } catch (error) {
    console.error('Failed to delete expense', error)
  }
}

const total = computed(() => expenses.value.reduce((s, it) => s + Number(it.amount || 0), 0))

const formatAmount = (value) => Number(value || 0).toFixed(2)
const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString()
}

const getBillFilename = (exp) => {
  // tolerate multiple possible JSON field names and ensure only filename
  const candidate = exp.billFilePath || exp.billPath || exp.bill_path || ''
  if (!candidate) return ''
  return candidate.split(/[/\\]/).pop()
}

onMounted(loadExpenses)

// Chart
const chartRef = ref(null)
let chartInstance = null

const renderChart = async () => {
  try {
    // fetch monthly totals from backend summary endpoint if available
    const resp = await api.get('/api/summary/monthly')
    const monthly = resp.data || {}
    const labels = Object.keys(monthly)
    const data = Object.values(monthly).map((v) => Number(v || 0))

    if (chartInstance) {
      chartInstance.data.labels = labels
      chartInstance.data.datasets[0].data = data
      chartInstance.update()
      return
    }

    const ctx = chartRef.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Expenses',
            data,
            backgroundColor: 'rgba(59,130,246,0.8)'
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  } catch (err) {
    console.error('Failed to render chart', err)
  }
}

onMounted(renderChart)
</script>
