import { useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, ExternalLink, RadarIcon } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Modal, ConfirmModal } from '../../../components/ui/Modal'
import { Field, Input } from '../../../components/ui/FormField'
import { toast } from '../../../components/ui/Toast'
import { matchAccuracyVariant } from '../../../data/mockCompetitors'
import { buildCompetitorStats } from '../../../data/mockMatching'
import { CATEGORIES } from '../../../data/mockProducts'
import { ScrapeProgress } from '../components/ScrapeProgress'
import { CompetitorCoreMatchView } from '../components/CompetitorCoreMatchView'

const EMPTY_FORM = { name: '', baseUrl: '', categories: [] }

function CategoryPicker({ selected, onChange }) {
  const toggle = (cat) => {
    onChange(selected.includes(cat) ? selected.filter(c => c !== cat) : [...selected, cat])
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => toggle(cat)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            selected.includes(cat)
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'bg-surface border-border text-text-secondary hover:bg-grey-50'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

function CompetitorFormModal({ open, onClose, onSubmit, initial, title }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.baseUrl.trim()

  const handleSubmit = () => {
    if (!valid) return
    onSubmit({ ...form, name: form.name.trim(), baseUrl: form.baseUrl.trim() })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={handleSubmit}>Save</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Competitor name" required>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. MobilityPlus AU" />
        </Field>
        <Field label="Base URL" required hint="The competitor's storefront domain to scrape.">
          <Input value={form.baseUrl} onChange={e => set('baseUrl', e.target.value)} placeholder="https://example.com.au" />
        </Field>
        <Field label="Categories" hint="Which product categories this competitor should be matched against.">
          <CategoryPicker selected={form.categories} onChange={v => set('categories', v)} />
        </Field>
      </div>
    </Modal>
  )
}

const COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (v) => <span className="font-medium text-text-primary">{v}</span>,
  },
  {
    key: 'baseUrl',
    label: 'Base URL',
    sortable: true,
    render: (v) => (
      <a
        href={v}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 hover:underline"
      >
        {v.replace(/^https?:\/\//, '')}
        <ExternalLink className="w-3 h-3" />
      </a>
    ),
  },
  {
    key: 'categories',
    label: 'Categories',
    render: (v) => (
      <div className="flex flex-wrap gap-1">
        {v.slice(0, 2).map(c => <Badge key={c} variant="grey" label={c} />)}
        {v.length > 2 && <Badge variant="grey" label={`+${v.length - 2} more`} />}
      </div>
    ),
  },
  {
    key: 'lastScraped',
    label: 'Last scraped',
    sortable: true,
    render: (v) => v ? new Date(v).toLocaleString() : <span className="text-text-muted italic">Not scraped yet</span>,
  },
  {
    key: 'matchingSkus',
    label: 'Matching SKUs',
    sortable: true,
    align: 'right',
    render: (v) => v == null ? <span className="text-text-muted">—</span> : v,
  },
  {
    key: 'matchAccuracy',
    label: 'Match accuracy',
    sortable: true,
    render: (v) => v == null
      ? <span className="text-text-muted">—</span>
      : <Badge variant={matchAccuracyVariant(v)} label={`${Math.round(v * 100)}%`} />,
  },
  {
    key: 'actions',
    label: '',
    align: 'right',
  },
]

export function Competitors({
  competitors, setCompetitors, positions, scrapingTarget, onRunScrapeAll, onRunScrapeOne, onScrapeComplete,
  onEditCoreAttributes, onEditVariantAttributes,
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewingCompetitorId, setViewingCompetitorId] = useState(null)

  const rows = useMemo(
    () => competitors.map(c => ({
      ...c,
      ...(c.lastScraped ? buildCompetitorStats(c, positions) : { matchingSkus: null, matchAccuracy: null }),
    })),
    [competitors, positions]
  )

  const handleAdd = (form) => {
    setCompetitors(prev => [
      { id: `c-${Date.now()}`, ...form, lastScraped: null },
      ...prev,
    ])
    toast(`"${form.name}" added`, 'success')
    setAddOpen(false)
  }

  const handleEdit = (form) => {
    setCompetitors(prev => prev.map(c => (c.id === editTarget.id ? { ...c, ...form } : c)))
    toast(`"${form.name}" updated`, 'success')
    setEditTarget(null)
  }

  const handleDelete = () => {
    setCompetitors(prev => prev.filter(c => c.id !== deleteTarget.id))
    toast(`"${deleteTarget.name}" removed`, 'success')
  }

  const columnsWithActions = COLUMNS.map(col =>
    col.key === 'actions'
      ? {
          ...col,
          render: (_, row) => {
            const isScrapingThis = scrapingTarget === row.id
            return (
              <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onRunScrapeOne(row.id)}
                  disabled={!!scrapingTarget}
                  className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={isScrapingThis ? 'Scraping…' : `Scrape ${row.name}`}
                >
                  <RadarIcon className={`w-4 h-4 ${isScrapingThis ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setEditTarget(row)}
                  disabled={!!scrapingTarget}
                  className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(row)}
                  disabled={!!scrapingTarget}
                  className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          },
        }
      : col
  )

  const viewingCompetitor = competitors.find(c => c.id === viewingCompetitorId)
  if (viewingCompetitor) {
    return (
      <CompetitorCoreMatchView
        competitor={viewingCompetitor}
        positions={positions}
        onBack={() => setViewingCompetitorId(null)}
        onEditCoreAttributes={onEditCoreAttributes}
        onEditVariantAttributes={onEditVariantAttributes}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Competitors scraped and matched against your product catalog. Click a row for its core product match detail, or
          use the radar icon on a row to scrape just that competitor.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary" size="sm" icon={<RadarIcon className="w-4 h-4" />}
            loading={scrapingTarget === 'all'} disabled={!!scrapingTarget && scrapingTarget !== 'all'}
            onClick={onRunScrapeAll}
          >
            {scrapingTarget === 'all' ? 'Scraping…' : 'Scrape All Competitors'}
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} disabled={!!scrapingTarget} onClick={() => setAddOpen(true)}>
            Add Competitor
          </Button>
        </div>
      </div>

      {!!scrapingTarget && (
        <ScrapeProgress
          key={scrapingTarget}
          onComplete={onScrapeComplete}
        />
      )}

      <DataTable
        columns={columnsWithActions}
        data={rows}
        searchKey={['name', 'baseUrl']}
        rowKey="id"
        emptyMessage="No competitors added yet."
        onRowClick={row => setViewingCompetitorId(row.id)}
      />

      <CompetitorFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        title="Add Competitor"
      />

      {editTarget && (
        <CompetitorFormModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
          initial={{ name: editTarget.name, baseUrl: editTarget.baseUrl, categories: editTarget.categories }}
          title="Edit Competitor"
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove competitor"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This won't affect already-scraped pricing history.`}
        confirmLabel="Remove"
        destructive
      />
    </div>
  )
}
