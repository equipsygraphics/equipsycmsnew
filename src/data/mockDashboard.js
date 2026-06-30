// ── Essential KPI metrics (Revenue, Orders, AOV) ──────────────────────────────
export const kpiEssentials = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$24,830',
    sub: 'vs $21,594 prev. period',
    trend: +15,
    sparkline: [800, 950, 870, 1100, 1050, 1280, 1200, 1350, 1100, 1280],
    color: '#17B26A',
  },
  {
    id: 'orders',
    label: 'Total Orders',
    value: '148',
    sub: 'vs 164 prev. period',
    trend: -10,
    sparkline: [30, 28, 32, 25, 27, 22, 24, 20, 18, 14],
    color: '#F04438',
  },
  {
    id: 'aov',
    label: 'Avg. Order Value',
    value: '$167.77',
    sub: 'vs $131.67 prev. period',
    trend: +6,
    sparkline: [150, 155, 148, 162, 158, 170, 165, 173, 160, 168],
    color: '#17B26A',
  },
]

// ── Optional KPI: Products Sold ───────────────────────────────────────────────
export const kpiProductsSold = {
  id: 'products_sold',
  label: 'Products Sold',
  value: '214',
  sub: 'vs 198 prev. period',
  trend: +8,
  sparkline: [18, 22, 20, 25, 23, 27, 25, 28, 26, 30],
  color: '#17B26A',
}

// Alias for legacy imports
export const kpiMetrics = kpiEssentials

// ── Action queue data ─────────────────────────────────────────────────────────
export const ordersAwaiting = { processing: 7, shipment: 4 }

export const pendingRequests = [
  { type: 'Quote',         count: 5,  to: '/quote-requests' },
  { type: 'Trade Account', count: 3,  to: '/trade-account' },
  { type: 'Builder Pack',  count: 2,  to: '/builder-pack' },
]

// ── Customer & vendor ─────────────────────────────────────────────────────────
export const customerBreakdown = [
  { name: 'Builder',  value: 38, color: '#0b9ff9' },
  { name: 'OT',       value: 25, color: '#1F2A37' },
  { name: 'Private',  value: 20, color: '#9BD7FD' },
  { name: 'HCP',      value: 12, color: '#cdebfe' },
  { name: 'Others',   value:  5, color: '#E5E7EB' },
]

export const vendorRating = [
  { month: 'Jan', yours: 62, industry: 45 },
  { month: 'Feb', yours: 65, industry: 47 },
  { month: 'Mar', yours: 68, industry: 48 },
  { month: 'Apr', yours: 64, industry: 50 },
  { month: 'May', yours: 70, industry: 51 },
  { month: 'Jun', yours: 72, industry: 52 },
  { month: 'Jul', yours: 75, industry: 53 },
  { month: 'Aug', yours: 73, industry: 55 },
  { month: 'Sep', yours: 78, industry: 56 },
  { month: 'Oct', yours: 80, industry: 57 },
  { month: 'Nov', yours: 82, industry: 58 },
  { month: 'Dec', yours: 85, industry: 60 },
]

// ── Revenue chart ─────────────────────────────────────────────────────────────
export const revenueByMonth = [
  { month: 'Jan', online: 4200, trade: 2800, quote: 1400 },
  { month: 'Feb', online: 5100, trade: 3200, quote: 1900 },
  { month: 'Mar', online: 4700, trade: 2900, quote: 1600 },
  { month: 'Apr', online: 5800, trade: 3600, quote: 2100 },
  { month: 'May', online: 5400, trade: 3400, quote: 1800 },
  { month: 'Jun', online: 6200, trade: 4100, quote: 2300 },
  { month: 'Jul', online: 5900, trade: 3800, quote: 2000 },
  { month: 'Aug', online: 6800, trade: 4400, quote: 2500 },
  { month: 'Sep', online: 6300, trade: 4000, quote: 2200 },
  { month: 'Oct', online: 7200, trade: 4700, quote: 2700 },
  { month: 'Nov', online: 6900, trade: 4500, quote: 2400 },
  { month: 'Dec', online: 7800, trade: 5100, quote: 2900 },
]

