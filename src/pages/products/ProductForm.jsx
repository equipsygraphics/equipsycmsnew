import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Plus, Trash2, GripVertical, Upload, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea, Select, Toggle } from '../../components/ui/FormField'
import { MediaPicker } from '../../components/ui/MediaPicker'
import { RichTextEditor } from '../../components/ui/RichTextEditor'
import { toast } from '../../components/ui/Toast'
import { MediaLibraryModal } from '../../components/ui/MediaLibraryModal'
import { mockProducts, PRIMARY_CATEGORIES, CATEGORIES, SUBCATEGORIES } from '../../data/mockProducts'
import { useProductCost } from '../../context/ProductCostContext'
import { usePricingSettings } from '../../context/PricingSettingsContext'
import { useAttributes } from '../../context/AttributesContext'
import { AttributeEditorDrawer } from '../attributes/AttributeEditorDrawer'
import { useCompetitorPricingConfig } from '../../context/CompetitorPricingConfigContext'
import { useDiscountSettings } from '../../context/DiscountSettingsContext'
import { computeCostBreakdown, LABOUR_RATES, PACKING_METHODS } from '../../data/mockCostBreakdown'
import { buildProductPricePosition, categoryAttributePool } from '../../data/mockMatching'
import { CostVariablesModal } from '../cost-variables/CostVariablesModal'
import { CompetitorMatchAnalysis } from '../competitor-pricing/components/CompetitorMatchAnalysis'

const TABS = ['General', 'Variations', 'Completed Installs', 'Cost', 'Pricing', 'Inventory', 'Attributes', 'SEO']

const PRODUCT_TYPES = [
  { value: 'standard', label: 'Standard', desc: 'Fixed price, stock tracking' },
  { value: 'variable', label: 'Standard with Variations', desc: 'Multiple options & variants' },
  { value: 'custom', label: 'Custom', desc: 'Price on application' },
]

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 flex flex-col gap-5">
      {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
      {children}
    </div>
  )
}

const SPEC_FIELDS = [
  { key: 'material', label: 'Material' },
  { key: 'finish', label: 'Finish' },
  { key: 'colour', label: 'Colour' },
  { key: 'packagingDimensions', label: 'Packaging Dimensions (W×D×H cm)', placeholder: 'Enter packaging dimensions in cm' },
  { key: 'packagingWeight', label: 'Packaging Weight (kg)', placeholder: 'Enter packaging weight in kg' },
]

function SpecificationsCard({ form, setForm }) {
  const customSpecs = form.customSpecs ?? []
  const [adding, setAdding] = useState(false)
  const [pendingLabel, setPendingLabel] = useState('')

  const confirmAdd = () => {
    if (!pendingLabel.trim()) return
    setForm(f => ({
      ...f,
      customSpecs: [...(f.customSpecs ?? []), { id: Date.now(), label: pendingLabel.trim(), value: '' }],
    }))
    setPendingLabel('')
    setAdding(false)
  }

  const updateValue = (id, val) => {
    setForm(f => ({
      ...f,
      customSpecs: (f.customSpecs ?? []).map(s => s.id === id ? { ...s, value: val } : s),
    }))
  }

  const removeCustomSpec = (id) => {
    setForm(f => ({ ...f, customSpecs: (f.customSpecs ?? []).filter(s => s.id !== id) }))
  }

  return (
    <SectionCard title="Specifications">
      <div className="grid grid-cols-2 gap-4">
        {SPEC_FIELDS.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <Input
              value={form[key] ?? ''}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder ?? `Enter ${label.toLowerCase()}…`}
            />
          </Field>
        ))}
        {customSpecs.map(spec => (
          <Field key={spec.id} label={spec.label}>
            <div className="flex gap-2">
              <Input
                value={spec.value}
                onChange={e => updateValue(spec.id, e.target.value)}
                placeholder={`Enter ${spec.label.toLowerCase()}…`}
              />
              <button
                onClick={() => removeCustomSpec(spec.id)}
                className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Field>
        ))}
      </div>

      {adding && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Label name</label>
          <div className="flex items-center gap-3">
            <Input
              value={pendingLabel}
              onChange={e => setPendingLabel(e.target.value)}
              placeholder="Ex. Size, Unit, etc."
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') { setAdding(false); setPendingLabel('') } }}
              autoFocus
            />
            <button
              onClick={confirmAdd}
              className="h-10 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors shrink-0"
            >
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setPendingLabel('') }}
              className="h-10 px-4 rounded-lg border border-border hover:bg-grey-50 text-text-primary text-sm font-medium transition-colors shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Custom Field
        </button>
      )}
    </SectionCard>
  )
}

const FILE_ICON_MAP = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/zip': '🗜️',
}

function ProductGalleryCard({ form, setForm }) {
  const gallery = form.gallery ?? []
  const primaryId = form.galleryPrimaryId ?? gallery[0]?.id ?? null
  const [modalOpen, setModalOpen] = useState(false)

  const handleSelect = (items) => {
    const newItems = items.map(item => ({
      id: Date.now() + Math.random(),
      title: item.title || item.name.replace(/\.[^/.]+$/, ''),
      name: item.name,
      size: item.size,
      type: item.type,
      ext: item.ext,
      url: item.url,
    }))
    setForm(f => {
      const updated = [...(f.gallery ?? []), ...newItems]
      return { ...f, gallery: updated, galleryPrimaryId: f.galleryPrimaryId ?? updated[0]?.id }
    })
  }

  const remove = (id) => {
    setForm(f => {
      const updated = f.gallery.filter(r => r.id !== id)
      const newPrimary = f.galleryPrimaryId === id ? (updated[0]?.id ?? null) : f.galleryPrimaryId
      return { ...f, gallery: updated, galleryPrimaryId: newPrimary }
    })
  }

  const setPrimary = (id) => {
    setForm(f => ({ ...f, galleryPrimaryId: id }))
  }

  const checkerStyle = {
    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
    backgroundColor: '#f9fafb',
  }

  return (
    <SectionCard title="Product Gallery">
      <div className="flex flex-wrap gap-3">
        {gallery.map((item) => {
          const isPrimary = item.id === primaryId
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                className={`w-32 h-32 rounded-xl border-2 overflow-hidden transition-colors cursor-pointer block ${isPrimary ? 'border-brand-500' : 'border-border hover:border-brand-300'}`}
                style={checkerStyle}
                onClick={() => setPrimary(item.id)}
              >
                {item.url && <img src={item.url} alt={item.title} className="w-full h-full object-cover" />}
              </button>
              {isPrimary ? (
                <span className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded pointer-events-none">Primary</span>
              ) : (
                <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Set primary</span>
              )}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(item.id) }}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setModalOpen(true)}
          className="w-32 h-32 border-2 border-dashed border-border hover:border-brand-300 hover:bg-grey-50 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <div className="w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center">
            <Upload className="w-4 h-4 text-text-muted" />
          </div>
          <p className="text-xs font-medium text-brand-500">Add media</p>
          <p className="text-[10px] text-text-muted leading-tight text-center px-2">1080×1080px recommended · max 30MB</p>
        </button>
      </div>
      <MediaLibraryModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleSelect} />
    </SectionCard>
  )
}

