// Default configuration for the (simulated) scraping bot — how it crawls
// competitor sites, not what it matches once it has the data (that's Spec
// Matching, now under Attributes). There's no real scraper wired up to
// these values; they exist so the "Scrape All Competitors" flow has real,
// editable settings to describe rather than being purely cosmetic.
export const DEFAULT_BOT_SETTINGS = {
  scrapeFrequency: 'daily', // 'manual' | 'daily' | 'weekly'
  scheduledTime: '02:00',
  dataFreshnessDays: 7,
  requestDelayMs: 1500,
  maxConcurrentCompetitors: 3,
  requestTimeoutSec: 30,
  maxRetryAttempts: 2,
  respectRobotsTxt: true,
  useProxyRotation: false,
  userAgent: 'EquipsyPriceBot/1.0 (+https://www.equipsy.com.au/bot)',
}
