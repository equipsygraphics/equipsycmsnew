import { ArrowRight } from 'lucide-react'
import { Drawer } from '../../../components/ui/Drawer'
import { Badge } from '../../../components/ui/Badge'
import { CompetitorMatchAnalysis } from './CompetitorMatchAnalysis'

function money(v) {
  return v == null ? '—' : `$${v.toFixed(2)}`
}

function LadderRow({ label, price, sub }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-text-primary">{money(price)}</span>
        {sub && <span className="block text-xs text-text-muted">{sub}</span>}
      </div>
    </div>
  )
}

export function ProductMatchDrawer({ open, onClose, product, pricing, position, onEditVariantAttributes, onEditStandardMargin, onViewCostBreakdown }) {
  return (
    <Drawer open={open} onClose={onClose} title={product?.name ?? ''} width="w-[880px]">
      {product && (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>{product.sku}</span>
          <span>·</span>
          <Badge variant="grey" label={product.subCategory} />
        </div>

        {pricing && (
          <section>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-text-primary">Pricing Ladder</p>
              {onViewCostBreakdown && (
                <button
                  onClick={onViewCostBreakdown}
                  className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 hover:underline shrink-0"
                >
                  View cost breakdown <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="bg-grey-50 rounded-xl border border-border px-4">
              <LadderRow label="Total cost" price={pricing.cost} />
              <LadderRow label="Retail price" price={pricing.retailPrice} sub={pricing.retailMargin != null ? `${Math.round(pricing.retailMargin * 100)}% margin` : null} />
              <LadderRow label="Trade price" price={pricing.tradePrice} sub={pricing.tradeDiscount != null ? `${Math.round(pricing.tradeDiscount * 100)}% off retail` : null} />
              <LadderRow label="Bulk price" price={pricing.bulkPrice} sub={pricing.bulkDiscount != null ? `${Math.round(pricing.bulkDiscount * 100)}% off retail` : null} />
              <LadderRow label="MAM price" price={pricing.mamPrice} sub={pricing.mamDiscount != null ? `${Math.round(pricing.mamDiscount * 100)}% off retail` : null} />
            </div>
          </section>
        )}

        <CompetitorMatchAnalysis
          product={product}
          position={position}
          cost={pricing?.cost}
          onEditVariantAttributes={onEditVariantAttributes}
          onEditStandardMargin={onEditStandardMargin}
        />
      </div>
      )}
    </Drawer>
  )
}
