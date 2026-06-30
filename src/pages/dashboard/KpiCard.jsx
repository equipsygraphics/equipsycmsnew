import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export function KpiCard({ metric, onRemove, editMode }) {
  const up = metric.trend > 0
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-3 relative group">
      {editMode && (
        <button
          onClick={() => onRemove(metric.id)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10"
          title="Remove widget"
        >×</button>
      )}
      <div className="flex items-start justify-between">
        <span className="text-sm text-text-muted font-medium">{metric.label}</span>
        {!editMode && (
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-text-primary">{metric.value}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${up ? 'text-success-500' : 'text-error-500'}`}>
            {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{up ? '+' : ''}{metric.trend}%</span>
          </div>
        </div>
        <div className="w-28 h-12 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric.sparkline.map((v, i) => ({ v, i }))}>
              <Line type="monotone" dataKey="v" stroke={metric.color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
