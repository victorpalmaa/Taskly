import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from './utils'

export const RadioGroup = ({ className, ...props }) => (
  <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} />
)

export const RadioGroupItem = ({ className, children, ...props }) => (
  <RadioGroupPrimitive.Item asChild {...props}>
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary transition-colors motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out hover:motion-safe:scale-[1.02] active:motion-safe:scale-[0.98] hover:bg-card hover:border-brand-blue/40',
        'data-[state=checked]:bg-brand-gradient data-[state=checked]:text-white data-[state=checked]:border-transparent',
        className
      )}
    >
      {children}
    </button>
  </RadioGroupPrimitive.Item>
)