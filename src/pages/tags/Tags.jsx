import { useState } from 'react'
import { Plus, X, Edit2, Trash2, Tag } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockTags } from '../../data/mockContent'

export function Tags() {
  const [tags, setTags] = useState(mockTags)
  const [newTag, setNewTag] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  const addTag = () => {
    const name = newTag.trim()
    if (!name) return
    if (tags.some(t => t.name.toLowerCase() === name.toLowerCase())) { toast('Tag already exists', 'error'); return }
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setTags(prev => [...prev, { id: Date.now(), name, slug, usedBy: 0 }])
    toast(`Tag "${name}" added`, 'success')
    setNewTag('')
  }

  const openEdit = (tag) => { setEditing(tag); setEditValue(tag.name) }

  const saveEdit = () => {
    const name = editValue.trim()
    if (!name) return
    setTags(prev => prev.map(t => t.id === editing.id ? { ...t, name, slug: name.toLowerCase().replace(/\s+/g, '-') } : t))
    toast(`Tag renamed to "${name}"`, 'success')
    setEditing(null)
  }

  const handleDelete = (id) => {
    setTags(prev => prev.filter(t => t.id !== id))
    toast('Tag deleted', 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tags"
        subtitle={`${tags.length} tags across blog posts and resources`}
      />

      {/* Add tag */}
      <div className="bg-surface rounded-xl border border-border shadow-card p-5">
        <p className="text-sm font-semibold text-text-primary mb-3">Add New Tag</p>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="Tag name..."
            className="max-w-xs"
          />
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={addTag}>Add Tag</Button>
        </div>
      </div>

      {/* Tag list */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">All Tags</p>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tags..." className="h-8 px-3 rounded-lg border border-border bg-grey-50 text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-44" />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Tag', 'Slug', 'Used In', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={4} className="px-5 py-10 text-center text-text-muted">No tags found.</td></tr>
              : filtered.map(tag => (
                <tr key={tag.id} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-brand-300" />
                      <span className="font-medium text-text-primary">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted font-mono text-xs">{tag.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tag.usedBy > 0 ? 'bg-brand-100 text-brand-600' : 'bg-grey-100 text-text-muted'}`}>
                      {tag.usedBy} {tag.usedBy === 1 ? 'post' : 'posts'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(tag)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(tag)} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {tags.length} tags</p>
        </div>
      </div>

      <Drawer open={!!editing} onClose={() => setEditing(null)} title="Edit Tag">
        <div className="flex flex-col gap-4">
          <Field label="Tag Name" required>
            <Input value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus />
          </Field>
          <Field label="Slug (auto-generated)" hint="Auto-generated from tag name">
            <Input value={editValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')} disabled />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveEdit}>Save</Button>
          </div>
        </div>
      </Drawer>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { handleDelete(deleteTarget?.id); setDeleteTarget(null) }}
        title="Delete tag" message={`Delete "${deleteTarget?.name}"? It will be removed from all posts that use it.`} confirmLabel="Delete" destructive />
    </div>
  )
}
