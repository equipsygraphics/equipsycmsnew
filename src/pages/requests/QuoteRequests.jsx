import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, AlertTriangle, Plus, Truck, Package } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Textarea, Select } from '../../components/ui/FormField'
import { TagPicker } from '../../components/ui/TagPicker'
import { toast } from '../../components/ui/Toast'
import { mockQuoteRequests } from '../../data/mockRequests'
import { mockProducts } from '../../data/mockProducts'

const TABS = [
  { key: 'all',               label: 'All' },
  { key: 'freight_requested', label: 'Freight Requested' },
  { key: 'quote_sent',        label: 'Quote Sent' },
  { key: 'awaiting_payment',  label: 'Awaiting Payment' },
  { key: 'closed',            label: 'Closed' },
]

const STATUS_LABEL   = { freight_requested: 'Freight Requested', quote_sent: 'Quote Sent', awaiting_payment: 'Awaiting Payment', paid: 'Paid', closed: 'Closed' }
const STATUS_VARIANT = { freight_requested: 'warning', quote_sent: 'info', awaiting_payment: 'warning', paid: 'success', closed: 'grey' }
const QUOTE_TYPE_LABEL   = { standard: 'Standard Items', freight: 'Freight', shower_base: 'Shower Base Insert' }
const QUOTE_TYPE_VARIANT = { standard: 'info', freight: 'warning', shower_base: 'grey' }

function daysRemainingForAutoClose(sentAt) {
  if (!sentAt) return null
  return 30 - Math.floor((Date.now() - new Date(sentAt)) / 86400000)
}

const EMPTY_FORM = {
  quoteType: 'standard',
  customer: '', email: '', phone: '', account: 'Retail',
  billingAddress: '', fulfillment: 'delivery', deliveryAddress: '',
  notes: '',
  items: [{ id: Date.now(), name: '', sku: '', qty: 1, unitPrice: 0 }],
  shippingCost: 0,
}

