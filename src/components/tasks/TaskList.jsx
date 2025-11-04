import { AnimatePresence, motion } from 'framer-motion'
import { Circle, Check, ClipboardList } from 'lucide-react'
import TaskItem from './TaskItem'
import { Button } from '@/components/ui/button'

export default function TaskList({ statusFilter = 'todas', pendingTasks, completedTasks, onEditTask, onCreateTask }) {
  const isEmpty = (
    statusFilter === 'pendentes' ? pendingTasks.length === 0 :
    statusFilter === 'concluidas' ? completedTasks.length === 0 :
    pendingTasks.length === 0 && completedTasks.length === 0
  )

  if (isEmpty) {
    return (
      <div className="px-6 mt-10 flex flex-col items-center text-center">
        <div className="rounded-full p-3 bg-bg-surface border border-border">
          <ClipboardList className="text-text-secondary" size={28} />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-text-primary">Nenhuma tarefa encontrada</h3>
        <Button className="mt-4" onClick={onCreateTask}>Nova Tarefa</Button>
      </div>
    )
  }

  return (
    <div className="px-6 mt-6 space-y-6">
      {(statusFilter === 'todas' || statusFilter === 'pendentes') && (
        <section>
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <Circle /> <span className="font-medium">Pendentes</span>
          </div>
          <AnimatePresence mode="popLayout">
            {pendingTasks.map((t) => (
              <TaskItem key={t.id} task={t} onEdit={onEditTask} />
            ))}
          </AnimatePresence>
        </section>
      )}
      {(statusFilter === 'todas' || statusFilter === 'concluidas') && (
        <section>
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <Check /> <span className="font-medium">Concluídas</span>
          </div>
          <AnimatePresence mode="popLayout">
            {completedTasks.map((t) => (
              <TaskItem key={t.id} task={t} onEdit={onEditTask} />
            ))}
          </AnimatePresence>
        </section>
      )}
    </div>
  )
}