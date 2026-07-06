export const BLOG_CATEGORIES = ['Case Studies', 'Innovation', 'News & Media', 'Product', 'Saver Living', 'Tips']

export const mockBlogPosts = [
  { id: 1, title: 'Understanding SDA Housing Requirements', category: 'Case Studies', author: 'Sarah M.', date: '20 Jun 2026', status: 'published', featuredImage: null, tags: ['SDA', 'Housing'], excerpt: 'A comprehensive guide to SDA housing requirements for accessibility modifications.', content: '' },
  { id: 2, title: 'Top 5 Bathroom Safety Products for 2026', category: 'Product', author: 'Tom K.', date: '18 Jun 2026', status: 'published', featuredImage: null, tags: ['Bathroom', 'Safety'], excerpt: '', content: '' },
  { id: 3, title: 'How to Install Grab Rails: A Guide', category: 'Tips', author: 'Tom K.', date: '15 Jun 2026', status: 'published', featuredImage: null, tags: ['Installation', 'DIY'], excerpt: '', content: '' },
  { id: 4, title: 'NDIS Funding for Home Modifications', category: 'News & Media', author: 'Sarah M.', date: '12 Jun 2026', status: 'published', featuredImage: null, tags: ['NDIS', 'Funding'], excerpt: '', content: '' },
  { id: 5, title: 'Choosing the Right Shower Seat', category: 'Tips', author: 'Tom K.', date: '8 Jun 2026', status: 'published', featuredImage: null, tags: ['Shower Seats'], excerpt: '', content: '' },
  { id: 6, title: 'Anti-Slip Solutions for Every Home', category: 'Saver Living', author: 'Sarah M.', date: null, status: 'draft', featuredImage: null, tags: ['Anti-Slip'], excerpt: '', content: '' },
  { id: 7, title: 'Ramp Specifications & Standards', category: 'Innovation', author: 'Tom K.', date: null, status: 'draft', featuredImage: null, tags: ['Ramps', 'Standards'], excerpt: '', content: '' },
  { id: 8, title: 'New Range: Concealed Fix Grab Rails', category: 'Product', author: 'Sarah M.', date: null, status: 'draft', featuredImage: null, tags: ['Grab Rails'], excerpt: '', content: '' },
]

export { mockTags } from './mockTagging'

export const PAGE_TEMPLATES = [
  { value: 'standard', label: 'Standard Page', desc: 'Title, description, content blocks, CTA' },
  { value: 'landing', label: 'Landing Page', desc: 'Hero banner, features, testimonials, CTA' },
  { value: 'contact', label: 'Contact Page', desc: 'Contact form, map, office details' },
  { value: 'about', label: 'About Page', desc: 'Team, mission, company history' },
]

export const mockPages = [
  { id: 1, title: 'Home', template: 'landing', slug: '/', status: 'published', updatedAt: '20 Jun 2026' },
  { id: 2, title: 'About Us', template: 'about', slug: '/about', status: 'published', updatedAt: '10 Jun 2026' },
  { id: 3, title: 'Contact', template: 'contact', slug: '/contact', status: 'published', updatedAt: '8 Jun 2026' },
  { id: 4, title: 'NDIS Information', template: 'standard', slug: '/ndis', status: 'published', updatedAt: '5 Jun 2026' },
  { id: 5, title: 'Builder Pack', template: 'landing', slug: '/builder-pack', status: 'published', updatedAt: '1 Jun 2026' },
  { id: 6, title: 'Trade Programme', template: 'landing', slug: '/trade', status: 'draft', updatedAt: '28 May 2026' },
  { id: 7, title: 'Ramp Calculator', template: 'landing', slug: '/ramp-calculator', status: 'published', updatedAt: '15 Jun 2026' },
  { id: 8, title: 'Grab Rail Installation Guide', template: 'standard', slug: '/grab-rail-guide', status: 'published', updatedAt: '10 Jun 2026' },
  { id: 9, title: 'Accessible Bathroom Guide', template: 'landing', slug: '/accessible-bathroom', status: 'published', updatedAt: '12 Jun 2026' },
  { id: 10, title: 'Trade Account', template: 'landing', slug: '/trade-account', status: 'published', updatedAt: '1 Jun 2026' },
  { id: 11, title: 'Clearance Sale', template: 'landing', slug: '/clearance-sale', status: 'published', updatedAt: '20 Jun 2026' },
]

const MIME_COLORS = { JPG: 'bg-brand-50', PNG: 'bg-brand-50', SVG: 'bg-success-500/10', PDF: 'bg-error-500/10', DOC: 'bg-warning-500/10' }

export const mockMediaFiles = [
  { id: 1, name: 'shower-seat-hero.jpg', type: 'JPG', size: '1.2 MB', dimensions: '1920 × 1080 px', uploaded: '12 Jun 2026', folder: 'Product Photos', tags: [] },
  { id: 2, name: 'grab-rail-600.jpg', type: 'JPG', size: '840 KB', dimensions: '1200 × 800 px', uploaded: '11 Jun 2026', folder: 'Product Photos', tags: [] },
  { id: 3, name: 'chrome-rail-450.jpg', type: 'JPG', size: '920 KB', dimensions: '1200 × 800 px', uploaded: '11 Jun 2026', folder: 'Product Photos', tags: [] },
  { id: 4, name: 'ramp-install.jpg', type: 'JPG', size: '2.1 MB', dimensions: '1920 × 1280 px', uploaded: '10 Jun 2026', folder: 'Completed Installs', tags: ['Installation'] },
  { id: 5, name: 'bathroom-package.jpg', type: 'JPG', size: '1.8 MB', dimensions: '1920 × 1080 px', uploaded: '9 Jun 2026', folder: 'Banners', tags: [] },
  { id: 6, name: 'equipsy-logo.svg', type: 'SVG', size: '12 KB', dimensions: 'Vector', uploaded: '1 Jan 2026', folder: 'Brand', tags: [] },
  { id: 7, name: 'toilet-rail-90.jpg', type: 'JPG', size: '760 KB', dimensions: '1200 × 800 px', uploaded: '8 Jun 2026', folder: 'Product Photos', tags: [] },
  { id: 8, name: 'anti-slip-mat.jpg', type: 'JPG', size: '520 KB', dimensions: '1200 × 800 px', uploaded: '7 Jun 2026', folder: 'Product Photos', tags: [] },
  { id: 9, name: 'frp-ramp.jpg', type: 'JPG', size: '1.4 MB', dimensions: '1920 × 1080 px', uploaded: '6 Jun 2026', folder: 'Product Photos', tags: [] },
  { id: 10, name: 'product-guide.pdf', type: 'PDF', size: '4.2 MB', dimensions: '—', uploaded: '5 Jun 2026', folder: 'Resources', tags: ['Guide'] },
  { id: 11, name: 'shower-mat.jpg', type: 'JPG', size: '480 KB', dimensions: '1200 × 800 px', uploaded: '4 Jun 2026', folder: 'Product Photos', tags: [] },
  { id: 12, name: 'grab-rail-kit.jpg', type: 'JPG', size: '1.1 MB', dimensions: '1920 × 1080 px', uploaded: '3 Jun 2026', folder: 'Completed Installs', tags: ['Installation'] },
]

export const MEDIA_FOLDERS = ['All Files', 'Product Photos', 'Completed Installs', 'Banners', 'Resources', 'Brand']
export { MIME_COLORS }
