import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, PRIORITIES } from '@/lib/validators'

const CATEGORY_OPTIONS = ['todas', ...CATEGORIES]
const STATUS_OPTIONS = ['pendentes', 'concluidas', 'todas']
const PRIORITY_OPTIONS = ['todas', ...PRIORITIES]
const ORDER_OPTIONS = ['recent', 'priority_asc', 'priority_desc']

export function useTaskFilters() {
  const [params, setParams] = useSearchParams()

  const categoryParam = params.get('category') || 'todas'
  const statusParam = params.get('status') || 'todas'
  const priorityParam = params.get('priority') || 'todas'
  const orderParam = params.get('order') || 'recent'

  const categoryFilter = CATEGORY_OPTIONS.includes(categoryParam) ? categoryParam : 'todas'
  const statusFilter = STATUS_OPTIONS.includes(statusParam) ? statusParam : 'todas'
  const priorityFilter = PRIORITY_OPTIONS.includes(priorityParam) ? priorityParam : 'todas'
  const order = ORDER_OPTIONS.includes(orderParam) ? orderParam : 'recent'

  const setCategoryFilter = (value) => {
    const next = new URLSearchParams(params)
    next.set('category', value)
    setParams(next)
  }

  const setStatusFilter = (value) => {
    const next = new URLSearchParams(params)
    next.set('status', value)
    setParams(next)
  }

  const setPriorityFilter = (value) => {
    const next = new URLSearchParams(params)
    next.set('priority', value)
    setParams(next)
  }

  const setOrder = (value) => {
    const next = new URLSearchParams(params)
    next.set('order', value)
    setParams(next)
  }

  const clearAllFilters = () => {
    const next = new URLSearchParams(params)
    next.set('category', 'todas')
    next.set('status', 'todas')
    next.set('priority', 'todas')
    next.set('order', 'recent')
    setParams(next)
  }

  return { categoryFilter, statusFilter, priorityFilter, order, setCategoryFilter, setStatusFilter, setPriorityFilter, setOrder, clearAllFilters }
}