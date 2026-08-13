import { createContext, useContext, useState } from 'react'
import { DEFAULT_CATEGORY_DISCOUNTS } from '../data/mockDiscountSettings'

const DiscountSettingsContext = createContext(null)

const FIELDS = [
  'tradeDiscount', 'bulkDiscount',
  'box2Discount', 'box3Discount', 'box4Discount', 'box5Discount',
  'bulkTradeDiscount', 'mamDiscount',
]

// Trade / Bulk / Trade Volume (2-5 box) / Bulk Trade / MAM discount % —
// category-level defaults that every product inherits, plus sparse
// per-product overrides for exceptions. Mounted once in AppShell so the
// Product Pricing tab and the Pricing Discounts page (category defaults +
// bulk-edit) read/write the same state.
export function DiscountSettingsProvider({ children }) {
  const [categoryDiscounts, setCategoryDiscounts] = useState(() => ({ ...DEFAULT_CATEGORY_DISCOUNTS }))
  const [productOverrides, setProductOverrides] = useState({}) // { [productId]: { tradeDiscount?, bulkDiscount?, bulkTradeDiscount? } }

  const setCategoryDiscount = (category, field, value) => {
    setCategoryDiscounts(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }))
  }

  const setProductOverride = (productId, field, value) => {
    setProductOverrides(prev => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }))
  }

  const clearProductOverride = (productId, field) => {
    setProductOverrides(prev => {
      if (!prev[productId]) return prev
      const { [field]: _removed, ...rest } = prev[productId]
      const next = { ...prev }
      if (Object.keys(rest).length === 0) delete next[productId]
      else next[productId] = rest
      return next
    })
  }

  // Apply the same field values to every id in productIds at once — the
  // bulk-edit action. `patch` only needs the fields being changed.
  const bulkApply = (productIds, patch) => {
    setProductOverrides(prev => {
      const next = { ...prev }
      productIds.forEach(id => { next[id] = { ...next[id], ...patch } })
      return next
    })
  }

  // Clear overrides (revert to category default) for a batch of products,
  // for the given fields (defaults to all three).
  const bulkClear = (productIds, fields = FIELDS) => {
    setProductOverrides(prev => {
      const next = { ...prev }
      productIds.forEach(id => {
        if (!next[id]) return
        const updated = { ...next[id] }
        fields.forEach(f => delete updated[f])
        if (Object.keys(updated).length === 0) delete next[id]
        else next[id] = updated
      })
      return next
    })
  }

  // Resolved discounts for a product: override where set, category default
  // otherwise, plus which fields are actually overridden (for UI badges).
  // Keyed by subCategory (the granular classification), not the broad
  // Primary Category, since that's the level category discounts are set at.
  const getEffectiveDiscounts = (product) => {
    const defaults = categoryDiscounts[product.subCategory] || {}
    const override = productOverrides[product.id] || {}
    const isOverridden = {}
    const resolved = {}
    FIELDS.forEach(f => {
      isOverridden[f] = override[f] != null
      resolved[f] = override[f] ?? defaults[f] ?? 0
    })
    return { ...resolved, isOverridden }
  }

  return (
    <DiscountSettingsContext.Provider
      value={{
        categoryDiscounts, setCategoryDiscount,
        productOverrides, setProductOverride, clearProductOverride,
        bulkApply, bulkClear,
        getEffectiveDiscounts,
        // Wholesale restores for an undo stack — callers snapshot
        // categoryDiscounts/productOverrides before a mutation and hand the
        // snapshot back here to revert it in one step.
        restoreCategoryDiscounts: setCategoryDiscounts,
        restoreProductOverrides: setProductOverrides,
      }}
    >
      {children}
    </DiscountSettingsContext.Provider>
  )
}

export function useDiscountSettings() {
  const ctx = useContext(DiscountSettingsContext)
  if (!ctx) throw new Error('useDiscountSettings must be used within DiscountSettingsProvider')
  return ctx
}
