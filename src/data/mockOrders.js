export const mockOrders = [
  { id: '#1048', customer: 'James Thornton', email: 'james.thornton@email.com', phone: '0412 345 678', date: '24 Jun 2026', items: 3, total: 842.00, status: 'processing', payment: 'paid', fulfillment: 'delivery', address: '42 Elm St, Fitzroy VIC 3065', notes: 'Please leave at front door', gst: 76.55 },
  { id: '#1047', customer: 'Sarah Mitchell', email: 'sarah.m@gmail.com', phone: '0423 111 222', date: '23 Jun 2026', items: 1, total: 289.00, status: 'pending', payment: 'unpaid', fulfillment: 'delivery', address: '8 Oak Ave, Brunswick VIC 3056', notes: '', gst: 26.27 },
  { id: '#1046', customer: 'MedEquip Pty Ltd', email: 'orders@medequip.com.au', phone: '03 9001 2345', date: '23 Jun 2026', items: 5, total: 3140.00, status: 'shipped', payment: 'paid', fulfillment: 'delivery', address: '100 Industry Rd, Dandenong VIC 3175', notes: 'Trade account order', gst: 0 },
  { id: '#1045', customer: 'Rebecca Chan', email: 'rebeccachan@hotmail.com', phone: '0455 789 012', date: '22 Jun 2026', items: 2, total: 674.00, status: 'delivered', payment: 'paid', fulfillment: 'delivery', address: '15 Pine Rd, St Kilda VIC 3182', notes: '', gst: 61.27 },
  { id: '#1044', customer: 'SDA Living', email: 'orders@sdaliving.com.au', phone: '03 8001 5678', date: '22 Jun 2026', items: 7, total: 5820.00, status: 'processing', payment: 'paid', fulfillment: 'delivery', address: '55 Commerce Dr, Moorabbin VIC 3189', notes: 'Urgent — resident moving in Friday', gst: 0 },
  { id: '#1043', customer: 'Tom Baker', email: 'tombaker@icloud.com', phone: '0499 333 444', date: '21 Jun 2026', items: 1, total: 34.00, status: 'delivered', payment: 'paid', fulfillment: 'click_collect', address: 'Click & Collect', notes: '', gst: 3.09 },
  { id: '#1042', customer: 'Fiona Wells', email: 'fwells@bigpond.com', phone: '0411 555 666', date: '20 Jun 2026', items: 4, total: 1240.00, status: 'refunded', payment: 'refunded', fulfillment: 'delivery', address: '22 Cedar Ct, Heidelberg VIC 3084', notes: 'Customer changed mind', gst: 112.72 },
  { id: '#1041', customer: 'Accessibility Plus', email: 'info@accessibilityplus.com.au', phone: '03 7001 8888', date: '19 Jun 2026', items: 12, total: 8490.00, status: 'delivered', payment: 'paid', fulfillment: 'delivery', address: '77 Trade Blvd, Clayton VIC 3168', notes: '', gst: 0 },
]

export const ORDER_ITEMS_MOCK = [
  { name: 'Fold-Down Shower Seat', sku: 'EQ-FSS-01', qty: 1, price: 249.00 },
  { name: 'SS Grab Rail 600mm', sku: 'EQ-GR-600', qty: 1, price: 89.00 },
  { name: 'Bath Transfer Bench', sku: 'EQ-BA-TB', qty: 1, price: 199.00 },
]
