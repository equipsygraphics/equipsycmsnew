import { createContext, useContext, useState } from 'react'
import { seedAllCostRecords, computeCostBreakdown } from '../data/mockCostBreakdown'

const ProductCostContext = createContext(null)

// Shared, editable cost record per product — mounted once in AppShell so the
// Product "Cost" tab and Competitor Pricing's Overview read and write the
// same state. Editing a field here (e.g. assembly hours, packaging cost)
// immediately changes that product's Total cost / margins in Overview.
export function ProductCostProvider({ children }) {
  const [costRecords, setCostRecords] = useState(seedAllCostRecords)

  const updateCostRecord = (productId, patch) => {
    setCostRecords(prev => ({ ...prev, [productId]: { ...prev[productId], ...patch } }))
  }

  const getCostBreakdown = (productId) => computeCostBreakdown(costRecords[productId])

  return (
    <ProductCostContext.Provider value={{ costRecords, updateCostRecord, getCostBreakdown }}>
      {children}
    </ProductCostContext.Provider>
  )
}

export function useProductCost() {
  const ctx = useContext(ProductCostContext)
  if (!ctx) throw new Error('useProductCost must be used within ProductCostProvider')
  return ctx
}
