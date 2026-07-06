import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, ClipboardList, Calendar, TrendingUp } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { mockForms, mockFormResponses } from '../../data/mockForms'

function conversionRate(responseCount, viewCount) {
  if (!viewCount) return null
  return Math.round((responseCount / viewCount) * 100)
}

function ConversionRate({ rate }) {
  if (rate === null) return <span className="text-sm text-text-muted">—</span>
  return <span className="text-sm text-text-primary">{rate}%</span>
}

function StatCard({ label, value, sub, icon: Icon, iconColor }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex items-start gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconColor + '18' }}>
          <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
        {sub && <p className="text-xs text-text-muted">{sub}</p>}
      </div>
    </div>
  )
}

export function FormsList() {
  const navigate = useNavigate()

  const totalResponses = mockForms.reduce((sum, f) => {
    const current = f.versions.find(v => v.id === f.currentVersionId)
    return sum + (current?.responseCount ?? 0)
  }, 0)

  const totalViews = mockForms.reduce((sum, f) => {
    const current = f.versions.find(v => v.id === f.currentVersionId)
    return sum + (current?.viewCount ?? 0)
  }, 0)

  const avgConversion = totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : null

  const lastResponse = mockFormResponses.length > 0
    ? mockFormResponses.reduce((latest, r) => r.submittedAt > latest.submittedAt ? r : latest, mockFormResponses[0])
    : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Forms"
        subtitle="Manage feedback forms and view responses. Structural changes create a new version — previous responses remain linked to their version."
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/forms/new')}>New Form</Button>}
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active forms" value={mockForms.filter(f => f.status === 'active').length}
          icon={FileText} iconColor="#6366f1" />
        <StatCard label="Total responses" value={totalResponses} sub="across current versions"
          icon={ClipboardList} iconColor="#3b82f6" />
        <StatCard
          label="Avg. conversion rate" value={avgConversion !== null ? `${avgConversion}%` : '—'}
          sub={totalViews > 0 ? `${totalResponses} of ${totalViews.toLocaleString()} views` : undefined}
          icon={TrendingUp} iconColor="#22c55e"
        />
        <StatCard
          label="Last response"
          value={lastResponse ? new Date(lastResponse.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}
          sub={lastResponse ? new Date(lastResponse.submittedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : undefined}
          icon={Calendar} iconColor="#f59e0b"
        />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50/50">
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Form</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Versions</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Responses</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Views</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Conversion</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted text-xs uppercase tracking-wide">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockForms.map(form => {
              const currentVersion = form.versions.find(v => v.id === form.currentVersionId)
              const currentResponses = mockFormResponses.filter(r => r.formId === form.id && r.versionId === form.currentVersionId)
              const latestResponse = currentResponses.length > 0
                ? currentResponses.reduce((a, b) => a.submittedAt > b.submittedAt ? a : b)
                : null
              const responses = currentVersion?.responseCount ?? 0
              const views     = currentVersion?.viewCount ?? 0
              const rate      = conversionRate(responses, views)

              return (
                <tr
                  key={form.id}
                  onClick={() => navigate(`/forms/${form.id}`)}
                  className="hover:bg-grey-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-brand-500" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{form.name}</p>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{form.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={form.status === 'active' ? 'active' : 'archived'} label={form.status === 'active' ? 'Active' : 'Inactive'} dot />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {form.versions.length} version{form.versions.length !== 1 ? 's' : ''}
                    <span className="text-text-muted"> · v{currentVersion?.versionNumber} current</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{responses}</td>
                  <td className="px-4 py-3 text-text-secondary">{views > 0 ? views.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3"><ConversionRate rate={rate} /></td>
                  <td className="px-4 py-3 text-text-muted text-xs">
                    {new Date(form.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
