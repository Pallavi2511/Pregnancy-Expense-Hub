import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function MonthlyChart({ expenses = [], monthlyAnalytics = null, onRefresh }) {
  // Canvas-rendered chart text/grid colors don't follow Tailwind's dark: classes, so track the theme manually
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setIsDarkMode(root.classList.contains('dark')))
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const labels = Array.from({ length: 9 }, (_, i) => `Month ${i + 1}`)
  const monthlyTotals = useMemo(() => {
    if (monthlyAnalytics && Array.isArray(monthlyAnalytics)) {
      // monthlyAnalytics expected as object/map or array of totals indexed by month
      // If it's an object map {1: total, ...}
      if (!Array.isArray(monthlyAnalytics)) {
        return labels.map((_, idx) => monthlyAnalytics[idx + 1] || 0)
      }
    }
    return labels.map((_, index) => {
      const month = index + 1
      return expenses
        .filter((expense) => expense.pregnancyMonth === month)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0)
    })
  }, [expenses, labels, monthlyAnalytics])

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: monthlyTotals,
          backgroundColor: '#5EEAD4',
          borderColor: '#A855F7',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: '#A855F7',
        },
      ],
    }),
    [labels, monthlyTotals]
  )

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold',
          },
          color: isDarkMode ? '#E2E8F0' : '#334155',
        },
      },
      title: {
        display: true,
        text: 'Pregnancy Expenses Overview (9 Months)',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: isDarkMode ? '#E2E8F0' : '#334155',
        padding: 20,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#0f172a' : '#1e293b',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
            return `Total: ${fmt.format(context.parsed.y)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
            return fmt.format(value)
          },
          font: {
            size: 12,
          },
          color: isDarkMode ? '#94A3B8' : '#475569',
        },
        grid: {
          color: isDarkMode ? '#334155' : '#E2E8F0',
          drawBorder: true,
        },
        title: {
          display: true,
          text: 'Amount (₹)',
          font: {
            size: 13,
            weight: 'bold',
          },
          color: isDarkMode ? '#E2E8F0' : '#334155',
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
          color: isDarkMode ? '#CBD5E1' : '#334155',
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Pregnancy Month',
          font: {
            size: 13,
            weight: 'bold',
          },
          color: isDarkMode ? '#E2E8F0' : '#334155',
        },
      },
    },
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-soft overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors duration-500">
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold">Expense Analytics</h2>
        <p className="text-white opacity-90">Monthly expense overview across pregnancy</p>
      </div>

      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* {onRefresh && (
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onRefresh}
            className="font-bold py-2 px-6 rounded transition duration-200 bg-teal-500 hover:bg-teal-400 text-slate-950"
          >
            Refresh Chart
          </button>
        </div>
      )} */}
    </div>
  )
}
