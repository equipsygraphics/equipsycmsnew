import { CATEGORIES } from './mockProducts'

// Default Trade / Bulk / Bulk Trade / MAM discount % per category — the
// starting point every product in that category inherits from until a
// specific product is given its own override. Percentages are plain numbers
// (20 means 20%), matching the convention already used on the Product
// Pricing tab's discount fields.
export const DEFAULT_CATEGORY_DISCOUNTS = Object.fromEntries(
  CATEGORIES.map(c => [c, { tradeDiscount: 20, bulkDiscount: 30, bulkTradeDiscount: 10, mamDiscount: 15 }])
)
