import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Textarea } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockCustomers } from '../../data/mockCustomers'
import { mockOrders } from '../../data/mockOrders'

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm text-text-primary">{value || '—'}</p>
    </div>
  )
}

export function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const found = mockCustomers.find(c => c.id === parseInt(id)) || mockCustomers[0]

  const [customer, setCustomer] = useState(found)
  const [editing, setEditing] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const orders = mockOrders.filter(o => o.email === customer.email)

  const openEdit = () => { setEditing({ ...customer }); setDrawerOpen(true) }
  const handleSave = () => {
    setCustomer(editing)
    setDrawerOpen(false)
    toast('Customer updated', 'success')
  }

  const initials = `${customer.firstName[0]}${customer.lastName[0]}`

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-text-primary">{customer.firstName} {customer.lastName}</h1>
              <Badge variant={customer.status === 'active' ? 'active' : 'grey'} label={customer.status === 'active' ? 'Active' : 'Inactive'} dot />
            </div>
            <p className="text-sm text-text-muted mt-0.5">{customer.email} · Joined {customer.joined}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={openEdit}>
          Edit Customer
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main column */}
        <div className="col-span-2 flex flex-col gap-4">
          <SectionCard title="Order History">
            {orders.length === 0 ? (
              <p className="text-sm text-text-muted">No orders found for this customer.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Order', 'Date', 'Items', 'Total', 'Status'].map(h => (
                      <th key={h} className="pb-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/orders/${o.id.replace('#', '')}`)}
                      className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 font-medium text-brand-500">{o.id}</td>
                      <td className="py-3 text-text-muted">{o.date}</td>
                      <td className="py-3 text-text-secondary">{o.items}</td>
                      <td className="py-3 font-medium text-text-primary">${o.total.toFixed(2)}</td>
                      <td className="py-3">
                        <Badge variant={o.status} label={o.status.charAt(0).toUpperCase() + o.status.slice(1)} dot />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex gap-8 pt-2 border-t border-border text-sm">
              <div><p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-0.5">Total Orders</p><p className="font-semibold text-text-primary">{customer.orders}</p></div>
              <div><p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-0.5">Total Spent</p><p className="font-semibold text-text-primary">${customer.spent.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p></div>
            </div>
          </SectionCard>

          <SectionCard title="Internal Notes">
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{customer.notes || 'No notes.'}</p>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Contact">
            <div className="flex flex-col gap-3">
              <InfoRow label="Email" value={customer.email} />
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Address" value={customer.address} />
            </div>
          </SectionCard>

          <SectionCard title="Account Details">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Account Type</p>
                <Badge variant={customer.accountType === 'trade' ? 'info' : 'grey'} label={customer.accountType === 'trade' ? 'Trade' : 'Standard'} />
              </div>
              <InfoRow label="Occupation / Role" value={customer.occupation} />
              <InfoRow label="Region" value={customer.region} />
              <InfoRow label="Joined" value={customer.joined} />
            </div>
          </SectionCard>

          {customer.accountType === 'trade' && (
            <SectionCard title="Trade Account">
              <div className="flex flex-col gap-3">
                <InfoRow label="ABN" value={customer.abn} />
                <InfoRow label="Business Address" value={customer.businessAddress} />
                <InfoRow label="Business Phone" value={customer.businessPhone} />
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Edit Customer"
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
              <Field label="Occupation / Role"><Input value={editing.occupation} onChange={e => setEditing(p => ({ ...p, occupation: e.target.value }))} /></Field>
              <Field label="Region"><Input value={editing.region} onChange={e => setEditing(p => ({ ...p, region: e.target.value }))} /></Field>
            </div>
            <Field label="Address"><Input value={editing.address} onChange={e => setEditing(p => ({ ...p, address: e.target.value }))} /></Field>
            <Field label="Internal Notes" hint="Only visible to admin staff">
              <Textarea value={editing.notes} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Add any internal notes here..." />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  )
}
