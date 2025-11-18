import Header from '@/components/layout/Header'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, NotebookPen, Trash2, Pencil } from 'lucide-react'
import { useGetNotes, useCreateNote, useDeleteNote, useUpdateNote } from '@/api/notesApi'
import { Link } from 'react-router-dom'

export default function Notes() {
  const { data: notes = [] } = useGetNotes()
  const createNote = useCreateNote()
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ title: '', date: today, topics: '' })
  const [editingId, setEditingId] = useState(null)
  const [mode, setMode] = useState('text') // 'text' | 'bullets'
  const [bulletItems, setBulletItems] = useState([])
  const topicsRef = useRef(null)
  const bulletRefs = useRef([])
  const [focusIndex, setFocusIndex] = useState(null)
  const maxBulletHeight = 200

  const autoResize = (el, maxH = maxBulletHeight) => {
    if (!el) return
    el.style.height = 'auto'
    const sh = el.scrollHeight
    if (sh > maxH) {
      el.style.height = `${maxH}px`
      el.style.overflowY = 'auto'
    } else {
      el.style.height = `${sh}px`
      el.style.overflowY = 'hidden'
    }
    el.style.overflowX = 'hidden'
  }

  // Preserva quebras internas: separa apenas por marcadores de bullet no início da linha
  const parseBulletsFromText = (raw) => {
    const str = String(raw || '').replace(/\r\n/g, '\n')
    const hasMarker = /(^|\n)[•-]\s/.test(str)
    if (!hasMarker) {
      const single = str.trim()
      return single ? [single] : []
    }
    const markers = [...str.matchAll(/(^|\n)[•-]\s/g)]
    const items = []
    for (let i = 0; i < markers.length; i++) {
      const m = markers[i]
      const start = m.index + (m[1] ? m[1].length : 0) + 2
      const end = i + 1 < markers.length ? markers[i + 1].index : str.length
      const content = str.slice(start, end).trim()
      if (content) items.push(content)
    }
    return items
  }

  const openCreate = () => {
    setForm({ title: '', date: today, topics: '' })
    setIsFormOpen(true)
    setEditingId(null)
  }

  const addNote = (e) => {
    e.preventDefault()
    const payload = {
      title: (form.title || '').trim() || 'Reunião',
      date: form.date || today,
      topics:
        mode === 'bullets'
          ? bulletItems
              .map((t) => (String(t || '').trim() ? `• ${String(t).trim()}` : ''))
              .filter(Boolean)
              .join('\n')
          : (form.topics || '').trim(),
    }
    if (editingId) {
      updateNote.mutate({ id: editingId, payload })
    } else {
      createNote.mutate(payload)
    }
    setIsFormOpen(false)
  }

  const removeNote = (id) => deleteNote.mutate(id)

  const startEdit = (n) => {
    setEditingId(n.id)
    setForm({ title: n.title || '', date: n.date || today, topics: n.topics || '' })
    setIsFormOpen(true)
    // inicializa bullets preservando quebras internas
    const items = parseBulletsFromText(n.topics)
    setBulletItems(items)
    setMode(/(^|\n)[•-]\s/.test(String(n.topics || '')) ? 'bullets' : 'text')
  }

  // Atalho de teclado: Tab no título foca textarea de anotações
  const onTitleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (topicsRef.current) topicsRef.current.focus()
    }
  }

  // Alternância de modo: ao ir para bullets, parseia texto atual
  const onSwitchMode = (next) => {
    setMode(next)
    if (next === 'bullets') {
      setBulletItems(parseBulletsFromText(form.topics))
    }
  }

  const addBulletAfter = (index) => {
    setBulletItems((items) => {
      const next = [...items]
      next.splice(index + 1, 0, '')
      return next
    })
    setFocusIndex(index + 1)
  }

  const removeBulletAt = (index) => {
    setBulletItems((items) => items.filter((_, i) => i !== index))
  }

  const onBulletKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addBulletAfter(index)
    } else if (e.key === 'Backspace' && !e.currentTarget.value && bulletItems.length > 1) {
      e.preventDefault()
      removeBulletAt(index)
    }
  }

  // Foca o input do próximo tópico após criar novo item
  useEffect(() => {
    if (focusIndex != null) {
      const el = bulletRefs.current[focusIndex]
      if (el) {
        el.focus()
        autoResize(el)
      }
      setFocusIndex(null)
    }
  }, [bulletItems, focusIndex])

  // Ajusta altura dinamicamente dos tópicos quando o conteúdo muda
  useEffect(() => {
    bulletRefs.current.forEach((el) => autoResize(el))
  }, [bulletItems])

  // Ajusta altura da textarea de texto simples
  useEffect(() => {
    if (topicsRef.current) autoResize(topicsRef.current, 280)
  }, [form.topics, isFormOpen])

  return (
    <div>
      <Header />
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl text-white shadow-md bg-brand-gradient">
              <NotebookPen />
            </div>
            <h2 className="text-2xl font-bold">Anotações de Reuniões</h2>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline">Voltar às Tasks</Button>
            </Link>
            <Button variant="default" onClick={openCreate}>
              <Plus className="mr-2" /> Nova anotação
            </Button>
          </div>
        </div>

        {isFormOpen && (
          <div className="card p-4 mb-6">
            <form onSubmit={addNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Título</label>
                  <input
                    className="w-full rounded-xl bg-bg-surface border border-border px-3 py-2"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    onKeyDown={onTitleKeyDown}
                    placeholder="Ex.: Sprint Planning"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Data</label>
                  <input
                    type="date"
                    className="w-full rounded-xl bg-bg-surface border border-border px-3 py-2"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm text-text-secondary">Modo:</label>
                  <Button type="button" variant={mode === 'text' ? 'default' : 'outline'} onClick={() => onSwitchMode('text')}>Texto</Button>
                  <Button type="button" variant={mode === 'bullets' ? 'default' : 'outline'} onClick={() => onSwitchMode('bullets')}>Tópicos</Button>
                </div>
                {mode === 'text' ? (
                  <>
                    <label className="block text-sm text-text-secondary mb-1">Anotações</label>
                    <textarea
                      ref={topicsRef}
                      className="w-full rounded-xl bg-bg-surface border border-border px-3 py-2 resize-none"
                      value={form.topics}
                      onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))}
                      onInput={(e) => autoResize(e.currentTarget, 280)}
                      placeholder="Pontos discutidos, decisões, próximos passos..."
                      style={{ overflowX: 'hidden' }}
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm text-text-secondary mb-1">Tópicos</label>
                    <div className="space-y-2">
                      {bulletItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="mt-2 w-2 h-2 rounded-full bg-brand-blue" />
                          <textarea
                            ref={(el) => (bulletRefs.current[idx] = el)}
                            rows={1}
                            className="flex-1 rounded-xl bg-bg-surface border border-border px-3 py-2 resize-none min-h-10"
                            value={item}
                            onChange={(e) => {
                              const v = e.target.value
                              setBulletItems((items) => items.map((it, i) => (i === idx ? v : it)))
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                addBulletAfter(idx)
                              } else if (e.key === 'Backspace' && !e.currentTarget.value && bulletItems.length > 1) {
                                e.preventDefault()
                                removeBulletAt(idx)
                              }
                            }}
                            onInput={(e) => autoResize(e.currentTarget)}
                            placeholder={`Tópico ${idx + 1} (Shift+Enter: nova linha)`}
                            style={{ overflowX: 'hidden' }}
                          />
                          <Button type="button" variant="ghost" onClick={() => addBulletAfter(idx)}>Adicionar</Button>
                          {bulletItems.length > 1 && (
                            <Button type="button" variant="ghost" onClick={() => removeBulletAt(idx)}>Remover</Button>
                          )}
                        </div>
                      ))}
                      {bulletItems.length === 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setBulletItems([''])
                            setFocusIndex(0)
                          }}
                        >
                          Adicionar tópico
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="default">{editingId ? 'Atualizar' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        )}

        <section className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notes.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold bg-clip-text text-transparent bg-brand-gradient">{n.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {(() => {
                        const d = n.created_date || n.createdAt || null
                        try {
                          const dt = d ? new Date(d) : new Date()
                          return `Criada em: ${dt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                        } catch {
                          return `Criada em: ${n.date || today}`
                        }
                      })()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" onClick={() => startEdit(n)} title="Editar">
                      <Pencil className="text-text-secondary" />
                    </Button>
                    <Button variant="ghost" onClick={() => removeNote(n.id)} title="Excluir">
                      <Trash2 className="text-text-secondary" />
                    </Button>
                  </div>
                </div>
                {n.topics && (
                  <p className="mt-3 text-text-primary whitespace-pre-wrap">{n.topics}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {notes.length === 0 && (
            <div className="card p-6 text-center text-text-secondary">
              Nenhuma anotação ainda. Clique em "Nova anotação" para começar.
            </div>
          )}
        </section>
      </div>

      {/* FAB removido conforme pedido */}
    </div>
  )
}