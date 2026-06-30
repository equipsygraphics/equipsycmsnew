import { ArrowRight, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lowStock } from '../../data/mockDashboard'

export function LowStock({ editMode, onRemove }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col relative group">
      {editMode && (
        <button onClick={() => onRemove('low_stock')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-text-primary">Low Stock Alerts</p>
        <div className="flex items-center gap-2">
          <Link to="/products" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
          {!editMode && (
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="divide-y divide-border">
        {lowStock.map(item => {
          const pct = Math.round((item.stock / item.threshold) * 100)
          const danger = pct <= 30
          return (
            <div key={item.sku} className="px-5 py-3.5 flex items-center gap-4 hover:bg-grey-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.sku}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${danger ? 'text-error-500' : 'text-warning-500'}`}>{item.stock} left</p>
                <div className="w-24 h-1.5 bg-grey-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${danger ? 'bg-error-500' : 'bg-warning-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
