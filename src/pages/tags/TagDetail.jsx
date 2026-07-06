import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Tag, Trash2, BookOpen, FileText, Zap } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/FormField'
import { ConfirmModal } from '../../components/ui/Modal'
import { toast } from '../../components/ui/Toast'
import {
  mockTags as INITIAL_TAGS,
  mockCategoryTagLinks as INITIAL_CAT_LINKS,
  mockContentTagLinks as INITIAL_CONTENT_LINKS,
  computeTagUsage, getTagCategoryIds, toSlug,
} from '../../data/mockTagging'
import { mockCategories } from '../../data/mockCategories'
import { mockBlogPosts, mockPages } from '../../data/mockContent'

export function TagDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const initialTag = isNew
    ? { name: '', slug: '', description: '' }
    : INITIAL_TAGS.find(t => t.id === Number(id))

  const [form, setForm] = useState(initialTag ?? { name: '', slug: '', description: '' })
  const [categoryTagLinks, setCategoryTagLinks] = useState(INITIAL_CAT_LINKS)
  const [contentTagLinks] = useState(INITIAL_CONTENT_LINKS)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!isNew && !initialTag) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Tag className="w-8 h-8 text-text-muted" />
        <p className="text-text-muted">Tag not found.</p>
        <Button variant="secondary" onClick={() => navigate('/tags')}>Back to Tags</Button>
      </div>
    )
  }

  const nameSlug = toSlug(form.name)
  const duplicate = INITIAL_TAGS.some(t => t.id !== Number(id) && t.slug === nameSlug && form.name.trim())

  const linkedCatIds = isNew
    ? []
    : getTagCategoryIds(Number(id), categoryTagLinks)

  const toggleCat = catId => {
    if (isNew) return
    setCategoryTagLinks(prev => {
      const exists = prev.some(l => l.tagId === Number(id) && l.categoryId === catId)
      return exists
        ? prev.filter(l => !(l.tagId === Number(id) && l.categoryId === catId))
        : [...prev, { categoryId: catId, tagId: Number(id), weight: 5 }]
    })
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast('Tag name is required', 'error'); return }
    if (duplicate) { toast('A tag with this slug already exists', 'error'); return }
    toast(isNew ? `Tag "${form.name}" created` : `Tag "${form.name}" saved`, 'success')
    navigate('/tags')
  }

  const handleDelete = () => {
    toast(`Tag "${form.name}" deleted`, 'success')
    navigate('/tags')
  }

  // Content linked to this tag (for usage panel)
  const tagId = Number(id)
  const usage = isNew ? { articles: 0, pages: 0, total: 0 } : computeTagUsage(tagId, contentTagLinks)

  const linkedArticleIds = contentTagLinks.filter(l => l.tagId === tagId && l.contentType === 'article').map(l => l.contentId)
  const linkedPageIds    = contentTagLinks.filter(l => l.tagId === tagId && l.contentType === 'page').map(l => l.contentId)

  const linkedArticles = mockBlogPosts.filter(p => linkedArticleIds.includes(p.id))
  const linkedPageObjs = mockPages.filter(p => linkedPageIds.includes(p.id))

  const linkedCats = mockCategories.filter(c => linkedCatIds.includes(c.id))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isNew ? 'New Tag' : form.name || 'Edit Tag'}
        subtitle={isNew ? 'Create a new keyword tag' : `/${nameSlug}`}
        actions={
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button variant="danger-outline" icon={<Trash2 className="w-4 h-4" />} onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )}
            <Button variant="primary" onClick={handleSave}>
              {isNew ? 'Create Tag' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <button onClick={() => navigate('/tags')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit -mt-2">
        <ArrowLeft className="w-4 h-4" /> Back to Tags
      </button>

      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Left — form */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-text-primary">Tag Details</h3>
            <Field label="Tag Name" required>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Grab Rails"
                autoFocus
              />
            </Field>
            <Field label="Slug" hint="Auto-generated · unique, lowercase, hyphenated">
              <Input value={nameSlug} disabled className="font-mono text-xs" />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description ?? ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Optional — helps editors understand when to apply this tag"
              />
            </Field>
          </div>

          {!isNew && (
            <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Linked Product Categories</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  The mega menu will surface content with this tag when customers browse these categories.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {mockCategories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-grey-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={linkedCatIds.includes(cat.id)}
                      onChange={() => toggleCat(cat.id)}
                      className="accent-brand-500 w-4 h-4 shrink-0"
                    />
                    <span className="text-sm text-text-primary">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — usage summary */}
        <div className="flex flex-col gap-4">
          {!isNew && (
            <>
              <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-text-primary">Usage</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Articles', count: usage.articles, Icon: BookOpen },
                    { label: 'Pages',    count: usage.pages,    Icon: FileText },
                  ].map(({ label, count, Icon }) => (
                    <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-grey-50 border border-border">
                      <Icon className="w-4 h-4 text-text-muted" />
                      <span className="text-lg font-bold text-text-primary">{count}</span>
                      <span className="text-[10px] text-text-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {linkedCats.length > 0 && (
                <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-400" />
                    <h3 className="text-sm font-semibold text-text-primary">Mega Menu</h3>
                  </div>
                  <p className="text-xs text-text-muted">Surfaces related content in these categories:</p>
                  <div className="flex flex-col gap-1">
                    {linkedCats.map(c => (
                      <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-1.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />{c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(linkedArticles.length > 0 || linkedPageObjs.length > 0) && (
                <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-text-primary">Tagged Content</h3>

                  {linkedArticles.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" /> Articles
                      </p>
                      {linkedArticles.map(post => (
                        <div key={post.id} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-border hover:bg-grey-50 transition-colors">
                          <BookOpen className="w-3.5 h-3.5 text-brand-300 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-text-primary leading-snug line-clamp-2">{post.title}</p>
                            <span className={`inline-block text-[10px] mt-0.5 font-medium px-1.5 py-0.5 rounded ${post.status === 'published' ? 'bg-success-50 text-success-600' : 'bg-grey-100 text-text-muted'}`}>{post.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {linkedPageObjs.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Pages
                      </p>
                      {linkedPageObjs.map(page => (
                        <div key={page.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-grey-50 transition-colors">
                          <FileText className="w-3.5 h-3.5 text-warning-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-text-primary leading-snug">{page.title}</p>
                            <p className="text-[10px] text-text-muted font-mono">{page.slug}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}


                </div>
              )}
            </>
          )}

          {isNew && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
              <Zap className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-brand-700">How tags work</p>
                <p className="text-xs text-brand-600 mt-0.5 leading-relaxed">
                  Tags are keywords assigned to articles and pages. Link a tag to product categories and the mega menu will automatically surface matching content in the Related Content column.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete tag"
        message={`Delete "${form.name}"? It will be removed from all content and category links.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
