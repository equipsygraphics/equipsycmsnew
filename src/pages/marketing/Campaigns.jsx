import { useState } from 'react'
import { Plus, Edit2, Trash2, Send, BarChart2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockCampaigns, CAMPAIGN_TYPES, AUDIENCE_TYPES } from '../../data/mockMarketing'

const STATUS_VARIANT = { active: 'success', sent: 'info', draft: 'default', scheduled: 'warning' }

const EMPTY = { name: '', type: 'Promotional', audience: 'All Customers', subject: '', preheader: '', body: '', startDate: '', endDate: '', status: 'draft' }

export function Campaigns() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [statsFor, setStatsFor] = useState(null)

  const openNew = () => { setEditing({ ...EMPTY }); setDrawerOpen(true) }
  const openEdit = (c) => { setEditing({ ...c }); setDrawerOpen(true) }

  const handleSave = () => {
    if (!editing.name.trim()) { toast('Campaign name is required', 'error'); return }
    if (editing.id) {
      setCampaigns(prev => prev.map(c => c.id === editing.id ? { ...editing } : c))
      toast(`"${editing.name}" updated`, 'success')
    } else {
      setCampaigns(prev => [...prev, { ...editing, id: Date.now(), sent: 0, opens: 0, clicks: 0 }])
      toast(`"${editing.name}" campaign created`, 'success')
    }
    setDrawerOpen(false)
  }

  const handleSend = (c) => {
    setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: 'sent', sent: Math.floor(Math.random() * 2000) + 500 } : x))
    toast(`"${c.name}" sent to ${c.audience}`, 'success')
  }

  const set = (k, v) => setEditing(e => ({ ...e, [k]: v }))

  const openRate = (c) => c.sent > 0 ? Math.round((c.opens / c.sent) * 100) : 0
  const clickRate = (c) => c.opens > 0 ? Math.round((c.clicks / c.opens) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campaigns"
        subtitle={`${campaigns.length} campaigns`}
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNew}>New Campaign</Button>}
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: campaigns.length, sub: 'all time' },
          { label: 'Active', value: campaigns.filter(c => c.status === 'active').length, sub: 'running now', color: 'text-success-500' },
          { label: 'Total Sent', value: campaigns.reduce((a, c) => a + c.sent, 0).toLocaleString(), sub: 'emails delivered' },
          { label: 'Avg Open Rate', value: `${Math.round(campaigns.filter(c => c.sent > 0).reduce((a, c) => a + (c.opens / c.sent * 100), 0) / (campaigns.filter(c => c.sent > 0).length || 1))}%`, sub: 'across sent campaigns' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border shadow-card p-4">
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color ?? 'text-text-primary'}`}>{stat.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Campaign', 'Type', 'Audience', 'Sent', 'Opens', 'Clicks', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-text-primary">{c.name}</td>
                <td className="px-5 py-3.5 text-text-secondary">{c.type}</td>
                <td className="px-5 py-3.5 text-text-secondary">{c.audience}</td>
                <td className="px-5 py-3.5 text-text-secondary">{c.sent > 0 ? c.sent.toLocaleString() : 'â€”'}</td>
                <td className="px-5 py-3.5">
                  {c.sent > 0 ? <span>{c.opens.toLocaleString()} <span className="text-text-muted text-xs">({openRate(c)}%)</span></span> : 'â€”'}
                </td>
                <td className="px-5 py-3.5">
                  {c.opens > 0 ? <span>{c.clicks.toLocaleString()} <span className="text-text-muted text-xs">({clickRate(c)}%)</span></span> : 'â€”'}
                </td>
                <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[c.status]} label={c.status.charAt(0).toUpperCase() + c.status.slice(1)} dot /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    {c.sent > 0 && <button onClick={() => setStatsFor(c)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Stats"><BarChart2 className="w-4 h-4" /></button>}
                    {c.status === 'draft' && <button onClick={() => handleSend(c)} className="p-1.5 rounded-md text-text-muted hover:text-success-500 hover:bg-success-500/10" title="Send"><Send className="w-4 h-4" /></button>}
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats modal */}
      {statsFor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setStatsFor(null)}>
          <div className="bg-surface rounded-2xl border border-border shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-text-primary mb-4">{statsFor.name} â€” Stats</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['Sent', statsFor.sent.toLocaleString()], ['Opens', `${openRate(statsFor)}%`], ['Clicks', `${clickRate(statsFor)}%`]].map(([l, v]) => (
                <div key={l} className="bg-grey-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-text-primary">{v}</p>
                  <p className="text-xs text-text-muted mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setStatsFor(null)} className="w-full justify-center">Close</Button>
          </div>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing?.id ? `Edit Campaign` : 'New Campaign'}>
        {editing && (
          <div className="flex flex-col gap-4">
            <Field label="Campaign Name" required><Input value={editing.name} onChange={e => set('name', e.target.value)} placeholder="e.g. EOFY Sale 2026" /></Field>
            <Field label="Type"><Select value={editing.type} onChange={e => set('type', e.target.value)}>{CAMPAIGN_TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="Audience"><Select value={editing.audience} onChange={e => set('audience', e.target.value)}>{AUDIENCE_TYPES.map(a => <option key={a}>{a}</option>)}</Select></Field>
            <Field label="Email Subject"><Input value={editing.subject ?? ''} onChange={e => set('subject', e.target.value)} placeholder="e.g. ðŸŽ‰ 20% off everything this EOFY" /></Field>
            <Field label="Preheader Text" hint="Preview text shown after the subject line"><Input value={editing.preheader ?? ''} onChange={e => set('preheader', e.target.value)} placeholder="Shop now and save big this financial year..." /></Field>
            <Field label="Body / Notes"><Textarea value={editing.body ?? ''} onChange={e => set('body', e.target.value)} rows={4} placeholder="Campaign description or content notes..." /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date"><Input type="date" value={editing.startDate ?? ''} onChange={e => set('startDate', e.target.value)} /></Field>
              <Field label="End Date"><Input type="date" value={editing.endDate ?? ''} onChange={e => set('endDate', e.target.value)} /></Field>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save Campaign</Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { setCampaigns(prev => prev.filter(c => c.id !== deleteTarget.id)); toast('Campaign deleted', 'success'); setDeleteTarget(null) }}
        title="Delete campaign" message={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" destructive />
    </div>
  )
}
