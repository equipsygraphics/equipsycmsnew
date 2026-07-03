import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, Truck, Package, CheckCircle, XCircle, AlertTriangle, BarChart2, List } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { mockFeedback, OCCUPATION_OPTIONS, HEARD_OPTIONS, FINDABILITY_OPTIONS, CLARITY_OPTIONS, CHECKOUT_OPTIONS } from '../../data/mockFeedback'

// ── Colour palettes ───────────────────────────────────────────────────────────

const SCALE_COLORS  = ['#16a34a', '#4ade80', '#9ca3af', '#f97316', '#ef4444']
const CHOICE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#9ca3af']

// ── Shared list-page helpers ──────────────────────────────────────────────────

const POSITIVE_IDX = {
  'Very Easy': 0, 'Easy': 1, 'Neutral': 2, 'Difficult': 3, 'Very Difficult': 4,
  'Very Clear': 0, 'Clear': 1, 'Unclear': 3, 'Very Unclear': 4,
  'Very Good': 0, 'Good': 1, 'Poor': 3, 'Very Poor': 4,
}

function ScorePill({ value }) {
  const idx = POSITIVE_IDX[value] ?? 2
  const color = idx <= 1 ? 'bg-success-500/10 text-success-600 border-success-500/20'
    : idx === 2 ? 'bg-grey-100 text-text-secondary border-border'
    : 'bg-error-500/10 text-error-600 border-error-500/20'
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>{value}</span>
}

