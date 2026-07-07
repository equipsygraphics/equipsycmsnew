// Content shapes — determines which admin form renders for a resource type.
//
//   article              Rich text long-form content (Blogs)
//   file_list            List of downloadable PDFs from media library (Brochures, Line Drawings, Care Guides)
//   faq                  Q&A pairs tied to ProductCategories — shared with Product Category edit screen
//   photo_gallery        Project photos tied to ProductCategories — shared with Product Category edit screen
//   landing_page_reference  Filtered view into LandingPages.is_tool — no new table, no owned data
//
export const CONTENT_SHAPES = [
  { id: 'article',              label: 'Article',              description: 'Rich text long-form content with title, body and images' },
  { id: 'file_list',            label: 'File List',            description: 'List of downloadable PDFs or documents from the media library' },
  { id: 'faq',                  label: 'FAQ',                  description: 'Q&A pairs linked to Product Categories — shared with category edit screens' },
  { id: 'photo_gallery',        label: 'Photo Gallery',        description: 'Project photos linked to Product Categories — shared with category edit screens' },
  { id: 'landing_page_reference', label: 'Tool (Landing Page)', description: 'Filtered view of Landing Pages flagged as tools — no new data' },
]

// Categorization models — determines how items are grouped / filtered.
//
//   independent            Type has its own category list (stored in mockResourceCategories)
//   shared_product_category  Items link to ProductCategories (same categories as the product catalogue)
//   none                   Items are not categorised
//
// For faq and photo_gallery shapes, categorization is always shared_product_category.
// For landing_page_reference, categorization is always none.
// article and file_list may use any model.
//
export const CATEGORIZATION_MODELS = [
  { id: 'independent',            label: 'Independent',             description: 'Create a dedicated category list for this resource type' },
  { id: 'shared_product_category', label: 'Shared Product Categories', description: 'Link to existing product catalogue categories' },
  { id: 'none',                   label: 'None',                    description: 'Items are not grouped by category' },
]

// Returns the forced categorization for shapes that don't allow a choice.
// Returns null when the user may choose.
export function forcedCategorization(contentShape) {
  if (contentShape === 'faq')                  return 'shared_product_category'
  if (contentShape === 'photo_gallery')        return 'shared_product_category'
  if (contentShape === 'landing_page_reference') return 'none'
  return null
}

// Resource types — system types are built-in (system: true); admin-created types can be added.
// Module-level mutation so new types persist within the browser session.
export const mockResourceTypes = [
  { id: 'rt-1', slug: 'blogs',              name: 'Blogs',                 contentShape: 'article',              categorizationModel: 'independent',             system: true },
  { id: 'rt-2', slug: 'brochures',          name: 'Brochures',             contentShape: 'file_list',            categorizationModel: 'shared_product_category', system: true },
  { id: 'rt-3', slug: 'line-drawings',      name: 'Product Line Drawings', contentShape: 'file_list',            categorizationModel: 'shared_product_category', system: true },
  { id: 'rt-4', slug: 'tools',              name: 'Tools',                 contentShape: 'landing_page_reference', categorizationModel: 'none',                  system: true },
  { id: 'rt-5', slug: 'care-guides',        name: 'Product Care Guides',   contentShape: 'file_list',            categorizationModel: 'shared_product_category', system: true },
  { id: 'rt-6', slug: 'faq',               name: 'FAQ',                   contentShape: 'faq',                  categorizationModel: 'shared_product_category', system: true },
  { id: 'rt-7', slug: 'completed-installs', name: 'Completed Installs',    contentShape: 'photo_gallery',        categorizationModel: 'shared_product_category', system: true },
]

// Generic category table for resource types with categorizationModel = 'independent'.
// Scoped by resourceTypeId — a polymorphic approach rather than a separate table per type.
export const mockResourceCategories = [
  // Blog categories (rt-1)
  { id: 'rc-1', resourceTypeId: 'rt-1', name: 'Case Studies',  slug: 'case-studies'  },
  { id: 'rc-2', resourceTypeId: 'rt-1', name: 'Innovation',    slug: 'innovation'    },
  { id: 'rc-3', resourceTypeId: 'rt-1', name: 'News & Media',  slug: 'news-media'    },
  { id: 'rc-4', resourceTypeId: 'rt-1', name: 'Product',       slug: 'product'       },
  { id: 'rc-5', resourceTypeId: 'rt-1', name: 'Saver Living',  slug: 'saver-living'  },
  { id: 'rc-6', resourceTypeId: 'rt-1', name: 'Tips',          slug: 'tips'          },
]

