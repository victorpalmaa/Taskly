import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export const NOTES_QUERY_KEY = ['notes']

const api = axios.create({ baseURL: '/' })
const mock = new MockAdapter(api, { delayResponse: 80 })

let notes = []

// Mock routes
mock.onGet('/api/notes').reply(() => [200, notes])

mock.onPost('/api/notes').reply((config) => {
  const payload = JSON.parse(config.data)
  const now = new Date().toISOString()
  const newNote = {
    id: crypto.randomUUID(),
    title: payload.title || 'Reunião',
    date: payload.date || new Date().toISOString().slice(0, 10),
    topics: payload.topics || '',
    created_date: now,
    updated_date: now,
  }
  notes.unshift(newNote)
  return [201, newNote]
})

mock.onDelete(/\/api\/notes\/[^/]+/).reply((config) => {
  const id = config.url.split('/').pop()
  const idx = notes.findIndex((n) => n.id === id)
  if (idx === -1) return [404]
  notes.splice(idx, 1)
  return [204]
})

// API calls
const getNotes = async () => {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_date', { ascending: false })
    if (error) {
      const msg = error?.code === '42P01' || /does not exist/i.test(error?.message || '')
        ? 'Tabela "notes" não existe no Supabase. Execute supabase/schema.sql.'
        : error.message || 'Erro ao carregar anotações'
      throw new Error(msg)
    }
    return data
  }
  const { data } = await api.get('/api/notes')
  return data
}

const createNote = async (payload) => {
  if (isSupabaseEnabled) {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('notes')
      .insert([{ id: crypto.randomUUID(), ...payload, created_date: now, updated_date: now }])
      .select()
      .single()
    if (error) throw new Error(error.message || 'Erro ao criar anotação')
    return data
  }
  const { data } = await api.post('/api/notes', payload)
  return data
}

const deleteNote = async (id) => {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw new Error(error.message || 'Erro ao excluir anotação')
    return id
  }
  await api.delete(`/api/notes/${id}`)
  return id
}

const updateNote = async ({ id, payload }) => {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...payload, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message || 'Erro ao atualizar anotação')
    return data
  }
  // Mock update
  const idx = notes.findIndex((n) => n.id === id)
  if (idx !== -1) {
    const updated = { ...notes[idx], ...payload, updated_date: new Date().toISOString() }
    notes[idx] = updated
    return updated
  }
  throw new Error('Anotação não encontrada')
}

export function useGetNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: getNotes,
    retry: 1,
    staleTime: 5000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    onError: (err) => toast.error(String(err?.message || 'Erro ao carregar anotações')),
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createNote(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      const previous = queryClient.getQueryData(NOTES_QUERY_KEY)
      const optimistic = {
        id: `temp-${crypto.randomUUID()}`,
        title: payload.title || 'Reunião',
        date: payload.date || new Date().toISOString().slice(0, 10),
        topics: payload.topics || '',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      }
      queryClient.setQueryData(NOTES_QUERY_KEY, (old = []) => [optimistic, ...(Array.isArray(old) ? old : [])])
      return { previous }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })
      toast.success('Anotação criada')
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTES_QUERY_KEY, ctx.previous)
      toast.error(String(err?.message || 'Erro ao criar anotação'))
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteNote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      const previous = queryClient.getQueryData(NOTES_QUERY_KEY)
      queryClient.setQueryData(NOTES_QUERY_KEY, (old = []) => (Array.isArray(old) ? old.filter((n) => n.id !== id) : old))
      return { previous }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })
      toast.success('Anotação excluída')
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTES_QUERY_KEY, ctx.previous)
      toast.error(String(err?.message || 'Erro ao excluir anotação'))
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => updateNote({ id, payload }),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      const previous = queryClient.getQueryData(NOTES_QUERY_KEY)
      queryClient.setQueryData(NOTES_QUERY_KEY, (old = []) =>
        Array.isArray(old) ? old.map((n) => (n.id === id ? { ...n, ...payload } : n)) : old
      )
      return { previous }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })
      toast.success('Anotação atualizada')
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTES_QUERY_KEY, ctx.previous)
      toast.error(String(err?.message || 'Erro ao atualizar anotação'))
    },
  })
}