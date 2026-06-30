export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex flex-col gap-1 pb-5 border-b border-border mb-6">
      {breadcrumb && (
        <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
          {breadcrumb}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
