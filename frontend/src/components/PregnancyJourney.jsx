import { useEffect, useMemo, useState } from 'react'
import api from '../api'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

const checklistItems = [
  { title: 'Book first prenatal visit', done: true },
  { title: 'Start prenatal vitamins', done: true },
  { title: 'Prepare maternity clothing', done: false },
  { title: 'Review birthing classes', done: false },
  { title: 'Pack hospital bag', done: false },
]

const contacts = [
  { label: 'Doctor', value: 'Dr. Meera Singh' },
  { label: 'Hospital', value: 'City Maternity Center' },
  { label: 'Ambulance', value: '108' },
  { label: 'Husband', value: '+91 9988776655' },
  { label: 'Blood Bank', value: 'Apollo Blood Bank' },
]

const dietSuggestions = {
  first: ['Leafy greens', 'Dairy', 'Protein-rich snacks'],
  second: ['Iron-rich foods', 'Healthy fats', 'Hydration'],
  third: ['Fiber-rich meals', 'Small frequent meals', 'Calcium sources'],
}

export default function PregnancyJourney() {
  const [progress, setProgress] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [checklist, setChecklist] = useState([])
  const [growth, setGrowth] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressResponse, timelineResponse, checklistResponse, growthResponse, insightsResponse] = await Promise.all([
          api.get('/api/journey/progress'),
          api.get('/api/journey/timeline'),
          api.get('/api/journey/checklist'),
          api.get('/api/journey/baby-growth'),
          api.get('/api/journey/insights'),
        ])

        setProgress(progressResponse.data)
        setTimeline(timelineResponse.data || [])
        setChecklist(checklistResponse.data || [])
        setGrowth(growthResponse.data || [])
        setInsights(insightsResponse.data || {})
      } catch (error) {
        console.error('Failed to load pregnancy journey dashboard', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const waterPercent = useMemo(() => {
    if (!progress) return 0
    return Math.min(100, Math.round((progress.waterIntake / progress.waterGoal) * 100))
  }, [progress])

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading your pregnancy dashboard…</div>
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40 transition duration-500">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">Pregnancy Dashboard</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Journey Overview</h2>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Track progress, milestones, medicines, checklists, growth, and expenses in one calming view.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
            Week {progress?.currentWeek ?? 19} • Day {progress?.currentDay ?? 2}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {[
          { label: 'Current Pregnancy', value: `${progress?.currentWeek ?? 19} Weeks ${progress?.currentDay ?? 2} Days`, tone: 'teal' },
          { label: 'Baby Size', value: progress?.babySize ?? 'Bell pepper', tone: 'purple' },
          { label: 'Next Appointment', value: progress?.nextAppointment ?? '2026-07-16', tone: 'amber' },
          { label: 'Today’s Medicine', value: progress?.todayMedicine ?? 'Prenatal vitamin', tone: 'rose' },
        ].map((card) => (
          <div key={card.label} className={`rounded-3xl border p-5 shadow-lg transition duration-500 ${card.tone === 'teal' ? 'border-teal-100 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/20' : card.tone === 'purple' ? 'border-purple-100 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20' : card.tone === 'amber' ? 'border-amber-100 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20' : 'border-rose-100 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20'}`}>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-600 dark:text-slate-300">{card.label}</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Total Expenses</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(progress?.totalExpenses ?? 0)}</h3>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">This Month</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(progress?.thisMonthExpenses ?? 0)}</h3>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Water Intake</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${waterPercent}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{progress?.waterIntake ?? 64} / {progress?.waterGoal ?? 96} glasses</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Current Weight</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{progress?.currentWeight ?? 62.4} kg</h3>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">Timeline</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Key milestones</h3>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {timeline.map((item) => (
            <div key={item.week} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Week {item.week}</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.notes}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">Doctor & Medicine</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Next appointment</p>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Dr. Meera Singh • City Maternity Center • 16 Jul 2026</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Medicine tracker</p>
              <div className="mt-3 space-y-2">
                {['Morning prenatal vitamin', 'Afternoon iron supplement', 'Night magnesium'].map((item) => (
                  <label key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" defaultChecked={item.includes('prenatal')} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">Checklist</p>
          <div className="mt-4 space-y-3">
            {checklist.map((item, index) => (
              <label key={`${item.title}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" defaultChecked={item.done} />
                <span>{item.title}</span>
                <span className="ml-auto rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.trimester}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Baby growth</p>
          <div className="mt-4 space-y-3">
            {growth.map((item) => (
              <div key={item.week} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Week {item.week}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.size}</p>
                </div>
                <div className="text-right text-sm text-slate-600 dark:text-slate-300">
                  <p>{item.weight}</p>
                  <p>{item.length}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Diet suggestions</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {Object.entries(dietSuggestions).map(([trimester, items]) => (
              <div key={trimester} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{trimester} trimester</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {items.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-rose-600 dark:text-rose-300">Hospital bag checklist</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {['Mother', 'Baby', 'Documents'].map((group) => (
              <div key={group} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{group}</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {group === 'Mother' && ['ID', 'Phone charger', 'Toiletries'].map((item) => <label key={item} className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />{item}</label>)}
                  {group === 'Baby' && ['Onesies', 'Blanket', 'Diapers'].map((item) => <label key={item} className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />{item}</label>)}
                  {group === 'Documents' && ['Insurance card', 'ID proof', 'Medical reports'].map((item) => <label key={item} className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />{item}</label>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Emergency contacts</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {contacts.map((contact) => (
              <div key={contact.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{contact.label}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{contact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-fuchsia-600 dark:text-fuchsia-300">Insurance claim module</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Claim 1</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ultrasound bill • {currencyFormatter.format(3200)} • Pending approval</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Claim 2</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Lab test bill • {currencyFormatter.format(1800)} • Submitted</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition duration-500">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">Insights</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Highest expense category</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{insights?.highestExpenseCategory ?? 'Medical'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Most expensive month</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Month {insights?.mostExpensiveMonth ?? 4} • {currencyFormatter.format(insights?.highestExpenseAmount ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Insurance eligibility</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{insights?.insuranceEligible ? 'Eligible for maternity claims' : 'Review policy coverage'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Pending claims</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{insights?.pendingClaims ?? 2} claims waiting for approval</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
