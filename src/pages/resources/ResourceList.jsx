import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, BookOpen, FileText, HelpCircle, Image, Trash2, Edit2,
  Settings, X, File, Layers, ExternalLink, ChevronDown, ChevronRight, ArrowLeft,
  Wrench, Check,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { ConfirmModal } from '../../components/ui/Modal'
import {
  mockResourceTypes, mockResources, mockResourceCategories,
  CONTENT_SHAPES, CATEGORIZATION_MODELS, forcedCategorization,
} from '../../data/mockResources'
import { mockFaqs, mockCompletedInstalls, mockLandingPages, mockProductCategories, getCategoryLabel } from '../../data/mockSharedResources'

// ── Helpers ──────────────────────────────────────────────────────────────────

const SHAPE_ICON = {
  article:              BookOpen,
  file_list:            FileText,
  faq:                  HelpCircle,
  photo_gallery:        Image,
  landing_page_reference: Wrench,
}

const STATUS_STYLES = {
  published: 'bg-success-50 text-success-700',
  draft:     'bg-grey-100 text-text-muted',
}

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[status] ?? 'bg-grey-100 text-text-muted'}`}>
      {status}
    </span>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Resolves the item list for a given resource type from the correct data source.
function resolveItems(type) {
  switch (type.contentShape) {
    case 'faq':                    return mockFaqs.filter(f => f.typeId === type.id)
    case 'photo_gallery':          return mockCompletedInstalls.filter(c => c.typeId === type.id)
    case 'landing_page_reference': return mockLandingPages.filter(p => p.isTool)
    default:                       return mockResources.filter(r => r.typeId === type.id)
  }
}

// ── Per-shape row renderers ───────────────────────────────────────────────────

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={e => { e.stopPropagation(); onEdit() }} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Edit">
        <Edit2 className="w-4 h-4" />
      </button>
      <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function ArticleRow({ item, onEdit, onDelete, resourceCategories }) {
  const cat = resourceCategories.find(c => c.id === item.resourceCategoryId)
  return (
    <tr className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer" onClick={onEdit}>
      <td className="px-5 py-3.5">
        <p className="font-medium text-text-primary leading-snug">{item.title}</p>
        {item.excerpt && <p className="text-xs text-text-muted mt-0.5 max-w-md truncate">{item.excerpt}</p>}
      </td>
      <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">{item.author ?? '—'}</td>
      <td className="px-5 py-3.5">
        {cat ? <span className="text-xs bg-grey-100 text-text-secondary px-2 py-0.5 rounded-full">{cat.name}</span> : <span className="text-xs text-text-muted">—</span>}
      </td>
      <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
      <td className="px-5 py-3.5 text-sm text-text-muted whitespace-nowrap">{fmtDate(item.publishedAt)}</td>
      <td className="px-5 py-3.5"><RowActions onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  )
}

function FileListRow({ item, onEdit, onDelete }) {
  const catLabel = item.productCategoryId ? getCategoryLabel(item.productCategoryId) : null
  return (
    <tr className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer" onClick={onEdit}>
      <td className="px-5 py-3.5">
        <p className="font-medium text-text-primary leading-snug">{item.title}</p>
        {item.description && <p className="text-xs text-text-muted mt-0.5 max-w-md truncate">{item.description}</p>}
      </td>
      <td className="px-5 py-3.5">
        {catLabel
          ? <span className="text-xs bg-grey-100 text-text-secondary px-2 py-0.5 rounded-full">{catLabel}</span>
          : <span className="text-xs text-text-muted">—</span>
        }
      </td>
      <td className="px-5 py-3.5">
        {item.files?.length > 0
          ? <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              <File className="w-3 h-3" />{item.files.length} file{item.files.length !== 1 ? 's' : ''}
            </span>
          : <span className="text-xs text-text-muted">No files</span>
        }
      </td>
      <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
      <td className="px-5 py-3.5"><RowActions onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  )
}

function FaqRow({ item, onEdit, onDelete }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer" onClick={onEdit}>
      <td className="px-5 py-3.5">
        <p className="font-medium text-text-primary leading-snug">{item.question}</p>
        {item.answer && <p className="text-xs text-text-muted mt-0.5 max-w-md truncate">{item.answer}</p>}
      </td>
      <td className="px-5 py-3.5">
        {item.productCategoryId
          ? <span className="text-xs bg-grey-100 text-text-secondary px-2 py-0.5 rounded-full">{getCategoryLabel(item.productCategoryId)}</span>
          : <span className="text-xs text-text-muted">—</span>
        }
      </td>
      <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
      <td className="px-5 py-3.5"><RowActions onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  )
}

function GalleryRow({ item, onEdit, onDelete }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer" onClick={onEdit}>
      <td className="px-5 py-3.5">
        <p className="font-medium text-text-primary leading-snug">{item.title}</p>
        {item.projectDetail && <p className="text-xs text-text-muted mt-0.5 max-w-md truncate">{item.projectDetail}</p>}
      </td>
      <td className="px-5 py-3.5">
        {item.productCategoryId
          ? <span className="text-xs bg-grey-100 text-text-secondary px-2 py-0.5 rounded-full">{getCategoryLabel(item.productCategoryId)}</span>
          : <span className="text-xs text-text-muted">—</span>
        }
      </td>
      <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
      <td className="px-5 py-3.5"><RowActions onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  )
}

function ToolRow({ item, onEdit, onDelete }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors cursor-pointer" onClick={onEdit}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary leading-snug">{item.title}</p>
          <ExternalLink className="w-3 h-3 text-text-muted shrink-0" />
        </div>
        {item.description && <p className="text-xs text-text-muted mt-0.5 max-w-md truncate">{item.description}</p>}
      </td>
      <td className="px-5 py-3.5 text-xs text-text-muted font-mono">{item.slug}</td>
      <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
      <td className="px-5 py-3.5"><RowActions onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  )
}

// ── Shape table ───────────────────────────────────────────────────────────────

const HEADERS = {
  article:              ['Title', 'Author', 'Category', 'Status', 'Published', ''],
  file_list:            ['Title', 'Category', 'Files', 'Status', ''],
  faq:                  ['Question', 'Category', 'Status', ''],
  photo_gallery:        ['Project', 'Category', 'Status', ''],
  landing_page_reference: ['Title', 'Slug', 'Status', ''],
}

function ShapeTable({ type, items, onEdit, onDelete, resourceCategories, categoryFilter }) {
  const shape = type.contentShape

  const filtered = useMemo(() => {
    if (!categoryFilter || shape === 'article' || shape === 'landing_page_reference') return items
    return items.filter(i => String(i.productCategoryId) === String(categoryFilter))
  }, [items, categoryFilter, shape])

  if (filtered.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-text-muted text-sm">{categoryFilter ? 'No items for this category.' : 'No items yet.'}</p>
      </div>
    )
  }

  const headers = HEADERS[shape] ?? ['Title', 'Status', '']

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-grey-50">
          {headers.map((h, i) => (
            <th key={i} className={`px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${h === '' ? 'text-right' : ''}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map(item => {
          const edit = () => onEdit(item)
          const del  = () => onDelete(item)
          if (shape === 'article')              return <ArticleRow  key={item.id} item={item} onEdit={edit} onDelete={del} resourceCategories={resourceCategories} />
          if (shape === 'file_list')            return <FileListRow key={item.id} item={item} onEdit={edit} onDelete={del} />
          if (shape === 'faq')                  return <FaqRow      key={item.id} item={item} onEdit={edit} onDelete={del} />
          if (shape === 'photo_gallery')        return <GalleryRow  key={item.id} item={item} onEdit={edit} onDelete={del} />
          if (shape === 'landing_page_reference') return <ToolRow   key={item.id} item={item} onEdit={edit} onDelete={del} />
          return null
        })}
      </tbody>
    </table>
  )
}

