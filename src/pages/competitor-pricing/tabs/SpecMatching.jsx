import { RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Field, Input, Select, Toggle } from '../../../components/ui/FormField'
import { toast } from '../../../components/ui/Toast'
import { DEFAULT_BOT_SETTINGS } from '../../../data/mockBotSettings'

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

// How the (simulated) bot crawls competitor sites — schedule, request
// behavior, and crawler identity/compliance. Distinct from Stage 1/2 match
// attribute selection (what it compares once it has data), which lives on
// the Attributes page since it's really about the shared attribute pool.
export function SpecMatching({ settings, updateSettings }) {
  const num = (v, fallback = 0) => { const n = parseFloat(v); return Number.isNaN(n) ? fallback : n }

  const handleReset = () => {
    updateSettings(DEFAULT_BOT_SETTINGS)
    toast('Bot settings reset to defaults', 'info')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Controls how the scraping bot crawls competitor websites — there's no live scraper wired up yet (see "Scrape All
          Competitors" on the Competitors tab for the simulated run), but these settings describe the intended crawl
          behavior once one is.
        </p>
        <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset} className="shrink-0">
          Reset to Defaults
        </Button>
      </div>

      <SectionCard title="Scrape Schedule" description="When the bot runs automatically, and how stale data is allowed to get before it's flagged.">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Frequency">
            <Select value={settings.scrapeFrequency} onChange={e => updateSettings({ scrapeFrequency: e.target.value })}>
              <option value="manual">Manual only</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </Field>
          <Field label="Scheduled Time" hint={settings.scrapeFrequency === 'manual' ? 'Not used — manual only' : 'Local time the scrape kicks off'}>
            <Input
              type="time"
              value={settings.scheduledTime}
              onChange={e => updateSettings({ scheduledTime: e.target.value })}
              disabled={settings.scrapeFrequency === 'manual'}
            />
          </Field>
          <Field label="Data Freshness (days)" hint="Flag a competitor's data as stale after this many days">
            <Input
              type="number"
              min="1"
              value={settings.dataFreshnessDays}
              onChange={e => updateSettings({ dataFreshnessDays: num(e.target.value, 1) })}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Request Behavior" description="Throttling and reliability settings for the crawl itself.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Request Delay (ms)" hint="Pause between requests to the same site">
            <Input
              type="number"
              min="0"
              step="100"
              value={settings.requestDelayMs}
              onChange={e => updateSettings({ requestDelayMs: num(e.target.value, 0) })}
            />
          </Field>
          <Field label="Max Concurrent Competitors" hint="How many competitor sites to crawl at once">
            <Input
              type="number"
              min="1"
              value={settings.maxConcurrentCompetitors}
              onChange={e => updateSettings({ maxConcurrentCompetitors: num(e.target.value, 1) })}
            />
          </Field>
          <Field label="Request Timeout (seconds)">
            <Input
              type="number"
              min="1"
              value={settings.requestTimeoutSec}
              onChange={e => updateSettings({ requestTimeoutSec: num(e.target.value, 1) })}
            />
          </Field>
          <Field label="Max Retry Attempts" hint="On a failed or timed-out request">
            <Input
              type="number"
              min="0"
              value={settings.maxRetryAttempts}
              onChange={e => updateSettings({ maxRetryAttempts: num(e.target.value, 0) })}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Crawler Identity & Compliance">
        <Field label="User-Agent String">
          <Input
            value={settings.userAgent}
            onChange={e => updateSettings({ userAgent: e.target.value })}
            placeholder="e.g. EquipsyPriceBot/1.0 (+https://www.equipsy.com.au/bot)"
          />
        </Field>
        <Toggle
          checked={settings.respectRobotsTxt}
          onChange={v => updateSettings({ respectRobotsTxt: v })}
          label="Respect robots.txt"
          description="Skip pages a competitor's robots.txt disallows for crawlers."
        />
        <Toggle
          checked={settings.useProxyRotation}
          onChange={v => updateSettings({ useProxyRotation: v })}
          label="Use proxy / IP rotation"
          description="Route requests through rotating IPs to reduce rate-limit blocks."
        />
      </SectionCard>
    </div>
  )
}
