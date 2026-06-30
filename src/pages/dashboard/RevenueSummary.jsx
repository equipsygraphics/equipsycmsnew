import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { revenueByMonth } from '../../data/mockDashboard'

const PERIODS = ['12 months', '30 days', '7 days']

const sliceData = (period) => {
  if (period === '7 days') return revenueByMonth.slice(-2)
  if (period === '30 days') return revenueByMonth.slice(-4)
  return revenueByMonth
}

export function RevenueSummary({ editMode, onRemove }) {
  const [period, setPeriod] = useState('12 months')
  const data = sliceData(period)

  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4 relative group">
      {editMode && (
        <button onClick={() => onRemove('revenue')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Revenue summary</p>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-grey-900 text-white' : 'bg-surface text-text-secondary hover:bg-grey-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
          {!editMode && (
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-grey-50 text-text-muted">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={period === '12 months' ? 18 : 40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9DA4AE' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9DA4AE' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, '']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="online" name="Online" stackId="a" fill="#0b9ff9" radius={[0,0,0,0]} />
            <Bar dataKey="trade" name="Trade" stackId="a" fill="#1F2A37" radius={[0,0,0,0]} />
            <Bar dataKey="quote" name="Quote" stackId="a" fill="#9BD7FD" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
