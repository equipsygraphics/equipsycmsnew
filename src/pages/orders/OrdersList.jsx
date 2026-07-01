import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, ChevronUp, ChevronDown, ChevronsUpDown, X } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CSVExport } from '../../components/ui/CSVExport'
import { PageHeader } from '../../components/ui/PageHeader'
import { mockOrders } from '../../data/mockOrders'
import { toast } from '../../components/ui/Toast'

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const ORIGIN_LABEL    = { website: 'Website', phone: 'Phone', email: 'Email', trade_portal: 'Trade Portal', in_store: 'In Store' }
const ORIGIN_VARIANT  = { website: 'info', phone: 'grey', email: 'grey', trade_portal: 'warning', in_store: 'grey' }
const ACCOUNT_LABEL   = { retail: 'Retail', trade: 'Trade', sda: 'SDA', ndis: 'NDIS', b2b: 'B2B' }
const ACCOUNT_VARIANT = { retail: 'grey', trade: 'info', sda: 'warning', ndis: 'success', b2b: 'info' }
const ORDER_TYPE_LABEL   = { standard: 'Standard', custom: 'Custom', combined: 'Combined' }
const ORDER_TYPE_VARIANT = { standard: 'grey', custom: 'info', combined: 'warning' }

const CSV_COLS = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'email', label: 'Email' },
  { key: 'date', label: 'Date' },
  { key: 'total', label: 'Total', csvValue: r => `$${r.total.toFixed(2)}` },
  { key: 'status', label: 'Status' },
  { key: 'payment', label: 'Payment' },
  { key: 'origin', label: 'Origin', csvValue: r => ORIGIN_LABEL[r.origin] ?? r.origin },
  { key: 'accountType', label: 'Account Type', csvValue: r => ACCOUNT_LABEL[r.accountType] ?? r.accountType },
  { key: 'orderType', label: 'Order Type', csvValue: r => ORDER_TYPE_LABEL[r.orderType] ?? r.orderType },
  { key: 'fulfillment', label: 'Fulfillment', csvValue: r => r.fulfillment === 'click_collect' ? 'Click & Collect' : 'Delivery' },
]

function parseDate(str) {
  return new Date(str)
}

function sortOrders(list, field, dir) {
  return [...list].sort((a, b) => {
    let av, bv
    if (field === 'date')  { av = parseDate(a.date);  bv = parseDate(b.date) }
    else if (field === 'total') { av = a.total; bv = b.total }
    else if (field === 'id')    { av = parseInt(a.id.replace('#', '')); bv = parseInt(b.id.replace('#', '')) }
    else return 0
    if (av < bv) return dir === 'asc' ? -1 : 1
    if (av > bv) return dir === 'asc' ? 1 : -1
    return 0
  })
}

function SortTh({ label, field, sortField, sortDir, onSort, className = '' }) {
  const active = sortField === field
  const Icon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <th
      onClick={() => onSort(field)}
      className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide cursor-pointer select-none hover:text-text-primary transition-colors ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        <Icon className={`w-3.5 h-3.5 ${active ? 'text-brand-500' : 'text-text-muted'}`} />
      </span>
    </th>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-8 pl-2.5 pr-7 rounded-lg border border-border bg-surface text-xs text-text-secondary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 appearance-none cursor-pointer"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
    >
      <option value="">{label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function OrdersList() {
  const navigate = useNavigate()
  const [orders] = useState(mockOrders)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [filters, setFilters] = useState({ origin: '', accountType: '', orderType: '', fulfillment: '' })

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const hasFilters = Object.values(filters).some(Boolean)

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? orders.length : orders.filter(o => o.status === t.key).length
    return acc
  }, {})

  const filtered = sortOrders(
    orders.filter(o => {
      if (activeTab !== 'all' && o.status !== activeTab) return false
      if (search) {
        const q = search.toLowerCase()
        if (!o.customer.toLowerCase().includes(q) && !o.id.includes(q) && !o.email.toLowerCase().includes(q)) return false
      }
      if (filters.origin      && o.origin      !== filters.origin)      return false
      if (filters.accountType && o.accountType !== filters.accountType) return false
      if (filters.orderType   && o.orderType   !== filters.orderType)   return false
      if (filters.fulfillment && o.fulfillment !== filters.fulfillment) return false
      return true
    }),
    sortField, sortDir
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
        actions={
          <>
            <CSVExport data={filtered} columns={CSV_COLS} filename="orders" />
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast('Manual order creation coming soon', 'info')}>
              New Order
            </Button>
          </>
        }
      />

      {/* Tabs + search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex border-b border-border">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-brand-100 text-brand-600' : 'bg-grey-100 text-text-muted'}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search orders, customers..."
          className="h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-60"
        />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect
          label="All origins"
          value={filters.origin}
          onChange={v => setFilter('origin', v)}
          options={Object.entries(ORIGIN_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          label="All accounts"
          value={filters.accountType}
          onChange={v => setFilter('accountType', v)}
          options={Object.entries(ACCOUNT_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          label="All order types"
          value={filters.orderType}
          onChange={v => setFilter('orderType', v)}
          options={Object.entries(ORDER_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          label="All fulfillment"
          value={filters.fulfillment}
          onChange={v => setFilter('fulfillment', v)}
          options={[
            { value: 'delivery', label: 'Delivery' },
            { value: 'click_collect', label: 'Click & Collect' },
          ]}
        />
        {hasFilters && (
          <button
            onClick={() => setFilters({ origin: '', accountType: '', orderType: '', fulfillment: '' })}
            className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs text-text-muted hover:text-error-500 hover:bg-error-50 transition-colors border border-border"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              <SortTh label="Order" field="id" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Origin</th>
              <SortTh label="Date" field="date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Items</th>
              <SortTh label="Total" field="total" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Order Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Payment</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-5 py-12 text-center text-text-muted">No orders found.</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} onClick={() => navigate(`/orders/${o.id.replace('#','')}`)} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-brand-500">{o.id}</p>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-text-primary">{o.customer}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={ORIGIN_VARIANT[o.origin] ?? 'grey'} label={ORIGIN_LABEL[o.origin] ?? o.origin} />
                </td>
                <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{o.date}</td>
                <td className="px-5 py-3.5 text-text-secondary">{o.items}</td>
                <td className="px-5 py-3.5 font-medium text-text-primary">${o.total.toFixed(2)}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={ORDER_TYPE_VARIANT[o.orderType] ?? 'grey'} label={ORDER_TYPE_LABEL[o.orderType] ?? o.orderType} />
                </td>
                <td className="px-5 py-3.5"><Badge variant={o.payment} label={o.payment.charAt(0).toUpperCase() + o.payment.slice(1)} /></td>
                <td className="px-5 py-3.5"><Badge variant={o.status} label={o.status.charAt(0).toUpperCase() + o.status.slice(1)} dot /></td>
                <td className="px-5 py-3.5">
                  <button onClick={e => { e.stopPropagation(); navigate(`/orders/${o.id.replace('#','')}`); }} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {orders.length} orders</p>
        </div>
      </div>
    </div>
  )
}
