import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package, Truck, Send, CheckCircle, ExternalLink } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field, Textarea } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockBuilderPacks } from '../../data/mockRequests'

const PACK_CONTENTS = [
  'Product Catalogue (PDF)',
  'Specification Sheets',
  'Installation Guidelines',
  'Compliance Certificates',
  'Pricing Guide (Trade)',
  'NDIS Provider Info',
]

const STATUS_VARIANT = { pending: 'warning', shipped: 'success' }
const STATUS_LABEL   = { pending: 'Pending', shipped: 'Shipped' }

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

export function BuilderPackDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const found = mockBuilderPacks.find(p => p.id === id) || mockBuilderPacks[0]
  const [pack, setPack] = useState(found)
  const [selectedContents, setSelectedContents] = useState(PACK_CONTENTS)
  const [coverMessage, setCoverMessage] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  const toggleContent = item =>
    setSelectedContents(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])

  const handleBookShippit = () => {
    setBookingLoading(true)
    setTimeout(() => {
      const bookedAt = new Date().toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      setPack(p => ({ ...p, status: 'shipped', shippitBookedAt: bookedAt }))
      setBookingLoading(false)
      toast(`Delivery booked via Shippit. Confirmation email sent to ${pack.email}.`, 'success')
    }, 1200)
  }

  const handleResend = () => {
    toast(`Shippit booking email resent to ${pack.email}`, 'success')
  }

  const isShipped = pack.status === 'shipped'

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/builder-pack')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Builder Pack Requests
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary">{pack.firstName} {pack.lastName}</h1>
            <Badge variant={STATUS_VARIANT[pack.status]} label={STATUS_LABEL[pack.status]} dot />
          </div>
          <p className="text-sm text-text-muted">{pack.id} · {pack.company} · Requested {pack.requested}</p>
        </div>
        {!isShipped && (
          <Button variant="primary" icon={<Truck className="w-4 h-4" />} onClick={handleBookShippit} loading={bookingLoading}>
            Book Delivery via Shippit
          </Button>
        )}
        {isShipped && (
          <Button variant="secondary" icon={<Send className="w-4 h-4" />} onClick={handleResend}>
            Resend Email
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Main */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Customer details */}
          <SectionCard title="Customer Details">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="First Name" value={pack.firstName} />
              <InfoRow label="Last Name" value={pack.lastName} />
              <InfoRow label="Email" value={pack.email} />
              <InfoRow label="Phone" value={pack.phone} />
              <InfoRow label="Occupation" value={pack.occupation} />
              <InfoRow label="Company" value={pack.company} />
            </div>
            <div className="border-t border-border pt-2">
              <InfoRow label="Delivery Address" value={pack.deliveryAddress} />
            </div>
          </SectionCard>

          {/* Pack contents */}
          <SectionCard title="Pack Contents">
            <p className="text-xs text-text-muted -mt-2">Select which documents to include in this pack.</p>
            <div className="flex flex-col gap-2">
              {PACK_CONTENTS.map(item => (
                <label key={item} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface hover:bg-grey-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedContents.includes(item)} onChange={() => toggleContent(item)} className="accent-brand-500 w-4 h-4" />
                  <Package className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-sm text-text-primary">{item}</span>
                </label>
              ))}
            </div>
          </SectionCard>

          {/* Cover message */}
          <SectionCard title="Cover Message">
            <Field label="">
              <Textarea
                value={coverMessage}
                onChange={e => setCoverMessage(e.target.value)}
                rows={4}
                placeholder={`Hi ${pack.firstName}, please find attached our builder pack for your ${pack.projectType} project…`}
              />
            </Field>
          </SectionCard>

          {/* Internal notes */}
          {pack.notes && (
            <SectionCard title="Internal Notes">
              <p className="text-sm text-text-secondary">{pack.notes}</p>
            </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Shippit */}
          <div className={`rounded-xl border p-5 flex flex-col gap-3 ${isShipped ? 'bg-success-500/10 border-success-500/20' : 'bg-surface border-border'}`}>
            <div className="flex items-center gap-2">
              <Truck className={`w-4 h-4 ${isShipped ? 'text-success-500' : 'text-text-muted'}`} />
              <h3 className="text-sm font-semibold text-text-primary">Shippit Delivery</h3>
            </div>
            {isShipped ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-success-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Delivery Booked</span>
                </div>
                <p className="text-xs text-text-muted">Booked {pack.shippitBookedAt}</p>
                <p className="text-xs text-text-muted">Confirmation email sent to <strong>{pack.email}</strong></p>
                <button onClick={() => toast('Opening Shippit dashboard…')} className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium mt-1">
                  View in Shippit <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-text-muted">
                  Booking delivery will dispatch this builder pack to <strong>{pack.deliveryAddress}</strong> and automatically send a shipping confirmation email to the customer.
                </p>
                <Button variant="primary" icon={<Truck className="w-4 h-4" />} onClick={handleBookShippit} loading={bookingLoading} className="w-full justify-center">
                  Book Delivery via Shippit
                </Button>
              </div>
            )}
          </div>

          {/* Request info */}
          <SectionCard title="Request Info">
            <InfoRow label="Request ID" value={pack.id} />
            <InfoRow label="Date Requested" value={pack.requested} />
            <InfoRow label="Project Type" value={pack.projectType} />
            <InfoRow label="No. of Units" value={pack.units?.toString()} />
            <InfoRow label="State" value={pack.state} />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Status</p>
              <Badge variant={STATUS_VARIANT[pack.status]} label={STATUS_LABEL[pack.status]} dot />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
