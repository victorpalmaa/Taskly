import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTaskFilters } from '@/hooks/useTaskFilters'

const CATEGORY_BTNS = [
  { key: 'trabalho', label: 'Trabalho' },
  { key: 'pessoal', label: 'Pessoal' },
  { key: 'todas', label: 'Todas' },
]

// Removido filtro de Status do popover (já controlamos pelos cards)

const PRIORITY_BTNS = [
  { key: 'alta', label: 'Alta' },
  { key: 'media', label: 'Média' },
  { key: 'baixa', label: 'Baixa' },
  { key: 'todas', label: 'Todas' },
]

const ORDER_BTNS = [
  { key: 'priority_desc', label: 'Altas', icon: 'asc' },
  { key: 'priority_asc', label: 'Baixas', icon: 'asc' },
  { key: 'recent', label: 'Mais recente', icon: 'recent' },
]

import { ArrowDown, ArrowUp, Clock } from 'lucide-react'

export default function FilterBar() {
  const { categoryFilter, statusFilter, priorityFilter, order, setCategoryFilter, setStatusFilter, setPriorityFilter, setOrder, clearAllFilters } = useTaskFilters()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const hasActive = categoryFilter !== 'todas' || statusFilter !== 'todas' || priorityFilter !== 'todas' || order !== 'recent'

  const clearAll = () => {
    clearAllFilters()
  }

  // Fecha o popover ao clicar fora
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return
      const el = containerRef.current
      if (el && !el.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDocClick)
    return () => document.removeEventListener('pointerdown', onDocClick)
  }, [open])

  return (
    <div className="sticky top-0 z-20 px-6 py-3 bg-bg-primary/70 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60 border-b border-border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">Filtros</span>
        <div className="relative" ref={containerRef}>
          <div className="flex items-center gap-2">
            {hasActive && (
              <Button variant="outline" onClick={clearAll} className="text-text-secondary">Limpar</Button>
            )}
            <Button variant="outline" onClick={() => setOpen((v) => !v)}>Filtrar</Button>
          </div>
          {open && (
            <div className="absolute right-0 mt-2 w-[320px] rounded-xl bg-card border border-border p-4 shadow-md">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-text-secondary mb-2">Prioridade</div>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITY_BTNS.map((p) => (
                      <Button key={p.key} className="hover:border-brand-blue/50" variant={priorityFilter === p.key ? 'default' : 'outline'} onClick={() => setPriorityFilter(p.key)}>{p.label}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-text-secondary mb-2">Ordenação</div>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_BTNS.map((o) => (
                      <Button key={o.key} className="hover:border-brand-blue/50" variant={order === o.key ? 'default' : 'outline'} onClick={() => setOrder(o.key)}>
                        {o.icon === 'desc' && <ArrowDown size={16} />} 
                        {o.icon === 'asc' && <ArrowUp size={16} />} 
                        {o.icon === 'recent' && <Clock size={16} />} 
                        {o.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-text-secondary mb-2">Categoria</div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_BTNS.map((c) => (
                      <Button key={c.key} className="hover:border-brand-blue/50" variant={categoryFilter === c.key ? 'default' : 'outline'} onClick={() => setCategoryFilter(c.key)}>{c.label}</Button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}