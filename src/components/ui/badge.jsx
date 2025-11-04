import { cn } from './utils'

export function Badge({ className = '', children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', className)}>
      {children}
    </span>
  )
}