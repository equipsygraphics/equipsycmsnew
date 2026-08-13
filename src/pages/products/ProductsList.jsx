import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Copy } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CSVExport } from '../../components/ui/CSVExport'
import { PageHeader } from '../../components/ui/PageHeader'
import { ConfirmModal } from '../../components/ui/Modal'
import { toast } from '../../components/ui/Toast'
import { mockProducts, PRIMARY_CATEGORIES, getStockStatus } from '../../data/mockProducts'

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'archived', label: 'Archived' },
]

const BADGE_MAP = {
  published:    { variant: 'published',  label: 'Published' },
  draft:        { variant: 'draft',      label: 'Draft' },
  archived:     { variant: 'archived',   label: 'Archived' },
  low_stock:    { variant: 'warning',    label: 'Low Stock' },
  out_of_stock: { variant: 'error',      label: 'Out of Stock' },
}

const CSV_COLS = [
  { key: 'name', label: 'Product Name' },
  { key: 'category', label: 'Category' },
  { key: 'sku', label: 'SKU' },
  { key: 'price', label: 'Price', csvValue: r => `$${r.price.toFixed(2)}` },
  { key: 'stock', label: 'Stock' },
  { key: 'status', label: 'Status' },
  { key: 'type', label: 'Type' },
]

export function ProductsList() {
  const navigate = useNavigate()
  const [products, setProducts] = useState(mockProducts)
  const [activeTab, setActiveTab] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const counts = {
    all: products.length,
    published: products.filter(p => p.status === 'published').length,
    draft: products.filter(p => p.status === 'draft').length,
    archived: products.filter(p => p.status === 'archived').length,
  }

  const filtered = products.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    toast('Product deleted', 'success')
  }

  const handleDuplicate = (product) => {
    const newProduct = { ...product, id: Date.now(), name: `${product.name} (Copy)`, status: 'draft', sku: `${product.sku}-COPY` }
    setProducts(prev => [newProduct, ...prev])
    toast(`"${product.name}" duplicated as draft`, 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        subtitle={`${counts.all} products total`}
        actions={
          <>
            <CSVExport data={filtered} columns={CSV_COLS} filename="products" />
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/products/new')}>
              Add Product
            </Button>
          </>
        }
      />

      {/* Status tabs + filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex border-b border-border">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-brand-100 text-brand-600' : 'bg-grey-100 text-text-muted'}`}>
                {counts[tab.key] ?? filtered.length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-52"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none focus:border-brand-500"
          >
            <option value="all">Category: All</option>
            {PRIMARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-text-muted">No products found.</td></tr>
            ) : filtered.map(p => {
              const stockStatus = getStockStatus(p)
              const badge = BADGE_MAP[stockStatus]
              const stockColor = p.stock === 0 ? 'text-error-500' : p.stock <= 8 ? 'text-warning-500' : 'text-text-primary'

              return (
                <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 border border-border flex items-center justify-center shrink-0 text-brand-300 text-xs font-bold">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{p.name}</p>
                        <p className="text-xs text-text-muted">{p.sku} · {p.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{p.category}</td>
                  <td className="px-5 py-3.5 font-medium text-text-primary">
                    {p.type === 'custom' ? <span className="text-text-muted italic">POA</span> : `$${p.price.toFixed(2)}`}
                  </td>
                  <td className={`px-5 py-3.5 font-medium ${stockColor}`}>
                    {p.type === 'custom' ? 'â€”' : p.stock}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={badge.variant} label={badge.label} dot />
                  </td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-grey-100 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination row */}
        <div className="px-5 py-3 border-t border-border bg-grey-50 flex items-center justify-between">
          <p className="text-xs text-text-muted">Showing {filtered.length} of {products.length} products</p>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
