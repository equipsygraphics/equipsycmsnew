import { createContext, useContext, useState } from 'react'

const PricingSettingsContext = createContext(null)

// Shared pricing settings — mounted once in AppShell so Competitor Pricing
// (Pricing Formula tab, Overview drawer) and the Product "Pricing" tab all
// read/write the same values.
// - standardMarginPct: margin on cost used when no competitors can be found.
// - forceStandardMarginMap (per product id): "comparison analysis not
//   available" override — use standard margin even if competitors WERE found.
// - manualRetailPriceMap (per product id): full bypass — Retail Price is
//   normally auto-set from the analysis result (competitor or standard
//   margin) and locked; this flag re-enables manual entry, ignoring the
//   analysis entirely.
const DEFAULT_STANDARD_MARGIN_PCT = 0.40

export function PricingSettingsProvider({ children }) {
  const [standardMarginPct, setStandardMarginPct] = useState(DEFAULT_STANDARD_MARGIN_PCT)
  const [forceStandardMarginMap, setForceStandardMarginMap] = useState({})
  const [manualRetailPriceMap, setManualRetailPriceMap] = useState({})

  const setForceStandardMargin = (productId, value) => {
    setForceStandardMarginMap(prev => ({ ...prev, [productId]: value }))
  }

  const setManualRetailPrice = (productId, value) => {
    setManualRetailPriceMap(prev => ({ ...prev, [productId]: value }))
  }

  return (
    <PricingSettingsContext.Provider
      value={{
        standardMarginPct, setStandardMarginPct,
        forceStandardMarginMap, setForceStandardMargin,
        manualRetailPriceMap, setManualRetailPrice,
      }}
    >
      {children}
    </PricingSettingsContext.Provider>
  )
}

export function usePricingSettings() {
  const ctx = useContext(PricingSettingsContext)
  if (!ctx) throw new Error('usePricingSettings must be used within PricingSettingsProvider')
  return ctx
}
