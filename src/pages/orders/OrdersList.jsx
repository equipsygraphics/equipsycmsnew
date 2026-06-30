import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
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

const CSV_COLS = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'email', label: 'Email' },
  { key: 'date', label: 'Date' },
  { key: 'total', label: 'Total', csvValue: r => `$${r.total.toFixed(2)}` },
  { key: 'status', label: 'Status' },
  { key: 'payment', label: 'Payment' },
]

export function OrdersList() {
  const navigate = useNavigate()
  const [orders] = useState(mockOrders)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? orders.length : orders.filter(o => o.status === t.key).length
    return acc
  }, {})

  const filtered = orders.filter(o => {
    if (activeTab !== 'all' && o.status !== activeTab) return false
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.includes(search) && !o.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

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

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Order', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-12 text-center text-text-muted">No orders found.</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} onClick={() => navigate(`/orders/${o.id.replace('#','')}`)} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                <td className="px-5 py-3.5 font-medium text-brand-500">{o.id}</td>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-text-primary">{o.customer}</p>
                  <p className="text-xs text-text-muted">{o.email}</p>
                </td>
                <td className="px-5 py-3.5 text-text-muted">{o.date}</td>
                <td className="px-5 py-3.5 text-text-secondary">{o.items}</td>
                <td className="px-5 py-3.5 font-medium text-text-primary">${o.total.toFixed(2)}</td>
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