function ResourcesCard({ form, setForm }) {
  const resources = form.resources ?? []
  const [modalOpen, setModalOpen] = useState(false)
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const handleSelect = (items) => {
    const newItems = items.map(item => ({
      id: Date.now() + Math.random(),
      title: item.title || item.name.replace(/\.[^/.]+$/, ''),
      name: item.name,
      size: item.size,
      type: item.type,
      ext: item.ext,
    }))
    setForm(f => ({ ...f, resources: [...(f.resources ?? []), ...newItems] }))
  }

  const updateTitle = (id, title) => {
    setForm(f => ({ ...f, resources: f.resources.map(r => r.id === id ? { ...r, title } : r) }))
  }

  const remove = (id) => {
    setForm(f => ({ ...f, resources: f.resources.filter(r => r.id !== id) }))
  }

  const onDragStart = (idx) => { dragIdx.current = idx }
  const onDragOver = (e, idx) => { e.preventDefault(); dragOverIdx.current = idx }
  const onDrop = () => {
    const from = dragIdx.current
    const to = dragOverIdx.current
    if (from === null || to === null || from === to) return
    setForm(f => {
      const arr = [...f.resources]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { ...f, resources: arr }
    })
    dragIdx.current = null
    dragOverIdx.current = null
  }

  return (
    <SectionCard title="Resources">
      {resources.length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {resources.map((res, idx) => (
            <div
              key={res.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDrop={onDrop}
              className="flex items-center gap-3 px-4 py-3 bg-surface hover:bg-grey-50 transition-colors group cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-9 h-9 rounded-lg border border-border bg-grey-50 flex items-center justify-center shrink-0 text-sm font-semibold text-text-muted">
                {res.ext ?? (res.type?.startsWith('image/') ? 'IMG' : 'FILE')}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <input
                  value={res.title}
                  onChange={e => updateTitle(res.id, e.target.value)}
                  onMouseDown={e => e.stopPropagation()}
                  className="text-sm font-medium text-text-primary bg-transparent border-0 outline-none focus:bg-white focus:border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 rounded-md px-1.5 py-0.5 -mx-1.5 w-full transition-colors cursor-text"
                  placeholder="Resource title…"
                />
                <p className="text-xs text-text-muted truncate px-1.5">{res.name} · {res.size}</p>
              </div>
              <button onClick={() => remove(res.id)} className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="border-2 border-dashed border-border hover:border-brand-300 hover:bg-grey-50 rounded-xl px-6 py-6 flex flex-col items-center gap-2 cursor-pointer transition-colors w-full"
      >
        <Upload className="w-5 h-5 text-text-muted" />
        <p className="text-sm font-medium text-text-secondary">Add from media library</p>
        <p className="text-xs text-text-muted">Browse your SharePoint media library</p>
      </button>

      <MediaLibraryModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleSelect} />
    </SectionCard>
  )
}

function FAQsCard({ form, setForm }) {
  const faqs = form.faqs ?? []
  const faqDragIdx = useRef(null)
  const faqDragOverIdx = useRef(null)

  const addFaq = () => setForm(f => ({ ...f, faqs: [...(f.faqs ?? []), { id: Date.now(), q: '', a: '' }] }))
  const removeFaq = (id) => setForm(f => ({ ...f, faqs: f.faqs.filter(r => r.id !== id) }))
  const updateFaq = (id, field, val) => setForm(f => ({ ...f, faqs: f.faqs.map(r => r.id === id ? { ...r, [field]: val } : r) }))

  const onDragStart = (idx) => { faqDragIdx.current = idx }
  const onDragOver = (e, idx) => { e.preventDefault(); faqDragOverIdx.current = idx }
  const onDrop = () => {
    const from = faqDragIdx.current
    const to = faqDragOverIdx.current
    if (from === null || to === null || from === to) return
    setForm(f => {
      const arr = [...f.faqs]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { ...f, faqs: arr }
    })
    faqDragIdx.current = null
    faqDragOverIdx.current = null
  }

  return (
    <SectionCard title="FAQs">
      <p className="text-xs text-text-muted -mt-2">Frequently asked questions shown on the product page.</p>
      <div className="flex flex-col gap-3">
        {faqs.map((row, i) => (
          <div
            key={row.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={onDrop}
            className="border border-border rounded-lg p-4 flex gap-3 group cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-text-muted shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <Field label="Question">
                <Input
                  value={row.q}
                  onChange={e => updateFaq(row.id, 'q', e.target.value)}
                  placeholder="e.g. What weight can it support?"
                  onMouseDown={e => e.stopPropagation()}
                />
              </Field>
              <Field label="Answer">
                <Textarea
                  value={row.a}
                  onChange={e => updateFaq(row.id, 'a', e.target.value)}
                  rows={2}
                  placeholder="Enter the answer…"
                  onMouseDown={e => e.stopPropagation()}
                />
              </Field>
            </div>
            <button onClick={() => removeFaq(row.id)} className="p-1 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 self-start opacity-0 group-hover:opacity-100">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={addFaq} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>
    </SectionCard>
  )
}

function TabGeneral({ form, setForm }) {
  return (
    <div className="flex gap-4 items-start">
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      <SectionCard title="General Information">
        <Field label="Product Name" required>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fold-Down Shower Seat 450mm" />
        </Field>
        <Field label="H1 / Page Title">
          <Input value={form.shortDesc} onChange={e => setForm(f => ({ ...f, shortDesc: e.target.value }))} placeholder="e.g. Fold-Down Shower Seat for Small Bathrooms" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Category" required>
            <Select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value, subCategory: '' }))}
            >
              <option value="">Select category…</option>
              {PRIMARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Subcategory" required hint={!form.category ? 'Select a primary category first' : undefined}>
            <Select
              value={form.subCategory}
              onChange={e => setForm(f => ({ ...f, subCategory: e.target.value }))}
              disabled={!form.category}
            >
              <option value="">Select subcategory…</option>
              {form.category && (SUBCATEGORIES[form.category] || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Product Type">
        <div className="grid grid-cols-3 gap-3">
          {PRODUCT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setForm(f => ({ ...f, type: t.value }))}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${form.type === t.value ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-grey-300'}`}
            >
              <p className={`text-sm font-semibold ${form.type === t.value ? 'text-brand-600' : 'text-text-primary'}`}>{t.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <ProductGalleryCard form={form} setForm={setForm} />

      <SectionCard title="Product Description">
        <Field label="H2 / Description Title">
          <Input value={form.descTitle ?? ''} onChange={e => setForm(f => ({ ...f, descTitle: e.target.value }))} placeholder="e.g. The Ultimate Fold-Down Shower Seat" />
        </Field>
        <Field label="Description">
          <RichTextEditor
            value={form.longDesc}
            onChange={v => setForm(f => ({ ...f, longDesc: v }))}
            placeholder="Enter full product description…"
            minHeight={180}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Product Features">
        <Field label="Features">
          <RichTextEditor
            value={form.features ?? ''}
            onChange={v => setForm(f => ({ ...f, features: v }))}
            placeholder="Enter product features…"
            minHeight={180}
          />
        </Field>
      </SectionCard>

      {form.type !== 'variable' && <SpecificationsCard form={form} setForm={setForm} />}

      <ResourcesCard form={form} setForm={setForm} />

      <SectionCard title="Shipping & Delivery">
        <Field label="Shipping & Delivery Information">
          <RichTextEditor
            value={form.shippingInfo ?? ''}
            onChange={v => setForm(f => ({ ...f, shippingInfo: v }))}
            placeholder="Enter shipping and delivery details…"
            minHeight={140}
          />
        </Field>
      </SectionCard>

      <FAQsCard form={form} setForm={setForm} />

    </div>

    {/* Right sidebar */}
    <div className="flex flex-col gap-4 w-64 shrink-0">
      <SectionCard title="Publish Status">
        <div className="flex flex-col gap-2">
          {['published', 'draft', 'archived'].map(s => (
            <label key={s} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s}
                checked={form.status === s}
                onChange={() => setForm(f => ({ ...f, status: s }))}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-[12px] border flex items-center justify-center shrink-0 transition-colors ${form.status === s ? 'bg-brand-50 border-brand-600' : 'bg-white border-grey-300'}`}>
                {form.status === s && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
              </div>
              <span className="text-sm font-medium text-text-primary capitalize">{s}</span>
            </label>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Badges & Flags">
        <div className="flex flex-col gap-4">
          <Toggle checked={form.bulky} onChange={v => setForm(f => ({ ...f, bulky: v }))} label="Bulky Item" description="Requires special shipping consideration" />
          <Toggle checked={form.custom} onChange={v => setForm(f => ({ ...f, custom: v }))} label="Made-to-Order" description="Product is built or sourced on demand" />
          <Toggle checked={form.pallet} onChange={v => setForm(f => ({ ...f, pallet: v }))} label="Pallet Required" description="Must be shipped on a pallet" />
        </div>
      </SectionCard>
    </div>
    </div>
  )
}

function TabCompletedInstalls({ form, setForm }) {
  const installs = form.installs ?? []
  const [modalOpen, setModalOpen] = useState(false)
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const handleSelect = (items) => {
    const newItems = items.map(item => ({
      id: Date.now() + Math.random(),
      title: item.title || item.name.replace(/\.[^/.]+$/, ''),
      name: item.name,
      size: item.size,
      type: item.type,
      ext: item.ext,
    }))
    setForm(f => ({ ...f, installs: [...(f.installs ?? []), ...newItems] }))
  }

  const updateTitle = (id, title) => {
    setForm(f => ({ ...f, installs: f.installs.map(r => r.id === id ? { ...r, title } : r) }))
  }

  const remove = (id) => {
    setForm(f => ({ ...f, installs: f.installs.filter(r => r.id !== id) }))
  }

  const onDragStart = (idx) => { dragIdx.current = idx }
  const onDragOver = (e, idx) => { e.preventDefault(); dragOverIdx.current = idx }
  const onDrop = () => {
    const from = dragIdx.current
    const to = dragOverIdx.current
    if (from === null || to === null || from === to) return
    setForm(f => {
      const arr = [...f.installs]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { ...f, installs: arr }
    })
    dragIdx.current = null
    dragOverIdx.current = null
  }

  const checkerStyle = {
    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
    backgroundColor: '#f9fafb',
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Completed Installs">
        <div className="flex flex-wrap gap-3">
          {installs.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDrop={onDrop}
              className="relative group cursor-grab active:cursor-grabbing"
            >
              <div
                className="w-32 h-32 rounded-xl border-2 border-border overflow-hidden"
                style={checkerStyle}
              >
                {item.url && <img src={item.url} alt={item.title} className="w-full h-full object-cover" />}
              </div>
              <button
                onClick={e => { e.stopPropagation(); remove(item.id) }}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setModalOpen(true)}
            className="w-32 h-32 border-2 border-dashed border-border hover:border-brand-300 hover:bg-grey-50 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center">
              <Upload className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-xs font-medium text-brand-500">Add media</p>
            <p className="text-[10px] text-text-muted leading-tight text-center px-2">1920×1080px recommended · max 30MB</p>
          </button>
        </div>
        <MediaLibraryModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleSelect} />
      </SectionCard>
    </div>
  )
}

function TabCategories({ form, setForm }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Categories">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Category" required>
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Subcategory">
            <Select disabled={!form.category}>
              <option value="">Select subcategory…</option>
            </Select>
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="Resources">
        <p className="text-xs text-text-muted -mt-2">Attach downloadable files such as installation guides, datasheets, or compliance certificates.</p>
        <MediaPicker
          value={form.resources}
          onChange={v => setForm(f => ({ ...f, resources: v }))}
          multiple
          label="Upload resource files"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />
      </SectionCard>
    </div>
  )
}

function applyDiscount(base, discountPct) {
  return base != null && discountPct > 0 ? Math.round(base * (1 - discountPct / 100) * 100) / 100 : null
}

function DiscountOverrideNote({ isOverridden, categoryDefault, onReset }) {
  return (
    <p className="text-xs text-text-muted">
      {isOverridden ? (
        <>
          Overridden for this product — category default is {categoryDefault}%.{' '}
          <button type="button" onClick={onReset} className="text-brand-500 hover:text-brand-600 hover:underline font-medium">
            Reset to category default
          </button>
        </>
      ) : (
        'Using this product’s category default. Edit the field to override just this product.'
      )}
    </p>
  )
}

function SummaryRow({ label, price, sub, margin }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-text-primary">{price != null ? `$${price.toFixed(2)}` : '—'}</span>
        {sub && <span className="block text-xs text-text-muted">{sub}</span>}
        {margin != null && <span className="block text-xs font-medium text-text-secondary">{Math.round(margin * 100)}% margin</span>}
      </div>
    </div>
  )
}

function TabPricing({ form, setForm, product, isNew }) {
  const navigate = useNavigate()
  const { costRecords } = useProductCost()
  const { attributes } = useAttributes()
  const {
    standardMarginPct,
    forceStandardMarginMap, setForceStandardMargin,
    manualRetailPriceMap, setManualRetailPrice,
  } = usePricingSettings()
  const { competitors, priceRules, coreAttributeSelection, variantAttributeSelection } = useCompetitorPricingConfig()
  const { categoryDiscounts, setProductOverride, clearProductOverride, getEffectiveDiscounts } = useDiscountSettings()

  // For a not-yet-saved product there's no id to key cost/competitor data
  // against, so this runs the same Stage 1/2 engine against a throwaway
  // "draft" product built from the form fields entered so far, instead of
  // requiring a save first. No cost record exists yet either, so there's no
  // standard-margin fallback here — if no competitor passes Stage 1, the
  // draft simply has no recommended price to apply. Synthetic competitor
  // prices are generated relative to our own price (see mockMatching.js),
  // so an estimated starting Retail Price is required too — without one,
  // every synthesized competitor price (and so the recommendation) would
  // just be $0.
  const [draftPosition, setDraftPosition] = useState(null)
  const hasDraftName = !!form.name?.trim()
  const hasDraftSubCategory = !!form.subCategory
  const hasDraftAttributes = Object.values(form.attributes ?? {}).some(vals => vals.length > 0)
  const draftMissing = [
    !hasDraftName && 'product name',
    !hasDraftSubCategory && 'category & subcategory',
    !hasDraftAttributes && 'at least one attribute value',
  ].filter(Boolean)
  const canRunDraftAnalysis = draftMissing.length === 0
  const runDraftCompetitorAnalysis = () => {
    if (!form.subCategory) {
      toast('Select a category and subcategory on the General tab first — competitor matching is scoped per subcategory.', 'error')
      return
    }
    const startingPrice = parseFloat(form.price) || 0
    if (startingPrice <= 0) {
      toast('Enter an estimated Retail Price first — competitor prices are synthesized relative to it.', 'error')
      return
    }
    const draftProduct = { id: -1, subCategory: form.subCategory, price: startingPrice }
    const result = buildProductPricePosition(
      draftProduct, competitors, attributes, priceRules, coreAttributeSelection, variantAttributeSelection, null, false
    )
    setDraftPosition(result)
    if (result.recommendedPrice != null) {
      setForm(f => ({ ...f, price: result.recommendedPrice }))
      toast(`Competitor analysis complete — retail price set to $${result.recommendedPrice.toFixed(2)}`, 'success')
    } else {
      toast('Competitor analysis complete — no valid competitor matches found for this subcategory yet.', 'info')
    }
  }

  const effectiveDiscounts = product ? getEffectiveDiscounts(product) : null
  const categoryDefaults = product ? categoryDiscounts[product.subCategory] : null

  // Saved products' Trade/Bulk/Bulk Trade discounts live in DiscountSettingsContext
  // (category default, or a per-product override) so they can be bulk-managed
  // from the Pricing Discounts page. A brand-new, unsaved product has no id to
  // key an override against yet, so it falls back to the local form field.
  const tradeDiscount = product ? effectiveDiscounts.tradeDiscount : (form.tradeDiscount ?? 0)
  const bulkDiscount = product ? effectiveDiscounts.bulkDiscount : (form.bulkDiscount ?? 0)
  const bulkTradeDiscount = product ? effectiveDiscounts.bulkTradeDiscount : (form.bulkTradeDiscount ?? 0)
  const mamDiscount = product ? effectiveDiscounts.mamDiscount : (form.mamDiscount ?? 0)
  const setTradeDiscount = v => (product ? setProductOverride(product.id, 'tradeDiscount', v) : setForm(f => ({ ...f, tradeDiscount: v })))
  const setBulkDiscount = v => (product ? setProductOverride(product.id, 'bulkDiscount', v) : setForm(f => ({ ...f, bulkDiscount: v })))
  const setBulkTradeDiscount = v => (product ? setProductOverride(product.id, 'bulkTradeDiscount', v) : setForm(f => ({ ...f, bulkTradeDiscount: v })))

  const saleDiscount = form.saleDiscount ?? 0
  const retailPrice = parseFloat(form.price) || 0

  const tradePriceNum = applyDiscount(retailPrice > 0 ? retailPrice : null, tradeDiscount)
  const bulkPriceNum = applyDiscount(retailPrice > 0 ? retailPrice : null, bulkDiscount)
  const tradeCalc = tradePriceNum != null ? `$${tradePriceNum.toFixed(2)}` : ''
  const bulkCalc = bulkPriceNum != null ? `$${bulkPriceNum.toFixed(2)}` : ''
  const bulkTradeCalc = applyDiscount(bulkPriceNum, bulkTradeDiscount)
  // MAM is its own tier off retail (like Trade/Bulk), not a further discount
  // off Bulk — kept separate from Bulk Trade so the two don't get conflated.
  const mamPriceNum = applyDiscount(retailPrice > 0 ? retailPrice : null, mamDiscount)
  const saleCalc = saleDiscount > 0 && retailPrice > 0
    ? `$${(retailPrice * (1 - saleDiscount / 100)).toFixed(2)}`
    : ''

  const costBreakdown = !isNew && product ? computeCostBreakdown(costRecords[product.id]) : null
  const costFallback = costBreakdown ? { cost: costBreakdown.totalCost, standardMarginPct } : null

  // Whether real competitor data exists is checked independently of the
  // current toggle state, so a product the user hasn't touched yet defaults
  // sensibly: "Use Competitor Pricing" on if there's something to use, off
  // if there isn't — rather than always defaulting on.
  const trialPosition = product && costFallback
    ? buildProductPricePosition(product, competitors, attributes, priceRules, coreAttributeSelection, variantAttributeSelection, costFallback, false)
    : null
  const hasCompetitorData = !!trialPosition && trialPosition.viable.length > 0

  const forcedExplicit = product ? forceStandardMarginMap[product.id] : undefined
  const forced = forcedExplicit != null ? forcedExplicit : !hasCompetitorData
  const useCompetitorPricing = !forced

  const position = product && costFallback && forced
    ? buildProductPricePosition(product, competitors, attributes, priceRules, coreAttributeSelection, variantAttributeSelection, costFallback, true)
    : trialPosition

  const manualOverride = product ? !!manualRetailPriceMap[product.id] : true
  const recommendedRetail = position?.recommendedPrice ?? null
  const retailIsLocked = !manualOverride && recommendedRetail != null

  // Keep Retail Price synced to whichever source is driving it (competitor
  // analysis or standard margin) so Trade/Bulk/Bulk Trade below — which all
  // read form.price — stay correct without a second, separate calculation.
  useEffect(() => {
    if (retailIsLocked && Number(form.price) !== recommendedRetail) {
      setForm(f => ({ ...f, price: recommendedRetail }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retailIsLocked, recommendedRetail])

  const goToSpecMatchingVariant = () => navigate(`/attributes?${new URLSearchParams({ view: 'Stage 2 Match Attributes' })}`)
  const goToPricingFormula = () => navigate(`/competitor-pricing?${new URLSearchParams({ tab: 'Pricing Formula' })}`)
  const goToAnalysisDetails = () => navigate(`/competitor-pricing?${new URLSearchParams({ tab: 'Price List', product: String(product.id) })}`)

  const mainContent = (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      <SectionCard title="Pricing">
        <Field label="Retail Price ($)">
          <Input
            type="number"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="0"
            disabled={form.type === 'custom' || retailIsLocked}
          />
        </Field>
        {product && recommendedRetail != null && (
          <p className="text-xs text-text-muted -mt-2">
            {manualOverride ? (
              <>
                Manually set — not using {forced ? 'standard margin' : 'competitor pricing'}.{' '}
                <button type="button" onClick={() => setManualRetailPrice(product.id, false)} className="text-brand-500 hover:text-brand-600 hover:underline font-medium">
                  Use recommended price (${recommendedRetail.toFixed(2)})
                </button>
              </>
            ) : (
              <>
                Set automatically from {forced ? 'standard margin on cost' : 'competitor pricing (Stage 2)'}.{' '}
                <button type="button" onClick={() => setManualRetailPrice(product.id, true)} className="text-brand-500 hover:text-brand-600 hover:underline font-medium">
                  Set manually instead
                </button>
              </>
            )}
          </p>
        )}
        {product && recommendedRetail == null && costBreakdown && (
          <p className="text-xs text-text-muted -mt-2">No comparison analysis available yet — Retail Price is set manually.</p>
        )}
      </SectionCard>

      <SectionCard title="Competitor Pricing">
        {isNew || !product ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Run Competitor Analysis</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {draftMissing.length > 0 ? (
                    <>Fill in {draftMissing.join(', ')} first (General and Attributes tabs) to enable this.</>
                  ) : (
                    <>
                      Runs Stage 1 core match and Stage 2 variant match against the competitors configured on Competitor
                      Pricing for this product's category, then sets Retail Price from the result — same as the full
                      analysis a saved product gets, without saving first. Also requires an estimated Retail Price above,
                      since competitor prices are synthesized relative to it.
                    </>
                  )}
                </p>
              </div>
              <Button variant="secondary" size="sm" disabled={!canRunDraftAnalysis} onClick={runDraftCompetitorAnalysis} className="shrink-0">
                Run Competitor Analysis
              </Button>
            </div>
            {draftPosition && (
              <div className="pt-3 border-t border-border">
                <CompetitorMatchAnalysis
                  product={{ price: parseFloat(form.price) || 0 }}
                  position={draftPosition}
                  onEditVariantAttributes={goToSpecMatchingVariant}
                  onEditStandardMargin={goToPricingFormula}
                />
              </div>
            )}
          </>
        ) : !costBreakdown ? (
          <p className="text-sm text-text-muted">No cost data for this product yet — set it up on the Cost tab first.</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Use Competitor Pricing</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {(() => {
                    const isManual = forcedExplicit != null
                    if (useCompetitorPricing) {
                      return isManual
                        ? 'Manually turned on. This will use competitor analysis if valid matches exist, or fall back to the standard margin if not.'
                        : 'Valid competitor matches were found — on by default. Turn off to price from the standard margin instead.'
                    }
                    if (!hasCompetitorData) {
                      return "No valid competitor matches were found for this product, so this is off and can't be turned on until valid matches exist."
                    }
                    return 'Manually turned off — pricing uses the standard margin on cost instead of competitor analysis.'
                  })()}
                </p>
              </div>
              <Toggle
                checked={useCompetitorPricing}
                disabled={!useCompetitorPricing && !hasCompetitorData}
                onChange={v => setForceStandardMargin(product.id, !v)}
              />
            </div>

            {hasCompetitorData && (
              <div className="flex justify-end -mt-2">
                <button
                  onClick={goToAnalysisDetails}
                  className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 hover:underline"
                >
                  View full Stage 1 &amp; 2 analysis details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {useCompetitorPricing ? (
              <div className="pt-3 border-t border-border">
                <CompetitorMatchAnalysis
                  product={product}
                  position={position}
                  cost={costBreakdown.totalCost}
                  onEditVariantAttributes={goToSpecMatchingVariant}
                  onEditStandardMargin={goToPricingFormula}
                />
              </div>
            ) : (
              <div className="bg-warning-500/10 border border-warning-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-warning-600">Not using competitor pricing</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">
                    Standard margin — {recommendedRetail != null ? `$${recommendedRetail.toFixed(2)}` : '—'} at {Math.round(standardMarginPct * 100)}% on cost
                  </p>
                </div>
                <button onClick={goToPricingFormula} className="text-xs text-brand-500 hover:text-brand-600 hover:underline shrink-0">
                  Edit standard margin
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      <div className="flex items-center justify-between gap-3 -mb-1">
        <p className="text-xs text-text-muted">
          Trade / Bulk / Bulk Trade discounts default from this product's category and can be overridden here.
        </p>
        <Link to={`/competitor-pricing?${new URLSearchParams({ tab: 'Pricing Discounts' })}`} className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 hover:underline shrink-0">
          Manage category defaults &amp; bulk edit <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <SectionCard title="Trade Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Trade Discount (%)" hint="Applied automatically to trade account customers">
            <Input
              type="number"
              value={tradeDiscount}
              onChange={e => setTradeDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
            />
          </Field>
          <Field label="Trade Price (calculated)">
            <Input value={tradeCalc} disabled placeholder="Auto-calculated" />
          </Field>
        </div>
        {product && (
          <DiscountOverrideNote
            isOverridden={effectiveDiscounts.isOverridden.tradeDiscount}
            categoryDefault={categoryDefaults.tradeDiscount}
            onReset={() => clearProductOverride(product.id, 'tradeDiscount')}
          />
        )}
      </SectionCard>

      <SectionCard title="Bulk Pricing">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Minimum Quantity" hint="Bulk discount applies when cart qty reaches this">
            <Input
              type="number"
              value={form.bulkMinQty ?? ''}
              onChange={e => setForm(f => ({ ...f, bulkMinQty: e.target.value }))}
              placeholder="10"
            />
          </Field>
          <Field label="Bulk Discount (%)">
            <Input
              type="number"
              value={bulkDiscount}
              onChange={e => setBulkDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
            />
          </Field>
          <Field label="Bulk Price (calculated)">
            <Input value={bulkCalc} disabled placeholder="Auto-calculated" />
          </Field>
        </div>
        {product && (
          <DiscountOverrideNote
            isOverridden={effectiveDiscounts.isOverridden.bulkDiscount}
            categoryDefault={categoryDefaults.bulkDiscount}
            onReset={() => clearProductOverride(product.id, 'bulkDiscount')}
          />
        )}
      </SectionCard>

      <SectionCard title="Bulk Trade Pricing">
        <p className="text-xs text-text-muted -mt-2">Further discount off the Bulk price for trade accounts buying in bulk.</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bulk Trade Discount (%)" hint="Applied on top of the Bulk price">
            <Input
              type="number"
              value={bulkTradeDiscount}
              onChange={e => setBulkTradeDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
            />
          </Field>
          <Field label="Bulk Trade Price (calculated)">
            <Input value={bulkTradeCalc != null ? `$${bulkTradeCalc.toFixed(2)}` : ''} disabled placeholder="Auto-calculated" />
          </Field>
        </div>
        {product && (
          <DiscountOverrideNote
            isOverridden={effectiveDiscounts.isOverridden.bulkTradeDiscount}
            categoryDefault={categoryDefaults.bulkTradeDiscount}
            onReset={() => clearProductOverride(product.id, 'bulkTradeDiscount')}
          />
        )}
      </SectionCard>

      <SectionCard title="GST">
        <Toggle
          checked={form.gst}
          onChange={v => setForm(f => ({ ...f, gst: v }))}
          label="This product is subject to 10% GST"
          description="GST will be shown separately on invoices and orders."
        />
      </SectionCard>

      <SectionCard title="Discount">
        <Toggle
          checked={form.onSale ?? false}
          onChange={v => setForm(f => ({ ...f, onSale: v }))}
          label="This product is on sale"
          description="This will be the price shown on product page when item is on sale."
        />
        {form.onSale && (
          <div className="grid grid-cols-2 gap-4 pt-1">
            <Field label="Discount (%)" hint="Applied automatically to trade account customers">
              <Input
                type="number"
                value={form.saleDiscount ?? ''}
                onChange={e => setForm(f => ({ ...f, saleDiscount: e.target.value }))}
                placeholder="0"
              />
            </Field>
            <Field label="Discounted Price (calculated)">
              <Input value={saleCalc} disabled placeholder="Auto-calculated" />
            </Field>
          </div>
        )}
      </SectionCard>
    </div>
  )

  return (
    <div className="flex gap-4 items-start">
      {mainContent}
      <div className="w-72 shrink-0 flex flex-col gap-4">
        <SectionCard title="Pricing Summary">
          <SummaryRow
            label="Retail"
            price={retailPrice > 0 ? retailPrice : null}
            sub={useCompetitorPricing ? 'Competitor pricing' : `Standard margin ${Math.round(standardMarginPct * 100)}%`}
            margin={costBreakdown && retailPrice > 0 ? (retailPrice - costBreakdown.totalCost) / retailPrice : null}
          />
          <SummaryRow
            label="Trade"
            price={tradePriceNum}
            sub={tradeDiscount ? `${tradeDiscount}% off retail` : null}
            margin={costBreakdown && tradePriceNum ? (tradePriceNum - costBreakdown.totalCost) / tradePriceNum : null}
          />
          <SummaryRow
            label="Bulk"
            price={bulkPriceNum}
            sub={bulkDiscount ? `${bulkDiscount}% off retail` : null}
            margin={costBreakdown && bulkPriceNum ? (bulkPriceNum - costBreakdown.totalCost) / bulkPriceNum : null}
          />
          <SummaryRow
            label="Bulk Trade"
            price={bulkTradeCalc}
            sub={bulkTradeDiscount ? `${bulkTradeDiscount}% off bulk` : null}
            margin={costBreakdown && bulkTradeCalc ? (bulkTradeCalc - costBreakdown.totalCost) / bulkTradeCalc : null}
          />
          <SummaryRow
            label="MAM"
            price={mamPriceNum}
            sub={mamDiscount ? `${mamDiscount}% off retail` : null}
            margin={costBreakdown && mamPriceNum ? (mamPriceNum - costBreakdown.totalCost) / mamPriceNum : null}
          />
        </SectionCard>
      </div>
    </div>
  )
}

// Reads/writes ProductCostContext directly (not the local form/setForm
// staging pattern the rest of this page uses) — cost data is shared with
// Competitor Pricing's Overview, so edits apply immediately rather than
// waiting on "Save Product".
function TabCost({ productId, isNew }) {
  const { costRecords, updateCostRecord } = useProductCost()
  const [costVariablesOpen, setCostVariablesOpen] = useState(false)
  const record = !isNew ? costRecords[productId] : null

  if (isNew) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-text-muted">
        <p className="font-medium text-text-secondary">Save this product first</p>
        <p className="text-sm">The cost breakdown is available once the product has been created.</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-text-muted">
        <p className="font-medium text-text-secondary">No cost data for this product</p>
        <p className="text-sm">Custom-quote products priced on application don't carry a cost breakdown.</p>
      </div>
    )
  }

  const set = (patch) => updateCostRecord(productId, patch)
  const num = (v) => { const n = parseFloat(v); return Number.isNaN(n) ? 0 : n }
  const breakdown = computeCostBreakdown(record)

  return (
    <>
    <div className="flex flex-col gap-4">
      <SectionCard title="Unit & Landed Cost">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Unit Cost ($)">
            <Input type="number" step="0.01" value={record.unitCost} onChange={e => set({ unitCost: num(e.target.value) })} />
          </Field>
          <Field label="Freight & Duties ($)">
            <Input type="number" step="0.01" value={record.freightDuties} onChange={e => set({ freightDuties: num(e.target.value) })} />
          </Field>
          <Field label="Landed Cost (calculated)">
            <Input value={`$${breakdown.unitLanded.landedCost.toFixed(2)}`} disabled />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Packaging Cost">
        <div className="flex items-center justify-between gap-3 -mt-2">
          <p className="text-xs text-text-muted">
            Packaging Cost below is still a single manual subtotal — it isn't auto-built from selected components yet. The
            freight, material, and packaging rate card is available to reference while filling this in.
          </p>
          <button
            type="button"
            onClick={() => setCostVariablesOpen(true)}
            className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 hover:underline shrink-0"
          >
            View Cost Variables <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Packing Method">
            <Select value={record.packingMethod} onChange={e => set({ packingMethod: e.target.value })}>
              {PACKING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Packaging Cost ($)">
            <Input type="number" step="0.01" value={record.packagingCost} onChange={e => set({ packagingCost: num(e.target.value) })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Labour & Manufacturing Cost">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Assembly Labour Hours" hint={`@ $${LABOUR_RATES.assembly}/hr = $${breakdown.labour.assemblyLabourCost.toFixed(2)}`}>
            <Input type="number" step="0.01" value={record.assemblyHours} onChange={e => set({ assemblyHours: num(e.target.value) })} />
          </Field>
          <Field label="Packing Labour Hours" hint={`@ $${LABOUR_RATES.packing}/hr = $${breakdown.labour.packingLabourCost.toFixed(2)}`}>
            <Input type="number" step="0.01" value={record.packingHours} onChange={e => set({ packingHours: num(e.target.value) })} />
          </Field>
          <Field label="Manufacturing Labour Hours" hint={`@ $${LABOUR_RATES.manufacturing}/hr = $${breakdown.labour.manufacturingLabourCost.toFixed(2)}`}>
            <Input type="number" step="0.01" value={record.manufacturingHours} onChange={e => set({ manufacturingHours: num(e.target.value) })} />
          </Field>
        </div>
        <Field label="Manufacturing Cosmetic Cost ($)" hint="Finishing, paint, or other cosmetic treatment cost">
          <Input type="number" step="0.01" value={record.manufacturingCosmeticCost} onChange={e => set({ manufacturingCosmeticCost: num(e.target.value) })} className="w-48" />
        </Field>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm font-medium text-text-primary">Total Labour & Manufacturing Cost</span>
          <span className="text-sm font-semibold text-text-primary">${breakdown.labour.labourCost.toFixed(2)}</span>
        </div>
      </SectionCard>

      <SectionCard title="Operational Cost">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Fixed Cost ($)">
            <Input type="number" step="0.01" value={record.fixedCost} onChange={e => set({ fixedCost: num(e.target.value) })} />
          </Field>
          <Field label="Handling Cost ($)">
            <Input type="number" step="0.01" value={record.handlingCost} onChange={e => set({ handlingCost: num(e.target.value) })} />
          </Field>
          <Field label="Extras Cost ($)">
            <Input type="number" step="0.01" value={record.extrasCost} onChange={e => set({ extrasCost: num(e.target.value) })} />
          </Field>
        </div>
      </SectionCard>

      <div className="bg-brand-50 border border-brand-100 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">Total Cost</p>
          <p className="text-xs text-brand-600 mt-0.5">Landed + Packaging + Labour + Operational — flows into Product Pricing's margins automatically.</p>
        </div>
        <span className="text-xl font-semibold text-text-primary">${breakdown.totalCost.toFixed(2)}</span>
      </div>
    </div>
    <CostVariablesModal open={costVariablesOpen} onClose={() => setCostVariablesOpen(false)} />
    </>
  )
}

function TabInventory({ form, setForm }) {
  return (
    <div className="flex flex-col gap-4">
      {form.type !== 'variable' && (
        <SectionCard title="SKU">
          <Field label="SKU">
            <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. EQ-FSS-01" />
          </Field>
        </SectionCard>
      )}

      <SectionCard title="Stock">
        <Field label="Current Stock">
          <Input
            type="number"
            value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
            placeholder="0"
            disabled={form.type === 'custom'}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Stock Alerts">
        <Toggle
          checked={form.stockAlerts ?? false}
          onChange={v => setForm(f => ({ ...f, stockAlerts: v }))}
          label="Enable stock alerts"
          description="Get notified when stock falls below the alert threshold."
        />
        {form.stockAlerts && (
          <Field label="Alert Threshold" hint="Notify when stock drops to or below this quantity">
            <Input
              type="number"
              value={form.stockAlertThreshold ?? ''}
              onChange={e => setForm(f => ({ ...f, stockAlertThreshold: e.target.value }))}
              placeholder="e.g. 5"
            />
          </Field>
        )}
      </SectionCard>

      <SectionCard title="Backorders">
        <Toggle
          checked={form.allowBackorders ?? false}
          onChange={v => setForm(f => ({ ...f, allowBackorders: v }))}
          label="Allow backorders"
          description="Customers can still purchase this product when it is out of stock."
        />
      </SectionCard>
    </div>
  )
}

function TabSpecs({ form, setForm }) {
  const addRow = (key) => setForm(f => ({ ...f, [key]: [...(f[key] || []), { q: '', a: '' }] }))
  const removeRow = (key, i) => setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }))
  const updateRow = (key, i, field, val) => setForm(f => ({ ...f, [key]: f[key].map((row, idx) => idx === i ? { ...row, [field]: val } : row) }))

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Product Specifications">
        <p className="text-xs text-text-muted -mt-2">Key/value pairs shown in the specifications table on the product page.</p>
        <div className="flex flex-col gap-2">
          {(form.specs || []).map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <GripVertical className="w-4 h-4 text-text-muted shrink-0" />
              <Input value={row.q} onChange={e => updateRow('specs', i, 'q', e.target.value)} placeholder="e.g. Material" className="w-40 shrink-0" />
              <Input value={row.a} onChange={e => updateRow('specs', i, 'a', e.target.value)} placeholder="e.g. Aluminium alloy" />
              <button onClick={() => removeRow('specs', i)} className="p-1.5 text-text-muted hover:text-error-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => addRow('specs')} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
            <Plus className="w-4 h-4" />
            Add specification
          </button>
        </div>
      </SectionCard>

    </div>
  )
}

// Cartesian product of every option's values — one entry per resulting
// variant, e.g. [{type:'Colour',value:'Red'},{type:'Size',value:'Small'}].
// Shared between the Variants list (builds each variant's price/inventory/
// shipping/specs panel) and the Attributes tab (assigns spec-matching
// attribute values per variant) so both stay in sync with whatever Options
// are currently defined, instead of each recomputing it independently.
function computeVariantCombos(variationTypes) {
  return (variationTypes || [])
    .filter(vt => vt.name && vt.options.length > 0)
    .reduce((acc, vt) => {
      if (acc.length === 0) return vt.options.filter(Boolean).map(o => [{ type: vt.name, value: o }])
      return acc.flatMap(c => vt.options.filter(Boolean).map(o => [...c, { type: vt.name, value: o }]))
    }, [])
}
const variantComboKey = (combo) => combo.map(c => c.value).join('__')

const MAX_VARIATION_TYPES = 3

// Specs that make sense per-variant (e.g. Colour can differ per SKU).
// Packaging dimensions/weight are deliberately excluded here — at the
// variant level those live in the structured Shipping section below instead
// of a free-text spec field.
const VARIANT_SPEC_FIELDS = [
  { key: 'material', label: 'Material' },
  { key: 'finish', label: 'Finish' },
  { key: 'colour', label: 'Colour' },
]

// Shopify-style tag input for an option's values — type a value and press
// Enter/comma to add it as a chip, click the × to remove one, or Backspace
// on an empty field to pop the last chip.
function OptionValuesInput({ values, onAdd, onRemove }) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const v = draft.trim()
    if (v && !values.includes(v)) onAdd(v)
    setDraft('')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((v, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-sm text-brand-700 font-medium">
          {v}
          <button type="button" onClick={() => onRemove(i)} className="w-4 h-4 rounded-full hover:bg-brand-100 flex items-center justify-center text-brand-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
          else if (e.key === 'Backspace' && draft === '' && values.length > 0) onRemove(values.length - 1)
        }}
        onBlur={commit}
        placeholder="Add a value and press Enter"
        className="h-8 min-w-[10rem] px-2.5 rounded-full border border-dashed border-border bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

// The generated variant matrix — one row per combination of option values.
// Each row expands into its own Pricing / Inventory / Shipping /
// Specifications panel, so a variant behaves like its own mini product
// rather than just a SKU/price pair. Deliberately no hard delete: switching
// "Active" off keeps the variant's data intact (in case its option
// combination comes back) while excluding it from the storefront.
function VariationCombinations({ form, setForm, combos }) {
  const [openKey, setOpenKey] = useState(null)

  const getVariationData = (key) => (form.variationData ?? {})[key] ?? {}
  const setVariationData = (key, patch) => setForm(f => ({
    ...f,
    variationData: { ...(f.variationData ?? {}), [key]: { ...getVariationData(key), ...patch } }
  }))

  return (
    <SectionCard title="Variants">
      <p className="text-xs text-text-muted -mt-2">
        {combos.length} variant{combos.length === 1 ? '' : 's'} generated from your options above. Each one acts like its
        own product — set its price, inventory, shipping and specs, or switch it off without losing its data.
      </p>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[auto_1fr_100px_80px_130px_60px] gap-3 px-4 py-2.5 bg-grey-50 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">
          <span></span>
          <span>Variant</span>
          <span>Price</span>
          <span>Stock</span>
          <span>SKU</span>
          <span>Active</span>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {combos.map(combo => {
            const key = variantComboKey(combo)
            const data = getVariationData(key)
            const isOpen = openKey === key
            const label = combo.map(c => c.value).join(' / ')
            const isEnabled = data.enabled !== false
            return (
              <div key={key} className={isEnabled ? '' : 'opacity-60'}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  onKeyDown={e => { if (e.key === 'Enter') setOpenKey(isOpen ? null : key) }}
                  className="w-full grid grid-cols-2 md:grid-cols-[auto_1fr_100px_80px_130px_60px] gap-x-3 gap-y-1 items-center px-4 py-3 bg-surface hover:bg-grey-50 transition-colors text-left cursor-pointer"
                >
                  <svg className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6"/></svg>
                  <span className="text-sm font-medium text-text-primary truncate col-span-2 md:col-span-1">{label}</span>
                  <span className="text-sm text-text-secondary">{data.price ? `$${data.price}` : '—'}</span>
                  <span className="text-sm text-text-secondary">{data.stock ?? '—'}</span>
                  <span className="text-sm text-text-secondary truncate">{data.sku || '—'}</span>
                  <span
                    onClick={e => { e.stopPropagation(); setVariationData(key, { enabled: !isEnabled }) }}
                    role="button"
                    tabIndex={0}
                    title={isEnabled ? 'Switch this variant off' : 'Switch this variant on'}
                    className="justify-self-start"
                  >
                    <span className={`inline-flex w-9 h-5 rounded-full transition-colors ${isEnabled ? 'bg-brand-500' : 'bg-grey-200'}`}>
                      <span className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow-xs transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </span>
                  </span>
                </div>
                {isOpen && (
                  <div className="px-4 py-5 bg-grey-50 border-t border-border flex flex-col gap-5">
                    <div className="flex flex-wrap gap-1.5">
                      {combo.map(c => (
                        <span key={c.type} className="text-xs text-text-muted bg-grey-100 px-2 py-0.5 rounded">{c.type}: {c.value}</span>
                      ))}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text-primary mb-3">Pricing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Retail Price ($)">
                          <Input type="number" value={data.price ?? ''} onChange={e => setVariationData(key, { price: e.target.value })} placeholder="0" />
                        </Field>
                        <Field label="Trade Price ($)" hint="Optional — overrides the standard trade discount for this variant">
                          <Input type="number" value={data.tradePrice ?? ''} onChange={e => setVariationData(key, { tradePrice: e.target.value })} placeholder="0" />
                        </Field>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text-primary mb-3">Inventory</p>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <Field label="SKU">
                          <Input value={data.sku ?? ''} onChange={e => setVariationData(key, { sku: e.target.value })} placeholder="e.g. PROD-RED-LG" />
                        </Field>
                        <Field label="Barcode" hint="ISBN, UPC, GTIN, etc.">
                          <Input value={data.barcode ?? ''} onChange={e => setVariationData(key, { barcode: e.target.value })} placeholder="Optional" />
                        </Field>
                        <Field label="Stock">
                          <Input type="number" value={data.stock ?? ''} onChange={e => setVariationData(key, { stock: e.target.value })} placeholder="0" />
                        </Field>
                      </div>
                      <Toggle
                        checked={data.allowBackorders ?? false}
                        onChange={v => setVariationData(key, { allowBackorders: v })}
                        label="Allow backorders"
                        description="Customers can still purchase this variant when it's out of stock."
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text-primary mb-3">Shipping</p>
                      <div className="grid grid-cols-4 gap-4">
                        <Field label="Weight (kg)">
                          <Input type="number" value={data.weight ?? ''} onChange={e => setVariationData(key, { weight: e.target.value })} placeholder="0.0" />
                        </Field>
                        <Field label="Length (cm)">
                          <Input type="number" value={data.dimensions?.l ?? ''} onChange={e => setVariationData(key, { dimensions: { ...(data.dimensions ?? {}), l: e.target.value } })} placeholder="0" />
                        </Field>
                        <Field label="Width (cm)">
                          <Input type="number" value={data.dimensions?.w ?? ''} onChange={e => setVariationData(key, { dimensions: { ...(data.dimensions ?? {}), w: e.target.value } })} placeholder="0" />
                        </Field>
                        <Field label="Height (cm)">
                          <Input type="number" value={data.dimensions?.h ?? ''} onChange={e => setVariationData(key, { dimensions: { ...(data.dimensions ?? {}), h: e.target.value } })} placeholder="0" />
                        </Field>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text-primary mb-3">Specifications</p>
                      <div className="grid grid-cols-2 gap-4">
                        {VARIANT_SPEC_FIELDS.map(({ key: sk, label }) => (
                          <Field key={sk} label={label}>
                            <Input
                              value={data.specs?.[sk] ?? ''}
                              onChange={e => setVariationData(key, { specs: { ...(data.specs ?? {}), [sk]: e.target.value } })}
                              placeholder={`Enter ${label.toLowerCase()}`}
                            />
                          </Field>
                        ))}
                        {(data.customSpecs ?? []).map((spec, si) => (
                          <div key={si} className="flex gap-2">
                            <Input value={spec.label} onChange={e => {
                              const updated = [...(data.customSpecs ?? [])]
                              updated[si] = { ...updated[si], label: e.target.value }
                              setVariationData(key, { customSpecs: updated })
                            }} placeholder="Field name" className="w-32 shrink-0" />
                            <Input value={spec.value} onChange={e => {
                              const updated = [...(data.customSpecs ?? [])]
                              updated[si] = { ...updated[si], value: e.target.value }
                              setVariationData(key, { customSpecs: updated })
                            }} placeholder="Value" />
                            <button type="button" onClick={() => setVariationData(key, { customSpecs: (data.customSpecs ?? []).filter((_, j) => j !== si) })} className="p-2 text-text-muted hover:text-red-500 shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setVariationData(key, { customSpecs: [...(data.customSpecs ?? []), { label: '', value: '' }] })}
                          className="col-span-2 flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit"
                        >
                          <Plus className="w-4 h-4" /> Add custom field
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}

function TabVariations({ form, setForm }) {
  if (form.type !== 'variable') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-text-muted">
        <p className="font-medium text-text-secondary">Variations are only available for Variable products</p>
        <p className="text-sm">Change the Product Type to "Variable" on the General tab to enable this.</p>
      </div>
    )
  }

  const variationTypes = form.variationTypes || []
  const combos = computeVariantCombos(variationTypes)

  const addVariationType = () => setForm(f => ({ ...f, variationTypes: [...(f.variationTypes || []), { name: '', options: [] }] }))
  const removeVariationType = (ti) => setForm(f => ({ ...f, variationTypes: f.variationTypes.filter((_, i) => i !== ti) }))
  const updateTypeName = (ti, val) => setForm(f => ({
    ...f,
    variationTypes: f.variationTypes.map((t, i) => i === ti ? { ...t, name: val } : t)
  }))
  const addOptionValue = (ti, val) => setForm(f => ({
    ...f,
    variationTypes: f.variationTypes.map((t, i) => i === ti && !t.options.includes(val) ? { ...t, options: [...t.options, val] } : t)
  }))
  const removeOptionValue = (ti, oi) => setForm(f => ({
    ...f,
    variationTypes: f.variationTypes.map((t, i) => i === ti ? { ...t, options: t.options.filter((_, j) => j !== oi) } : t)
  }))

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Options">
        <p className="text-xs text-text-muted -mt-2">
          Add up to {MAX_VARIATION_TYPES} options (e.g. Colour, Size) and the values each one can take. Every combination
          of values becomes its own variant below, each with its own price, inventory, shipping and specs.
        </p>
        <div className="flex flex-col gap-4">
          {variationTypes.map((vt, ti) => (
            <div key={ti} className="border border-border rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <Field label="Option Name">
                  <Input value={vt.name} onChange={e => updateTypeName(ti, e.target.value)} placeholder="e.g. Colour, Size, Length" className="max-w-xs" />
                </Field>
                <button type="button" onClick={() => removeVariationType(ti)} className="p-2 rounded-lg text-text-muted hover:text-error-500 hover:bg-error-50 transition-colors shrink-0" title="Remove option">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Values</label>
                <OptionValuesInput
                  values={vt.options}
                  onAdd={val => addOptionValue(ti, val)}
                  onRemove={oi => removeOptionValue(ti, oi)}
                />
              </div>
            </div>
          ))}
          {variationTypes.length < MAX_VARIATION_TYPES && (
            <button onClick={addVariationType} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
              <Plus className="w-4 h-4" />
              Add another option
            </button>
          )}
        </div>
      </SectionCard>

      {combos.length > 0 && <VariationCombinations form={form} setForm={setForm} combos={combos} />}
    </div>
  )
}

// One attribute's value chips, plus an inline "add a new value" control.
// New values are written straight to the shared AttributesContext (via
// `addValue`), so they show up on the standalone Attributes page too — not
// just staged locally on this product — and the newly-added value is
// selected for this product immediately since that's the obvious reason to
// add it from here rather than from Attributes directly.
function AttributeValueRow({ attr, selected, onToggle, addValue }) {
  const [newVal, setNewVal] = useState('')

  const handleAdd = () => {
    const v = newVal.trim()
    if (!v || attr.values.includes(v)) return
    addValue(attr.id, v)
    onToggle(v)
    setNewVal('')
  }

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">{attr.name}</p>
      <div className="flex flex-wrap items-center gap-2">
        {attr.values.length === 0 && <p className="text-xs text-text-muted italic">No values defined for this attribute yet.</p>}
        {attr.values.map(val => {
          const isSelected = selected.includes(val)
          return (
            <button
              key={val}
              type="button"
              onClick={() => onToggle(val)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                isSelected
                  ? 'bg-brand-50 border-brand-500 text-brand-600 font-medium'
                  : 'bg-white border-border text-text-secondary hover:border-brand-300'
              }`}
            >
              {val}{attr.type === 'numeric' && attr.unit ? attr.unit : ''}
            </button>
          )
        })}
        <div className="flex items-center gap-1">
          <input
            value={newVal}
            onChange={e => setNewVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder={attr.type === 'numeric' ? 'Add numeric value…' : 'Add value…'}
            className="h-8 w-36 px-2.5 rounded-full border border-dashed border-border bg-surface text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newVal.trim()}
            className="w-8 h-8 rounded-full border border-dashed border-border text-text-muted hover:border-brand-500 hover:text-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            title={`Add a new value to "${attr.name}"`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// `attributes` is the category-scoped pool (from the shared Attributes CMS,
// filtered to whatever's assigned to this product's category on Category
// Assignments) — not a static list, so adding/renaming/reassigning an
// attribute anywhere in the CMS shows up here immediately, and new values or
// new attributes added from here are written back to that same shared list.
function AttributeSelector({ attributes, selected = {}, onChange, addValue, onAddAttribute }) {
  const toggle = (attrName, value) => {
    const current = selected[attrName] ?? []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...selected, [attrName]: updated })
  }

  return (
    <div className="flex flex-col gap-5">
      {attributes.length === 0 && (
        <p className="text-sm text-text-muted">No attributes are assigned to this product's category yet — add one below.</p>
      )}
      {attributes.map(attr => (
        <AttributeValueRow
          key={attr.id}
          attr={attr}
          selected={selected[attr.name] ?? []}
          onToggle={val => toggle(attr.name, val)}
          addValue={addValue}
        />
      ))}
      <div>
        <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={onAddAttribute}>
          Add Attribute
        </Button>
      </div>
    </div>
  )
}

function TabAttributes({ form, setForm }) {
  const isVariable = form.type === 'variable'
  const { attributes, addAttribute, addValue } = useAttributes()
  // Scoped by Subcategory (the granular classification, e.g. "Modular Grab
  // Rails"), not the broad Primary Category — attribute assignments and
  // Stage 1/2 selections are all keyed at that level.
  const categoryAttributes = form.subCategory ? categoryAttributePool(attributes, form.subCategory) : []

  const [newAttrOpen, setNewAttrOpen] = useState(false)
  const [newAttrEditing, setNewAttrEditing] = useState(null)

  const openNewAttribute = () => {
    setNewAttrEditing({ id: null, name: '', type: 'categorical', unit: '', categories: form.subCategory ? [form.subCategory] : [], values: [] })
    setNewAttrOpen(true)
  }
  const saveNewAttribute = () => {
    if (!newAttrEditing.name.trim()) return
    addAttribute(newAttrEditing)
    toast(`Attribute "${newAttrEditing.name}" added${form.subCategory ? ` to ${form.subCategory}` : ''}`, 'success')
    setNewAttrOpen(false)
  }

  const combos = computeVariantCombos(form.variationTypes)

  const [openIdx, setOpenIdx] = useState(null)

  if (!form.subCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-text-muted">
        <p className="font-medium text-text-secondary">No subcategory selected</p>
        <p className="text-sm">Set this product's Primary Category and Subcategory on the General tab to see its assigned attributes.</p>
      </div>
    )
  }

  if (isVariable && combos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-text-muted">
        <p className="font-medium text-text-secondary">No variations defined yet</p>
        <p className="text-sm">Add variation types and options in the Variations tab first.</p>
      </div>
    )
  }

  if (isVariable) {
    return (
      <div className="flex flex-col gap-4">
        <SectionCard title="Attributes per Variation">
          <p className="text-xs text-text-muted -mt-2">Assign attribute values to each variation / SKU independently.</p>
          <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
            {combos.map((combo, ci) => {
              const key = variantComboKey(combo)
              const isOpen = openIdx === ci
              const label = combo.map(c => c.value).join(' / ')
              const varAttrs = (form.variationData ?? {})[key]?.attributes ?? {}
              const selectedCount = Object.values(varAttrs).flat().length
              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : ci)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-grey-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary">{label}</span>
                      {selectedCount > 0 && (
                        <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{selectedCount} assigned</span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 py-4 bg-grey-50 border-t border-border">
                      <AttributeSelector
                        attributes={categoryAttributes}
                        selected={varAttrs}
                        onChange={attrs => setForm(f => ({
                          ...f,
                          variationData: {
                            ...(f.variationData ?? {}),
                            [key]: { ...((f.variationData ?? {})[key] ?? {}), attributes: attrs }
                          }
                        }))}
                        addValue={addValue}
                        onAddAttribute={openNewAttribute}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </SectionCard>

        <AttributeEditorDrawer
          open={newAttrOpen}
          onClose={() => setNewAttrOpen(false)}
          editing={newAttrEditing}
          setEditing={setNewAttrEditing}
          onSave={saveNewAttribute}
          title="New Attribute"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Attributes">
        <p className="text-xs text-text-muted -mt-2">
          Select the attribute values that apply to this product — scoped to attributes assigned to{' '}
          <strong>{form.subCategory}</strong> on the Attributes page's Category Assignments view.
        </p>
        <AttributeSelector
          attributes={categoryAttributes}
          selected={form.attributes ?? {}}
          onChange={attrs => setForm(f => ({ ...f, attributes: attrs }))}
          addValue={addValue}
          onAddAttribute={openNewAttribute}
        />
      </SectionCard>

      <AttributeEditorDrawer
        open={newAttrOpen}
        onClose={() => setNewAttrOpen(false)}
        editing={newAttrEditing}
        setEditing={setNewAttrEditing}
        onSave={saveNewAttribute}
        title="New Attribute"
      />
    </div>
  )
}

function TabSEO({ form, setForm }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="SEO">
        <Field label="URL Slug" hint="The URL path for this product page">
          <div className="flex items-center">
            <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">/products/</span>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="rounded-l-none" placeholder="product-url-slug" />
          </div>
        </Field>
        <Field label="Meta Title" hint={`${form.metaTitle?.length || 0}/60 characters`}>
          <Input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} placeholder="Page title for search engines" maxLength={60} />
        </Field>
        <Field label="Meta Description" hint={`${form.metaDesc?.length || 0}/160 characters`}>
          <Textarea value={form.metaDesc} onChange={e => setForm(f => ({ ...f, metaDesc: e.target.value }))} rows={3} placeholder="Short description for search engine results" maxLength={160} />
        </Field>
      </SectionCard>

      {(form.metaTitle || form.metaDesc) && (
        <SectionCard title="Search Preview">
          <div className="bg-white border border-border rounded-lg p-4 max-w-xl">
            <p className="text-xs text-text-muted mb-1">equipsy.com.au › products › {form.slug || 'product-slug'}</p>
            <p className="text-base text-blue-700 font-medium leading-snug hover:underline cursor-pointer">{form.metaTitle || form.name || 'Product title'}</p>
            <p className="text-sm text-text-secondary mt-1 leading-snug">{form.metaDesc || 'Meta description will appear here…'}</p>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

export function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isNew = !id || id === 'new'
  const existing = !isNew ? mockProducts.find(p => p.id === Number(id)) : null

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'General')
  const [form, setForm] = useState(existing ? {
    ...existing,
    gallery: [], installs: [], resources: [],
    specs: [], faqs: [], variationTypes: [],
  } : {
    name: '', shortDesc: '', descTitle: '', longDesc: '', features: '', type: 'standard',
    material: '', finish: '', colour: '', packagingDimensions: '', packagingWeight: '',
    customSpecs: [],
    price: '', tradePrice: '', sku: '', stock: '',
    category: '', subCategory: '', status: 'draft', gst: true, bulky: false, custom: false, pallet: false,
    slug: '', metaTitle: '', metaDesc: '',
    gallery: [], installs: [], resources: [],
    specs: [], faqs: [], variationTypes: [],
  })

  const handleSave = (status) => {
    const missing = [
      !form.name?.trim() && 'product name',
      !form.category && 'primary category',
      !form.subCategory && 'subcategory',
    ].filter(Boolean)
    if (missing.length > 0) {
      toast(`Fill in ${missing.join(', ')} before saving (General tab).`, 'error')
      setActiveTab('General')
      return
    }
    const message = status === 'published'
      ? `Product "${form.name}" published — now live on the website.`
      : `Product "${form.name}" saved as a draft — changes won't be live until published.`
    toast(message, 'success')
    navigate('/products')
  }

  const tabContent = {
    General: <TabGeneral form={form} setForm={setForm} />,
    'Completed Installs': <TabCompletedInstalls form={form} setForm={setForm} />,
    Categories: <TabCategories form={form} setForm={setForm} />,
    Pricing: <TabPricing form={form} setForm={setForm} product={existing} isNew={isNew} />,
    Cost: <TabCost productId={existing?.id} isNew={isNew} />,
    Inventory: <TabInventory form={form} setForm={setForm} />,
    Specifications: <TabSpecs form={form} setForm={setForm} />,
    FAQs: <TabSpecs form={form} setForm={setForm} />,
    Variations: <TabVariations form={form} setForm={setForm} />,
    Attributes: <TabAttributes form={form} setForm={setForm} />,
    SEO: <TabSEO form={form} setForm={setForm} />,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <button onClick={() => navigate('/products')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{isNew ? 'Add New Product' : `Edit: ${form.name}`}</h1>
          {!isNew && <p className="text-sm text-text-muted mt-0.5">SKU: {form.sku}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={() => handleSave('draft')}>Save Draft</Button>
          <Button variant="primary" onClick={() => handleSave('published')}>Publish Changes</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-0">
        {TABS.filter(tab => tab !== 'Variations' || form.type === 'variable').map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabContent[activeTab]}
    </div>
  )
}
