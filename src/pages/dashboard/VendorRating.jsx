import { MoreHorizontal } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { vendorRating } from '../../data/mockDashboard'

export function VendorRating({ editMode, onRemove }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4 relative group h-full">
      {editMode && (
        <button onClick={() => onRemove('vendor')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Average vendor rating</p>
          <p className="text-xs text-text-muted mt-0.5">Track how your rating compares to your industry average.</p>
        </div>
        {!editMode && (
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={vendorRating} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9DA4AE' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9DA4AE' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="yours" name="Your rating" stroke="#0b9ff9" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="industry" name="Industry Average" stroke="#9BD7FD" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
