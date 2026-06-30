import { useState } from 'react'
import { UserX, Download, Plus, Search, Mail } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input, Select } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockSubscribers } from '../../data/mockMarketing'

const TYPES = ['All', 'Retail', 'Trade', 'SDA Provider', 'Aged Care', 'Builder']

export function Newsletter() {
  const [subscribers, setSubscribers] = useState(mockSubscribers)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [unsubTarget, setUnsubTarget] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newSub, setNewSub] = useState({ email: '', name: '', type: 'Retail' })

  const filtered = subscribers.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (typeFilter !== 'All' && s.type !== typeFilter) return false
    if (search && ![s.email, s.name].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const handleUnsubscribe = (id) => {
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: 'unsubscribed' } : s))
    toast('Subscriber unsubscribed', 'success')
    setUnsubTarget(null)
  }

  const handleAdd = () => {
    if (!newSub.email.trim()) { toast('Email is required', 'error'); return }
    setSubscribers(prev => [...prev, {
      ...newSub, id: Date.now(), status: 'subscribed',
      joinDate: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      tags: [],
    }])
    toast(`${newSub.email} added to list`, 'success')
    setAddOpen(false)
    setNewSub({ email: '', name: '', type: 'Retail' })
  }

  const handleExport = () => {
    const rows = [['Email', 'Name', 'Type', 'Status', 'Joined'], ...filtered.map(s => [s.email, s.name, s.type, s.status, s.joinDate])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
    toast(`Exported ${filtered.length} subscribers`, 'success')
  }

  const subCount = subscribers.filter(s => s.status === 'subscribed').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Newsletter Subscribers"
        subtitle={`${subCount} active subscribers`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>Add Subscriber</Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: subCount, icon: Mail, color: 'text-brand-500 bg-brand-50' },
          { label: 'Unsubscribed', value: subscribers.filter(s => s.status === 'unsubscribed').length, icon: UserX, color: 'text-error-500 bg-error-500/10' },
          { label: 'Trade & Provider', value: subscribers.filter(s => ['Trade', 'SDA Provider', 'Aged Care'].includes(s.type)).length, icon: Mail, color: 'text-success-500 bg-success-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border shadow-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm outline-none">
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm outline-none">
          <option value="all">All Statuses</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Subscriber', 'Type', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5} className="px-5 py-12 text-center text-text-muted">No subscribers found.</td></tr>
              : filtered.map(sub => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{sub.name}</p>
                        <p className="text-xs text-text-muted">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{sub.type}</td>
                  <td className="px-5 py-3.5 text-text-muted">{sub.joinDate}</td>
                  <td className="px-5 py-3.5"><Badge variant={sub.status === 'subscribed' ? 'success' : 'default'} label={sub.status === 'subscribed' ? 'Subscribed' : 'Unsubscribed'} dot /></td>
                  <td className="px-5 py-3.5 text-right">
                    {sub.status === 'subscribed' && (
                      <button onClick={() => setUnsubTarget(sub)} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10" title="Unsubscribe">
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {subscribers.length} subscribers</p>
        </div>
      </div>

      <Drawer open={addOpen} onClose={() => setAddOpen(false)} title="Add Subscriber">
        <div className="flex flex-col gap-4">
          <Field label="Email" required><Input value={newSub.email} onChange={e => setNewSub(s => ({ ...s, email: e.target.value }))} type="email" placeholder="subscriber@example.com" /></Field>
          <Field label="Name"><Input value={newSub.name} onChange={e => setNewSub(s => ({ ...s, name: e.target.value }))} placeholder="Full name" /></Field>
          <Field label="Type">
            <Select value={newSub.type} onChange={e => setNewSub(s => ({ ...s, type: e.target.value }))}>
              {TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd}>Add Subscriber</Button>
          </div>
        </div>
      </Drawer>

      <ConfirmModal open={!!unsubTarget} onClose={() => setUnsubTarget(null)}
        onConfirm={() => handleUnsubscribe(unsubTarget?.id)}
        title="Unsubscribe" message={`Unsubscribe ${unsubTarget?.email} from all marketing emails?`} confirmLabel="Unsubscribe" destructive />
    </div>
  )
}
