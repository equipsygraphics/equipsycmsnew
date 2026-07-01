import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea, Select } from '../../components/ui/FormField'
import { RichTextEditor } from '../../components/ui/RichTextEditor'
import { MediaPicker } from '../../components/ui/MediaPicker'
import { TagPicker } from '../../components/ui/TagPicker'
import { toast } from '../../components/ui/Toast'
import { mockBlogPosts, BLOG_CATEGORIES } from '../../data/mockContent'
import { mockTags as INITIAL_TAGS, toSlug } from '../../data/mockTagging'

export function BlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const existing = !isNew ? mockBlogPosts.find(p => p.id === Number(id)) : null

  const [allTags, setAllTags] = useState(INITIAL_TAGS)
  const [form, setForm] = useState(existing ?? {
    title: '', category: '', excerpt: '', content: '', tagIds: [],
    featuredImage: null, slug: '', metaTitle: '', metaDesc: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreateTag = (name, slug) => {
    const newTag = { id: Date.now(), name, slug, description: '' }
    setAllTags(prev => [...prev, newTag])
    return newTag
  }

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
          <div>
            <p className="text-sm font-semibold text-text-primary">Tags</p>
            <p className="text-xs text-text-muted mt-0.5">Link this post to product categories via shared tags</p>
          </div>
          <TagPicker
            allTags={allTags}
            selectedIds={form.tagIds ?? []}
            onChange={ids => set('tagIds', ids)}
            onCreateTag={handleCreateTag}
            placeholder="Search or create tags…"
          />
        </div>
      </div>
    </div>
  )
}
