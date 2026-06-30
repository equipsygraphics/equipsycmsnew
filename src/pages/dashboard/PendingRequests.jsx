import { ArrowRight, ShoppingCart, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ordersAwaiting, pendingRequests } from '../../data/mockDashboard'

const totalRequests = pendingRequests.reduce((sum, r) => sum + r.count, 0)

export function PendingRequests({ editMode, onRemove }) {
  return (
    <div className="grid grid-cols-2 gap-4 relative">
      {editMode && (
        <button onClick={() => onRemove('action_queue')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}

      {/* Orders Awaiting Processing */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#FEF0C7' }}>
              <ShoppingCart className="w-4 h-4" style={{ color: '#B54708' }} />
            </div>
            <p className="text-sm font-semibold text-text-primary">Orders Awaiting Action</p>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Link to="/orders?status=processing" className="flex items-center justify-between px-5 py-3.5 hover:bg-grey-50 transition-colors group/row">
            <div>
              <p className="text-sm font-medium text-text-primary">Awaiting Processing</p>
              <p className="text-xs text-text-muted mt-0.5">Orders submitted, not yet picked</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="min-w-[28px] h-7 rounded-full text-sm font-bold flex items-center justify-center px-2" style={{ backgroundColor: '#FEF0C7', color: '#B54708' }}>{ordersAwaiting.processing}</span>
              <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover/row:opacity-100 transition-opacity" />
            </div>
          </Link>
          <Link to="/orders?status=shipped" className="flex items-center justify-between px-5 py-3.5 hover:bg-grey-50 transition-colors group/row">
            <div>
              <p className="text-sm font-medium text-text-primary">Awaiting Shipment</p>
              <p className="text-xs text-text-muted mt-0.5">Picked, pending Shippit dispatch</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="min-w-[28px] h-7 rounded-full bg-grey-100 text-text-primary text-sm font-bold flex items-center justify-center px-2">{ordersAwaiting.shipment}</span>
              <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover/row:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      </div>

      {/* New Requests */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <Inbox className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-sm font-semibold text-text-primary">New Requests</p>
          </div>
          <span className="text-xl font-bold text-text-primary">{totalRequests}</span>
        </div>
        <div className="divide-y divide-border">
          {pendingRequests.map(req => (
            <Link key={req.type} to={req.to} className="flex items-center justify-between px-5 py-3.5 hover:bg-grey-50 transition-colors group/row">
              <p className="text-sm font-medium text-text-primary">{req.type}</p>
              <div className="flex items-center gap-2.5">
                <span className="min-w-[28px] h-7 rounded-full bg-brand-50 text-brand-600 text-sm font-bold flex items-center justify-center px-2">{req.count}</span>
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover/row:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
