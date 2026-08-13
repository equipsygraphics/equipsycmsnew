import { CATEGORIES } from './mockProducts'

// Default Trade / Bulk / Trade Volume (2-5 box) / Bulk Trade / MAM discount %
// per category — the starting point every product in that category inherits
// from until a specific product is given its own override. Percentages are
// plain numbers (20 means 20%), matching the convention already used on the
// Product Pricing tab's discount fields.
//
// The box2-5Discount fields are each their own independent discount off
// retail (same as bulkDiscount/mamDiscount, not stacked on top of one
// another) — buying in bigger box multiples just earns a deeper standalone
// rate. They step down further than bulkDiscount since buying by the box is
// a bigger commitment than the flat bulk rate.
export const DEFAULT_CATEGORY_DISCOUNTS = Object.fromEntries(
  CATEGORIES.map(c => [c, {
    tradeDiscount: 20,
    bulkDiscount: 30,
    box2Discount: 32,
    box3Discount: 34,
    box4Discount: 37,
    box5Discount: 40,
    bulkTradeDiscount: 10,
    mamDiscount: 15,
  }])
)
