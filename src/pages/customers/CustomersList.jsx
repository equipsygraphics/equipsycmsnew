import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CSVExport } from '../../components/ui/CSVExport'
import { PageHeader } from '../../components/ui/PageHeader'
import { toast } from '../../components/ui/Toast'
import { mockCustomers } from '../../data/mockCustomers'

const CSV_COLS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'region', label: 'Region' },
  { key: 'accountType', label: 'Account Type' },
  { key: 'orders', label: 'Orders' },
  { key: 'spent', label: 'Total Spent', csvValue: r => `$${r.spent.toFixed(2)}` },
  { key: 'status', label: 'Status' },
  { key: 'joined', label: 'Date Joined' },
]

export function CustomersList() {
  const navigate = useNavigate()
  const [customers] = useState(mockCustomers)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = customers.filter(c => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    if (search && !name.includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && c.accountType !== typeFilter) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        actions={
          <>
            <CSVExport data={filtered} columns={CSV_COLS} filename="customers" />
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast('Manual customer creation coming soon', 'info')}>Add Customer</Button>
          </>
        }
      />

      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-60" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none">
          <option value="all">Account: All</option>
          <option value="standard">Standard</option>
          <option value="trade">Trade</option>
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Customer', 'Email', 'Role', 'Location', 'Account Type', 'Orders', 'Total Spent', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-semibold shrink-0">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <p className="font-medium text-text-primary">{c.firstName} {c.lastName}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{c.email}</td>
                <td className="px-5 py-3.5 text-text-secondary">{c.occupation || '—'}</td>
                <td className="px-5 py-3.5 text-text-secondary">{c.region || '—'}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={c.accountType === 'trade' ? 'info' : 'grey'} label={c.accountType === 'trade' ? 'Trade' : 'Standard'} />
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{c.orders}</td>
                <td className="px-5 py-3.5 font-medium text-text-primary">${c.spent.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3.5"><Badge variant={c.status === 'active' ? 'active' : 'grey'} label={c.status === 'active' ? 'Active' : 'Inactive'} dot /></td>
                <td className="px-5 py-3.5">
                  <button onClick={e => { e.stopPropagation(); navigate(`/customers/${c.id}`) }} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {customers.length} customers</p>
        </div>
      </div>
    </div>
  )
}
