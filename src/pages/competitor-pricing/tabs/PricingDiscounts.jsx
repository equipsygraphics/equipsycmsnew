import { Fragment, useMemo, useState } from 'react'
import { RotateCcw, ChevronRight, Pencil, Undo2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { toast } from '../../../components/ui/Toast'
import { useDiscountSettings } from '../../../context/DiscountSettingsContext'
import { useTradeVolumePricing } from '../../../context/TradeVolumePricingContext'
import { DEFAULT_CATEGORY_DISCOUNTS } from '../../../data/mockDiscountSettings'
import { DEFAULT_UNITS_PER_BOX } from '../../../data/mockTradeVolumePricing'
import { mockProducts, CATEGORIES } from '../../../data/mockProducts'

// Colour-banded header groups, same visual language as the Price List tab —
// Standard-ladder discounts in blue, the box-multiple Trade Volume tiers in
// purple, with each column inside a band getting its own shade so e.g. a 2
// vs 5 box tier stays distinguishable at a glance.
const BAND_STANDARD = { key: 'standard', label: 'Standard Pricing', className: 'bg-sky-500' }
const BAND_VOLUME = { key: 'volume', label: 'Trade Volume Pricing (per Box)', className: 'bg-purple-600' }
const NUM_COL_WIDTH = 76

// Column order mirrors the pricing ladder itself: Trade, then Bulk Quantity
// (the base "how many per box"), then Bulk / Bulk Trade / MAM discount,
// then the 2/3/4/5 Box tiers built off that base quantity. Each 'boxQty'
// column is *computed* (Bulk Quantity x N) rather than its own stored value
// — only its paired 'discount' column (box2-5Discount) is actually set.
const COLUMN_DEFS = [
  { kind: 'discount', key: 'tradeDiscount', label: 'Trade Discount', band: BAND_STANDARD, tint: 'bg-sky-100', width: NUM_COL_WIDTH },
  { kind: 'bulkQty', label: 'Bulk Quantity', band: BAND_STANDARD, tint: 'bg-sky-50', width: 84 },
  { kind: 'discount', key: 'bulkDiscount', label: 'Bulk Discount', band: BAND_STANDARD, tint: 'bg-sky-100', width: NUM_COL_WIDTH },
  { kind: 'discount', key: 'bulkTradeDiscount', label: 'Bulk Trade Discount', band: BAND_STANDARD, tint: 'bg-sky-50', width: NUM_COL_WIDTH },
  { kind: 'discount', key: 'mamDiscount', label: 'MAM Discount', band: BAND_STANDARD, tint: 'bg-sky-100', width: NUM_COL_WIDTH },
  { kind: 'boxQty', multiplier: 2, label: '2 Box Quantity', band: BAND_VOLUME, tint: 'bg-purple-50', width: NUM_COL_WIDTH },
  { kind: 'discount', key: 'box2Discount', label: '2 Box Discount', band: BAND_VOLUME, tint: 'bg-purple-50', width: NUM_COL_WIDTH },
  { kind: 'boxQty', multiplier: 3, label: '3 Box Quantity', band: BAND_VOLUME, tint: 'bg-purple-100', width: NUM_COL_WIDTH },
  { kind: 'discount', key: 'box3Discount', label: '3 Box Discount', band: BAND_VOLUME, tint: 'bg-purple-100', width: NUM_COL_WIDTH },
  { kind: 'boxQty', multiplier: 4, label: '4 Box Quantity', band: BAND_VOLUME, tint: 'bg-purple-200 text-grey-700!', width: NUM_COL_WIDTH },
  { kind: 'discount', key: 'box4Discount', label: '4 Box Discount', band: BAND_VOLUME, tint: 'bg-purple-200 text-grey-700!', width: NUM_COL_WIDTH },
  { kind: 'boxQty', multiplier: 5, label: '5 Box Quantity', band: BAND_VOLUME, tint: 'bg-purple-300 text-grey-900!', width: NUM_COL_WIDTH },
  { kind: 'discount', key: 'box5Discount', label: '5 Box Discount', band: BAND_VOLUME, tint: 'bg-purple-300 text-grey-900!', width: NUM_COL_WIDTH },
]
const DISCOUNT_FIELDS = COLUMN_DEFS.filter(c => c.kind === 'discount')

// The expanded per-product panel has its own (wider) column widths — it
// needs room for an "Override" badge under each value that the compact
// category-row widths above aren't sized for.
function panelColWidth(col) {
  if (col.kind === 'boxQty') return 60
  if (col.kind === 'bulkQty') return 96
  return 92
}

// Merges consecutive columns that share the same band into one colSpan
// segment, so e.g. the Standard columns before the Trade Volume block
// render as a single blue header bar rather than several.
function computeBandSegments(columns) {
  const segments = []
  columns.forEach(col => {
    const last = segments[segments.length - 1]
    if (last && last.band?.key === col.band?.key) last.span += 1
    else segments.push({ band: col.band, span: 1 })
  })
  return segments
}

// Editable cells get a persistent white "field" look (border + shadow, not
// just on hover) so they read as inputs rather than plain text at a glance —
// important since they sit on top of the tinted band backgrounds below.
const EDITABLE_INPUT = 'bg-white text-sm text-right font-medium text-text-primary outline-none rounded-md px-1.5 py-1 border border-border shadow-sm hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors disabled:opacity-50 disabled:bg-grey-50 disabled:shadow-none'

// `onFocus` snapshots undo state once per edit *session* (when the field is
// entered), not per keystroke — so typing e.g. "25" is one Undo step, not
// two.
function PercentCell({ value, onChange, onFocus }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number"
        step="1"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        onFocus={onFocus}
        className={`w-11 ${EDITABLE_INPUT}`}
      />
      <span className="text-[10px] text-text-muted">%</span>
    </div>
  )
}

