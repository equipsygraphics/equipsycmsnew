// Newsletter subscribers
// status: 'subscribed' | 'unsubscribed'
// source: 'checkout' | 'footer' | 'landing-page' | 'trade-signup' | 'manual'

export const mockSubscribers = [
  { id: 'sub-001', email: 'sarah.mitchell@example.com',       name: 'Sarah Mitchell',  source: 'checkout',      subscribedAt: '2026-07-05', status: 'subscribed'   },
  { id: 'sub-002', email: 'donna.n@ndiscare.com.au',           name: 'Donna Nguyen',    source: 'checkout',      subscribedAt: '2026-07-02', status: 'subscribed'   },
  { id: 'sub-003', email: 'jcorby@gmail.com',                  name: 'James Corby',     source: 'footer',        subscribedAt: '2026-07-01', status: 'subscribed'   },
  { id: 'sub-004', email: 'mpham@buildco.com.au',              name: 'Michael Pham',    source: 'trade-signup',  subscribedAt: '2026-06-28', status: 'subscribed'   },
  { id: 'sub-005', email: 'rchen@privatepractice.com.au',      name: 'Dr. Rachel Chen', source: 'landing-page',  subscribedAt: '2026-06-28', status: 'subscribed'   },
  { id: 'sub-006', email: 'mholt@ndiscare.com.au',             name: 'Mark Holt',       source: 'footer',        subscribedAt: '2026-06-25', status: 'subscribed'   },
  { id: 'sub-007', email: 'patricia.moore@gmail.com',          name: 'Patricia Moore',  source: 'checkout',      subscribedAt: '2026-06-20', status: 'subscribed'   },
  { id: 'sub-008', email: 'chris.b@gmail.com',                 name: 'Chris Bauer',     source: 'landing-page',  subscribedAt: '2026-06-29', status: 'subscribed'   },
  { id: 'sub-009', email: 'harolds@bigpond.com',               name: 'Harold Simmons',  source: 'checkout',      subscribedAt: '2026-05-15', status: 'subscribed'   },
  { id: 'sub-010', email: 'bev.tan@email.com',                 name: 'Beverley Tan',    source: 'checkout',      subscribedAt: '2026-03-10', status: 'unsubscribed', unsubscribedAt: '2026-06-30' },
  { id: 'sub-011', email: 'jane@example.com',                  name: 'Jane Williams',   source: 'footer',        subscribedAt: '2026-01-15', status: 'unsubscribed', unsubscribedAt: '2026-04-02' },
  { id: 'sub-012', email: 'd.rowan@rowan-build.com.au',        name: 'Daniel Rowan',    source: 'trade-signup',  subscribedAt: '2026-07-01', status: 'subscribed'   },
  { id: 'sub-013', email: 'maria.kovacs@email.com.au',         name: 'Maria Kovacs',    source: 'footer',        subscribedAt: '2026-07-05', status: 'subscribed'   },
  { id: 'sub-014', email: 'paul.m@email.com',                  name: 'Paul Marchetti',  source: 'checkout',      subscribedAt: '2026-02-10', status: 'unsubscribed', unsubscribedAt: '2026-05-18' },
]
