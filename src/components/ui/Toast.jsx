import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-success-500" />,
  error: <XCircle className="w-5 h-5 text-error-500" />,
  warning: <AlertCircle className="w-5 h-5 text-warning-500" />,
  info: <Info className="w-5 h-5 text-brand-500" />,
}

function Toast({ id, type = 'success', message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
    <div className="flex items-start gap-3 w-80 bg-surface border border-border rounded-lg shadow-sm px-4 py-3 pointer-events-auto">
      {ICONS[type]}
      <p className="flex-1 text-sm text-text-primary leading-snug">{message}</p>
      <button onClick={() => onDismiss(id)} className="text-text-muted hover:text-text-secondary mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// Hook
let _setToasts = null
let _counter = 0

export function useToast() {
  const [toasts, setToasts] = useState([])
  _setToasts = setToasts

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return { toasts, dismiss }
}

export function toast(message, type = 'success') {
  if (!_setToasts) return
  const id = ++_counter
  _setToasts(prev => [...prev, { id, message, type }])
}
