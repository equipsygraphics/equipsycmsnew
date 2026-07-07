// Shared resource data that is referenced from BOTH:
//   1. Resources section tabs (FAQ, Completed Installs)
//   2. Product Category / Subcategory edit screens (inline view)
//
// Both locations read/write these same arrays. No sync needed.

import { mockCategories } from './mockCategories'

// Flat list of all product categories + subcategories, derived from mockCategories.
// Used as the picker source for product_category_id on FAQ and CompletedInstall items.
export const mockProductCategories = [
  // Primary categories
  ...mockCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, parentId: null })),
  // Subcategories (flattened from nested arrays)
  ...mockCategories.flatMap(c =>
    (c.subcategories ?? []).map(s => ({ id: s.id, name: s.name, slug: s.slug, parentId: c.id }))
  ),
]

// Return display label for a category id — "Primary > Sub" for subcategories.
export function getCategoryLabel(id) {
  const flat = mockProductCategories
  const cat  = flat.find(c => c.id === id)
  if (!cat) return `Category ${id}`
  if (cat.parentId == null) return cat.name
  const parent = flat.find(c => c.id === cat.parentId)
  return parent ? `${parent.name} › ${cat.name}` : cat.name
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
// Each item = one Q&A pair linked to a product category.
// typeId references a mockResourceType (rt-6 for the built-in FAQ type).
// When the Product Category edit screen needs FAQs for category X:
//   mockFaqs.filter(f => f.productCategoryId === X)
export const mockFaqs = [
  // Grab Rails (3)
  { id: 'faq-1', typeId: 'rt-6', productCategoryId: 3, status: 'published',
    question: 'What material are your grab rails made from?',
    answer: 'Our grab rails are manufactured from 304-grade stainless steel for corrosion resistance in wet areas. Selected ranges use powder-coated mild steel.' },
  { id: 'faq-2', typeId: 'rt-6', productCategoryId: 3, status: 'published',
    question: 'What diameter grab rails do you stock?',
    answer: 'We stock 25 mm, 32 mm, and 38 mm outer diameter rails. The AS1428.1 standard recommends 30–40 mm for easy gripping.' },
  { id: 'faq-3', typeId: 'rt-6', productCategoryId: 3, status: 'published',
    question: 'Do grab rails come with fixings?',
    answer: 'Yes — all grab rails include stainless steel fixings appropriate for the model. Wall plugs are included for masonry; timber-specific fixings are available separately.' },

  // Drop Down Grab Rails subcategory (303)
  { id: 'faq-4', typeId: 'rt-6', productCategoryId: 303, status: 'published',
    question: 'What load rating do your drop-down grab rails have?',
    answer: 'Our drop-down (fold-down) rails are tested to 120 kg static load per AS4586.' },
  { id: 'faq-5', typeId: 'rt-6', productCategoryId: 303, status: 'draft',
    question: 'Can a drop-down rail be installed on a tile wall?',
    answer: '' },

  // Ramps & Access (1)
  { id: 'faq-6', typeId: 'rt-6', productCategoryId: 1, status: 'published',
    question: 'What is the maximum gradient allowed for a ramp?',
    answer: 'AS1428.1 specifies a maximum gradient of 1:8 for short distances and 1:14 for ramps longer than 1.9 m. Our Ramp Gradient Calculator can help you determine the right configuration.' },
  { id: 'faq-7', typeId: 'rt-6', productCategoryId: 1, status: 'published',
    question: 'Do aluminium ramps require council approval?',
    answer: 'Portable ramps generally do not require council approval. Permanent ramps fixed to the structure may require a building permit — check with your local council.' },

  // Accessible Shower (4)
  { id: 'faq-8', typeId: 'rt-6', productCategoryId: 4, status: 'published',
    question: 'What is the weight capacity for fold-down shower seats?',
    answer: 'Our fold-down shower seats are rated to 150 kg SWL and comply with AS4586.' },
]

// ── Completed Installs ─────────────────────────────────────────────────────────
// Each item = one project photo linked to a product category.
// typeId references a mockResourceType (rt-7 for the built-in Completed Installs type).
export const mockCompletedInstalls = [
  // Grab Rails (3)
  { id: 'ci-1', typeId: 'rt-7', productCategoryId: 3, status: 'published',
    title: 'Bathroom Renovation — Paddington, Sydney',
    caption: 'Completed shower recess with fold-down seat and angled grab rail',
    mediaUrl: null,
    projectDetail: 'Full wet area fitout for an NDIS participant including QuickInstall grab rails and fold-down shower seat.' },
  { id: 'ci-2', typeId: 'rt-7', productCategoryId: 303, status: 'published',
    title: 'Master Bathroom — Gold Coast',
    caption: 'Drop-down grab rail installed alongside existing fixture rail',
    mediaUrl: null,
    projectDetail: 'Drop-down rail installation for aged care client with limited upper body strength.' },

  // Ramps (1)
  { id: 'ci-3', typeId: 'rt-7', productCategoryId: 1, status: 'published',
    title: 'Front Entry Ramp — Brisbane',
    caption: 'Portable aluminium ramp at front entry with safety handrail extensions',
    mediaUrl: null,
    projectDetail: 'Portable ramp installation for front entry access for aged care resident.' },
  { id: 'ci-4', typeId: 'rt-7', productCategoryId: 102, status: 'published',
    title: 'Driveway Access Ramp — Melbourne',
    caption: 'Custom-length aluminium ramp spanning 2.4 m level change',
    mediaUrl: null,
    projectDetail: 'Aluminium ramp for wheelchair user transitioning from driveway to garage access.' },

  // Accessible Shower (4)
  { id: 'ci-5', typeId: 'rt-7', productCategoryId: 404, status: 'draft',
    title: 'Shower Seat Install — Adelaide',
    caption: '',
    mediaUrl: null,
    projectDetail: '' },
]

// ── Landing Pages ──────────────────────────────────────────────────────────────
// LandingPages where isTool = true appear in Resources > Tools tab.
// Other landing pages (isTool = false) are marketing/campaign pages managed separately.
export const mockLandingPages = [
  { id: 'lp-1', isTool: true,  status: 'published', title: 'Ramp Gradient Calculator',
    slug: 'ramp-gradient-calculator',
    description: 'Interactive tool to calculate ramp gradients to AS1428 standards given a height and available run length.' },
  { id: 'lp-2', isTool: true,  status: 'published', title: 'Grab Rail Finder',
    slug: 'grab-rail-finder',
    description: 'Answer a few questions about your bathroom and we\'ll recommend the right grab rail configuration.' },
  { id: 'lp-3', isTool: true,  status: 'draft',     title: 'NDIS Funding Estimator',
    slug: 'ndis-funding-estimator',
    description: 'Estimate potential NDIS funding for home modification products based on your plan type.' },
  { id: 'lp-4', isTool: false, status: 'published', title: 'NDIS Landing Page',
    slug: 'ndis',
    description: '' },
  { id: 'lp-5', isTool: false, status: 'published', title: 'OT Resources Hub',
    slug: 'ot-resources',
    description: '' },
]
