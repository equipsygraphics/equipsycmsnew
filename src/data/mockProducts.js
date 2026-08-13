// Primary Category — the broad, top-level classification shown first on the
// product form. Deliberately small; each maps to several of the granular
// Subcategory values below via SUBCATEGORIES.
export const PRIMARY_CATEGORIES = [
  'Ramps & Access',
  'Steps, Nosings & Transitions',
  'Grab Rails & Hand Support',
  'Accessible Shower & Wet Area Solution',
  'Taps and Bathroom Solutions',
  'Assistive Technology',
  'Door Solution',
]

// Subcategory — the specific product type, per the real Stage 1 / Stage 2
// attribute spec (Core Product Match / Variant Match reference table). This
// used to be the "Primary Category" list; it moved here (scoped under the
// new, broader PRIMARY_CATEGORIES above) since core/variant match attributes
// genuinely differ at this granularity (e.g. "Grab Rails" needs splitting by
// fixing/mount style), which is too fine for a top-level category. `CATEGORIES`
// keeps its name/export (rather than being renamed) since it's still the
// matching/attribute-scoping unit used throughout the app — attribute pools,
// Stage 1/2 selections, competitor coverage, and category discounts are all
// keyed by these same 31 values; only `product.subCategory` (not
// `product.category`) is read for that lookup now.
export const CATEGORIES = [
  'Aluminium Cover Strips',
  'Aluminium Threshold Ramps',
  'Angled Toilet Grab Rails',
  'Antislip Tapes',
  'Bathroom Solutions',
  'Concealed Fix Grab Rails',
  'Curtain Accessories',
  'Door Hinges',
  'Door Magnets & Posts',
  'Door Pull Straps',
  'Drop Down Grab Rail Posts',
  'Drop Down Grab Rails',
  'Exposed/Narrow Flange Grab Rails',
  'Fold Down Shower Seat',
  'FRP Ramp Grating',
  'FRP Stair Nosing',
  'Lever Taps',
  'M-Clips & Screws',
  'Modular Grab Rails',
  'Offset Grab Rails',
  'Portable Rubber Ramps',
  'Ramp and Wings Combo',
  'Shower Curtain',
  'Shower Grab Rails',
  'Shower Screen',
  'Sliding Grab Rails',
  'Slip Guard',
  'Standard Rubber Ramp',
  'Toilet Accessories',
  'Towel Grab Rails',
  'VersaMount Handheld Showers & Accessories',
]

// Primary Category -> Subcategory options. Every one of the 31 Subcategory
// values above is assigned to exactly one Primary Category. "Assistive
// Technology" has none yet — none of the current subcategories fit it, so
// it's left empty rather than forcing a mismatch; add real subcategories
// there once that product line exists.
export const SUBCATEGORIES = {
  'Ramps & Access': [
    'Aluminium Threshold Ramps', 'FRP Ramp Grating', 'Portable Rubber Ramps', 'Ramp and Wings Combo', 'Standard Rubber Ramp',
  ],
  'Steps, Nosings & Transitions': [
    'Aluminium Cover Strips', 'Antislip Tapes', 'FRP Stair Nosing', 'Slip Guard',
  ],
  'Grab Rails & Hand Support': [
    'Angled Toilet Grab Rails', 'Concealed Fix Grab Rails', 'Drop Down Grab Rail Posts', 'Drop Down Grab Rails',
    'Exposed/Narrow Flange Grab Rails', 'M-Clips & Screws', 'Modular Grab Rails', 'Offset Grab Rails',
    'Shower Grab Rails', 'Sliding Grab Rails', 'Towel Grab Rails',
  ],
  'Accessible Shower & Wet Area Solution': [
    'Curtain Accessories', 'Fold Down Shower Seat', 'Shower Curtain', 'Shower Screen', 'VersaMount Handheld Showers & Accessories',
  ],
  'Taps and Bathroom Solutions': [
    'Bathroom Solutions', 'Lever Taps', 'Toilet Accessories',
  ],
  'Assistive Technology': [],
  'Door Solution': [
    'Door Hinges', 'Door Magnets & Posts', 'Door Pull Straps',
  ],
}

