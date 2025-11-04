import { cva } from 'class-variance-authority'
import { cn } from './utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out hover:motion-safe:scale-[1.02] active:motion-safe:scale-[0.98] hover:shadow-md disabled:opacity-50 disabled:pointer-events-none gap-2 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-brand-gradient text-white shadow-sm hover:opacity-90 hover:brightness-105',
        outline: 'border border-border bg-transparent text-text-primary hover:bg-card',
        ghost: 'bg-transparent text-text-primary hover:bg-bg-surface',
        danger: 'border border-status-denied-text text-status-denied-text hover:bg-status-denied-bg',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }