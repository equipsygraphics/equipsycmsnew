import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Globe, FileText, Home, Mail, Info } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { ConfirmModal } from '../../components/ui/Modal'
import { toast } from '../../components/ui/Toast'
import { mockPages, PAGE_TEMPLATES } from '../../data/mockContent'

const TEMPLATE_ICON = {
  standard: <FileText className="w-5 h-5 text-text-muted" />,
  landing:  <Home className="w-5 h-5 text-brand-500" />,
  contact:  <Mail className="w-5 h-5 text-text-muted" />,
  about:    <Info className="w-5 h-5 text-text-muted" />,
}

export function Pages() {
  const navigate = useNavigate()
  const [pages, setPages] = useState(mockPages)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = id => {
    setPages(prev => prev.filter(p => p.id !== id))
    toast('Page deleted', 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pages"
        subtitle={`${pages.length} pages`}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/pages/new')}>
            New Page
          </Button>
        }
      />

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              {['Page', 'Template', 'Slug', 'Last Updated', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr
                key={page.id}
                onClick={() => navigate(`/pages/${page.id}`)}
                className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{TEMPLATE_ICON[page.template] ?? <FileText className="w-5 h-5 text-text-muted" />}</span>
                    <p className="font-medium text-text-primary">{page.title}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-text-secondary capitalize">
                  {PAGE_TEMPLATES.find(t => t.value === page.template)?.label ?? page.template}
                </td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1 text-text-muted font-mono text-xs">
                    <Globe className="w-3 h-3" />{page.slug}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-text-muted">{page.updatedAt}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={page.status} label={page.status === 'published' ? 'Published' : 'Draft'} dot />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/pages/${page.id}`) }}
                      className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(page) }}
                      className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { handleDelete(deleteTarget?.id); setDeleteTarget(null) }}
        title="Delete page"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
