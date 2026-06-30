import { MoreHorizontal } from 'lucide-react'
import { trafficSources } from '../../data/mockDashboard'

export function TrafficSummary({ editMode, onRemove }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col relative group">
      {editMode && (
        <button onClick={() => onRemove('traffic')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-text-primary">Traffic Summary</p>
          <p className="text-xs text-text-muted mt-0.5">6,750 total sessions this month</p>
        </div>
        {!editMode && (
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="divide-y divide-border">
        {trafficSources.map(src => (
          <div key={src.source} className="px-5 py-3 flex items-center gap-3 hover:bg-grey-50 transition-colors">
            <p className="text-sm text-text-primary flex-1">{src.source}</p>
            <p className="text-sm font-medium text-text-secondary w-14 text-right">{src.sessions.toLocaleString()}</p>
            <div className="w-24 h-1.5 bg-grey-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${src.pct}%` }} />
            </div>
            <p className="text-xs text-text-muted w-8 text-right">{src.pct}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