function NewQuoteDrawer({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addItem = () => set('items', [...form.items, { id: Date.now(), name: '', sku: '', qty: 1, unitPrice: 0 }])
  const removeItem = id => set('items', form.items.filter(i => i.id !== id))
  const updateItem = (id, field, value) =>
    set('items', form.items.map(i => i.id === id ? { ...i, [field]: value } : i))

  const inStock = mockProducts.filter(p => p.status === 'published' && p.stock > 0)

  const handleCreate = () => {
    if (!form.customer.trim()) { toast('Customer name is required', 'error'); return }
    if (!form.email.trim())    { toast('Customer email is required', 'error'); return }
    onSave(form)
    setForm(EMPTY_FORM)
    onClose()
  }

  return (
    <Drawer open={open} onClose={onClose} title="New Quote" width="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleCreate}>Create Quote</Button></>}>
      <div className="flex flex-col gap-5">
        {/* Quote type */}
        <Field label="Quote Type">
          <div className="grid grid-cols-3 gap-2">
            {[['standard','Standard Items'],['freight','Freight'],['shower_base','Shower Base Insert']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => set('quoteType', val)}
                className={`p-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${form.quoteType === val ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-border text-text-secondary hover:border-grey-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </Field>

        {/* Customer */}
        <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Customer</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" required><Input value={form.customer} onChange={e => set('customer', e.target.value)} /></Field>
            <Field label="Account Type">
              <Select value={form.account} onChange={e => set('account', e.target.value)}>
                <option>Retail</option>
                <option>Trade</option>
                <option>SDA Provider</option>
              </Select>
            </Field>
          </div>
          <Field label="Email" required><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Billing Address"><Input value={form.billingAddress} onChange={e => set('billingAddress', e.target.value)} /></Field>
        </div>

        {/* Fulfillment */}
        <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Fulfillment</p>
          <div className="flex gap-3">
            {[['delivery','Delivery',Truck],['click_collect','Click & Collect',Package]].map(([val, label, Icon]) => (
              <button key={val} type="button" onClick={() => set('fulfillment', val)}
                className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-colors ${form.fulfillment === val ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-grey-300'}`}>
                <Icon className={`w-4 h-4 ${form.fulfillment === val ? 'text-brand-500' : 'text-text-muted'}`} />
                <span className={`text-sm font-semibold ${form.fulfillment === val ? 'text-brand-600' : 'text-text-primary'}`}>{label}</span>
              </button>
            ))}
          </div>
          {form.fulfillment === 'delivery' && (
            <Field label="Delivery Address">
              <Textarea value={form.deliveryAddress} onChange={e => set('deliveryAddress', e.target.value)} rows={2} placeholder="Street, Suburb, State, Postcode" />
            </Field>
          )}
        </div>

        {/* Items (standard + freight) */}
        {form.quoteType !== 'shower_base' && (
          <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Items</p>
            {form.items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Field label="Product">
                    <select value={item.name}
                      onChange={e => {
                        const product = inStock.find(p => p.name === e.target.value)
                        if (product) {
                          const isTrade = form.account === 'Trade' || form.account === 'SDA Provider'
                          updateItem(item.id, 'name', product.name)
                          updateItem(item.id, 'sku', product.sku)
                          // chain two updates via direct form set
                          set('items', form.items.map(i => i.id === item.id
                            ? { ...i, name: product.name, sku: product.sku, unitPrice: isTrade ? product.tradePrice : product.price }
                            : i))
                        } else {
                          updateItem(item.id, 'name', e.target.value)
                        }
                      }}
                      className="h-10 w-full px-3 rounded-lg border border-border text-sm outline-none focus:border-brand-500 bg-white">
                      <option value="">Select product…</option>
                      {inStock.map(p => <option key={p.id} value={p.name}>{p.name} ({p.sku})</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Qty">
                    <Input type="number" min="1" value={item.qty}
                      onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)} />
                  </Field>
                </div>
                <div className="col-span-3">
                  <Field label="Unit Price">
                    <div className="flex">
                      <span className="h-10 px-2.5 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                      <Input type="number" value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="rounded-l-none" />
                    </div>
                  </Field>
                </div>
                <div className="col-span-2 pb-0.5">
                  <button onClick={() => removeItem(item.id)}
                    className="w-full h-10 flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-error-500 hover:bg-error-50 transition-colors">
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
              <Plus className="w-4 h-4" /> Add item
            </button>
            {form.fulfillment === 'delivery' && (
              <Field label={form.quoteType === 'freight' ? 'Freight cost (AUD)' : 'Shipping fee (AUD)'}>
                <div className="flex">
                  <span className="h-10 px-2.5 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                  <Input type="number" value={form.shippingCost}
                    onChange={e => set('shippingCost', parseFloat(e.target.value) || 0)}
                    className="rounded-l-none w-32"
                    placeholder={form.quoteType === 'freight' ? 'Enter after calculating' : '0.00'} />
                </div>
              </Field>
            )}
          </div>
        )}

        {/* Shower base placeholder */}
        {form.quoteType === 'shower_base' && (
          <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Shower Base Specifications</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Length (mm)"><Input type="number" placeholder="e.g. 900" /></Field>
              <Field label="Width (mm)"><Input type="number" placeholder="e.g. 900" /></Field>
              <Field label="Depth (mm)"><Input type="number" placeholder="e.g. 40" /></Field>
              <Field label="Finish"><Input placeholder="e.g. White" /></Field>
            </div>
            <Field label="Notes"><Textarea rows={2} placeholder="Any custom specifications…" /></Field>
            <p className="text-xs text-text-muted italic">Final dimension field spec TBC — placeholder fields only.</p>
          </div>
        )}

        <Field label="Internal Notes">
          <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any notes for this quote…" />
        </Field>
      </div>
    </Drawer>
  )
}