// Blank = no box tiers (ships as a single unit) — distinct from 0, which
// isn't a meaningful bulk-quantity value.
function UnitsPerBoxCell({ value, onChange, onFocus }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number"
        step="1"
        min="1"
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        onFocus={onFocus}
        placeholder="—"
        className={`w-12 ${EDITABLE_INPUT} placeholder:text-text-muted placeholder:font-normal`}
      />
      <span className="text-[10px] text-text-muted">pcs</span>
    </div>
  )
}

function BoxQtyCell({ bulkQty, multiplier }) {
  return <span className="text-text-secondary">{bulkQty == null ? '—' : bulkQty * multiplier}</span>
}

// A category's own row in the main table. Read-only until the single "Edit"
// button above the table turns editMode on — then every cell here becomes
// directly editable (a normal, single-value edit that updates the category
// default every product inherits) *and* a checkbox appears so several
// categories can be selected and bulk-applied at once via the toolbar above.
function CategoryRow({ cat, productCount, expanded, onToggleExpand, editMode, selected, onToggleSelect, discounts, bulkQty, setCategoryDiscount, setCategoryUnitsPerBox, onBeforeEdit }) {
  return (
    <tr className={`border-b border-border last:border-0 ${expanded ? 'bg-grey-50/60' : ''}`}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {editMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              onClick={e => e.stopPropagation()}
              className="w-4 h-4 shrink-0 accent-brand-500 cursor-pointer"
            />
          )}
          <button onClick={onToggleExpand} className="flex items-center gap-2 text-left flex-1 min-w-0 group">
            <ChevronRight className={`w-4 h-4 shrink-0 text-text-muted transition-transform group-hover:text-text-primary ${expanded ? 'rotate-90' : ''}`} />
            <span className="min-w-0">
              <span className="block font-medium text-text-primary truncate">{cat}</span>
              <span className="block text-xs text-text-muted">{productCount} product{productCount === 1 ? '' : 's'}</span>
            </span>
          </button>
        </div>
      </td>
      {COLUMN_DEFS.map(col => (
        <td key={col.label} className={`px-1.5 py-1 text-right ${col.tint}`}>
          {col.kind === 'discount' && (
            editMode
              ? <PercentCell value={discounts[col.key]} onChange={v => setCategoryDiscount(cat, col.key, v)} onFocus={onBeforeEdit} />
              : <span className="text-sm font-medium text-text-primary">{discounts[col.key]}%</span>
          )}
          {col.kind === 'bulkQty' && (
            editMode
              ? <UnitsPerBoxCell value={bulkQty} onChange={v => setCategoryUnitsPerBox(cat, v)} onFocus={onBeforeEdit} />
              : <span className="text-sm font-medium text-text-primary">{bulkQty ?? '—'}</span>
          )}
          {col.kind === 'boxQty' && <BoxQtyCell bulkQty={bulkQty} multiplier={col.multiplier} />}
        </td>
      ))}
    </tr>
  )
}

