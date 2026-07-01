import { useState, useMemo } from 'react'
import { Plus, Tag, Edit2, Trash2, GitMerge, Search, X, FileText, BookOpen, Wrench } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input, Textarea } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import {
  mockTags as INITIAL_TAGS,
  mockCategoryTagLinks as INITIAL_CAT_LINKS,
  mockContentTagLinks as INITIAL_CONTENT_LINKS,
  computeTagUsage, getTagCategoryIds, toSlug,
} from '../../data/mockTagging'
import { mockCategories } from '../../data/mockCategories'

// ── Merge modal ───────────────────────────────────────────────────────────────

function MergeModal({ open, onClose, sourceTag, allTags, onMerge }) {
  const [targetId, setTargetId] = useState('')
  const [search, setSearch] = useState('')

  const candidates = allTags.filter(t =>
    t.id !== sourceTag?.id &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleMerge = () => {
    if (!targetId) { toast('Select a target tag', 'error'); return }
    const target = allTags.find(t => t.id === Number(targetId))
    onMerge(sourceTag.id, Number(targetId))
    toast(`"${sourceTag.name}" merged into "${target?.name}"`, 'success')
    setTargetId('')
    setSearch('')
    onClose()
  }

  if (!sourceTag) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${open ? '' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Merge tag</h2>
          <p className="text-sm text-text-muted mt-1">
            All content links from <strong>"{sourceTag.name}"</strong> will move to the target tag, then "{sourceTag.name}" will be deleted.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Merge into…</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tags…"
              className="w-full pl-8 pr-3 h-9 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="border border-border rounded-xl max-h-44 overflow-y-auto">
            {candidates.length === 0
              ? <p className="text-sm text-text-muted text-center py-6">No tags found</p>
              : candidates.map(t => (
                <label key={t.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-grey-50 border-b border-border last:border-0 transition-colors ${Number(targetId) === t.id ? 'bg-brand-50' : ''}`}>
                  <input type="radio" name="merge-target" value={t.id} checked={Number(targetId) === t.id} onChange={e => setTargetId(e.target.value)} className="accent-brand-500" />
                  <Tag className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="text-sm text-text-primary flex-1">{t.name}</span>
                  <span className="text-xs text-text-muted font-mono">{t.slug}</span>
                </label>
              ))
            }
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleMerge} icon={<GitMerge className="w-4 h-4" />}>
            Merge Tag
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Edit drawer ───────────────────────────────────────────────────────────────

function EditDrawer({ open, onClose, tag, allTags, categoryTagLinks, onSave }) {
  const [form, setForm] = useState(tag ?? { name: '', slug: '', description: '' })
  const [linkedCatIds, setLinkedCatIds] = useState(
    tag ? getTagCategoryIds(tag.id, categoryTagLinks) : []
  )

  // Sync when tag changes
  useState(() => {
    setForm(tag ?? { name: '', slug: '', description: '' })
    setLinkedCatIds(tag ? getTagCategoryIds(tag.id, categoryTagLinks) : [])
  })

  const isNew = !tag?.id
  const nameSlug = toSlug(form.name)

  const toggleCat = id => setLinkedCatIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

  const duplicate = allTags.some(t => t.id !== tag?.id && t.slug === nameSlug && form.name.trim())

  const handleSave = () => {
    if (!form.name.trim()) { toast('Tag name is required', 'error'); return }
    if (duplicate) { toast('A tag with this slug already exists', 'error'); return }
    onSave({ ...form, slug: nameSlug, linkedCatIds })
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? 'New Tag' : 'Edit Tag'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Tag</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-border p-4 flex flex-col gap-4">
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

        <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Linked Product Categories</p>
            <p className="text-xs text-text-muted mt-0.5">
              The mega menu will surface content with this tag when users browse these categories.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
            {mockCategories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-grey-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={linkedCatIds.includes(cat.id)}
                  onChange={() => toggleCat(cat.id)}
                  className="accent-brand-500 w-4 h-4"
                />
                <span className="text-sm text-text-primary">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Tags() {
  const [tags, setTags] = useState(INITIAL_TAGS)
  const [categoryTagLinks, setCategoryTagLinks] = useState(INITIAL_CAT_LINKS)
  const [contentTagLinks] = useState(INITIAL_CONTENT_LINKS)

  const [search, setSearch] = useState('')
  const [filterUsage, setFilterUsage] = useState('all')
  const [editingTag, setEditingTag] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mergeSource, setMergeSource] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Enrich tags with live usage counts
  const enrichedTags = useMemo(() => tags.map(t => ({
    ...t,
    usage: computeTagUsage(t.id, contentTagLinks),
    categoryIds: getTagCategoryIds(t.id, categoryTagLinks),
  })), [tags, categoryTagLinks, contentTagLinks])

  const filtered = enrichedTags.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.slug.includes(search.toLowerCase())) return false
    if (filterUsage === 'used'   && t.usage.total === 0) return false
    if (filterUsage === 'unused' && t.usage.total > 0)   return false
    return true
  })

  const stats = useMemo(() => ({
    total:   tags.length,
    unused:  enrichedTags.filter(t => t.usage.total === 0).length,
    articles: new Set(contentTagLinks.filter(l => l.contentType === 'article').map(l => l.contentId)).size,
    pages:    new Set(contentTagLinks.filter(l => l.contentType === 'page').map(l => l.contentId)).size,
    tools:    new Set(contentTagLinks.filter(l => l.contentType === 'tool').map(l => l.contentId)).size,
  }), [tags, enrichedTags, contentTagLinks])

  const openNew = () => { setEditingTag(null); setDrawerOpen(true) }
  const openEdit = tag => { setEditingTag(tag); setDrawerOpen(true) }

  const handleSave = ({ linkedCatIds, ...tagData }) => {
    if (editingTag?.id) {
      setTags(prev => prev.map(t => t.id === editingTag.id ? { ...t, ...tagData } : t))
      // Update category links
      setCategoryTagLinks(prev => [
        ...prev.filter(l => l.tagId !== editingTag.id),
        ...linkedCatIds.map(catId => ({ categoryId: catId, tagId: editingTag.id, weight: 5 })),
      ])
      toast(`Tag "${tagData.name}" updated`, 'success')
    } else {
      const newId = Date.now()
      setTags(prev => [...prev, { id: newId, ...tagData }])
      setCategoryTagLinks(prev => [
        ...prev,
        ...linkedCatIds.map(catId => ({ categoryId: catId, tagId: newId, weight: 5 })),
      ])
      toast(`Tag "${tagData.name}" created`, 'success')
    }
  }

  const handleMerge = (sourceId, targetId) => {
    // All content/category links from source → target (skip duplicates)
    setCategoryTagLinks(prev => {
      const existing = new Set(prev.filter(l => l.tagId === targetId).map(l => l.categoryId))
      const migrated = prev.filter(l => l.tagId === sourceId && !existing.has(l.categoryId))
        .map(l => ({ ...l, tagId: targetId }))
      return [...prev.filter(l => l.tagId !== sourceId), ...migrated]
    })
    // Content links are read-only mock data — in a real app these would be mutated too
    setTags(prev => prev.filter(t => t.id !== sourceId))
    setMergeSource(null)
  }

  const handleDelete = id => {
    setTags(prev => prev.filter(t => t.id !== id))
    setCategoryTagLinks(prev => prev.filter(l => l.tagId !== id))
    toast('Tag deleted', 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tags"
        subtitle="Polymorphic tagging for articles, pages, and tools — powers mega menu related content"
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNew}>
            New Tag
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Tags',     value: stats.total },
          { label: 'Unused',         value: stats.unused,   dim: true },
          { label: 'Articles tagged', value: stats.articles, icon: <BookOpen className="w-3.5 h-3.5" /> },
          { label: 'Pages tagged',   value: stats.pages,    icon: <FileText className="w-3.5 h-3.5" /> },
          { label: 'Tools tagged',   value: stats.tools,    icon: <Wrench className="w-3.5 h-3.5" /> },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-xl border border-border px-4 py-3">
            <div className={`text-xl font-bold ${s.dim ? 'text-text-muted' : 'text-text-primary'}`}>{s.value}</div>
            <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
              {s.icon}<span>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tags…"
            className="w-full pl-8 pr-3 h-9 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex gap-1 bg-grey-100 p-1 rounded-lg">
          {[['all','All'],['used','Used'],['unused','Unused']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterUsage(val)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filterUsage === val ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Tag', 'Slug', 'Articles', 'Pages', 'Tools', 'Categories', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="px-5 py-12 text-center text-text-muted">No tags found.</td></tr>
              : filtered.map(tag => {
                const linkedCats = mockCategories.filter(c => tag.categoryIds.includes(c.id))
                return (
                  <tr key={tag.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                        <div>
                          <p className="font-medium text-text-primary">{tag.name}</p>
                          {tag.description && <p className="text-xs text-text-muted mt-0.5 max-w-xs truncate">{tag.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted font-mono text-xs">{tag.slug}</td>
                    <td className="px-5 py-3.5">
                      <UsagePill count={tag.usage.articles} icon={<BookOpen className="w-3 h-3" />} />
                    </td>
                    <td className="px-5 py-3.5">
                      <UsagePill count={tag.usage.pages} icon={<FileText className="w-3 h-3" />} />
                    </td>
                    <td className="px-5 py-3.5">
                      <UsagePill count={tag.usage.tools} icon={<Wrench className="w-3 h-3" />} />
                    </td>
                    <td className="px-5 py-3.5">
                      {linkedCats.length === 0
                        ? <span className="text-xs text-text-muted">—</span>
                        : <div className="flex flex-wrap gap-1">
                            {linkedCats.slice(0, 2).map(c => (
                              <span key={c.id} className="text-xs bg-grey-100 text-text-secondary px-2 py-0.5 rounded-full">{c.name}</span>
                            ))}
                            {linkedCats.length > 2 && <span className="text-xs text-text-muted">+{linkedCats.length - 2}</span>}
                          </div>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(tag)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setMergeSource(tag) }} className="p-1.5 rounded-md text-text-muted hover:text-warning-600 hover:bg-warning-50" title="Merge into another tag">
                          <GitMerge className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(tag)} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {tags.length} tags</p>
        </div>
      </div>

      <EditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tag={editingTag}
        allTags={tags}
        categoryTagLinks={categoryTagLinks}
        onSave={handleSave}
      />

      <MergeModal
        open={!!mergeSource}
        onClose={() => setMergeSource(null)}
        sourceTag={mergeSource}
        allTags={tags}
        onMerge={handleMerge}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { handleDelete(deleteTarget?.id); setDeleteTarget(null) }}
        title="Delete tag"
        message={`Delete "${deleteTarget?.name}"? It will be removed from all content and category links.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

function UsagePill({ count, icon }) {
  if (count === 0) return <span className="text-xs text-text-muted">—</span>
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-600">
      {icon}{count}
    </span>
  )
}
