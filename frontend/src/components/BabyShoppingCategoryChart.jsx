import { useEffect, useMemo, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Legend, Tooltip)

const categories = ['Clothes', 'Toys', 'Furniture', 'Essentials']
const colors = ['#14B8A6', '#F59E0B', '#F43F5E', '#0EA5E9']

export default function BabyShoppingCategoryChart({ expenses }) {
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'))

    useEffect(() => {
        const root = document.documentElement
        const observer = new MutationObserver(() => setIsDarkMode(root.classList.contains('dark')))
        observer.observe(root, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

    const totals = useMemo(() => categories.map((category) => expenses
        .filter((expense) => expense.category === category)
        .reduce((total, expense) => total + (expense.amount || 0), 0)), [expenses])

    const hasExpenses = totals.some((total) => total > 0)
    const data = useMemo(() => ({
        labels: categories,
        datasets: [{
            data: totals,
            backgroundColor: colors,
            borderColor: isDarkMode ? '#0F172A' : '#FFFFFF',
            borderWidth: 3,
            hoverOffset: 8,
        }],
    }), [isDarkMode, totals])

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDarkMode ? '#CBD5E1' : '#334155',
                    padding: 16,
                    usePointStyle: true,
                    font: { size: 13, weight: 'bold' },
                },
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#0F172A' : '#1E293B',
                padding: 12,
                callbacks: {
                    label: (context) => ` ${context.label}: ${new Intl.NumberFormat('en-IN', {
                        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
                    }).format(context.parsed)}`,
                },
            },
        },
    }), [isDarkMode])

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Spending by Category</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">See where Baby Shopping purchases are going.</p>
            </div>
            <div className="mt-5 h-80">
                {hasExpenses ? <Pie data={data} options={options} /> : (
                    <p className="flex h-full items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
                        Add a Baby Shopping expense to see the category breakdown.
                    </p>
                )}
            </div>
        </section>
    )
}