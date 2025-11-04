import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TaskSchema } from '@/lib/validators'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export const TASK_QUERY_KEY = ['tasks']

// Axios instance
const api = axios.create({ baseURL: '/' })

// In-memory mock API com menor delay para respostas mais ágeis
const mock = new MockAdapter(api, { delayResponse: 80 })

let tasks = [
  {
    id: 't1',
    title: 'Finalizar relatório trimestral',
    description: 'Consolidar dados e enviar ao diretor.',
    category: 'trabalho',
    priority: 'alta',
    completed: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: 't2',
    title: 'Reunião com equipe de marketing',
    description: 'Alinhar campanha do próximo trimestre.',
    category: 'trabalho',
    priority: 'media',
    completed: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: 't3',
    title: 'Consulta médica',
    description: 'Clínico geral às 15h.',
    category: 'pessoal',
    priority: 'baixa',
    completed: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: 't4',
    title: 'Fazer compras no supermercado',
    description: 'Frutas, legumes e itens de limpeza.',
    category: 'pessoal',
    priority: '',
    completed: true,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: 't5',
    title: 'Renovar assinatura do software',
    description: 'Atualizar plano anual.',
    category: 'trabalho',
    priority: 'media',
    completed: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: 't6',
    title: 'Ligar para o banco',
    description: 'Resolver pendência da fatura.',
    category: 'pessoal',
    priority: '',
    completed: true,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
]

// Helpers
const findIndexById = (id) => tasks.findIndex((t) => t.id === id)
const validateTask = (data) => TaskSchema.parse(data)

// Mock routes
mock.onGet('/api/tasks').reply(() => {
  return [200, tasks]
})

mock.onPost('/api/tasks').reply((config) => {
  const payload = JSON.parse(config.data)
  const now = new Date().toISOString()
  const newTask = {
    id: crypto.randomUUID(),
    title: payload.title,
    description: payload.description || '',
    category: payload.category,
    priority: payload.priority || '',
    completed: false,
    created_date: now,
    updated_date: now,
  }
  tasks.unshift(newTask)
  return [201, newTask]
})

mock.onPut(/\/api\/tasks\/[^/]+/).reply((config) => {
  const id = config.url.split('/').pop()
  const payload = JSON.parse(config.data)
  const idx = findIndexById(id)
  if (idx === -1) return [404]
  const updated = { ...tasks[idx], ...payload, updated_date: new Date().toISOString() }
  tasks[idx] = updated
  return [200, updated]
})

mock.onDelete(/\/api\/tasks\/[^/]+/).reply((config) => {
  const id = config.url.split('/').pop()
  const idx = findIndexById(id)
  if (idx === -1) return [404]
  tasks.splice(idx, 1)
  return [204]
})

mock.onPatch(/\/api\/tasks\/[^/]+\/toggle/).reply((config) => {
  const id = config.url.split('/').slice(-2, -1)[0]
  const payload = JSON.parse(config.data)
  const idx = findIndexById(id)
  if (idx === -1) return [404]
  const updated = { ...tasks[idx], completed: !!payload?.completed, updated_date: new Date().toISOString() }
  tasks[idx] = updated
  return [200, updated]
})

// API calls - Supabase or Mock
const getTasks = async () => {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_date', { ascending: false })
    if (error) {
      // Erro comum quando a tabela não existe: code 42P01 (relation does not exist)
      const msg = error?.code === '42P01' || /does not exist/i.test(error?.message || '')
        ? 'Tabela "tasks" não existe no Supabase. Execute supabase/schema.sql.'
        : error.message || 'Erro ao carregar tarefas'
      throw new Error(msg)
    }
    return data.map(validateTask)
  }
  const { data } = await api.get('/api/tasks')
  return data.map(validateTask)
}

const createTask = async (payload) => {
  if (isSupabaseEnabled) {
    const { priority = '', ...rest } = payload
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ id: crypto.randomUUID(), ...rest, priority, completed: false, created_date: now, updated_date: now }])
      .select()
      .single()
    if (error) {
      const msg =
        error?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '')
          ? 'Tabela "tasks" não existe no Supabase. Execute supabase/schema.sql.'
          : error.message || 'Erro ao criar tarefa'
      throw new Error(msg)
    }
    return validateTask(data)
  }
  const { data } = await api.post('/api/tasks', payload)
  return validateTask(data)
}

