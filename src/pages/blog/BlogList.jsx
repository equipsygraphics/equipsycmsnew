import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Copy, Tag, X, Check, FileText } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { ConfirmModal } from '../../components/ui/Modal'
import { toast } from '../../components/ui/Toast'
import { mockBlogPosts, BLOG_CATEGORIES } from '../../data/mockContent'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
]

export function BlogList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState(mockBlogPosts)
  const [categories, setCategories] = useState(BLOG_CATEGORIES)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const newCatInputRef = useRef(null)

  useEffect(() => {
    if (addingCategory) newCatInputRef.current?.focus()
  }, [addingCategory])

  const handleAddCategory = () => {
    const name = newCatName.trim()
    if (!name) { setAddingCategory(false); setNewCatName(''); return }
    if (categories.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
      toast('Category already exists', 'error'); return
    }
    setCategories(prev => [...prev, name])
    setNewCatName('')
    setAddingCategory(false)
    toast(`Category "${name}" added`, 'success')
  }

  const counts = { all: posts.length, published: posts.filter(p => p.status === 'published').length, draft: posts.filter(p => p.status === 'draft').length }

  const filtered = posts.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false
    if (catFilter !== 'all' && p.category !== catFilter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDelete = (id) => { setPosts(prev => prev.filter(p => p.id !== id)); toast('Post deleted', 'success') }
  const handleDuplicate = (post) => {
    setPosts(prev => [{ ...post, id: Date.now(), title: `${post.title} (Copy)`, status: 'draft', date: null }, ...prev])
    toast(`"${post.title}" duplicated as draft`, 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blog Posts"
        subtitle={`${counts.all} posts total`}
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/blog/new')}>New Post</Button>}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex border-b border-border">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-brand-100 text-brand-600' : 'bg-grey-100 text-text-muted'}`}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-52" />
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCatFilter('all')}
          className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${catFilter === 'all' ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface border-border text-text-secondary hover:border-brand-500 hover:text-brand-500'}`}
        >
          All
          <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${catFilter === 'all' ? 'bg-white/20 text-white' : 'bg-grey-100 text-text-muted'}`}>
            {posts.length}
          </span>
        </button>
        {categories.map(cat => {
          const count = posts.filter(p => p.category === cat).length
          const isActive = catFilter === cat
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(isActive ? 'all' : cat)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors ${isActive ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface border-border text-text-secondary hover:border-brand-500 hover:text-brand-500'}`}
            >
              <Tag className="w-3 h-3" />
              {cat}
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-grey-100 text-text-muted'}`}>
                {count}
              </span>
            </button>
          )
        })}

        {/* Add category inline */}
        {addingCategory ? (
          <div className="flex items-center gap-1">
            <input
              ref={newCatInputRef}
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') { setAddingCategory(false); setNewCatName('') } }}
              placeholder="Category name…"
              className="h-8 px-3 rounded-l-full border border-brand-500 bg-surface text-xs outline-none focus:ring-2 focus:ring-brand-100 w-36"
            />
            <button onClick={handleAddCategory} className="h-8 w-8 flex items-center justify-center rounded-none border-y border-brand-500 bg-surface hover:bg-brand-50 text-brand-500">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setAddingCategory(false); setNewCatName('') }} className="h-8 w-8 flex items-center justify-center rounded-r-full border border-border bg-surface hover:bg-grey-100 text-text-muted">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingCategory(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-dashed border-border text-text-muted hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Category
          </button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Title', 'Category', 'Author', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} className="px-5 py-12 text-center text-text-muted">No posts found.</td></tr>
              : filtered.map(post => (
                <tr key={post.id} onClick={() => navigate(`/blog/${post.id}`)} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 border border-border shrink-0 flex items-center justify-center text-brand-200 text-lg"><FileText className="w-4 h-4 text-brand-300" /></div>
                      <p className="font-medium text-text-primary leading-snug">{post.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{post.category}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{post.author}</td>
                  <td className="px-5 py-3.5 text-text-muted">{post.date ?? <span className="italic">Not set</span>}</td>
                  <td className="px-5 py-3.5"><Badge variant={post.status} label={post.status === 'published' ? 'Published' : 'Draft'} dot /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={e => { e.stopPropagation(); navigate(`/blog/${post.id}`) }} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={e => { e.stopPropagation(); handleDuplicate(post) }} className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-grey-100" title="Duplicate"><Copy className="w-4 h-4" /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTarget(post) }} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-grey-50">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {posts.length} posts</p>
        </div>
      </div>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete post" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} confirmLabel="Delete" destructive />
    </div>
  )
}
