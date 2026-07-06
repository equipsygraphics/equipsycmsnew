import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, AlignLeft, Circle,
  CheckSquare, Sliders, ToggleLeft, Hash, Mail, Phone, Type, History,
  AlertTriangle, Search, Eye, X, ClipboardList, Lock, Copy,
  BarChart2, Star, Users,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { mockForms, mockFormResponses } from '../../data/mockForms'

// ─── Field type registry ───────────────────────────────────────────────────────

const FIELD_META = {
  text:     { label: 'Short Text',    Icon: Type,        group: 'Basic'  },
  email:    { label: 'Email',         Icon: Mail,        group: 'Basic'  },
  phone:    { label: 'Phone',         Icon: Phone,       group: 'Basic'  },
  number:   { label: 'Number',        Icon: Hash,        group: 'Basic'  },
  textarea: { label: 'Long Text',     Icon: AlignLeft,   group: 'Basic'  },
  select:   { label: 'Dropdown',      Icon: ChevronDown, group: 'Choice' },
  radio:    { label: 'Single Choice', Icon: Circle,      group: 'Choice' },
  checkbox: { label: 'Multi Choice',  Icon: CheckSquare, group: 'Choice' },
  scale:    { label: 'Rating Scale',  Icon: Sliders,     group: 'Scale'  },
  yesno:    { label: 'Yes / No',      Icon: ToggleLeft,  group: 'Scale'  },
}
const HAS_OPTIONS = new Set(['select', 'radio', 'checkbox'])
const FIELD_TYPES = Object.keys(FIELD_META)
const TYPE_GROUPS = ['Basic', 'Choice', 'Scale']

// ─── Structural change detection ──────────────────────────────────────────────

function isStructural(origFields, draftFields) {
  if (origFields.length !== draftFields.length) return true
  return origFields.some((f, i) => {
    const d = draftFields[i]
    return f.id !== d.id || f.type !== d.type || f.required !== d.required
  })
}

function describeChanges(origFields, draftFields) {
  const lines = []
  const diff = draftFields.length - origFields.length
  if (diff > 0) lines.push(`Added ${diff} field${diff > 1 ? 's' : ''}`)
  if (diff < 0) lines.push(`Removed ${Math.abs(diff)} field${Math.abs(diff) > 1 ? 's' : ''}`)
  if (origFields.some((f, i) => draftFields[i]?.id !== f.id)) lines.push('Fields reordered')
  const typeChanged = origFields.filter((f, i) => draftFields[i]?.id === f.id && draftFields[i]?.type !== f.type)
  if (typeChanged.length) lines.push(`Changed type of ${typeChanged.length} field${typeChanged.length > 1 ? 's' : ''}`)
  const reqChanged = origFields.filter((f, i) => draftFields[i]?.id === f.id && draftFields[i]?.required !== f.required)
  if (reqChanged.length) lines.push(`Required setting changed on ${reqChanged.length} field${reqChanged.length > 1 ? 's' : ''}`)
  return lines.length ? lines : ['Structural changes detected']
}

function newField(type = 'text') {
  return {
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    label: '',
    required: false,
    ...(HAS_OPTIONS.has(type) ? { options: ['', ''] } : {}),
    ...(type === 'scale' ? { min: 1, max: 5, minLabel: '', maxLabel: '' } : {}),
  }
}

// ─── Analytics: compute stats ─────────────────────────────────────────────────

function computeStats(field, responses) {
  const raw = responses.map(r => r.answers[field.id]).filter(v => v !== undefined && v !== null && v !== '')
  if (field.type === 'scale') {
    const nums = raw.filter(v => typeof v === 'number')
    const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
    const dist = {}
    nums.forEach(n => { dist[n] = (dist[n] || 0) + 1 })
    return { kind: 'scale', total: nums.length, avg, dist }
  }
  if (field.type === 'yesno') {
    const yes = raw.filter(v => v === true).length
    const no  = raw.filter(v => v === false).length
    return { kind: 'yesno', total: yes + no, yes, no }
  }
  if (HAS_OPTIONS.has(field.type)) {
    const counts = {}
    raw.forEach(v => { const arr = Array.isArray(v) ? v : [v]; arr.forEach(o => { counts[o] = (counts[o] || 0) + 1 }) })
    return { kind: 'choice', total: raw.length, counts }
  }
  return { kind: 'text', total: raw.length, values: raw.slice(0, 40) }
}

// ─── SVG: CircleScore ─────────────────────────────────────────────────────────
// Circular progress ring showing average score

