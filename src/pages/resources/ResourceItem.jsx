import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Plus, X, File, Image, ChevronDown, Wrench, Trash2,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import {
  mockResourceTypes, mockResources, mockResourceCategories,
} from '../../data/mockResources'
import {
  mockFaqs, mockCompletedInstalls, mockLandingPages,
  mockProductCategories, getCategoryLabel,
} from '../../data/mockSharedResources'
import { mockTags } from '../../data/mockTagging'

// ── Shared UI ─────────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      {title && <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{title}</p>}
      {children}
    </div>
  )
}

function StatusSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 pl-3 pr-8 rounded-lg border border-border text-sm bg-white appearance-none outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
    </div>
  )
}

function ProductCategorySelect({ value, onChange }) {
  const primary = mockProductCategories.filter(c => c.parentId == null)
  const subOf   = (parentId) => mockProductCategories.filter(c => c.parentId === parentId)

  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full h-10 pl-3 pr-8 rounded-lg border border-border text-sm bg-white appearance-none outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">— No category —</option>
        {primary.map(cat => (
          <optgroup key={cat.id} label={cat.name}>
            <option value={cat.id}>{cat.name} (primary)</option>
            {subOf(cat.id).map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
    </div>
  )
}

function ResourceCategorySelect({ value, onChange, resourceTypeId }) {
  const cats = mockResourceCategories.filter(c => c.resourceTypeId === resourceTypeId)

  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className="w-full h-10 pl-3 pr-8 rounded-lg border border-border text-sm bg-white appearance-none outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">— No category —</option>
        {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
    </div>
  )
}

// ── Article form ──────────────────────────────────────────────────────────────

function ArticleForm({ form, onChange, resourceType }) {
  const tags = mockTags

  const toggleTag = (id) => {
    const ids = form.tagIds ?? []
    onChange('tagIds', ids.includes(id) ? ids.filter(t => t !== id) : [...ids, id])
  }

  return (
    <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
      <div className="flex flex-col gap-4">
        <SectionCard>
          <Field label="Title">
            <Input value={form.title ?? ''} onChange={e => onChange('title', e.target.value)} placeholder="Post title" />
          </Field>
          <Field label="Excerpt">
            <textarea
              value={form.excerpt ?? ''}
              onChange={e => onChange('excerpt', e.target.value)}
              placeholder="Short summary shown in listings…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
            />
          </Field>
          <Field label="Content">
            <textarea
              value={form.content ?? ''}
              onChange={e => onChange('content', e.target.value)}
              placeholder="Write your article content here…"
              rows={12}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none font-mono"
            />
          </Field>
        </SectionCard>
      </div>

      <div className="flex flex-col gap-4">
        <SectionCard title="Settings">
          <Field label="Status">
            <StatusSelect value={form.status ?? 'draft'} onChange={v => onChange('status', v)} />
          </Field>
          <Field label="Category">
            <ResourceCategorySelect value={form.resourceCategoryId} onChange={v => onChange('resourceCategoryId', v)} resourceTypeId={resourceType.id} />
          </Field>
          <Field label="Author">
            <Input value={form.author ?? ''} onChange={e => onChange('author', e.target.value)} placeholder="Author name" />
          </Field>
          <Field label="Publish Date">
            <Input type="date" value={form.publishedAt ?? ''} onChange={e => onChange('publishedAt', e.target.value)} />
          </Field>
        </SectionCard>

        <SectionCard title="Featured Image">
          {form.featuredImage
            ? (
              <div className="relative rounded-lg overflow-hidden bg-grey-100 aspect-video">
                <img src={form.featuredImage} alt="" className="w-full h-full object-cover" />
                <button onClick={() => onChange('featuredImage', null)} className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-text-muted hover:text-error-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-text-muted">
                <Image className="w-5 h-5" />
                <span className="text-xs">No image selected</span>
              </div>
            )
          }
          <Input placeholder="Image URL…" value={form.featuredImage ?? ''} onChange={e => onChange('featuredImage', e.target.value || null)} />
        </SectionCard>

        <SectionCard title="Tags">
          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
            {tags.length === 0 && <p className="text-xs text-text-muted">No tags available.</p>}
            {tags.map(tag => (
              <label key={tag.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-grey-50 cursor-pointer">
                <input type="checkbox" checked={(form.tagIds ?? []).includes(tag.id)} onChange={() => toggleTag(tag.id)} className="accent-brand-500" />
                <span className="text-sm text-text-primary">{tag.name}</span>
              </label>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// ── File list form ────────────────────────────────────────────────────────────

function FileListForm({ form, onChange, resourceType }) {
  const [newName, setNewName] = useState('')
  const [newSize, setNewSize] = useState('')

  const addFile = () => {
    const name = newName.trim()
    if (!name) { toast('Enter a file name', 'error'); return }
    onChange('files', [...(form.files ?? []), { id: uid(), name, size: newSize.trim() }])
    setNewName(''); setNewSize('')
  }

  const removeFile = (id) => onChange('files', (form.files ?? []).filter(f => f.id !== id))

  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <Field label="Title">
          <Input value={form.title ?? ''} onChange={e => onChange('title', e.target.value)} placeholder="Resource title" />
        </Field>
        <Field label="Description">
          <textarea
            value={form.description ?? ''}
            onChange={e => onChange('description', e.target.value)}
            placeholder="Brief description of what this resource contains…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
          />
        </Field>
        <Field label="Product Category">
          <ProductCategorySelect value={form.productCategoryId} onChange={v => onChange('productCategoryId', v)} />
        </Field>
        <Field label="Status">
          <StatusSelect value={form.status ?? 'draft'} onChange={v => onChange('status', v)} />
        </Field>
      </SectionCard>

      <SectionCard title="Files">
        {(form.files ?? []).length > 0 && (
          <div className="flex flex-col gap-2">
            {(form.files ?? []).map(f => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-grey-50">
                <File className="w-4 h-4 text-brand-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{f.name}</p>
                  {f.size && <p className="text-xs text-text-muted">{f.size}</p>}
                </div>
                <button onClick={() => removeFile(f.id)} className="p-1 rounded text-text-muted hover:text-error-500 hover:bg-error-500/10 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Add file</p>
          <div className="flex gap-2">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Filename (e.g. brochure-2026.pdf)" onKeyDown={e => e.key === 'Enter' && addFile()} />
            <div className="w-28 shrink-0">
              <Input value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="Size" onKeyDown={e => e.key === 'Enter' && addFile()} />
            </div>
            <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={addFile}>Add</Button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ── FAQ form ──────────────────────────────────────────────────────────────────
// Each FAQ resource item = one Q&A pair + category.
// Saved to mockFaqs (shared with Product Category edit screens).

function FaqForm({ form, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <Field label="Product Category">
          <ProductCategorySelect value={form.productCategoryId} onChange={v => onChange('productCategoryId', v)} />
          <p className="text-xs text-text-muted">This FAQ will also appear on the linked product category page.</p>
        </Field>
        <Field label="Status">
          <StatusSelect value={form.status ?? 'draft'} onChange={v => onChange('status', v)} />
        </Field>
      </SectionCard>

      <SectionCard title="Question & Answer">
        <Field label="Question">
          <Input value={form.question ?? ''} onChange={e => onChange('question', e.target.value)} placeholder="Enter the question" />
        </Field>
        <Field label="Answer">
          <textarea
            value={form.answer ?? ''}
            onChange={e => onChange('answer', e.target.value)}
            placeholder="Enter the full answer…"
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
          />
        </Field>
      </SectionCard>
    </div>
  )
}

// ── Photo gallery (Completed Install) form ───────────────────────────────────
// Each resource item = one project install entry + category.
// Saved to mockCompletedInstalls (shared with Product Category edit screens).

function GalleryForm({ form, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <Field label="Project Title">
          <Input value={form.title ?? ''} onChange={e => onChange('title', e.target.value)} placeholder="e.g. Bathroom Renovation — Sydney" />
        </Field>
        <Field label="Product Category">
          <ProductCategorySelect value={form.productCategoryId} onChange={v => onChange('productCategoryId', v)} />
          <p className="text-xs text-text-muted">This install will also appear on the linked product category page.</p>
        </Field>
        <Field label="Status">
          <StatusSelect value={form.status ?? 'draft'} onChange={v => onChange('status', v)} />
        </Field>
      </SectionCard>

      <SectionCard title="Project Details">
        <Field label="Project Description">
          <textarea
            value={form.projectDetail ?? ''}
            onChange={e => onChange('projectDetail', e.target.value)}
            placeholder="Describe the project — scope of work, products used, location…"
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
          />
        </Field>
        <Field label="Photo Caption">
          <Input value={form.caption ?? ''} onChange={e => onChange('caption', e.target.value)} placeholder="Main photo caption" />
        </Field>
        <Field label="Photo URL">
          <Input value={form.mediaUrl ?? ''} onChange={e => onChange('mediaUrl', e.target.value || null)} placeholder="Image URL (optional)" />
          {form.mediaUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-grey-100 mt-1">
              <img src={form.mediaUrl} alt={form.caption} className="w-full h-full object-cover" />
            </div>
          )}
        </Field>
      </SectionCard>
    </div>
  )
}

// ── Landing page (Tool) form ──────────────────────────────────────────────────
// Creates / edits a LandingPage with isTool = true.
// Saved to mockLandingPages.

function ToolForm({ form, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200">
        <Wrench className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
        <p className="text-sm text-brand-700">
          Tools are Landing Pages flagged as interactive tools (e.g. calculators, finders). The URL slug and content are managed here; the interactive component is deployed separately.
        </p>
      </div>

      <SectionCard>
        <Field label="Title">
          <Input value={form.title ?? ''} onChange={e => onChange('title', e.target.value)} placeholder="e.g. Ramp Gradient Calculator" />
        </Field>
        <Field label="URL Slug">
          <Input value={form.slug ?? ''} onChange={e => onChange('slug', e.target.value)} placeholder="ramp-gradient-calculator" />
        </Field>
        <Field label="Description">
          <textarea
            value={form.description ?? ''}
            onChange={e => onChange('description', e.target.value)}
            placeholder="Briefly describe what this tool does and who it's for…"
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
          />
        </Field>
        <Field label="Status">
          <StatusSelect value={form.status ?? 'draft'} onChange={v => onChange('status', v)} />
        </Field>
      </SectionCard>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const BLANK_BY_SHAPE = {
  article:              { title: '', excerpt: '', content: '', author: '', publishedAt: '', tagIds: [], featuredImage: null, resourceCategoryId: null, status: 'draft' },
  file_list:            { title: '', description: '', files: [], productCategoryId: null, status: 'draft' },
  faq:                  { question: '', answer: '', productCategoryId: null, status: 'draft' },
  photo_gallery:        { title: '', projectDetail: '', caption: '', mediaUrl: null, productCategoryId: null, status: 'draft' },
  landing_page_reference: { title: '', slug: '', description: '', status: 'draft', isTool: true },
}

function findExistingItem(shape, typeId, id) {
  if (shape === 'faq')                  return mockFaqs.find(f => f.id === id)
  if (shape === 'photo_gallery')        return mockCompletedInstalls.find(c => c.id === id)
  if (shape === 'landing_page_reference') return mockLandingPages.find(p => p.id === id)
  return mockResources.find(r => r.id === id)
}

function saveItem(isNew, shape, typeId, id, finalForm) {
  if (shape === 'faq') {
    if (isNew) {
      mockFaqs.push({ ...finalForm, id: `faq-${Date.now()}`, typeId })
    } else {
      const idx = mockFaqs.findIndex(f => f.id === id)
      if (idx >= 0) mockFaqs[idx] = { ...mockFaqs[idx], ...finalForm }
    }
  } else if (shape === 'photo_gallery') {
    if (isNew) {
      mockCompletedInstalls.push({ ...finalForm, id: `ci-${Date.now()}`, typeId })
    } else {
      const idx = mockCompletedInstalls.findIndex(c => c.id === id)
      if (idx >= 0) mockCompletedInstalls[idx] = { ...mockCompletedInstalls[idx], ...finalForm }
    }
  } else if (shape === 'landing_page_reference') {
    if (isNew) {
      mockLandingPages.push({ ...finalForm, id: `lp-${Date.now()}`, isTool: true })
    } else {
      const idx = mockLandingPages.findIndex(p => p.id === id)
      if (idx >= 0) mockLandingPages[idx] = { ...mockLandingPages[idx], ...finalForm }
    }
  } else {
    if (isNew) {
      mockResources.push({ ...finalForm, id: `res-${Date.now()}`, typeId })
    } else {
      const idx = mockResources.findIndex(r => r.id === id)
      if (idx >= 0) mockResources[idx] = { ...mockResources[idx], ...finalForm }
    }
  }
}

function requireTitle(form, shape) {
  if (shape === 'faq') return (form.question ?? '').trim().length > 0
  return (form.title ?? '').trim().length > 0
}

export function ResourceItem() {
  const navigate = useNavigate()
  const { typeSlug, id } = useParams()
  const isNew = id === 'new'

  const resourceType = mockResourceTypes.find(t => t.slug === typeSlug)
  const shape = resourceType?.contentShape

  const existingItem = isNew ? null : (shape ? findExistingItem(shape, resourceType?.id, id) : null)

  const [form, setForm] = useState(() => {
    if (isNew) return { ...(BLANK_BY_SHAPE[shape] ?? {}) }
    if (!existingItem) return null
    return { ...existingItem }
  })

  if (!resourceType) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-text-muted text-sm">Resource type not found.</p>
        <Button variant="secondary" onClick={() => navigate('/resources')}>Back to Resources</Button>
      </div>
    )
  }

  if (!isNew && !existingItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-text-muted text-sm">Resource not found.</p>
        <Button variant="secondary" onClick={() => navigate('/resources')}>Back to Resources</Button>
      </div>
    )
  }

  const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = (status) => {
    if (!requireTitle(form, shape)) {
      toast(shape === 'faq' ? 'Question is required' : 'Title is required', 'error')
      return
    }
    const finalForm = { ...form, status: status ?? form.status }
    saveItem(isNew, shape, resourceType.id, id, finalForm)
    toast(isNew ? 'Created' : 'Saved', 'success')
    navigate('/resources')
  }

  const itemTitle = shape === 'faq'
    ? (form.question || 'New FAQ')
    : (form.title || `New ${resourceType.name.replace(/s$/, '')}`)

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Resources
      </button>

      <PageHeader
        title={isNew ? `New ${resourceType.name.replace(/s$/, '')}` : itemTitle}
        subtitle={resourceType.name}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/resources')}>Cancel</Button>
            {isNew
              ? <>
                  <Button variant="secondary" onClick={() => handleSave('draft')}>Save Draft</Button>
                  <Button variant="primary" onClick={() => handleSave('published')}>Publish</Button>
                </>
              : <Button variant="primary" onClick={() => handleSave()}>Save</Button>
            }
          </div>
        }
      />

      {shape === 'article'              && <ArticleForm  form={form} onChange={onChange} resourceType={resourceType} />}
      {shape === 'file_list'            && <FileListForm form={form} onChange={onChange} resourceType={resourceType} />}
      {shape === 'faq'                  && <FaqForm      form={form} onChange={onChange} />}
      {shape === 'photo_gallery'        && <GalleryForm  form={form} onChange={onChange} />}
      {shape === 'landing_page_reference' && <ToolForm   form={form} onChange={onChange} />}
    </div>
  )
}
