import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Tag, Trash2, BookOpen, FileText, Zap, Search, X, FolderOpen } from 'lucide-react'
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

// ─── ContentPicker ────────────────────────────────────────────────────────────
// Searchable checkbox list for articles or pages

function ContentPicker({ items, selectedIds, onToggle, icon: Icon, placeholder }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() =>
    search ? items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())) : items
  , [items, search])

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 h-8 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="border border-border rounded-xl overflow-hidden max-h-52 overflow-y-auto">
        {filtered.length === 0
          ? <p className="text-sm text-text-muted text-center py-6">No results</p>
          : filtered.map(item => (
            <label key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-border last:border-0 transition-colors ${
                selectedIds.includes(item.id) ? 'bg-brand-50' : 'hover:bg-grey-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="accent-brand-500 w-4 h-4 shrink-0"
              />
              <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary truncate leading-snug">{item.title}</p>
                {'slug' in item && <p className="text-[10px] text-text-muted font-mono">{item.slug}</p>}
                {'status' in item && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    item.status === 'published' ? 'bg-success-50 text-success-600' : 'bg-grey-100 text-text-muted'
                  }`}>{item.status}</span>
                )}
              </div>
            </label>
          ))
        }
      </div>
      {selectedIds.length > 0 && (
        <p className="text-xs text-brand-600 font-medium">{selectedIds.length} selected</p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TagDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const initialTag = isNew
    ? { name: '', slug: '', description: '' }
    : INITIAL_TAGS.find(t => t.id === Number(id))

  const [form, setForm] = useState(initialTag ?? { name: '', slug: '', description: '' })
  const [categoryTagLinks, setCategoryTagLinks] = useState(INITIAL_CAT_LINKS)
  const [contentTagLinks, setContentTagLinks] = useState(INITIAL_CONTENT_LINKS)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Pending selections for new tags
  const [pendingCatIds, setPendingCatIds] = useState([])
  const [pendingArticleIds, setPendingArticleIds] = useState([])
  const [pendingPageIds, setPendingPageIds] = useState([])

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

  // Active links — pending for new, live for existing
  const activeCatIds = isNew
    ? pendingCatIds
    : getTagCategoryIds(Number(id), categoryTagLinks)

  const tagId = Number(id)
  const linkedArticleIds = isNew
    ? pendingArticleIds
    : contentTagLinks.filter(l => l.tagId === tagId && l.contentType === 'article').map(l => l.contentId)
  const linkedPageIds = isNew
    ? pendingPageIds
    : contentTagLinks.filter(l => l.tagId === tagId && l.contentType === 'page').map(l => l.contentId)

  const toggleCat = catId => {
    if (isNew) {
      setPendingCatIds(prev => prev.includes(catId) ? prev.filter(i => i !== catId) : [...prev, catId])
    } else {
      setCategoryTagLinks(prev => {
        const exists = prev.some(l => l.tagId === tagId && l.categoryId === catId)
        return exists
          ? prev.filter(l => !(l.tagId === tagId && l.categoryId === catId))
          : [...prev, { categoryId: catId, tagId, weight: 5 }]
      })
    }
  }

  const toggleArticle = articleId => {
    if (isNew) {
      setPendingArticleIds(prev => prev.includes(articleId) ? prev.filter(i => i !== articleId) : [...prev, articleId])
    } else {
      setContentTagLinks(prev => {
        const exists = prev.some(l => l.tagId === tagId && l.contentType === 'article' && l.contentId === articleId)
        return exists
          ? prev.filter(l => !(l.tagId === tagId && l.contentType === 'article' && l.contentId === articleId))
          : [...prev, { tagId, contentType: 'article', contentId: articleId }]
      })
    }
  }

  const togglePage = pageId => {
    if (isNew) {
      setPendingPageIds(prev => prev.includes(pageId) ? prev.filter(i => i !== pageId) : [...prev, pageId])
    } else {
      setContentTagLinks(prev => {
        const exists = prev.some(l => l.tagId === tagId && l.contentType === 'page' && l.contentId === pageId)
        return exists
          ? prev.filter(l => !(l.tagId === tagId && l.contentType === 'page' && l.contentId === pageId))
          : [...prev, { tagId, contentType: 'page', contentId: pageId }]
      })
    }
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast('Tag name is required', 'error'); return }
    if (duplicate) { toast('A tag with this slug already exists', 'error'); return }

    if (isNew) {
      const newId = Math.max(...INITIAL_TAGS.map(t => t.id)) + 1
      // Persist into module-level arrays so Tags.jsx sees the new tag on remount
      INITIAL_TAGS.push({ id: newId, name: form.name.trim(), slug: nameSlug, description: form.description.trim() })
      pendingCatIds.forEach(catId =>
        INITIAL_CAT_LINKS.push({ categoryId: catId, tagId: newId, weight: 5 })
      )
      pendingArticleIds.forEach(contentId =>
        INITIAL_CONTENT_LINKS.push({ tagId: newId, contentType: 'article', contentId })
      )
      pendingPageIds.forEach(contentId =>
        INITIAL_CONTENT_LINKS.push({ tagId: newId, contentType: 'page', contentId })
      )
      toast(`Tag "${form.name}" created`, 'success')
    } else {
      // Update tag name/slug/description in-place
      const idx = INITIAL_TAGS.findIndex(t => t.id === tagId)
      if (idx >= 0) {
        INITIAL_TAGS[idx] = { ...INITIAL_TAGS[idx], name: form.name.trim(), slug: nameSlug, description: form.description.trim() }
      }
      toast(`Tag "${form.name}" saved`, 'success')
    }

    navigate('/tags')
  }

  const handleDelete = () => {
    const idx = INITIAL_TAGS.findIndex(t => t.id === tagId)
    if (idx >= 0) INITIAL_TAGS.splice(idx, 1)
    // Remove all links for this tag
    const remove = (arr) => { let i = arr.length; while (i--) { if (arr[i].tagId === tagId) arr.splice(i, 1) } }
    remove(INITIAL_CAT_LINKS)
    remove(INITIAL_CONTENT_LINKS)
    toast(`Tag "${form.name}" deleted`, 'success')
    navigate('/tags')
  }

  const usage = isNew
    ? { articles: pendingArticleIds.length, pages: pendingPageIds.length }
    : computeTagUsage(tagId, contentTagLinks)

  const linkedCats = mockCategories.filter(c => activeCatIds.includes(c.id))
  const linkedArticles = mockBlogPosts.filter(p => linkedArticleIds.includes(p.id))
  const linkedPageObjs = mockPages.filter(p => linkedPageIds.includes(p.id))

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/tags')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Tags
      </button>

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

      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Left column — form + assignments */}
        <div className="col-span-2 flex flex-col gap-4">

          {/* Tag details */}
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

          {/* Categories */}
          <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-text-muted" /> Product Categories
                </h3>
                {activeCatIds.length > 0 && (
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {activeCatIds.length} linked
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                The mega menu will surface content with this tag when customers browse these categories.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {mockCategories.map(cat => (
                <label key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-grey-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={activeCatIds.includes(cat.id)}
                    onChange={() => toggleCat(cat.id)}
                    className="accent-brand-500 w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-text-primary">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-text-muted" /> Articles
              </h3>
              {linkedArticleIds.length > 0 && (
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {linkedArticleIds.length} linked
                </span>
              )}
            </div>
            <ContentPicker
              items={mockBlogPosts}
              selectedIds={linkedArticleIds}
              onToggle={toggleArticle}
              icon={BookOpen}
              placeholder="Search articles…"
            />
          </div>

          {/* Pages */}
          <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-text-muted" /> Pages
              </h3>
              {linkedPageIds.length > 0 && (
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {linkedPageIds.length} linked
                </span>
              )}
            </div>
            <ContentPicker
              items={mockPages}
              selectedIds={linkedPageIds}
              onToggle={togglePage}
              icon={FileText}
              placeholder="Search pages…"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Usage summary (new: shows pending counts, existing: live counts) */}
          <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-text-primary">{isNew ? 'Summary' : 'Usage'}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Categories', count: activeCatIds.length,       Icon: FolderOpen },
                { label: 'Articles',   count: linkedArticleIds.length,   Icon: BookOpen   },
                { label: 'Pages',      count: linkedPageIds.length,       Icon: FileText   },
              ].map(({ label, count, Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-grey-50 border border-border">
                  <Icon className="w-4 h-4 text-text-muted" />
                  <span className="text-lg font-bold text-text-primary">{count}</span>
                  <span className="text-[10px] text-text-muted text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mega menu — show when categories are linked */}
          {linkedCats.length > 0 && (
            <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-text-primary">Mega Menu</h3>
              </div>
              <p className="text-xs text-text-muted">Will surface related content in:</p>
              <div className="flex flex-col gap-1">
                {linkedCats.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-1.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />{c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How tags work tip */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
            <Zap className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-brand-700">How tags work</p>
              <p className="text-xs text-brand-600 mt-0.5 leading-relaxed">
                Tags are keywords assigned to articles and pages. Link a tag to product categories and the mega menu will automatically surface matching content in the Related Content column.
              </p>
            </div>
          </div>

          {/* Selected content preview (shows when items are checked) */}
          {(linkedArticles.length > 0 || linkedPageObjs.length > 0) && (
            <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-text-primary">
                {isNew ? 'Will be tagged' : 'Tagged Content'}
              </h3>

              {linkedArticles.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Articles
                  </p>
                  {linkedArticles.map(post => (
                    <div key={post.id} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-border">
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
                    <div key={page.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
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
