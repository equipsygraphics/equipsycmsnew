import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600 border border-transparent',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-grey-50',
  danger:    'bg-error-500 text-white hover:bg-error-700 border border-transparent',
  ghost:     'bg-transparent text-text-secondary hover:bg-grey-50 border border-transparent',
  outline:   'bg-transparent text-brand-500 border border-brand-500 hover:bg-brand-50',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, loading, disabled, onClick, type = 'button', children, className = '' }) {
  const v = VARIANTS[variant] ?? VARIANTS.primary
  const s = SIZES[size] ?? SIZES.md
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${v} ${s} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  )
}
