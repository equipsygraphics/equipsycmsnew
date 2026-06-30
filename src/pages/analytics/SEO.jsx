import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, Download, ArrowUpDown } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { toast } from '../../components/ui/Toast'
import { seoKeywords, topPages } from '../../data/mockAnalytics'

function PositionBadge({ pos }) {
  const color = pos <= 3 ? 'bg-success-500/10 text-success-500' : pos <= 10 ? 'bg-warning-500/10 text-warning-500' : 'bg-grey-100 text-text-muted'
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>#{pos}</span>
}

export function SEO() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('clicks')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = [...seoKeywords]
    .filter(k => !search || k.keyword.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey])

  const totalClicks = seoKeywords.reduce((a, k) => a + k.clicks, 0)
  const totalImpressions = seoKeywords.reduce((a, k) => a + k.impressions, 0)
  const avgCtr = (seoKeywords.reduce((a, k) => a + k.ctr, 0) / seoKeywords.length).toFixed(1)
  const avgPosition = (seoKeywords.reduce((a, k) => a + k.position, 0) / seoKeywords.length).toFixed(1)

  const SortBtn = ({ col }) => (
    <button onClick={() => handleSort(col)} className="ml-1 text-text-muted hover:text-text-primary">
      <ArrowUpDown className="w-3 h-3 inline" />
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="SEO"
        subtitle="Search visibility, keyword rankings, and organic traffic."
        actions={<Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => toast('SEO report exported', 'success')}>Export</Button>}
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), change: 12, sub: 'organic search' },
          { label: 'Impressions', value: totalImpressions.toLocaleString(), change: 18, sub: 'search appearances' },
          { label: 'Avg CTR', value: `${avgCtr}%`, change: 5, sub: 'click-through rate' },
          { label: 'Avg Position', value: `#${avgPosition}`, change: -2, sub: 'lower is better' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border shadow-card p-4">
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
            <p className={`text-xs font-medium mt-1 ${stat.change > 0 ? 'text-success-500' : 'text-error-500'}`}>
              {stat.change > 0 ? 'â†‘' : 'â†“'} {Math.abs(stat.change)}% {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Keyword rankings */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">Keyword Rankings</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keywords..."
              className="h-8 pl-9 pr-3 rounded-lg border border-border bg-grey-50 text-sm placeholder:text-text-muted outline-none focus:border-brand-500 w-48" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Keyword</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Position <SortBtn col="position" /></th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Clicks <SortBtn col="clicks" /></th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">Impressions <SortBtn col="impressions" /></th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">CTR <SortBtn col="ctr" /></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-text-primary">{kw.keyword}</td>
                <td className="px-5 py-3.5"><PositionBadge pos={kw.position} /></td>
                <td className="px-5 py-3.5 text-text-secondary">{kw.clicks.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-text-secondary">{kw.impressions.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-grey-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(kw.ctr * 5, 100)}%` }} />
                    </div>
                    <span className="text-text-secondary">{kw.ctr}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top organic pages */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text-primary">Top Organic Pages</p>
          <p className="text-xs text-text-muted mt-0.5">Pages receiving the most organic search traffic</p>
        </div>
        <div className="divide-y divide-border">
          {topPages.map((page, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-grey-50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-grey-100 text-text-muted text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary text-sm">{page.title}</p>
                <p className="text-xs text-text-muted font-mono">{page.path}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">{page.sessions.toLocaleString()}</p>
                <p className="text-xs text-text-muted">sessions</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
