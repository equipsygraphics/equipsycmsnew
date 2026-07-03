import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, User, BarChart2, List, AlertTriangle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { mockOTFeedback, OT_WORK_SETTINGS, OT_FUNDING_SCHEMES, OT_QUOTES_PER_MONTH, OT_SCOPE_TOOLS, OT_FIND_PROVIDERS, OT_QUOTES_PER_JOB, OT_FRUSTRATIONS } from '../../data/mockOTFeedback'

// ── Chart primitives (same pattern as customer feedback) ──────────────────────

const CHOICE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#9ca3af', '#16a34a', '#ef4444', '#f97316']

function DonutChart({ segments, size = 110 }) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  const r = 38, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  let accumulated = 0
  const arcs = segments.map(seg => {
    const dash = total > 0 ? (seg.value / total) * circ : 0
    const offset = -accumulated
    accumulated += dash
    return { ...seg, dash, offset }
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
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={700} fill="#0D121C">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="#6b7280">responses</text>
    </svg>
  )
}

function HorizBar({ label, count, outOf, color, maxCount }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
  const respPct = outOf > 0 ? Math.round(count / outOf * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-44 shrink-0 truncate text-right" title={label}>{label}</span>
      <div className="flex-1 h-5 bg-grey-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-text-primary w-5 text-right">{count}</span>
      <span className="text-xs text-text-muted w-8">{respPct}%</span>
    </div>
  )
}

function QuestionCard({ title, subtitle, n, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text-primary leading-snug">{title}</p>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-xs text-text-muted shrink-0">{n} responses</span>
      </div>
      {children}
    </div>
  )
}

function RadioChart({ options, counts, n }) {
  const maxCount = Math.max(...options.map(o => counts[o] || 0), 1)
  const segments = options.map((opt, i) => ({ label: opt, value: counts[opt] || 0, color: CHOICE_COLORS[i % CHOICE_COLORS.length] }))
  return (
    <div className="flex gap-6 items-center">
      <DonutChart segments={segments} size={110} />
      <div className="flex-1 flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <HorizBar key={opt} label={opt} count={counts[opt] || 0} outOf={n} color={CHOICE_COLORS[i % CHOICE_COLORS.length]} maxCount={maxCount} />
        ))}
      </div>
    </div>
  )
}

