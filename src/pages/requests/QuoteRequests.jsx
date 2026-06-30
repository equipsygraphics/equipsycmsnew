import { useState } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Textarea, Select } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockQuoteRequests } from '../../data/mockRequests'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
]

const STATUS_VARIANT = { new: 'warning', quoted: 'info', accepted: 'success', declined: 'error' }

export function QuoteRequests() {
  const [quotes, setQuotes] = useState(mockQuoteRequests)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ status: '', quotedTotal: '', message: '' })

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? quotes.length : quotes.filter(q => q.status === t.key).length
    return acc
  }, {})

  const filtered = quotes.filter(q => {
    if (activeTab !== 'all' && q.status !== activeTab) return false
    if (search && ![q.id, q.customer, q.products].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const openRespond = (quote) => {
    setSelected(quote)
    setForm({ status: quote.status === 'new' ? 'quoted' : quote.status, quotedTotal: quote.quotedTotal ?? '', message: quote.message ?? '' })
  }

  const handleSend = () => {
    setQuotes(prev => prev.map(q => q.id === selected.id
      ? { ...q, status: form.status, quotedTotal: form.quotedTotal ? Number(form.quotedTotal) : q.quotedTotal, message: form.message }
      : q))
    toast(`Quote ${selected.id} updated â€” ${form.status}`, 'success')
    setSelected(null)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quote Requests"
        subtitle="Review and respond to customer quote requests."
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ref, customer, product..." className="h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-64" />
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Ref', 'Customer', 'Product(s)', 'Date Received', 'Account', 'Status', ''].map((h, i) => (
                <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="px-5 py-12 text-center text-text-muted">No quote requests found.</td></tr>
              : filtered.map(quote => (
                <tr key={quote.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <button onClick={() => openRespond(quote)} className="font-semibold text-brand-500 hover:text-brand-600 hover:underline">{quote.id}</button>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-text-primary">{quote.customer}</td>
                  <td className="px-5 py-3.5 text-text-secondary max-w-48 truncate">{quote.products}</td>
                  <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{quote.dateReceived}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{quote.account}</td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[quote.status]} label={quote.status.charAt(0).toUpperCase() + quote.status.slice(1)} dot /></td>
                  <td className="px-5 py-3.5">
                    <Button variant="primary" size="sm" onClick={() => openRespond(quote)}>Respond</Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {quotes.length} requests</p>
        </div>
      </div>

      {/* Respond drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title={`Quote ${selected?.id}`} width="lg">
        {selected && (
          <div className="flex flex-col gap-5">
            {/* Customer info */}
            <div className="bg-grey-50 rounded-xl border border-border p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Customer</p>
              <p className="font-semibold text-text-primary">{selected.customer}</p>
              <div className="flex flex-col gap-1 text-sm text-text-secondary">
                <p>{selected.email}</p>
                <p>{selected.phone}</p>
                <p>Account type: <span className="font-medium text-text-primary">{selected.account}</span></p>
              </div>
              {selected.notes && <p className="text-sm text-text-muted italic mt-1">"{selected.notes}"</p>}
            </div>

            {/* Items requested */}
            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">Items Requested</p>
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                {selected.items.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? 'border-t border-border' : ''}`}>
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-text-muted">×{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Respond */}
            <div className="border-t border-border pt-4 flex flex-col gap-4">
              <p className="text-sm font-semibold text-text-primary">Send Response</p>
              <Field label="Update Status">
                <Select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="new">New</option>
                  <option value="quoted">Quoted</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </Select>
              </Field>
              <Field label="Quoted Total (AUD)" hint="Leave blank if not yet priced">
                <div className="flex items-center">
                  <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                  <Input type="number" value={form.quotedTotal} onChange={e => set('quotedTotal', e.target.value)} className="rounded-l-none" placeholder="0.00" />
                </div>
              </Field>
              <Field label="Message to Customer">
                <Textarea value={form.message} onChange={e => set('message', e.target.value)} rows={4} placeholder="e.g. Thank you for your quote request. Please find your pricing below..." />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
                <Button variant="primary" icon={<Send className="w-4 h-4" />} onClick={handleSend}>Send Response</Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
