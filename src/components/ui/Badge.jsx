const VARIANTS = {
  // Publication status
  published:  'bg-success-500/10 text-success-500',
  active:     'bg-success-500/10 text-success-500',
  draft:      'bg-grey-100 text-grey-500',
  archived:   'bg-grey-100 text-grey-500',
  unpublished:'bg-grey-100 text-grey-500',

  // Order / request status
  pending:    'bg-warning-500/10 text-warning-500',
  processing: 'bg-brand-100 text-brand-600',
  shipped:    'bg-brand-100 text-brand-600',
  delivered:  'bg-success-500/10 text-success-500',
  cancelled:  'bg-error-500/10 text-error-500',
  refunded:   'bg-grey-100 text-grey-500',

  // Quote / Trade
  quoted:     'bg-brand-100 text-brand-600',
  approved:   'bg-success-500/10 text-success-500',
  denied:     'bg-error-500/10 text-error-500',
  converted:  'bg-success-500/10 text-success-500',

  // Payment
  paid:       'bg-success-500/10 text-success-500',
  unpaid:     'bg-error-500/10 text-error-500',
  partial:    'bg-warning-500/10 text-warning-500',

  // Generic
  info:       'bg-brand-100 text-brand-600',
  success:    'bg-success-500/10 text-success-500',
  warning:    'bg-warning-500/10 text-warning-500',
  error:      'bg-error-500/10 text-error-500',
  grey:       'bg-grey-100 text-grey-500',
}

export function Badge({ variant = 'grey', label, dot = false }) {
  const cls = VARIANTS[variant] ?? VARIANTS.grey
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}
    </span>
  )
}
