import { mockProducts } from './mockProducts'

// ---------------------------------------------------------------------------
// Product cost model, split in two so the cost breakdown can be genuinely
// editable (on the Product "Cost" tab) while still driving Competitor
// Pricing's Total cost / margin figures:
//
// - seedCostRecord(product) generates the RAW, editable input fields
//   (unit cost, freight, packing method + cost, labour hours, cosmetic cost,
//   fixed/handling/extras cost) deterministically from the product, purely
//   as sensible starting values. This is what ProductCostContext seeds its
//   editable state from.
// - computeCostBreakdown(record) is a pure function: given those editable
//   inputs (+ fixed hourly rates), it derives every bucket subtotal and the
//   grand total. Nothing here is random — editing a field on the Cost tab
//   and re-running this is exactly how a change propagates into the total.
//
// - Packaging Cost: packing method defaults from the product's existing
//   `pallet`/`bulky` flags (Palletised Crate / Bulky Item Carton / Standard
//   Carton), editable afterwards. Component-level costs per packing method
//   aren't modelled yet — flagged `componentsPending` — those variables are
//   coming later.
// - Labour & Manufacturing Cost: hourly rates are fixed constants (LABOUR_RATES).
//   Seed hours are back-solved from a price-scaled labour budget rather than
//   generated independently of price — doing that first produced labour
//   costs that could exceed an entire cheap product's retail price.
// ---------------------------------------------------------------------------

export const LABOUR_RATES = {
  assembly: 28,
  packing: 22,
  manufacturing: 35,
}

export const PACKING_METHODS = ['Standard Carton', 'Bulky Item Carton', 'Palletised Crate']

function round2(n) {
  return Math.round(n * 100) / 100
}

function packingMethodFor(product) {
  if (product.pallet) return 'Palletised Crate'
  if (product.bulky) return 'Bulky Item Carton'
  return 'Standard Carton'
}

const PACKING_METHOD_BASE_RATIO = {
  'Palletised Crate': 0.05,
  'Bulky Item Carton': 0.032,
  'Standard Carton': 0.018,
}

// Deterministic starting values for a product's editable cost record.
export function seedCostRecord(product) {
  if (!product || product.price <= 0) return null

  const price = product.price
  const seed = product.id

  const unitCost = round2(price * (0.30 + (seed % 6) * 0.008)) // 0.300 - 0.340
  const freightDuties = round2(unitCost * (0.04 + (seed % 5) * 0.01)) // 4% - 8% of unit cost

  const packingMethod = packingMethodFor(product)
  const packagingCost = round2(price * PACKING_METHOD_BASE_RATIO[packingMethod] * (0.9 + (seed % 5) * 0.05))

  const labourCostRatio = 0.10 + (seed % 6) * 0.008 // 0.100 - 0.140
  const labourCostTotal = round2(price * labourCostRatio)
  const manufacturingCosmeticCost = round2(Math.min(labourCostTotal * 0.12, 0.6 + (seed % 5) * 0.6))
  const remainingLabour = labourCostTotal - manufacturingCosmeticCost
  const assemblyShare = 0.38 + (seed % 3) * 0.03 // 0.38 - 0.44
  const packingShare = 0.22 + (seed % 3) * 0.02 // 0.22 - 0.26
  const manufacturingShare = Math.max(0.2, 1 - assemblyShare - packingShare)
  const assemblyHours = round2((remainingLabour * assemblyShare) / LABOUR_RATES.assembly)
  const packingHours = round2((remainingLabour * packingShare) / LABOUR_RATES.packing)
  const manufacturingHours = round2((remainingLabour * manufacturingShare) / LABOUR_RATES.manufacturing)

  const operationalRatio = 0.05 + (seed % 5) * 0.005 // 0.050 - 0.070
  const operationalCostTotal = round2(price * operationalRatio)
  const fixedShare = 0.40
  const handlingShare = 0.32 + (product.pallet ? 0.1 : product.bulky ? 0.05 : 0)
  const extrasShare = Math.max(0.1, 1 - fixedShare - handlingShare)

  return {
    unitCost,
    freightDuties,
    packingMethod,
    packagingCost,
    assemblyHours,
    packingHours,
    manufacturingHours,
    manufacturingCosmeticCost,
    fixedCost: round2(operationalCostTotal * fixedShare),
    handlingCost: round2(operationalCostTotal * handlingShare),
    extrasCost: round2(operationalCostTotal * extrasShare),
  }
}

export function seedAllCostRecords() {
  return Object.fromEntries(
    mockProducts.filter(p => p.price > 0).map(p => [p.id, seedCostRecord(p)])
  )
}

// Pure: editable record -> full breakdown with every bucket + grand total.
export function computeCostBreakdown(record) {
  if (!record) return null

  const landedCost = round2(record.unitCost + record.freightDuties)

  const assemblyLabourCost = round2(record.assemblyHours * LABOUR_RATES.assembly)
  const packingLabourCost = round2(record.packingHours * LABOUR_RATES.packing)
  const manufacturingLabourCost = round2(record.manufacturingHours * LABOUR_RATES.manufacturing)
  const labourCost = round2(assemblyLabourCost + packingLabourCost + manufacturingLabourCost + record.manufacturingCosmeticCost)

  const operationalCost = round2(record.fixedCost + record.handlingCost + record.extrasCost)

  const totalCost = round2(landedCost + record.packagingCost + labourCost + operationalCost)

  return {
    totalCost,
    unitLanded: { unitCost: record.unitCost, freightDuties: record.freightDuties, landedCost },
    packaging: { packingMethod: record.packingMethod, packagingCost: record.packagingCost, componentsPending: true },
    labour: {
      assemblyHours: record.assemblyHours, assemblyRate: LABOUR_RATES.assembly, assemblyLabourCost,
      packingHours: record.packingHours, packingRate: LABOUR_RATES.packing, packingLabourCost,
      manufacturingHours: record.manufacturingHours, manufacturingRate: LABOUR_RATES.manufacturing, manufacturingLabourCost,
      manufacturingCosmeticCost: record.manufacturingCosmeticCost,
      labourCost,
    },
    operational: { fixedCost: record.fixedCost, handlingCost: record.handlingCost, extrasCost: record.extrasCost, operationalCost },
  }
}
