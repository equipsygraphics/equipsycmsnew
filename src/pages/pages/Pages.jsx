import { useState } from 'react'
import { Edit2, Plus, Trash2, Globe, FileText, Home, Mail, Info } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input, Textarea, Select, Toggle } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockPages, PAGE_TEMPLATES } from '../../data/mockContent'

const TEMPLATE_ICON = {
  standard: <FileText className="w-5 h-5 text-text-muted" />,
  landing:  <Home className="w-5 h-5 text-brand-500" />,
  contact:  <Mail className="w-5 h-5 text-text-muted" />,
  about:    <Info className="w-5 h-5 text-text-muted" />,
}

export function Pages() {
  const [pages, setPages] = useState(mockPages)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openNew = () => { setEditing({ title: '', template: 'standard', slug: '', status: 'draft', heroTitle: '', heroSubtitle: '', bodyContent: '', ctaLabel: '', ctaUrl: '', metaTitle: '', metaDesc: '', showInNav: false }); setDrawerOpen(true) }
  const openEdit = (page) => { setEditing({ ...page }); setDrawerOpen(true) }

  const handleSave = () => {
    if (!editing.title.trim()) { toast('Page title is required', 'error'); return }
    if (editing.id) {
      setPages(prev => prev.map(p => p.id === editing.id ? { ...editing, updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) } : p))
      toast(`"${editing.title}" saved`, 'success')
    } else {
      setPages(prev => [...prev, { ...editing, id: Date.now(), updatedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }])
      toast(`"${editing.title}" page created`, 'success')
    }
    setDrawerOpen(false)
  }

  const handleDelete = (id) => { setPages(prev => prev.filter(p => p.id !== id)); toast('Page deleted', 'success') }

  const set = (k, v) => setEditing(e => ({ ...e, [k]: v }))
  const tpl = PAGE_TEMPLATES.find(t => t.value === editing?.template)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pages"
        subtitle={`${pages.length} pages`}
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNew}>New Page</Button>}
      />

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Page', 'Template', 'Slug', 'Last Updated', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{TEMPLATE_ICON[page.template] ?? <FileText className="w-5 h-5 text-text-muted" />}</span>
                    <p className="font-medium text-text-primary">{page.title}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-text-secondary capitalize">{PAGE_TEMPLATES.find(t => t.value === page.template)?.label ?? page.template}</td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1 text-text-muted font-mono text-xs"><Globe className="w-3 h-3" />{page.slug}</span>
                </td>
                <td className="px-5 py-3.5 text-text-muted">{page.updatedAt}</td>
                <td className="px-5 py-3.5"><Badge variant={page.status} label={page.status === 'published' ? 'Published' : 'Draft'} dot /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(page)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(page)} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing?.id ? `Edit: ${editing.title}` : 'New Page'} width="lg">
        {editing && (
          <div className="flex flex-col gap-5">
            <Field label="Page Title" required>
              <Input value={editing.title} onChange={e => set('title', e.target.value)} placeholder="e.g. About Us" />
            </Field>
            <Field label="URL Slug" required>
              <div className="flex items-center">
                <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">equipsy.com.au</span>
                <Input value={editing.slug} onChange={e => set('slug', e.target.value)} className="rounded-l-none" placeholder="/about" />
              </div>
            </Field>

            <Field label="Template">
              <div className="grid grid-cols-2 gap-2">
                {PAGE_TEMPLATES.map(t => (
                  <button key={t.value} onClick={() => set('template', t.value)}
                    className={`text-left p-3 rounded-lg border-2 transition-colors ${editing.template === t.value ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-grey-300'}`}>
                    <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                      <span className="shrink-0">{TEMPLATE_ICON[t.value]}</span>{t.label}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Template Fields &mdash; {tpl?.label}</p>
              {(editing.template === 'landing' || editing.template === 'standard') && (
                <div className="flex flex-col gap-3">
                  <Field label="Hero Title"><Input value={editing.heroTitle ?? ''} onChange={e => set('heroTitle', e.target.value)} placeholder="Main heading" /></Field>
                  <Field label="Hero Subtitle"><Textarea value={editing.heroSubtitle ?? ''} onChange={e => set('heroSubtitle', e.target.value)} rows={2} placeholder="Supporting text" /></Field>
                  <Field label="CTA Label"><Input value={editing.ctaLabel ?? ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="e.g. Shop Now" /></Field>
                  <Field label="CTA URL"><Input value={editing.ctaUrl ?? ''} onChange={e => set('ctaUrl', e.target.value)} placeholder="/products" /></Field>
                  <Field label="Body Content"><Textarea value={editing.bodyContent ?? ''} onChange={e => set('bodyContent', e.target.value)} rows={4} placeholder="Page body content..." /></Field>
                </div>
              )}
              {editing.template === 'contact' && (
                <div className="flex flex-col gap-3">
                  <Field label="Office Address"><Textarea value={editing.bodyContent ?? ''} onChange={e => set('bodyContent', e.target.value)} rows={3} placeholder="123 Street, Melbourne VIC 3000" /></Field>
                  <Field label="Phone"><Input value={editing.heroTitle ?? ''} onChange={e => set('heroTitle', e.target.value)} placeholder="(03) 9000 0000" /></Field>
                  <Field label="Email"><Input value={editing.heroSubtitle ?? ''} onChange={e => set('heroSubtitle', e.target.value)} placeholder="hello@equipsy.com.au" /></Field>
                </div>
              )}
              {editing.template === 'about' && (
                <div className="flex flex-col gap-3">
                  <Field label="Mission Statement"><Textarea value={editing.heroTitle ?? ''} onChange={e => set('heroTitle', e.target.value)} rows={3} placeholder="Our mission is..." /></Field>
                  <Field label="Company Story"><Textarea value={editing.bodyContent ?? ''} onChange={e => set('bodyContent', e.target.value)} rows={4} placeholder="Founded in..." /></Field>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">SEO</p>
              <Field label="Meta Title" hint={`${editing.metaTitle?.length ?? 0}/60`}>
                <Input value={editing.metaTitle ?? ''} onChange={e => set('metaTitle', e.target.value)} maxLength={60} />
              </Field>
              <Field label="Meta Description" hint={`${editing.metaDesc?.length ?? 0}/160`}>
                <Textarea value={editing.metaDesc ?? ''} onChange={e => set('metaDesc', e.target.value)} rows={2} maxLength={160} />
              </Field>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <Toggle label="Show in Navigation" checked={editing.showInNav ?? false} onChange={v => set('showInNav', v)} />
              <div className="flex gap-2">
                <Select value={editing.status} onChange={e => set('status', e.target.value)} className="w-32">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
                <Button variant="primary" onClick={handleSave}>Save Page</Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { handleDelete(deleteTarget?.id); setDeleteTarget(null) }}
        title="Delete page" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} confirmLabel="Delete" destructive />
    </div>
  )
}