export function QuoteRequests() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState(mockQuoteRequests.filter(q => q.status !== 'paid'))
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [newQuoteOpen, setNewQuoteOpen] = useState(false)

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? quotes.length : quotes.filter(q => q.status === t.key).length
    return acc
  }, {})

  const filtered = quotes.filter(q => {
    if (activeTab !== 'all' && q.status !== activeTab) return false
    if (search) {
      const s = search.toLowerCase()
      if (![q.id, q.quoteNumber, q.customer, q.account].some(v => v?.toLowerCase().includes(s))) return false
    }
    return true
  })

  const handleCreateQuote = (form) => {
    const newId = `Q-${Date.now().toString().slice(-4)}`
    const isTrade = form.account === 'Trade' || form.account === 'SDA Provider'
    const itemsTotal = form.items.reduce((s, i) => s + (parseFloat(i.unitPrice) || 0) * (parseInt(i.qty) || 0), 0)
    const shipping = form.fulfillment === 'delivery' ? (parseFloat(form.shippingCost) || 0) : 0
    const subtotal = parseFloat((itemsTotal + shipping).toFixed(2))
    const gst = parseFloat((subtotal / 11).toFixed(2))
    const status = form.quoteType === 'freight' && !form.shippingCost ? 'freight_requested' : 'quote_sent'
    const now = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

    setQuotes(prev => [{
      id: newId, quoteNumber: newId, revision: 1, previousQuoteNumber: null,
      quoteType: form.quoteType,
      customer: form.customer, email: form.email, phone: form.phone,
      account: form.account, billingAddress: form.billingAddress,
      fulfillment: form.fulfillment, deliveryAddress: form.deliveryAddress,
      dateReceived: now, sentAt: status === 'quote_sent' ? now : null,
      status,
      notes: form.notes,
      items: form.items,
      shippingCost: shipping,
      subtotal, gst, total: subtotal,
    }, ...prev])

    toast(`Quote ${newId} created${status === 'quote_sent' ? ' and emailed to customer' : ' — awaiting freight cost'}.`, 'success')
    navigate(`/quote-requests/${newId}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quote Requests"
        subtitle="Standard items, shower base inserts, and freight quotes — manage the full quote lifecycle."
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setNewQuoteOpen(true)}>
            New Quote
          </Button>
        }
      />

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex border-b border-border overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-brand-100 text-brand-600' : 'bg-grey-100 text-text-muted'}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by ref, customer, account..."
          className="h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-64" />
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Quote Ref', 'Customer', 'Type', 'Fulfillment', 'Account', 'Received', 'Total', 'Auto-close', 'Status', ''].map((h, i) => (
                <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={10} className="px-5 py-12 text-center text-text-muted">No quote requests found.</td></tr>
              : filtered.map(q => {
                const daysLeft = q.status === 'quote_sent' ? daysRemainingForAutoClose(q.sentAt) : null
                const nearExpiry = daysLeft !== null && daysLeft <= 7
                return (
                  <tr key={q.id} onClick={() => navigate(`/quote-requests/${q.id}`)}
                    className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-brand-500">{q.quoteNumber}</p>
                      {q.previousQuoteNumber && (
                        <p className="text-[10px] text-text-muted mt-0.5">Revised from {q.previousQuoteNumber}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-text-primary">{q.customer}</p>
                      <p className="text-xs text-text-muted">{q.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={QUOTE_TYPE_VARIANT[q.quoteType]} label={QUOTE_TYPE_LABEL[q.quoteType]} />
                    </td>
                    <td className="px-5 py-3.5">
                      {q.fulfillment === 'delivery'
                        ? <span className="flex items-center gap-1 text-xs text-text-secondary"><Truck className="w-3 h-3" />Delivery</span>
                        : <span className="flex items-center gap-1 text-xs text-text-secondary"><Package className="w-3 h-3" />Click & Collect</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{q.account}</td>
                    <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{q.dateReceived}</td>
                    <td className="px-5 py-3.5 font-medium text-text-primary">
                      {q.total ? `$${parseFloat(q.total).toFixed(2)}` : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {daysLeft !== null ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${nearExpiry ? 'text-error-600' : 'text-text-muted'}`}>
                          {nearExpiry && <AlertTriangle className="w-3 h-3" />}
                          {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d`}
                        </span>
                      ) : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={STATUS_VARIANT[q.status]} label={STATUS_LABEL[q.status]} dot />
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={e => { e.stopPropagation(); navigate(`/quote-requests/${q.id}`) }}
                        className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {quotes.length} active requests · Paid quotes move to Orders</p>
        </div>
      </div>

      <NewQuoteDrawer open={newQuoteOpen} onClose={() => setNewQuoteOpen(false)} onSave={handleCreateQuote} />
    </div>
  )
}
