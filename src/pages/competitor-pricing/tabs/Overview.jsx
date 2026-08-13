import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { CSVExport } from '../../../components/ui/CSVExport'
import { Button } from '../../../components/ui/Button'
import { mockProducts } from '../../../data/mockProducts'
import { buildPricingOverview } from '../../../data/mockPricingOverview'
import { useProductCost } from '../../../context/ProductCostContext'
import { useDiscountSettings } from '../../../context/DiscountSettingsContext'
import { useTradeVolumePricing } from '../../../context/TradeVolumePricingContext'
import { ProductMatchDrawer } from '../components/ProductMatchDrawer'
import { EmailMamPriceListModal } from '../components/EmailMamPriceListModal'

function money(v) {
  return v == null ? '—' : `$${v.toFixed(2)}`
}

function pct(v) {
  return v == null ? '—' : `${Math.round(v * 100)}%`
}

const TRADE_VOLUME_BOX_COUNTS = [2, 3, 4, 5]

// Colour-banded header groups, loosely modelled on a reference spreadsheet:
// one band per pricing "type" (Standard vs Trade Volume), with each tier
// inside a band getting its own shade so e.g. Trade/Bulk/MAM — or 2-box vs
// 5-box — stay visually distinguishable at a glance.
const BAND_STANDARD = { key: 'standard', label: 'Standard Pricing', className: 'bg-sky-500' }
const BAND_TRADE_VOLUME = { key: 'tradeVolume', label: 'Trade Volume Price', className: 'bg-purple-600' }
// Darker tints get an explicit (important-forced) text colour override —
// Tailwind utilities are all equal-specificity, so the last-in-class-string
// one isn't guaranteed to win the default muted grey header text otherwise,
// and grey-on-purple-300 reads poorly.
const TINT = {
  retail: 'bg-sky-50', trade: 'bg-sky-100', bulk: 'bg-sky-50', mam: 'bg-sky-100',
  tv2: 'bg-purple-50', tv3: 'bg-purple-100', tv4: 'bg-purple-200 text-grey-700!', tv5: 'bg-purple-300 text-grey-900!',
}