// Expanded contents of a category row — every product in that category. In
// edit mode each product's cells become directly editable too: changing one
// sets an override for *that product only* (the category default keeps
// applying to every other product in the category). Selection checkboxes
// here feed the single bulk-edit toolbar above the main table — there's no
// separate apply bar per category, selection state is shared/lifted so that
// toolbar can act on categories and products together.
function CategoryProductsPanel({ category, editMode, selectedProductIds, setSelectedProductIds, onBeforeEdit }) {
  const { getEffectiveDiscounts, setProductOverride } = useDiscountSettings()
  const { getEffectiveUnitsPerBox, setProductUnitsPerBoxOverride } = useTradeVolumePricing()

  const rows = useMemo(
    () => mockProducts.filter(p => p.subCategory === category).map(p => ({ product: p, discounts: getEffectiveDiscounts(p), unitsPerBox: getEffectiveUnitsPerBox(p) })),
    [category, getEffectiveDiscounts, getEffectiveUnitsPerBox]
  )

  const allSelected = rows.length > 0 && rows.every(r => selectedProductIds.has(r.product.id))

  const toggleAll = () => {
    setSelectedProductIds(prev => {
      const next = new Set(prev)
      rows.forEach(r => (allSelected ? next.delete(r.product.id) : next.add(r.product.id)))
      return next
    })
  }

  const toggleRow = (id) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (rows.length === 0) {
    return <div className="px-6 py-4 text-sm text-text-muted">No products in this category.</div>
  }

  return (
    <div className="px-4 py-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            {editMode && <col style={{ width: 36 }} />}
            <col style={{ width: 190 }} />
            {COLUMN_DEFS.map(col => <col key={col.label} style={{ width: panelColWidth(col) }} />)}
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {editMode && (
                <th className="px-2 py-2">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-brand-500 cursor-pointer" />
                </th>
              )}
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide">Product</th>
              {COLUMN_DEFS.map(col => (
                <th key={col.label} className={`px-1.5 py-2 text-right text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-normal leading-tight ${col.tint}`}>
                  {col.kind === 'discount' ? col.label.replace(' Discount', ' %') : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, discounts, unitsPerBox }) => (
              <tr key={product.id} className={`border-b border-border last:border-0 ${editMode && selectedProductIds.has(product.id) ? 'bg-brand-50/40' : ''}`}>
                {editMode && (
                  <td className="px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(product.id)}
                      onChange={() => toggleRow(product.id)}
                      className="w-4 h-4 accent-brand-500 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <p className="font-medium text-text-primary truncate">{product.name}</p>
                  <p className="text-xs text-text-muted">{product.sku}</p>
                </td>
                {COLUMN_DEFS.map(col => (
                  <td key={col.label} className={`px-1.5 py-1.5 text-right ${col.tint}`}>
                    {col.kind === 'discount' && (
                      <div className="flex flex-col items-end gap-0.5">
                        {editMode
                          ? <PercentCell value={discounts[col.key]} onChange={v => setProductOverride(product.id, col.key, v)} onFocus={onBeforeEdit} />
                          : <span className="text-text-primary font-medium">{discounts[col.key]}%</span>}
                        {discounts.isOverridden[col.key] && <Badge variant="info" label="Override" />}
                      </div>
                    )}
                    {col.kind === 'bulkQty' && (
                      <div className="flex flex-col items-end gap-0.5">
                        {editMode
                          ? <UnitsPerBoxCell value={unitsPerBox.value} onChange={v => setProductUnitsPerBoxOverride(product.id, v)} onFocus={onBeforeEdit} />
                          : <span className="text-text-primary font-medium">{unitsPerBox.value ?? '—'}</span>}
                        {unitsPerBox.isOverridden && <Badge variant="info" label="Override" />}
                      </div>
                    )}
                    {col.kind === 'boxQty' && <BoxQtyCell bulkQty={unitsPerBox.value} multiplier={col.multiplier} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Trade / Bulk / Trade Volume (2-5 box) / Bulk Trade / MAM discount % plus
// Bulk Quantity, set at the category level — one merged view: category rows
// (read-only until the single "Edit" button above unlocks selection + a
// bulk-apply toolbar), each expandable to see every product's resolved
// values. Lives as a tab on Product Pricing (rather than its own sidebar
// page) since it's just another lever on the same pricing ladder that page
// already shows.
const UNDO_STACK_LIMIT = 20

export function PricingDiscounts() {
  const {
    categoryDiscounts, setCategoryDiscount, productOverrides, bulkApply, bulkClear,
    restoreCategoryDiscounts, restoreProductOverrides,
  } = useDiscountSettings()
  const {
    categoryUnitsPerBox, setCategoryUnitsPerBox, productUnitsPerBoxOverrides,
    setProductUnitsPerBoxOverride, clearProductUnitsPerBoxOverride,
    restoreCategoryUnitsPerBox, restoreProductUnitsPerBoxOverrides,
  } = useTradeVolumePricing()
  const [expandedCategories, setExpandedCategories] = useState(() => new Set())
  const [editMode, setEditMode] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState(() => new Set())
  const [selectedProductIds, setSelectedProductIds] = useState(() => new Set())
  const [applyValues, setApplyValues] = useState(() => Object.fromEntries(DISCOUNT_FIELDS.map(f => [f.key, ''])))
  const [applyUnitsPerBox, setApplyUnitsPerBox] = useState('')
  const [undoStack, setUndoStack] = useState([])
  const bandSegments = useMemo(() => computeBandSegments(COLUMN_DEFS), [])
  const totalSelected = selectedCategories.size + selectedProductIds.size

  // Snapshot every mutable pricing slice right before a change so it can be
  // put back exactly as it was. Called ahead of every edit — the global
  // reset, bulk apply/clear, and each individual direct cell edit — so one
  // Undo always reverts whatever just happened, whichever of those it was.
  const pushUndoSnapshot = () => {
    setUndoStack(prev => [
      ...prev.slice(-(UNDO_STACK_LIMIT - 1)),
      { categoryDiscounts, productOverrides, categoryUnitsPerBox, productUnitsPerBoxOverrides },
    ])
  }

  const handleUndo = () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      restoreCategoryDiscounts(last.categoryDiscounts)
      restoreProductOverrides(last.productOverrides)
      restoreCategoryUnitsPerBox(last.categoryUnitsPerBox)
      restoreProductUnitsPerBoxOverrides(last.productUnitsPerBoxOverrides)
      return prev.slice(0, -1)
    })
    toast('Last change undone', 'info')
  }

  const toggleExpand = (cat) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const toggleEditMode = () => {
    setEditMode(prev => !prev)
    setSelectedCategories(new Set())
    setSelectedProductIds(new Set())
    setApplyValues(Object.fromEntries(DISCOUNT_FIELDS.map(f => [f.key, ''])))
    setApplyUnitsPerBox('')
  }

  const toggleSelectCategory = (cat) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const allSelected = selectedCategories.size === CATEGORIES.length
  const toggleSelectAll = () => setSelectedCategories(allSelected ? new Set() : new Set(CATEGORIES))

  const handleReset = () => {
    pushUndoSnapshot()
    CATEGORIES.forEach(cat => {
      DISCOUNT_FIELDS.forEach(({ key }) => setCategoryDiscount(cat, key, DEFAULT_CATEGORY_DISCOUNTS[cat][key]))
      setCategoryUnitsPerBox(cat, DEFAULT_UNITS_PER_BOX[cat] ?? null)
    })
    toast('Category discount defaults reset', 'info')
  }

  // Applies to whatever's selected, categories and/or individual products
  // together — a category gets its default changed (cascading to every
  // product that isn't itself overridden), a product gets a direct override
  // that leaves its category default untouched for everyone else.
  const handleApply = () => {
    const patch = DISCOUNT_FIELDS.filter(({ key }) => applyValues[key] !== '')
    const hasUnitsPerBox = applyUnitsPerBox !== ''
    if ((patch.length === 0 && !hasUnitsPerBox) || totalSelected === 0) return
    pushUndoSnapshot()
    selectedCategories.forEach(cat => {
      patch.forEach(({ key }) => setCategoryDiscount(cat, key, Number(applyValues[key])))
      if (hasUnitsPerBox) setCategoryUnitsPerBox(cat, Number(applyUnitsPerBox))
    })
    if (selectedProductIds.size > 0) {
      if (patch.length > 0) {
        const discountPatch = {}
        patch.forEach(({ key }) => { discountPatch[key] = Number(applyValues[key]) })
        bulkApply([...selectedProductIds], discountPatch)
      }
      if (hasUnitsPerBox) {
        selectedProductIds.forEach(id => setProductUnitsPerBoxOverride(id, Number(applyUnitsPerBox)))
      }
    }
    toast(`Applied to ${totalSelected} item${totalSelected === 1 ? '' : 's'}`, 'success')
    setApplyValues(Object.fromEntries(DISCOUNT_FIELDS.map(f => [f.key, ''])))
    setApplyUnitsPerBox('')
  }

  const handleClearSelected = () => {
    if (totalSelected === 0) return
    pushUndoSnapshot()
    selectedCategories.forEach(cat => {
      DISCOUNT_FIELDS.forEach(({ key }) => setCategoryDiscount(cat, key, DEFAULT_CATEGORY_DISCOUNTS[cat][key]))
      setCategoryUnitsPerBox(cat, DEFAULT_UNITS_PER_BOX[cat] ?? null)
    })
    if (selectedProductIds.size > 0) {
      bulkClear([...selectedProductIds])
      selectedProductIds.forEach(id => clearProductUnitsPerBoxOverride(id))
    }
    toast(`Reset ${totalSelected} item${totalSelected === 1 ? '' : 's'} to default`, 'success')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Every product inherits its Trade / Bulk / Trade Volume (2-5 Box) / Bulk Trade / MAM discount, plus its Bulk
          Quantity (units per box — also the base the 2/3/4/5 Box Quantity columns multiply from), from its category by
          default. Click Edit to change a category's defaults directly — every product in it updates too, unless
          expanding that category shows a product has its own override, which changes only that product. Select
          categories and/or individual products with their checkboxes and use the toolbar above the table to
          bulk-apply a value across all of them at once.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={editMode ? 'primary' : 'secondary'}
            size="sm"
            icon={<Pencil className="w-3.5 h-3.5" />}
            onClick={toggleEditMode}
          >
            {editMode ? 'Done Editing' : 'Edit'}
          </Button>
          <Button variant="ghost" size="sm" icon={<Undo2 className="w-3.5 h-3.5" />} disabled={undoStack.length === 0} onClick={handleUndo}>
            Undo
          </Button>
          <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </div>

      {editMode && (
        <div className="flex flex-wrap items-end gap-3 bg-surface rounded-lg border border-border p-3">
          <div className="text-sm text-text-secondary shrink-0">
            <span className="font-semibold text-text-primary">{totalSelected}</span> selected
            {selectedCategories.size > 0 && selectedProductIds.size > 0 && (
              <span className="text-xs text-text-muted">
                {' '}({selectedCategories.size} categor{selectedCategories.size === 1 ? 'y' : 'ies'}, {selectedProductIds.size} product{selectedProductIds.size === 1 ? '' : 's'})
              </span>
            )}
          </div>
          {DISCOUNT_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">{label} (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={applyValues[key]}
                onChange={e => setApplyValues(v => ({ ...v, [key]: e.target.value }))}
                placeholder="No change"
                className="w-24 h-8 px-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-muted">Bulk Quantity</label>
            <input
              type="number"
              step="1"
              min="1"
              value={applyUnitsPerBox}
              onChange={e => setApplyUnitsPerBox(e.target.value)}
              placeholder="No change"
              className="w-24 h-8 px-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button variant="primary" size="sm" disabled={totalSelected === 0} onClick={handleApply}>
            Apply to Selected
          </Button>
          <Button variant="secondary" size="sm" disabled={totalSelected === 0} onClick={handleClearSelected}>
            Reset Selected to Default
          </Button>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: 150 }} />
            {COLUMN_DEFS.map(col => <col key={col.label} style={{ width: col.width }} />)}
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide align-bottom border-b border-border bg-grey-50">
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-brand-500 cursor-pointer" />
                    Category
                  </div>
                ) : 'Category'}
              </th>
              {bandSegments.map((seg, i) => (
                <th
                  key={i}
                  colSpan={seg.span}
                  className={`px-2 py-1 text-center text-[10px] font-semibold text-white uppercase tracking-wide ${seg.band.className}`}
                >
                  {seg.band.label}
                </th>
              ))}
            </tr>
            <tr className="border-b border-border">
              {COLUMN_DEFS.map(col => (
                <th
                  key={col.label}
                  style={{ width: col.width }}
                  className={`px-1.5 py-2 text-right text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-normal leading-tight ${col.tint}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => {
              const productCount = mockProducts.filter(p => p.subCategory === cat).length
              const expanded = expandedCategories.has(cat)
              return (
                <Fragment key={cat}>
                  <CategoryRow
                    cat={cat}
                    productCount={productCount}
                    expanded={expanded}
                    onToggleExpand={() => toggleExpand(cat)}
                    editMode={editMode}
                    selected={selectedCategories.has(cat)}
                    onToggleSelect={() => toggleSelectCategory(cat)}
                    discounts={categoryDiscounts[cat]}
                    bulkQty={categoryUnitsPerBox[cat]}
                    setCategoryDiscount={setCategoryDiscount}
                    setCategoryUnitsPerBox={setCategoryUnitsPerBox}
                    onBeforeEdit={pushUndoSnapshot}
                  />
                  {expanded && (
                    <tr className="border-b border-border last:border-0">
                      <td colSpan={COLUMN_DEFS.length + 1} className="p-0 bg-grey-50/60">
                        <CategoryProductsPanel
                          category={cat}
                          editMode={editMode}
                          selectedProductIds={selectedProductIds}
                          setSelectedProductIds={setSelectedProductIds}
                          onBeforeEdit={pushUndoSnapshot}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
