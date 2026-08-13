import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'

export const BAND_VARIANT = { low: 'grey', mid: 'info', 'upper-mid': 'success', high: 'warning', 'standard-margin': 'warning' }
export const BAND_LABEL = { low: 'Low', mid: 'Mid', 'upper-mid': 'Upper-Mid', high: 'High' }

function money(v) {
  return v == null ? '—' : `$${v.toFixed(2)}`
}

function signed(v, suffix = '%') {
  return v == null ? '—' : `${v > 0 ? '+' : ''}${v}${suffix}`
}

function VariantMatchSection({ product, position, cost, onEditVariantAttributes, onEditStandardMargin }) {
  const hasData = position && position.viable.length > 0 && position.attributeResults.length > 0
  const usedStandardMargin = position?.usedStandardMargin
  const margin = cost != null && position?.recommendedPrice ? (position.recommendedPrice - cost) / position.recommendedPrice : null

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-1">
        <p className="text-sm font-semibold text-text-primary">Stage 2 — Variant match attributes</p>
        {onEditVariantAttributes && (
          <button
            onClick={onEditVariantAttributes}
            className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 hover:underline shrink-0"
          >
            Edit variant attributes <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {usedStandardMargin ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-text-muted">
            {position.forcedStandardMargin
              ? 'Comparison analysis marked unavailable for this product, so pricing uses a standard margin on cost.'
              : 'No competitors were found to compare this product against, so pricing falls back to a standard margin on cost.'}
          </p>
          <div className="bg-warning-500/10 border border-warning-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-warning-600">Recommended position</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="warning" label="Standard Margin" />
                <span className="text-sm font-semibold text-text-primary">{money(position.recommendedPrice)}</span>
              </div>
            </div>
            <div className="text-right text-xs text-text-muted">
              <p>{Math.round(position.standardMarginPct * 100)}% margin on cost</p>
              {onEditStandardMargin && (
                <button
                  onClick={onEditStandardMargin}
                  className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 hover:underline mt-0.5"
                >
                  Edit standard margin <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : !hasData ? (
        <div className="bg-grey-50 rounded-xl border border-border px-4 py-6 text-center text-sm text-text-muted">
          No valid competitor matches found for this product yet.
        </div>
      ) : (
        <>
          <p className="text-xs text-text-muted mb-3">
            Comparing on {position.attributeResults.map(a => a.label).join(', ')} against{' '}
            {position.viable.map(m => m.competitor.name).join(', ')} — the competitors that cleared Stage 1. For each
            attribute: our value ÷ theirs, averaged across those competitors, gives that attribute's Diff %.
          </p>

          <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-brand-600">Recommended position</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={BAND_VARIANT[position.finalPosition.key]} label={position.finalPosition.label} />
                <span className="text-sm font-semibold text-text-primary">{money(position.recommendedPrice)}</span>
              </div>
            </div>
            <div className="text-right text-xs text-text-muted">
              <p>Competitor avg {money(position.competitorAvgPrice)}</p>
              <p>Our price {money(product.price)}</p>
              {margin != null && <p className="font-medium text-text-secondary">{Math.round(margin * 100)}% margin on cost</p>}
            </div>
          </div>
          <p className="text-xs text-text-muted -mt-2 mb-3">
            Priced from competitor analysis — the standard margin isn't used while this is active, so it can't be edited here.
          </p>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-border bg-grey-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Attribute</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Our Value</th>
                    {position.viable.map(m => (
                      <th key={m.competitor.id} className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">
                        {m.competitor.name}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Diff % (Avg.)</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Implied Position</th>
                  </tr>
                </thead>
                <tbody>
                  {position.attributeResults.map(a => (
                    <tr key={a.key} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 text-text-secondary whitespace-nowrap">{a.label}</td>
                      <td className="px-3 py-2.5 text-right text-text-primary font-medium whitespace-nowrap">
                        {a.ourValue ?? '—'}{a.ourValue != null ? a.unit : ''}
                      </td>
                      {position.viable.map(m => {
                        const v = m.variantResults.find(vr => vr.key === a.key)
                        return (
                          <td key={m.competitor.id} className="px-3 py-2.5 text-right whitespace-nowrap">
                            {v ? (
                              <>
                                <div className="text-brand-600 font-medium">{v.competitorValue}{v.unit}</div>
                                <div className="text-xs text-text-muted">{signed(v.diffPct)}</div>
                              </>
                            ) : '—'}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2.5 text-right font-medium text-text-primary whitespace-nowrap">{signed(a.avgDiffPct)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {a.band ? <Badge variant={BAND_VARIANT[a.band]} label={BAND_LABEL[a.band]} /> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-text-muted mt-3">
            Final position: <strong className="text-text-primary">{position.finalPosition.label}</strong> ({position.finalPosition.matchType}) —
            priority order is Mid → Upper-Mid → High → Low; the first of those that any attribute above lands on wins, even if
            another attribute alone would suggest a lower position.
          </p>
        </>
      )}
    </section>
  )
}

function CoreMatchSection({ position }) {
  return (
    <section>
      <p className="text-sm font-semibold text-text-primary mb-2">Stage 1 — Core product match, by competitor</p>
      <div className="flex flex-col gap-3">
        {position?.matches?.length ? position.matches.map(m => (
          <div key={m.competitor.id} className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">{m.competitor.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-secondary">{m.accuracy}% accuracy</span>
                <Badge variant={m.corePass ? 'success' : 'error'} label={m.corePass ? 'Valid match' : 'Below 80% — excluded'} />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {m.coreChecks.map(c => (
                <span key={c.key} className={`inline-flex items-center gap-1 text-xs ${c.score >= 80 ? 'text-success-600' : c.score >= 50 ? 'text-warning-600' : 'text-error-500'}`}>
                  {c.score >= 80 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {c.label}: {c.score}%
                </span>
              ))}
            </div>
          </div>
        )) : (
          <div className="bg-grey-50 rounded-xl border border-border px-4 py-6 text-center text-sm text-text-muted">
            No competitors are configured to scrape this product's category.
          </div>
        )}
      </div>
    </section>
  )
}

// Stage 1 + Stage 2 comparison analysis results, shared between the
// Competitor Pricing Overview drawer and the Product "Pricing" tab so both
// show identical results for the same product.
export function CompetitorMatchAnalysis({ product, position, cost, onEditVariantAttributes, onEditStandardMargin }) {
  return (
    <div className="flex flex-col gap-6">
      <VariantMatchSection
        product={product}
        position={position}
        cost={cost}
        onEditVariantAttributes={onEditVariantAttributes}
        onEditStandardMargin={onEditStandardMargin}
      />
      <CoreMatchSection position={position} />
    </div>
  )
}
