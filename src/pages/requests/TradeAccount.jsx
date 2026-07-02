import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { mockTradeAccounts } from '../../data/mockRequests'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
]

const STATUS_VARIANT = { pending: 'warning', approved: 'success', declined: 'error' }

export function TradeAccount() {
  const navigate = useNavigate()
  const [accounts] = useState(mockTradeAccounts)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? accounts.length : accounts.filter(a => a.status === t.key).length
    return acc
  }, {})

  const filtered = accounts.filter(a => {
    if (activeTab !== 'all' && a.status !== activeTab) return false
    if (search && ![a.company, a.contact, a.abn].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Trade Account Applications"
        subtitle="Review and approve trade account requests."
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex border-b border-border">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-brand-100 text-brand-600' : 'bg-grey-100 text-text-muted'}`}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, ABN..." className="h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-56" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Company', 'ABN', 'Contact', 'Type', 'Applied', 'Status', ''].map((h, i) => (
                <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="px-5 py-12 text-center text-text-muted">No applications found.</td></tr>
              : filtered.map(acct => (
                <tr key={acct.id}
                  onClick={() => navigate(`/trade-account/${acct.id}`)}
                  className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                      <span className="font-medium text-text-primary">{acct.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted font-mono text-xs">{acct.abn}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{acct.contact}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{acct.type}</td>
                  <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{acct.applied}</td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[acct.status]} label={acct.status.charAt(0).toUpperCase() + acct.status.slice(1)} dot /></td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/trade-account/${acct.id}`)}>Review</Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