function CheckboxChart({ options, counts, n }) {
  // For multi-select: outOf = n respondents (not total selections)
  const maxCount = Math.max(...options.map(o => counts[o] || 0), 1)
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-text-muted">% of {n} respondents who selected each option</p>
      {options.map((opt, i) => (
        <HorizBar key={opt} label={opt} count={counts[opt] || 0} outOf={n} color={CHOICE_COLORS[i % CHOICE_COLORS.length]} maxCount={maxCount} />
      ))}
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

  function radioCounts(field, options) {
    const c = {}
    options.forEach(o => { c[o] = 0 })
    data.forEach(f => { const v = f.answers[field]; if (v in c) c[v]++ })
    return c
  }

  function checkboxCounts(field, options) {
    const c = {}
    options.forEach(o => { c[o] = 0 })
    data.forEach(f => {
      const arr = f.answers[field] || []
      arr.forEach(v => { if (v in c) c[v]++ })
    })
    return c
  }

  const workSettingCounts  = radioCounts('workSetting', OT_WORK_SETTINGS)
  const quotesMonthCounts  = radioCounts('quotesPerMonth', OT_QUOTES_PER_MONTH)
  const quotesJobCounts    = radioCounts('quotesPerJob', OT_QUOTES_PER_JOB)
  const fundingCounts      = checkboxCounts('fundingSchemes', OT_FUNDING_SCHEMES)
  const toolsCounts        = checkboxCounts('scopeTools', OT_SCOPE_TOOLS)
  const findCounts         = checkboxCounts('findProviders', OT_FIND_PROVIDERS)
  const frustrationCounts  = checkboxCounts('frustrations', OT_FRUSTRATIONS)

  const improvements = data
    .filter(f => f.answers.improvements?.trim())
    .map(f => ({
      text: f.answers.improvements,
      name: f.respondent.name || 'Anonymous',
      date: new Date(f.dateSubmitted).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
    }))

  // Top frustration
  const topFrustration = OT_FRUSTRATIONS.reduce((a, b) => (frustrationCounts[b] || 0) > (frustrationCounts[a] || 0) ? b : a)
  const topWorkSetting = OT_WORK_SETTINGS.reduce((a, b) => (workSettingCounts[b] || 0) > (workSettingCounts[a] || 0) ? b : a)
  const ndisCount = fundingCounts['NDIS'] || 0

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Total Responses</p>
          <p className="text-2xl font-bold text-text-primary">{n}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Most Common Setting</p>
          <p className="text-lg font-bold text-brand-500 leading-tight">{topWorkSetting}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">NDIS Practitioners</p>
          <p className="text-2xl font-bold text-text-primary">{ndisCount}</p>
          <p className="text-xs text-text-muted">{Math.round(ndisCount / n * 100)}% work with NDIS</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Top Frustration</p>
          <p className="text-xs font-semibold text-error-600 leading-tight mt-0.5">{topFrustration}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <QuestionCard title="What's your primary work setting?" subtitle="Select one" n={n}>
          <RadioChart options={OT_WORK_SETTINGS} counts={workSettingCounts} n={n} />
        </QuestionCard>

        <QuestionCard title="Which funding schemes do you work with most?" subtitle="Select all that apply" n={n}>
          <CheckboxChart options={OT_FUNDING_SCHEMES} counts={fundingCounts} n={n} />
        </QuestionCard>

        <QuestionCard title="Roughly how many scopes of work or quote requests do you prepare per month?" subtitle="Select one" n={n}>
          <RadioChart options={OT_QUOTES_PER_MONTH} counts={quotesMonthCounts} n={n} />
        </QuestionCard>

        <QuestionCard title="What tools do you currently use to write scopes of work or procurement documents?" subtitle="Select all that apply" n={n}>
          <CheckboxChart options={OT_SCOPE_TOOLS} counts={toolsCounts} n={n} />
        </QuestionCard>

        <QuestionCard title="How do you currently find and select service providers for a job?" subtitle="Select all that apply" n={n}>
          <CheckboxChart options={OT_FIND_PROVIDERS} counts={findCounts} n={n} />
        </QuestionCard>

        <QuestionCard title="How many service providers do you typically request quotes from per job?" subtitle="Select one" n={n}>
          <RadioChart options={OT_QUOTES_PER_JOB} counts={quotesJobCounts} n={n} />
        </QuestionCard>
      </div>

      {/* Frustrations — full width (lots of options) */}
      <QuestionCard title="What's the most frustrating part of the quoting and procurement process?" subtitle="Select all that apply" n={n}>
        <CheckboxChart options={OT_FRUSTRATIONS} counts={frustrationCounts} n={n} />
      </QuestionCard>

      {/* Text responses — full width */}
      <QuestionCard title={`Improvement suggestions (${improvements.length} responses)`} n={n}>
        <TextResponsesList responses={improvements} />
      </QuestionCard>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function OTFeedbackList() {
  const navigate = useNavigate()
  const [viewTab, setViewTab] = useState('responses')
  const [search, setSearch] = useState('')
  const [settingFilter, setSettingFilter] = useState('')

  const filtered = mockOTFeedback.filter(f => {
    const name = f.respondent.name || ''
    const email = f.respondent.email || ''
    if (search && ![name, email, f.id].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false
    if (settingFilter && f.answers.workSetting !== settingFilter) return false
    return true
  })

  const anon = mockOTFeedback.filter(f => !f.respondent.name).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="OT Feedback"
        subtitle="Responses to the OT research feedback form."
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
        <AnalyticsTab data={mockOTFeedback} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Responses', value: mockOTFeedback.length, color: 'text-text-primary' },
              { label: 'Anonymous', value: anon, color: 'text-text-muted' },
              { label: 'Named Respondents', value: mockOTFeedback.length - anon, color: 'text-success-500' },
              { label: 'With Improvements', value: mockOTFeedback.filter(f => f.answers.improvements?.trim()).length, color: 'text-brand-500' },
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, or ID..." className="h-9 pl-9 pr-3 w-full rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <select value={settingFilter} onChange={e => setSettingFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none focus:border-brand-500">
              <option value="">All Work Settings</option>
              {OT_WORK_SETTINGS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-grey-50">
                  {['Respondent', 'Work Setting', 'Funding Schemes', 'Quotes/Month', 'Frustrations', 'Submitted', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="px-5 py-12 text-center text-text-muted">No responses found.</td></tr>
                  : filtered.map(f => (
                    <tr key={f.id} onClick={() => navigate(`/ot-feedback/${f.id}`)} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        {f.respondent.name
                          ? <>
                              <p className="font-medium text-text-primary">{f.respondent.name}</p>
                              {f.respondent.email && <p className="text-xs text-text-muted">{f.respondent.email}</p>}
                            </>
                          : <span className="flex items-center gap-1.5 text-text-muted text-xs"><User className="w-3.5 h-3.5" /> Anonymous</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-text-secondary">{f.answers.workSetting}</p>
                        {f.answers.workSettingOther && <p className="text-xs text-text-muted">{f.answers.workSettingOther}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {f.answers.fundingSchemes.slice(0, 2).map(s => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 border border-brand-100">{s}</span>
                          ))}
                          {f.answers.fundingSchemes.length > 2 && (
                            <span className="text-xs text-text-muted">+{f.answers.fundingSchemes.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary">{f.answers.quotesPerMonth}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-text-muted">{f.answers.frustrations.length} selected</span>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted whitespace-nowrap text-xs">
                        {new Date(f.dateSubmitted).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/ot-feedback/${f.id}`)} className="text-text-muted hover:text-text-primary transition-colors">
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
