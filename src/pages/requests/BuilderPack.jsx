import { useState } from 'react'
import { Send, Package, Search } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Select, Textarea } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockBuilderPacks } from '../../data/mockRequests'

const PACK_CONTENTS = [
  'Product Catalogue (PDF)',
  'Specification Sheets',
  'Installation Guidelines',
  'Compliance Certificates',
  'Pricing Guide (Trade)',
  'NDIS Provider Info',
]

const STATUS_VARIANT = { pending: 'warning', sent: 'success' }

export function BuilderPack() {
  const [packs, setPacks] = useState(mockBuilderPacks)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedContents, setSelectedContents] = useState(PACK_CONTENTS)
  const [form, setForm] = useState({})

  const filtered = packs.filter(p =>
    !search || [p.company, p.contact, p.state].some(v => v.toLowerCase().includes(search.toLowerCase()))
  )

  const openPack = (pack) => {
    setSelected(pack)
    setForm({ notes: pack.notes ?? '' })
    setSelectedContents(PACK_CONTENTS)
  }

  const toggleContent = (item) => {
    setSelectedContents(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const handleSend = () => {
    setPacks(prev => prev.map(p => p.id === selected.id ? { ...p, status: 'sent' } : p))
    toast(`Builder pack sent to ${selected.contact} at ${selected.company}`, 'success')
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Builder Pack Requests"
        subtitle="Send specification packs to builders and contractors."
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="bg-surface rounded-xl border border-border px-4 py-3 text-center">
            <p className="text-2xl font-bold text-text-primary">{packs.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs text-text-muted mt-0.5">Pending</p>
          </div>
          <div className="bg-surface rounded-xl border border-border px-4 py-3 text-center">
            <p className="text-2xl font-bold text-success-500">{packs.filter(p => p.status === 'sent').length}</p>
            <p className="text-xs text-text-muted mt-0.5">Sent</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, state..." className="h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-52" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Ref', 'Company', 'Contact', 'Project Type', 'Units', 'State', 'Requested', 'Status', ''].map((h, i) => (
                <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={9} className="px-5 py-12 text-center text-text-muted">No requests found.</td></tr>
              : filtered.map(pack => (
                <tr key={pack.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-brand-500">{pack.id}</td>
                  <td className="px-5 py-3.5 font-medium text-text-primary">{pack.company}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.contact}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.projectType}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.units}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{pack.state}</td>
                  <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{pack.requested}</td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[pack.status]} label={pack.status === 'sent' ? 'Sent' : 'Pending'} dot /></td>
                  <td className="px-5 py-3.5">
                    <Button variant={pack.status === 'sent' ? 'secondary' : 'primary'} size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={() => openPack(pack)}>
                      {pack.status === 'sent' ? 'Resend' : 'Send Pack'}
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={`Send Builder Pack â€” ${selected?.company}`} width="lg">
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="bg-grey-50 rounded-xl border border-border p-4 flex flex-col gap-1.5">
              <p className="font-semibold text-text-primary">{selected.company}</p>
              <p className="text-sm text-text-secondary">{selected.contact} · {selected.email}</p>
              <p className="text-sm text-text-muted">{selected.projectType} · {selected.units} units · {selected.state}</p>
              {selected.notes && <p className="text-sm text-text-muted italic mt-1">"{selected.notes}"</p>}
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">Pack Contents</p>
              <p className="text-xs text-text-muted mb-3">Select which documents to include in this pack.</p>
              <div className="flex flex-col gap-2">
                {PACK_CONTENTS.map(item => (
                  <label key={item} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface hover:bg-grey-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={selectedContents.includes(item)} onChange={() => toggleContent(item)} className="accent-brand-500 w-4 h-4" />
                    <Package className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-sm text-text-primary">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <Field label="Cover Message">
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                placeholder="e.g. Hi Dave, please find attached our builder pack..." />
            </Field>

            <div className="bg-brand-50 rounded-xl border border-brand-100 p-3 text-sm text-brand-600">
              Pack will be emailed to <strong>{selected.email}</strong>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
              <Button variant="primary" icon={<Send className="w-4 h-4" />} onClick={handleSend}>Send Pack</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