export const mockProducts = [
  { id: 1,  name: 'Fold-Down Shower Seat',    category: 'Accessible Shower & Wet Area Solution', subCategory: 'Fold Down Shower Seat',                   price: 249,  tradePrice: 199, stock: 42,  sku: 'EQ-FSS-01',  status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 3.2,  packDimensions: { l: 55, w: 45, h: 12 }, slug: 'fold-down-shower-seat',       metaTitle: 'Fold-Down Shower Seat | Equipsy', metaDesc: '', shortDesc: 'Compact fold-down shower seat for small bathrooms.', longDesc: '' },
  { id: 2,  name: 'SS Grab Rail 600mm',        category: 'Grab Rails & Hand Support',              subCategory: 'Modular Grab Rails',                      price: 89,   tradePrice: 69,  stock: 138, sku: 'EQ-GR-600',  status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 0.8,  packDimensions: { l: 65, w: 8,  h: 8  }, slug: 'ss-grab-rail-600mm',           metaTitle: '', metaDesc: '', shortDesc: 'Stainless steel grab rail, 600mm.', longDesc: '' },
  { id: 3,  name: 'Chrome Grab Rail 450mm',    category: 'Grab Rails & Hand Support',              subCategory: 'Offset Grab Rails',                       price: 72,   tradePrice: 55,  stock: 94,  sku: 'EQ-GR-450',  status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 0.6,  packDimensions: { l: 50, w: 8,  h: 8  }, slug: 'chrome-grab-rail-450mm',       metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 4,  name: 'Toilet Safety Rail 90°',    category: 'Grab Rails & Hand Support',              subCategory: 'Angled Toilet Grab Rails',                price: 129,  tradePrice: 99,  stock: 7,   sku: 'EQ-TR-90',   status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 2.1,  packDimensions: { l: 48, w: 40, h: 10 }, slug: 'toilet-safety-rail-90',        metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 5,  name: 'Slip-Resistant Shower Mat', category: 'Steps, Nosings & Transitions',           subCategory: 'Antislip Tapes',                          price: 34,   tradePrice: 25,  stock: 0,   sku: 'EQ-SM-01',   status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 0.4,  packDimensions: { l: 80, w: 60, h: 3  }, slug: 'slip-resistant-shower-mat',    metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 6,  name: 'Wall-Mounted Shower Chair', category: 'Accessible Shower & Wet Area Solution', subCategory: 'Fold Down Shower Seat',                   price: 389,  tradePrice: 310, stock: 15,  sku: 'EQ-SC-WM',   status: 'published', type: 'standard', gst: true,  bulky: true,  custom: false, pallet: false, weight: 8.5,  packDimensions: { l: 70, w: 55, h: 25 }, slug: 'wall-mounted-shower-chair',    metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 7,  name: 'Handheld Shower Rail Kit',  category: 'Accessible Shower & Wet Area Solution', subCategory: 'VersaMount Handheld Showers & Accessories', price: 159,  tradePrice: 125, stock: 24,  sku: 'EQ-SR-HH',   status: 'draft',     type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 1.2,  packDimensions: { l: 45, w: 15, h: 10 }, slug: 'handheld-shower-rail-kit',     metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 8,  name: 'Anti-Slip Stair Nosing',    category: 'Steps, Nosings & Transitions',           subCategory: 'FRP Stair Nosing',                        price: 45,   tradePrice: 34,  stock: 210, sku: 'EQ-AS-SN',   status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 0.3,  packDimensions: { l: 110, w: 5, h: 3 }, slug: 'anti-slip-stair-nosing',       metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 9,  name: 'FRP Ramp Grating',          category: 'Ramps & Access',                         subCategory: 'FRP Ramp Grating',                        price: 680,  tradePrice: 540, stock: 12,  sku: 'EQ-RP-FRP',  status: 'published', type: 'standard', gst: false, bulky: true,  custom: false, pallet: true,  weight: 12.0, packDimensions: { l: 100, w: 90, h: 5 }, slug: 'frp-ramp-grating',             metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 10, name: 'Bath Transfer Bench',        category: 'Taps and Bathroom Solutions',            subCategory: 'Bathroom Solutions',                      price: 199,  tradePrice: 155, stock: 28,  sku: 'EQ-BA-TB',   status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 4.5,  packDimensions: { l: 85, w: 50, h: 20 }, slug: 'bath-transfer-bench',          metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 11, name: 'Raised Toilet Seat',         category: 'Taps and Bathroom Solutions',            subCategory: 'Toilet Accessories',                      price: 89,   tradePrice: 68,  stock: 3,   sku: 'EQ-TA-RTS',  status: 'published', type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 0.9,  packDimensions: { l: 45, w: 35, h: 12 }, slug: 'raised-toilet-seat',           metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 12, name: 'Doorway Ramp Threshold',     category: 'Ramps & Access',                         subCategory: 'Aluminium Threshold Ramps',               price: 95,   tradePrice: 72,  stock: 56,  sku: 'EQ-RP-DT',   status: 'published', type: 'standard', gst: false, bulky: false, custom: false, pallet: false, weight: 1.8,  packDimensions: { l: 100, w: 15, h: 8 }, slug: 'doorway-ramp-threshold',       metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 13, name: 'Custom Timber Ramp',         category: 'Ramps & Access',                         subCategory: 'Ramp and Wings Combo',                    price: 0,    tradePrice: 0,   stock: 0,   sku: 'EQ-RP-CUST', status: 'published', type: 'custom',   gst: false, bulky: true,  custom: true,  pallet: true,  weight: null, packDimensions: null,                     slug: 'custom-timber-ramp',           metaTitle: '', metaDesc: '', shortDesc: 'Price on application. Contact us for a quote.', longDesc: '' },
  { id: 14, name: 'Aluminium Modular Ramp',     category: 'Ramps & Access',                         subCategory: 'Aluminium Threshold Ramps',               price: 1200, tradePrice: 950, stock: 8,   sku: 'EQ-RP-MOD',  status: 'archived',  type: 'variable', gst: false, bulky: true,  custom: false, pallet: true,  weight: 18.0, packDimensions: { l: 110, w: 30, h: 20 }, slug: 'aluminium-modular-ramp',      metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 15, name: 'Anti-Slip Matting Roll',     category: 'Steps, Nosings & Transitions',           subCategory: 'Antislip Tapes',                          price: 120,  tradePrice: 92,  stock: 18,  sku: 'EQ-AS-ROLL', status: 'draft',     type: 'standard', gst: true,  bulky: false, custom: false, pallet: false, weight: 5.0,  packDimensions: { l: 120, w: 15, h: 15 }, slug: 'anti-slip-matting-roll',      metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
]

export function getStockStatus(product) {
  if (product.status === 'draft') return 'draft'
  if (product.status === 'archived') return 'archived'
  if (product.stock === 0) return 'out_of_stock'
  if (product.stock <= 8) return 'low_stock'
  return 'published'
}
