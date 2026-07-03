import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Truck, Package, ShoppingBag, User, MessageSquare, AlertTriangle } from 'lucide-react'
import { mockFeedback, FINDABILITY_OPTIONS, CLARITY_OPTIONS, CHECKOUT_OPTIONS } from '../../data/mockFeedback'

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-text-muted" />}
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
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

const POSITIVE_IDX = {
  'Very Easy': 0, 'Easy': 1, 'Neutral': 2, 'Difficult': 3, 'Very Difficult': 4,
  'Very Clear': 0, 'Clear': 1, 'Unclear': 3, 'Very Unclear': 4,
  'Very Good': 0, 'Good': 1, 'Poor': 3, 'Very Poor': 4,
}

function ScaleDisplay({ value, options }) {
  const selectedIdx = options.indexOf(value)
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt, i) => {
        const isSelected = opt === value
        const positiveZone = i <= 1
        const neutralZone = i === 2
        const negativeZone = i >= 3
        let selectedStyle = ''
        if (isSelected) {
          if (positiveZone) selectedStyle = 'bg-success-500 text-white border-success-500'
          else if (neutralZone) selectedStyle = 'bg-grey-400 text-white border-grey-400'
          else selectedStyle = 'bg-error-500 text-white border-error-500'
        }
        return (
          <span key={opt} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${isSelected ? selectedStyle : 'border-border text-text-muted bg-grey-50'}`}>
            {opt}
          </span>
        )
      })}
    </div>
  )
}

function YesNoPills({ value, alertIfYes }) {
  return (
    <div className="flex gap-1.5">
      {['No', 'Yes'].map(opt => {
        const isSelected = (opt === 'Yes') === value
        let selectedStyle = ''
        if (isSelected) {
          if (opt === 'No') selectedStyle = 'bg-success-500 text-white border-success-500'
          else if (alertIfYes) selectedStyle = 'bg-error-500 text-white border-error-500'
          else selectedStyle = 'bg-grey-400 text-white border-grey-400'
        }
        return (
          <span key={opt} className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${isSelected ? selectedStyle : 'border-border text-text-muted bg-grey-50'}`}>
            {opt}
          </span>
        )
      })}
    </div>
  )
}

function QuestionBlock({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</p>
      {children}
    </div>
  )
}

export function FeedbackDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const feedback = mockFeedback.find(f => f.id === id) || mockFeedback[0]
  const { customer, order, answers } = feedback

  const hasFlags = answers.technicalIssues || answers.contactedCS

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/feedback')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Feedback
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary">{feedback.id}</h1>
            {hasFlags && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-error-500/10 text-error-600 border border-error-500/20">
                <AlertTriangle className="w-3 h-3" /> Needs Attention
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted">
            Submitted {new Date(feedback.dateSubmitted).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Main */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* About the customer */}
          <SectionCard title="About the Customer" icon={User}>
            <QuestionBlock label="Occupation">
              <p className="text-sm text-text-primary">
                {answers.occupation}
                {answers.occupationOther && <span className="text-text-muted"> — {answers.occupationOther}</span>}
              </p>
            </QuestionBlock>
            <div className="border-t border-border" />
            <QuestionBlock label="How did you hear about us?">
              <p className="text-sm text-text-primary">
                {answers.heard}
                {answers.heardOther && <span className="text-text-muted"> — {answers.heardOther}</span>}
              </p>
            </QuestionBlock>
          </SectionCard>

          {/* Website experience */}
          <SectionCard title="Website Experience" icon={MessageSquare}>
            <QuestionBlock label="How easy was it to find the product you were looking for?">
              <ScaleDisplay value={answers.findability} options={FINDABILITY_OPTIONS} />
            </QuestionBlock>

            <div className="border-t border-border" />

            <QuestionBlock label="Did you encounter any technical issues while browsing our website?">
              <YesNoPills value={answers.technicalIssues} alertIfYes />
            </QuestionBlock>

            <div className="border-t border-border" />

            <QuestionBlock label="How clear were the shipping options and costs?">
              <ScaleDisplay value={answers.shippingClarity} options={CLARITY_OPTIONS} />
            </QuestionBlock>

            <div className="border-t border-border" />

            <QuestionBlock label="How would you rate your experience with the checkout process?">
              <ScaleDisplay value={answers.checkoutRating} options={CHECKOUT_OPTIONS} />
            </QuestionBlock>

            <div className="border-t border-border" />

            <QuestionBlock label="Did you need to contact customer service during your shopping experience?">
              <YesNoPills value={answers.contactedCS} alertIfYes={false} />
            </QuestionBlock>
          </SectionCard>

          {/* Improvements */}
          <SectionCard title="Improvement Suggestions" icon={MessageSquare}>
            <QuestionBlock label="What aspect of your shopping experience could we improve?">
              {answers.improvements
                ? <p className="text-sm text-text-primary leading-relaxed bg-grey-50 rounded-lg p-3 border border-border">{answers.improvements}</p>
                : <p className="text-sm text-text-muted italic">No suggestions provided.</p>
              }
            </QuestionBlock>
          </SectionCard>

          {/* Order details */}
          <SectionCard title="Order Details" icon={ShoppingBag}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-text-primary">{order.id}</p>
                <p className="text-xs text-text-muted">
                  {new Date(order.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                {order.fulfillment === 'delivery'
                  ? <><Truck className="w-4 h-4" /> Delivery</>
                  : <><Package className="w-4 h-4" /> Click & Collect</>
                }
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-grey-50 border-b border-border">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Product</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-text-muted uppercase tracking-wide">Qty</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-text-primary">{item.name}</td>
                      <td className="px-4 py-3 text-center text-text-muted">{item.qty}</td>
                      <td className="px-4 py-3 text-right text-text-primary">${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-grey-50 border-t border-border">
                    <td colSpan={2} className="px-4 py-2.5 text-right text-sm font-semibold text-text-primary">Total</td>
                    <td className="px-4 py-2.5 text-right text-sm font-bold text-text-primary">${order.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {order.deliveryAddress && (
              <InfoRow label="Delivery Address" value={order.deliveryAddress} />
            )}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Flags */}
          {hasFlags && (
            <div className="rounded-xl border border-error-500/20 bg-error-500/10 p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-error-600 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Flags
              </p>
              {answers.technicalIssues && (
                <p className="text-sm text-error-700">Reported technical issues on the website</p>
              )}
              {answers.contactedCS && (
                <p className="text-sm text-error-700">Had to contact customer service</p>
              )}
            </div>
          )}

          {/* Customer */}
          <SectionCard title="Customer" icon={User}>
            <InfoRow label="Name" value={customer.name} />
            <InfoRow label="Email" value={customer.email} />
            <InfoRow label="Phone" value={customer.phone} />
          </SectionCard>

          {/* Submission */}
          <SectionCard title="Submission">
            <InfoRow label="Feedback ID" value={feedback.id} />
            <InfoRow label="Date Submitted" value={new Date(feedback.dateSubmitted).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} />
            <InfoRow label="Order Reference" value={order.id} />
            <InfoRow label="Order Total" value={`$${order.total.toFixed(2)}`} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
