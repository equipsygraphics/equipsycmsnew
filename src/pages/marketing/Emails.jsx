import { useState } from 'react'
import { Mail, Edit2, Eye, Send } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Textarea, Toggle } from '../../components/ui/FormField'
import { RichTextEditor } from '../../components/ui/RichTextEditor'
import { toast } from '../../components/ui/Toast'
import { EMAIL_TEMPLATES } from '../../data/mockMarketing'

export function Emails() {
  const [templates, setTemplates] = useState(EMAIL_TEMPLATES)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [preview, setPreview] = useState(null)
  const [testEmail, setTestEmail] = useState('')

  const openEdit = (t) => {
    setEditing(t)
    setForm({
      name: t.name,
      subject: `[Equipsy] ${t.name}`,
      preheader: '',
      body: `<p>Hi {{customer_name}},</p>\n<p>Thank you for choosing Equipsy. ${t.name} details are below.</p>`,
      active: t.status === 'active',
    })
  }

  const handleSave = () => {
    setTemplates(prev => prev.map(t => t.id === editing.id
      ? { ...t, name: form.name, status: form.active ? 'active' : 'draft', lastEdited: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }
      : t))
    toast(`"${form.name}" template saved`, 'success')
    setEditing(null)
  }

  const handleSendTest = () => {
    if (!testEmail) { toast('Enter an email address', 'error'); return }
    toast(`Test email sent to ${testEmail}`, 'success')
    setTestEmail('')
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Email Templates"
        subtitle="Manage transactional and automated email templates."
      />

      <div className="grid grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-surface rounded-xl border border-border shadow-card p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary text-sm">{t.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t.trigger}</p>
                </div>
                <Badge variant={t.status === 'active' ? 'success' : 'default'} label={t.status === 'active' ? 'Active' : 'Draft'} dot />
              </div>
              <p className="text-xs text-text-muted mt-2">Last edited: {t.lastEdited}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="secondary" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(t)}>Edit</Button>
                <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setPreview(t)}>Preview</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit drawer */}
      <Drawer open={!!editing} onClose={() => setEditing(null)} title={`Edit Template — ${editing?.name}`} width="lg">
        {editing && (
          <div className="flex flex-col gap-4">
            <Field label="Template Name" required><Input value={form.name} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Subject Line"><Input value={form.subject} onChange={e => set('subject', e.target.value)} /></Field>
            <Field label="Preheader Text" hint="Shown after subject in inbox preview">
              <Input value={form.preheader} onChange={e => set('preheader', e.target.value)} placeholder="Short preview text…" />
            </Field>
            <Field label="Email Body">
              <RichTextEditor value={form.body} onChange={v => set('body', v)} minHeight={200} placeholder="Email content…" />
            </Field>
            <div className="bg-grey-50 rounded-xl border border-border p-3">
              <p className="text-xs text-text-muted font-semibold mb-1">Available merge tags</p>
              <div className="flex flex-wrap gap-1.5">
                {['{{customer_name}}', '{{order_number}}', '{{total}}', '{{tracking_url}}', '{{company_name}}'].map(tag => (
                  <code key={tag} className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded font-mono">{tag}</code>
                ))}
              </div>
            </div>
            <Toggle label="Template active" checked={form.active} onChange={v => set('active', v)} />

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-text-muted mb-2">Send Test Email</p>
              <div className="flex gap-2">
                <Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com" className="flex-1" />
                <Button variant="secondary" icon={<Send className="w-4 h-4" />} onClick={handleSendTest}>Send Test</Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save Template</Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">{preview.name}</p>
                <p className="text-xs text-text-muted mt-0.5">Subject: [Equipsy] {preview.name}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-text-muted hover:text-text-primary p-1">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-grey-50 rounded-xl border border-border p-6 text-sm text-text-secondary space-y-3">
                <p className="text-lg font-bold text-text-primary">Hi [Customer Name],</p>
                <p>Thank you for choosing Equipsy. Your {preview.name.toLowerCase()} details are below.</p>
                <div className="my-4 h-px bg-border" />
                <p className="text-text-muted text-xs">This is a preview of the <strong>{preview.name}</strong> template. Merge tags will be replaced with real values when sent.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between">
              <Button variant="secondary" icon={<Edit2 className="w-4 h-4" />} onClick={() => { setPreview(null); openEdit(preview) }}>Edit Template</Button>
              <Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
