import { useState } from 'react'
import { Plus, Copy, Trash2, Tag } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input, Select, Toggle } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockCoupons } from '../../data/mockMarketing'

const TYPE_LABELS = { percentage: '% Off', fixed: '$ Off', free_shipping: 'Free Shipping' }
const EMPTY = { code: '', type: 'percentage', value: '', minOrder: '', usageLimit: '', description: '', expires: '', hasExpiry: false, hasUsageLimit: false }

export function Coupons() {
  const [coupons, setCoupons] = useState(mockCoupons)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openNew = () => { setEditing({ ...EMPTY, hasExpiry: false, hasUsageLimit: false }); setDrawerOpen(true) }
  const openEdit = (c) => { setEditing({ ...c, hasExpiry: !!c.expires, hasUsageLimit: !!c.usageLimit }); setDrawerOpen(true) }

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setEditing(e => ({ ...e, code }))
  }

  const handleSave = () => {
    if (!editing.code.trim()) { toast('Coupon code is required', 'error'); return }
    const payload = {
      ...editing,
      code: editing.code.toUpperCase(),
      value: Number(editing.value) || 0,
      minOrder: Number(editing.minOrder) || 0,
      usageLimit: editing.hasUsageLimit ? Number(editing.usageLimit) || null : null,
      expires: editing.hasExpiry ? editing.expires : null,
      status: 'active',
    }
    if (editing.id) {
      setCoupons(prev => prev.map(c => c.id === editing.id ? payload : c))
      toast('Coupon updated', 'success')
    } else {
      setCoupons(prev => [...prev, { ...payload, id: Date.now(), usedCount: 0 }])
      toast(`Coupon "${payload.code}" created`, 'success')
    }
    setDrawerOpen(false)
  }

  const set = (k, v) => setEditing(e => ({ ...e, [k]: v }))

  const usagePercent = (c) => c.usageLimit ? Math.round((c.usedCount / c.usageLimit) * 100) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Coupons & Vouchers"
        subtitle={`${coupons.filter(c => c.status === 'active').length} active codes`}
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNew}>New Coupon</Button>}
      />

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Code', 'Description', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-text-primary bg-grey-100 px-2 py-0.5 rounded text-sm">{c.code}</code>
                    <button onClick={() => { navigator.clipboard?.writeText(c.code); toast(`Copied "${c.code}"`, 'success') }} className="p-1 rounded text-text-muted hover:text-brand-500"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{c.description}</td>
                <td className="px-5 py-3.5 font-medium text-text-primary">
                  {c.type === 'free_shipping' ? 'Free Shipping' : c.type === 'percentage' ? `${c.value}% off` : `$${c.value} off`}
                </td>
                <td className="px-5 py-3.5 text-text-muted">{c.minOrder > 0 ? `$${c.minOrder}` : 'â€”'}</td>
                <td className="px-5 py-3.5">
                  {c.usageLimit ? (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-grey-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(usagePercent(c), 100)}%` }} />
                      </div>
                      <span className="text-xs text-text-muted">{c.usedCount}/{c.usageLimit}</span>
                    </div>
                  ) : <span className="text-text-muted">{c.usedCount} uses</span>}
                </td>
                <td className="px-5 py-3.5 text-text-muted">{c.expires ?? 'â€”'}</td>
                <td className="px-5 py-3.5"><Badge variant={c.status === 'active' ? 'success' : 'default'} label={c.status === 'active' ? 'Active' : 'Expired'} dot /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50"><Tag className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing?.id ? 'Edit Coupon' : 'New Coupon'}>
        {editing && (
          <div className="flex flex-col gap-4">
            <Field label="Coupon Code" required>
              <div className="flex gap-2">
                <Input value={editing.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. SAVE20" className="flex-1 font-mono font-bold" />
                <Button variant="secondary" onClick={generateCode} size="sm">Generate</Button>
              </div>
            </Field>
            <Field label="Description"><Input value={editing.description} onChange={e => set('description', e.target.value)} placeholder="Internal description" /></Field>
            <Field label="Discount Type">
              <Select value={editing.type} onChange={e => set('type', e.target.value)}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_shipping">Free shipping</option>
              </Select>
            </Field>
            {editing.type !== 'free_shipping' && (
              <Field label={editing.type === 'percentage' ? 'Discount %' : 'Discount Amount ($)'}>
                <div className="flex items-center">
                  <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">{editing.type === 'percentage' ? '%' : '$'}</span>
                  <Input type="number" value={editing.value} onChange={e => set('value', e.target.value)} className="rounded-l-none" />
                </div>
              </Field>
            )}
            <Field label="Minimum Order ($)">
              <div className="flex items-center">
                <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                <Input type="number" value={editing.minOrder} onChange={e => set('minOrder', e.target.value)} className="rounded-l-none" placeholder="0 for no minimum" />
              </div>
            </Field>
            <Toggle label="Usage limit" checked={editing.hasUsageLimit} onChange={v => set('hasUsageLimit', v)} />
            {editing.hasUsageLimit && (
              <Field label="Max Uses"><Input type="number" value={editing.usageLimit ?? ''} onChange={e => set('usageLimit', e.target.value)} /></Field>
            )}
            <Toggle label="Expiry date" checked={editing.hasExpiry} onChange={v => set('hasExpiry', v)} />
            {editing.hasExpiry && (
              <Field label="Expires On"><Input type="date" value={editing.expires ?? ''} onChange={e => set('expires', e.target.value)} /></Field>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save Coupon</Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { setCoupons(prev => prev.filter(c => c.id !== deleteTarget.id)); toast('Coupon deleted', 'success'); setDeleteTarget(null) }}
        title="Delete coupon" message={`Delete coupon "${deleteTarget?.code}"?`} confirmLabel="Delete" destructive />
    </div>
  )
}
