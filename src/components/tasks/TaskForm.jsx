import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskFormSchema, CATEGORIES, PRIORITIES } from '@/lib/validators'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { useCreateTask, useUpdateTask } from '@/api/tasksApi'

export default function TaskForm({ open, onOpenChange, taskToEdit }) {
  const isEdit = !!taskToEdit
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(TaskFormSchema), defaultValues: { title: '', description: '', category: 'trabalho', priority: '' } })

  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()

  useEffect(() => {
    if (taskToEdit) {
      setValue('title', taskToEdit.title)
      setValue('description', taskToEdit.description || '')
      setValue('category', taskToEdit.category)
      setValue('priority', taskToEdit.priority || '')
    } else {
      reset({ title: '', description: '', category: 'trabalho', priority: '' })
    }
  }, [taskToEdit])

  // Garante campos limpos ao abrir criação de nova task
  useEffect(() => {
    if (open && !taskToEdit) {
      reset({ title: '', description: '', category: 'trabalho', priority: '' })
    }
  }, [open, taskToEdit, reset])

  const onSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: taskToEdit.id, payload: data },
        { onSuccess: () => { reset({ title: '', description: '', category: 'trabalho', priority: '' }); onOpenChange(false) } }
      )
    } else {
      createMutation.mutate(
        data,
        { onSuccess: () => { reset({ title: '', description: '', category: 'trabalho', priority: '' }); onOpenChange(false) } }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Task' : 'Nova task'}</DialogTitle>
          <DialogDescription>Preencha os campos obrigatórios e salve.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input placeholder="Título da tarefa" {...register('title')} />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Descrição (Opcional)</label>
            <Textarea placeholder="Detalhes adicionais" rows={3} {...register('description')} />
          </div>
          <div>
            <label className="text-sm font-medium">Prioridade (Opcional)</label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-sm shadow-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none focus-visible:border-transparent"
              {...register('priority')}
              defaultValue=""
            >
              {/* Placeholder não selecionável; mantém opcional sem exibir "sem prioridade" na lista */}
              <option value="" disabled hidden>Selecione (opcional)</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Categoria</label>
            <RadioGroup value={watch('category')} onValueChange={(v) => setValue('category', v)}>
              {CATEGORIES.map((c) => (
                <RadioGroupItem key={c} value={c}>{c === 'trabalho' ? 'Trabalho' : 'Pessoal'}</RadioGroupItem>
              ))}
            </RadioGroup>
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}