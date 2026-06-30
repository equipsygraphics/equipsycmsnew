export function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div className={`bg-surface rounded-xl border border-border shadow-card ${padding ? 'p-5' : ''} ${hover ? 'transition-shadow hover:shadow-sm cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}
