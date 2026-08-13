import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Select } from '../../../components/ui/FormField'
import { toast } from '../../../components/ui/Toast'
import { useDiscountSettings } from '../../../context/DiscountSettingsContext'
import { DEFAULT_CATEGORY_DISCOUNTS } from '../../../data/mockDiscountSettings'
import { mockProducts, CATEGORIES } from '../../../data/mockProducts'

const VIEWS = ['Category Defaults', 'Bulk Edit Products']
const FIELDS = [
  { key: 'tradeDiscount', label: 'Trade Discount' },
  { key: 'bulkDiscount', label: 'Bulk Discount' },
  { key: 'bulkTradeDiscount', label: 'Bulk Trade Discount' },
  { key: 'mamDiscount', label: 'MAM Discount' },
]

function PercentCell({ value, onChange, disabled }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number"
        step="1"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        disabled={disabled}
        className="w-16 bg-transparent text-sm text-right font-medium text-text-primary outline-none rounded-md px-2 py-1.5 border border-transparent hover:border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors disabled:opacity-50"
      />
      <span className="text-xs text-text-muted">%</span>
    </div>
  )
}

function CategoryDefaultsView() {
  const { categoryDiscounts, setCategoryDiscount } = useDiscountSettings()

  const handleReset = () => {
    CATEGORIES.forEach(cat => {
      FIELDS.forEach(({ key }) => setCategoryDiscount(cat, key, DEFAULT_CATEGORY_DISCOUNTS[cat][key]))
    })
    toast('Category discount defaults reset', 'info')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Every product inherits its Trade / Bulk / Bulk Trade / MAM discount from its category by default. Change a
          category's rate here to update every product in it that hasn't been individually overridden.
        </p>
        <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              <th className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Category</th>
              {FIELDS.map(({ key, label }) => (
                <th key={key} className="px-3 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{label}</th>
              ))}
              <th className="px-3 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Products</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => {
              const discounts = categoryDiscounts[cat]
              const productCount = mockProducts.filter(p => p.category === cat).length
              return (
                <tr key={cat} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 font-medium text-text-primary whitespace-nowrap">{cat}</td>
                  {FIELDS.map(({ key }) => (
                    <td key={key} className="py-1">
                      <PercentCell value={discounts[key]} onChange={v => setCategoryDiscount(cat, key, v)} />
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right text-text-muted whitespace-nowrap">{productCount}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BulkEditView() {
  const { getEffectiveDiscounts, bulkApply, bulkClear } = useDiscountSettings()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [applyValues, setApplyValues] = useState({ tradeDiscount: '', bulkDiscount: '', bulkTradeDiscount: '', mamDiscount: '' })

  const rows = useMemo(() => {
    const filtered = categoryFilter === 'all' ? mockProducts : mockProducts.filter(p => p.category === categoryFilter)
    return filtered.map(p => ({ product: p, discounts: getEffectiveDiscounts(p) }))
  }, [categoryFilter, getEffectiveDiscounts])

  const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.product.id))

  const toggleAll = () => {
    setSelectedIds(prev => {
      if (allSelected) return new Set([...prev].filter(id => !rows.some(r => r.product.id === id)))
      const next = new Set(prev)
      rows.forEach(r => next.add(r.product.id))
      return next
    })
  }

  const toggleRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleApply = () => {
    const patch = {}
    FIELDS.forEach(({ key }) => {
      if (applyValues[key] !== '') patch[key] = Number(applyValues[key])
    })
    if (Object.keys(patch).length === 0 || selectedIds.size === 0) return
    bulkApply([...selectedIds], patch)
    toast(`Applied to ${selectedIds.size} product${selectedIds.size === 1 ? '' : 's'}`, 'success')
    setApplyValues({ tradeDiscount: '', bulkDiscount: '', bulkTradeDiscount: '', mamDiscount: '' })
  }

  const handleClear = () => {
    if (selectedIds.size === 0) return
    bulkClear([...selectedIds])
    toast(`Reset ${selectedIds.size} product${selectedIds.size === 1 ? '' : 's'} to category default`, 'success')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Select products (optionally filter by category first) to change their Trade / Bulk / Bulk Trade / MAM discount
          all at once, or reset them back to their category's default.
        </p>
        <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-48">
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4 flex flex-wrap items-end gap-4">
        <div className="text-sm text-text-secondary shrink-0">
          <span className="font-semibold text-text-primary">{selectedIds.size}</span> selected
        </div>
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-muted">{label} (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={applyValues[key]}
              onChange={e => setApplyValues(v => ({ ...v, [key]: e.target.value }))}
              placeholder="No change"
              className="w-28 h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        ))}
        <Button variant="primary" size="sm" disabled={selectedIds.size === 0} onClick={handleApply}>
          Apply to Selected
        </Button>
        <Button variant="secondary" size="sm" disabled={selectedIds.size === 0} onClick={handleClear}>
          Reset Selected to Category Default
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              <th className="px-3 py-3 whitespace-nowrap">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-brand-500 cursor-pointer" />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Product</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Category</th>
              {FIELDS.map(({ key, label }) => (
                <th key={key} className="px-3 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{label.replace(' Discount', ' %')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, discounts }) => (
              <tr key={product.id} className={`border-b border-border last:border-0 ${selectedIds.has(product.id) ? 'bg-brand-50/40' : ''}`}>
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleRow(product.id)}
                    className="w-4 h-4 accent-brand-500 cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <p className="font-medium text-text-primary">{product.name}</p>
                  <p className="text-xs text-text-muted">{product.sku}</p>
                </td>
                <td className="px-3 py-2.5 text-text-secondary whitespace-nowrap">{product.category}</td>
                {FIELDS.map(({ key }) => (
                  <td key={key} className="px-3 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-text-primary font-medium">{discounts[key]}%</span>
                      {discounts.isOverridden[key] && <Badge variant="info" label="Override" />}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3 + FIELDS.length} className="px-3 py-8 text-center text-text-muted text-sm">No products in this category.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Trade / Bulk / Bulk Trade / MAM discount % — category defaults plus
// per-product bulk edit. Lives as a tab on Product Pricing (rather than its
// own sidebar page) since it's just another lever on the same pricing
// ladder that page already shows.
export function PricingDiscounts() {
  const [view, setView] = useState('Category Defaults')

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-border flex gap-0 overflow-x-auto">
        {VIEWS.map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              view === v ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'Category Defaults' && <CategoryDefaultsView />}
      {view === 'Bulk Edit Products' && <BulkEditView />}
    </div>
  )
}
