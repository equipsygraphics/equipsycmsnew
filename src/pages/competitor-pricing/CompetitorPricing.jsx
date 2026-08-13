import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { toast } from '../../components/ui/Toast'
import { Placeholder } from '../Placeholder'
import { Overview } from './tabs/Overview'
import { Competitors } from './tabs/Competitors'
import { PricingFormula } from './tabs/PricingFormula'
import { PricingDiscounts } from './tabs/PricingDiscounts'
import { SpecMatching } from './tabs/SpecMatching'
import { useAttributes } from '../../context/AttributesContext'
import { useProductCost } from '../../context/ProductCostContext'
import { usePricingSettings } from '../../context/PricingSettingsContext'
import { useCompetitorPricingConfig } from '../../context/CompetitorPricingConfigContext'
import { buildAllPricePositions } from '../../data/mockMatching'

const TABS = ['Overview', 'Competitors', 'Pricing Formula', 'Pricing Discounts', 'Spec Matching', 'Settings']

export function CompetitorPricing() {
  const navigate = useNavigate()
  const { attributes } = useAttributes()
  const { costRecords } = useProductCost()
  const { standardMarginPct, setStandardMarginPct, forceStandardMarginMap } = usePricingSettings()
  const {
    competitors, setCompetitors,
    priceRules, setPriceRules,
    coreAttributeSelection, variantAttributeSelection,
    botSettings, updateBotSettings,
  } = useCompetitorPricingConfig()

  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'Overview')
  // null = idle, 'all' = bulk scrape, or a specific competitor id
  const [scrapingTarget, setScrapingTarget] = useState(null)

  const positions = useMemo(
    () => buildAllPricePositions(
      competitors, attributes, priceRules, coreAttributeSelection, variantAttributeSelection,
      costRecords, standardMarginPct, forceStandardMarginMap
    ),
    [competitors, attributes, priceRules, coreAttributeSelection, variantAttributeSelection, costRecords, standardMarginPct, forceStandardMarginMap]
  )

  const runScrapeAll = () => { if (!scrapingTarget) setScrapingTarget('all') }
  const runScrapeOne = (id) => { if (!scrapingTarget) setScrapingTarget(id) }

  const handleScrapeComplete = () => {
    const now = new Date().toISOString()
    if (scrapingTarget === 'all') {
      setCompetitors(prev => prev.map(c => ({ ...c, lastScraped: now })))
      const totalMatches = Object.values(positions).reduce((sum, p) => sum + p.viable.length, 0)
      toast(`Scrape complete — ${totalMatches} competitor product matches found across ${competitors.length} competitors`, 'success')
    } else {
      const target = competitors.find(c => c.id === scrapingTarget)
      setCompetitors(prev => prev.map(c => (c.id === scrapingTarget ? { ...c, lastScraped: now } : c)))
      const matches = Object.values(positions).reduce(
        (sum, p) => sum + p.viable.filter(m => m.competitor.id === scrapingTarget).length, 0
      )
      toast(`Scrape complete — ${matches} product match${matches === 1 ? '' : 'es'} found for ${target?.name ?? 'competitor'}`, 'success')
    }
    setScrapingTarget(null)
  }

  // Stage 1 / Stage 2 match attribute selection now lives on the Attributes
  // page (attributes and their category assignments/match-selections are
  // all managed in one place), as two separate tabs.
  const goToEditCoreAttributes = () => navigate(`/attributes?${new URLSearchParams({ view: 'Stage 1 Match Attributes' })}`)
  const goToEditVariantAttributes = () => navigate(`/attributes?${new URLSearchParams({ view: 'Stage 2 Match Attributes' })}`)
  const goToPricingFormula = () => setActiveTab('Pricing Formula')

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Product Pricing"
        subtitle="Product cost, margin, and pricing tiers alongside competitor research and matching."
      />

      <div className="border-b border-border flex gap-0 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === tab ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <Overview positions={positions} onEditVariantAttributes={goToEditVariantAttributes} onEditStandardMargin={goToPricingFormula} />
      )}
      {activeTab === 'Competitors' && (
        <Competitors
          competitors={competitors}
          setCompetitors={setCompetitors}
          positions={positions}
          scrapingTarget={scrapingTarget}
          onRunScrapeAll={runScrapeAll}
          onRunScrapeOne={runScrapeOne}
          onScrapeComplete={handleScrapeComplete}
          onEditCoreAttributes={goToEditCoreAttributes}
          onEditVariantAttributes={goToEditVariantAttributes}
        />
      )}
      {activeTab === 'Pricing Formula' && (
        <PricingFormula
          rules={priceRules} setRules={setPriceRules}
          standardMarginPct={standardMarginPct} setStandardMarginPct={setStandardMarginPct}
        />
      )}
      {activeTab === 'Pricing Discounts' && <PricingDiscounts />}
      {activeTab === 'Spec Matching' && (
        <SpecMatching settings={botSettings} updateSettings={updateBotSettings} />
      )}
      {activeTab === 'Settings' && <Placeholder title="Settings" />}
    </div>
  )
}
