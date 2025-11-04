import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from './utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPortal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card border border-border p-6 shadow-md focus:outline-none',
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export function DialogHeader({ className, children }) {
  return <div className={cn('mb-4 space-y-1', className)}>{children}</div>
}

export function DialogTitle({ className, children }) {
  return <h3 className={cn('text-xl font-semibold', className)}>{children}</h3>
}

export function DialogDescription({ className, children }) {
  return <p className={cn('text-sm text-text-secondary', className)}>{children}</p>
}