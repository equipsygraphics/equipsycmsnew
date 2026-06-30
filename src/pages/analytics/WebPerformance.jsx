import { useState } from 'react'
import { Monitor, MousePointerClick, Clock, TrendingDown, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { toast } from '../../components/ui/Toast'
import { webPerformance, topPages } from '../../data/mockAnalytics'

const fmt = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v

export function WebPerformance() {
  const [activeMetric, setActiveMetric] = useState('sessions')

  const current = webPerformance[webPerformance.length - 1]
  const prev = webPerformance[webPerformance.length - 2]
  const sessionChange = Math.round(((current.sessions - prev.sessions) / prev.sessions) * 100)
  const pvChange = Math.round(((current.pageviews - prev.pageviews) / prev.pageviews) * 100)

  const METRICS = [
    { key: 'sessions', label: 'Sessions', value: current.sessions.toLocaleString(), change: sessionChange, color: '#3B82F6', icon: Monitor },
    { key: 'pageviews', label: 'Page Views', value: current.pageviews.toLocaleString(), change: pvChange, color: '#10B981', icon: MousePointerClick },
    { key: 'newUsers', label: 'New Users', value: current.newUsers.toLocaleString(), change: 13, color: '#8B5CF6', icon: Clock },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Website Performance"
        subtitle="Sessions, page views, and top content."
        actions={<Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => toast('Performance report exported', 'success')}>Export</Button>}
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Sessions (Jun)', value: current.sessions.toLocaleString(), change: sessionChange, sub: 'vs May' },
          { label: 'Page Views (Jun)', value: current.pageviews.toLocaleString(), change: pvChange, sub: 'vs May' },
          { label: 'New Users', value: current.newUsers.toLocaleString(), change: 13, sub: 'vs May' },
          { label: 'Avg Bounce Rate', value: '37%', change: -4, sub: 'lower is better' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border shadow-card p-4">
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
            <p className={`text-xs font-medium mt-1 ${stat.change > 0 ? 'text-success-500' : 'text-error-500'}`}>
              {stat.change > 0 ? 'â†‘' : 'â†“'} {Math.abs(stat.change)}% {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="bg-surface rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-text-primary">Traffic â€” Last 6 Months</p>
          <div className="flex gap-1">
            {METRICS.map(m => (
              <button key={m.key} onClick={() => setActiveMetric(m.key)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${activeMetric === m.key ? 'bg-brand-500 text-white' : 'text-text-muted hover:bg-grey-100'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={webPerformance} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tickFormatter={fmt} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={40} />
            <Tooltip formatter={(v) => [v.toLocaleString()]} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} />
            {METRICS.map(m => (
              <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color}
                strokeWidth={activeMetric === m.key ? 2.5 : 1}
                strokeOpacity={activeMetric === m.key ? 1 : 0.3}
                dot={activeMetric === m.key ? { fill: m.color, r: 3 } : false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top pages */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text-primary">Top Pages</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Page', 'Sessions', 'Bounce Rate', 'Avg Time'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPages.map((page, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-text-primary">{page.title}</p>
                  <p className="text-xs text-text-muted font-mono">{page.path}</p>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{page.sessions.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-grey-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${page.bounce > 50 ? 'bg-error-500' : page.bounce > 35 ? 'bg-warning-500' : 'bg-success-500'}`}
                        style={{ width: `${page.bounce}%` }} />
                    </div>
                    <span className="text-text-secondary text-xs">{page.bounce}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{page.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
