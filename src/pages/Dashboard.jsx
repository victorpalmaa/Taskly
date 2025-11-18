import { useMemo, useState } from 'react'
import Header from '@/components/layout/Header'
import StatisticsCards from '@/components/tasks/StatisticsCards'
import FilterBar from '@/components/tasks/FilterBar'
import TaskList from '@/components/tasks/TaskList'
import TaskForm from '@/components/tasks/TaskForm'
import { useGetTasks } from '@/api/tasksApi'
import { useTaskFilters } from '@/hooks/useTaskFilters'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useGetTasks()
  const { categoryFilter, statusFilter, priorityFilter, order } = useTaskFilters()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)

  const filtered = useMemo(() => {
    let res = tasks
    if (categoryFilter !== 'todas') res = res.filter((t) => t.category === categoryFilter)
    if (statusFilter !== 'todas') {
      const wantCompleted = statusFilter === 'concluidas'
      res = res.filter((t) => t.completed === wantCompleted)
    }
    if (priorityFilter !== 'todas') {
      // Normaliza prioridade para minúsculo e trata vazio
      res = res.filter((t) => ((t.priority ?? '').toLowerCase()) === priorityFilter)
    }
    const priorityRank = { baixa: 1, media: 2, alta: 3 }
    if (order === 'priority_asc') {
      res = [...res].sort((a, b) => (priorityRank[(a.priority || '').toLowerCase()] || 0) - (priorityRank[(b.priority || '').toLowerCase()] || 0))
    } else if (order === 'priority_desc') {
      res = [...res].sort((a, b) => (priorityRank[(b.priority || '').toLowerCase()] || 0) - (priorityRank[(a.priority || '').toLowerCase()] || 0))
    } else if (order === 'recent') {
      // Fallback para itens sem created_date (vão para o fim)
      res = [...res].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
    }
    return res
  }, [tasks, categoryFilter, statusFilter, priorityFilter, order])

  const pendingTasks = filtered.filter((t) => !t.completed)
  const completedTasks = filtered.filter((t) => t.completed)

  const openCreate = () => {
    setTaskToEdit(null)
    setIsFormOpen(true)
  }

  const openEdit = (task) => {
    setTaskToEdit(task)
    setIsFormOpen(true)
  }

  return (
    <div>
      <Header />
      <StatisticsCards />
      <FilterBar />
      <div className="px-6 mt-4 flex justify-end">
        <Link to="/notes">
          <Button variant="outline">Ir para Anotações</Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="px-6 mt-6">Carregando...</div>
      ) : (
        <TaskList statusFilter={statusFilter} pendingTasks={pendingTasks} completedTasks={completedTasks} onEditTask={openEdit} onCreateTask={openCreate} />
      )}

      <motion.button
        className="fab bg-gradient-to-r from-blue-500 to-purple-600"
        whileHover={{ scale: 1.1 }}
        onClick={openCreate}
      >
        <Plus />
      </motion.button>

      <TaskForm open={isFormOpen} onOpenChange={setIsFormOpen} taskToEdit={taskToEdit} />
    </div>
  )
}