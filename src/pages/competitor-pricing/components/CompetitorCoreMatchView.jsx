import { useMemo } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { CSVExport } from '../../../components/ui/CSVExport'
import { buildCompetitorCoreMatches, CORE_MATCH_THRESHOLD } from '../../../data/mockMatching'

function scoreVariant(score) {
  if (score >= 80) return 'success'
  if (score >= 50) return 'warning'
  return 'error'
}

function coreChecksToText(checks) {
  return checks.map(c => `${c.label}: ${c.ourValue}${c.unit ?? ''} vs ${c.competitorValue}${c.unit ?? ''} (${c.score}%)`).join('; ')
}

function signed(v, suffix = '%') {
  return v == null ? '—' : `${v > 0 ? '+' : ''}${v}${suffix}`
}

const CSV_COLS = [
  { key: 'productName', label: 'Our Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Category' },
  { key: 'competitorTitle', label: 'Their Listing' },
  { key: 'coreChecksText', label: 'Core Product Match Attributes' },
  { key: 'accuracy', label: 'Accuracy %' },
  { key: 'corePass', label: 'Stage 2 Eligible', csvValue: r => (r.corePass ? 'Yes' : 'No') },
]

// One category's rows share the exact same set of core match attributes
// (however many that category has configured — it varies per category, see
// Spec Matching), so each category gets its own table with real attribute
// columns — Ours / Theirs side by side under each attribute's header —
// instead of a generic table that can't hold matching columns once a
// competitor spans more than one category.
function CategoryMatchTable({ category, rows }) {
  const attributes = rows[0]?.coreChecks.map(c => ({ key: c.key, label: c.label, unit: c.unit })) ?? []

  return (
    <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-grey-50 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">{category}</p>
        <span className="text-xs text-text-muted">{rows.length} product{rows.length === 1 ? '' : 's'}</span>
      </div>

      {attributes.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-text-muted">
          No core match attributes configured for this category yet — set some on the Spec Matching tab.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-50">
                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide align-bottom whitespace-nowrap">Our Product</th>
                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide align-bottom whitespace-nowrap">Their Listing</th>
                {attributes.map(a => (
                  <th key={a.key} colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-text-muted uppercase tracking-wide border-l border-border whitespace-nowrap">
                    {a.label}{a.unit ? ` (${a.unit})` : ''}
                  </th>
                ))}
                <th rowSpan={2} className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide align-bottom whitespace-nowrap">Accuracy</th>
                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide align-bottom whitespace-nowrap">Stage 2 Eligibility</th>
              </tr>
              <tr className="border-b border-border bg-grey-50">
                {attributes.flatMap(a => [
                  <th key={`${a.key}-ours`} className="px-3 py-1.5 text-right text-[11px] font-medium text-text-muted border-l border-border whitespace-nowrap">Ours</th>,
                  <th key={`${a.key}-theirs`} className="px-3 py-1.5 text-right text-[11px] font-medium text-text-muted whitespace-nowrap">Theirs</th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <p className="font-medium text-text-primary">{row.productName}</p>
                    <p className="text-xs text-text-muted">{row.sku}</p>
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary whitespace-nowrap">{row.competitorTitle}</td>
                  {row.coreChecks.flatMap(c => [
                    <td key={`${c.key}-ours`} className="px-3 py-2.5 text-right text-text-primary border-l border-border whitespace-nowrap">
                      {c.ourValue}{c.unit ?? ''}
                    </td>,
                    <td key={`${c.key}-theirs`} className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-text-primary">{c.competitorValue}{c.unit ?? ''}</span>
                        <Badge variant={scoreVariant(c.score)} label={`${c.score}%`} />
                      </div>
                    </td>,
                  ])}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <span className="text-base font-semibold text-text-primary">{row.accuracy}%</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Badge variant={row.corePass ? 'success' : 'error'} label={row.corePass ? 'Valid — proceeds to Stage 2' : 'Invalid — excluded'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Stage 2, for a single competitor: only products that cleared Stage 1
// against this competitor have variant results. There's no "Implied
// Position" column here — that only means something once averaged across
// every viable competitor for a product (see the product-level view), not
// from one competitor's numbers alone.
function VariantMatchTable({ category, rows }) {
  const viableRows = rows.filter(r => r.corePass)
  const attributes = viableRows[0]?.variantResults.map(v => ({ key: v.key, label: v.label, unit: v.unit })) ?? []

  return (
    <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-grey-50 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">{category}</p>
        <span className="text-xs text-text-muted">{viableRows.length} viable product{viableRows.length === 1 ? '' : 's'}</span>
      </div>

      {viableRows.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-text-muted">
          No products in this category cleared Stage 1 against this competitor.
        </div>
      ) : attributes.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-text-muted">
          No variant match attributes configured for this category yet — set some on the Spec Matching tab.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-50">
                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide align-bottom whitespace-nowrap">Our Product</th>
                {attributes.map(a => (
                  <th key={a.key} colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-text-muted uppercase tracking-wide border-l border-border whitespace-nowrap">
                    {a.label}{a.unit ? ` (${a.unit.trim()})` : ''}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-border bg-grey-50">
                {attributes.flatMap(a => [
                  <th key={`${a.key}-ours`} className="px-3 py-1.5 text-right text-[11px] font-medium text-text-muted border-l border-border whitespace-nowrap">Ours</th>,
                  <th key={`${a.key}-theirs`} className="px-3 py-1.5 text-right text-[11px] font-medium text-text-muted whitespace-nowrap">Theirs (Diff)</th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {viableRows.map(row => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <p className="font-medium text-text-primary">{row.productName}</p>
                    <p className="text-xs text-text-muted">{row.sku}</p>
                  </td>
                  {row.variantResults.flatMap(v => [
                    <td key={`${v.key}-ours`} className="px-3 py-2.5 text-right text-text-primary border-l border-border whitespace-nowrap">
                      {v.ourValue ?? '—'}{v.ourValue != null ? v.unit : ''}
                    </td>,
                    <td key={`${v.key}-theirs`} className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="text-brand-600 font-medium">{v.competitorValue ?? '—'}{v.competitorValue != null ? v.unit : ''}</div>
                      <div className="text-xs text-text-muted">{signed(v.diffPct)}</div>
                    </td>,
                  ])}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function CompetitorCoreMatchView({ competitor, positions, onBack, onEditCoreAttributes, onEditVariantAttributes }) {
  const rows = useMemo(() => {
    return buildCompetitorCoreMatches(competitor, positions).map(({ product, match }) => ({
      id: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      competitorTitle: match.competitorTitle,
      coreChecks: match.coreChecks,
      coreChecksText: coreChecksToText(match.coreChecks),
      accuracy: match.accuracy,
      corePass: match.corePass,
      variantResults: match.variantResults,
    }))
  }, [competitor, positions])

  const groups = useMemo(() => {
    const map = new Map()
    rows.forEach(r => {
      if (!map.has(r.category)) map.set(r.category, [])
      map.get(r.category).push(r)
    })
    return [...map.entries()]
  }, [rows])

  const validCount = rows.filter(r => r.corePass).length
  const avgAccuracy = rows.length ? Math.round(rows.reduce((a, r) => a + r.accuracy, 0) / rows.length) : 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={onBack}>
          Back to Competitors
        </Button>
        <CSVExport data={rows} columns={CSV_COLS} filename={`${competitor.name}-core-match`} />
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{competitor.name}</h2>
          <a
            href={competitor.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600 hover:underline"
          >
            {competitor.baseUrl.replace(/^https?:\/\//, '')}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-xs text-text-muted">Products attempted</p>
            <p className="font-semibold text-text-primary">{rows.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Valid (&gt;{CORE_MATCH_THRESHOLD}%)</p>
            <p className="font-semibold text-success-600">{validCount} / {rows.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Avg. accuracy</p>
            <p className="font-semibold text-text-primary">{avgAccuracy}%</p>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-grey-50 rounded-xl border border-border px-4 py-8 text-center text-sm text-text-muted">
          No products from our catalog fall under this competitor's configured categories.
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">Stage 1 — Core product match</p>
                {onEditCoreAttributes && (
                  <button
                    onClick={onEditCoreAttributes}
                    className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 hover:underline shrink-0"
                  >
                    Edit match attributes <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm text-brand-700 mt-2">
                Each category's configured core match attributes (set on the Spec Matching tab) are compared against this
                competitor's listing; a product must score over <strong>{CORE_MATCH_THRESHOLD}%</strong> average accuracy to
                be considered a valid comparison and proceed to Stage 2.
              </div>
            </div>
            {groups.map(([category, groupRows]) => (
              <CategoryMatchTable key={category} category={category} rows={groupRows} />
            ))}
          </section>

          <section className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between gap-3">
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
              <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm text-brand-700 mt-2">
                Only products that cleared Stage 1 against this competitor are shown. There's no Implied Position column
                here — that only means something once diffs are averaged across every viable competitor for a product, not
                from one competitor's numbers alone. Open a product from the Overview tab for its full price-positioning
                breakdown.
              </div>
            </div>
            {groups.map(([category, groupRows]) => (
              <VariantMatchTable key={category} category={category} rows={groupRows} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}
