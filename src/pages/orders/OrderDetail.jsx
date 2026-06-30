import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Mail, FileText, Truck, RotateCcw } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockOrders, ORDER_ITEMS_MOCK } from '../../data/mockOrders'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

function SectionCard({ title, children, action }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = mockOrders.find(o => o.id === `#${id}`) || mockOrders[0]

  const [status, setStatus] = useState(order.status)
  const [shippitDeployed, setShippitDeployed] = useState(false)
  const [notes, setNotes] = useState(order.notes)

  const shipping = order.total >= 1000 ? 0 : order.items > 0 && mockOrders[0].fulfillment === 'delivery' ? 15 : 0
  const subtotal = order.total - order.gst
  const handleShippit = () => {
    setShippitDeployed(true)
    setStatus('shipped')
    toast('Shipment deployed via Shippit (mocked)', 'success')
  }

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-text-primary">Order {order.id}</h1>
            <Badge variant={status} label={status.charAt(0).toUpperCase() + status.slice(1)} dot />
          </div>
          <p className="text-sm text-text-muted mt-0.5">{order.customer} · {order.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={() => toast('Packing slip sent to printer (mocked)', 'info')}>Print Slip</Button>
          <Button variant="secondary" size="sm" icon={<FileText className="w-4 h-4" />} onClick={() => toast('Invoice PDF generated (mocked)', 'success')}>Invoice</Button>
          <Button variant="secondary" size="sm" icon={<Mail className="w-4 h-4" />} onClick={() => toast(`Email sent to ${order.email} (mocked)`, 'success')}>Email Customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main column */}
        <div className="col-span-2 flex flex-col gap-4">
          <SectionCard title="Order Items">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Product', 'SKU', 'Qty', 'Unit Price', 'Line Total'].map(h => (
                    <th key={h} className="pb-2.5 text-left text-xs font-semibold text-text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDER_ITEMS_MOCK.map((item, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-text-primary">{item.name}</td>
                    <td className="py-3 text-text-muted">{item.sku}</td>
                    <td className="py-3 text-text-secondary">{item.qty}</td>
                    <td className="py-3 text-text-primary">${item.price.toFixed(2)}</td>
                    <td className="py-3 font-medium text-text-primary">${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border pt-3 flex flex-col gap-1.5 items-end text-sm">
              <div className="flex gap-8 text-text-secondary"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex gap-8 text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex gap-8 text-text-secondary"><span>GST</span><span>${order.gst.toFixed(2)}</span></div>
              <div className="flex gap-8 font-semibold text-text-primary text-base border-t border-border pt-2 mt-1"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            </div>
          </SectionCard>

          <SectionCard title="Customer Notes">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="No customer notes"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
            />
            <Button variant="secondary" size="sm" onClick={() => toast('Note saved', 'success')} className="self-start">Save Note</Button>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Order Status">
            <Select value={status} onChange={e => { setStatus(e.target.value); toast(`Status updated to "${e.target.value}"`, 'success') }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </Select>
          </SectionCard>

          <SectionCard title="Customer">
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-text-primary">{order.customer}</p>
              <p className="text-text-muted">{order.email}</p>
              <p className="text-text-muted">{order.phone}</p>
            </div>
          </SectionCard>

          <SectionCard title="Delivery">
            <div className="flex flex-col gap-2 text-sm">
              <Badge variant={order.fulfillment === 'delivery' ? 'info' : 'grey'} label={order.fulfillment === 'delivery' ? 'Delivery' : 'Click & Collect'} />
              <p className="text-text-secondary">{order.address}</p>
            </div>
          </SectionCard>

          <SectionCard title="Shippit">
            {shippitDeployed ? (
              <div className="flex flex-col gap-1">
                <Badge variant="success" label="Shipment Deployed" dot />
                <p className="text-xs text-text-muted mt-1">Tracking number: SHP-{order.id.replace('#','')}-MOCK</p>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<Truck className="w-4 h-4" />}
                onClick={handleShippit}
                className="w-full justify-center"
              >
                Deploy Shipment
              </Button>
            )}
          </SectionCard>

          <SectionCard title="Actions">
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" icon={<RotateCcw className="w-4 h-4" />} onClick={() => { setStatus('refunded'); toast('Refund processed (mocked)', 'success') }} className="w-full justify-center">
                Refund / Return
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
