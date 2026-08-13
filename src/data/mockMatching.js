import { mockProducts } from './mockProducts'
import { computeCostBreakdown } from './mockCostBreakdown'

// ---------------------------------------------------------------------------
// Simulated two-stage competitor matching engine. There is no real scraper —
// this module deterministically synthesizes what a scrape + match pass would
// produce, so the UI (progress states, match breakdowns, price positioning)
// has real, stable data to render. Assumptions, since the brief describes the
// method but not exact numbers:
// - The attribute pool itself lives in AttributesContext / mockAttributes.js
//   — the same shared, editable list used by the standalone Attributes CMS
//   page — not a static export here. Every function below that needs a
//   category's attributes takes the current `attributes` array as a
//   parameter and filters it by category on the fly, so an attribute added,
//   renamed, or deleted anywhere in the CMS is reflected immediately.
// - Core match attributes (stage 1) are category-specific: every product
//   category has a pool of attributes that can be found on that kind of
//   product (e.g. Grab Rails: diameter, material, colour, length...). A
//   category-specific subset of those (however many the category genuinely
//   needs — as few as 2, as many as 9) are picked as the "core match
//   attributes" the bot scrapes and compares (configured on the Spec
//   Matching tab, by attribute id). Each scores 0-100% (exact match for
//   categorical attributes like material/colour, proximity for numeric ones
//   like diameter), averaged into an overall accuracy. A listing only
//   proceeds to stage 2 (variant/pricing analysis) if that accuracy is over
//   80%.
// - Variant match attributes (stage 2) are also category-specific, drawn from
//   the same attribute pool as stage 1 but restricted to numeric attributes
//   (a ratio/differential only makes sense for numbers). Some categories
//   have none at all — those price off Stage 1 pass/fail plus the standard
//   margin, since there's no dimensional spec to compare "better/worse" on.
// - Differential % per attribute = (ourValue / competitorValue - 1) * 100,
//   matching the brief's worked example (ours 5000 / competitor 10000 = 0.5
//   ratio). Averaged across every competitor that passed stage 1, per
//   attribute, then each attribute's averaged differential is classified into
//   a band. The final price position is resolved by priority — mid first,
//   then upper-mid, then high, then low — per the brief.
// - Price positioning bands (below) are the actual Pricing Formula rule
//   table — Price Position, Match Type, Product Type, Target, Description,
//   Indicator, Condition and Pricing Adjustment Logic all come straight from
//   that table. Only the "%" (priceMultiplier) is wired into recalculation
//   here; the other columns are editable copy in the Pricing Formula tab but
//   don't feed back into the condition thresholds used to classify a
//   differential — retuning those would mean changing the numeric min/max
//   pairs below, not the display text.
// ---------------------------------------------------------------------------

// Returns the attribute pool for a category, from the shared (editable)
// attribute list — i.e. every attribute whose `categories` includes it.
export function categoryAttributePool(attributes, category) {
  return attributes.filter(a => a.categories.includes(category))
}

// Stage 1 core match attributes per category, by attribute id — editable on
// the Spec Matching tab. Taken directly from the Core Product Match /
// Variant Match reference table (not a fixed count per category — some
// categories key off 8-9 attributes, others off just 2). IDs match the seed
// data in mockAttributes.js: 1 Product Type, 2 Material, 3 Color, 4 Finish,
// 5 Drilling Option, 6 Fixing Type, 7 Angle, 8 Handling, 9 Compliance,
// 10 Diameter, 11 Slip Resistance Rating, 12 Gradient, 13 Fixings,
// 14 Pack Qty, 15 Installation Method, 16 Hole Fixing, 17 Flange Shape,
// 18 Fabric Weight, 19 Length, 20 Width, 21 Height, 22 Weight Capacity,
// 23 Depth, 24 Rise, 25 Drop, 26 Warranty.
export const DEFAULT_CORE_ATTRIBUTE_SELECTION = {
  'Aluminium Cover Strips': [1, 2, 5, 4],
  'Aluminium Threshold Ramps': [1, 3, 2, 4, 12, 13],
  'Angled Toilet Grab Rails': [1, 10, 2, 6, 7, 8, 4, 9],
  'Antislip Tapes': [1, 3, 2, 11],
  'Bathroom Solutions': [1, 2, 3, 4],
  'Concealed Fix Grab Rails': [1, 10, 2, 3, 4, 6, 9],
  'Curtain Accessories': [1, 10, 14],
  'Door Hinges': [1, 2],
  'Door Magnets & Posts': [1, 2],
  'Door Pull Straps': [1, 2],
  'Drop Down Grab Rail Posts': [1, 2, 4],
  'Drop Down Grab Rails': [1, 10, 2, 4, 9],
  'Exposed/Narrow Flange Grab Rails': [1, 10, 2, 3, 4, 6, 16, 17, 9],
  'Fold Down Shower Seat': [1, 2],
  'FRP Ramp Grating': [1, 2, 3, 11],
  'FRP Stair Nosing': [1, 2, 15, 11],
  'Lever Taps': [1, 2, 4],
  'M-Clips & Screws': [1, 2, 4],
  'Modular Grab Rails': [1, 10, 2, 4, 9],
  'Offset Grab Rails': [1, 10, 6, 2, 4, 9],
  'Portable Rubber Ramps': [1, 2, 12, 9],
  'Ramp and Wings Combo': [1, 2, 12, 9],
  'Shower Curtain': [1, 2, 18, 3, 4],
  'Shower Grab Rails': [1, 10, 8, 2, 3, 4, 9],
  'Shower Screen': [1, 2, 3, 4],
  'Sliding Grab Rails': [1, 6, 10, 2, 3, 4, 9],
  'Slip Guard': [1, 2, 3, 4],
  'Standard Rubber Ramp': [1, 2, 3, 4],
  'Toilet Accessories': [1, 2, 12],
  'Towel Grab Rails': [1, 10, 2, 3, 4, 9],
  'VersaMount Handheld Showers & Accessories': [1, 2],
}

