function daysAgo(n) {
  const d = new Date('2026-07-03')
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const OCCUPATION_OPTIONS = ['Builder', 'OT', 'HCP', 'Trade', 'Personal Project', 'Other']
export const HEARD_OPTIONS = ['Google', 'Events', 'eBay', 'Word of Mouth', 'Other']
export const FINDABILITY_OPTIONS = ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult']
export const CLARITY_OPTIONS = ['Very Clear', 'Clear', 'Neutral', 'Unclear', 'Very Unclear']
export const CHECKOUT_OPTIONS = ['Very Good', 'Good', 'Neutral', 'Poor', 'Very Poor']

export const FEEDBACK_QUESTIONS = [
  { id: 'occupation',       label: 'Occupation',                                          type: 'select',  options: OCCUPATION_OPTIONS },
  { id: 'heard',            label: 'How did you hear about us?',                          type: 'choice',  options: HEARD_OPTIONS },
  { id: 'findability',      label: 'How easy was it to find the product you were looking for?', type: 'scale', options: FINDABILITY_OPTIONS, positive: true },
  { id: 'technicalIssues',  label: 'Did you encounter any technical issues while browsing our website?', type: 'yesno' },
  { id: 'shippingClarity',  label: 'How clear were the shipping options and costs?',      type: 'scale',   options: CLARITY_OPTIONS, positive: true },
  { id: 'checkoutRating',   label: 'How would you rate your experience with the checkout process?', type: 'scale', options: CHECKOUT_OPTIONS, positive: true },
  { id: 'contactedCS',      label: 'Did you need to contact customer service during your shopping experience?', type: 'yesno' },
  { id: 'improvements',     label: 'What aspect of your shopping experience could we improve?', type: 'text' },
]

export const mockFeedback = [
  {
    id: 'FB-001',
    dateSubmitted: daysAgo(1),
    customer: { name: 'Sarah Mitchell', email: 'sarah.mitchell@gmail.com', phone: '0412 345 678' },
    order: {
      id: 'ORD-1051',
      date: daysAgo(5),
      items: [
        { name: 'Fold-Down Shower Seat', qty: 1, price: 249 },
        { name: 'SS Grab Rail 600mm', qty: 2, price: 89 },
      ],
      total: 427.00,
      fulfillment: 'delivery',
      deliveryAddress: '14 Maple St, Hawthorn VIC 3122',
    },
    answers: {
      occupation: 'OT',
      occupationOther: null,
      heard: 'Word of Mouth',
      heardOther: null,
      findability: 'Very Easy',
      technicalIssues: false,
      shippingClarity: 'Very Clear',
      checkoutRating: 'Very Good',
      contactedCS: false,
      improvements: 'Would love more product comparison features on the website.',
    },
  },
  {
    id: 'FB-002',
    dateSubmitted: daysAgo(2),
    customer: { name: 'Peter Nguyen', email: 'peter.nguyen@outlook.com', phone: '0498 765 432' },
    order: {
      id: 'ORD-1049',
      date: daysAgo(6),
      items: [
        { name: 'Bath Transfer Bench', qty: 1, price: 199 },
      ],
      total: 199.00,
      fulfillment: 'delivery',
      deliveryAddress: '8 Acacia Ave, Parramatta NSW 2150',
    },
    answers: {
      occupation: 'Personal Project',
      occupationOther: null,
      heard: 'Google',
      heardOther: null,
      findability: 'Easy',
      technicalIssues: false,
      shippingClarity: 'Clear',
      checkoutRating: 'Good',
      contactedCS: false,
      improvements: 'More detailed product dimensions in the listing would help.',
    },
  },
  {
    id: 'FB-003',
    dateSubmitted: daysAgo(3),
    customer: { name: 'Margaret Cole', email: 'm.cole@email.com.au', phone: '(07) 3456 7890' },
    order: {
      id: 'ORD-1047',
      date: daysAgo(8),
      items: [
        { name: 'Raised Toilet Seat', qty: 1, price: 89 },
        { name: 'Toilet Safety Rail 90°', qty: 1, price: 129 },
      ],
      total: 218.00,
      fulfillment: 'click_collect',
      deliveryAddress: null,
    },
    answers: {
      occupation: 'HCP',
      occupationOther: null,
      heard: 'Word of Mouth',
      heardOther: null,
      findability: 'Very Easy',
      technicalIssues: false,
      shippingClarity: 'Very Clear',
      checkoutRating: 'Very Good',
      contactedCS: false,
      improvements: '',
    },
  },
  {
    id: 'FB-004',
    dateSubmitted: daysAgo(4),
    customer: { name: 'David Okafor', email: 'david.okafor@bigpond.com', phone: '0421 987 654' },
    order: {
      id: 'ORD-1045',
      date: daysAgo(10),
      items: [
        { name: 'Wall-Mounted Shower Chair', qty: 1, price: 389 },
      ],
      total: 389.00,
      fulfillment: 'delivery',
      deliveryAddress: '33 Glenmore Rd, Paddington NSW 2021',
    },
    answers: {
      occupation: 'Personal Project',
      occupationOther: null,
      heard: 'Google',
      heardOther: null,
      findability: 'Neutral',
      technicalIssues: true,
      shippingClarity: 'Unclear',
      checkoutRating: 'Poor',
      contactedCS: true,
      improvements: 'The website kept timing out at checkout and I had to start over. Shipping costs were not clear until the very end.',
    },
  },
  {
    id: 'FB-005',
    dateSubmitted: daysAgo(5),
    customer: { name: 'Linda Zhao', email: 'lindazhao88@gmail.com', phone: '0455 111 222' },
    order: {
      id: 'ORD-1043',
      date: daysAgo(12),
      items: [
        { name: 'Anti-Slip Stair Nosing', qty: 4, price: 45 },
        { name: 'Slip-Resistant Shower Mat', qty: 1, price: 34 },
      ],
      total: 214.00,
      fulfillment: 'delivery',
      deliveryAddress: '2 Park Lane, Chatswood NSW 2067',
    },
    answers: {
      occupation: 'Trade',
      occupationOther: null,
      heard: 'eBay',
      heardOther: null,
      findability: 'Very Easy',
      technicalIssues: false,
      shippingClarity: 'Very Clear',
      checkoutRating: 'Very Good',
      contactedCS: false,
      improvements: 'A bulk pricing page for trade customers would be great.',
    },
  },
  {
    id: 'FB-006',
    dateSubmitted: daysAgo(7),
    customer: { name: 'Robert Finch', email: 'r.finch@hotmail.com', phone: '(08) 9876 5432' },
    order: {
      id: 'ORD-1040',
      date: daysAgo(14),
      items: [
        { name: 'FRP Ramp Grating', qty: 1, price: 680 },
      ],
      total: 680.00,
      fulfillment: 'delivery',
      deliveryAddress: '18 Station St, Fremantle WA 6160',
    },
    answers: {
      occupation: 'Builder',
      occupationOther: null,
      heard: 'Events',
      heardOther: null,
      findability: 'Easy',
      technicalIssues: false,
      shippingClarity: 'Clear',
      checkoutRating: 'Good',
      contactedCS: false,
      improvements: 'Better filtering by load rating or material type for ramps.',
    },
  },
  {
    id: 'FB-007',
    dateSubmitted: daysAgo(9),
    customer: { name: 'Annette Russo', email: 'annette.russo@icloud.com', phone: '0403 222 333' },
    order: {
      id: 'ORD-1037',
      date: daysAgo(16),
      items: [
        { name: 'Fold-Down Shower Seat', qty: 1, price: 249 },
        { name: 'Chrome Grab Rail 450mm', qty: 2, price: 72 },
      ],
      total: 393.00,
      fulfillment: 'delivery',
      deliveryAddress: '67 Collins Ave, Essendon VIC 3040',
    },
    answers: {
      occupation: 'Other',
      occupationOther: 'NDIS Support Coordinator',
      heard: 'Google',
      heardOther: null,
      findability: 'Difficult',
      technicalIssues: true,
      shippingClarity: 'Unclear',
      checkoutRating: 'Poor',
      contactedCS: true,
      improvements: 'Search results were not very relevant. Had to scroll through many unrelated products. The checkout also had an error with my address.',
    },
  },
  {
    id: 'FB-008',
    dateSubmitted: daysAgo(11),
    customer: { name: 'Thomas Ward', email: 'tom.ward@work.com.au', phone: '(02) 8765 4321' },
    order: {
      id: 'ORD-1034',
      date: daysAgo(18),
      items: [
        { name: 'Doorway Ramp Threshold', qty: 3, price: 95 },
      ],
      total: 285.00,
      fulfillment: 'click_collect',
      deliveryAddress: null,
    },
    answers: {
      occupation: 'OT',
      occupationOther: null,
      heard: 'Word of Mouth',
      heardOther: null,
      findability: 'Very Easy',
      technicalIssues: false,
      shippingClarity: 'Very Clear',
      checkoutRating: 'Very Good',
      contactedCS: false,
      improvements: '',
    },
  },
]