// Full words ("Retail Margin", "Trade Discount") kept intact — "Margin" /
// "Price" / "Discount" are what actually distinguishes these columns, so
// abbreviating them costs more clarity than the width they'd save. Headers
// wrap onto two lines instead (via `wrap` + a fixed `width`) so the columns
// still stay reasonably narrow.
const NUM_COL_WIDTH = '76px'

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, wrap: true, width: '160px' },
  { key: 'category', label: 'Category', sortable: true, wrap: true, width: '130px' },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'cost', label: 'Total cost', sortable: true, align: 'right', render: money, band: BAND_STANDARD, tint: TINT.retail, wrap: true, width: NUM_COL_WIDTH },
  { key: 'retailPrice', label: 'Retail price', sortable: true, align: 'right', render: money, band: BAND_STANDARD, tint: TINT.retail, wrap: true, width: NUM_COL_WIDTH },
  { key: 'retailMargin', label: 'Retail margin', sortable: true, align: 'right', render: pct, band: BAND_STANDARD, tint: TINT.retail, wrap: true, width: NUM_COL_WIDTH },
  { key: 'tradeDiscount', label: 'Trade discount', sortable: true, align: 'right', render: pct, band: BAND_STANDARD, tint: TINT.trade, wrap: true, width: NUM_COL_WIDTH },
  { key: 'tradePrice', label: 'Trade price', sortable: true, align: 'right', render: money, band: BAND_STANDARD, tint: TINT.trade, wrap: true, width: NUM_COL_WIDTH },
  { key: 'tradeMargin', label: 'Trade margin', sortable: true, align: 'right', render: pct, band: BAND_STANDARD, tint: TINT.trade, wrap: true, width: NUM_COL_WIDTH },
  { key: 'bulkDiscount', label: 'Bulk discount', sortable: true, align: 'right', render: pct, band: BAND_STANDARD, tint: TINT.bulk, wrap: true, width: NUM_COL_WIDTH },
  { key: 'bulkPrice', label: 'Bulk price', sortable: true, align: 'right', render: money, band: BAND_STANDARD, tint: TINT.bulk, wrap: true, width: NUM_COL_WIDTH },
  { key: 'bulkMargin', label: 'Bulk margin', sortable: true, align: 'right', render: pct, band: BAND_STANDARD, tint: TINT.bulk, wrap: true, width: NUM_COL_WIDTH },
  { key: 'mamDiscount', label: 'MAM discount', sortable: true, align: 'right', render: pct, band: BAND_STANDARD, tint: TINT.mam, wrap: true, width: NUM_COL_WIDTH },
  { key: 'mamPrice', label: 'MAM price', sortable: true, align: 'right', render: money, band: BAND_STANDARD, tint: TINT.mam, wrap: true, width: NUM_COL_WIDTH },
  { key: 'mamMargin', label: 'MAM margin', sortable: true, align: 'right', render: pct, band: BAND_STANDARD, tint: TINT.mam, wrap: true, width: NUM_COL_WIDTH },
  ...TRADE_VOLUME_BOX_COUNTS.flatMap(boxes => [
    { key: `tvPrice${boxes}`, label: `${boxes} Box Price`, sortable: true, align: 'right', render: money, band: BAND_TRADE_VOLUME, tint: TINT[`tv${boxes}`], wrap: true, width: NUM_COL_WIDTH },
    { key: `tvMargin${boxes}`, label: `${boxes} Box Margin`, sortable: true, align: 'right', render: pct, band: BAND_TRADE_VOLUME, tint: TINT[`tv${boxes}`], wrap: true, width: NUM_COL_WIDTH },
  ]),
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
  const { getEffectiveUnitsPerBox } = useTradeVolumePricing()
  const rows = useMemo(
    () => buildPricingOverview(costRecords, positions, getEffectiveDiscounts, getEffectiveUnitsPerBox),
    [costRecords, positions, getEffectiveDiscounts, getEffectiveUnitsPerBox]
  )
  // Supports deep-linking straight to a product's analysis drawer, e.g. from
  // the Product Pricing tab's "View full Stage 1 & 2 analysis details" link.
  const [selectedId, setSelectedId] = useState(() => {
    const p = searchParams.get('product')
    return p ? Number(p) : null
  })
  // Tracks whatever DataTable's own search + per-column filters currently
  // leave visible, so CSV export matches what's on screen instead of always
  // exporting every row.
  const [visibleRows, setVisibleRows] = useState(rows)
  const [emailModalOpen, setEmailModalOpen] = useState(false)

  const closeDrawer = () => {
    setSelectedId(null)
    if (searchParams.has('product')) {
      const next = new URLSearchParams(searchParams)
      next.delete('product')
      setSearchParams(next, { replace: true })
    }
  }

  const selectedProduct = mockProducts.find(p => p.id === selectedId)
  const selectedPricing = rows.find(r => r.id === selectedId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Full pricing ladder — cost through to retail, trade, bulk and MAM pricing — for every product. Click the funnel
          icon on any column header to filter by its values, or a row for its competitor match breakdown.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="md" icon={<Mail className="w-4 h-4" />} onClick={() => setEmailModalOpen(true)}>
            Email Price List to MAM
          </Button>
          <CSVExport data={visibleRows} columns={CSV_COLS} filename="pricing-overview" />
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={rows}
        searchKey={['name', 'sku']}
        rowKey="id"
        emptyMessage="No products match this filter."
        onRowClick={row => setSelectedId(row.id)}
        columnFilters
        onFilteredChange={setVisibleRows}
        pagination={false}
        compact
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

      <EmailMamPriceListModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        rows={rows}
      />
    </div>
  )
}