const updateTask = async ({ id, payload }) => {
  if (isSupabaseEnabled) {
    const { priority = '', ...rest } = payload
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...rest, priority, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message || 'Erro ao atualizar tarefa')
    return validateTask(data)
  }
  const { data } = await api.put(`/api/tasks/${id}`, payload)
  return validateTask(data)
}

const deleteTask = async (id) => {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw new Error(error.message || 'Erro ao excluir tarefa')
    return id
  }
  await api.delete(`/api/tasks/${id}`)
  return id
}

const toggleTask = async ({ id, completed }) => {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !!completed, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message || 'Erro ao alternar tarefa')
    return validateTask(data)
  }
  const { data } = await api.patch(`/api/tasks/${id}/toggle`, { completed })
  return validateTask(data)
}

// React Query hooks
export function useGetTasks() {
  return useQuery({
    queryKey: TASK_QUERY_KEY,
    queryFn: getTasks,
    retry: 1,
    staleTime: 5000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    onError: (err) => {
      toast.error(String(err?.message || 'Erro ao carregar tarefas'), { duration: 2000 })
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createTask(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: TASK_QUERY_KEY })
      const previous = queryClient.getQueryData(TASK_QUERY_KEY)
      const optimistic = {
        id: `temp-${crypto.randomUUID()}`,
        title: payload.title,
        description: payload.description || '',
        category: payload.category,
        priority: payload.priority || '',
        completed: false,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      }
      queryClient.setQueryData(TASK_QUERY_KEY, (old = []) => [optimistic, ...(Array.isArray(old) ? old : [])])
      return { previous }
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(TASK_QUERY_KEY, ctx.previous)
      toast.error('Erro ao criar tarefa', { duration: 2000 })
    },
    onSuccess: () => {
      toast.success('Tarefa criada', { duration: 2000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => updateTask({ id, payload }),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: TASK_QUERY_KEY })
      const previous = queryClient.getQueryData(TASK_QUERY_KEY)
      queryClient.setQueryData(TASK_QUERY_KEY, (old = []) =>
        (Array.isArray(old) ? old : []).map((t) => (t.id === id ? { ...t, ...payload, updated_date: new Date().toISOString() } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(TASK_QUERY_KEY, ctx.previous)
      toast.error('Erro ao atualizar tarefa', { duration: 2000 })
    },
    onSuccess: () => {
      toast.success('Tarefa atualizada', { duration: 2000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASK_QUERY_KEY })
      const previous = queryClient.getQueryData(TASK_QUERY_KEY)
      queryClient.setQueryData(TASK_QUERY_KEY, (old = []) => (Array.isArray(old) ? old : []).filter((t) => t.id !== id))
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(TASK_QUERY_KEY, ctx.previous)
      toast.error('Erro ao excluir tarefa', { duration: 2000 })
    },
    onSuccess: () => {
      toast.success('Tarefa excluída', { duration: 2000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY })
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completed }) => toggleTask({ id, completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: TASK_QUERY_KEY })
      const previous = queryClient.getQueryData(TASK_QUERY_KEY)
      queryClient.setQueryData(TASK_QUERY_KEY, (old = []) =>
        (Array.isArray(old) ? old : []).map((t) => (t.id === id ? { ...t, completed, updated_date: new Date().toISOString() } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(TASK_QUERY_KEY, ctx.previous)
      toast.error('Erro ao alternar tarefa', { duration: 2000 })
    },
    onSuccess: () => {
      toast.success('Tarefa atualizada', { duration: 2000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY })
    },
  })
}

// Health check - verifica conexão Supabase e existência da tabela
export function useDbHealth() {
  return useQuery({
    queryKey: ['db_health'],
    queryFn: async () => {
      if (!isSupabaseEnabled) {
        return { status: 'disabled', message: 'Supabase desabilitado. Usando dados mock.' }
      }
      const { data, error } = await supabase.from('tasks').select('id').limit(1)
      if (error) {
        const msg = error?.message || 'Erro ao verificar banco'
        if (error?.code === '42P01' || /does not exist/i.test(msg)) {
          return { status: 'missing_table', message: 'Tabela "tasks" não existe. Execute supabase/schema.sql.' }
        }
        if (error?.code === '42501' || /permission denied/i.test(msg)) {
          return { status: 'permission_denied', message: 'Permissão negada pela RLS. Verifique as policies.' }
        }
        return { status: 'error', message: msg }
      }
      return { status: 'ok', message: 'Supabase conectado' }
    },
    staleTime: 60_000,
  })
}