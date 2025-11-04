import { motion } from 'framer-motion'
import { Pencil, Trash2, CheckCircle } from 'lucide-react'
// Removido Badge; vamos usar tinturas suaves por categoria no próprio card
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog'
import { useDeleteTask, useToggleTask } from '@/api/tasksApi'

const cardCategoryTint = {
  trabalho: 'bg-badge-work-bg/40 border-badge-work-text/30',
  pessoal: 'bg-badge-personal-bg/40 border-badge-personal-text/30',
}

const displayPriority = (p) => {
  if (!p) return 'Sem prioridade'
  const v = String(p).toLowerCase()
  return v === 'alta' ? 'Alta' : v === 'media' ? 'Média' : v === 'baixa' ? 'Baixa' : 'Sem prioridade'
}

const priorityChipClass = (p) => {
  const v = String(p || '').toLowerCase()
  if (v === 'alta') return 'bg-status-denied-bg text-status-denied-text border-status-denied-text/40'
  if (v === 'media') return 'bg-status-missing-bg text-status-missing-text border-status-missing-text/40'
  if (v === 'baixa') return 'bg-status-online-bg text-status-online-text border-status-online-text/40'
  return 'bg-bg-surface text-text-secondary border-border/50'
}

const categoryLabel = (c) => (c === 'trabalho' ? 'Trabalho' : 'Pessoal')

export default function TaskItem({ task, onEdit }) {
  const del = useDeleteTask()
  const toggle = useToggleTask()

  const handleDelete = () => {
    del.mutate(task.id)
  }

  const handleToggle = (e) => {
    const completed = e.target.checked
    toggle.mutate({ id: task.id, completed })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      data-completed={task.completed}
      className={`relative rounded-lg border p-4 ${cardCategoryTint[task.category] || 'bg-card border-border'} data-[completed=true]:opacity-90 data-[completed=true]:border-status-online-text/50 data-[completed=true]:bg-status-online-bg/15`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className="mt-1 h-5 w-5 rounded-md border border-border bg-bg-primary appearance-none cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary checked:bg-brand-blue checked:border-brand-blue"
        />
        <div className="flex-1">
          {/* Mini título da categoria */}
          <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
            {categoryLabel(task.category)}
          </div>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-text-primary data-[completed=true]:line-through" data-completed={task.completed}>{task.title}</h3>
              <div className="flex gap-1">
                <Button
                  variant={task.completed ? 'outline' : 'default'}
                  size={task.completed ? 'sm' : 'default'}
                  onClick={() => onEdit?.(task)}
                  aria-label="Editar"
                >
                  <Pencil size={18} />
                  {!task.completed && <span className="ml-1">Editar</span>}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="danger" size={task.completed ? 'sm' : 'default'} aria-label="Excluir">
                      <Trash2 size={18} />
                      {!task.completed && <span className="ml-1">Excluir</span>}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Confirme para excluir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter onConfirm={handleDelete} />
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          {task.description && (
            <p className="mt-1 text-sm text-text-secondary data-[completed=true]:text-text-secondary" data-completed={task.completed}>{task.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
            {task.completed && (
              <motion.span
                initial={{ opacity: 0, scale: 0.95, y: -2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -2 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-status-online-bg text-status-online-text border-status-online-text/40"
              >
                <CheckCircle size={14} /> Concluída
              </motion.span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${priorityChipClass(task.priority)}`}>
              Prioridade: <span className="font-semibold">{displayPriority(task.priority)}</span>
            </span>
            {task.created_date && (
              <span>
                Criada em: <span className="font-medium">{new Date(task.created_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}