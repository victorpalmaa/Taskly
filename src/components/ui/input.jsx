import { cn } from './utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-sm shadow-sm text-text-primary placeholder:text-text-secondary focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none focus-visible:border-transparent transition-colors motion-safe:transition-all motion-safe:duration-150 hover:border-brand-blue/40 hover:shadow-md hover:brightness-105',
        className
      )}
      {...props}
    />
  )
}