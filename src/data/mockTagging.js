// ── Utility ───────────────────────────────────────────────────────────────────

export function toSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export const mockTags = [
  { id: 1,  name: 'Grab Rails',          slug: 'grab-rails',          description: 'Grab rails and hand supports for bathrooms, toilets, and showers' },
  { id: 2,  name: 'NDIS',               slug: 'ndis',                description: 'National Disability Insurance Scheme funded products and guides' },
  { id: 3,  name: 'Aged Care',           slug: 'aged-care',           description: 'Products and content suited to aged care and senior living' },
  { id: 4,  name: 'Bathroom Safety',     slug: 'bathroom-safety',     description: 'Bathroom accessibility and safety products' },
  { id: 5,  name: 'Wet Area',            slug: 'wet-area',            description: 'Wet area and shower-zone products and installation guides' },
  { id: 6,  name: 'DIY Install',         slug: 'diy-install',         description: 'Products and guides suitable for DIY installation' },
  { id: 7,  name: 'Anti-Slip',           slug: 'anti-slip',           description: 'Anti-slip surfaces, coatings, tape, and mats' },
  { id: 8,  name: 'Shower Rails',        slug: 'shower-rails',        description: 'Rails and supports specifically for shower and wet areas' },
  { id: 9,  name: 'Ramps',               slug: 'ramps',               description: 'Portable, modular, and threshold access ramps' },
  { id: 10, name: 'AS1428 Compliant',    slug: 'as1428',              description: 'Products and guides meeting AS1428 accessibility standards' },
  { id: 11, name: 'Step Nosings',        slug: 'step-nosings',        description: 'Stair nosings, edge protectors, and step safety products' },
  { id: 12, name: 'Shower Seats',        slug: 'shower-seats',        description: 'Shower seats, benches, and fold-down seating' },
  { id: 13, name: 'Ramp Calculator',     slug: 'ramp-calculator',     description: 'Related to the online ramp rise/run calculator tool' },
  { id: 14, name: 'Accessible Bathroom', slug: 'accessible-bathroom', description: 'Accessible bathroom design — full room guides and product bundles' },
  { id: 15, name: 'Builder Pack',        slug: 'builder-pack',        description: 'Content relevant to builders, certifiers, and contractors' },
  { id: 16, name: 'OT Recommended',      slug: 'ot-recommended',      description: 'Products and guides recommended by occupational therapists' },
  { id: 17, name: 'Handrails',           slug: 'handrails',           description: 'Internal and external handrails for stairs and ramps' },
  { id: 18, name: 'Lever Taps',          slug: 'lever-taps',          description: 'Lever-action tapware for accessible bathrooms and kitchens' },
  { id: 19, name: 'Concealed Fix',        slug: 'concealed-fix',        description: 'Concealed-fixings range — no exposed screws or flanges' },
  { id: 21, name: 'Daily Living Aids',    slug: 'daily-living-aids',    description: 'Assistive devices and technology for independent daily living' },
  { id: 22, name: 'Door Hardware',        slug: 'door-hardware',        description: 'Accessible door handles, hinges, pull straps, and door magnets' },
]

// ── Category ↔ Tag links (explicit pivot) ────────────────────────────────────
// weight: higher = surfaces first in related content queries

