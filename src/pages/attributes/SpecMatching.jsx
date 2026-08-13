import { RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { useAttributes } from '../../context/AttributesContext'
import {
  categoryAttributePool, DEFAULT_CORE_ATTRIBUTE_SELECTION, DEFAULT_VARIANT_ATTRIBUTE_SELECTION, CORE_MATCH_THRESHOLD,
} from '../../data/mockMatching'
import { CATEGORIES } from '../../data/mockProducts'

function AttributePicker({ attributes, selection, setSelection, poolFilter, defaults, resetLabel }) {
  const toggle = (category, id) => {
    setSelection(prev => {
      const current = prev[category] || []
      return {
        ...prev,
        [category]: current.includes(id) ? current.filter(k => k !== id) : [...current, id],
      }
    })
  }

  const handleReset = () => {
    setSelection(Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, [...v]])))
    toast(`${resetLabel} reset to defaults`, 'info')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(cat => {
          const pool = categoryAttributePool(attributes, cat).filter(poolFilter)
          // Self-heals against stale ids (e.g. an attribute deleted elsewhere
          // in the CMS) instead of trusting the raw selection array.
          const selected = (selection[cat] || []).filter(id => pool.some(a => a.id === id))
          return (
            <div key={cat} className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">{cat}</p>
                <Badge variant={selected.length > 0 ? 'info' : 'grey'} label={`${selected.length} selected`} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pool.length === 0 && (
                  <span className="text-xs text-text-muted italic">No eligible attributes for this category — add one via Attribute Values, or assign one to this category on Category Assignments.</span>
                )}
                {pool.map(attr => {
                  const isSelected = selected.includes(attr.id)
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => toggle(cat, attr.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-surface border-border text-text-secondary hover:bg-grey-50'
                      }`}
                    >
                      {attr.name}{attr.unit ? ` (${attr.unit.trim()})` : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Stage 1 — which attributes the competitor-matching bot scrapes and
// compares to confirm a competitor listing is genuinely the same product
// (any attribute type, however many a category genuinely needs — varies
// by category, from a couple up to several).
export function CoreMatchAttributes({ coreSelection, setCoreSelection }) {
  const { attributes } = useAttributes()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">
        Every category has a pool of attributes that can be found on that kind of product — the same shared list
        managed on Attribute Values, scoped per category on Category Assignments. Pick however many of those attributes
        genuinely identify "the same product" for Stage 1 core matching (must score over {CORE_MATCH_THRESHOLD}% average
        accuracy to proceed to Stage 2) — this varies by category, from a couple of attributes up to several.
      </p>
      <AttributePicker
        attributes={attributes}
        selection={coreSelection}
        setSelection={setCoreSelection}
        poolFilter={() => true}
        defaults={DEFAULT_CORE_ATTRIBUTE_SELECTION}
        resetLabel="Core match attribute selection"
      />
    </div>
  )
}

// Stage 2 — for products that clear Stage 1, which numeric attributes to
// compare "who has better features" on. Some categories have none at all —
// those price off Stage 1 pass/fail and the standard margin instead.
export function VariantMatchAttributes({ variantSelection, setVariantSelection }) {
  const { attributes } = useAttributes()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">
        For products that clear Stage 1, pick numeric attributes per category to compare who has better features —
        these drive each attribute's Diff % and, ultimately, the price position (Mid/Upper-Mid/High/Low). Only numeric
        attributes are eligible here since a differential needs a value, not a label. Some categories have no variant
        match attributes at all — those price off Stage 1 pass/fail and the standard margin instead.
      </p>
      <AttributePicker
        attributes={attributes}
        selection={variantSelection}
        setSelection={setVariantSelection}
        poolFilter={attr => attr.type === 'numeric'}
        defaults={DEFAULT_VARIANT_ATTRIBUTE_SELECTION}
        resetLabel="Variant match attribute selection"
      />
    </div>
  )
}
