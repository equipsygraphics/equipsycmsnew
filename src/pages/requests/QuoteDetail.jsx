import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Download, FileText, CheckCircle, X, Send, Mail,
  Plus, Trash2, AlertTriangle, ShoppingCart, Lock, ExternalLink, Package, Truck, Weight, Sliders,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockQuoteRequests } from '../../data/mockRequests'
import { mockProducts } from '../../data/mockProducts'

// ── Constants ─────────────────────────────────────────────────────────────────

const QUOTE_TYPE_LABEL   = { standard: 'Standard Items', freight: 'Freight', shower_base: 'Shower Base Insert', ramp_calculator: 'Ramp Calculator' }
const QUOTE_TYPE_VARIANT = { standard: 'info', freight: 'warning', shower_base: 'grey', ramp_calculator: 'info' }

const STATUS_LABEL = {
  freight_requested: 'Freight Requested',
  quote_sent:        'Quote Sent',
  awaiting_payment:  'Awaiting Payment',
  paid:              'Paid',
  closed:            'Closed',
}
const STATUS_VARIANT = {
  freight_requested: 'warning',
  quote_sent:        'info',
  awaiting_payment:  'warning',
  paid:              'success',
  closed:            'grey',
}

function daysRemaining(sentAt) {
  if (!sentAt) return null
  return 30 - Math.floor((Date.now() - new Date(sentAt)) / 86400000)
}

function nextQuoteNumber(current) {
  const base = current.replace(/-R\d+$/, '')
  const match = current.match(/-R(\d+)$/)
  return `${base}-R${match ? parseInt(match[1]) + 1 : 1}`
}

function recalcTotals(items, shippingCost = 0) {
  const itemsTotal = items.reduce((s, i) => s + (parseFloat(i.unitPrice) || 0) * (parseInt(i.qty) || 0), 0)
  const subtotal = parseFloat((itemsTotal + shippingCost).toFixed(2))
  const gst      = parseFloat((subtotal / 11).toFixed(2))
  return { subtotal, gst, total: subtotal }
}

function isTradeAccount(account) {
  return account === 'Trade' || account === 'SDA Provider'
}

// Auto-calculates shipping for standard items based on delivery address + items weight/bulkiness.
// In production this would call a shipping API (e.g. Shippit).
function calculateShipping(items, deliveryAddress, products) {
  if (!deliveryAddress.trim()) return 0

  const addr = deliveryAddress.toUpperCase()
  // State-based base rate (AUD)
  let baseRate = 15
  if (/\bWA\b|\bNT\b/.test(addr))       baseRate = 45
  else if (/\bQLD\b/.test(addr))         baseRate = 28
  else if (/\bSA\b/.test(addr))          baseRate = 25
  else if (/\bTAS\b/.test(addr))         baseRate = 30
  else if (/\bNSW\b|\bACT\b/.test(addr)) baseRate = 20

  let totalWeight = 0
  let hasBulky = false
  for (const item of items) {
    const product = products.find(p => p.sku === item.sku)
    totalWeight += (product?.weight ?? 1) * (parseInt(item.qty) || 1)
    if (product?.bulky) hasBulky = true
  }

  const weightCharge = Math.ceil(totalWeight) * 1.20
  const bulkyCharge  = hasBulky ? 25 : 0

  return parseFloat((baseRate + weightCharge + bulkyCharge).toFixed(2))
}

// ── Packaging details (freight quotes only) ───────────────────────────────────

