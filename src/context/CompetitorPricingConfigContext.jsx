import { createContext, useContext, useState } from 'react'
import { mockCompetitors } from '../data/mockCompetitors'
import {
  DEFAULT_PRICE_POSITION_RULES, DEFAULT_CORE_ATTRIBUTE_SELECTION, DEFAULT_VARIANT_ATTRIBUTE_SELECTION,
} from '../data/mockMatching'
import { DEFAULT_BOT_SETTINGS } from '../data/mockBotSettings'

const CompetitorPricingConfigContext = createContext(null)

function cloneSelection(defaults) {
  return Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, [...v]]))
}

// Shared Competitor Pricing configuration — competitors, the Pricing Formula
// rule table, Spec Matching's core/variant attribute selections (used by the
// Attributes page), and the scraping bot's crawl settings. Mounted once in
// AppShell so the Product "Pricing" tab can run the exact same Stage 1/2
// analysis for a product that Competitor Pricing's Overview does, instead of
// duplicating (and risking drifting from) that config.
export function CompetitorPricingConfigProvider({ children }) {
  const [competitors, setCompetitors] = useState(mockCompetitors)
  const [priceRules, setPriceRules] = useState(() => DEFAULT_PRICE_POSITION_RULES.map(r => ({ ...r })))
  const [coreAttributeSelection, setCoreAttributeSelection] = useState(() => cloneSelection(DEFAULT_CORE_ATTRIBUTE_SELECTION))
  const [variantAttributeSelection, setVariantAttributeSelection] = useState(() => cloneSelection(DEFAULT_VARIANT_ATTRIBUTE_SELECTION))
  const [botSettings, setBotSettings] = useState(() => ({ ...DEFAULT_BOT_SETTINGS }))

  const updateBotSettings = (patch) => setBotSettings(prev => ({ ...prev, ...patch }))

  return (
    <CompetitorPricingConfigContext.Provider
      value={{
        competitors, setCompetitors,
        priceRules, setPriceRules,
        coreAttributeSelection, setCoreAttributeSelection,
        variantAttributeSelection, setVariantAttributeSelection,
        botSettings, setBotSettings, updateBotSettings,
      }}
    >
      {children}
    </CompetitorPricingConfigContext.Provider>
  )
}

export function useCompetitorPricingConfig() {
  const ctx = useContext(CompetitorPricingConfigContext)
  if (!ctx) throw new Error('useCompetitorPricingConfig must be used within CompetitorPricingConfigProvider')
  return ctx
}
