export const CATEGORIES = [
  'Grab Rails', 'Shower Seats', 'Toilet Rails', 'Ramps', 'Mats',
  'Shower Rails', 'Anti-Slip', 'Bath Aids', 'Toilet Aids', 'Mobility Aids',
]

export const SUBCATEGORIES = {
  'Grab Rails':     ['300mm', '450mm', '600mm', '750mm', 'Angled', 'Folding'],
  'Shower Seats':   ['Fold-Down', 'Wall-Mounted', 'Freestanding', 'Corner'],
  'Toilet Rails':   ['90°', 'Hinged', 'Offset', 'Drop-Down'],
  'Ramps':          ['Modular', 'Threshold', 'Custom Timber', 'Aluminium'],
  'Mats':           ['Bath Mat', 'Shower Mat', 'Stair Mat'],
  'Shower Rails':   ['Fixed', 'Adjustable', 'Handheld Kit', 'Combo Kit'],
  'Anti-Slip':      ['Stair Nosing', 'Tape', 'Tread Cover', 'Grating'],
  'Bath Aids':      ['Transfer Bench', 'Bath Lift', 'Bath Board', 'Bath Steps'],
  'Toilet Aids':    ['Raised Seat', 'Frame', 'Bidet Attachment'],
  'Mobility Aids':  ['Walkers', 'Crutches', 'Canes', 'Rollators'],
}

export const mockProducts = [
  { id: 1, name: 'Fold-Down Shower Seat', category: 'Shower Seats', price: 249, tradePrice: 199, stock: 42, sku: 'EQ-FSS-01', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'fold-down-shower-seat', metaTitle: 'Fold-Down Shower Seat | Equipsy', metaDesc: '', shortDesc: 'Compact fold-down shower seat for small bathrooms.', longDesc: '' },
  { id: 2, name: 'SS Grab Rail 600mm', category: 'Grab Rails', price: 89, tradePrice: 69, stock: 138, sku: 'EQ-GR-600', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'ss-grab-rail-600mm', metaTitle: '', metaDesc: '', shortDesc: 'Stainless steel grab rail, 600mm.', longDesc: '' },
  { id: 3, name: 'Chrome Grab Rail 450mm', category: 'Grab Rails', price: 72, tradePrice: 55, stock: 94, sku: 'EQ-GR-450', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'chrome-grab-rail-450mm', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 4, name: 'Toilet Safety Rail 90°', category: 'Toilet Rails', price: 129, tradePrice: 99, stock: 7, sku: 'EQ-TR-90', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'toilet-safety-rail-90', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 5, name: 'Slip-Resistant Shower Mat', category: 'Mats', price: 34, tradePrice: 25, stock: 0, sku: 'EQ-SM-01', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'slip-resistant-shower-mat', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 6, name: 'Wall-Mounted Shower Chair', category: 'Shower Seats', price: 389, tradePrice: 310, stock: 15, sku: 'EQ-SC-WM', status: 'published', type: 'standard', gst: true, bulky: true, custom: false, pallet: false, slug: 'wall-mounted-shower-chair', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 7, name: 'Handheld Shower Rail Kit', category: 'Shower Rails', price: 159, tradePrice: 125, stock: 24, sku: 'EQ-SR-HH', status: 'draft', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'handheld-shower-rail-kit', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 8, name: 'Anti-Slip Stair Nosing', category: 'Anti-Slip', price: 45, tradePrice: 34, stock: 210, sku: 'EQ-AS-SN', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'anti-slip-stair-nosing', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 9, name: 'FRP Ramp Grating', category: 'Ramps', price: 680, tradePrice: 540, stock: 12, sku: 'EQ-RP-FRP', status: 'published', type: 'standard', gst: false, bulky: true, custom: false, pallet: true, slug: 'frp-ramp-grating', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 10, name: 'Bath Transfer Bench', category: 'Bath Aids', price: 199, tradePrice: 155, stock: 28, sku: 'EQ-BA-TB', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'bath-transfer-bench', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 11, name: 'Raised Toilet Seat', category: 'Toilet Aids', price: 89, tradePrice: 68, stock: 3, sku: 'EQ-TA-RTS', status: 'published', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'raised-toilet-seat', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 12, name: 'Doorway Ramp Threshold', category: 'Ramps', price: 95, tradePrice: 72, stock: 56, sku: 'EQ-RP-DT', status: 'published', type: 'standard', gst: false, bulky: false, custom: false, pallet: false, slug: 'doorway-ramp-threshold', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 13, name: 'Custom Timber Ramp', category: 'Ramps', price: 0, tradePrice: 0, stock: 0, sku: 'EQ-RP-CUST', status: 'published', type: 'custom', gst: false, bulky: true, custom: true, pallet: true, slug: 'custom-timber-ramp', metaTitle: '', metaDesc: '', shortDesc: 'Price on application. Contact us for a quote.', longDesc: '' },
  { id: 14, name: 'Aluminium Modular Ramp', category: 'Ramps', price: 1200, tradePrice: 950, stock: 8, sku: 'EQ-RP-MOD', status: 'archived', type: 'variable', gst: false, bulky: true, custom: false, pallet: true, slug: 'aluminium-modular-ramp', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
  { id: 15, name: 'Anti-Slip Matting Roll', category: 'Anti-Slip', price: 120, tradePrice: 92, stock: 18, sku: 'EQ-AS-ROLL', status: 'draft', type: 'standard', gst: true, bulky: false, custom: false, pallet: false, slug: 'anti-slip-matting-roll', metaTitle: '', metaDesc: '', shortDesc: '', longDesc: '' },
]

export function getStockStatus(product) {
  if (product.status === 'draft') return 'draft'
  if (product.status === 'archived') return 'archived'
  if (product.stock === 0) return 'out_of_stock'
  if (product.stock <= 8) return 'low_stock'
  return 'published'
}