// Resource items for article and file_list shapes.
// FAQ → mockFaqs in mockSharedResources.js
// Completed Installs → mockCompletedInstalls in mockSharedResources.js
// Tools → mockLandingPages.filter(p => p.isTool) in mockSharedResources.js
export const mockResources = [

  // ── Blogs (article) ──────────────────────────────────────────────────────────
  { id: 'res-1',  typeId: 'rt-1', resourceCategoryId: 'rc-3', status: 'published',
    title: 'Understanding SDA Housing Requirements',
    excerpt: 'A comprehensive guide to SDA housing requirements for accessibility modifications.',
    content: '', author: 'Sarah M.', publishedAt: '2026-06-20', tagIds: [1, 2, 3], featuredImage: null },
  { id: 'res-2',  typeId: 'rt-1', resourceCategoryId: 'rc-4', status: 'published',
    title: 'Top 5 Bathroom Safety Products for 2026',
    excerpt: '', content: '', author: 'Tom K.', publishedAt: '2026-06-18', tagIds: [4, 5], featuredImage: null },
  { id: 'res-3',  typeId: 'rt-1', resourceCategoryId: 'rc-6', status: 'published',
    title: 'How to Install Grab Rails: A Step-by-Step Guide',
    excerpt: '', content: '', author: 'Tom K.', publishedAt: '2026-06-15', tagIds: [1, 6, 7], featuredImage: null },
  { id: 'res-4',  typeId: 'rt-1', resourceCategoryId: 'rc-2', status: 'published',
    title: 'NDIS Funding for Home Modifications',
    excerpt: '', content: '', author: 'Sarah M.', publishedAt: '2026-06-12', tagIds: [2], featuredImage: null },
  { id: 'res-5',  typeId: 'rt-1', resourceCategoryId: 'rc-6', status: 'published',
    title: 'Choosing the Right Shower Seat',
    excerpt: '', content: '', author: 'Tom K.', publishedAt: '2026-06-08', tagIds: [], featuredImage: null },
  { id: 'res-6',  typeId: 'rt-1', resourceCategoryId: 'rc-6', status: 'draft',
    title: 'Anti-Slip Solutions for Every Home',
    excerpt: '', content: '', author: 'Sarah M.', publishedAt: null, tagIds: [7], featuredImage: null },
  { id: 'res-7',  typeId: 'rt-1', resourceCategoryId: null, status: 'draft',
    title: 'Ramp Specifications & Standards',
    excerpt: '', content: '', author: 'Tom K.', publishedAt: null, tagIds: [9], featuredImage: null },
  { id: 'res-8',  typeId: 'rt-1', resourceCategoryId: 'rc-4', status: 'draft',
    title: 'New Range: Concealed Fix Grab Rails',
    excerpt: '', content: '', author: 'Sarah M.', publishedAt: null, tagIds: [1], featuredImage: null },

  // ── Brochures (file_list, shared_product_category) ─────────────────────────
  { id: 'res-10', typeId: 'rt-2', productCategoryId: 3, status: 'published',
    title: 'Grab Rails Range Brochure 2026',
    description: 'Full product brochure for the 2026 Grab Rails range including new concealed-fix series.',
    files: [{ id: 'f-1', name: 'Grab-Rails-Brochure-2026.pdf', size: '3.2 MB' }] },
  { id: 'res-11', typeId: 'rt-2', productCategoryId: 4, status: 'published',
    title: 'Bathroom Safety Products Catalogue',
    description: 'Complete 2026 catalogue of bathroom safety and accessibility products.',
    files: [{ id: 'f-2', name: 'Bathroom-Safety-Catalogue-2026.pdf', size: '8.7 MB' }] },
  { id: 'res-12', typeId: 'rt-2', productCategoryId: null, status: 'draft',
    title: 'Ramp Solutions Brochure', description: '', files: [] },

  // ── Product Line Drawings (file_list, shared_product_category) ─────────────
  { id: 'res-20', typeId: 'rt-3', productCategoryId: 3, status: 'published',
    title: 'Grab Rail Line Drawings — 300 Series',
    description: 'Technical line drawings for all 300 Series grab rail configurations.',
    files: [{ id: 'f-3', name: '300-series-line-drawings.pdf', size: '1.1 MB' }] },
  { id: 'res-21', typeId: 'rt-3', productCategoryId: 3, status: 'published',
    title: 'Shower Rail Line Drawings',
    description: 'Technical line drawings for all shower rail configurations.',
    files: [{ id: 'f-4', name: 'shower-rail-line-drawings.pdf', size: '940 KB' }] },
  { id: 'res-22', typeId: 'rt-3', productCategoryId: null, status: 'draft',
    title: 'Ramp Line Drawings — Portable Range', description: '', files: [] },

  // ── Product Care Guides (file_list, shared_product_category) ───────────────
  { id: 'res-40', typeId: 'rt-5', productCategoryId: 3, status: 'published',
    title: 'Grab Rail Care & Maintenance Guide',
    description: 'Instructions for cleaning, inspecting and maintaining stainless steel grab rails.',
    files: [{ id: 'f-7', name: 'grab-rail-care-guide.pdf', size: '215 KB' }] },
  { id: 'res-41', typeId: 'rt-5', productCategoryId: 1, status: 'published',
    title: 'Aluminium Ramp Care Guide',
    description: 'Maintenance and inspection guide for portable aluminium ramps.',
    files: [{ id: 'f-8', name: 'aluminium-ramp-care-guide.pdf', size: '180 KB' }] },
]
