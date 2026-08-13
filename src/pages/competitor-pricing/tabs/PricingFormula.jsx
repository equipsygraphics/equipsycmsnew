import { ArrowRight, RotateCcw } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { toast } from '../../../components/ui/Toast'
import { DEFAULT_PRICE_POSITION_RULES } from '../../../data/mockMatching'

const BAND_VARIANT = { low: 'grey', mid: 'info', 'upper-mid': 'success', high: 'warning' }

const TEXT_COLUMNS = [
  { key: 'matchType', label: 'Match Type', width: 130 },
  { key: 'productType', label: 'Product Type', width: 150 },
  { key: 'target', label: 'Target', width: 170 },
  { key: 'description', label: 'Description', width: 260 },
  { key: 'indicator', label: 'Indicator', width: 190 },
  { key: 'condition', label: 'Condition', width: 190 },
  { key: 'pricingLogic', label: 'Pricing Adjustment Logic', width: 260 },
]

function EditableText({ value, onChange, width }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ minWidth: width }}
      className="w-full bg-transparent text-sm text-text-primary outline-none rounded-md px-2 py-1.5 border border-transparent hover:border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
    />
  )
}

export function PricingFormula({ rules, setRules, standardMarginPct, setStandardMarginPct }) {
  const update = (key, field, value) => {
    setRules(prev => prev.map(r => (r.key === key ? { ...r, [field]: value } : r)))
  }

  const updateMultiplier = (key, raw) => {
    const value = raw === '' ? '' : Number(raw)
    setRules(prev => prev.map(r => (r.key === key ? { ...r, priceMultiplier: value } : r)))
  }

  const handleReset = () => {
    setRules(DEFAULT_PRICE_POSITION_RULES.map(r => ({ ...r })))
    toast('Pricing rule table reset to defaults', 'info')
  }

  const updateStandardMargin = (raw) => {
    const pct = raw === '' ? 0 : Number(raw) / 100
    setStandardMarginPct(pct)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Rule table used to position our price against the closest-matching competitors, once a product clears core + variant matching.
        </p>
        <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>

      {setStandardMarginPct && (
        <div className="bg-warning-500/10 border border-warning-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Standard Margin (no competitors found)</p>
            <p className="text-xs text-text-muted mt-0.5">
              When a product has no valid competitor matches, its recommended price falls back to cost × (1 + this margin)
              instead of the rule table above.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="number"
              step="1"
              min="0"
              value={Math.round(standardMarginPct * 100)}
              onChange={e => updateStandardMargin(e.target.value)}
              className="w-20 h-10 bg-surface text-sm text-right font-medium text-text-primary outline-none rounded-lg border border-border px-3 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
            />
            <span className="text-sm text-text-muted">%</span>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Priority order</p>
        <div className="flex items-center flex-wrap gap-2">
          {rules.map((r, i) => (
            <div key={r.key} className="flex items-center gap-2">
              <Badge variant={BAND_VARIANT[r.key]} label={r.label} />
              {i < rules.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-text-muted" />}
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted">
          If any matched attribute lands in Mid, the product is priced as Mid — the rest are ignored. Otherwise the first of
          Upper-Mid, High, then Low that applies wins.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              <th className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Price Position</th>
              {TEXT_COLUMNS.map(c => (
                <th key={c.key} className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{c.label}</th>
              ))}
              <th className="px-3 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">%</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={r.key} className="border-b border-border last:border-0">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-grey-100 text-text-secondary text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                    <Badge variant={BAND_VARIANT[r.key]} label={r.label} />
                  </div>
                </td>
                {TEXT_COLUMNS.map(c => (
                  <td key={c.key} className="py-1">
                    <EditableText value={r[c.key]} onChange={v => update(r.key, c.key, v)} width={c.width} />
                  </td>
                ))}
                <td className="py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={r.priceMultiplier}
                    onChange={e => updateMultiplier(r.key, e.target.value)}
                    className="w-20 bg-transparent text-sm text-right font-medium text-text-primary outline-none rounded-md px-2 py-1.5 border border-transparent hover:border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-text-muted">
        Only the <strong>%</strong> column drives live pricing — it's the multiplier applied to the competitor average price for every product
        that lands in that band (see the Overview tab's per-product breakdown). The other columns are editable reference copy for this
        prototype and don't change the underlying match-differential thresholds.
      </p>
    </div>
  )
}
