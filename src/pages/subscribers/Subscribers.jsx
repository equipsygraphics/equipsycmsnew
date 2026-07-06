import { useState } from 'react'
import { Search, Download, Users, UserCheck, UserX } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { mockSubscribers } from '../../data/mockSubscribers'

const SOURCE_LABEL = {
  checkout:     'Checkout',
  footer:       'Footer signup',
  'landing-page': 'Landing page',
  'trade-signup': 'Trade signup',
  manual:       'Manual',
}

const STATUS_TABS = [
  { key: 'all',          label: 'All' },
  { key: 'subscribed',   label: 'Subscribed' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
]

function StatCard({ icon: Icon, label, value, variant = 'default' }) {
  const iconCls = variant === 'success' ? 'text-success-500 bg-success-500/10' :
                  variant === 'muted'   ? 'text-grey-400 bg-grey-100' : 'text-brand-500 bg-brand-50'
  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconCls}`}>
        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-xl font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  )
}

export function Subscribers() {
  const [subs, setSubs] = useState(mockSubscribers)
  const [statusTab, setStatusTab] = useState('all')
  const [search, setSearch] = useState('')

  const counts = {
    all:          subs.length,
    subscribed:   subs.filter(s => s.status === 'subscribed').length,
    unsubscribed: subs.filter(s => s.status === 'unsubscribed').length,
  }

  const filtered = subs.filter(s => {
    if (statusTab !== 'all' && s.status !== statusTab) return false
    if (search) {
      const q = search.toLowerCase()
      return s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    }
    return true
  })

  const toggleStatus = (id) => {
    setSubs(prev => prev.map(s => {
      if (s.id !== id) return s
      if (s.status === 'subscribed') return { ...s, status: 'unsubscribed', unsubscribedAt: new Date().toISOString().slice(0, 10) }
      return { ...s, status: 'subscribed', unsubscribedAt: undefined }
    }))
    const sub = subs.find(s => s.id === id)
    toast(sub?.status === 'subscribed' ? `${sub.email} unsubscribed` : `${sub?.email} resubscribed`, 'success')
  }

  const handleExport = () => {
    const subscribedList = subs.filter(s => s.status === 'subscribed')
    toast(`Exporting ${subscribedList.length} subscribers to CSV…`, 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Subscribers"
        subtitle="Newsletter opt-ins collected from checkout, footer, and landing pages."
        actions={
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Users}     label="Total subscribers" value={counts.all} />
        <StatCard icon={UserCheck} label="Subscribed"         value={counts.subscribed}   variant="success" />
        <StatCard icon={UserX}     label="Unsubscribed"       value={counts.unsubscribed} variant="muted" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Status tabs */}
        <div className="flex items-center gap-0.5 bg-grey-100 rounded-lg p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusTab === tab.key
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs font-semibold ${statusTab === tab.key ? 'text-brand-500' : 'text-text-muted'}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="w-full pl-8 pr-3 h-9 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50/50">
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Source</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Signed up</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-right font-medium text-text-muted text-xs uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(sub => (
              <tr key={sub.id} className="hover:bg-grey-50 transition-colors">
                <td className="px-4 py-3 text-text-primary font-medium">{sub.email}</td>
                <td className="px-4 py-3 text-text-secondary">{sub.name || <span className="text-text-muted">—</span>}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{SOURCE_LABEL[sub.source] ?? sub.source}</td>
                <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                  {new Date(sub.subscribedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={sub.status === 'subscribed' ? 'active' : 'grey'}
                    label={sub.status === 'subscribed' ? 'Subscribed' : 'Unsubscribed'}
                    dot
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(sub.id)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                      sub.status === 'subscribed'
                        ? 'border-error-200 text-error-600 hover:bg-error-50'
                        : 'border-brand-200 text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {sub.status === 'subscribed' ? 'Unsubscribe' : 'Resubscribe'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-muted text-sm">No subscribers match your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
