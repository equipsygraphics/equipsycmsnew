import { mockProducts } from './mockProducts'
import { computeCostBreakdown } from './mockCostBreakdown'

// ---------------------------------------------------------------------------
// The Overview table's pricing ladder (cost -> retail -> trade -> bulk -> MAM)
// is derived entirely from the same shared, editable sources the rest of the
// CMS uses, so it stays consistent with the Product Pricing tab rather than
// showing its own numbers:
// - Cost comes from `costRecords` (ProductCostContext).
// - Retail price comes from `positions` (buildAllPricePositions — the Stage
//   1/2 competitor analysis result, or the standard-margin fallback when no
//   viable competitors exist / it's forced off), falling back to the
//   product's static price only when neither is available.
// - Trade / Bulk / MAM discount % come from `getEffectiveDiscounts`
//   (DiscountSettingsContext — category default or per-product override).
//   Each is its own independent discount off retail — MAM isn't derived
//   from Bulk, it's set separately (e.g. a Member At cost / trade
//   association rate that can differ from the general bulk rate).
// - Custom-quote products (price $0) have no meaningful cost/margin and
//   render as "—" in the table rather than 0%/$0.
// - The "category" column shows the product's Subcategory (not the broad
//   Primary Category) since that's the granular value everything above is
//   actually keyed by — matches the Overview page's category filter, which
//   also lists Subcategory values.
// - Trade Volume Price (`getEffectiveUnitsPerBox`, TradeVolumePricingContext
//   + box2-5Discount, DiscountSettingsContext) is a further tier on top of
//   Bulk pricing keyed by box quantity (2-5 boxes). Each tier is its own
//   independent discount off retail (same shape as Trade/Bulk/MAM, not
//   stacked on top of Bulk), and a product only offers tiers at all when it
//   has a Bulk Quantity (units per box) — bulky/pallet/custom-quote items
//   ship as single units and have none. Each box quantity gets its own
//   price/margin pair (tvPrice2/tvMargin2 .. tvPrice5/tvMargin5) so they can
//   be shown, sorted, and filtered as separate table columns — null when
//   that product doesn't offer that particular tier.
// ---------------------------------------------------------------------------

const TRADE_VOLUME_BOX_COUNTS = [2, 3, 4, 5]

function round2(n) {
  return Math.round(n * 100) / 100
}

function buildTradeVolumeFields(discounts, unitsPerBox, retailPrice, cost) {
  const fields = {}
  TRADE_VOLUME_BOX_COUNTS.forEach(boxes => {
    if (unitsPerBox.value == null) {
      fields[`tvPrice${boxes}`] = null
      fields[`tvMargin${boxes}`] = null
      return
    }
    const price = round2(retailPrice * (1 - discounts[`box${boxes}Discount`] / 100))
    fields[`tvPrice${boxes}`] = price
    fields[`tvMargin${boxes}`] = (price - cost) / price
  })
  return fields
}

const EMPTY_TRADE_VOLUME_FIELDS = Object.fromEntries(
  TRADE_VOLUME_BOX_COUNTS.flatMap(boxes => [[`tvPrice${boxes}`, null], [`tvMargin${boxes}`, null]])
)

export function buildPricingOverview(costRecords, positions, getEffectiveDiscounts, getEffectiveUnitsPerBox) {
  return mockProducts.map(p => {
    const isCustomQuote = p.price === 0

    if (isCustomQuote) {
      return {
        id: p.id,
        name: p.name,
        category: p.subCategory,
        sku: p.sku,
        cost: null,
        retailPrice: 0,
        retailMargin: null,
        tradeDiscount: null,
        tradePrice: 0,
        tradeMargin: null,
        bulkDiscount: null,
        bulkPrice: 0,
        bulkMargin: null,
        mamDiscount: null,
        mamPrice: 0,
        mamMargin: null,
        ...EMPTY_TRADE_VOLUME_FIELDS,
      }
    }

    const cost = computeCostBreakdown(costRecords[p.id]).totalCost

    const retailPrice = positions?.[p.id]?.recommendedPrice ?? p.price
    const retailMargin = (retailPrice - cost) / retailPrice

    const discounts = getEffectiveDiscounts(p)
    const tradeDiscount = discounts.tradeDiscount / 100
    const bulkDiscount = discounts.bulkDiscount / 100
    const mamDiscount = discounts.mamDiscount / 100

    const tradePrice = round2(retailPrice * (1 - tradeDiscount))
    const tradeMargin = (tradePrice - cost) / tradePrice

    const bulkPrice = round2(retailPrice * (1 - bulkDiscount))
    const bulkMargin = (bulkPrice - cost) / bulkPrice

    const mamPrice = round2(retailPrice * (1 - mamDiscount))
    const mamMargin = (mamPrice - cost) / mamPrice

    const tradeVolumeFields = buildTradeVolumeFields(discounts, getEffectiveUnitsPerBox(p), retailPrice, cost)

    return {
      id: p.id,
      name: p.name,
      category: p.subCategory,
      sku: p.sku,
      cost,
      retailPrice,
      retailMargin,
      tradeDiscount,
      tradePrice,
      tradeMargin,
      bulkDiscount,
      bulkPrice,
      bulkMargin,
      mamDiscount,
      mamPrice,
      mamMargin,
      ...tradeVolumeFields,
    }
  })
}
