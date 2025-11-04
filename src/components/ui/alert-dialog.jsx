import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Button } from './button'
import { cn } from './utils'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogPortal = AlertDialogPrimitive.Portal

export function AlertDialogContent({ className, children, ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <AlertDialogPrimitive.Content
        className={cn('fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card border border-border p-6 shadow-md', className)}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}

export const AlertDialogHeader = ({ children }) => (
  <div className="space-y-1 mb-4">{children}</div>
)
export const AlertDialogTitle = ({ children }) => (
  <h3 className="text-xl font-semibold">{children}</h3>
)
export const AlertDialogDescription = ({ children }) => (
  <p className="text-sm text-text-secondary">{children}</p>
)

export const AlertDialogFooter = ({ onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => (
  <div className="mt-6 flex justify-end gap-2">
    <AlertDialogPrimitive.Cancel asChild>
      <Button variant="outline">{cancelText}</Button>
    </AlertDialogPrimitive.Cancel>
    <AlertDialogPrimitive.Action asChild>
      <Button onClick={onConfirm}>{confirmText}</Button>
    </AlertDialogPrimitive.Action>
  </div>
)