export const mockCategoryTagLinks = [
  // Cat 1: Ramps & Access → primary: Ramps
  { categoryId: 1, tagId: 9,  weight: 10 }, // Ramps (primary)
  { categoryId: 1, tagId: 13, weight: 9  }, // Ramp Calculator
  { categoryId: 1, tagId: 7,  weight: 8  }, // Anti-Slip
  { categoryId: 1, tagId: 10, weight: 7  }, // AS1428 Compliant
  { categoryId: 1, tagId: 17, weight: 6  }, // Handrails
  { categoryId: 1, tagId: 6,  weight: 5  }, // DIY Install
  { categoryId: 1, tagId: 15, weight: 4  }, // Builder Pack

  // Cat 2: Steps, Nosings & Transitions → primary: Step Nosings
  { categoryId: 2, tagId: 11, weight: 10 }, // Step Nosings (primary)
  { categoryId: 2, tagId: 7,  weight: 9  }, // Anti-Slip
  { categoryId: 2, tagId: 10, weight: 7  }, // AS1428 Compliant
  { categoryId: 2, tagId: 6,  weight: 6  }, // DIY Install
  { categoryId: 2, tagId: 15, weight: 4  }, // Builder Pack

  // Cat 3: Grab Rails & Hand Support → primary: Grab Rails
  { categoryId: 3, tagId: 1,  weight: 10 }, // Grab Rails (primary)
  { categoryId: 3, tagId: 8,  weight: 9  }, // Shower Rails
  { categoryId: 3, tagId: 4,  weight: 8  }, // Bathroom Safety
  { categoryId: 3, tagId: 14, weight: 7  }, // Accessible Bathroom
  { categoryId: 3, tagId: 19, weight: 6  }, // Concealed Fix
  { categoryId: 3, tagId: 16, weight: 6  }, // OT Recommended
  { categoryId: 3, tagId: 6,  weight: 5  }, // DIY Install
  { categoryId: 3, tagId: 2,  weight: 4  }, // NDIS

  // Cat 4: Accessible Shower & Wet Areas → primary: Wet Area
  { categoryId: 4, tagId: 5,  weight: 10 }, // Wet Area (primary)
  { categoryId: 4, tagId: 12, weight: 9  }, // Shower Seats
  { categoryId: 4, tagId: 8,  weight: 8  }, // Shower Rails
  { categoryId: 4, tagId: 4,  weight: 8  }, // Bathroom Safety
  { categoryId: 4, tagId: 14, weight: 7  }, // Accessible Bathroom
  { categoryId: 4, tagId: 2,  weight: 5  }, // NDIS

  // Cat 5: Taps and Bathroom Solutions → primary: Lever Taps
  { categoryId: 5, tagId: 18, weight: 10 }, // Lever Taps (primary)
  { categoryId: 5, tagId: 4,  weight: 9  }, // Bathroom Safety
  { categoryId: 5, tagId: 14, weight: 7  }, // Accessible Bathroom
  { categoryId: 5, tagId: 5,  weight: 6  }, // Wet Area
  { categoryId: 5, tagId: 16, weight: 5  }, // OT Recommended

  // Cat 6: Assistive Technology → primary: Daily Living Aids
  { categoryId: 6, tagId: 21, weight: 10 }, // Daily Living Aids (primary)
  { categoryId: 6, tagId: 2,  weight: 8  }, // NDIS
  { categoryId: 6, tagId: 16, weight: 7  }, // OT Recommended
  { categoryId: 6, tagId: 3,  weight: 6  }, // Aged Care

  // Cat 7: Door Solutions → primary: Door Hardware
  { categoryId: 7, tagId: 22, weight: 10 }, // Door Hardware (primary)
  { categoryId: 7, tagId: 10, weight: 7  }, // AS1428 Compliant
  { categoryId: 7, tagId: 6,  weight: 6  }, // DIY Install
  { categoryId: 7, tagId: 15, weight: 5  }, // Builder Pack
]

// ── Content ↔ Tag links (polymorphic pivot) ───────────────────────────────────
// contentType: 'article' | 'page' | 'tool'
// featured: true = surfaces this item first for matching categories
// weight: secondary ordering within same type

