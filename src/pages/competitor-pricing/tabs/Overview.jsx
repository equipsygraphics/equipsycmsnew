import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DataTable } from '../../../components/ui/DataTable'
import { Select } from '../../../components/ui/FormField'
import { CSVExport } from '../../../components/ui/CSVExport'
import { CATEGORIES, mockProducts } from '../../../data/mockProducts'
import { buildPricingOverview } from '../../../data/mockPricingOverview'
import { useProductCost } from '../../../context/ProductCostContext'
import { useDiscountSettings } from '../../../context/DiscountSettingsContext'
import { ProductMatchDrawer } from '../components/ProductMatchDrawer'

function money(v) {
  return v == null ? '—' : `$${v.toFixed(2)}`
}

function pct(v) {
  return v == null ? '—' : `${Math.round(v * 100)}%`
}

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'cost', label: 'Total cost', sortable: true, align: 'right', render: money },
  { key: 'retailPrice', label: 'Retail price', sortable: true, align: 'right', render: money },
  { key: 'retailMargin', label: 'Retail margin', sortable: true, align: 'right', render: pct },
  { key: 'tradeDiscount', label: 'Trade discount', sortable: true, align: 'right', render: pct },
  { key: 'tradePrice', label: 'Trade price', sortable: true, align: 'right', render: money },
  { key: 'tradeMargin', label: 'Trade margin', sortable: true, align: 'right', render: pct },
  { key: 'bulkDiscount', label: 'Bulk discount', sortable: true, align: 'right', render: pct },
  { key: 'bulkPrice', label: 'Bulk price', sortable: true, align: 'right', render: money },
  { key: 'bulkMargin', label: 'Bulk margin', sortable: true, align: 'right', render: pct },
  { key: 'mamDiscount', label: 'MAM discount', sortable: true, align: 'right', render: pct },
  { key: 'mamPrice', label: 'MAM price', sortable: true, align: 'right', render: money },
  { key: 'mamMargin', label: 'MAM margin', sortable: true, align: 'right', render: pct },
]

const CSV_COLS = COLUMNS.map(c => ({
  key: c.key,
  label: c.label,
  csvValue: r => (r[c.key] == null ? '' : c.render(r[c.key])),
}))

export function Overview({ positions, onEditVariantAttributes, onEditStandardMargin }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { costRecords } = useProductCost()
  const { getEffectiveDiscounts } = useDiscountSettings()
  const rows = useMemo(
    () => buildPricingOverview(costRecords, positions, getEffectiveDiscounts),
    [costRecords, positions, getEffectiveDiscounts]
  )
  const [categoryFilter, setCategoryFilter] = useState('all')
  // Supports deep-linking straight to a product's analysis drawer, e.g. from
  // the Product Pricing tab's "View full Stage 1 & 2 analysis details" link.
  const [selectedId, setSelectedId] = useState(() => {
    const p = searchParams.get('product')
    return p ? Number(p) : null
  })

  const closeDrawer = () => {
    setSelectedId(null)
    if (searchParams.has('product')) {
      const next = new URLSearchParams(searchParams)
      next.delete('product')
      setSearchParams(next, { replace: true })
    }
  }

  const filtered = useMemo(
    () => (categoryFilter === 'all' ? rows : rows.filter(r => r.category === categoryFilter)),
    [rows, categoryFilter]
  )

  const selectedProduct = mockProducts.find(p => p.id === selectedId)
  const selectedPricing = rows.find(r => r.id === selectedId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Full pricing ladder — cost through to retail, trade, bulk and MAM pricing — for every product. Click a row for its competitor match breakdown.</p>
        <CSVExport data={filtered} columns={CSV_COLS} filename="pricing-overview" />
      </div>

      <DataTable
        columns={COLUMNS}
        data={filtered}
        searchKey={['name', 'sku']}
        rowKey="id"
        emptyMessage="No products match this filter."
        onRowClick={row => setSelectedId(row.id)}
        filters={
          <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-48">
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        }
      />

      <ProductMatchDrawer
        open={!!selectedId}
        onClose={closeDrawer}
        product={selectedProduct}
        pricing={selectedPricing}
        position={selectedProduct ? positions[selectedProduct.id] : null}
        onEditVariantAttributes={onEditVariantAttributes}
        onEditStandardMargin={onEditStandardMargin}
        onViewCostBreakdown={selectedProduct ? () => navigate(`/products/${selectedProduct.id}?tab=Cost`) : null}
      />
    </div>
  )
}
