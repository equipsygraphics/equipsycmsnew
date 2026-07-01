import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, FileText, Truck, RotateCcw, ExternalLink } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
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

function RefundModal({ open, onClose, order, onConfirm }) {
  const isPayPal = order.paymentMethod === 'paypal'
  const [amount, setAmount] = useState(order.total.toFixed(2))

  const handleConfirm = () => {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      toast('Enter a valid refund amount', 'error')
      return
    }
    if (parsed > order.total) {
      toast('Refund amount cannot exceed order total', 'error')
      return
    }
    onConfirm(parsed)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Process Refund">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-secondary">
            {isPayPal
              ? 'This order was paid via PayPal. Enter the refund amount to process manually.'
              : 'This order was paid via Stripe. The refund will be processed through Stripe.'}
          </p>
          {isPayPal && (
            <p className="text-xs text-text-muted mt-1">
              Confirm the amount in your PayPal merchant account after processing.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">Refund amount (AUD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={order.total}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border pl-7 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <p className="text-xs text-text-muted">Order total: ${order.total.toFixed(2)}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            {isPayPal ? 'Confirm Refund' : 'Process via Stripe'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = mockOrders.find(o => o.id === `#${id}`) || mockOrders[0]

  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.notes)
  const [refundOpen, setRefundOpen] = useState(false)

  const isClickCollect = order.fulfillment === 'click_collect'
  const shipping = order.total >= 1000 ? 0 : !isClickCollect ? 15 : 0
  const subtotal = order.total - order.gst

  const handleRefundConfirm = (amount) => {
    setStatus('refunded')
    const via = order.paymentMethod === 'paypal' ? 'manually (PayPal)' : 'via Stripe'
    toast(`Refund of $${amount.toFixed(2)} processed ${via}`, 'success')
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
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => toast('Opening WMS to print packing slip…', 'info')}
          >
            Print Slip
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => toast('Opening WMS to generate invoice…', 'info')}
          >
            Invoice
          </Button>
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
            {order.billingAddress && (
              <div className="flex flex-col gap-1 pt-3 border-t border-border text-sm">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Billing Address</p>
                <p className="text-text-secondary">{order.billingAddress}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Delivery">
            <div className="flex flex-col gap-2 text-sm">
              <Badge variant={isClickCollect ? 'grey' : 'info'} label={isClickCollect ? 'Click & Collect' : 'Delivery'} />
              <p className="text-text-secondary">{order.address}</p>
            </div>
          </SectionCard>

          {!isClickCollect && (
            <SectionCard title="Shippit">
              <Button
                variant="primary"
                size="sm"
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => toast('Opening Shippit dashboard…', 'info')}
                className="w-full justify-center"
              >
                Open Shippit
              </Button>
            </SectionCard>
          )}

          <SectionCard title="Actions">
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={() => setRefundOpen(true)}
                className="w-full justify-center"
              >
                Refund / Return
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      <RefundModal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        order={order}
        onConfirm={handleRefundConfirm}
      />
    </div>
  )
}
