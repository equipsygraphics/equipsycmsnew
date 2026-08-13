# Product Pricing

Sidebar label "Product Pricing" (was "Competitor Pricing" — renamed since the page covers the full
retail/trade/bulk/MAM pricing ladder, not just competitor comparison). Route `/competitor-pricing` and the
component/folder/context names are unchanged. Sidebar under Commerce. Tab-based (`CompetitorPricing.jsx`):
**Price List, Competitors, Pricing Formula, Pricing Discounts, Spec Matching, Settings** (Price List tab =
`tabs/Overview.jsx`, was labelled "Overview").

**Pricing Discounts** (`tabs/PricingDiscounts.jsx`) also moved here — was its own sidebar page/route
(`/pricing-discounts`), now a tab since it's just another lever (Trade/Bulk/Bulk Trade/MAM discount %,
category defaults + per-product bulk edit) on the same pricing ladder this page already shows.

Note the **Spec Matching** tab here is *not* Stage 1 core / Stage 2 variant attribute selection — that
lives on the [Attributes](../attributes/Attributes.jsx) page instead ("Stage 1 Match Attributes" /
"Stage 2 Match Attributes" tabs), since it's really just another view onto the shared attribute pool and
its category assignments. This tab is the scraping **bot's crawl settings** — schedule, request
throttling/retries, and crawler identity/compliance (`tabs/SpecMatching.jsx`, config in
`CompetitorPricingConfigContext`'s `botSettings`). There's no live scraper wired up to these values; they
exist so "Scrape All Competitors" (Competitors tab) has real, editable settings behind it rather than being
purely cosmetic.

## Price List (tabs/Overview.jsx)

A sortable/searchable table of every product's full pricing ladder, based on the Figma table header
(node `2947:131963`): Name, Category, SKU, Total cost, Retail price, Retail margin, Trade discount,
Trade price, Trade margin, Bulk discount, Bulk price, Bulk margin, MAM discount, MAM price, MAM margin.
(The Figma header labelled the second-to-last column "Bulk trade discount"; it's driven by its own
independent MAM discount % — set on the [Pricing Discounts](tabs/PricingDiscounts.jsx) tab — rather than
being derived from the Bulk discount.)

`src/data/mockPricingOverview.js` derives cost and the retail/trade/bulk/MAM pricing tiers from the
shared, editable contexts (`ProductCostContext`, competitor-analysis `positions`, and
`DiscountSettingsContext`) — see the comment at the top of that file for the exact sourcing. Custom-quote
products ($0 price) render "—" instead of $0/0% margins.

## Note

An earlier prototype of this page (scrape-simulation tabs: Dashboard, Product List, Competitor List,
Pricing Formula, Pricing Output) was replaced by this structure to match the actual Figma design.
