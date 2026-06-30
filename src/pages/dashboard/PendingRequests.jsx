import { ArrowRight, MoreHorizontal, MessageSquare, Briefcase, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { pendingRequests } from '../../data/mockDashboard'

const ICONS = { 'Quote': MessageSquare, 'Trade Account': Briefcase, 'Builder Pack': Package }
const LINKS = { 'Quote': '/quote-requests', 'Trade Account': '/trade-account', 'Builder Pack': '/builder-pack' }

export function PendingRequests({ editMode, onRemove }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col relative group">
      {editMode && (
        <button onClick={() => onRemove('requests')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-text-primary">Pending Requests</p>
        {!editMode && (
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="divide-y divide-border">
        {pendingRequests.map(req => {
          const Icon = ICONS[req.type]
          return (
            <Link key={req.type} to={LINKS[req.type]} className="flex items-center gap-4 px-5 py-4 hover:bg-grey-50 transition-colors group/row">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-brand-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{req.type}</p>
                <p className="text-xs text-text-muted">{req.count} awaiting review</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-error-500 text-white text-xs font-semibold flex items-center justify-center">{req.count}</span>
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover/row:opacity-100 transition-opacity" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