export const mockContentTagLinks = [
  // Articles (blog posts)
  { tagId: 1,  contentType: 'article', contentId: 1, featured: true,  weight: 10 },
  { tagId: 3,  contentType: 'article', contentId: 1, featured: false, weight: 8  },
  { tagId: 2,  contentType: 'article', contentId: 1, featured: false, weight: 7  },

  { tagId: 4,  contentType: 'article', contentId: 2, featured: true,  weight: 10 },
  { tagId: 5,  contentType: 'article', contentId: 2, featured: false, weight: 8  },
  { tagId: 12, contentType: 'article', contentId: 2, featured: false, weight: 7  },
  { tagId: 14, contentType: 'article', contentId: 2, featured: false, weight: 6  },

  { tagId: 8,  contentType: 'article', contentId: 3, featured: true,  weight: 10 },
  { tagId: 6,  contentType: 'article', contentId: 3, featured: false, weight: 8  },
  { tagId: 7,  contentType: 'article', contentId: 3, featured: false, weight: 7  },
  { tagId: 4,  contentType: 'article', contentId: 3, featured: false, weight: 6  },

  { tagId: 2,  contentType: 'article', contentId: 4, featured: true,  weight: 10 },
  { tagId: 1,  contentType: 'article', contentId: 4, featured: false, weight: 8  },
  { tagId: 3,  contentType: 'article', contentId: 4, featured: false, weight: 7  },

  { tagId: 12, contentType: 'article', contentId: 5, featured: true,  weight: 10 },
  { tagId: 4,  contentType: 'article', contentId: 5, featured: false, weight: 8  },
  { tagId: 5,  contentType: 'article', contentId: 5, featured: false, weight: 7  },

  { tagId: 9,  contentType: 'article', contentId: 7, featured: false, weight: 10 },
  { tagId: 10, contentType: 'article', contentId: 7, featured: false, weight: 8  },
  { tagId: 5,  contentType: 'article', contentId: 7, featured: false, weight: 6  },
  { tagId: 6,  contentType: 'article', contentId: 7, featured: false, weight: 5  },

  // Pages
  { tagId: 2,  contentType: 'page', contentId: 4,  featured: true,  weight: 10 },
  { tagId: 1,  contentType: 'page', contentId: 4,  featured: false, weight: 7  },
  { tagId: 3,  contentType: 'page', contentId: 4,  featured: false, weight: 6  },

  { tagId: 15, contentType: 'page', contentId: 5,  featured: true,  weight: 10 },
  { tagId: 1,  contentType: 'page', contentId: 5,  featured: false, weight: 7  },
  { tagId: 2,  contentType: 'page', contentId: 5,  featured: false, weight: 6  },

  { tagId: 8,  contentType: 'page', contentId: 8,  featured: true,  weight: 10 },
  { tagId: 6,  contentType: 'page', contentId: 8,  featured: false, weight: 9  },
  { tagId: 7,  contentType: 'page', contentId: 8,  featured: false, weight: 7  },
  { tagId: 4,  contentType: 'page', contentId: 8,  featured: false, weight: 6  },

  { tagId: 14, contentType: 'page', contentId: 9,  featured: true,  weight: 10 },
  { tagId: 4,  contentType: 'page', contentId: 9,  featured: false, weight: 9  },
  { tagId: 8,  contentType: 'page', contentId: 9,  featured: false, weight: 7  },
  { tagId: 5,  contentType: 'page', contentId: 9,  featured: false, weight: 6  },

  { tagId: 15, contentType: 'page', contentId: 10, featured: false, weight: 8  },
  { tagId: 16, contentType: 'page', contentId: 10, featured: false, weight: 7  },

  // Ramp Calculator landing page (page 7) — tool is embedded in the page
  { tagId: 13, contentType: 'page', contentId: 7, featured: true,  weight: 10 },
  { tagId: 9,  contentType: 'page', contentId: 7, featured: false, weight: 9  },
]

// ── Service functions ─────────────────────────────────────────────────────────

// Returns per-type usage counts for a single tag
export function computeTagUsage(tagId, contentTagLinks = mockContentTagLinks) {
  const links = contentTagLinks.filter(l => l.tagId === tagId)
  return {
    articles: new Set(links.filter(l => l.contentType === 'article').map(l => l.contentId)).size,
    pages:    new Set(links.filter(l => l.contentType === 'page').map(l => l.contentId)).size,
    tools:    new Set(links.filter(l => l.contentType === 'tool').map(l => l.contentId)).size,
    total:    new Set(links.map(l => `${l.contentType}:${l.contentId}`)).size,
  }
}

// Returns category IDs linked to a tag
export function getTagCategoryIds(tagId, categoryTagLinks = mockCategoryTagLinks) {
  return categoryTagLinks.filter(l => l.tagId === tagId).map(l => l.categoryId)
}

// Returns tag IDs linked to a category
export function getCategoryTagIds(categoryId, categoryTagLinks = mockCategoryTagLinks) {
  return categoryTagLinks.filter(l => l.categoryId === categoryId).map(l => l.tagId)
}

// Given a product category, return related content sorted by shared-tag score.
// Results are grouped by contentType and ready to hydrate from mockBlogPosts / mockPages.
export function getRelatedContent(categoryId, { categoryTagLinks = mockCategoryTagLinks, contentTagLinks = mockContentTagLinks } = {}) {
  const catLinks = categoryTagLinks.filter(l => l.categoryId === categoryId)
  if (catLinks.length === 0) return { articles: [], pages: [], tools: [] }

  const catTagWeight = Object.fromEntries(catLinks.map(l => [l.tagId, l.weight]))
  const catTagIds = new Set(Object.keys(catTagWeight).map(Number))

  // Score each content item: sum of (catTagWeight × contentWeight) across shared tags
  const scoreMap = {}
  for (const link of contentTagLinks) {
    if (!catTagIds.has(link.tagId)) continue
    const key = `${link.contentType}:${link.contentId}`
    if (!scoreMap[key]) {
      scoreMap[key] = { score: 0, featured: false, contentType: link.contentType, contentId: link.contentId }
    }
    scoreMap[key].score += (catTagWeight[link.tagId] ?? 1) * (link.weight ?? 1)
    if (link.featured) scoreMap[key].featured = true
  }

  const sorted = Object.values(scoreMap).sort((a, b) =>
    (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.score - a.score
  )

  return {
    articles: sorted.filter(x => x.contentType === 'article'),
    pages:    sorted.filter(x => x.contentType === 'page'),
    tools:    sorted.filter(x => x.contentType === 'tool'),
  }
}
