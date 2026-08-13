import { createContext, useContext, useState } from 'react'
import { seedTradeVolumePricing } from '../data/mockTradeVolumePricing'

const TradeVolumePricingContext = createContext(null)

// Bulk Quantity (units per box) — the shared base the Pricing Discounts
// page's Bulk Quantity, 2/3/4/5 Box Quantity columns are all built from.
// Box Quantity for N boxes is just Bulk Quantity x N (computed on the fly,
// not stored); what actually varies per tier is its own box2-5Discount %
// (DiscountSettingsContext), same as Trade/Bulk/MAM discounts.
//
// Follows the same category-default + per-product-override pattern as
// Trade/Bulk/MAM discounts in DiscountSettingsContext — most products of a
// Subcategory pack the same way, with sparse exceptions.
export function TradeVolumePricingProvider({ children }) {
  const [seed] = useState(seedTradeVolumePricing)
  const [categoryUnitsPerBox, setCategoryUnitsPerBoxMap] = useState(seed.categoryUnitsPerBox)
  const [productUnitsPerBoxOverrides, setProductUnitsPerBoxOverridesMap] = useState(seed.productUnitsPerBoxOverrides)

  const setCategoryUnitsPerBox = (category, value) => {
    setCategoryUnitsPerBoxMap(prev => ({ ...prev, [category]: value }))
  }

  const setProductUnitsPerBoxOverride = (productId, value) => {
    setProductUnitsPerBoxOverridesMap(prev => ({ ...prev, [productId]: value }))
  }

  const clearProductUnitsPerBoxOverride = (productId) => {
    setProductUnitsPerBoxOverridesMap(prev => {
      if (!(productId in prev)) return prev
      const { [productId]: _removed, ...rest } = prev
      return rest
    })
  }

  // Resolved units-per-box (Bulk Quantity) for a product: override where
  // set, else its Subcategory's default. `isOverridden` lets the UI show an
  // "Override" badge the same way discount overrides do.
  const getEffectiveUnitsPerBox = (product) => {
    const isOverridden = product.id in productUnitsPerBoxOverrides
    const value = isOverridden
      ? productUnitsPerBoxOverrides[product.id]
      : (categoryUnitsPerBox[product.subCategory] ?? null)
    return { value, isOverridden }
  }

  return (
    <TradeVolumePricingContext.Provider
      value={{
        categoryUnitsPerBox, setCategoryUnitsPerBox,
        productUnitsPerBoxOverrides, setProductUnitsPerBoxOverride, clearProductUnitsPerBoxOverride,
        getEffectiveUnitsPerBox,
        // Wholesale restores for an undo stack — callers snapshot
        // categoryUnitsPerBox/productUnitsPerBoxOverrides before a mutation
        // and hand the snapshot back here to revert it in one step.
        restoreCategoryUnitsPerBox: setCategoryUnitsPerBoxMap,
        restoreProductUnitsPerBoxOverrides: setProductUnitsPerBoxOverridesMap,
      }}
    >
      {children}
    </TradeVolumePricingContext.Provider>
  )
}

export function useTradeVolumePricing() {
  const ctx = useContext(TradeVolumePricingContext)
  if (!ctx) throw new Error('useTradeVolumePricing must be used within TradeVolumePricingProvider')
  return ctx
}