// ── Recent orders ─────────────────────────────────────────────────────────────
export const recentOrders = [
  { id: '#1048', customer: 'James Thornton',  date: '24 Jun 2026', items: 3, total: '$842.00',   status: 'processing' },
  { id: '#1047', customer: 'Sarah Mitchell',  date: '23 Jun 2026', items: 1, total: '$289.00',   status: 'pending' },
  { id: '#1046', customer: 'MedEquip Pty Ltd',date: '23 Jun 2026', items: 5, total: '$3,140.00', status: 'shipped' },
  { id: '#1045', customer: 'Rebecca Chan',    date: '22 Jun 2026', items: 2, total: '$674.00',   status: 'delivered' },
  { id: '#1044', customer: 'SDA Living',      date: '22 Jun 2026', items: 7, total: '$5,820.00', status: 'processing' },
]

// ── Low stock ─────────────────────────────────────────────────────────────────
export const lowStock = [
  { name: 'Bathroom Grab Rail 300mm', sku: 'BGR-300', stock: 2,  threshold: 10 },
  { name: 'Aluminium Threshold Ramp', sku: 'ATR-001', stock: 3,  threshold: 8  },
  { name: 'Anti-Slip Mat Large',      sku: 'ASM-L',   stock: 1,  threshold: 5  },
  { name: 'Folding Shower Seat',      sku: 'FSS-01',  stock: 4,  threshold: 10 },
  { name: 'Handheld Shower Holder',   sku: 'HSH-01',  stock: 6,  threshold: 12 },
]

// ── Traffic ───────────────────────────────────────────────────────────────────
export const trafficSources = [
  { source: 'Organic Search', sessions: 3240, pct: 48 },
  { source: 'Direct',         sessions: 1890, pct: 28 },
  { source: 'Referral',       sessions:  810, pct: 12 },
  { source: 'Social',         sessions:  540, pct:  8 },
  { source: 'Email',          sessions:  270, pct:  4 },
]

// ── Quick actions ─────────────────────────────────────────────────────────────
export const quickActions = [
  { label: 'Add Product',    icon: 'plus',     to: '/products/new',    color: 'brand' },
  { label: 'New Blog Post',  icon: 'edit',     to: '/blog/new',        color: 'default' },
  { label: 'Process Orders', icon: 'package',  to: '/orders',          color: 'default' },
  { label: 'View Requests',  icon: 'inbox',    to: '/quote-requests',  color: 'default' },
]

// ── Widget catalog & defaults ─────────────────────────────────────────────────
export const WIDGET_CATALOG = [
  // Essential (default ON)
  { id: 'kpi',           label: 'Revenue, Orders & AOV',  size: 'full',       essential: true  },
  { id: 'action_queue',  label: 'Action Queue',           size: 'full',       essential: true  },
  { id: 'recent_orders', label: 'Recent Orders',          size: 'half',       essential: true  },
  { id: 'low_stock',     label: 'Low Stock Alerts',       size: 'half',       essential: true  },
  { id: 'quick_actions', label: 'Quick Actions',          size: 'full',       essential: true  },
  // Optional (default OFF)
  { id: 'kpi_products',  label: 'Products Sold',          size: 'third',      essential: false },
  { id: 'customer',      label: 'Customer Breakdown',     size: 'third',      essential: false },
  { id: 'vendor',        label: 'Vendor Rating',          size: 'two-thirds', essential: false },
  { id: 'revenue',       label: 'Revenue Summary Chart',  size: 'full',       essential: false },
  { id: 'traffic',       label: 'Traffic Summary',        size: 'half',       essential: false },
]

export const DEFAULT_WIDGETS = WIDGET_CATALOG.filter(w => w.essential).map(w => w.id)