function PackagingDetails({ items }) {
  const rows = items.map(item => {
    const product = mockProducts.find(p => p.sku === item.sku)
    const unitWeight = product?.weight ?? null
    const dims       = product?.packDimensions ?? null
    return { item, product, unitWeight, dims, totalWeight: unitWeight != null ? unitWeight * item.qty : null }
  })

  const grandTotal = rows.reduce((s, r) => s + (r.totalWeight ?? 0), 0)

  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Packaging &amp; Weight</h3>
        <p className="text-xs text-text-muted mt-0.5">Used to calculate freight cost. Data sourced from product catalogue.</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {['Product', 'SKU', 'Packed Dimensions (L×W×H cm)', 'Weight / unit', 'Qty', 'Total weight'].map(h => (
              <th key={h} className="pb-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ item, product, unitWeight, dims, totalWeight }, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-3 font-medium text-text-primary">{item.name || '—'}</td>
              <td className="py-3 text-text-muted font-mono text-xs">{item.sku}</td>
              <td className="py-3 text-text-secondary">
                {dims ? `${dims.l} × ${dims.w} × ${dims.h}` : <span className="text-text-muted italic text-xs">N/A</span>}
              </td>
              <td className="py-3 text-text-secondary">
                {unitWeight != null ? `${unitWeight} kg` : <span className="text-text-muted italic text-xs">N/A</span>}
              </td>
              <td className="py-3 text-text-secondary">{item.qty}</td>
              <td className="py-3 font-medium text-text-primary">
                {totalWeight != null ? `${totalWeight.toFixed(1)} kg` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border">
            <td colSpan={5} className="pt-3 text-sm font-semibold text-text-primary">Total shipment weight</td>
            <td className="pt-3 text-sm font-bold text-text-primary">{grandTotal.toFixed(1)} kg</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Product search input ──────────────────────────────────────────────────────

function ProductSearchInput({ value, searchField, onChange, onSelect, account, placeholder, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // In-stock published products only
  const inStock = mockProducts.filter(p => p.status === 'published' && p.stock > 0)
  const q = value.trim().toLowerCase()
  const matches = q.length < 1 ? [] : inStock.filter(p =>
    searchField === 'sku'
      ? p.sku.toLowerCase().includes(q)
      : p.name.toLowerCase().includes(q)
  ).slice(0, 7)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = product => {
    const price = isTradeAccount(account) ? product.tradePrice : product.price
    onSelect({ name: product.name, sku: product.sku, unitPrice: price })
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-full ${className ?? ''}`}
      />
      {open && matches.length > 0 && (
        <div className="absolute z-40 top-full left-0 min-w-64 bg-white border border-border rounded-xl shadow-lg overflow-hidden mt-0.5">
          {matches.map(p => {
            const price = isTradeAccount(account) ? p.tradePrice : p.price
            return (
              <button key={p.id} type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(p) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-grey-50 text-left border-b border-border last:border-0 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-xs text-text-muted font-mono">{p.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-text-primary">${price.toFixed(2)}</p>
                  <p className="text-[10px] text-text-muted">{p.stock} in stock</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Editable items table ──────────────────────────────────────────────────────

// shippingCost     = manual value (freight type only)
// computedShipping = auto-calculated value (standard type)
// quoteType        = determines which one to show
function EditableItems({ items, shippingCost, computedShipping, quoteType, account, onChange, onShippingChange, fulfillment }) {
  const addItem = () => onChange([...items, { id: Date.now(), name: '', sku: '', qty: 1, unitPrice: 0 }])
  const removeItem = id => onChange(items.filter(i => i.id !== id))
  const updateItem = (id, field, value) =>
    onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  const fillFromProduct = (id, data) =>
    onChange(items.map(i => i.id === id ? { ...i, ...data } : i))

  return (
    <div className="flex flex-col gap-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {['Product', 'SKU', 'Qty', 'Unit Price', 'Line Total', ''].map(h => (
              <th key={h} className="pb-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wide last:w-8">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-b border-border last:border-0">
              <td className="py-2 pr-2 min-w-48">
                <ProductSearchInput
                  value={item.name}
                  searchField="name"
                  account={account}
                  placeholder="Search products…"
                  onChange={v => updateItem(item.id, 'name', v)}
                  onSelect={data => fillFromProduct(item.id, data)}
                />
              </td>
              <td className="py-2 pr-2 w-32">
                <ProductSearchInput
                  value={item.sku}
                  searchField="sku"
                  account={account}
                  placeholder="SKU…"
                  className="font-mono text-xs"
                  onChange={v => updateItem(item.id, 'sku', v)}
                  onSelect={data => fillFromProduct(item.id, data)}
                />
              </td>
              <td className="py-2 pr-2 w-16">
                <input type="number" min="1" value={item.qty}
                  onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                  className="h-10 w-full px-2 rounded-lg border border-border text-sm text-center outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </td>
              <td className="py-2 pr-2 w-32">
                <div className="flex items-center">
                  <span className="h-10 px-2.5 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                  <input type="number" min="0" step="0.01" value={item.unitPrice}
                    onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="h-10 w-full border border-border rounded-r-lg px-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
              </td>
              <td className="py-2 pr-2 font-medium text-text-primary whitespace-nowrap w-24">
                ${((parseFloat(item.unitPrice) || 0) * (parseInt(item.qty) || 0)).toFixed(2)}
              </td>
              <td className="py-2 w-8">
                <button onClick={() => removeItem(item.id)}
                  className="p-1 text-text-muted hover:text-error-500 hover:bg-error-50 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
        <Plus className="w-4 h-4" /> Add item
      </button>

      {/* Shipping row — freight: manual input; standard/shower_base: auto-calculated read-only */}
      {fulfillment === 'delivery' && (
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <Truck className="w-4 h-4 text-text-muted shrink-0" />
          {quoteType === 'freight' ? (
            <>
              <p className="text-sm text-text-secondary font-medium">Freight cost</p>
              <div className="flex items-center">
                <span className="h-9 px-2.5 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                <input type="number" min="0" step="0.01" value={shippingCost}
                  onChange={e => onShippingChange(parseFloat(e.target.value) || 0)}
                  className="h-9 w-24 border border-border rounded-r-lg px-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-text-secondary font-medium">Shipping fee</p>
              <p className="text-sm font-semibold text-text-primary">${computedShipping?.toFixed(2) ?? '0.00'}</p>
              <p className="text-xs text-text-muted">(auto-calculated from delivery address &amp; product weights)</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Read-only items table ─────────────────────────────────────────────────────

function ReadOnlyItems({ items, shippingCost, quoteType, fulfillment }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          {['Product', 'SKU', 'Qty', 'Unit Price', 'Line Total'].map(h => (
            <th key={h} className="pb-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b border-border last:border-0">
            <td className="py-3 font-medium text-text-primary">{item.name || '—'}</td>
            <td className="py-3 text-text-muted font-mono text-xs">{item.sku}</td>
            <td className="py-3 text-text-secondary">{item.qty}</td>
            <td className="py-3 text-text-primary">{item.unitPrice ? `$${parseFloat(item.unitPrice).toFixed(2)}` : <span className="text-text-muted italic text-xs">TBC</span>}</td>
            <td className="py-3 font-medium text-text-primary">{item.unitPrice ? `$${(parseFloat(item.unitPrice) * item.qty).toFixed(2)}` : '—'}</td>
          </tr>
        ))}
        {fulfillment === 'delivery' && shippingCost > 0 && (
          <tr className="border-t border-border">
            <td colSpan={4} className="py-3 text-text-secondary flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />{quoteType === 'freight' ? 'Freight' : 'Shipping'}
            </td>
            <td className="py-3 font-medium text-text-primary">${parseFloat(shippingCost).toFixed(2)}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

// ── Shower base dimensions ────────────────────────────────────────────────────

function ShowerBaseDimensions({ dimensions }) {
  const d = dimensions ?? {}
  return (
    <div className="grid grid-cols-2 gap-4">
      {[['Length (mm)', d.length], ['Width (mm)', d.width], ['Depth (mm)', d.depth], ['Finish', d.finish]].map(([l, v]) => (
        <div key={l} className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{l}</p>
          <p className="text-sm text-text-primary">{v || '—'}</p>
        </div>
      ))}
      {d.notes && (
        <div className="col-span-2 flex flex-col gap-0.5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Notes</p>
          <p className="text-sm text-text-primary">{d.notes}</p>
        </div>
      )}
      <p className="col-span-2 text-xs text-text-muted italic bg-grey-50 px-3 py-2 rounded-lg">
        Placeholder fields — final dimension spec to be confirmed.
      </p>
    </div>
  )
}

// ── Ramp specifications ───────────────────────────────────────────────────────

function RampSpecifications({ rampSpec, calculatorType }) {
  const s = rampSpec ?? {}
  const calcLabel = calculatorType === 'depth' ? 'Ramp Depth Calculator' : calculatorType === 'gradient' ? 'Ramp Gradient Calculator' : calculatorType
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {[['Rise (mm)', s.rise], ['Width (mm)', s.width], ['Ramp Run (mm)', s.depth], ['Gradient', s.gradient]].map(([l, v]) => (
          <div key={l} className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{l}</p>
            <p className="text-sm text-text-primary">{v ?? '—'}</p>
          </div>
        ))}
        {calcLabel && (
          <div className="col-span-2 flex flex-col gap-0.5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Calculator used</p>
            <p className="text-sm text-text-primary">{calcLabel}</p>
          </div>
        )}
      </div>
      <div className="flex items-start gap-2 bg-warning-50 px-3 py-2.5 rounded-lg">
        <Lock className="w-3.5 h-3.5 text-warning-500 shrink-0 mt-0.5" />
        <p className="text-xs text-warning-700">
          Ramp Calculator quotes are auto-generated from customer-submitted measurements. To change specifications, the customer must use the Ramp Calculator and submit a new request.
        </p>
      </div>
    </div>
  )
}

// ── Totals block ──────────────────────────────────────────────────────────────

function TotalsBlock({ items, shippingCost, overrideTotal }) {
  const { subtotal, gst, total } = overrideTotal ?? recalcTotals(items, shippingCost)
  if (!total && total !== 0) return null
  const exGst = parseFloat((total - gst).toFixed(2))
  const shipping = parseFloat(shippingCost || 0)
  const itemsOnly = parseFloat((total - shipping - gst).toFixed(2))
  return (
    <div className="border-t border-border pt-3 flex flex-col gap-1.5 items-end text-sm">
      {shipping > 0 && <div className="flex gap-8 text-text-secondary"><span>Items subtotal</span><span>${itemsOnly.toFixed(2)}</span></div>}
      {shipping > 0 && <div className="flex gap-8 text-text-secondary"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>}
      <div className="flex gap-8 text-text-secondary"><span>Subtotal (ex GST)</span><span>${exGst.toFixed(2)}</span></div>
      <div className="flex gap-8 text-text-secondary"><span>GST (10%)</span><span>${gst.toFixed(2)}</span></div>
      <div className="flex gap-8 font-semibold text-text-primary text-base border-t border-border pt-2 mt-1">
        <span>Total</span><span>${total.toFixed(2)}</span>
      </div>
    </div>
  )
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function QuoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const found = mockQuoteRequests.find(q => q.id === id) ?? mockQuoteRequests[0]

  const [quote, setQuote] = useState(found)
  const [editMode, setEditMode] = useState(false)
  const [editItems, setEditItems] = useState(found.items ?? [])
  const [editShipping, setEditShipping] = useState(found.shippingCost ?? 0)
  const [editFulfillment, setEditFulfillment] = useState(found.fulfillment ?? 'delivery')
  const [editDeliveryAddr, setEditDeliveryAddr] = useState(found.deliveryAddress ?? '')

  const [freightFee, setFreightFee] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [showPaymentEntry, setShowPaymentEntry] = useState(false)

  const isReadOnly   = quote.status === 'closed' || quote.status === 'paid'
  const isFreightReq = quote.status === 'freight_requested'
  const isQuoteSent  = quote.status === 'quote_sent'
  const isAwaiting   = quote.status === 'awaiting_payment'
  const canEdit      = isQuoteSent && (quote.quoteType === 'standard' || quote.quoteType === 'freight')
  const daysLeft     = isQuoteSent ? daysRemaining(quote.sentAt) : null
  const nearExpiry   = daysLeft !== null && daysLeft <= 7

  // Auto-calculated shipping for standard items (recalculates when items or address changes)
  const autoShipping = useMemo(() => {
    if (quote.quoteType !== 'standard' || editFulfillment !== 'delivery') return 0
    return calculateShipping(editItems, editDeliveryAddr, mockProducts)
  }, [quote.quoteType, editItems, editDeliveryAddr, editFulfillment])

  // Effective shipping used in totals and save
  const effectiveShipping = editMode
    ? (quote.quoteType === 'freight' ? editShipping : (editFulfillment === 'delivery' ? autoShipping : 0))
    : (quote.fulfillment === 'delivery' ? (quote.shippingCost ?? 0) : 0)

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleGenerateFreightQuote = () => {
    const fee = parseFloat(freightFee)
    if (isNaN(fee) || fee < 0) { toast('Enter a valid freight/shipping cost', 'error'); return }
    const { subtotal, gst, total } = recalcTotals(quote.items, fee)
    const now = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    setQuote(q => ({ ...q, status: 'quote_sent', shippingCost: fee, subtotal, gst, total, sentAt: now }))
    setFreightFee('')
    toast('Quote generated and emailed to customer.', 'success')
  }

  const handleApprove = () => {
    setQuote(q => ({ ...q, status: 'awaiting_payment' }))
    toast('Quote approved — invoice emailed to customer. Status: Awaiting Payment.', 'success')
  }

  const handleClose = () => {
    setQuote(q => ({ ...q, status: 'closed' }))
    toast('Quote closed and archived.', 'info')
  }

  const handleSaveEdit = () => {
    if (editItems.length === 0) { toast('Add at least one item', 'error'); return }
    const shipping = editFulfillment === 'delivery'
      ? (quote.quoteType === 'freight' ? editShipping : autoShipping)
      : 0
    const { subtotal, gst, total } = recalcTotals(editItems, shipping)
    const newQuoteNumber = nextQuoteNumber(quote.quoteNumber)
    const now = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    setQuote(q => ({
      ...q,
      items: editItems,
      shippingCost: shipping,
      fulfillment: editFulfillment,
      deliveryAddress: editDeliveryAddr,
      subtotal, gst, total,
      previousQuoteNumber: q.quoteNumber,
      quoteNumber: newQuoteNumber,
      revision: (q.revision ?? 1) + 1,
      sentAt: now,
    }))
    setEditMode(false)
    toast(`Quote revised → ${newQuoteNumber}. Email sent to customer.`, 'success')
  }

  const handleCancelEdit = () => {
    setEditItems(quote.items ?? [])
    setEditShipping(quote.shippingCost ?? 0)
    setEditFulfillment(quote.fulfillment ?? 'delivery')
    setEditDeliveryAddr(quote.deliveryAddress ?? '')
    setEditMode(false)
  }

  const handleConfirmPayment = () => {
    if (!paymentRef.trim()) { toast('Enter a payment reference', 'error'); return }
    setQuote(q => ({ ...q, status: 'paid' }))
    setShowPaymentEntry(false)
    toast('Payment confirmed — quote converted to active order.', 'success')
    setTimeout(() => navigate('/orders'), 1200)
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/quote-requests')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Quote Requests
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-text-primary">{quote.quoteNumber}</h1>
            <Badge variant={STATUS_VARIANT[quote.status]} label={STATUS_LABEL[quote.status]} dot />
            <Badge variant={QUOTE_TYPE_VARIANT[quote.quoteType]} label={QUOTE_TYPE_LABEL[quote.quoteType]} />
            {isReadOnly && <Badge variant="grey" label="Read-only" />}
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            {quote.customer} · Received {quote.dateReceived}
            {quote.previousQuoteNumber && (
              <span className="ml-2 text-xs bg-grey-100 text-text-muted px-2 py-0.5 rounded-full">
                Revised from {quote.previousQuoteNumber}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {quote.status !== 'freight_requested' && !isReadOnly && (
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}
              onClick={() => toast('Downloading quote PDF…', 'info')}>
              Download PDF
            </Button>
          )}
          {(isAwaiting || quote.status === 'paid') && (
            <Button variant="secondary" size="sm" icon={<FileText className="w-4 h-4" />}
              onClick={() => toast('Downloading invoice PDF…', 'info')}>
              Download Invoice
            </Button>
          )}
          {isQuoteSent && (
            <Button variant="secondary" size="sm" icon={<Mail className="w-4 h-4" />}
              onClick={() => toast(`Quote email re-sent to ${quote.email}.`, 'success')}>
              Re-send Email
            </Button>
          )}
          {canEdit && !editMode && (
            <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>Edit Quote</Button>
          )}
          {(isQuoteSent || isFreightReq) && (
            <Button variant="secondary" size="sm" icon={<X className="w-4 h-4" />} onClick={handleClose}>Close</Button>
          )}
          {isQuoteSent && !editMode && (
            <Button variant="primary" size="sm" icon={<CheckCircle className="w-4 h-4" />} onClick={handleApprove}>Approve</Button>
          )}
          {isAwaiting && (
            <Button variant="primary" size="sm" icon={<ShoppingCart className="w-4 h-4" />}
              onClick={() => setShowPaymentEntry(v => !v)}>
              Mark Payment Received
            </Button>
          )}
          {quote.status === 'paid' && (
            <Button variant="secondary" size="sm" icon={<ExternalLink className="w-4 h-4" />}
              onClick={() => navigate('/orders')}>
              View in Orders
            </Button>
          )}
          {quote.status === 'closed' && quote.total && (
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}
              onClick={() => toast('Downloading quote PDF…', 'info')}>
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Context banners */}
      {nearExpiry && (
        <div className="flex items-center gap-3 bg-error-50 border border-error-200 rounded-xl px-5 py-3.5">
          <AlertTriangle className="w-4 h-4 text-error-500 shrink-0" />
          <p className="text-sm text-error-700">
            {daysLeft <= 0
              ? 'This quote has exceeded the 30-day response window and will be auto-closed.'
              : `Auto-close in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — no customer response received.`}
          </p>
        </div>
      )}

      {quote.status === 'closed' && (
        <div className="flex items-center gap-3 bg-grey-100 border border-grey-200 rounded-xl px-5 py-3.5">
          <Lock className="w-4 h-4 text-text-muted shrink-0" />
          <p className="text-sm text-text-muted">This quote is closed and archived. No further actions can be taken.</p>
        </div>
      )}

      {isFreightReq && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl px-5 py-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-warning-700">Freight cost required before quote can be sent</p>
            <p className="text-xs text-warning-600 mt-0.5">Calculate the delivery fee and enter it below. The quote PDF will be generated and emailed to the customer.</p>
          </div>
          <div className="flex items-end gap-3">
            <Field label="Freight / shipping cost (AUD)">
              <div className="flex items-center">
                <span className="h-10 px-3 bg-white border border-r-0 border-warning-200 rounded-l-lg text-sm text-warning-600 flex items-center">$</span>
                <input type="number" min="0" step="0.01" value={freightFee}
                  onChange={e => setFreightFee(e.target.value)} placeholder="0.00"
                  className="h-10 w-32 border border-warning-200 rounded-r-lg px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
            </Field>
            <Button variant="primary" size="sm" icon={<Send className="w-4 h-4" />} onClick={handleGenerateFreightQuote}>
              Generate &amp; Send Quote
            </Button>
          </div>
        </div>
      )}

      {editMode && (
        <div className="flex items-center justify-between gap-4 bg-brand-50 border border-brand-200 rounded-xl px-5 py-3.5">
          <div>
            <p className="text-sm font-semibold text-brand-700">Editing quote</p>
            <p className="text-xs text-brand-600 mt-0.5">Saving will generate a new quote number and re-send the quote email to the customer.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCancelEdit}>Cancel</Button>
            <Button variant="primary" size="sm" icon={<Send className="w-4 h-4" />} onClick={handleSaveEdit}>
              Save &amp; Re-send Quote
            </Button>
          </div>
        </div>
      )}

      {showPaymentEntry && (
        <div className="bg-success-50 border border-success-200 rounded-xl px-5 py-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-success-700">Confirm payment received</p>
          <div className="flex items-end gap-3 flex-wrap">
            <Field label="Payment reference (Stripe / PayPal ID or manual ref)">
              <Input value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                placeholder="e.g. pi_3PxFYE… or MANUAL-REF-001" className="w-80" />
            </Field>
            <Button variant="primary" size="sm" onClick={handleConfirmPayment}>Confirm &amp; Convert to Order</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowPaymentEntry(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">

          {/* Items / Dimensions */}
          <SectionCard title={
            quote.quoteType === 'shower_base'     ? 'Shower Base Specifications' :
            quote.quoteType === 'ramp_calculator' ? 'Ramp Specifications' :
            'Quoted Items'
          }>
            {quote.quoteType === 'shower_base'
              ? <ShowerBaseDimensions dimensions={quote.dimensions} />
              : quote.quoteType === 'ramp_calculator'
                ? <>
                    <RampSpecifications rampSpec={quote.rampSpec} calculatorType={quote.calculatorType} />
                    <div className="border-t border-border pt-4 mt-2">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Auto-generated Items</p>
                      <ReadOnlyItems items={quote.items} shippingCost={quote.shippingCost} quoteType={quote.quoteType} fulfillment={quote.fulfillment} />
                    </div>
                  </>
                : editMode
                  ? <EditableItems
                      items={editItems}
                      shippingCost={editShipping}
                      computedShipping={autoShipping}
                      quoteType={quote.quoteType}
                      account={quote.account}
                      fulfillment={editFulfillment}
                      onChange={setEditItems}
                      onShippingChange={setEditShipping}
                    />
                  : <ReadOnlyItems
                      items={quote.items}
                      shippingCost={quote.shippingCost}
                      quoteType={quote.quoteType}
                      fulfillment={quote.fulfillment}
                    />
            }

            {!isFreightReq && (
              <TotalsBlock
                items={editMode ? editItems : quote.items}
                shippingCost={effectiveShipping}
                overrideTotal={(!editMode && quote.total) ? { subtotal: quote.subtotal, gst: quote.gst, total: quote.total } : null}
              />
            )}
          </SectionCard>

          {/* Packaging details — freight quotes only */}
          {quote.quoteType === 'freight' && quote.items.length > 0 && (
            <PackagingDetails items={editMode ? editItems : quote.items} />
          )}

          {/* Fulfillment + delivery address in edit mode */}
          {editMode && (
            <SectionCard title="Fulfillment">
              <div className="flex gap-3">
                {[['delivery', 'Delivery', Truck], ['click_collect', 'Click & Collect', Package]].map(([val, label, Icon]) => (
                  <button key={val} onClick={() => setEditFulfillment(val)}
                    className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-colors ${editFulfillment === val ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-grey-300'}`}>
                    <Icon className={`w-4 h-4 ${editFulfillment === val ? 'text-brand-500' : 'text-text-muted'}`} />
                    <span className={`text-sm font-semibold ${editFulfillment === val ? 'text-brand-600' : 'text-text-primary'}`}>{label}</span>
                  </button>
                ))}
              </div>
              {editFulfillment === 'delivery' && (
                <Field label="Delivery Address">
                  <Textarea value={editDeliveryAddr} onChange={e => setEditDeliveryAddr(e.target.value)}
                    rows={2} placeholder="Street, Suburb, State, Postcode" />
                </Field>
              )}
            </SectionCard>
          )}

          {quote.notes && (
            <SectionCard title="Customer Notes">
              <p className="text-sm text-text-secondary italic">"{quote.notes}"</p>
            </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Quote Status">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Status</p>
                <Badge variant={STATUS_VARIANT[quote.status]} label={STATUS_LABEL[quote.status]} dot />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Quote Type</p>
                <Badge variant={QUOTE_TYPE_VARIANT[quote.quoteType]} label={QUOTE_TYPE_LABEL[quote.quoteType]} />
              </div>
              {isQuoteSent && daysLeft !== null && (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${nearExpiry ? 'bg-error-50 text-error-600' : 'bg-grey-50 text-text-muted'}`}>
                  {nearExpiry && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  Auto-closes in {Math.max(0, daysLeft)} day{daysLeft !== 1 ? 's' : ''} if no action
                </div>
              )}
              {quote.quoteType === 'shower_base' && isQuoteSent && (
                <p className="text-xs text-warning-600 bg-warning-50 px-3 py-2 rounded-lg">
                  Shower base quotes cannot be edited — customer must submit a new request for changes.
                </p>
              )}
              {quote.quoteType === 'ramp_calculator' && (
                <div className="flex items-start gap-1.5 bg-warning-50 px-3 py-2 rounded-lg">
                  <Sliders className="w-3.5 h-3.5 text-warning-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-warning-700">
                    Auto-generated quote — cannot be edited. Customer must resubmit via the Ramp Calculator.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Fulfillment">
            <div className="flex flex-col gap-2">
              <Badge
                variant={quote.fulfillment === 'delivery' ? 'info' : 'grey'}
                label={quote.fulfillment === 'delivery' ? 'Delivery' : 'Click & Collect'}
              />
              {quote.fulfillment === 'delivery' && quote.deliveryAddress && (
                <div className="pt-1">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Delivery Address</p>
                  <p className="text-sm text-text-secondary">{quote.deliveryAddress}</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Customer">
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-text-primary">{quote.customer}</p>
              <p className="text-text-muted">{quote.email}</p>
              <p className="text-text-muted">{quote.phone}</p>
              <p className="text-xs text-text-muted mt-1">Account: <span className="font-medium text-text-secondary">{quote.account}</span></p>
            </div>
            {quote.billingAddress && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Billing Address</p>
                <p className="text-sm text-text-secondary">{quote.billingAddress}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Quote Summary">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Quote number</span><span className="font-mono text-xs">{quote.quoteNumber}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Revision</span><span>v{quote.revision ?? 1}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Received</span><span>{quote.dateReceived}</span>
              </div>
              {quote.sentAt && (
                <div className="flex justify-between text-text-secondary">
                  <span>Quote sent</span><span>{quote.sentAt}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-text-primary border-t border-border pt-2 mt-1">
                <span>Total</span>
                <span>{quote.total ? `$${parseFloat(quote.total).toFixed(2)}` : 'TBC'}</span>
              </div>
            </div>
          </SectionCard>

          {quote.previousQuoteNumber && (
            <SectionCard title="Revision History">
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted font-mono text-xs">{quote.quoteNumber}</span>
                  <span className="text-xs bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full font-medium">Current</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span className="font-mono text-xs">{quote.previousQuoteNumber}</span>
                  <span className="text-xs">Superseded</span>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
