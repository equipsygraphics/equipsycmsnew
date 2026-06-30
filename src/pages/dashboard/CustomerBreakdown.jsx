import { MoreHorizontal } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { customerBreakdown } from '../../data/mockDashboard'

export function CustomerBreakdown({ editMode, onRemove }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4 relative group h-full">
      {editMode && (
        <button onClick={() => onRemove('customer')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Customer breakdown</p>
        {!editMode && (
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex gap-4 items-center flex-1">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={customerBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2}>
                {customerBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2">
          {customerBreakdown.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-text-secondary">{item.name}</span>
              <span className="text-xs font-medium text-text-primary ml-auto pl-2">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