function YesNoPill({ value, alertOnTrue }) {
  const isAlert = alertOnTrue && value
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${isAlert ? 'bg-error-500/10 text-error-600 border-error-500/20' : value ? 'bg-grey-100 text-text-secondary border-border' : 'bg-success-500/10 text-success-600 border-success-500/20'}`}>
      {value ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
      {value ? 'Yes' : 'No'}
    </span>
  )
}

// ── Analytics chart primitives ────────────────────────────────────────────────

function DonutChart({ segments, size = 120 }) {
  // segments: [{ label, value, color }]
  const total = segments.reduce((s, d) => s + d.value, 0)
  const r = 38
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  let accumulated = 0
  const arcs = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0
    const dash = pct * circ
    const offset = -accumulated
    accumulated += dash
    return { ...seg, pct, dash, offset }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {total === 0
        ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={18} />
        : arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={arc.color} strokeWidth={18}
            strokeDasharray={`${arc.dash} ${circ}`}
            strokeDashoffset={arc.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))
      }
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-xs" fontSize={18} fontWeight={700} fill="#0D121C">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="#6b7280">responses</text>
    </svg>
  )
}

function HorizBar({ label, count, total, color, maxCount }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
  const respPct = total > 0 ? Math.round(count / total * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-32 shrink-0 truncate text-right">{label}</span>
      <div className="flex-1 h-5 bg-grey-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-text-primary w-5 text-right">{count}</span>
      <span className="text-xs text-text-muted w-8">{respPct}%</span>
    </div>
  )
}

function QuestionCard({ title, n, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary leading-snug">{title}</p>
        <span className="text-xs text-text-muted shrink-0">{n} responses</span>
      </div>
      {children}
    </div>
  )
}

function ChoiceChart({ options, counts, colors }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...options.map(o => counts[o] || 0), 1)
  const segments = options.map((opt, i) => ({ label: opt, value: counts[opt] || 0, color: colors[i] }))
  return (
    <div className="flex gap-6 items-center">
      <DonutChart segments={segments} size={110} />
      <div className="flex-1 flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <HorizBar key={opt} label={opt} count={counts[opt] || 0} total={total} color={colors[i]} maxCount={maxCount} />
        ))}
      </div>
    </div>
  )
}

function ScaleChart({ options, counts, colors }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...options.map(o => counts[o] || 0), 1)
  // Stacked summary bar
  const stackSegs = options.map((opt, i) => ({ opt, pct: total > 0 ? (counts[opt] || 0) / total * 100 : 0, color: colors[i] }))
  return (
    <div className="flex flex-col gap-3">
      {/* Stacked bar */}
      <div className="h-4 w-full rounded-full overflow-hidden flex">
        {stackSegs.map(s => (
          <div key={s.opt} style={{ width: `${s.pct}%`, backgroundColor: s.color }} title={`${s.opt}: ${s.pct.toFixed(0)}%`} />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <HorizBar key={opt} label={opt} count={counts[opt] || 0} total={total} color={colors[i]} maxCount={maxCount} />
        ))}
      </div>
    </div>
  )
}

function YesNoChart({ yesCount, noCount, yesColor = '#ef4444', noColor = '#16a34a', yesLabel = 'Yes', noLabel = 'No' }) {
  const total = yesCount + noCount
  const segments = [
    { label: noLabel, value: noCount, color: noColor },
    { label: yesLabel, value: yesCount, color: yesColor },
  ]
  return (
    <div className="flex gap-6 items-center">
      <DonutChart segments={segments} size={110} />
      <div className="flex-1 flex flex-col gap-3">
        {[{ label: noLabel, count: noCount, color: noColor }, { label: yesLabel, count: yesCount, color: yesColor }].map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-text-primary flex-1">{s.label}</span>
            <span className="text-sm font-bold text-text-primary">{s.count}</span>
            <span className="text-xs text-text-muted">{total > 0 ? Math.round(s.count / total * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TextResponsesList({ responses }) {
  return (
    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
      {responses.length === 0
        ? <p className="text-sm text-text-muted italic">No responses.</p>
        : responses.map((r, i) => (
          <div key={i} className="bg-grey-50 border border-border rounded-lg px-3.5 py-2.5">
            <p className="text-sm text-text-primary leading-relaxed">{r.text}</p>
            <p className="text-xs text-text-muted mt-1">{r.name} · {r.date}</p>
          </div>
        ))
      }
    </div>
  )
}

// ── Analytics tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ data }) {
  const n = data.length

  function counts(field, options) {
    const c = {}
    options.forEach(o => { c[o] = 0 })
    data.forEach(f => {
      const v = f.answers[field]
      if (v in c) c[v]++
      else c['Other'] = (c['Other'] || 0) + 1
    })
    return c
  }

  const occupationCounts  = counts('occupation', OCCUPATION_OPTIONS)
  const heardCounts       = counts('heard', HEARD_OPTIONS)
  const findabilityCounts = counts('findability', FINDABILITY_OPTIONS)
  const shippingCounts    = counts('shippingClarity', CLARITY_OPTIONS)
  const checkoutCounts    = counts('checkoutRating', CHECKOUT_OPTIONS)

  const techYes = data.filter(f => f.answers.technicalIssues).length
  const csYes   = data.filter(f => f.answers.contactedCS).length

  const improvements = data
    .filter(f => f.answers.improvements?.trim())
    .map(f => ({
      text: f.answers.improvements,
      name: f.customer.name,
      date: new Date(f.dateSubmitted).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
    }))

  // Summary stats
  const easyPct    = n > 0 ? Math.round(data.filter(f => ['Very Easy', 'Easy'].includes(f.answers.findability)).length / n * 100) : 0
  const techPct    = n > 0 ? Math.round(techYes / n * 100) : 0
  const csPct      = n > 0 ? Math.round(csYes / n * 100) : 0
  const goodCheckout = n > 0 ? Math.round(data.filter(f => ['Very Good', 'Good'].includes(f.answers.checkoutRating)).length / n * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Responses', value: n, sub: null, color: 'text-text-primary' },
          { label: 'Found Products Easily', value: `${easyPct}%`, sub: `${data.filter(f => ['Very Easy','Easy'].includes(f.answers.findability)).length} of ${n}`, color: 'text-success-500' },
          { label: 'Technical Issues', value: `${techPct}%`, sub: `${techYes} reported issues`, color: techYes > 0 ? 'text-error-500' : 'text-success-500' },
          { label: 'Positive Checkout', value: `${goodCheckout}%`, sub: `rated Good or Very Good`, color: goodCheckout >= 70 ? 'text-success-500' : 'text-amber-500' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-1">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-text-muted">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Question cards — 2 col grid */}
      <div className="grid grid-cols-2 gap-5">
        <QuestionCard title="Occupation" n={n}>
          <ChoiceChart options={OCCUPATION_OPTIONS} counts={occupationCounts} colors={CHOICE_COLORS} />
        </QuestionCard>

        <QuestionCard title="How did you hear about us?" n={n}>
          <ChoiceChart options={HEARD_OPTIONS} counts={heardCounts} colors={CHOICE_COLORS} />
        </QuestionCard>

        <QuestionCard title="How easy was it to find the product you were looking for?" n={n}>
          <ScaleChart options={FINDABILITY_OPTIONS} counts={findabilityCounts} colors={SCALE_COLORS} />
        </QuestionCard>

        <QuestionCard title="Did you encounter any technical issues while browsing our website?" n={n}>
          <YesNoChart yesCount={techYes} noCount={n - techYes} yesColor="#ef4444" noColor="#16a34a" />
          {techYes > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-error-600 bg-error-500/10 border border-error-500/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {techYes} customer{techYes !== 1 ? 's' : ''} reported technical issues — review improvement suggestions below.
            </div>
          )}
        </QuestionCard>

        <QuestionCard title="How clear were the shipping options and costs?" n={n}>
          <ScaleChart options={CLARITY_OPTIONS} counts={shippingCounts} colors={SCALE_COLORS} />
        </QuestionCard>

        <QuestionCard title="How would you rate your experience with the checkout process?" n={n}>
          <ScaleChart options={CHECKOUT_OPTIONS} counts={checkoutCounts} colors={SCALE_COLORS} />
        </QuestionCard>

        <QuestionCard title="Did you need to contact customer service during your shopping experience?" n={n}>
          <YesNoChart yesCount={csYes} noCount={n - csYes} yesColor="#f59e0b" noColor="#16a34a" yesLabel="Yes — contacted CS" noLabel="No — self-served" />
        </QuestionCard>
      </div>

      {/* Text responses — full width */}
      <QuestionCard title={`What aspect of your shopping experience could we improve? (${improvements.length} responses)`} n={n}>
        <TextResponsesList responses={improvements} />
      </QuestionCard>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function FeedbackList() {
  const navigate = useNavigate()
  const [viewTab, setViewTab] = useState('responses')
  const [search, setSearch] = useState('')
  const [occupationFilter, setOccupationFilter] = useState('')
  const [heardFilter, setHeardFilter] = useState('')
  const [issuesFilter, setIssuesFilter] = useState('')

  const filtered = mockFeedback.filter(f => {
    if (search && ![f.customer.name, f.customer.email, f.order.id].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false
    if (occupationFilter && f.answers.occupation !== occupationFilter) return false
    if (heardFilter && f.answers.heard !== heardFilter) return false
    if (issuesFilter === 'yes' && !f.answers.technicalIssues) return false
    if (issuesFilter === 'no' && f.answers.technicalIssues) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customer Feedback"
        subtitle="Post-checkout feedback submitted by customers."
      />

      {/* View tabs */}
      <div className="flex border-b border-border">
        {[
          { key: 'responses', label: 'Responses', icon: List },
          { key: 'analytics', label: 'Analytics', icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setViewTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${viewTab === key ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {viewTab === 'analytics' ? (
        <AnalyticsTab data={mockFeedback} />
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Responses', value: mockFeedback.length, color: 'text-text-primary' },
              { label: 'Found Products Easily', value: `${Math.round(mockFeedback.filter(f => ['Very Easy','Easy'].includes(f.answers.findability)).length / mockFeedback.length * 100)}%`, color: 'text-success-500' },
              { label: 'Technical Issues', value: mockFeedback.filter(f => f.answers.technicalIssues).length, color: mockFeedback.filter(f => f.answers.technicalIssues).length > 0 ? 'text-error-500' : 'text-success-500' },
              { label: 'Contacted CS', value: mockFeedback.filter(f => f.answers.contactedCS).length, color: 'text-amber-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-1">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer or order..." className="h-9 pl-9 pr-3 w-full rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <select value={occupationFilter} onChange={e => setOccupationFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none focus:border-brand-500">
              <option value="">All Occupations</option>
              {OCCUPATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={heardFilter} onChange={e => setHeardFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none focus:border-brand-500">
              <option value="">All Sources</option>
              {HEARD_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={issuesFilter} onChange={e => setIssuesFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none focus:border-brand-500">
              <option value="">All</option>
              <option value="yes">Tech Issues: Yes</option>
              <option value="no">Tech Issues: No</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-grey-50">
                  {['Customer', 'Order', 'Occupation', 'Source', 'Find Product', 'Tech Issues', 'Checkout', 'Contacted CS', 'Submitted', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={10} className="px-5 py-12 text-center text-text-muted">No feedback found.</td></tr>
                  : filtered.map(f => (
                    <tr key={f.id} onClick={() => navigate(`/feedback/${f.id}`)} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-text-primary">{f.customer.name}</p>
                        <p className="text-xs text-text-muted">{f.customer.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-text-primary">{f.order.id}</p>
                        <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                          {f.order.fulfillment === 'delivery' ? <Truck className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          ${f.order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-text-secondary">{f.answers.occupation}</p>
                        {f.answers.occupationOther && <p className="text-xs text-text-muted">{f.answers.occupationOther}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary">{f.answers.heard}{f.answers.heardOther ? ` — ${f.answers.heardOther}` : ''}</td>
                      <td className="px-4 py-3.5"><ScorePill value={f.answers.findability} /></td>
                      <td className="px-4 py-3.5"><YesNoPill value={f.answers.technicalIssues} alertOnTrue /></td>
                      <td className="px-4 py-3.5"><ScorePill value={f.answers.checkoutRating} /></td>
                      <td className="px-4 py-3.5"><YesNoPill value={f.answers.contactedCS} alertOnTrue={false} /></td>
                      <td className="px-4 py-3.5 text-text-muted whitespace-nowrap text-xs">
                        {new Date(f.dateSubmitted).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/feedback/${f.id}`)} className="text-text-muted hover:text-text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
