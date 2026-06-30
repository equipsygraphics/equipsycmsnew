import { useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grey-900/40" onClick={onClose} />
      <div className={`relative bg-surface rounded-xl shadow-sm border border-border w-full ${widths[size]} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary p-1 rounded-md hover:bg-grey-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', destructive = true }) {
  if (!open) return null
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose() }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {destructive && (
          <div className="shrink-0 w-10 h-10 rounded-full bg-error-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-error-500" />
          </div>
        )}
        <p className="text-sm text-text-secondary leading-relaxed pt-2">{message}</p>
      </div>
    </Modal>
  )
}

// Local Button to avoid circular dep
function Button({ variant = 'primary', onClick, children }) {
  const styles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'bg-surface border border-border text-text-primary hover:bg-grey-50',
    danger: 'bg-error-500 text-white hover:bg-error-700',
  }
  return (
    <button onClick={onClick} className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${styles[variant]}`}>
      {children}
    </button>
  )
}