function CircleScore({ avg, max = 5 }) {
  const pct = avg !== null ? avg / max : 0
  const r = 52, cx = 70, cy = 72
  const circ = 2 * Math.PI * r
  const filled = pct * circ
  const color = pct >= 0.8 ? '#22c55e' : pct >= 0.6 ? '#f59e0b' : pct >= 0.4 ? '#fb923c' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="148" viewBox="0 0 140 148" aria-hidden>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="13" />
        {/* Filled arc */}
        {avg !== null && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="13"
            strokeDasharray={`${filled} ${circ - filled}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        )}
        {/* Average number */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="30" fontWeight="700" fill="#111827" fontFamily="inherit">
          {avg !== null ? avg.toFixed(1) : '—'}
        </text>
        {/* Out of */}
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="inherit">
          out of {max}
        </text>
      </svg>
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avg ?? 0) ? 'text-amber-400' : 'text-grey-200'}`}
            fill={i < Math.round(avg ?? 0) ? 'currentColor' : 'currentColor'} />
        ))}
      </div>
    </div>
  )
}

// ─── SVG: DonutChart ──────────────────────────────────────────────────────────
// Yes/No split donut

function DonutChart({ yes, no }) {
  const total = yes + no
  const r = 44, cx = 60, cy = 60, sw = 16
  const circ = 2 * Math.PI * r
  const yesDash = total > 0 ? (yes / total) * circ : 0
  const noDash  = total > 0 ? (no / total)  * circ : 0
  const yesDeg  = total > 0 ? (yes / total) * 360 : 0
  const yesPct  = total > 0 ? Math.round(yes / total * 100) : 0
  const noPct   = 100 - yesPct

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
        {/* Yes (green) — starts at top */}
        {yesDash > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4ade80" strokeWidth={sw}
            strokeDasharray={`${yesDash} ${circ - yesDash}`}
            transform={`rotate(-90 ${cx} ${cy})`} />
        )}
        {/* No (rose) — starts where Yes ends */}
        {noDash > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fb7185" strokeWidth={sw}
            strokeDasharray={`${noDash} ${circ - noDash}`}
            transform={`rotate(${-90 + yesDeg} ${cx} ${cy})`} />
        )}
        {/* Centre label (bigger segment) */}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827" fontFamily="inherit">
          {yesPct >= 50 ? yesPct : noPct}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9.5" fill="#9ca3af" fontFamily="inherit">
          {yesPct >= 50 ? 'said Yes' : 'said No'}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            <span className="text-xs text-text-secondary">Yes</span>
          </div>
          <span className="text-xs font-semibold text-text-primary">{yes} <span className="text-text-muted font-normal">({yesPct}%)</span></span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fb7185]" />
            <span className="text-xs text-text-secondary">No</span>
          </div>
          <span className="text-xs font-semibold text-text-primary">{no} <span className="text-text-muted font-normal">({noPct}%)</span></span>
        </div>
      </div>
    </div>
  )
}

// ─── VerticalBars ─────────────────────────────────────────────────────────────
// Vertical bar chart for choice fields

const BAR_PALETTE = ['#3b82f6','#10b981','#f59e0b','#f43f5e','#8b5cf6','#06b6d4','#f97316','#84cc16']