// ── Category filter bar ───────────────────────────────────────────────────────

function CategoryFilterBar({ type, items, categoryFilter, onFilter }) {
  const shape = type.contentShape
  if (shape !== 'faq' && shape !== 'photo_gallery' && shape !== 'file_list') return null

  // Collect categories that actually have items in this tab
  const usedCategoryIds = [...new Set(items.map(i => i.productCategoryId).filter(Boolean))]
  const usedCategories  = usedCategoryIds.map(id => ({
    id,
    label: getCategoryLabel(id),
  })).sort((a, b) => a.label.localeCompare(b.label))

  if (usedCategories.length === 0) return null

  return (
    <div className="px-5 py-3 border-b border-border flex items-center gap-2 flex-wrap">
      <span className="text-xs text-text-muted font-medium">Filter:</span>
      <button
        onClick={() => onFilter('')}
        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${!categoryFilter ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-border text-text-muted hover:border-grey-400'}`}
      >
        All
      </button>
      {usedCategories.map(c => (
        <button
          key={c.id}
          onClick={() => onFilter(String(c.id))}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${String(categoryFilter) === String(c.id) ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-border text-text-muted hover:border-grey-400'}`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}

// ── 4-step Add Type wizard ────────────────────────────────────────────────────

const WIZARD_STEPS = ['Name', 'Content Shape', 'Categorisation', 'Confirm']

function AddTypeWizard({ open, onClose, onCreated }) {
  const [step,  setStep]  = useState(0)
  const [name,  setName]  = useState('')
  const [shape, setShape] = useState('article')
  const [catModel, setCatModel] = useState('independent')

  if (!open) return null

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const forced = forcedCategorization(shape)

  const effectiveCatModel = forced ?? catModel

  const shapeLabel = CONTENT_SHAPES.find(s => s.id === shape)?.label ?? shape
  const catModelLabel = CATEGORIZATION_MODELS.find(m => m.id === effectiveCatModel)?.label ?? effectiveCatModel

  const canNext = step === 0 ? name.trim().length > 0 : true

  const handleNext = () => {
    if (step === 0 && mockResourceTypes.some(t => t.slug === slug)) {
      toast('A type with that name already exists', 'error')
      return
    }
    // Skip step 2 display for shapes where categorization is forced — still show it, but read-only
    setStep(s => s + 1)
  }

  const handleCreate = () => {
    const newType = {
      id:                 `rt-${Date.now()}`,
      slug,
      name:               name.trim(),
      contentShape:       shape,
      categorizationModel: effectiveCatModel,
      system:             false,
    }
    mockResourceTypes.push(newType)

    // If independent, seed an empty category list for this type (admin will add categories later)
    onCreated(newType)
    toast(`"${name.trim()}" type created`, 'success')
    setStep(0); setName(''); setShape('article'); setCatModel('independent')
    onClose()
  }

  const handleClose = () => {
    setStep(0); setName(''); setShape('article'); setCatModel('independent')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Add Resource Type</h2>
            <button onClick={handleClose} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {WIZARD_STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${i === step ? 'text-brand-600' : i < step ? 'text-success-600' : 'text-text-muted'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? 'bg-brand-500 text-white' : i < step ? 'bg-success-500 text-white' : 'bg-grey-200 text-text-muted'}`}>
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className={`w-8 h-px mx-2 ${i < step ? 'bg-success-400' : 'bg-grey-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-5 flex flex-col gap-4 min-h-[260px]">

          {/* Step 0: Name */}
          {step === 0 && (
            <>
              <p className="text-sm text-text-secondary">Give this resource type a name. A URL slug will be generated automatically.</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Type Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Warranty Documents"
                  className="h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                  autoFocus
                />
                {slug && (
                  <p className="text-xs text-text-muted">Slug: <span className="font-mono text-text-secondary">{slug}</span></p>
                )}
              </div>
            </>
          )}

          {/* Step 1: Content shape */}
          {step === 1 && (
            <>
              <p className="text-sm text-text-secondary">Choose the content format. This determines how items are created and displayed.</p>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                {CONTENT_SHAPES.map(s => {
                  const Icon = SHAPE_ICON[s.id] ?? Layers
                  return (
                    <label key={s.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${shape === s.id ? 'border-brand-500 bg-brand-50' : 'border-border hover:bg-grey-50'}`}>
                      <input type="radio" name="shape" value={s.id} checked={shape === s.id} onChange={() => setShape(s.id)} className="mt-0.5 accent-brand-500" />
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${shape === s.id ? 'text-brand-500' : 'text-text-muted'}`} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{s.label}</p>
                        <p className="text-xs text-text-muted">{s.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </>
          )}

          {/* Step 2: Categorisation */}
          {step === 2 && (
            <>
              <p className="text-sm text-text-secondary">Choose how items in this type are organised and filtered.</p>
              {forced ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-3 px-3 py-3 rounded-lg border border-brand-200 bg-brand-50">
                    <Check className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{catModelLabel}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        The <strong>{shapeLabel}</strong> content shape requires this categorisation model — it cannot be changed.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {CATEGORIZATION_MODELS.map(m => (
                    <label key={m.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${catModel === m.id ? 'border-brand-500 bg-brand-50' : 'border-border hover:bg-grey-50'}`}>
                      <input type="radio" name="catModel" value={m.id} checked={catModel === m.id} onChange={() => setCatModel(m.id)} className="mt-0.5 accent-brand-500" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{m.label}</p>
                        <p className="text-xs text-text-muted">{m.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <>
              <p className="text-sm text-text-secondary">Review your choices before creating the type.</p>
              <div className="bg-grey-50 rounded-xl border border-border divide-y divide-border">
                {[
                  { label: 'Name',           value: name.trim() },
                  { label: 'Slug',           value: slug, mono: true },
                  { label: 'Content shape',  value: shapeLabel },
                  { label: 'Categorisation', value: catModelLabel },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-text-muted font-medium">{row.label}</span>
                    <span className={`text-sm text-text-primary ${row.mono ? 'font-mono text-xs' : 'font-medium'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              {effectiveCatModel === 'independent' && (
                <p className="text-xs text-text-muted">
                  A category list will be created for <strong>{name.trim()}</strong>. Add categories after creation via the type settings.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            {step < WIZARD_STEPS.length - 1
              ? <Button variant="primary" onClick={handleNext} disabled={!canNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              : <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>
                  Create Type
                </Button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResourceList() {
  const navigate = useNavigate()

  const [types, setTypes]     = useState(mockResourceTypes)
  const [, forceRefresh]      = useState(0)
  const [activeTab, setActiveTab]   = useState(mockResourceTypes[0]?.slug ?? '')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [showWizard, setShowWizard]         = useState(false)

  const activeType = types.find(t => t.slug === activeTab)
  const tabItems   = activeType ? resolveItems(activeType) : []

  const resourceCategories = useMemo(
    () => mockResourceCategories.filter(c => c.resourceTypeId === activeType?.id),
    [activeType]
  )

  const handleEdit = (item) => {
    navigate(`/resources/${activeType.slug}/${item.id}`)
  }

  const handleNew = () => {
    navigate(`/resources/${activeType.slug}/new`)
  }

  const handleDelete = () => {
    const target = deleteTarget
    const shape  = activeType?.contentShape

    if (shape === 'faq') {
      const idx = mockFaqs.findIndex(f => f.id === target.id)
      if (idx >= 0) mockFaqs.splice(idx, 1)
    } else if (shape === 'photo_gallery') {
      const idx = mockCompletedInstalls.findIndex(c => c.id === target.id)
      if (idx >= 0) mockCompletedInstalls.splice(idx, 1)
    } else if (shape === 'landing_page_reference') {
      const idx = mockLandingPages.findIndex(p => p.id === target.id)
      if (idx >= 0) mockLandingPages.splice(idx, 1)
    } else {
      const idx = mockResources.findIndex(r => r.id === target.id)
      if (idx >= 0) mockResources.splice(idx, 1)
    }

    forceRefresh(n => n + 1)
    toast(`"${target.title ?? target.question}" deleted`, 'success')
    setDeleteTarget(null)
  }

  const handleTypeCreated = (newType) => {
    setTypes([...mockResourceTypes])
    setActiveTab(newType.slug)
    setCategoryFilter('')
  }

  const handleTabChange = (slug) => {
    setActiveTab(slug)
    setCategoryFilter('')
  }

  // New button label: "New FAQ" / "New Install" / "New Tool" / "New Blog" etc.
  const newLabel = (() => {
    if (!activeType) return 'New'
    const shape = activeType.contentShape
    if (shape === 'faq')                    return 'New FAQ'
    if (shape === 'photo_gallery')          return 'New Install'
    if (shape === 'landing_page_reference') return 'New Tool'
    // Strip trailing 's' for singular: "Blogs" → "New Blog", "Brochures" → "New Brochure"
    return `New ${activeType.name.replace(/s$/, '')}`
  })()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resources"
        subtitle="Manage all downloadable and on-site content resources"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Settings className="w-4 h-4" />} onClick={() => setShowWizard(true)}>
              Add Type
            </Button>
            {activeType && (
              <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleNew}>
                {newLabel}
              </Button>
            )}
          </div>
        }
      />

      {/* Type tabs */}
      <div className="flex gap-0.5 border-b border-border overflow-x-auto">
        {types.map(t => {
          const Icon  = SHAPE_ICON[t.contentShape] ?? Layers
          const count = resolveItems(t).length
          const active = t.slug === activeTab
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px ${
                active
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-grey-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {t.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${active ? 'bg-brand-100 text-brand-600' : 'bg-grey-100 text-text-muted'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* List panel */}
      {activeType && (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
          {/* Panel header */}
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => { const Icon = SHAPE_ICON[activeType.contentShape] ?? Layers; return <Icon className="w-4 h-4 text-text-muted" /> })()}
              <span className="text-sm font-medium text-text-primary">{activeType.name}</span>
              <span className="text-xs text-text-muted">· {activeType.contentShape.replace(/_/g, ' ')}</span>
              {activeType.contentShape === 'faq' || activeType.contentShape === 'photo_gallery' ? (
                <span className="text-xs text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full">shared with product categories</span>
              ) : null}
              {activeType.contentShape === 'landing_page_reference' ? (
                <span className="text-xs text-text-muted bg-grey-100 px-1.5 py-0.5 rounded-full">filtered view</span>
              ) : null}
            </div>
            <span className="text-xs text-text-muted">{tabItems.length} item{tabItems.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Category filter */}
          <CategoryFilterBar
            type={activeType}
            items={tabItems}
            categoryFilter={categoryFilter}
            onFilter={setCategoryFilter}
          />

          <ShapeTable
            type={activeType}
            items={tabItems}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            resourceCategories={resourceCategories}
            categoryFilter={categoryFilter}
          />

          {tabItems.length > 0 && (
            <div className="px-5 py-3 border-t border-border bg-grey-50">
              <p className="text-xs text-text-muted">{tabItems.length} item{tabItems.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}

      <AddTypeWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onCreated={handleTypeCreated}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete resource"
        message={`Delete "${deleteTarget?.title ?? deleteTarget?.question}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
