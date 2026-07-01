// ── Status lifecycle ──────────────────────────────────────────────────────────
// freight_requested  – freight only; no quote generated yet, waiting for admin to enter fee
// quote_sent         – quote PDF generated and emailed to customer
// awaiting_payment   – admin approved; invoice emailed; waiting for customer payment
// paid               – payment received; converted to Order; removed from active list
// closed             – archived (admin closed, or 30-day auto-close with no response)
//
// quoteType: 'standard' | 'shower_base' | 'freight'
//
// Editing rules:
//   standard  – admin can edit items; saves generate a new quoteNumber revision
//   freight   – same as standard; freightCost also editable
//   shower_base – NO editing; customer must resubmit a new request
//
// Versioning: quoteNumber is unique per revision (e.g. Q-2040 → Q-2040-R1).
//   previousQuoteNumber links back to the superseded version.

function daysAgo(n) {
  const d = new Date('2026-07-01')
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const mockQuoteRequests = [
  // ── Standard ────────────────────────────────────────────────────────────────
  {
    id: 'Q-2041', quoteNumber: 'Q-2041', revision: 1, previousQuoteNumber: null,
    quoteType: 'standard',
    customer: 'SDA Living Co.', email: 'procurement@sdaliving.com.au', phone: '(03) 9123 4567',
    account: 'Trade', billingAddress: '200 Spring St, Melbourne VIC 3000',
    fulfillment: 'delivery', deliveryAddress: '42 Ramp Rd, Dandenong VIC 3175',
    dateReceived: daysAgo(8), sentAt: daysAgo(8),
    status: 'quote_sent',
    notes: 'Require delivery to multiple sites across VIC.',
    items: [
      { id: 1, name: 'Fold-Down Shower Seat', sku: 'EQ-FSS-01', qty: 1, unitPrice: 199.00 },
      { id: 2, name: 'SS Grab Rail 600mm',     sku: 'EQ-GR-600', qty: 4, unitPrice: 69.00  },
    ],
    shippingCost: 25.00,
    subtotal: 500.00, gst: 45.45, total: 500.00,
  },
  {
    id: 'Q-2039', quoteNumber: 'Q-2039-R1', revision: 2, previousQuoteNumber: 'Q-2039',
    quoteType: 'standard',
    customer: 'Aged Care Qld', email: 'supplies@acqld.com.au', phone: '(07) 3345 6789',
    account: 'Trade', billingAddress: '100 Ann St, Brisbane QLD 4000',
    fulfillment: 'delivery', deliveryAddress: '100 Ann St, Brisbane QLD 4000',
    dateReceived: daysAgo(10), sentAt: daysAgo(4),
    status: 'awaiting_payment',
    notes: 'Bulk order for new facility fit-out.',
    items: [
      { id: 1, name: 'Chrome Grab Rail 450mm',  sku: 'EQ-GR-450', qty: 6, unitPrice: 55.00  },
      { id: 2, name: 'Fold-Down Shower Seat',   sku: 'EQ-FSS-01', qty: 6, unitPrice: 199.00 },
    ],
    shippingCost: 45.00,
    subtotal: 1569.00, gst: 142.64, total: 1569.00,
  },
  {
    id: 'Q-2034', quoteNumber: 'Q-2034', revision: 1, previousQuoteNumber: null,
    quoteType: 'standard',
    customer: 'BlueCare Support', email: 'orders@bluecare.com.au', phone: '(07) 3890 1234',
    account: 'Trade', billingAddress: '230 George St, Brisbane QLD 4000',
    fulfillment: 'click_collect', deliveryAddress: '',
    dateReceived: daysAgo(15), sentAt: daysAgo(15),
    status: 'awaiting_payment',
    notes: '',
    items: [
      { id: 1, name: 'Wall-Mounted Shower Chair', sku: 'EQ-SC-WM',  qty: 2, unitPrice: 310.00 },
      { id: 2, name: 'SS Grab Rail 600mm',         sku: 'EQ-GR-600', qty: 4, unitPrice: 69.00  },
    ],
    shippingCost: 0,
    subtotal: 896.00, gst: 81.45, total: 896.00,
  },
  {
    id: 'Q-2030', quoteNumber: 'Q-2030', revision: 1, previousQuoteNumber: null,
    quoteType: 'standard',
    customer: 'NDIS Access Group', email: 'info@ndisaccess.com.au', phone: '(08) 9567 8901',
    account: 'SDA Provider', billingAddress: '77 St Georges Tce, Perth WA 6000',
    fulfillment: 'delivery', deliveryAddress: '77 St Georges Tce, Perth WA 6000',
    dateReceived: daysAgo(27), sentAt: daysAgo(27),
    status: 'quote_sent',
    notes: 'Low urgency — standard re-stock.',
    items: [
      { id: 1, name: 'Anti-Slip Stair Nosing', sku: 'EQ-AS-SN', qty: 12, unitPrice: 34.00 },
    ],
    shippingCost: 18.00,
    subtotal: 426.00, gst: 38.73, total: 426.00,
  },

  // ── Shower Base Insert ───────────────────────────────────────────────────────
  {
    id: 'Q-2038', quoteNumber: 'Q-2038', revision: 1, previousQuoteNumber: null,
    quoteType: 'shower_base',
    customer: 'MedEquip Direct', email: 'sales@medequip.com.au', phone: '(02) 8456 7890',
    account: 'Trade', billingAddress: '12 Collins St, Melbourne VIC 3000',
    fulfillment: 'delivery', deliveryAddress: '12 Collins St, Melbourne VIC 3000',
    dateReceived: daysAgo(11), sentAt: daysAgo(11),
    status: 'awaiting_payment',
    notes: 'Non-standard recess depth required.',
    dimensions: { length: 900, width: 900, depth: 60, finish: 'White', notes: 'Non-standard recess depth — 60mm. Standard is 40mm.' },
    items: [],
    shippingCost: 35.00,
    subtotal: 3595.00, gst: 326.82, total: 3595.00,
  },
  {
    id: 'Q-2037', quoteNumber: 'Q-2037', revision: 1, previousQuoteNumber: null,
    quoteType: 'shower_base',
    customer: 'Peninsula Aged Care', email: 'admin@peninsulaac.com.au', phone: '(03) 5678 9012',
    account: 'SDA Provider', billingAddress: '22 Nepean Hwy, Frankston VIC 3199',
    fulfillment: 'click_collect', deliveryAddress: '',
    dateReceived: daysAgo(12), sentAt: daysAgo(12),
    status: 'quote_sent',
    notes: 'Two different sizes needed — see dimension notes.',
    dimensions: { length: 1200, width: 900, depth: 40, finish: 'Grey', notes: '2× units of this size. Standard finish.' },
    items: [],
    shippingCost: 0,
    subtotal: 2220.00, gst: 201.82, total: 2220.00,
  },
  {
    id: 'Q-2032', quoteNumber: 'Q-2032', revision: 1, previousQuoteNumber: null,
    quoteType: 'shower_base',
    customer: 'Sunrise Disability', email: 'hello@sunriseds.com.au', phone: '(03) 9123 0000',
    account: 'SDA Provider', billingAddress: '55 Commerce Dr, Moorabbin VIC 3189',
    fulfillment: 'delivery', deliveryAddress: '55 Commerce Dr, Moorabbin VIC 3189',
    dateReceived: daysAgo(17), sentAt: daysAgo(17),
    status: 'quote_sent',
    notes: 'Urgent — new client moving in next week.',
    dimensions: { length: 900, width: 900, depth: 40, finish: 'White', notes: 'Standard dimensions, urgent turnaround required.' },
    items: [],
    shippingCost: 25.00,
    subtotal: 865.00, gst: 78.64, total: 865.00,
  },

  // ── Freight ──────────────────────────────────────────────────────────────────
  {
    id: 'Q-2040', quoteNumber: 'Q-2040-R1', revision: 2, previousQuoteNumber: 'Q-2040',
    quoteType: 'freight',
    customer: 'Disability Services WA', email: 'orders@dswa.org.au', phone: '(08) 9234 5678',
    account: 'SDA Provider', billingAddress: '45 Hay St, Perth WA 6000',
    fulfillment: 'delivery', deliveryAddress: '12 Remote Rd, Kalgoorlie WA 6430',
    dateReceived: daysAgo(9), sentAt: daysAgo(6),
    status: 'quote_sent',
    notes: 'NDIS funded. Need tax invoices. Delivery to regional WA.',
    items: [
      { id: 1, name: 'FRP Ramp Grating', sku: 'EQ-RP-FRP', qty: 3, unitPrice: 540.00 },
      { id: 2, name: 'Anti-Slip Stair Nosing', sku: 'EQ-AS-SN', qty: 3, unitPrice: 34.00 },
    ],
    shippingCost: 285.00,
    subtotal: 2007.00, gst: 182.45, total: 2007.00,
  },
  {
    id: 'Q-2035', quoteNumber: 'Q-2035', revision: 1, previousQuoteNumber: null,
    quoteType: 'freight',
    customer: 'James Thornton', email: 'james.thornton@email.com', phone: '0412 345 678',
    account: 'Retail', billingAddress: '42 Elm St, Fitzroy VIC 3065',
    fulfillment: 'delivery', deliveryAddress: '42 Elm St, Fitzroy VIC 3065',
    dateReceived: daysAgo(14), sentAt: null,
    status: 'closed',
    notes: 'Customer requested freight to rural VIC.',
    items: [
      { id: 1, name: 'Doorway Ramp Threshold', sku: 'EQ-RP-DT', qty: 1, unitPrice: 95.00 },
      { id: 2, name: 'Slip-Resistant Shower Mat', sku: 'EQ-SM-01', qty: 1, unitPrice: 34.00 },
    ],
    shippingCost: 0,
    subtotal: 129.00, gst: 11.73, total: 129.00,
  },
  {
    id: 'Q-2033', quoteNumber: 'Q-2033', revision: 1, previousQuoteNumber: null,
    quoteType: 'freight',
    customer: 'Access & Mobility WA', email: 'admin@accesswa.com.au', phone: '(08) 9012 3456',
    account: 'Trade', billingAddress: '5 Ord St, West Perth WA 6005',
    fulfillment: 'delivery', deliveryAddress: '22 Outback Hwy, Geraldton WA 6530',
    dateReceived: daysAgo(2), sentAt: null,
    status: 'freight_requested',
    notes: 'Delivery to regional WA — freight quote required before proceeding.',
    items: [
      { id: 1, name: 'Aluminium Modular Ramp', sku: 'EQ-RP-MOD', qty: 4, unitPrice: 950.00 },
    ],
    shippingCost: 0,
    subtotal: null, gst: null, total: null,
  },
]

export const mockTradeAccounts = [
  { id: 'TA-001', company: 'SDA Living Co.', abn: '12 345 678 901', contact: 'Michael Chen', email: 'michael@sdaliving.com.au', phone: '(03) 9123 4567', type: 'SDA Provider', status: 'approved', creditLimit: 20000, applied: '1 Jun 2026', approved: '3 Jun 2026', notes: 'Large SDA provider with multiple sites.' },
  { id: 'TA-002', company: 'Peninsula Aged Care', abn: '98 765 432 109', contact: 'Sandra Walsh', email: 'sandra@peninsulaac.com.au', phone: '(03) 5678 9012', type: 'Aged Care', status: 'approved', creditLimit: 10000, applied: '5 Jun 2026', approved: '7 Jun 2026', notes: '' },
  { id: 'TA-003', company: 'QuickCare Solutions', abn: '55 444 333 222', contact: 'Rob Peters', email: 'rob@quickcare.com.au', phone: '0400 111 222', type: 'Builder', status: 'pending', creditLimit: null, applied: '20 Jun 2026', approved: null, notes: 'ABN verified. Awaiting credit check.' },
  { id: 'TA-004', company: 'HomeMod Specialists', abn: '77 888 999 000', contact: 'Lisa Nguyen', email: 'lisa@homemod.com.au', phone: '(02) 8999 1234', type: 'Builder', status: 'pending', creditLimit: null, applied: '22 Jun 2026', approved: null, notes: '' },
  { id: 'TA-005', company: 'Coastal Disability Services', abn: '11 222 333 444', contact: 'Tom Bradley', email: 'tom@coastalds.com.au', phone: '(07) 5555 6666', type: 'SDA Provider', status: 'declined', creditLimit: null, applied: '10 Jun 2026', approved: null, notes: 'Credit check failed.' },
]

export const mockBuilderPacks = [
  { id: 'BP-021', company: 'Landmark Constructions', contact: 'Dave Nguyen', email: 'dave@landmark.com.au', phone: '(03) 9876 5432', projectType: 'SDA Dwelling', units: 12, state: 'VIC', status: 'sent', requested: '20 Jun 2026', notes: 'Large SDA project in Dandenong.' },
  { id: 'BP-020', company: 'BluePrint Builders', contact: 'Karen Smith', email: 'karen@blueprint.com.au', phone: '(02) 8765 4321', projectType: 'Aged Care Facility', units: 40, state: 'NSW', status: 'sent', requested: '18 Jun 2026', notes: '' },
  { id: 'BP-019', company: 'HomeAccess Pty Ltd', contact: 'Jim West', email: 'jim@homeaccess.com.au', phone: '0411 222 333', projectType: 'Residential Modifications', units: 3, state: 'QLD', status: 'pending', requested: '22 Jun 2026', notes: 'First-time builder pack request.' },
  { id: 'BP-018', company: 'Precision Build Co.', contact: 'Amy Tan', email: 'amy@precisionbuild.com.au', phone: '(08) 9234 5678', projectType: 'SDA Dwelling', units: 6, state: 'WA', status: 'pending', requested: '23 Jun 2026', notes: '' },
]
