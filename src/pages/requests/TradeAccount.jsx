import { useState } from 'react'
import { CheckCircle, XCircle, Search, Building2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Select, Textarea, Toggle } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockTradeAccounts } from '../../data/mockRequests'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
]

const STATUS_VARIANT = { pending: 'warning', approved: 'success', declined: 'error' }

const MOCK_ABN_DB = {
  '12 345 678 901': { name: 'SDA Living Co.', gst: true, status: 'Active' },
  '98 765 432 109': { name: 'Peninsula Aged Care Pty Ltd', gst: true, status: 'Active' },
  '55 444 333 222': { name: 'QuickCare Solutions Pty Ltd', gst: false, status: 'Active' },
  '77 888 999 000': { name: 'HomeMod Specialists', gst: true, status: 'Active' },
  '11 222 333 444': { name: 'Coastal Disability Services Inc', gst: false, status: 'Cancelled' },
}

export function TradeAccount() {
  const [accounts, setAccounts] = useState(mockTradeAccounts)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})
  const [abnInput, setAbnInput] = useState('')
  const [abnResult, setAbnResult] = useState(null)
  const [abnLooking, setAbnLooking] = useState(false)

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? accounts.length : accounts.filter(a => a.status === t.key).length
    return acc
  }, {})

  const filtered = accounts.filter(a => {
    if (activeTab !== 'all' && a.status !== activeTab) return false
    if (search && ![a.company, a.contact, a.abn].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const openAccount = (acct) => { setSelected(acct); setForm({ ...acct }); setAbnInput(acct.abn); setAbnResult(null) }

  const lookupABN = () => {
    const normalized = abnInput.trim()
    setAbnLooking(true)
    setTimeout(() => {
      const result = MOCK_ABN_DB[normalized]
      if (result) {
        setAbnResult({ ...result, abn: normalized })
        toast(`ABN verified: ${result.name}`, 'success')
      } else {
        setAbnResult(null)
        toast('ABN not found in the ABR. Please check and try again.', 'error')
      }
      setAbnLooking(false)
    }, 900)
  }

  const handleApprove = () => {
    setAccounts(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'approved', creditLimit: Number(form.creditLimit) || 5000, approved: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) } : a))
    toast(`Trade account approved for ${selected.company}`, 'success')
    setSelected(null)
  }

  const handleDecline = () => {
    setAccounts(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'declined' } : a))
    toast(`Trade account declined for ${selected.company}`, 'error')
    setSelected(null)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
              {['Company', 'ABN', 'Contact', 'Type', 'Applied', 'Credit Limit', 'Status', ''].map((h, i) => (
                <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="px-5 py-12 text-center text-text-muted">No applications found.</td></tr>
              : filtered.map(acct => (
                <tr key={acct.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
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
                  <td className="px-5 py-3.5 text-text-secondary">{acct.creditLimit ? `$${acct.creditLimit.toLocaleString()}` : 'â€”'}</td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[acct.status]} label={acct.status.charAt(0).toUpperCase() + acct.status.slice(1)} dot /></td>
                  <td className="px-5 py-3.5">
                    <Button variant="secondary" size="sm" onClick={() => openAccount(acct)}>Review</Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={`Trade Application â€” ${selected?.company}`} width="lg">
        {selected && (
          <div className="flex flex-col gap-5">
            {/* ABN Lookup */}
            <div className="bg-grey-50 rounded-xl border border-border p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">ABN Verification</p>
              <div className="flex gap-2">
                <Input value={abnInput} onChange={e => setAbnInput(e.target.value)} placeholder="XX XXX XXX XXX" className="flex-1 font-mono" />
                <Button variant="secondary" onClick={lookupABN} loading={abnLooking}>Lookup ABN</Button>
              </div>
              {abnResult && (
                <div className={`rounded-lg p-3 text-sm ${abnResult.status === 'Active' ? 'bg-success-500/10 border border-success-500/20' : 'bg-error-500/10 border border-error-500/20'}`}>
                  <p className="font-semibold text-text-primary">{abnResult.name}</p>
                  <div className="flex gap-4 mt-1 text-xs text-text-secondary">
                    <span>ABR Status: <strong className={abnResult.status === 'Active' ? 'text-success-500' : 'text-error-500'}>{abnResult.status}</strong></span>
                    <span>GST Registered: <strong>{abnResult.gst ? 'Yes' : 'No'}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact Name"><Input value={form.contact ?? ''} onChange={e => set('contact', e.target.value)} /></Field>
              <Field label="Email"><Input value={form.email ?? ''} onChange={e => set('email', e.target.value)} /></Field>
              <Field label="Phone"><Input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} /></Field>
              <Field label="Account Type">
                <Select value={form.type ?? ''} onChange={e => set('type', e.target.value)}>
                  <option>SDA Provider</option>
                  <option>Aged Care</option>
                  <option>Builder</option>
                  <option>Other</option>
                </Select>
              </Field>
            </div>
            <Field label="Credit Limit (AUD)">
              <div className="flex items-center">
                <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                <Input type="number" value={form.creditLimit ?? ''} onChange={e => set('creditLimit', e.target.value)} className="rounded-l-none" placeholder="e.g. 10000" />
              </div>
            </Field>
            <Field label="Internal Notes">
              <Textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Notes for internal use only..." />
            </Field>

            {selected.status === 'pending' && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={handleDecline} className="flex-1 justify-center">Decline</Button>
                <Button variant="primary" icon={<CheckCircle className="w-4 h-4" />} onClick={handleApprove} className="flex-1 justify-center">Approve Account</Button>
              </div>
            )}
            {selected.status !== 'pending' && (
              <div className="flex justify-end pt-2 border-t border-border">
                <Button variant="primary" onClick={() => { toast('Account updated', 'success'); setSelected(null) }}>Save Changes</Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