// Minimum stage-1 accuracy for a competitor listing to be usable in stage 2
// (variant attribute matching / price positioning).
export const CORE_MATCH_THRESHOLD = 80

// Stage 2 variant match attributes per category, by attribute id — editable
// on the Spec Matching tab, taken from the same reference table. Six
// categories (Curtain Accessories, Door Hinges, Lever Taps, M-Clips &
// Screws, Toilet Accessories, VersaMount Handheld Showers & Accessories)
// have no variant match attributes at all per the table — those categories
// pass or fail on Stage 1 core match alone and fall back to the standard
// margin for price positioning since no attribute differential can be
// computed. All ids here resolve to numeric attributes (required for the
// ratio/differential math).
export const DEFAULT_VARIANT_ATTRIBUTE_SELECTION = {
  'Aluminium Cover Strips': [19, 20, 21],
  'Aluminium Threshold Ramps': [20, 23, 24],
  'Angled Toilet Grab Rails': [19, 21],
  'Antislip Tapes': [20, 19],
  'Bathroom Solutions': [19, 20],
  'Concealed Fix Grab Rails': [19],
  'Curtain Accessories': [],
  'Door Hinges': [],
  'Door Magnets & Posts': [19, 20],
  'Door Pull Straps': [20, 21],
  'Drop Down Grab Rail Posts': [19],
  'Drop Down Grab Rails': [19, 22],
  'Exposed/Narrow Flange Grab Rails': [19],
  'Fold Down Shower Seat': [22, 20, 21],
  'FRP Ramp Grating': [21, 23, 19],
  'FRP Stair Nosing': [19, 21, 23],
  'Lever Taps': [],
  'M-Clips & Screws': [],
  'Modular Grab Rails': [19, 20],
  'Offset Grab Rails': [19],
  'Portable Rubber Ramps': [20, 23, 24],
  'Ramp and Wings Combo': [20, 23, 24],
  'Shower Curtain': [25, 20],
  'Shower Grab Rails': [19, 20],
  'Shower Screen': [21, 20],
  'Sliding Grab Rails': [19],
  'Slip Guard': [19, 20],
  'Standard Rubber Ramp': [20, 23, 24],
  'Toilet Accessories': [],
  'Towel Grab Rails': [19],
  'VersaMount Handheld Showers & Accessories': [],
}

