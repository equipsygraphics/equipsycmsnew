import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea, Select } from '../../components/ui/FormField'
import { RichTextEditor } from '../../components/ui/RichTextEditor'
import { MediaPicker } from '../../components/ui/MediaPicker'
import { toast } from '../../components/ui/Toast'
import { mockBlogPosts, BLOG_CATEGORIES, mockTags } from '../../data/mockContent'

export function BlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const existing = !isNew ? mockBlogPosts.find(p => p.id === Number(id)) : null

  const [form, setForm] = useState(existing ?? {
    title: '', category: '', excerpt: '', content: '', tags: [],
    featuredImage: null, slug: '', metaTitle: '', metaDesc: '',
  })
  const [tagInput, setTagInput] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addTag = (name) => {
    const trimmed = name.trim()
    if (!trimmed || form.tags.includes(trimmed)) return
    set('tags', [...form.tags, trimmed])
    setTagInput('')
  }

  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t))

  const handleSave = (status) => {
    toast(isNew ? `Post "${form.title || 'Untitled'}" created as ${status}` : 'Post saved', 'success')
    navigate('/blog')
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Main column */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        <button onClick={() => navigate('/blog')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-text-primary">{isNew ? 'New Blog Post' : `Edit: ${form.title}`}</h1>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={() => handleSave('draft')}>Save Draft</Button>
            <Button variant="primary" onClick={() => handleSave('published')}>Publish</Button>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
          <Field label="Post Title" required>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. How to Choose the Right Grab Rail" className="text-base font-medium" />
          </Field>
          <Field label="Excerpt" hint="Short summary shown in blog listing and social shares">
            <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} placeholder="Brief summary of this post…" />
          </Field>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-sm font-semibold text-text-primary mb-3">Content</p>
          <RichTextEditor value={form.content} onChange={v => set('content', v)} placeholder="Start writing your blog post…" minHeight={320} />
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-text-primary">SEO</p>
          <Field label="URL Slug">
            <div className="flex items-center">
              <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">/blog/</span>
              <Input value={form.slug} onChange={e => set('slug', e.target.value)} className="rounded-l-none" placeholder="post-url-slug" />
            </div>
          </Field>
          <Field label="Meta Title" hint={`${form.metaTitle?.length ?? 0}/60`}>
            <Input value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} maxLength={60} placeholder="SEO title" />
          </Field>
          <Field label="Meta Description" hint={`${form.metaDesc?.length ?? 0}/160`}>
            <Textarea value={form.metaDesc} onChange={e => set('metaDesc', e.target.value)} rows={2} maxLength={160} placeholder="SEO description" />
          </Field>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-72 flex flex-col gap-4 shrink-0">
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-4">
          <p className="text-sm font-semibold text-text-primary">Post Settings</p>
          <Field label="Category">
            <Select value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category…</option>
              {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Publish Date">
            <Input type="date" value={form.date ?? ''} onChange={e => set('date', e.target.value)} />
          </Field>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-text-primary">Featured Image</p>
          <MediaPicker value={form.featuredImage ? [form.featuredImage] : []} onChange={v => set('featuredImage', v[0] ?? null)} label="Upload featured image" accept="image/*" />
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-text-primary">Tags</p>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
              placeholder="Type a tag + Enter"
              className="flex-1"
            />
          </div>
          {/* Suggested tags */}
          {tagInput.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {mockTags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !form.tags.includes(t.name)).slice(0, 5).map(t => (
                <button key={t.id} onClick={() => addTag(t.name)} className="text-xs bg-grey-100 hover:bg-brand-100 text-text-secondary hover:text-brand-600 px-2 py-1 rounded-full transition-colors">
                  {t.name}
                </button>
              ))}
            </div>
          )}
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map(t => (
                <span key={t} className="flex items-center gap-1 bg-brand-100 text-brand-600 text-xs px-2 py-1 rounded-full">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-brand-700"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
