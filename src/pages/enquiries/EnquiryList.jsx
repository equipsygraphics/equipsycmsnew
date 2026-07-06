import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MessageSquare } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { mockEnquiries } from '../../data/mockEnquiries'

const STATUS_TABS = [
  { key: 'all',     label: 'All' },
  { key: 'open',    label: 'Open' },
  { key: 'replied', label: 'Replied' },
  { key: 'closed',  label: 'Closed' },
]

const STATUS_VARIANT = { open: 'warning', replied: 'info', closed: 'grey' }
const STATUS_LABEL   = { open: 'Open',    replied: 'Replied', closed: 'Closed' }

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(isoString).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export function EnquiryList() {
  const navigate = useNavigate()
  const [statusTab, setStatusTab] = useState('all')
  const [search, setSearch] = useState('')

  const counts = {
    all:     mockEnquiries.length,
    open:    mockEnquiries.filter(e => e.status === 'open').length,
    replied: mockEnquiries.filter(e => e.status === 'replied').length,
    closed:  mockEnquiries.filter(e => e.status === 'closed').length,
  }

  const filtered = mockEnquiries.filter(e => {
    if (statusTab !== 'all' && e.status !== statusTab) return false
    if (search) {
      const q = search.toLowerCase()
      return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Enquiries"
        subtitle="Contact Us messages from the website. Manage status and add reply notes."
      />

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

        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full pl-8 pr-3 h-9 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-text-muted">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-sm">No enquiries match your filters</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-50/50">
                <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">From</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Subject</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Submitted</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Replies</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(enq => (
                <tr
                  key={enq.id}
                  onClick={() => navigate(`/enquiries/${enq.id}`)}
                  className="hover:bg-grey-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{enq.name}</p>
                    <p className="text-xs text-text-muted">{enq.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-xs">
                    <p className="truncate">{enq.subject}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap text-xs">{timeAgo(enq.submittedAt)}</td>
                  <td className="px-4 py-3 text-text-muted">{enq.replies.length}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[enq.status]} label={STATUS_LABEL[enq.status]} dot />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
