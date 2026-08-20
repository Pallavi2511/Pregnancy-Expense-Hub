<template>
  <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Expense Analytics</h2>
        <p class="text-sm text-slate-500 dark:text-slate-300">Monthly expense overview across pregnancy</p>
      </div>
      <div>
        <button @click="loadAnalytics" class="rounded-2xl bg-sky-600 text-white px-3 py-2">Refresh Chart</button>
      </div>
    </div>

    <div class="h-72">
      <canvas ref="chartRef" id="analyticsChart" class="w-full h-full"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const chartRef = ref(null)
let chartInstance = null

const buildChart = (labels, data) => {
  if (!chartRef.value) return
  const ctx = chartRef.value.getContext('2d')
  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = data
    chartInstance.update()
    return
  }
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Amount (₹)',
          data,
          backgroundColor: 'rgba(59,130,246,0.85)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Pregnancy Month' } },
        y: { title: { display: true, text: 'Amount (₹)' } }
      }
    }
  })
}

const loadAnalytics = async () => {
  try {
    const resp = await api.get('/api/expenses/analytics')
    const arr = resp.data || []
    // Map to months 1..9
    const monthMap = {}
    for (let i = 1; i <= 9; i++) monthMap[i] = 0
    arr.forEach((it) => {
      const m = Number(it.month)
      const t = Number(it.total || 0)
      if (m >= 1 && m <= 9) monthMap[m] = t
    })

    const labels = Object.keys(monthMap).map((k) => `Month ${k}`)
    const data = Object.values(monthMap)
    buildChart(labels, data)
  } catch (err) {
    console.error('Failed to load analytics', err)
  }
}

onMounted(loadAnalytics)
</script>
