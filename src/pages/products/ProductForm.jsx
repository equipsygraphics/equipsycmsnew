import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, GripVertical, Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea, Select, Toggle } from '../../components/ui/FormField'
import { MediaPicker } from '../../components/ui/MediaPicker'
import { RichTextEditor } from '../../components/ui/RichTextEditor'
import { toast } from '../../components/ui/Toast'
import { MediaLibraryModal } from '../../components/ui/MediaLibraryModal'
import { mockProducts, CATEGORIES, SUBCATEGORIES } from '../../data/mockProducts'

const TABS = ['General', 'Variations', 'Completed Installs', 'Pricing', 'Inventory', 'Attributes', 'SEO']

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
          <p className="text-[10px] text-text-muted leading-tight text-center px-2">SVG, PNG, JPG or GIF (max. 30MB)</p>
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
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Subcategory" hint={!form.category ? 'Select a primary category first' : undefined}>
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
            <p className="text-[10px] text-text-muted leading-tight text-center px-2">SVG, PNG, JPG or GIF (max. 30MB)</p>
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

function TabPricing({ form, setForm }) {
  const tradeDiscount = form.tradeDiscount ?? 0
  const bulkDiscount = form.bulkDiscount ?? 0
  const saleDiscount = form.saleDiscount ?? 0
  const retailPrice = parseFloat(form.price) || 0

  const tradeCalc = tradeDiscount > 0 && retailPrice > 0
    ? `$${(retailPrice * (1 - tradeDiscount / 100)).toFixed(2)}`
    : ''
  const bulkCalc = bulkDiscount > 0 && retailPrice > 0
    ? `$${(retailPrice * (1 - bulkDiscount / 100)).toFixed(2)}`
    : ''
  const saleCalc = saleDiscount > 0 && retailPrice > 0
    ? `$${(retailPrice * (1 - saleDiscount / 100)).toFixed(2)}`
    : ''

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Pricing">
        <Field label="Retail Price ($)">
          <Input
            type="number"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="0"
            disabled={form.type === 'custom'}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Trade Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Trade Discount (%)" hint="Applied automatically to trade account customers">
            <Input
              type="number"
              value={form.tradeDiscount ?? ''}
              onChange={e => setForm(f => ({ ...f, tradeDiscount: e.target.value }))}
              placeholder="0"
            />
          </Field>
          <Field label="Trade Price (calculated)">
            <Input value={tradeCalc} disabled placeholder="Auto-calculated" />
          </Field>
        </div>
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
              value={form.bulkDiscount ?? ''}
              onChange={e => setForm(f => ({ ...f, bulkDiscount: e.target.value }))}
              placeholder="0"
            />
          </Field>
          <Field label="Bulk Price (calculated)">
            <Input value={bulkCalc} disabled placeholder="Auto-calculated" />
          </Field>
        </div>
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

function VariationCombinations({ form, setForm }) {
  const [openIdx, setOpenIdx] = useState(null)

  const combos = (form.variationTypes || [])
    .filter(vt => vt.name && vt.options.length > 0)
    .reduce((acc, vt) => {
      if (acc.length === 0) return vt.options.filter(Boolean).map(o => [{ type: vt.name, value: o }])
      return acc.flatMap(c => vt.options.filter(Boolean).map(o => [...c, { type: vt.name, value: o }]))
    }, [])

  const comboKey = (combo) => combo.map(c => c.value).join('__')

  const getVariationData = (key) => (form.variationData ?? {})[key] ?? {}
  const setVariationData = (key, patch) => setForm(f => ({
    ...f,
    variationData: { ...(f.variationData ?? {}), [key]: { ...getVariationData(key), ...patch } }
  }))

  return (
    <SectionCard title="Variations">
      <p className="text-xs text-text-muted -mt-2">Set SKU, price, stock and specifications for each variation.</p>
      <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
        {combos.map((combo, ci) => {
          const key = comboKey(combo)
          const data = getVariationData(key)
          const isOpen = openIdx === ci
          const label = combo.map(c => c.value).join(' / ')
          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : ci)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-grey-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">{label}</span>
                  {combo.map(c => (
                    <span key={c.type} className="text-xs text-text-muted bg-grey-100 px-2 py-0.5 rounded">{c.type}</span>
                  ))}
                </div>
                <svg className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {isOpen && (
                <div className="px-4 py-4 bg-grey-50 border-t border-border flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="SKU">
                      <Input value={data.sku ?? ''} onChange={e => setVariationData(key, { sku: e.target.value })} placeholder="e.g. PROD-RED-LG" />
                    </Field>
                    <Field label="Retail Price ($)">
                      <Input type="number" value={data.price ?? ''} onChange={e => setVariationData(key, { price: e.target.value })} placeholder="0" />
                    </Field>
                    <Field label="Stock">
                      <Input type="number" value={data.stock ?? ''} onChange={e => setVariationData(key, { stock: e.target.value })} placeholder="0" />
                    </Field>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-3">Specifications</p>
                    <div className="grid grid-cols-2 gap-4">
                      {SPEC_FIELDS.map(({ key: sk, label, placeholder }) => (
                        <Field key={sk} label={label}>
                          <Input
                            value={data.specs?.[sk] ?? ''}
                            onChange={e => setVariationData(key, { specs: { ...(data.specs ?? {}), [sk]: e.target.value } })}
                            placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
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

  const addVariationType = () => setForm(f => ({ ...f, variationTypes: [...(f.variationTypes || []), { name: '', options: [] }] }))
  const addOption = (ti) => setForm(f => ({
    ...f,
    variationTypes: f.variationTypes.map((t, i) => i === ti ? { ...t, options: [...t.options, ''] } : t)
  }))
  const updateTypeName = (ti, val) => setForm(f => ({
    ...f,
    variationTypes: f.variationTypes.map((t, i) => i === ti ? { ...t, name: val } : t)
  }))
  const updateOption = (ti, oi, val) => setForm(f => ({
    ...f,
    variationTypes: f.variationTypes.map((t, i) => i === ti ? { ...t, options: t.options.map((o, j) => j === oi ? val : o) } : t)
  }))

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Variation Types">
        <p className="text-xs text-text-muted -mt-2">Define the types of variations (e.g. Colour, Size) and their available options.</p>
        <div className="flex flex-col gap-4">
          {(form.variationTypes || []).map((vt, ti) => (
            <div key={ti} className="border border-border rounded-lg p-4 flex flex-col gap-3">
              <Field label="Variation Type Name">
                <Input value={vt.name} onChange={e => updateTypeName(ti, e.target.value)} placeholder="e.g. Colour, Size, Length" className="max-w-xs" />
              </Field>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Options</label>
                <div className="flex flex-wrap gap-2">
                  {vt.options.map((opt, oi) => (
                    <Input key={oi} value={opt} onChange={e => updateOption(ti, oi, e.target.value)} placeholder="Option value" className="w-36" />
                  ))}
                  <button onClick={() => addOption(ti)} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
                    <Plus className="w-4 h-4" />
                    Add option
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addVariationType} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
            <Plus className="w-4 h-4" />
            Add variation type
          </button>
        </div>
      </SectionCard>

      {(form.variationTypes || []).some(vt => vt.name && vt.options.length > 0) && (
        <VariationCombinations form={form} setForm={setForm} />
      )}
    </div>
  )
}

const AVAILABLE_ATTRIBUTES = [
  { id: 1, name: 'Material', values: ['Aluminium', 'Stainless Steel', 'Chrome', 'Nylon', 'Timber'] },
  { id: 2, name: 'Colour', values: ['Silver', 'White', 'Black', 'Chrome'] },
  { id: 3, name: 'Weight Capacity', values: ['100kg', '120kg', '150kg', '200kg'] },
  { id: 4, name: 'Length', values: ['300mm', '450mm', '600mm', '750mm', '900mm'] },
  { id: 5, name: 'Compliance', values: ['AS 1428.1', 'AS 4586', 'NDIS Approved'] },
]

function AttributeSelector({ selected = {}, onChange }) {
  const toggle = (attrName, value) => {
    const current = selected[attrName] ?? []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...selected, [attrName]: updated })
  }

  return (
    <div className="flex flex-col gap-5">
      {AVAILABLE_ATTRIBUTES.map(attr => (
        <div key={attr.id}>
          <p className="text-sm font-medium text-text-primary mb-2">{attr.name}</p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map(val => {
              const isSelected = (selected[attr.name] ?? []).includes(val)
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggle(attr.name, val)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-600 font-medium'
                      : 'bg-white border-border text-text-secondary hover:border-brand-300'
                  }`}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function TabAttributes({ form, setForm }) {
  const isVariable = form.type === 'variable'

  const combos = (form.variationTypes || [])
    .filter(vt => vt.name && vt.options.length > 0)
    .reduce((acc, vt) => {
      if (acc.length === 0) return vt.options.filter(Boolean).map(o => [{ type: vt.name, value: o }])
      return acc.flatMap(c => vt.options.filter(Boolean).map(o => [...c, { type: vt.name, value: o }]))
    }, [])

  const comboKey = (combo) => combo.map(c => c.value).join('__')

  const [openIdx, setOpenIdx] = useState(null)

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
              const key = comboKey(combo)
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
                        selected={varAttrs}
                        onChange={attrs => setForm(f => ({
                          ...f,
                          variationData: {
                            ...(f.variationData ?? {}),
                            [key]: { ...((f.variationData ?? {})[key] ?? {}), attributes: attrs }
                          }
                        }))}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Attributes">
        <p className="text-xs text-text-muted -mt-2">Select the attribute values that apply to this product.</p>
        <AttributeSelector
          selected={form.attributes ?? {}}
          onChange={attrs => setForm(f => ({ ...f, attributes: attrs }))}
        />
      </SectionCard>
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
  const isNew = !id || id === 'new'
  const existing = !isNew ? mockProducts.find(p => p.id === Number(id)) : null

  const [activeTab, setActiveTab] = useState('General')
  const [form, setForm] = useState(existing ? {
    ...existing,
    gallery: [], installs: [], resources: [],
    specs: [], faqs: [], variationTypes: [],
  } : {
    name: '', shortDesc: '', descTitle: '', longDesc: '', features: '', type: 'standard',
    material: '', finish: '', colour: '', packagingDimensions: '', packagingWeight: '',
    customSpecs: [],
    price: '', tradePrice: '', sku: '', stock: '',
    category: '', subCategory: '', gst: true, bulky: false, custom: false, pallet: false,
    slug: '', metaTitle: '', metaDesc: '',
    gallery: [], installs: [], resources: [],
    specs: [], faqs: [], variationTypes: [],
  })

  const handleSave = (status) => {
    toast(isNew ? `Product "${form.name || 'Untitled'}" created as ${status}` : `Product saved`, 'success')
    navigate('/products')
  }

  const tabContent = {
    General: <TabGeneral form={form} setForm={setForm} />,
    'Completed Installs': <TabCompletedInstalls form={form} setForm={setForm} />,
    Categories: <TabCategories form={form} setForm={setForm} />,
    Pricing: <TabPricing form={form} setForm={setForm} />,
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
          <Button variant="primary" onClick={() => handleSave('published')}>Save Product</Button>
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
