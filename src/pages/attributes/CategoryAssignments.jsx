import { useState } from 'react'
import { Tag, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { CATEGORIES } from '../../data/mockProducts'

// Selected attribute's categories as toggleable chips, plus Select All /
// Clear All for that one attribute.
function AttributeCategoryDetail({ attr, updateAttribute }) {
  const assignedSet = new Set(attr.categories)
  const allAssigned = CATEGORIES.every(c => assignedSet.has(c))

  const toggle = (cat) => {
    updateAttribute(attr.id, {
      categories: assignedSet.has(cat) ? attr.categories.filter(c => c !== cat) : [...attr.categories, cat],
    })
  }

  return (
    <div className="flex-1 bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-text-primary">{attr.name}</h3>
            <span className="text-xs font-medium text-text-muted bg-grey-100 px-2 py-0.5 rounded-full">
              {attr.categories.length} / {CATEGORIES.length} categories
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">Click a category to assign or unassign it from this attribute.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" disabled={allAssigned} onClick={() => updateAttribute(attr.id, { categories: [...CATEGORIES] })}>
            Select All
          </Button>
          <Button variant="secondary" size="sm" disabled={attr.categories.length === 0} onClick={() => updateAttribute(attr.id, { categories: [] })}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const assigned = assignedSet.has(cat)
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                assigned
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-surface border-border text-text-secondary hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {assigned && <Check className="w-3.5 h-3.5" />}
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Master-detail: pick an attribute on the left, toggle its categories as
// chips on the right. Feeds Spec Matching's per-category attribute pools
// directly: assign an attribute to a category here and it's immediately
// eligible to pick as a Stage 1/2 match attribute for that category.
export function CategoryAssignments({ attributes, updateAttribute }) {
  const [selectedId, setSelectedId] = useState(() => attributes[0]?.id ?? null)
  const selected = attributes.find(a => a.id === selectedId)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Which product categories each attribute is available on. This drives what shows up in each category's pool on
        the Spec Matching view — assign an attribute to a category to make it selectable there.
      </p>

      <div className="flex gap-4">
        <div className="w-56 bg-surface rounded-xl border border-border shadow-card overflow-y-auto shrink-0">
          <p className="px-4 py-3 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">Attribute Types</p>
          {attributes.map(a => (
            <div
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`flex items-center gap-2.5 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-grey-50 transition-colors ${selectedId === a.id ? 'bg-brand-50' : ''}`}
            >
              <Tag className={`w-3.5 h-3.5 shrink-0 ${selectedId === a.id ? 'text-brand-500' : 'text-text-muted'}`} />
              <span className={`flex-1 text-sm font-medium ${selectedId === a.id ? 'text-brand-600' : 'text-text-primary'}`}>{a.name}</span>
              <span className="text-xs text-text-muted">{a.categories.length}</span>
            </div>
          ))}
          {attributes.length === 0 && (
            <p className="px-4 py-6 text-sm text-text-muted text-center">No attributes yet.</p>
          )}
        </div>

        {selected ? (
          <AttributeCategoryDetail attr={selected} updateAttribute={updateAttribute} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">Select an attribute type to manage its categories.</div>
        )}
      </div>
    </div>
  )
}