// Priority order matters: first rule (in this array order) with at least one
// matching attribute wins the final price position — mid, then upper-mid,
// then high, then low.
export const DEFAULT_PRICE_POSITION_RULES = [
  {
    key: 'mid',
    label: 'Mid',
    matchType: 'Exact Match',
    productType: 'Basic/Commodity',
    target: 'DIY buyers',
    description: 'Our product is the same as the closest comparable product in the market.',
    indicator: 'Almost the same features/specs',
    condition: '-10% < Diff % < 10%',
    conditionMin: -10,
    conditionMax: 10,
    pricingLogic: "5% lesser than the competitor's price with the closest match",
    priceMultiplier: 0.95,
  },
  {
    key: 'upper-mid',
    label: 'Upper-Mid',
    matchType: 'Better Match',
    productType: 'Value/Standard',
    target: 'Builders and Trades',
    description: 'Our product offers more value than the closest comparable product in the market.',
    indicator: 'Better or higher specs quantity/quality',
    condition: '11% < Diff % within < 50%',
    conditionMin: 11,
    conditionMax: 50,
    pricingLogic: "Equal to the competitor's price with the closest match",
    priceMultiplier: 1,
  },
  {
    key: 'high',
    label: 'High',
    matchType: 'Better Match',
    productType: 'Custom/Industrial',
    target: 'Healthcare organizations/Home mods providers',
    description: 'Our product offers more value than the closest comparable product in the market.',
    indicator: 'Better or higher specs quantity/quality',
    condition: '51% < Diff %',
    conditionMin: 51,
    conditionMax: Infinity,
    pricingLogic: "20% more than the competitor's price with the closest match",
    priceMultiplier: 1.2,
  },
  {
    key: 'low',
    label: 'Low',
    matchType: 'Lesser Match',
    productType: 'Basic/Commodity',
    target: 'End Users',
    description: 'Our product offers less value than the closest comparable product in the market.',
    indicator: 'Lower specs quantity/quality',
    condition: '< -10%',
    conditionMin: -Infinity,
    conditionMax: -10,
    pricingLogic: "10% lesser than the competitor's price with the closest match",
    priceMultiplier: 0.9,
  },
]

function classifyDifferential(diffPct, rules) {
  const byKey = Object.fromEntries(rules.map(r => [r.key, r]))
  if (diffPct > byKey.mid.conditionMin && diffPct < byKey.mid.conditionMax) return 'mid'
  if (diffPct >= byKey['upper-mid'].conditionMin && diffPct <= byKey['upper-mid'].conditionMax) return 'upper-mid'
  if (diffPct > byKey.high.conditionMin) return 'high'
  return 'low'
}

