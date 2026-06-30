// Shared form field primitives

export function Field({ label, hint, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  )
}

const inputBase = 'w-full h-10 px-3 rounded-lg border text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${inputBase} ${error ? 'border-error-500' : 'border-border bg-surface'} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ error, rows = 4, className = '', ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${inputBase} h-auto py-2.5 resize-y ${error ? 'border-error-500' : 'border-border bg-surface'} ${className}`}
      {...props}
    />
  )
}

export function Select({ error, children, className = '', ...props }) {
  return (
    <select
      className={`${inputBase} ${error ? 'border-error-500' : 'border-border bg-surface'} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-grey-200'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-text-primary">{label}</p>}
          {description && <p className="text-xs text-text-muted">{description}</p>}
        </div>
      )}
    </label>
  )
}

export function DateInput({ error, className = '', ...props }) {
  return (
    <input
      type="date"
      className={`${inputBase} ${error ? 'border-error-500' : 'border-border bg-surface'} ${className}`}
      {...props}
    />
  )
}
