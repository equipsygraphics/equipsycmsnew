import { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, ChevronRight, GripVertical, ArrowLeft, X, ChevronDown } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input, Textarea, Toggle, Select } from '../../components/ui/FormField'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { mockProducts } from '../../data/mockProducts'
import { mockCategories } from '../../data/mockCategories'

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
      {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
      {children}
    </div>
  )
}
import { MediaLibraryModal } from '../../components/ui/MediaLibraryModal'

const INITIAL_CATEGORIES = mockCategories

const TABS = ['General', 'FAQs', 'Products', 'Banners', 'SEO']

// ── Banner image picker ──────────────────────────────────────────────────────
function BannerImagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const checkerStyle = {
    backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0,0 6px,6px -6px,-6px 0px',
    backgroundColor: '#f9fafb',
  }
  return (
    <>
      <div
        className="relative w-full h-28 rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-brand-300 transition-colors"
        style={value ? {} : checkerStyle}
        onClick={() => setOpen(true)}
      >
        {value
          ? <img src={value} className="w-full h-full object-cover" />
          : <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-text-muted">
              <span className="text-xs font-medium text-brand-500">Select image</span>
              <span className="text-[10px]">Click to browse media library</span>
            </div>
        }
        {value && (
          <button type="button" onClick={e => { e.stopPropagation(); onChange(null) }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow text-text-muted hover:text-error-500">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <MediaLibraryModal open={open} onClose={() => setOpen(false)} onSelect={items => { onChange(items[0]?.url ?? null); setOpen(false) }} />
    </>
  )
}

// ── Tab: General ─────────────────────────────────────────────────────────────
function TabGeneral({ cat, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="General">
        <Field label="Category Name" required>
          <Input value={cat.name} onChange={e => onChange('name', e.target.value)} />
        </Field>
        <Field label="H1 / Main Heading">
          <Input value={cat.h1 ?? ''} onChange={e => onChange('h1', e.target.value)} placeholder="e.g. Grab Rails & Safety Handles" />
        </Field>
        <Field label="URL Slug">
          <div className="flex items-center">
            <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">/</span>
            <Input value={cat.slug} onChange={e => onChange('slug', e.target.value)} className="rounded-l-none" />
          </div>
        </Field>
        <Toggle checked={cat.primary ?? false} onChange={v => onChange('primary', v)} label="Primary Category" description="Appears as top-level in navigation and mega menu" />
      </SectionCard>
      <SectionCard title="Description">
        <Field label="Short Description">
          <Textarea value={cat.description ?? ''} onChange={e => onChange('description', e.target.value)} rows={2} />
        </Field>
        <Field label="Long Description">
          <Textarea value={cat.longDesc ?? ''} onChange={e => onChange('longDesc', e.target.value)} rows={5} placeholder="Extended category page description…" />
        </Field>
      </SectionCard>
    </div>
  )
}

// ── Tab: Products ─────────────────────────────────────────────────────────────
function TabProducts({ cat }) {
  const catName = cat.name
  const products = mockProducts.filter(p =>
    p.category?.toLowerCase() === catName.toLowerCase()
  )
  return (
    <SectionCard title="Products in this Category">
      {products.length === 0
        ? <p className="text-sm text-text-muted py-4 text-center">No products assigned to this category yet.</p>
        : (
          <div className="flex flex-col divide-y divide-border -mx-5 -mb-5">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-grey-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.sku} · {p.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary">${p.price}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'published' ? 'bg-success-50 text-success-600' : 'bg-grey-100 text-text-muted'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </SectionCard>
  )
}

// ── Shared checker style for empty image placeholders ────────────────────────
const checkerStyle = {
  backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0,0 6px,6px -6px,-6px 0px',
  backgroundColor: '#f9fafb',
}

// ── 2-banner preview: image left half, coloured right panel ──────────────────
function BannerPreview({ banner }) {
  const bgColor = banner.bgColor ?? '#A15C07'
  return (
    <div className="rounded-2xl overflow-hidden flex h-40 shadow-sm border border-[#E5E7EB]">
      <div className="w-1/2 shrink-0 overflow-hidden" style={banner.image ? {} : checkerStyle}>
        {banner.image
          ? <img src={banner.image} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No image</div>
        }
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4 px-6 py-6" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-col gap-2">
          <p className="text-white font-semibold text-base leading-snug line-clamp-2">
            {banner.title || <span className="opacity-40">Banner title</span>}
          </p>
          <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
            {banner.text || <span className="opacity-40">Banner description text</span>}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 bg-white text-[#1F2A37] text-xs font-semibold px-4 py-2.5 rounded-lg border border-[#E5E7EB] shadow-sm w-fit whitespace-nowrap">
          {banner.buttonText || 'Find out more'}
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}

// ── 1-banner preview: full-width yellow strip, dark text, product image left ──
function SingleBannerPreview({ banner }) {
  const bgColor = banner.bgColor ?? '#FAC515'
  return (
    <div className="w-full rounded-2xl overflow-hidden flex items-center gap-6 px-8 py-5 shadow-sm border border-[#E5E7EB]" style={{ backgroundColor: bgColor }}>
      <div className="w-28 h-20 shrink-0 overflow-hidden" style={banner.image ? {} : checkerStyle}>
        {banner.image
          ? <img src={banner.image} className="w-full h-full object-contain" />
          : <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">No image</div>
        }
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="font-semibold text-base text-[#0D121C] leading-snug line-clamp-1">
          {banner.title || <span className="opacity-40">Banner title</span>}
        </p>
        <p className="text-sm text-[#374151] line-clamp-2">
          {banner.text || <span className="opacity-40">Description text</span>}
        </p>
      </div>
      <span className="inline-flex items-center bg-white text-[#1F2A37] text-sm font-semibold px-4 py-2.5 rounded-lg border border-[#E5E7EB] shadow-sm whitespace-nowrap shrink-0">
        {banner.buttonText || 'Find out more'}
      </span>
    </div>
  )
}

// ── CTA banner card preview (portrait: image top, coloured bottom) ────────────
function CtaBannerPreview({ banner }) {
  const bgColor = banner.bgColor ?? '#CA8504'
  return (
    <div className="w-44 rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] flex flex-col">
      <div className="h-36 shrink-0 overflow-hidden" style={banner.image ? {} : checkerStyle}>
        {banner.image
          ? <img src={banner.image} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">No image</div>
        }
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1 justify-between" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-col gap-1.5">
          <p className="text-white font-semibold text-sm leading-snug line-clamp-3">
            {banner.title || <span className="opacity-40">Banner title</span>}
          </p>
          <p className="text-white/80 text-xs leading-relaxed line-clamp-3">
            {banner.text || <span className="opacity-40">Description</span>}
          </p>
        </div>
        <span className="inline-flex items-center justify-center gap-1.5 bg-white text-[#1F2A37] text-xs font-semibold px-3 py-2 rounded-lg border border-[#E5E7EB] shadow-sm w-full">
          {banner.buttonText || 'Find out more'}
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}

// ── Colour picker ─────────────────────────────────────────────────────────────
function ColorPicker({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer shrink-0">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="sr-only" />
          <div className="w-10 h-10 rounded-lg border border-border shadow-sm" style={{ backgroundColor: value }} />
        </label>
        <Input value={value} onChange={e => onChange(e.target.value)} className="font-mono uppercase w-32" placeholder="#000000" maxLength={7} />
      </div>
    </Field>
  )
}

// ── Tab: Banners ─────────────────────────────────────────────────────────────
const EMPTY_BANNER = { image: null, title: '', text: '', buttonText: '', buttonUrl: '' }
const CTA_MAX = 3
const CTA_DEFAULT_POSITIONS = [3, 7, 12]

const BANNER_STYLES = [
  { value: 'two-banner', label: '2-Banner', description: 'Two split banners — image left, content right' },
  { value: 'one-banner', label: '1-Banner', description: 'Single wide strip — image, text, and button' },
]

function TabBanners({ cat, onChange }) {
  const bannerStyle = cat.mainBannerStyle ?? 'two-banner'
  const bannerCount = bannerStyle === 'one-banner' ? 1 : 2

  const ensureBanners = (arr, n) => {
    const result = [...(arr ?? [])]
    while (result.length < n) result.push({ id: Date.now() + result.length, ...EMPTY_BANNER })
    return result.slice(0, n)
  }

  const mainBanners = ensureBanners(cat.mainBanners, bannerCount)
  const ctaBanners = cat.ctaBanners ?? []

  const updateMain = (idx, field, value) => {
    onChange('mainBanners', mainBanners.map((b, i) => i === idx ? { ...b, [field]: value } : b))
  }

  const addCta = () => {
    if (ctaBanners.length >= CTA_MAX) return
    const usedPositions = ctaBanners.map(b => b.position)
    const nextPos = CTA_DEFAULT_POSITIONS.find(p => !usedPositions.includes(p)) ?? (Math.max(...usedPositions, 2) + 4)
    onChange('ctaBanners', [...ctaBanners, { id: Date.now(), position: nextPos, ...EMPTY_BANNER }])
  }

  const removeCta = (idx) => {
    onChange('ctaBanners', ctaBanners.filter((_, i) => i !== idx))
  }

  const updateCta = (idx, field, value) => {
    onChange('ctaBanners', ctaBanners.map((b, i) => i === idx ? { ...b, [field]: value } : b))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main banners */}
      <SectionCard title="Main Banners">
        {/* Style picker */}
        <div className="flex gap-3 -mt-1">
          {BANNER_STYLES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange('mainBannerStyle', s.value)}
              className={`flex-1 flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-colors ${bannerStyle === s.value ? 'border-brand-500 bg-brand-50' : 'border-border bg-white hover:border-brand-200'}`}
            >
              <span className={`text-sm font-semibold ${bannerStyle === s.value ? 'text-brand-600' : 'text-text-primary'}`}>{s.label}</span>
              <span className="text-xs text-text-muted">{s.description}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-8">
          {mainBanners.map((b, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              {bannerCount > 1 && <p className="text-sm font-semibold text-text-primary">Banner {idx + 1}</p>}
              {bannerStyle === 'one-banner'
                ? <SingleBannerPreview banner={b} />
                : <BannerPreview banner={b} />
              }
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title"><Input value={b.title} onChange={e => updateMain(idx, 'title', e.target.value)} placeholder="e.g. Shop Grab Rails" /></Field>
                <Field label="Text"><Input value={b.text} onChange={e => updateMain(idx, 'text', e.target.value)} placeholder="e.g. Safety for every bathroom" /></Field>
                <Field label="Button Text"><Input value={b.buttonText} onChange={e => updateMain(idx, 'buttonText', e.target.value)} placeholder="e.g. Find out more" /></Field>
                <Field label="Button URL"><Input value={b.buttonUrl} onChange={e => updateMain(idx, 'buttonUrl', e.target.value)} placeholder="/products?category=…" /></Field>
              </div>
              <Field label="Banner Image"><BannerImagePicker value={b.image} onChange={v => updateMain(idx, 'image', v)} /></Field>
              <ColorPicker label="Background Colour" value={b.bgColor ?? (bannerStyle === 'one-banner' ? '#FAC515' : '#A15C07')} onChange={v => updateMain(idx, 'bgColor', v)} />
              {idx < bannerCount - 1 && <div className="border-t border-border" />}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* CTA banners */}
      <SectionCard title="CTA Banners">
        <p className="text-xs text-text-muted -mt-2">Shown between product cards in the category grid. Optional — up to 3. Default positions: 3rd and 7th slot.</p>
        <div className="flex flex-col gap-8">
          {ctaBanners.map((b, idx) => (
            <div key={b.id ?? idx} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">CTA Banner {idx + 1}</p>
                <button type="button" onClick={() => removeCta(idx)} className="flex items-center gap-1.5 text-xs text-error-500 hover:text-error-600 font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
              {/* Preview — side by side with position field */}
              <div className="flex gap-6 items-start">
                <CtaBannerPreview banner={b} />
                <div className="flex-1 flex flex-col gap-3">
                  <Field label="Position in grid" hint="Which slot in the product grid this banner occupies">
                    <Input
                      type="number"
                      min={1}
                      value={b.position}
                      onChange={e => updateCta(idx, 'position', Number(e.target.value))}
                      className="w-24"
                    />
                  </Field>
                  <Field label="Title"><Input value={b.title} onChange={e => updateCta(idx, 'title', e.target.value)} placeholder="e.g. Can't find what you need?" /></Field>
                  <Field label="Text"><Input value={b.text} onChange={e => updateCta(idx, 'text', e.target.value)} placeholder="e.g. We'll build it to your specs." /></Field>
                  <Field label="Button Text"><Input value={b.buttonText} onChange={e => updateCta(idx, 'buttonText', e.target.value)} placeholder="e.g. Find out more" /></Field>
                  <Field label="Button URL"><Input value={b.buttonUrl} onChange={e => updateCta(idx, 'buttonUrl', e.target.value)} placeholder="/contact" /></Field>
                  <ColorPicker label="Background Colour" value={b.bgColor ?? '#CA8504'} onChange={v => updateCta(idx, 'bgColor', v)} />
                </div>
              </div>
              <Field label="Banner Image"><BannerImagePicker value={b.image} onChange={v => updateCta(idx, 'image', v)} /></Field>
              {idx < ctaBanners.length - 1 && <div className="border-t border-border" />}
            </div>
          ))}
          {ctaBanners.length === 0 && (
            <p className="text-sm text-text-muted text-center py-2">No CTA banners added. They are optional.</p>
          )}
        </div>
        {ctaBanners.length < CTA_MAX && (
          <button type="button" onClick={addCta} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium mt-2">
            <Plus className="w-4 h-4" /> Add CTA Banner {ctaBanners.length > 0 ? `(${ctaBanners.length}/${CTA_MAX})` : ''}
          </button>
        )}
      </SectionCard>
    </div>
  )
}

// ── Tab: SEO ──────────────────────────────────────────────────────────────────
function TabSEO({ cat, onChange }) {
  const seo = cat.seo ?? { metaTitle: '', metaDescription: '', focusKeyword: '' }
  const update = (field, value) => onChange('seo', { ...seo, [field]: value })
  return (
    <SectionCard title="SEO">
      <Field label="Meta Title">
        <Input value={seo.metaTitle} onChange={e => update('metaTitle', e.target.value)} placeholder={`${cat.name} | Equipsy`} />
      </Field>
      <Field label="Meta Description">
        <Textarea value={seo.metaDescription} onChange={e => update('metaDescription', e.target.value)} rows={3} placeholder="Brief description for search engines…" />
      </Field>
      <Field label="Focus Keyword">
        <Input value={seo.focusKeyword} onChange={e => update('focusKeyword', e.target.value)} placeholder="e.g. grab rails australia" />
      </Field>
    </SectionCard>
  )
}

// ── Tab: FAQs ─────────────────────────────────────────────────────────────────
function TabFAQs({ cat, onChange }) {
  const faqs = cat.faqs ?? []
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const add = () => onChange('faqs', [...faqs, { id: Date.now(), question: '', answer: '' }])
  const remove = (id) => onChange('faqs', faqs.filter(f => f.id !== id))
  const update = (id, field, value) => onChange('faqs', faqs.map(f => f.id === id ? { ...f, [field]: value } : f))

  const onDragStart = (idx) => { dragIdx.current = idx }
  const onDragOver = (e, idx) => { e.preventDefault(); dragOverIdx.current = idx }
  const onDrop = () => {
    const from = dragIdx.current
    const to = dragOverIdx.current
    if (from !== null && to !== null && from !== to) {
      const arr = [...faqs]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      onChange('faqs', arr)
    }
    dragIdx.current = null
    dragOverIdx.current = null
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="FAQs">
        <p className="text-xs text-text-muted -mt-2">Frequently asked questions shown on the category page.</p>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={onDrop}
              className="border border-border rounded-lg p-4 flex gap-3 group cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-text-muted shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <Field label="Question">
                  <Input value={faq.question} onChange={e => update(faq.id, 'question', e.target.value)} placeholder="e.g. What sizes are available?" onMouseDown={e => e.stopPropagation()} />
                </Field>
                <Field label="Answer">
                  <Textarea value={faq.answer} onChange={e => update(faq.id, 'answer', e.target.value)} rows={2} placeholder="Enter the answer…" onMouseDown={e => e.stopPropagation()} />
                </Field>
              </div>
              <button onClick={() => remove(faq.id)} className="p-1 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 self-start opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={add} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

// ── Category Editor (full page) ───────────────────────────────────────────────
function CategoryEditor({ cat, parentName, onBack, onSave }) {
  const [form, setForm] = useState(cat)
  const [activeTab, setActiveTab] = useState('General')

  const onChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const tabContent = {
    General: <TabGeneral cat={form} onChange={onChange} />,
    Products: <TabProducts cat={form} />,
    Banners: <TabBanners cat={form} onChange={onChange} />,
    SEO: <TabSEO cat={form} onChange={onChange} />,
    FAQs: <TabFAQs cat={form} onChange={onChange} />,
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Categories
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{form.id ? `Edit: ${form.name}` : (parentName ? 'Add Subcategory' : 'Add Category')}</h1>
          {parentName && <p className="text-sm text-text-muted mt-0.5">Under {parentName}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={onBack}>Discard</Button>
          <Button variant="primary" onClick={() => { onSave(form); toast('Category saved', 'success') }}>Save Category</Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div>{tabContent[activeTab]}</div>
    </div>
  )
}

// ── Main Categories list ───────────────────────────────────────────────────────
export function Categories() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [expanded, setExpanded] = useState([1])
  const [editing, setEditing] = useState(null)
  const [editingParentId, setEditingParentId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const dragCat = useRef(null)
  const dragOverCat = useRef(null)
  const dragSub = useRef(null)
  const dragOverSub = useRef(null)
  const dragSubParent = useRef(null)

  const toggle = (id) => setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const onCatDragStart = (idx) => { dragCat.current = idx }
  const onCatDragOver = (e, idx) => { e.preventDefault(); dragOverCat.current = idx }
  const onCatDrop = () => {
    const from = dragCat.current, to = dragOverCat.current
    if (from !== null && to !== null && from !== to) {
      const arr = [...categories]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
      setCategories(arr)
    }
    dragCat.current = null; dragOverCat.current = null
  }

  const onSubDragStart = (parentId, idx) => { dragSubParent.current = parentId; dragSub.current = idx }
  const onSubDragOver = (e, idx) => { e.preventDefault(); dragOverSub.current = idx }
  const onSubDrop = () => {
    const from = dragSub.current, to = dragOverSub.current, parentId = dragSubParent.current
    if (from !== null && to !== null && from !== to) {
      setCategories(prev => prev.map(c => {
        if (c.id !== parentId) return c
        const arr = [...c.subcategories]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
        return { ...c, subcategories: arr }
      }))
    }
    dragSub.current = null; dragOverSub.current = null; dragSubParent.current = null
  }

  const openNew = (parentId = null) => {
    setEditing({ id: null, name: '', slug: '', primary: !parentId, description: '', h1: '', longDesc: '', mainBannerStyle: 'two-banner', mainBanners: [{ id: 1, image: null, title: '', text: '', buttonText: '', buttonUrl: '' }, { id: 2, image: null, title: '', text: '', buttonText: '', buttonUrl: '' }], ctaBanners: [{ id: 1, position: 3, image: null, title: '', text: '', buttonText: '', buttonUrl: '' }, { id: 2, position: 7, image: null, title: '', text: '', buttonText: '', buttonUrl: '' }], seo: { metaTitle: '', metaDescription: '', focusKeyword: '' }, faqs: [] })
    setEditingParentId(parentId)
  }

  const openEdit = (cat, parentId = null) => {
    setEditing({ ...cat })
    setEditingParentId(parentId)
  }

  const handleSave = (updated) => {
    if (editingParentId) {
      if (updated.id) {
        setCategories(prev => prev.map(c => ({ ...c, subcategories: c.subcategories.map(s => s.id === updated.id ? updated : s) })))
      } else {
        setCategories(prev => prev.map(c => c.id === editingParentId ? { ...c, subcategories: [...c.subcategories, { ...updated, id: Date.now() }] } : c))
      }
    } else {
      if (updated.id) {
        setCategories(prev => prev.map(c => c.id === updated.id ? { ...updated, subcategories: c.subcategories } : c))
      } else {
        setCategories(prev => [...prev, { ...updated, id: Date.now(), productCount: 0, subcategories: [] }])
      }
    }
    setEditing(null)
    setEditingParentId(null)
  }

  const handleDelete = () => {
    if (deleteTarget.parentId) {
      setCategories(prev => prev.map(c => ({ ...c, subcategories: c.subcategories.filter(s => s.id !== deleteTarget.id) })))
    } else {
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
    }
    toast('Category deleted', 'success')
    setDeleteTarget(null)
  }

  if (editing) {
    const parentName = editingParentId ? categories.find(c => c.id === editingParentId)?.name : null
    return (
      <CategoryEditor
        cat={editing}
        parentName={parentName}
        onBack={() => { setEditing(null); setEditingParentId(null) }}
        onSave={handleSave}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        subtitle="Manage product categories and subcategories"
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => openNew()}>Add Category</Button>}
      />

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        {categories.map((cat, ci) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => onCatDragStart(ci)}
            onDragOver={e => onCatDragOver(e, ci)}
            onDrop={onCatDrop}
            className={ci > 0 ? 'border-t border-border' : ''}
          >
            <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-grey-50 transition-colors group">
              <GripVertical className="w-4 h-4 text-text-muted shrink-0 cursor-grab" />
              <button onClick={() => toggle(cat.id)} className="flex items-center gap-2 flex-1 text-left min-w-0">
                <ChevronRight className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${expanded.includes(cat.id) ? 'rotate-90' : ''}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{cat.name}</span>
                    <Badge variant="grey" label="Primary" />
                    <span className="text-xs text-text-muted">{cat.productCount} products</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{cat.description}</p>
                </div>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openNew(cat.id)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50" title="Add subcategory"><Plus className="w-4 h-4" /></button>
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget({ ...cat, parentId: null })} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {expanded.includes(cat.id) && cat.subcategories.map((sub, si) => (
              <div
                key={sub.id}
                draggable
                onDragStart={() => onSubDragStart(cat.id, si)}
                onDragOver={e => onSubDragOver(e, si)}
                onDrop={onSubDrop}
                className="flex items-center gap-3 pl-14 pr-5 py-2.5 border-t border-border bg-grey-50/50 hover:bg-grey-50 transition-colors group"
              >
                <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0 cursor-grab" />
                <p className="flex-1 text-sm text-text-primary">{sub.name}</p>
                <p className="text-xs text-text-muted">/{sub.slug}</p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(sub, cat.id)} className="p-1.5 rounded-md text-text-muted hover:text-brand-500 hover:bg-brand-50"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget({ ...sub, parentId: cat.id })} className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete category" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" destructive />
    </div>
  )
}