function hashSeed(id) {
  const str = String(id)
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

function synthCompetitorPrice(product, competitorSeed) {
  const factor = 0.4 + ((product.id * 13 + competitorSeed * 19) % 140) / 100 // 0.40 - 1.79
  return Math.round(product.price * factor * 100) / 100
}

const TITLE_VARIANT_SUFFIXES = ['Pro', 'Deluxe', 'Standard', 'Classic', 'Premium']

// Synthesizes a plausible competitor listing title from our product name, so
// keyword/title relevance has real text content to compare rather than a
// bare random score. Deterministic per product+competitor.
function synthCompetitorTitle(product, competitorSeed) {
  const mode = (product.id + competitorSeed) % 4
  const suffix = TITLE_VARIANT_SUFFIXES[(product.id * 3 + competitorSeed) % TITLE_VARIANT_SUFFIXES.length]
  if (mode === 0) return product.name
  if (mode === 1) return `${product.name} ${suffix}`
  if (mode === 2) return product.name.split(' ').reverse().join(' ')
  return `${product.subCategory} ${suffix} Model ${100 + ((product.id * 7 + competitorSeed) % 50)}`
}

// Values are plain strings on the shared attribute — for numeric attributes
// that means number-strings (e.g. '450'), filtered defensively in case a
// non-numeric value slipped in via an edit.
function numericPool(attr) {
  return attr.values.map(Number).filter(v => !Number.isNaN(v))
}

// Deterministic value for one of our products on a given core-match
// attribute, picked from its real configured value pool — categorical
// attributes pick a value verbatim, numeric attributes pick a number from
// its numeric values. Returns null if the attribute has no usable values.
function getOurAttributeValue(product, attr) {
  const seed = hashSeed(`${product.id}-${attr.id}`)
  if (attr.type === 'categorical') {
    if (attr.values.length === 0) return null
    return attr.values[seed % attr.values.length]
  }
  const pool = numericPool(attr)
  return pool.length === 0 ? null : pool[seed % pool.length]
}

// Competitor's equivalent value for that attribute — categorical attributes
// match ours most of the time (bots do find the same spec) but sometimes
// diverge; numeric attributes vary by a deterministic +/-factor off ours.
function getCompetitorAttributeValue(product, competitor, attr, ourValue, competitorSeed) {
  if (ourValue == null) return null
  const seed = hashSeed(`${product.id}-${competitor.id}-${attr.id}`)
  if (attr.type === 'categorical') {
    if (seed % 100 < 65) return ourValue
    const others = attr.values.filter(v => v !== ourValue)
    return others.length ? others[seed % others.length] : ourValue
  }
  const factor = 0.8 + ((seed + competitorSeed) % 45) / 100 // 0.80 - 1.24
  return Math.round(ourValue * factor)
}

// 100% on an exact categorical match / numeric parity, decaying with the gap.
function attributeMatchScore(attr, ourValue, competitorValue) {
  if (attr.type === 'categorical') return ourValue === competitorValue ? 100 : 0
  if (!ourValue) return 0
  const diffPct = Math.abs((competitorValue - ourValue) / ourValue) * 100
  return Math.max(0, Math.round(100 - diffPct))
}

// Stage 1 + stage 2 for a single product/competitor pair. `attributes` is the
// shared, editable attribute list (from AttributesContext); `coreAttributeSelection`
// and `variantAttributeSelection` are the Spec Matching tab's category ->
// [attribute id] configs.
export function matchCompetitorProduct(
  product, competitor, attributes,
  coreAttributeSelection = DEFAULT_CORE_ATTRIBUTE_SELECTION,
  variantAttributeSelection = DEFAULT_VARIANT_ATTRIBUTE_SELECTION
) {
  const competitorSeed = hashSeed(competitor.id)
  const synthPrice = synthCompetitorPrice(product, competitorSeed)
  const competitorTitle = synthCompetitorTitle(product, competitorSeed)
  const attributePool = categoryAttributePool(attributes, product.subCategory)

  const coreIds = coreAttributeSelection[product.subCategory] || []
  const coreChecks = coreIds
    .map(id => attributePool.find(a => a.id === id))
    .filter(a => a && a.values.length > 0)
    .map(attr => {
      const ourValue = getOurAttributeValue(product, attr)
      const competitorValue = getCompetitorAttributeValue(product, competitor, attr, ourValue, competitorSeed)
      return {
        key: attr.id, label: attr.name, unit: attr.unit,
        ourValue, competitorValue,
        score: attributeMatchScore(attr, ourValue, competitorValue),
      }
    })
  const accuracy = coreChecks.length
    ? Math.round(coreChecks.reduce((sum, c) => sum + c.score, 0) / coreChecks.length)
    : 0
  const corePass = coreChecks.length > 0 && accuracy > CORE_MATCH_THRESHOLD

  let variantResults = []
  if (corePass) {
    const variantIds = variantAttributeSelection[product.subCategory] || []
    variantResults = variantIds
      .map(id => attributePool.find(a => a.id === id))
      .filter(a => a && a.type === 'numeric' && a.values.length > 0)
      .map(attr => {
        const ourValue = getOurAttributeValue(product, attr)
        const competitorValue = getCompetitorAttributeValue(product, competitor, attr, ourValue, competitorSeed)
        const ratio = Math.round((ourValue / competitorValue) * 100) / 100
        const diffPct = Math.round((ratio - 1) * 1000) / 10
        return { key: attr.id, label: attr.name, unit: attr.unit, ourValue, competitorValue, ratio, diffPct }
      })
  }

  return { competitor, synthPrice, competitorTitle, coreChecks, accuracy, corePass, variantResults }
}

// Full stage 1 + stage 2 + price positioning for one of our products, across
// every competitor whose category list includes it. `attributes` is the
// shared, editable attribute list; `rules` is the editable Pricing Formula
// rule table (priority order = array order); `coreAttributeSelection` /
// `variantAttributeSelection` are the Spec Matching tab's category ->
// [attribute id] configs for stage 1 / stage 2 respectively. `forceStandardMargin`
// is a manual per-product override ("comparison analysis not available") —
// Stage 1 still runs and is returned in `matches` for transparency, but
// Stage 2 / pricing skips straight to the cost fallback even if competitors
// were actually found.
export function buildProductPricePosition(
  product, competitors, attributes,
  rules = DEFAULT_PRICE_POSITION_RULES,
  coreAttributeSelection = DEFAULT_CORE_ATTRIBUTE_SELECTION,
  variantAttributeSelection = DEFAULT_VARIANT_ATTRIBUTE_SELECTION,
  costFallback = null, // { cost, standardMarginPct } — used when no viable competitors are found
  forceStandardMargin = false
) {
  const attempted = competitors.filter(c => c.categories.includes(product.subCategory))
  const matches = attempted.map(c => matchCompetitorProduct(product, c, attributes, coreAttributeSelection, variantAttributeSelection))
  const viable = forceStandardMargin ? [] : matches.filter(m => m.corePass)

  if (viable.length === 0) {
    if (costFallback && costFallback.cost != null) {
      const recommendedPrice = Math.round(costFallback.cost * (1 + costFallback.standardMarginPct) * 100) / 100
      return {
        product, matches, viable, attributeResults: [],
        finalPosition: {
          key: 'standard-margin',
          label: 'Standard Margin',
          matchType: 'No competitors found',
          priceMultiplier: 1 + costFallback.standardMarginPct,
        },
        competitorAvgPrice: null,
        recommendedPrice,
        usedStandardMargin: true,
        forcedStandardMargin: forceStandardMargin,
        standardMarginPct: costFallback.standardMarginPct,
      }
    }
    return { product, matches, viable, attributeResults: [], finalPosition: null, competitorAvgPrice: null, recommendedPrice: null, usedStandardMargin: false, forcedStandardMargin: forceStandardMargin }
  }

  const variantIds = variantAttributeSelection[product.subCategory] || []
  const attributePool = categoryAttributePool(attributes, product.subCategory)
  const attributeResults = variantIds
    .map(id => attributePool.find(a => a.id === id))
    .filter(Boolean)
    .map(attr => {
      const results = viable.map(m => m.variantResults.find(v => v.key === attr.id)).filter(Boolean)
      const diffs = results.map(r => r.diffPct).filter(d => d != null)
      if (diffs.length === 0) {
        return { key: attr.id, label: attr.name, unit: attr.unit, ourValue: null, avgDiffPct: null, band: null }
      }
      const avgDiffPct = Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10
      return {
        key: attr.id, label: attr.name, unit: attr.unit,
        ourValue: results[0].ourValue,
        avgDiffPct, band: classifyDifferential(avgDiffPct, rules),
      }
    })

  const bandsPresent = new Set(attributeResults.map(a => a.band).filter(Boolean))
  const finalRule = rules.find(r => bandsPresent.has(r.key)) || rules[rules.length - 1]

  const competitorAvgPrice = Math.round((viable.reduce((a, m) => a + m.synthPrice, 0) / viable.length) * 100) / 100
  const recommendedPrice = Math.round(competitorAvgPrice * finalRule.priceMultiplier * 100) / 100

  return { product, matches, viable, attributeResults, finalPosition: finalRule, competitorAvgPrice, recommendedPrice, usedStandardMargin: false, forcedStandardMargin: false }
}

// `costRecords` (ProductCostContext) + `standardMarginPct` (PricingSettingsContext)
// are optional — when supplied, a product with zero viable competitor
// matches falls back to cost x (1 + standard margin) instead of having no
// recommended price at all. `forceStandardMarginMap` (PricingSettingsContext,
// keyed by product id) manually forces that same fallback for a specific
// product even if it does have viable competitor matches.
export function buildAllPricePositions(
  competitors, attributes,
  rules = DEFAULT_PRICE_POSITION_RULES,
  coreAttributeSelection = DEFAULT_CORE_ATTRIBUTE_SELECTION,
  variantAttributeSelection = DEFAULT_VARIANT_ATTRIBUTE_SELECTION,
  costRecords = null,
  standardMarginPct = null,
  forceStandardMarginMap = {}
) {
  return Object.fromEntries(
    mockProducts
      .filter(p => p.price > 0)
      .map(p => {
        const costFallback = costRecords && standardMarginPct != null
          ? { cost: computeCostBreakdown(costRecords[p.id])?.totalCost ?? null, standardMarginPct }
          : null
        return [
          p.id,
          buildProductPricePosition(
            p, competitors, attributes, rules, coreAttributeSelection, variantAttributeSelection,
            costFallback, !!forceStandardMarginMap[p.id]
          ),
        ]
      })
  )
}

// Per-competitor rollups shown on the Competitors table.
export function buildCompetitorStats(competitor, positions) {
  const entries = Object.values(positions)
  const attempted = entries.filter(e => e.matches.some(m => m.competitor.id === competitor.id))
  const matched = entries.filter(e => e.viable.some(m => m.competitor.id === competitor.id))
  const accuracy = attempted.length ? matched.length / attempted.length : null
  return { matchingSkus: matched.length, matchAccuracy: accuracy }
}

// Stage-1 core match detail for every one of our products attempted against
// a single competitor — the data behind the full-width "Competitor detail"
// view (Name / Core Product Match Attribute contents / % accuracy / stage-2
// eligibility per the 80% rule).
export function buildCompetitorCoreMatches(competitor, positions) {
  return Object.values(positions)
    .map(p => ({ product: p.product, match: p.matches.find(m => m.competitor.id === competitor.id) }))
    .filter(x => x.match)
    .sort((a, b) => b.match.accuracy - a.match.accuracy)
}
