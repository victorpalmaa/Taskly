import { List, Circle, Check } from 'lucide-react'
import { useGetTasks } from '@/api/tasksApi'
import { useTaskFilters } from '@/hooks/useTaskFilters'
import { useMemo } from 'react'

function StatCard({ icon: Icon, label, value, onClick }) {
  return (
    <button className="card p-4 flex items-center gap-3 w-full text-left hover:border-brand-blue/50" onClick={onClick}>
      <Icon size={20} className="text-text-secondary" />
      <div>
        <div className="text-sm text-text-secondary">{label}</div>
        <div className="text-2xl font-semibold text-text-primary">{value}</div>
      </div>
    </button>
  )
}

export default function StatisticsCards() {
  const { data = [] } = useGetTasks()
  const { setStatusFilter, clearAllFilters } = useTaskFilters()
  const { total, pending, completed } = useMemo(() => {
    const total = data.length
    const pending = data.filter((t) => !t.completed).length
    const completed = data.filter((t) => t.completed).length
    return { total, pending, completed }
  }, [data])

  return (
    <section className="px-6 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        icon={List}
        label="Total"
        value={total}
        onClick={() => { clearAllFilters() }}
      />
      <StatCard
        icon={Circle}
        label="Pendentes"
        value={pending}
        onClick={() => { setStatusFilter('pendentes') }}
      />
      <StatCard
        icon={Check}
        label="Concluídas"
        value={completed}
        onClick={() => { setStatusFilter('concluidas') }}
      />
    </section>
  )
}