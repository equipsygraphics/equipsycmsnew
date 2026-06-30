import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CSVExport } from '../../components/ui/CSVExport'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Select, Textarea } from '../../components/ui/FormField'
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
  const [customers, setCustomers] = useState(mockCustomers)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = customers.filter(c => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    if (search && !name.includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && c.accountType !== typeFilter) return false
    return true
  })

  const openEdit = (c) => { setEditing({ ...c }); setDrawerOpen(true) }
  const openNew = () => {
    setEditing({ firstName: '', lastName: '', email: '', phone: '', occupation: '', region: '', accountType: 'standard', notes: '' })
    setDrawerOpen(true)
  }
  const handleSave = () => {
    if (editing.id) {
      setCustomers(prev => prev.map(c => c.id === editing.id ? editing : c))
      toast('Customer updated', 'success')
    } else {
      setCustomers(prev => [{ ...editing, id: Date.now(), orders: 0, spent: 0, status: 'active', joined: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }, ...prev])
      toast('Customer added', 'success')
    }
    setDrawerOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        actions={
          <>
            <CSVExport data={filtered} columns={CSV_COLS} filename="customers" />
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNew}>Add Customer</Button>
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
              {['Customer', 'Email', 'Account Type', 'Orders', 'Total Spent', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-semibold shrink-0">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-text-muted">{c.occupation} · {c.region}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{c.email}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={c.accountType === 'trade' ? 'info' : 'grey'} label={c.accountType === 'trade' ? 'Trade' : 'Standard'} />
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{c.orders}</td>
                <td className="px-5 py-3.5 font-medium text-text-primary">${c.spent.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3.5"><Badge variant={c.status === 'active' ? 'active' : 'grey'} label={c.status === 'active' ? 'Active' : 'Inactive'} dot /></td>
                <td className="px-5 py-3.5">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50"><Edit2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {customers.length} customers</p>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing?.id ? 'Edit Customer' : 'Add Customer'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save</Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required><Input value={editing.firstName} onChange={e => setEditing(p => ({ ...p, firstName: e.target.value }))} /></Field>
              <Field label="Last Name" required><Input value={editing.lastName} onChange={e => setEditing(p => ({ ...p, lastName: e.target.value }))} /></Field>
            </div>
            <Field label="Email" required><Input type="email" value={editing.email} onChange={e => setEditing(p => ({ ...p, email: e.target.value }))} /></Field>
            <Field label="Phone"><Input value={editing.phone} onChange={e => setEditing(p => ({ ...p, phone: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Occupation/Role"><Input value={editing.occupation} onChange={e => setEditing(p => ({ ...p, occupation: e.target.value }))} /></Field>
              <Field label="Region"><Input value={editing.region} onChange={e => setEditing(p => ({ ...p, region: e.target.value }))} /></Field>
            </div>
            <Field label="Account Type">
              <Select value={editing.accountType} onChange={e => setEditing(p => ({ ...p, accountType: e.target.value }))}>
                <option value="standard">Standard</option>
                <option value="trade">Trade</option>
              </Select>
            </Field>
            <Field label="Internal Notes" hint="Only visible to admin staff">
              <Textarea value={editing.notes} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Add any internal notes here..." />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  )
}
