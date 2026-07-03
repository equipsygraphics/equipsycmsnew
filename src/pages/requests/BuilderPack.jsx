import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { mockBuilderPacks } from '../../data/mockRequests'

const STATUS_VARIANT = { pending: 'warning', shipped: 'success' }
const STATUS_LABEL   = { pending: 'Pending', shipped: 'Shipped' }

export function BuilderPack() {
  const navigate = useNavigate()
  const [packs] = useState(mockBuilderPacks)
  const [search, setSearch] = useState('')

  const filtered = packs.filter(p =>
    !search || [p.company, p.firstName, p.lastName, p.state].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Builder Pack Requests"
        subtitle="Send specification packs to builders and contractors."
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="bg-surface rounded-xl border border-border px-4 py-3 text-center">
            <p className="text-2xl font-bold text-text-primary">{packs.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs text-text-muted mt-0.5">Pending</p>
          </div>
          <div className="bg-surface rounded-xl border border-border px-4 py-3 text-center">
            <p className="text-2xl font-bold text-success-500">{packs.filter(p => p.status === 'shipped').length}</p>
            <p className="text-xs text-text-muted mt-0.5">Shipped</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company, state..."
            className="h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-52"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Ref', 'Name', 'Company', 'Occupation', 'Project Type', 'Units', 'State', 'Requested', 'Status', ''].map((h, i) => (
                <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={10} className="px-5 py-12 text-center text-text-muted">No requests found.</td></tr>
              : filtered.map(pack => (
                <tr
                  key={pack.id}
                  onClick={() => navigate(`/builder-pack/${pack.id}`)}
                  className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-semibold text-brand-500">{pack.id}</td>
                  <td className="px-5 py-3.5 font-medium text-text-primary whitespace-nowrap">{pack.firstName} {pack.lastName}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.company}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.occupation}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.projectType}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.units}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.state}</td>
                  <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{pack.requested}</td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[pack.status]} label={STATUS_LABEL[pack.status]} dot /></td>
                  <td className="px-5 py-3.5" onClick={e => { e.stopPropagation(); navigate(`/builder-pack/${pack.id}`) }}>
                    <Button variant="secondary" size="sm" icon={<ChevronRight className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
