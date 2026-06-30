import { ArrowRight, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui'
import { recentOrders } from '../../data/mockDashboard'

export function RecentOrders({ editMode, onRemove }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col relative group">
      {editMode && (
        <button onClick={() => onRemove('recent_orders')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-text-primary">Recent Orders</p>
        <div className="flex items-center gap-2">
          <Link to="/orders" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
          {!editMode && (
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status'].map(h => (
              <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentOrders.map(o => (
            <tr key={o.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
              <td className="px-5 py-3 font-medium text-brand-500">{o.id}</td>
              <td className="px-5 py-3 text-text-primary">{o.customer}</td>
              <td className="px-5 py-3 text-text-muted">{o.date}</td>
              <td className="px-5 py-3 text-text-secondary">{o.items}</td>
              <td className="px-5 py-3 font-medium text-text-primary">{o.total}</td>
              <td className="px-5 py-3">
                <Badge variant={o.status} label={o.status.charAt(0).toUpperCase() + o.status.slice(1)} dot />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
