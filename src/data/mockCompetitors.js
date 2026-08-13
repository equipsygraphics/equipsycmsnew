// matchingSkus/matchAccuracy are intentionally NOT stored here — they're
// derived live from mockMatching.buildCompetitorStats so the Competitors
// table always reflects the current matching engine output rather than a
// stale seeded number.
export const mockCompetitors = [
  {
    id: 'c1',
    name: 'MobilityPlus AU',
    baseUrl: 'https://www.mobilityplus.com.au',
    categories: ['Modular Grab Rails', 'Fold Down Shower Seat', 'Bathroom Solutions'],
    lastScraped: '2026-08-09T14:32:00',
  },
  {
    id: 'c2',
    name: 'AbleGear',
    baseUrl: 'https://www.ablegear.com.au',
    categories: ['Angled Toilet Grab Rails', 'Toilet Accessories', 'Antislip Tapes'],
    lastScraped: '2026-08-08T09:15:00',
  },
  {
    id: 'c3',
    name: 'SafeStep Supplies',
    baseUrl: 'https://www.safestepsupplies.com.au',
    categories: ['FRP Stair Nosing', 'FRP Ramp Grating', 'Aluminium Threshold Ramps'],
    lastScraped: '2026-08-05T11:47:00',
  },
  {
    id: 'c4',
    name: 'CareAid Direct',
    baseUrl: 'https://www.careaiddirect.com.au',
    categories: ['VersaMount Handheld Showers & Accessories', 'Fold Down Shower Seat', 'Ramp and Wings Combo'],
    lastScraped: null,
  },
  {
    id: 'c5',
    name: 'AccessEquip',
    baseUrl: 'https://www.accessequip.com.au',
    categories: ['Offset Grab Rails', 'Aluminium Threshold Ramps', 'Antislip Tapes'],
    lastScraped: '2026-08-10T16:03:00',
  },
]

export function matchAccuracyVariant(accuracy) {
  if (accuracy == null) return 'grey'
  if (accuracy >= 0.8) return 'success'
  if (accuracy >= 0.6) return 'info'
  return 'warning'
}