function VerticalBars({ counts, options = [] }) {
  const keys = options.length > 0 ? options : Object.keys(counts)
  const max  = Math.max(...keys.map(k => counts[k] ?? 0), 1)
  const total = keys.reduce((s, k) => s + (counts[k] ?? 0), 0)
  const CHART_H = 120

  return (
    <div className="flex flex-col gap-3">
      {/* Bar area */}
      <div className="flex items-end gap-2" style={{ height: CHART_H + 24 }}>
        {keys.map((key, i) => {
          const count = counts[key] ?? 0
          const barH = Math.max(Math.round((count / max) * CHART_H), count > 0 ? 6 : 0)
          const pct  = total > 0 ? Math.round(count / total * 100) : 0
          const color = BAR_PALETTE[i % BAR_PALETTE.length]
          return (
            <div key={key} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full relative">
              {/* Count label above bar */}
              {count > 0 && (
                <span className="absolute text-xs font-bold text-text-primary"
                  style={{ bottom: barH + 22 }}>
                  {count}
                </span>
              )}
              {/* Bar */}
              <div className="w-full rounded-t-lg" style={{ height: barH, background: color, marginTop: 'auto' }} />
              {/* Pct label */}
              <span className="text-[10px] text-text-muted leading-none">{pct}%</span>
            </div>
          )
        })}
      </div>

      {/* Option labels + colour dots */}
      <div className="flex gap-2 flex-wrap">
        {keys.map((key, i) => (
          <div key={key} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: BAR_PALETTE[i % BAR_PALETTE.length] }} />
            <span className="text-[11px] text-text-muted truncate max-w-[120px]" title={key}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Fallback horizontal bar chart for choice fields with many options (> 6)
function HorizontalBars({ counts, options = [] }) {
  const keys = options.length > 0 ? options : Object.keys(counts)
  const max  = Math.max(...keys.map(k => counts[k] ?? 0), 1)
  const total = keys.reduce((s, k) => s + (counts[k] ?? 0), 0)

  return (
    <div className="flex flex-col gap-2">
      {keys.map((key, i) => {
        const count = counts[key] ?? 0
        const pct   = total > 0 ? Math.round(count / total * 100) : 0
        const color = BAR_PALETTE[i % BAR_PALETTE.length]
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-text-secondary min-w-0 w-32 truncate shrink-0" title={key}>{key}</span>
            <div className="flex-1 bg-grey-100 rounded-full h-4 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(count / max) * 100}%`, background: color }} />
            </div>
            <span className="text-xs text-text-muted w-16 text-right shrink-0">{count} ({pct}%)</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── ScaleDistribution ────────────────────────────────────────────────────────

function ScaleDistribution({ dist, count, min = 1, max = 5 }) {
  const points = Array.from({ length: max - min + 1 }, (_, i) => max - i)
  const maxVal = Math.max(...points.map(p => dist[p] ?? 0), 1)

  return (
    <div className="flex flex-col gap-2">
      {points.map(n => {
        const c   = dist[n] ?? 0
        const pct = count > 0 ? Math.round(c / count * 100) : 0
        const w   = (c / maxVal) * 100
        const color = n >= max * 0.8 ? '#22c55e' : n >= max * 0.6 ? '#86efac' : n >= max * 0.4 ? '#fbbf24' : n >= max * 0.2 ? '#fb923c' : '#f87171'
        return (
          <div key={n} className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted w-4 text-right shrink-0">{n}</span>
            <div className="flex-1 bg-grey-100 rounded-full h-5 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${w}%`, background: color }} />
            </div>
            <span className="text-xs text-text-muted w-16 text-right shrink-0">{c} ({pct}%)</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── TextResponses ────────────────────────────────────────────────────────────

function TextResponses({ values, total }) {
  const filled = values.filter(v => String(v).trim().length > 0)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-muted">{filled.length} written response{filled.length !== 1 ? 's' : ''}</p>
      {filled.length === 0 ? (
        <p className="text-sm text-text-muted italic py-2">No written responses yet.</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {filled.map((val, i) => (
            <div key={i} className="relative bg-grey-50 rounded-xl px-4 py-3 border border-border">
              <div className="absolute -left-px top-3 bottom-3 w-0.5 rounded-full bg-brand-300" />
              <p className="text-sm text-text-secondary leading-relaxed">"{val}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FieldAnalyticsCard ───────────────────────────────────────────────────────

function FieldAnalyticsCard({ field, index, responses }) {
  const stats = computeStats(field, responses)
  const meta  = FIELD_META[field.type] ?? FIELD_META.text
  const Icon  = meta.Icon

  const header = (
    <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-border">
      <div className="flex items-start gap-2 min-w-0">
        <span className="text-xs font-bold text-text-muted shrink-0 mt-0.5">Q{index + 1}</span>
        <p className="text-sm font-semibold text-text-primary leading-snug">{field.label || 'Untitled question'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted bg-grey-100 px-1.5 py-0.5 rounded">
          <Icon className="w-3 h-3" />{meta.label}
        </span>
        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          {stats.total} resp.
        </span>
      </div>
    </div>
  )

  if (stats.total === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 opacity-40">
        {header}
        <p className="text-sm text-text-muted text-center py-4">No responses collected for this question yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      {header}

      {stats.kind === 'scale' && (
        <div className="flex gap-6 items-start">
          <div className="shrink-0">
            <CircleScore avg={stats.avg} max={field.max ?? 5} />
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Distribution</p>
            <ScaleDistribution dist={stats.dist} count={stats.total} min={field.min ?? 1} max={field.max ?? 5} />
          </div>
        </div>
      )}

      {stats.kind === 'yesno' && (
        <div className="flex gap-8 items-start">
          <div className="shrink-0">
            <DonutChart yes={stats.yes} no={stats.no} />
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">Breakdown</p>
            <div className="flex flex-col gap-4">
              {[['Yes', stats.yes, '#4ade80'], ['No', stats.no, '#fb7185']].map(([label, count, color]) => {
                const pct = stats.total > 0 ? Math.round(count / stats.total * 100) : 0
                return (
                  <div key={label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-sm font-medium text-text-primary">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-text-primary">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-grey-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-xs text-text-muted">{count} of {stats.total} responses</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {stats.kind === 'choice' && (
        (field.options?.length ?? Object.keys(stats.counts).length) <= 6
          ? <VerticalBars  counts={stats.counts} options={field.options} />
          : <HorizontalBars counts={stats.counts} options={field.options} />
      )}

      {stats.kind === 'text' && (
        <TextResponses values={stats.values} total={stats.total} />
      )}
    </div>
  )
}

// ─── AnalyticsTab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ form }) {
  const sortedVersions = [...form.versions].sort((a, b) => b.versionNumber - a.versionNumber)
  const [selectedVersionId, setSelectedVersionId] = useState(form.currentVersionId)
  const selectedVersion = form.versions.find(v => v.id === selectedVersionId)
  const versionResponses = mockFormResponses.filter(r => r.formId === form.id && r.versionId === selectedVersionId)

  const totalAll = form.versions.reduce((s, v) => s + (v.responseCount ?? 0), 0)

  const scaleFields = selectedVersion?.fields.filter(f => f.type === 'scale') ?? []
  const scaleAvgs = scaleFields.map(f => {
    const vals = versionResponses.map(r => r.answers[f.id]).filter(v => typeof v === 'number')
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }).filter(v => v !== null)
  const overallAvg = scaleAvgs.length ? scaleAvgs.reduce((a, b) => a + b, 0) / scaleAvgs.length : null

  const answeredFields = selectedVersion?.fields.filter(f => {
    const s = computeStats(f, versionResponses)
    return s.total > 0
  }) ?? []

  return (
    <div className="flex flex-col gap-6">

      {/* Version selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide shrink-0">Version</p>
        {sortedVersions.map(v => {
          const isCurrent  = v.id === form.currentVersionId
          const isSelected = v.id === selectedVersionId
          const loaded = mockFormResponses.filter(r => r.formId === form.id && r.versionId === v.id).length
          return (
            <button key={v.id} onClick={() => setSelectedVersionId(v.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                isSelected ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-border text-text-muted hover:border-grey-300'
              }`}
            >
              v{v.versionNumber}
              {isCurrent
                ? <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-success-500/10 text-success-600 font-semibold">Current</span>
                : <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-grey-100 text-grey-500 font-semibold flex items-center gap-0.5"><History className="w-2.5 h-2.5" />Archived</span>
              }
              <span className="text-text-muted">{v.responseCount ?? 0} total · {loaded} loaded</span>
            </button>
          )
        })}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Responses (this version)</p>
            <p className="text-2xl font-bold text-text-primary">{selectedVersion?.responseCount ?? 0}</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-grey-100 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-grey-500" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total across all versions</p>
            <p className="text-2xl font-bold text-text-primary">{totalAll}</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Average rating score</p>
            <p className="text-2xl font-bold text-text-primary">
              {overallAvg !== null ? `${overallAvg.toFixed(1)} / 5` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Per-field charts */}
      {versionResponses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <BarChart2 className="w-12 h-12 text-grey-200 mx-auto mb-3" />
          <p className="text-text-muted font-medium">No responses loaded for this version</p>
          <p className="text-xs text-text-muted mt-1">
            {selectedVersion?.responseCount ?? 0 > 0
              ? `${selectedVersion?.responseCount} responses exist — sample data not pre-loaded for this version.`
              : 'Analytics charts will appear here once responses come in.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {selectedVersion?.fields.map((field, idx) => (
            <FieldAnalyticsCard key={field.id} field={field} index={idx} responses={versionResponses} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TypeSelector ─────────────────────────────────────────────────────────────

function TypeSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const meta = FIELD_META[value] ?? FIELD_META.text

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 h-9 px-3 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:border-brand-300 transition-colors">
        <meta.Icon className="w-4 h-4 text-text-muted" />
        <span className="min-w-[7rem] text-left">{meta.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 bg-surface border border-border rounded-xl shadow-xl py-2 w-52 overflow-hidden">
          {TYPE_GROUPS.map(group => (
            <div key={group}>
              <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide">{group}</p>
              {FIELD_TYPES.filter(t => FIELD_META[t].group === group).map(type => {
                const m = FIELD_META[type]
                return (
                  <button key={type} onClick={() => { onChange(type); setOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                      type === value ? 'bg-brand-50 text-brand-600' : 'text-text-secondary hover:bg-grey-50'
                    }`}
                  >
                    <m.Icon className="w-4 h-4 shrink-0" />
                    <span>{m.label}</span>
                    {type === value && <span className="ml-auto text-brand-400 text-xs">✓</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FieldCard ────────────────────────────────────────────────────────────────

function OptionsEditor({ options = [], onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-grey-300 shrink-0" />
          <input value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; onChange(o) }}
            placeholder={`Option ${i + 1}`}
            className="flex-1 h-8 bg-transparent border-b border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition-colors" />
          {options.length > 1 && (
            <button onClick={() => onChange(options.filter((_, j) => j !== i))}
              className="p-0.5 text-text-muted hover:text-error-500 rounded transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange([...options, ''])}
        className="flex items-center gap-2 mt-1 text-sm text-text-muted hover:text-brand-600 w-fit transition-colors">
        <div className="w-3 h-3 rounded-full border border-grey-300 shrink-0" />
        <span className="border-b border-dashed border-border hover:border-brand-400">Add option</span>
      </button>
    </div>
  )
}

function ScalePreview({ field }) {
  const pts = Array.from({ length: (field.max ?? 5) - (field.min ?? 1) + 1 }, (_, i) => (field.min ?? 1) + i)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {pts.map(n => (
          <div key={n} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-text-muted">{n}</span>
            <div className="w-5 h-5 rounded-full border-2 border-grey-300" />
          </div>
        ))}
      </div>
      {(field.minLabel || field.maxLabel) && (
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>{field.minLabel}</span><span>{field.maxLabel}</span>
        </div>
      )}
    </div>
  )
}

function FieldCard({ field, index, isActive, isReadOnly, onActivate, onUpdate, onRemove, onDuplicate, onDragStart, onDragOver, onDrop }) {
  const meta = FIELD_META[field.type] ?? FIELD_META.text
  const Icon = meta.Icon

  const handleTypeChange = (newType) => {
    const base = { id: field.id, label: field.label, required: field.required, type: newType }
    if (HAS_OPTIONS.has(newType)) base.options = field.options?.length ? field.options : ['', '']
    if (newType === 'scale') Object.assign(base, { min: 1, max: 5, minLabel: field.minLabel ?? '', maxLabel: field.maxLabel ?? '' })
    onUpdate(base)
  }

  return (
    <div
      draggable={!isReadOnly}
      onDragStart={!isReadOnly ? () => onDragStart(index) : undefined}
      onDragOver={!isReadOnly ? (e) => onDragOver(e, index) : undefined}
      onDrop={!isReadOnly ? onDrop : undefined}
      onClick={() => !isReadOnly && onActivate()}
      className={`group relative rounded-xl border-2 transition-all cursor-pointer ${
        isActive ? 'border-brand-400 shadow-md bg-surface' : 'border-border bg-surface hover:border-grey-300'
      }`}
    >
      {isActive && <div className="absolute left-0 top-4 bottom-4 w-1 bg-brand-500 rounded-r-full" />}
      {!isReadOnly && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 transition-opacity ${isActive ? 'opacity-20' : 'opacity-0 group-hover:opacity-30'}`}>
          <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
        </div>
      )}

      <div className="px-6 pt-5 pb-4">
        {isActive && !isReadOnly ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <input autoFocus value={field.label} onChange={e => onUpdate({ ...field, label: e.target.value })}
                  placeholder="Question" onClick={e => e.stopPropagation()}
                  className="w-full bg-transparent border-b-2 border-border focus:border-brand-500 text-base font-medium text-text-primary placeholder:text-text-muted/60 focus:outline-none pb-1 transition-colors" />
              </div>
              <div onClick={e => e.stopPropagation()}>
                <TypeSelector value={field.type} onChange={handleTypeChange} />
              </div>
            </div>
            <div onClick={e => e.stopPropagation()}>
              {HAS_OPTIONS.has(field.type) && (
                <OptionsEditor options={field.options ?? []} onChange={opts => onUpdate({ ...field, options: opts })} />
              )}
              {field.type === 'scale' && (
                <div className="flex flex-col gap-3">
                  <ScalePreview field={field} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Min label</label>
                      <input value={field.minLabel ?? ''} onChange={e => onUpdate({ ...field, minLabel: e.target.value })}
                        placeholder="e.g. Very poor"
                        className="w-full h-8 px-2.5 bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted block mb-1">Max label</label>
                      <input value={field.maxLabel ?? ''} onChange={e => onUpdate({ ...field, maxLabel: e.target.value })}
                        placeholder="e.g. Excellent"
                        className="w-full h-8 px-2.5 bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                    </div>
                  </div>
                </div>
              )}
              {field.type === 'yesno' && (
                <div className="flex flex-col gap-1.5">
                  {['Yes', 'No'].map(l => (
                    <div key={l} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-grey-300 shrink-0" />
                      <span className="text-sm text-text-muted">{l}</span>
                    </div>
                  ))}
                </div>
              )}
              {['text','email','phone','number'].includes(field.type) && (
                <div className="h-8 bg-grey-50 rounded-lg border border-dashed border-border flex items-center px-3">
                  <span className="text-xs text-text-muted italic">Short answer</span>
                </div>
              )}
              {field.type === 'textarea' && (
                <div className="h-14 bg-grey-50 rounded-lg border border-dashed border-border flex items-start px-3 pt-2">
                  <span className="text-xs text-text-muted italic">Long answer</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <button onClick={() => onDuplicate()} title="Duplicate"
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-grey-100 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => onRemove()} title="Delete"
                  className="p-1.5 rounded-lg text-text-muted hover:text-error-500 hover:bg-error-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-sm text-text-secondary">Required</span>
                <div onClick={() => onUpdate({ ...field, required: !field.required })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${field.required ? 'bg-brand-500' : 'bg-grey-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${field.required ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <Icon className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <p className={`text-sm font-medium leading-snug ${field.label ? 'text-text-primary' : 'text-text-muted italic'}`}>
                  {field.label || 'Untitled question'}
                  {field.required && <span className="text-error-500 ml-0.5">*</span>}
                </p>
              </div>
              <span className="text-[10px] text-text-muted bg-grey-100 px-1.5 py-0.5 rounded shrink-0">{meta.label}</span>
            </div>
            {HAS_OPTIONS.has(field.type) && field.options?.length > 0 && (
              <div className="flex flex-col gap-0.5 pl-6">
                {field.options.slice(0, 3).map((opt, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-grey-300 shrink-0" />
                    <span className="text-xs text-text-muted">{opt || `Option ${i + 1}`}</span>
                  </div>
                ))}
                {field.options.length > 3 && <span className="text-xs text-text-muted pl-5">+{field.options.length - 3} more</span>}
              </div>
            )}
            {field.type === 'scale' && <div className="pl-6"><ScalePreview field={field} /></div>}
            {field.type === 'yesno' && (
              <div className="flex gap-3 pl-6">
                {['Yes','No'].map(l => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-grey-300" />
                    <span className="text-xs text-text-muted">{l}</span>
                  </div>
                ))}
              </div>
            )}
            {isReadOnly && <span className="self-start text-[10px] text-grey-400 flex items-center gap-1 mt-1"><Lock className="w-3 h-3" />Archived</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AddFieldBar ───────────────────────────────────────────────────────────────

function AddFieldBar({ onAdd }) {
  const [open, setOpen] = useState(false)
  return open ? (
    <div className="w-full bg-surface border-2 border-dashed border-brand-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide text-center mb-3">Choose question type</p>
      <div className="flex flex-col gap-3">
        {TYPE_GROUPS.map(group => (
          <div key={group}>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">{group}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {FIELD_TYPES.filter(t => FIELD_META[t].group === group).map(type => {
                const { label, Icon } = FIELD_META[type]
                return (
                  <button key={type} onClick={() => { onAdd(type); setOpen(false) }}
                    className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-border bg-surface hover:bg-brand-50 hover:border-brand-200 transition-colors group">
                    <Icon className="w-5 h-5 text-text-muted group-hover:text-brand-500 transition-colors" />
                    <span className="text-[10px] text-text-muted group-hover:text-brand-600 text-center leading-tight">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setOpen(false)} className="mt-3 mx-auto flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary">
        <X className="w-3 h-3" /> Cancel
      </button>
    </div>
  ) : (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border text-sm text-text-muted hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50 transition-colors w-full justify-center">
      <Plus className="w-4 h-4" /> Add question
    </button>
  )
}

// ─── BuilderTab ───────────────────────────────────────────────────────────────

function BuilderTab({ form, selectedVersion, isCurrentVersion, onSaveForms }) {
  const origFields = selectedVersion.fields
  const [draftFields, setDraftFields] = useState([...origFields])
  const [activeFieldId, setActiveFieldId] = useState(null)
  const [versionModal, setVersionModal] = useState(null)
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  useEffect(() => { setDraftFields([...selectedVersion.fields]); setActiveFieldId(null) }, [selectedVersion.id])

  const hasChanges = JSON.stringify(draftFields) !== JSON.stringify(origFields)

  const handleSave = () => {
    if (isStructural(origFields, draftFields)) {
      setVersionModal({ changes: describeChanges(origFields, draftFields) })
    } else {
      onSaveForms(prev => prev.map(f => f.id !== form.id ? f : {
        ...f, versions: f.versions.map(v => v.id !== selectedVersion.id ? v : { ...v, fields: draftFields }),
      }))
      toast('Form saved', 'success')
    }
  }

  const confirmNewVersion = () => {
    const nextNum = Math.max(...form.versions.map(v => v.versionNumber)) + 1
    const newId = `fv-${form.id}-${nextNum}`
    const today = new Date().toISOString().slice(0, 10)
    onSaveForms(prev => prev.map(f => f.id !== form.id ? f : {
      ...f, currentVersionId: newId,
      versions: [
        ...f.versions.map(v => v.id === selectedVersion.id ? { ...v, archivedAt: today } : v),
        { id: newId, versionNumber: nextNum, createdAt: today, archivedAt: null, responseCount: 0, fields: draftFields },
      ],
    }))
    setVersionModal(null)
    toast(`Version ${nextNum} created`, 'success')
  }

  const updateField  = (id, upd) => setDraftFields(prev => prev.map(f => f.id === id ? upd : f))
  const removeField  = (id) => { setDraftFields(prev => prev.filter(f => f.id !== id)); if (activeFieldId === id) setActiveFieldId(null) }
  const duplicateField = (id) => {
    const idx = draftFields.findIndex(f => f.id === id)
    const copy = { ...draftFields[idx], id: `f-${Date.now()}-dup`, label: draftFields[idx].label + ' (copy)' }
    const arr = [...draftFields]; arr.splice(idx + 1, 0, copy)
    setDraftFields(arr); setActiveFieldId(copy.id)
  }
  const addField = (type) => { const f = newField(type); setDraftFields(p => [...p, f]); setActiveFieldId(f.id) }

  const onDragStart = i => { dragIdx.current = i }
  const onDragOver  = (e, i) => { e.preventDefault(); dragOverIdx.current = i }
  const onDrop = () => {
    const from = dragIdx.current, to = dragOverIdx.current
    if (from !== null && to !== null && from !== to) {
      const arr = [...draftFields]; const [it] = arr.splice(from, 1); arr.splice(to, 0, it); setDraftFields(arr)
    }
    dragIdx.current = null; dragOverIdx.current = null
  }

  return (
    <div className="flex flex-col gap-4" onClick={() => setActiveFieldId(null)}>
      {isCurrentVersion && hasChanges && (
        <div className="sticky top-0 z-20 flex items-center justify-between bg-brand-600 text-white px-4 py-2.5 rounded-xl shadow-lg" onClick={e => e.stopPropagation()}>
          <p className="text-sm font-medium">Unsaved changes</p>
          <div className="flex gap-2">
            <button onClick={() => { setDraftFields([...origFields]); setActiveFieldId(null) }}
              className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">Discard</button>
            <button onClick={handleSave}
              className="text-xs font-semibold bg-white text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">Save Changes</button>
          </div>
        </div>
      )}

      {!isCurrentVersion && (
        <div className="flex items-center gap-2 bg-grey-50 border border-border rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-grey-400 shrink-0" />
          <p className="text-sm text-text-muted">Archived version — switch to the current version to edit.</p>
        </div>
      )}

      {draftFields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <ClipboardList className="w-10 h-10 text-grey-200 mx-auto mb-3" />
          <p className="text-text-muted text-sm">No questions yet</p>
          <p className="text-xs text-text-muted mt-1">Click "Add question" below to get started</p>
        </div>
      )}

      {draftFields.map((field, idx) => (
        <div key={field.id} onClick={e => e.stopPropagation()}>
          <FieldCard field={field} index={idx} isActive={activeFieldId === field.id} isReadOnly={!isCurrentVersion}
            onActivate={() => setActiveFieldId(field.id)}
            onUpdate={upd => updateField(field.id, upd)}
            onRemove={() => removeField(field.id)}
            onDuplicate={() => duplicateField(field.id)}
            onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
        </div>
      ))}

      {isCurrentVersion && <div onClick={e => e.stopPropagation()}><AddFieldBar onAdd={addField} /></div>}

      {versionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setVersionModal(null)} />
          <div className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4.5 h-4.5 w-[18px] h-[18px] text-warning-500" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Create new version?</h3>
                <p className="text-sm text-text-muted mt-0.5">Structural changes require a new version. Version {selectedVersion.versionNumber} will be archived.</p>
              </div>
            </div>
            <div className="bg-grey-50 rounded-lg px-4 py-3 flex flex-col gap-1">
              {versionModal.changes.map((l, i) => <p key={i} className="text-xs text-text-secondary">• {l}</p>)}
            </div>
            <div className="flex items-start gap-2 bg-brand-50 rounded-lg px-4 py-3">
              <History className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-700">All {selectedVersion.responseCount ?? 0} existing responses stay linked to Version {selectedVersion.versionNumber}.</p>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" onClick={() => setVersionModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={confirmNewVersion}>
                Create Version {Math.max(...form.versions.map(v => v.versionNumber)) + 1}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ResponsesTab ─────────────────────────────────────────────────────────────

function ResponseDetailPanel({ response, fields, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[420px] bg-surface border-l border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-semibold text-text-primary text-sm">{response.respondent?.name || 'Anonymous'}</p>
            <p className="text-xs text-text-muted">{response.respondent?.email || '—'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-grey-100 text-text-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-3 border-b border-border bg-grey-50/50 shrink-0">
          <p className="text-xs text-text-muted">
            {new Date(response.submittedAt).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {fields.map(field => {
            const val = response.answers[field.id]
            const empty = val === undefined || val === null || val === ''
            return (
              <div key={field.id}>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">{field.label}</p>
                <p className="text-sm text-text-primary">
                  {empty ? <span className="italic text-text-muted">—</span>
                    : typeof val === 'boolean' ? (val ? 'Yes' : 'No')
                    : typeof val === 'number'  ? `${val} / ${field.max ?? 5}`
                    : Array.isArray(val) ? val.join(', ')
                    : String(val)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ResponsesTab({ form, selectedVersion }) {
  const [search, setSearch] = useState('')
  const [viewResponse, setViewResponse] = useState(null)
  const versionResponses = mockFormResponses.filter(r => r.formId === form.id && r.versionId === selectedVersion.id)
  const filtered = versionResponses.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.respondent?.name?.toLowerCase().includes(q) || r.respondent?.email?.toLowerCase().includes(q)
  })
  const fields = selectedVersion.fields

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{selectedVersion.responseCount ?? 0} total · {versionResponses.length} loaded</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search respondent…"
            className="w-52 pl-7 pr-3 h-8 bg-surface border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
        </div>
      </div>
      {filtered.length === 0
        ? <div className="text-center py-12 text-text-muted text-sm">No responses{search ? ' match your search' : ' yet'}.</div>
        : (
          <div className="flex flex-col gap-2">
            {filtered.map(response => {
              const scaleField = fields.find(f => f.type === 'scale')
              const label = response.respondent?.name || response.respondent?.email || 'Anonymous'
              return (
                <div key={response.id} className="flex items-center gap-4 bg-surface border border-border rounded-xl px-4 py-3 hover:bg-grey-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-600 shrink-0">
                    {label.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{label}</p>
                    {response.respondent?.email && response.respondent?.name && <p className="text-xs text-text-muted">{response.respondent.email}</p>}
                  </div>
                  {scaleField && response.answers[scaleField.id] !== undefined && (
                    <div className="text-xs text-text-muted shrink-0">
                      <span className="font-semibold text-text-primary">{response.answers[scaleField.id]}</span>/{scaleField.max ?? 5}
                    </div>
                  )}
                  <p className="text-xs text-text-muted whitespace-nowrap shrink-0">
                    {new Date(response.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </p>
                  <button onClick={() => setViewResponse(response)}
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 px-2.5 py-1 rounded-lg border border-brand-200 hover:bg-brand-50 shrink-0">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              )
            })}
          </div>
        )
      }
      {viewResponse && <ResponseDetailPanel response={viewResponse} fields={fields} onClose={() => setViewResponse(null)} />}
    </div>
  )
}

// ─── NewFormScreen ────────────────────────────────────────────────────────────

function NewFormScreen({ onCreated }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const handleCreate = () => {
    if (!name.trim()) return toast('Form name is required', 'error')
    const id = `form-${Date.now()}`, vId = `fv-${id}-1`, today = new Date().toISOString().slice(0, 10)
    onCreated({ id, name: name.trim(), description: desc.trim(), status: 'active', currentVersionId: vId, createdAt: today,
      versions: [{ id: vId, versionNumber: 1, createdAt: today, archivedAt: null, responseCount: 0, fields: [] }] })
    toast('Form created', 'success')
  }
  return (
    <div className="max-w-md">
      <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold text-text-primary">New Form</p>
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">Form name <span className="text-error-500">*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Post-Checkout Feedback"
            className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this form for?" rows={3}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none" />
        </div>
        <div className="flex justify-end"><Button variant="primary" onClick={handleCreate}>Create Form</Button></div>
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function FormDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [forms, setForms] = useState(mockForms)
  const form = forms.find(f => f.id === id)
  const [selectedVersionId, setSelectedVersionId] = useState(form?.currentVersionId ?? null)
  const [activeTab, setActiveTab] = useState('builder')

  if (isNew) return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/forms')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit"><ArrowLeft className="w-4 h-4" /> Back to Forms</button>
      <div><h1 className="text-xl font-semibold text-text-primary">New Form</h1><p className="text-sm text-text-muted mt-0.5">Create a form and add questions after.</p></div>
      <NewFormScreen onCreated={f => { setForms(prev => [...prev, f]); navigate('/forms') }} />
    </div>
  )

  if (!form) return (
    <div className="flex flex-col gap-4">
      <button onClick={() => navigate('/forms')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit"><ArrowLeft className="w-4 h-4" /> Back to Forms</button>
      <p className="text-sm text-text-muted">Form not found.</p>
    </div>
  )

  const sortedVersions = [...form.versions].sort((a, b) => b.versionNumber - a.versionNumber)
  const selectedVersion = form.versions.find(v => v.id === selectedVersionId) ?? form.versions.find(v => v.id === form.currentVersionId)
  const isCurrentVersion = selectedVersion?.id === form.currentVersionId

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/forms')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Forms
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{form.name}</h1>
          {form.description && <p className="text-sm text-text-muted mt-0.5">{form.description}</p>}
        </div>
        <Badge variant={form.status === 'active' ? 'active' : 'archived'} label={form.status === 'active' ? 'Active' : 'Inactive'} dot />
      </div>

      {form.versions.length > 1 && (
        <div>
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Version</p>
          <div className="flex items-center gap-2 flex-wrap">
            {sortedVersions.map(v => {
              const isCurrent = v.id === form.currentVersionId
              const isSelected = v.id === selectedVersion?.id
              return (
                <button key={v.id} onClick={() => setSelectedVersionId(v.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                    isSelected ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-border text-text-muted hover:border-grey-300'
                  }`}
                >
                  v{v.versionNumber}
                  {isCurrent
                    ? <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-success-500/10 text-success-600 font-semibold">Current</span>
                    : <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-grey-100 text-grey-500 font-semibold flex items-center gap-0.5"><History className="w-2.5 h-2.5" />Archived</span>
                  }
                  <span className="text-text-muted">{v.responseCount ?? 0} resp.</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="border-b border-border">
        <div className="flex gap-6">
          {[
            { key: 'builder',   label: 'Builder',   Icon: ClipboardList },
            { key: 'responses', label: 'Responses',  Icon: Users, count: selectedVersion?.responseCount },
            { key: 'analytics', label: 'Analytics',  Icon: BarChart2 },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              <tab.Icon className="w-4 h-4" />
              {tab.label}
              {tab.count != null && <span className="ml-0.5 text-xs font-semibold text-text-muted">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {selectedVersion && (
        <>
          {activeTab === 'builder'   && <BuilderTab form={form} selectedVersion={selectedVersion} isCurrentVersion={isCurrentVersion} onSaveForms={setForms} />}
          {activeTab === 'responses' && <ResponsesTab form={form} selectedVersion={selectedVersion} />}
          {activeTab === 'analytics' && <AnalyticsTab form={form} />}
        </>
      )}
    </div>
  )
}
