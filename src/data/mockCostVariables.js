// Shared, editable cost variable rate card — freight multipliers, material
// costs, packaging components, and labour/consumable rates used to build up
// a product's Packaging Cost (and related buckets) on the Cost tab. Lives in
// CostVariablesContext so edits here are visible everywhere it's referenced.
//
// additionalCostPct is only meaningful for the two freight rows (a % markup
// applied on top of base freight); everything else is a flat per-unit value
// and carries additionalCostPct: null.
export const INITIAL_COST_VARIABLES = [
  { id: 1, name: 'FOB Industry Freight Additional Cost', additionalCostPct: 0.20, value: 1.2 },
  { id: 2, name: 'EXW Industry Freight Additional Cost', additionalCostPct: 0.25, value: 1.25 },
  { id: 3, name: 'Rubber cost per kilo', additionalCostPct: null, value: 0.826 },
  { id: 4, name: 'Binder cost per kilo', additionalCostPct: null, value: 2.202 },
  { id: 5, name: 'Labour Cost per hour', additionalCostPct: null, value: 35 },
  { id: 6, name: 'Invoice Slip Sticker', additionalCostPct: null, value: 0.03045 },
  { id: 7, name: 'Shipping Label', additionalCostPct: null, value: 0.226 },
  { id: 8, name: 'Top Load Only', additionalCostPct: null, value: 0.031 },
  { id: 9, name: 'Do Not Break Down', additionalCostPct: null, value: 0.198 },
  { id: 10, name: 'Bubble Wrap', additionalCostPct: null, value: 0.586666667 },
  { id: 11, name: 'Fragile Sticker', additionalCostPct: null, value: 0.198 },
  { id: 12, name: 'Marketing Sticker', additionalCostPct: null, value: 0.824 },
  { id: 13, name: 'Courier Bag', additionalCostPct: null, value: 0.252 },
  { id: 14, name: 'Poly Strap', additionalCostPct: null, value: 0.03 },
  { id: 15, name: 'Metal Strap Clips', additionalCostPct: null, value: 0.03 },
  { id: 16, name: 'Masterwrap Clear', additionalCostPct: null, value: 1.35862069 },
  { id: 17, name: 'Masterwrap Black', additionalCostPct: null, value: 0.145 },
  { id: 18, name: 'Cardboard Pallet', additionalCostPct: null, value: 48.73 },
  { id: 19, name: 'Board Bearer', additionalCostPct: null, value: 23.4 },
  { id: 20, name: 'Timber Pallet (Rubber Ramp)', additionalCostPct: null, value: 50 },
  { id: 21, name: 'Timber Pallet (Timber Ramp)', additionalCostPct: null, value: 14.58 },
  { id: 22, name: 'Cardboard Pad', additionalCostPct: null, value: 1.55 },
  { id: 23, name: 'Carton Box', additionalCostPct: null, value: 4.6 },
  { id: 24, name: 'Standard Pallet', additionalCostPct: null, value: 14.58 },
  { id: 25, name: 'Marketing Tag', additionalCostPct: null, value: 0.86 },
  { id: 26, name: 'Carton Box', additionalCostPct: null, value: 4.6 },
  { id: 27, name: 'Manufacturing Consumable', additionalCostPct: null, value: 2.14555 },
]
