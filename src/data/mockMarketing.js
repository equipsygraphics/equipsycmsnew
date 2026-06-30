export const mockCampaigns = [
  { id: 1, name: 'EOFY Sale 2026', type: 'Promotional', status: 'active', audience: 'All Customers', sent: 3842, opens: 1421, clicks: 387, startDate: '1 Jun 2026', endDate: '30 Jun 2026' },
  { id: 2, name: 'NDIS Provider Newsletter — Jun', type: 'Newsletter', status: 'sent', audience: 'NDIS Providers', sent: 512, opens: 298, clicks: 74, startDate: '15 Jun 2026', endDate: null },
  { id: 3, name: 'New Grab Rail Range Launch', type: 'Product Launch', status: 'sent', audience: 'Trade Customers', sent: 890, opens: 445, clicks: 156, startDate: '10 Jun 2026', endDate: null },
  { id: 4, name: 'Winter Safety Tips', type: 'Newsletter', status: 'draft', audience: 'All Customers', sent: 0, opens: 0, clicks: 0, startDate: null, endDate: null },
  { id: 5, name: 'Trade Partner Exclusive — July', type: 'Promotional', status: 'scheduled', audience: 'Trade Customers', sent: 0, opens: 0, clicks: 0, startDate: '1 Jul 2026', endDate: '31 Jul 2026' },
]

export const CAMPAIGN_TYPES = ['Promotional', 'Newsletter', 'Product Launch', 'Transactional']
export const AUDIENCE_TYPES = ['All Customers', 'Trade Customers', 'NDIS Providers', 'SDA Providers', 'Retail Customers']

export const mockCoupons = [
  { id: 1, code: 'EOFY20', type: 'percentage', value: 20, minOrder: 100, usageLimit: 500, usedCount: 287, status: 'active', expires: '30 Jun 2026', description: 'EOFY 20% off' },
  { id: 2, code: 'TRADE10', type: 'percentage', value: 10, minOrder: 0, usageLimit: null, usedCount: 142, status: 'active', expires: null, description: 'Trade customer discount' },
  { id: 3, code: 'FREESHIP', type: 'free_shipping', value: 0, minOrder: 200, usageLimit: 200, usedCount: 200, status: 'expired', expires: '1 Jun 2026', description: 'Free shipping promo' },
  { id: 4, code: 'GRAB50', type: 'fixed', value: 50, minOrder: 300, usageLimit: 100, usedCount: 23, status: 'active', expires: '31 Jul 2026', description: '$50 off grab rail orders' },
  { id: 5, code: 'NDIS15', type: 'percentage', value: 15, minOrder: 0, usageLimit: null, usedCount: 67, status: 'active', expires: null, description: 'NDIS provider discount' },
]

export const EMAIL_TEMPLATES = [
  { id: 1, name: 'Order Confirmation', trigger: 'On order placed', status: 'active', lastEdited: '1 Jun 2026' },
  { id: 2, name: 'Shipping Notification', trigger: 'On shipment dispatched', status: 'active', lastEdited: '5 Jun 2026' },
  { id: 3, name: 'Quote Response', trigger: 'Manual — quote reply', status: 'active', lastEdited: '10 Jun 2026' },
  { id: 4, name: 'Trade Account Approved', trigger: 'On trade account approval', status: 'active', lastEdited: '3 Jun 2026' },
  { id: 5, name: 'Trade Account Declined', trigger: 'On trade account decline', status: 'active', lastEdited: '3 Jun 2026' },
  { id: 6, name: 'Password Reset', trigger: 'On password reset request', status: 'active', lastEdited: '1 Jan 2026' },
  { id: 7, name: 'Welcome Email', trigger: 'On account creation', status: 'draft', lastEdited: '20 Jun 2026' },
  { id: 8, name: 'Abandoned Cart', trigger: 'On cart abandoned (24h)', status: 'draft', lastEdited: '18 Jun 2026' },
]

export const mockSubscribers = [
  { id: 1, email: 'procurement@sdaliving.com.au', name: 'Michael Chen', type: 'Trade', status: 'subscribed', joinDate: '1 Jun 2026', tags: ['NDIS', 'Trade'] },
  { id: 2, email: 'orders@dswa.org.au', name: 'Amy Richards', type: 'SDA Provider', status: 'subscribed', joinDate: '3 Jun 2026', tags: ['SDA'] },
  { id: 3, email: 'james.thornton@email.com', name: 'James Thornton', type: 'Retail', status: 'subscribed', joinDate: '17 Jun 2026', tags: [] },
  { id: 4, email: 'sandra@peninsulaac.com.au', name: 'Sandra Walsh', type: 'Aged Care', status: 'subscribed', joinDate: '5 Jun 2026', tags: ['Trade'] },
  { id: 5, email: 'info@ndisaccess.com.au', name: 'NDIS Access Group', type: 'SDA Provider', status: 'unsubscribed', joinDate: '1 May 2026', tags: ['NDIS', 'SDA'] },
  { id: 6, email: 'dave@landmark.com.au', name: 'Dave Nguyen', type: 'Builder', status: 'subscribed', joinDate: '20 Jun 2026', tags: ['Builder'] },
  { id: 7, email: 'karen@blueprint.com.au', name: 'Karen Smith', type: 'Builder', status: 'subscribed', joinDate: '18 Jun 2026', tags: ['Builder'] },
  { id: 8, email: 'rob@quickcare.com.au', name: 'Rob Peters', type: 'Trade', status: 'subscribed', joinDate: '20 Jun 2026', tags: ['Trade'] },
]
