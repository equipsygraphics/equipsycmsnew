import { CATEGORIES } from './mockProducts'

// Bulk Quantity — how many pieces ship in one packed carton/box. This is
// what Bulk pricing's minimum quantity is really based on (buy a full box's
// worth or more), and the multiplier behind Trade Volume's 2/3/4/5 Box
// Quantity columns (2 Box Quantity = Bulk Quantity x 2, etc — see
// DiscountSettingsContext for the box2-5Discount % that price each of those
// tiers). `null` means the product/category ships as a single unit
// (bulky/pallet items) and has no box-multiple pricing at all.
//
// Set at two levels, same as Trade/Bulk/MAM discounts: a per-Subcategory
// default (most products of the same type pack the same way) plus a sparse
// per-product override for the exceptions (e.g. two shower seats in the same
// subcategory that are physically different sizes and so pack differently).
export const DEFAULT_UNITS_PER_BOX = {
  'Aluminium Cover Strips': 10,
  'Aluminium Threshold Ramps': 8,
  'Angled Toilet Grab Rails': 10,
  'Antislip Tapes': 12,
  'Bathroom Solutions': 3,
  'Concealed Fix Grab Rails': 15,
  'Curtain Accessories': 20,
  'Door Hinges': 25,
  'Door Magnets & Posts': 25,
  'Door Pull Straps': 20,
  'Drop Down Grab Rail Posts': 12,
  'Drop Down Grab Rails': 12,
  'Exposed/Narrow Flange Grab Rails': 15,
  'Fold Down Shower Seat': 4,
  'FRP Ramp Grating': null,
  'FRP Stair Nosing': 15,
  'Lever Taps': 20,
  'M-Clips & Screws': 50,
  'Modular Grab Rails': 20,
  'Offset Grab Rails': 24,
  'Portable Rubber Ramps': 3,
  'Ramp and Wings Combo': null,
  'Shower Curtain': 10,
  'Shower Grab Rails': 15,
  'Shower Screen': 2,
  'Sliding Grab Rails': 15,
  'Slip Guard': 8,
  'Standard Rubber Ramp': 2,
  'Toilet Accessories': 10,
  'Towel Grab Rails': 20,
  'VersaMount Handheld Showers & Accessories': 8,
}

// Per-product exceptions to their Subcategory's default above.
const UNITS_PER_BOX_OVERRIDES = {
  6: 2,     // Wall-Mounted Shower Chair — bulkier than the category's other Fold Down Shower Seats (4)
  14: null, // Aluminium Modular Ramp — large/archived, ships as a single unit unlike other Threshold Ramps (8)
  15: 6,    // Anti-Slip Matting Roll — bigger roll than the category's other Antislip Tapes item (12)
}

export function seedTradeVolumePricing() {
  const categoryUnitsPerBox = { ...DEFAULT_UNITS_PER_BOX }
  CATEGORIES.forEach(c => {
    if (!(c in categoryUnitsPerBox)) categoryUnitsPerBox[c] = null
  })
  const productUnitsPerBoxOverrides = { ...UNITS_PER_BOX_OVERRIDES }

  return { categoryUnitsPerBox, productUnitsPerBoxOverrides }
}
