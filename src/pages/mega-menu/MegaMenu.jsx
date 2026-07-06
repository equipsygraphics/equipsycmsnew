import { useState, useRef } from 'react'
import {
  Menu, X, ChevronRight, ChevronLeft, Eye, EyeOff, GripVertical,
  Plus, Trash2, Monitor, Settings2, Wrench, Search, BookOpen, Smartphone,
  ShoppingCart, User, ClipboardList, Edit2, ArrowLeft, Tag, FileText, Zap,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea, Toggle, Select } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockBlogPosts, mockPages } from '../../data/mockContent'
import { mockCategories } from '../../data/mockCategories'
import { mockProducts } from '../../data/mockProducts'
import { MediaLibraryModal } from '../../components/ui/MediaLibraryModal'
import {
  mockTags,
  mockCategoryTagLinks as INITIAL_CAT_LINKS,
  mockContentTagLinks as INITIAL_CONTENT_LINKS,
  getRelatedContent, getCategoryTagIds, computeTagUsage,
} from '../../data/mockTagging'

// ── Initial data ──────────────────────────────────────────────────────────────
const INITIAL_NAV_LINKS = [
  { id: 1, pageId: 7,  label: 'Ramp Calculator',    color: 'brand',   visible: true },
  { id: 2, pageId: 9,  label: 'Accessible Bathroom', color: 'default', visible: true },
  { id: 3, pageId: 5,  label: 'Builder Pack',         color: 'default', visible: true },
  { id: 4, pageId: 10, label: 'Trade Account',        color: 'default', visible: true },
  { id: 5, pageId: 11, label: 'Clearance Sale',       color: 'red',     visible: true },
]

const INITIAL_CATEGORIES = mockCategories
  .filter(c => c.primary)
  .map(c => ({
    ...c,
    visible: true,
    subcategories: c.subcategories.map(s => ({
      ...s,
      desc: s.description || '',
      visible: true,
    })),
  }))

const NAV_LINK_COLOR_CLASS = {
  default: 'text-[#1F2A37]',
  brand:   'text-[#04619A]',
  red:     'text-[#B42318]',
}

// ── Shared style ──────────────────────────────────────────────────────────────
const checkerStyle = {
  backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0,0 6px,6px -6px,-6px 0px',
  backgroundColor: '#f9fafb',
}

// ── Reusable UI helpers ───────────────────────────────────────────────────────
function BannerImagePicker({ value, onChange, hint }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        className="relative w-full h-28 rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-brand-300 transition-colors"
        style={value ? {} : checkerStyle}
        onClick={() => setOpen(true)}
      >
        {value
          ? <img src={value} className="w-full h-full object-cover" alt="" />
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
      {hint && <p className="text-[10px] text-text-muted mt-1">{hint}</p>}
      <MediaLibraryModal open={open} onClose={() => setOpen(false)} onSelect={items => { onChange(items[0]?.url ?? null); setOpen(false) }} />
    </>
  )
}

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

// ── Banner preview components ─────────────────────────────────────────────────
function BannerPreview({ banner }) {
  const bgColor = banner.bgColor ?? '#A15C07'
  return (
    <div className="rounded-2xl overflow-hidden flex h-40 shadow-sm border border-[#E5E7EB]">
      <div className="w-1/2 shrink-0 overflow-hidden" style={banner.image ? {} : checkerStyle}>
        {banner.image ? <img src={banner.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No image</div>}
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4 px-6 py-6" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-col gap-2">
          <p className="text-white font-semibold text-base leading-snug line-clamp-2">{banner.title || <span className="opacity-40">Banner title</span>}</p>
          <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{banner.text || <span className="opacity-40">Banner description text</span>}</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-white text-[#1F2A37] text-xs font-semibold px-4 py-2.5 rounded-lg border border-[#E5E7EB] shadow-sm w-fit whitespace-nowrap">
          {banner.buttonText || 'Find out more'}<ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}

function SingleBannerPreview({ banner }) {
  const bgColor = banner.bgColor ?? '#FAC515'
  return (
    <div className="w-full rounded-2xl overflow-hidden flex items-center gap-6 px-8 py-5 shadow-sm border border-[#E5E7EB]" style={{ backgroundColor: bgColor }}>
      <div className="w-28 h-20 shrink-0 overflow-hidden" style={banner.image ? {} : checkerStyle}>
        {banner.image ? <img src={banner.image} className="w-full h-full object-contain" alt="" /> : <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">No image</div>}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="font-semibold text-base text-[#0D121C] leading-snug line-clamp-1">{banner.title || <span className="opacity-40">Banner title</span>}</p>
        <p className="text-sm text-[#374151] line-clamp-2">{banner.text || <span className="opacity-40">Description text</span>}</p>
      </div>
      <span className="inline-flex items-center bg-white text-[#1F2A37] text-sm font-semibold px-4 py-2.5 rounded-lg border border-[#E5E7EB] shadow-sm whitespace-nowrap shrink-0">
        {banner.buttonText || 'Find out more'}
      </span>
    </div>
  )
}

function CtaBannerPreview({ banner }) {
  const bgColor = banner.bgColor ?? '#CA8504'
  return (
    <div className="w-44 rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] flex flex-col">
      <div className="h-36 shrink-0 overflow-hidden" style={banner.image ? {} : checkerStyle}>
        {banner.image ? <img src={banner.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">No image</div>}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1 justify-between" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-col gap-1.5">
          <p className="text-white font-semibold text-sm leading-snug line-clamp-3">{banner.title || <span className="opacity-40">Banner title</span>}</p>
          <p className="text-white/80 text-xs leading-relaxed line-clamp-3">{banner.text || <span className="opacity-40">Description</span>}</p>
        </div>
        <span className="inline-flex items-center justify-center gap-1.5 bg-white text-[#1F2A37] text-xs font-semibold px-3 py-2 rounded-lg border border-[#E5E7EB] shadow-sm w-full">
          {banner.buttonText || 'Find out more'}<ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}

// ── Banner constants ───────────────────────────────────────────────────────────
const EMPTY_BANNER = { image: null, title: '', text: '', buttonText: '', buttonUrl: '' }
const CTA_MAX = 3
const CTA_DEFAULT_POSITIONS = [3, 7, 12]
const BANNER_STYLES = [
  { value: 'two-banner', label: '2-Banner', description: 'Two split banners — image left, content right' },
  { value: 'one-banner', label: '1-Banner', description: 'Single wide strip — image, text, and button' },
]

// ── Category editor tab components ────────────────────────────────────────────
function CatTabGeneral({ item, onChange, isSubcategory = false }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-primary">General</h3>
        <Field label="Category Name" required>
          <Input value={item.name ?? ''} onChange={e => onChange('name', e.target.value)} />
        </Field>
        <Field label="H1 / Main Heading">
          <Input value={item.h1 ?? ''} onChange={e => onChange('h1', e.target.value)} placeholder="e.g. Grab Rails & Safety Handles" />
        </Field>
        <Field label="URL Slug">
          <div className="flex items-center">
            <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">/</span>
            <Input value={item.slug ?? ''} onChange={e => onChange('slug', e.target.value)} className="rounded-l-none" />
          </div>
        </Field>
        {!isSubcategory && (
          <Toggle checked={item.primary ?? false} onChange={v => onChange('primary', v)} label="Primary Category" description="Appears as top-level in navigation and mega menu" />
        )}
      </div>
      <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Description</h3>
        <Field label="Short Description">
          <Textarea value={item.description ?? ''} onChange={e => { onChange('description', e.target.value); if (isSubcategory) onChange('desc', e.target.value) }} rows={2} />
        </Field>
        <Field label="Long Description">
          <Textarea value={item.longDesc ?? ''} onChange={e => onChange('longDesc', e.target.value)} rows={5} placeholder="Extended category page description…" />
        </Field>
      </div>
    </div>
  )
}

function CatTabProducts({ item }) {
  const products = mockProducts.filter(p => p.category?.toLowerCase() === item.name?.toLowerCase())
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Products in this Category</h3>
      </div>
      {products.length === 0
        ? <p className="text-sm text-text-muted py-8 text-center">No products assigned to this category yet.</p>
        : products.map(p => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-text-primary">{p.name}</p>
              <p className="text-xs text-text-muted">{p.sku} · {p.type}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">${p.price}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'published' ? 'bg-success-50 text-success-600' : 'bg-grey-100 text-text-muted'}`}>{p.status}</span>
            </div>
          </div>
        ))
      }
    </div>
  )
}

function CatTabBanners({ item, onChange }) {
  const bannerStyle = item.mainBannerStyle ?? 'two-banner'
  const bannerCount = bannerStyle === 'one-banner' ? 1 : 2

  const ensureBanners = (arr, n) => {
    const result = [...(arr ?? [])]
    while (result.length < n) result.push({ id: Date.now() + result.length, ...EMPTY_BANNER })
    return result.slice(0, n)
  }

  const mainBanners = ensureBanners(item.mainBanners, bannerCount)
  const ctaBanners = item.ctaBanners ?? []

  const updateMain = (idx, field, value) =>
    onChange('mainBanners', mainBanners.map((b, i) => i === idx ? { ...b, [field]: value } : b))

  const addCta = () => {
    if (ctaBanners.length >= CTA_MAX) return
    const usedPositions = ctaBanners.map(b => b.position)
    const nextPos = CTA_DEFAULT_POSITIONS.find(p => !usedPositions.includes(p)) ?? (Math.max(...usedPositions, 2) + 4)
    onChange('ctaBanners', [...ctaBanners, { id: Date.now(), position: nextPos, ...EMPTY_BANNER }])
  }
  const removeCta = (idx) => onChange('ctaBanners', ctaBanners.filter((_, i) => i !== idx))
  const updateCta = (idx, field, value) =>
    onChange('ctaBanners', ctaBanners.map((b, i) => i === idx ? { ...b, [field]: value } : b))

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border p-4 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-text-primary">Main Banners</h3>
        <div className="flex gap-3">
          {BANNER_STYLES.map(s => (
            <button key={s.value} type="button" onClick={() => onChange('mainBannerStyle', s.value)}
              className={`flex-1 flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-colors ${bannerStyle === s.value ? 'border-brand-500 bg-brand-50' : 'border-border bg-white hover:border-brand-200'}`}>
              <span className={`text-sm font-semibold ${bannerStyle === s.value ? 'text-brand-600' : 'text-text-primary'}`}>{s.label}</span>
              <span className="text-xs text-text-muted">{s.description}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-8">
          {mainBanners.map((b, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              {bannerCount > 1 && <p className="text-sm font-semibold text-text-primary">Banner {idx + 1}</p>}
              {bannerStyle === 'one-banner' ? <SingleBannerPreview banner={b} /> : <BannerPreview banner={b} />}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title"><Input value={b.title} onChange={e => updateMain(idx, 'title', e.target.value)} placeholder="e.g. Shop Grab Rails" /></Field>
                <Field label="Text"><Input value={b.text} onChange={e => updateMain(idx, 'text', e.target.value)} placeholder="e.g. Safety for every bathroom" /></Field>
                <Field label="Button Text"><Input value={b.buttonText} onChange={e => updateMain(idx, 'buttonText', e.target.value)} placeholder="e.g. Find out more" /></Field>
                <Field label="Button URL"><Input value={b.buttonUrl} onChange={e => updateMain(idx, 'buttonUrl', e.target.value)} placeholder="/products?category=…" /></Field>
              </div>
              <Field label="Banner Image"><BannerImagePicker value={b.image} onChange={v => updateMain(idx, 'image', v)} hint={bannerStyle === 'one-banner' ? '800×400px recommended' : '1200×600px per banner recommended'} /></Field>
              <ColorPicker label="Background Colour" value={b.bgColor ?? (bannerStyle === 'one-banner' ? '#FAC515' : '#A15C07')} onChange={v => updateMain(idx, 'bgColor', v)} />
              {idx < bannerCount - 1 && <div className="border-t border-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">CTA Banners</h3>
          <p className="text-xs text-text-muted mt-0.5">Shown between product cards in the category grid. Optional — up to 3.</p>
        </div>
        <div className="flex flex-col gap-8">
          {ctaBanners.map((b, idx) => (
            <div key={b.id ?? idx} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">CTA Banner {idx + 1}</p>
                <button type="button" onClick={() => removeCta(idx)} className="flex items-center gap-1.5 text-xs text-error-500 hover:text-error-600 font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
              <div className="flex gap-6 items-start">
                <CtaBannerPreview banner={b} />
                <div className="flex-1 flex flex-col gap-3">
                  <Field label="Position in grid" hint="Which slot in the product grid this banner occupies">
                    <Input type="number" min={1} value={b.position} onChange={e => updateCta(idx, 'position', Number(e.target.value))} className="w-24" />
                  </Field>
                  <Field label="Title"><Input value={b.title} onChange={e => updateCta(idx, 'title', e.target.value)} placeholder="e.g. Can't find what you need?" /></Field>
                  <Field label="Text"><Input value={b.text} onChange={e => updateCta(idx, 'text', e.target.value)} placeholder="e.g. We'll build it to your specs." /></Field>
                  <Field label="Button Text"><Input value={b.buttonText} onChange={e => updateCta(idx, 'buttonText', e.target.value)} placeholder="e.g. Find out more" /></Field>
                  <Field label="Button URL"><Input value={b.buttonUrl} onChange={e => updateCta(idx, 'buttonUrl', e.target.value)} placeholder="/contact" /></Field>
                  <ColorPicker label="Background Colour" value={b.bgColor ?? '#CA8504'} onChange={v => updateCta(idx, 'bgColor', v)} />
                </div>
              </div>
              <Field label="Banner Image"><BannerImagePicker value={b.image} onChange={v => updateCta(idx, 'image', v)} hint="600×750px recommended (portrait)" /></Field>
              {idx < ctaBanners.length - 1 && <div className="border-t border-border" />}
            </div>
          ))}
          {ctaBanners.length === 0 && <p className="text-sm text-text-muted text-center py-2">No CTA banners added. They are optional.</p>}
        </div>
        {ctaBanners.length < CTA_MAX && (
          <button type="button" onClick={addCta} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium">
            <Plus className="w-4 h-4" /> Add CTA Banner {ctaBanners.length > 0 ? `(${ctaBanners.length}/${CTA_MAX})` : ''}
          </button>
        )}
      </div>
    </div>
  )
}

function CatTabSEO({ item, onChange }) {
  const seo = item.seo ?? { metaTitle: '', metaDescription: '', focusKeyword: '' }
  const update = (field, value) => onChange('seo', { ...seo, [field]: value })
  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text-primary">SEO</h3>
      <Field label="Meta Title">
        <Input value={seo.metaTitle} onChange={e => update('metaTitle', e.target.value)} placeholder={`${item.name} | Equipsy`} />
      </Field>
      <Field label="Meta Description">
        <Textarea value={seo.metaDescription} onChange={e => update('metaDescription', e.target.value)} rows={3} placeholder="Brief description for search engines…" />
      </Field>
      <Field label="Focus Keyword">
        <Input value={seo.focusKeyword} onChange={e => update('focusKeyword', e.target.value)} placeholder="e.g. grab rails australia" />
      </Field>
    </div>
  )
}

function CatTabFAQs({ item, onChange }) {
  const faqs = item.faqs ?? []
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const add = () => onChange('faqs', [...faqs, { id: Date.now(), question: '', answer: '' }])
  const remove = (id) => onChange('faqs', faqs.filter(f => f.id !== id))
  const update = (id, field, value) => onChange('faqs', faqs.map(f => f.id === id ? { ...f, [field]: value } : f))

  const onDragStart = idx => { dragIdx.current = idx }
  const onDragOver = (e, idx) => { e.preventDefault(); dragOverIdx.current = idx }
  const onDrop = () => {
    const from = dragIdx.current, to = dragOverIdx.current
    if (from !== null && to !== null && from !== to) {
      const arr = [...faqs]; const [it] = arr.splice(from, 1); arr.splice(to, 0, it)
      onChange('faqs', arr)
    }
    dragIdx.current = null; dragOverIdx.current = null
  }

  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">FAQs</h3>
        <p className="text-xs text-text-muted mt-0.5">Frequently asked questions shown on the category page.</p>
      </div>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <div key={faq.id} draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)} onDrop={onDrop}
            className="border border-border rounded-lg p-4 flex gap-3 group cursor-grab active:cursor-grabbing">
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
    </div>
  )
}

// ── CatTabTags ────────────────────────────────────────────────────────────────
function CatTabTags({ categoryId, categoryTagLinks, setCategoryTagLinks }) {
  const [tagSearch, setTagSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const linkedTagIds = categoryTagLinks.filter(l => l.categoryId === categoryId).map(l => l.tagId)
  const linkedTags = mockTags.filter(t => linkedTagIds.includes(t.id))

  const removeTag = (tagId) => {
    setCategoryTagLinks(prev => prev.filter(l => !(l.categoryId === categoryId && l.tagId === tagId)))
    toast('Tag unlinked from category', 'success')
  }

  const addTag = (tagId) => {
    if (linkedTagIds.includes(tagId)) return
    setCategoryTagLinks(prev => [...prev, { categoryId, tagId, weight: 5 }])
    setTagSearch('')
    toast('Tag linked to category', 'success')
  }

  const availableTags = mockTags.filter(t =>
    !linkedTagIds.includes(t.id) &&
    (!tagSearch || t.name.toLowerCase().includes(tagSearch.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Linked Tags</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Content tagged with any of these will auto-populate the Related Content panel in the mega menu.
          </p>
        </div>

        {linkedTags.length === 0 ? (
          <p className="text-xs text-text-muted italic py-2">No tags linked yet. Add tags below to enable auto-populated related content.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {linkedTags.map(tag => {
              const usage = computeTagUsage(tag.id)
              return (
                <div key={tag.id} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-brand-50 border border-brand-200 rounded-full group">
                  <Tag className="w-3 h-3 text-brand-500 shrink-0" />
                  <span className="text-xs font-medium text-brand-700">{tag.name}</span>
                  <span className="text-[10px] text-brand-400">{usage.total}</span>
                  <button onClick={() => removeTag(tag.id)} className="w-4 h-4 flex items-center justify-center rounded-full text-brand-400 hover:text-error-500 hover:bg-error-50 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={() => setPickerOpen(v => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2.5 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-50 transition-colors w-fit"
        >
          <Plus className="w-3.5 h-3.5" /> Add Tag
        </button>

        {pickerOpen && (
          <div className="rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-grey-50">
              <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                autoFocus
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
                placeholder="Search tags…"
                className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
              />
              {tagSearch && <button onClick={() => setTagSearch('')} className="text-text-muted hover:text-text-primary"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <div className="max-h-44 overflow-y-auto">
              {availableTags.length === 0
                ? <p className="text-xs text-text-muted text-center py-5">{tagSearch ? 'No matching tags' : 'All tags already linked'}</p>
                : availableTags.map(tag => {
                    const usage = computeTagUsage(tag.id)
                    return (
                      <button key={tag.id} onClick={() => addTag(tag.id)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-grey-50 transition-colors text-left border-b border-border last:border-0">
                        <Tag className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                        <span className="flex-1 text-sm text-text-primary">{tag.name}</span>
                        {usage.total > 0 && <span className="text-xs text-text-muted">{usage.total} items</span>}
                      </button>
                    )
                  })
              }
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 flex gap-3">
        <Zap className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-brand-700">How auto-population works</p>
          <p className="text-xs text-brand-600 mt-0.5 leading-relaxed">
            Articles and pages tagged with any of the above will automatically appear in the mega menu's Related Content column when a customer browses this category. Featured items surface first. Manage tags globally under <strong>Content › Tags</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── CatTabRelatedContent ──────────────────────────────────────────────────────
const CONTENT_TYPE_META = {
  article: { label: 'Articles', Icon: BookOpen, color: 'text-[#04619A]', bg: 'bg-[#EFF8FF]' },
  page:    { label: 'Pages',    Icon: FileText,  color: 'text-warning-600', bg: 'bg-warning-50' },
}

function resolveContent(contentType, contentId) {
  if (contentType === 'article') return mockBlogPosts.find(p => p.id === contentId)
  return mockPages.find(p => p.id === contentId)
}

const MAX_RELATED = 3

function CatTabRelatedContent({ categoryId, categoryTagLinks, contentTagLinks, items, setItems }) {
  const [dropOpen, setDropOpen] = useState(false)
  const [dropSearch, setDropSearch] = useState('')
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const related = getRelatedContent(categoryId, { categoryTagLinks, contentTagLinks })
  const autoSeed = [...related.articles, ...related.pages]
    .slice(0, MAX_RELATED)
    .map(({ contentType, contentId }) => ({ contentType, contentId }))

  const isAuto = items === undefined
  const displayItems = isAuto ? autoSeed : items

  const displayKeys = new Set(displayItems.map(r => `${r.contentType}:${r.contentId}`))
  const allOptions = [
    ...mockBlogPosts.map(p => ({ contentType: 'article', contentId: p.id })),
    ...mockPages.map(p => ({ contentType: 'page', contentId: p.id })),
  ]
  const dropOptions = allOptions.filter(item => !displayKeys.has(`${item.contentType}:${item.contentId}`))
  const filteredOptions = dropSearch
    ? dropOptions.filter(item => {
        const content = resolveContent(item.contentType, item.contentId)
        return content?.title.toLowerCase().includes(dropSearch.toLowerCase())
      })
    : dropOptions

  const removeItem = idx => setItems(displayItems.filter((_, i) => i !== idx))

  const addItem = (contentType, contentId) => {
    if (displayItems.length >= MAX_RELATED) return
    setItems([...displayItems, { contentType, contentId }])
    setDropSearch('')
    setDropOpen(false)
  }

  const onDragStart = idx => { dragIdx.current = idx }
  const onDragOver = (e, idx) => { e.preventDefault(); dragOverIdx.current = idx }
  const onDrop = () => {
    const from = dragIdx.current, to = dragOverIdx.current
    if (from !== null && to !== null && from !== to) {
      const arr = [...displayItems]; const [it] = arr.splice(from, 1); arr.splice(to, 0, it)
      setItems(arr)
    }
    dragIdx.current = null; dragOverIdx.current = null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuto
            ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded"><Zap className="w-2.5 h-2.5" />Auto</span>
            : <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning-600 bg-warning-50 border border-warning-200 px-1.5 py-0.5 rounded"><Edit2 className="w-2.5 h-2.5" />Custom</span>
          }
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${displayItems.length >= MAX_RELATED ? 'text-error-500 bg-error-50' : 'text-text-muted bg-grey-100'}`}>
            {displayItems.length}/{MAX_RELATED}
          </span>
        </div>
        {!isAuto && (
          <button onClick={() => { setItems(undefined); setDropOpen(false) }}
            className="text-[10px] text-brand-500 hover:text-brand-600 font-medium">
            Reset to auto
          </button>
        )}
      </div>

      {displayItems.length === 0 && (
        <div className="rounded-xl border border-border p-5 flex flex-col items-center gap-2 text-center">
          <Tag className="w-5 h-5 text-text-muted" />
          <p className="text-xs text-text-muted">No related content. Link tags in the Tags tab or add items below.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {displayItems.map((item, idx) => {
          const content = resolveContent(item.contentType, item.contentId)
          if (!content) return null
          const meta = CONTENT_TYPE_META[item.contentType]
          const Icon = meta.Icon
          return (
            <div key={`${item.contentType}-${item.contentId}`}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDrop={onDrop}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-surface cursor-grab active:cursor-grabbing group hover:bg-grey-50 transition-colors">
              <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2">{content.title}</p>
                {'slug' in content && <p className="text-[10px] text-text-muted font-mono mt-0.5">{content.slug}</p>}
                {'category' in content && <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${meta.bg} ${meta.color}`}>{content.category}</span>}
              </div>
              <button onClick={() => removeItem(idx)} title="Remove"
                className="p-1 rounded text-text-muted hover:text-error-500 hover:bg-error-50 transition-colors shrink-0 mt-0.5 opacity-0 group-hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <button
            disabled={displayItems.length >= MAX_RELATED}
            onClick={() => { setDropOpen(v => !v); setDropSearch('') }}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors w-full justify-center ${
              displayItems.length >= MAX_RELATED
                ? 'text-text-muted border-border bg-grey-50 cursor-not-allowed opacity-60'
                : 'text-brand-600 hover:text-brand-700 border-brand-200 hover:bg-brand-50'
            }`}>
            <Plus className="w-3.5 h-3.5" /> Add Content Manually
          </button>

          {dropOpen && displayItems.length < MAX_RELATED && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 rounded-xl border border-border shadow-lg bg-surface overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-grey-50">
                <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <input autoFocus value={dropSearch} onChange={e => setDropSearch(e.target.value)}
                  placeholder="Search articles and pages…"
                  className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted" />
                {dropSearch && <button onClick={() => setDropSearch('')}><X className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" /></button>}
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0
                  ? <p className="text-xs text-text-muted text-center py-5">{dropSearch ? 'No matching content' : 'All content already added'}</p>
                  : filteredOptions.map(item => {
                      const content = resolveContent(item.contentType, item.contentId)
                      if (!content) return null
                      const meta = CONTENT_TYPE_META[item.contentType]
                      const Icon = meta.Icon
                      return (
                        <button key={`opt-${item.contentType}-${item.contentId}`}
                          onClick={() => addItem(item.contentType, item.contentId)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-grey-50 transition-colors text-left border-b border-border last:border-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${meta.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">{content.title}</p>
                            {'slug' in content && <p className="text-[10px] text-text-muted font-mono">{content.slug}</p>}
                          </div>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${meta.bg} ${meta.color}`}>{meta.label.replace(/s$/, '')}</span>
                        </button>
                      )
                    })
                }
              </div>
            </div>
          )}
        </div>
        {displayItems.length >= MAX_RELATED
          ? <p className="text-[10px] text-text-muted text-center">Maximum of {MAX_RELATED} items reached — remove one to add another.</p>
          : <p className="text-[10px] text-text-muted text-center">{MAX_RELATED - displayItems.length} slot{MAX_RELATED - displayItems.length !== 1 ? 's' : ''} remaining</p>
        }
      </div>
    </div>
  )
}

// ── Live Menu tab ─────────────────────────────────────────────────────────────
function LiveMenuTab({ navLinks, categories, categoryTagLinks, contentTagLinks, categoryManualContent }) {
  const [viewMode, setViewMode] = useState('desktop')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCatId, setActiveCatId] = useState(null)
  const [mobileView, setMobileView] = useState('closed')
  const [mobileCatId, setMobileCatId] = useState(null)

  const visibleCats = categories.filter(c => c.visible)
  const visibleLinks = navLinks.filter(l => l.visible)

  const switchView = (mode) => { setViewMode(mode); setMenuOpen(false); setMobileView('closed'); setMobileCatId(null) }
  const activeCat = categories.find(c => c.id === activeCatId) ?? visibleCats[0]

  const getAutoContent = (catId) => {
    if (!catId) return { articles: [], pages: [] }
    return getRelatedContent(catId, { categoryTagLinks, contentTagLinks })
  }

  const autoContent = getAutoContent(activeCat?.id)
  const overrideItems = (categoryManualContent ?? {})[activeCat?.id]
  const allDisplayItems = overrideItems !== undefined
    ? overrideItems
    : [...autoContent.articles, ...autoContent.pages]
        .slice(0, MAX_RELATED)
        .map(r => ({ contentType: r.contentType, contentId: r.contentId }))

  const displayResources = allDisplayItems.filter(r => r.contentType === 'page').slice(0, 2)
  const displayArticles = allDisplayItems.filter(r => r.contentType === 'article').slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Click <strong>{viewMode === 'desktop' ? 'Our Products' : 'the hamburger'}</strong> to expand. Related content is auto-populated via tags.
        </p>
        <div className="flex items-center gap-1 bg-grey-100 p-1 rounded-lg">
          <button onClick={() => switchView('desktop')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'desktop' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button onClick={() => switchView('mobile')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'mobile' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>
      </div>

      {viewMode === 'desktop' && (
        <div className="rounded-xl border border-border overflow-hidden shadow-card">
          <div className="bg-grey-100 border-b border-border px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" /><div className="w-3 h-3 rounded-full bg-[#FFBD2E]" /><div className="w-3 h-3 rounded-full bg-[#28CA41]" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-text-muted border border-border">https://equipsy.com.au</div>
          </div>
          <div className="bg-white border-b border-[#D2D6DB] flex items-center">
            <button onClick={() => setMenuOpen(o => !o)} className={`flex items-center gap-2 px-8 py-5 border-r border-[#D2D6DB] font-bold text-base text-[#1F2A37] hover:bg-grey-50 transition-colors shrink-0 ${menuOpen ? 'bg-grey-50' : ''}`}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />} Our Products
            </button>
            <div className="flex items-center gap-1 px-4 flex-wrap">
              {visibleLinks.map(link => (
                <span key={link.id} className={`px-[18px] py-[10px] rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-grey-50 transition-colors ${NAV_LINK_COLOR_CLASS[link.color] ?? NAV_LINK_COLOR_CLASS.default}`}>{link.label}</span>
              ))}
            </div>
          </div>
          {menuOpen && (
            <div className="bg-white border-b border-[#D2D6DB] flex" style={{ minHeight: 360 }}>
              <div className="w-56 border-r border-[#D2D6DB] py-4 shrink-0">
                <p className="px-5 pb-3 font-bold text-[15px] text-[#1F2A37]">Our Products</p>
                <div className="flex flex-col">
                  {visibleCats.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCatId(cat.id)}
                      className={`flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-colors w-full ${activeCat?.id === cat.id ? 'bg-[#EFF8FF] text-[#04619A] font-semibold' : 'text-[#1F2A37] hover:bg-grey-50'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${activeCat?.id === cat.id ? 'bg-[#04619A]/10 text-[#04619A]' : 'bg-grey-100 text-text-muted'}`}>{cat.name.charAt(0)}</div>
                      <span className="flex-1 leading-snug">{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6 border-r border-[#D2D6DB] min-w-0">
                {activeCat && (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-[15px] text-[#1F2A37]">{activeCat.name}</h3>
                      <span className="text-sm text-[#04619A] font-semibold cursor-pointer hover:underline">View all</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {activeCat.subcategories.filter(s => s.visible).map(sub => (
                        <div key={sub.id} className="cursor-pointer group">
                          <p className="text-sm font-semibold text-[#1F2A37] group-hover:text-[#04619A] transition-colors leading-snug">{sub.name}</p>
                          {sub.desc && <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{sub.desc}</p>}
                        </div>
                      ))}
                      {activeCat.subcategories.filter(s => s.visible).length === 0 && <p className="text-sm text-text-muted italic">No visible subcategories.</p>}
                    </div>
                  </>
                )}
              </div>
              <div className="w-72 p-6 shrink-0">
                <h3 className="font-bold text-[15px] text-[#1F2A37] mb-4">Related Content</h3>
                {displayResources.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-[#1F2A37] mb-2">Tools &amp; Resources</p>
                    <div className="flex flex-col gap-2">
                      {displayResources.map(item => {
                        const content = resolveContent(item.contentType, item.contentId)
                        if (!content) return null
                        return (
                          <div key={`${item.contentType}-${item.contentId}`} className="border-2 border-[#F5C200] rounded-xl p-3 cursor-pointer hover:bg-yellow-50 transition-colors">
                            <div className="flex gap-3">
                              <div className="w-14 h-10 bg-[#FEF9C3] rounded-lg shrink-0 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-[#CA8504]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#1F2A37] leading-snug">{content.title}</p>
                                <p className="text-[11px] text-[#6B7280] mt-0.5 font-mono">{content.slug}</p>
                                <span className="text-[11px] text-[#04619A] font-semibold mt-1 inline-flex items-center gap-0.5">Visit page <ChevronRight className="w-3 h-3" /></span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {displayArticles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#1F2A37]">Blog</p>
                      <span className="text-[11px] text-[#04619A] font-semibold cursor-pointer hover:underline">View all</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {displayArticles.map(item => {
                        const post = resolveContent('article', item.contentId)
                        if (!post) return null
                        return (
                          <div key={item.contentId} className="flex gap-3 cursor-pointer group">
                            <div className="w-16 h-11 bg-grey-100 rounded-lg shrink-0" />
                            <div className="min-w-0">
                              <span className="inline-block text-[10px] font-semibold text-[#04619A] bg-[#EFF8FF] px-1.5 py-0.5 rounded mb-1">{post.category}</span>
                              <p className="text-xs font-semibold text-[#1F2A37] leading-snug group-hover:text-[#04619A] transition-colors line-clamp-2">{post.title}</p>
                              <span className="text-[11px] text-[#04619A] font-semibold mt-0.5 inline-flex items-center gap-0.5">Read more <ChevronRight className="w-3 h-3" /></span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {displayResources.length === 0 && displayArticles.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <Tag className="w-5 h-5 text-text-muted" />
                    <p className="text-xs text-text-muted italic">No related content. Link tags to this category to auto-populate this panel.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {!menuOpen && <div className="h-24 bg-grey-50 flex items-center justify-center"><p className="text-xs text-text-muted">Page content area</p></div>}
        </div>
      )}

      {viewMode === 'mobile' && (() => {
        const mobileCat = categories.find(c => c.id === mobileCatId)
        const mobileAutoContent = getAutoContent(mobileCat?.id)
        const mobileOverride = (categoryManualContent ?? {})[mobileCat?.id]
        const mobileAllItems = mobileOverride !== undefined
          ? mobileOverride
          : [...mobileAutoContent.articles, ...mobileAutoContent.pages]
              .slice(0, MAX_RELATED)
              .map(r => ({ contentType: r.contentType, contentId: r.contentId }))
        const mobileResources = mobileAllItems.filter(r => r.contentType === 'page').slice(0, 3)
        const mobileArticles = mobileAllItems.filter(r => r.contentType === 'article').slice(0, 3)
        return (
          <div className="flex justify-center">
            <div className="w-[390px] rounded-[2.5rem] border-[6px] border-[#1F2A37] overflow-hidden shadow-2xl bg-white" style={{ minHeight: 700 }}>
              <div className={`px-6 pt-3 pb-1 flex items-center justify-between ${mobileView === 'closed' ? 'bg-[#1B9EEB]' : 'bg-white border-b border-[#E5E7EB]'}`}>
                <span className={`text-[11px] font-semibold ${mobileView === 'closed' ? 'text-white' : 'text-[#1F2A37]'}`}>9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5 items-end h-3">
                    {[2,3,4,5].map(h => <div key={h} className={`w-1 rounded-sm ${mobileView === 'closed' ? 'bg-white' : 'bg-[#1F2A37]'}`} style={{ height: h * 2.5 }} />)}
                  </div>
                  <svg className={`w-3.5 h-3.5 ${mobileView === 'closed' ? 'text-white' : 'text-[#1F2A37]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1.5 8.5A13 13 0 0 1 22.5 8.5M5 12a10 10 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h.01"/></svg>
                  <svg className="w-4 h-3.5" viewBox="0 0 25 13" fill="none">
                    <rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke={mobileView === 'closed' ? 'white' : '#1F2A37'}/>
                    <rect x="2" y="2" width="16" height="9" rx="2" fill={mobileView === 'closed' ? 'white' : '#1F2A37'}/>
                    <path d="M23 4.5v4a2.5 2.5 0 0 0 0-4z" fill={mobileView === 'closed' ? 'white' : '#1F2A37'} opacity=".4"/>
                  </svg>
                </div>
              </div>

              {mobileView === 'closed' ? (
                <div className="bg-[#1B9EEB] px-5 py-3 flex items-center justify-between">
                  <button onClick={() => setMobileView('menu')} className="p-1.5 rounded"><Menu className="w-6 h-6 text-white" /></button>
                  <div className="text-center"><div className="font-black text-white text-lg tracking-wide leading-none">EQUIPSY</div><div className="text-white/70 text-[10px] font-medium tracking-wider">Safer Living</div></div>
                  <div className="flex items-center gap-3"><User className="w-5 h-5 text-white" /><ClipboardList className="w-5 h-5 text-white" /><ShoppingCart className="w-5 h-5 text-white" /></div>
                </div>
              ) : (
                <div className="bg-white px-5 py-4 flex items-center justify-between">
                  {mobileView === 'menu' ? (
                    <><span className="text-xl font-bold text-[#1F2A37]">Menu</span><button onClick={() => setMobileView('closed')} className="p-1"><X className="w-6 h-6 text-[#1F2A37]" /></button></>
                  ) : mobileView === 'products' ? (
                    <><button onClick={() => setMobileView('menu')} className="p-1 -ml-1"><ChevronLeft className="w-6 h-6 text-[#1B9EEB]" /></button><span className="font-bold text-[#1F2A37] text-base">Our Products</span><div className="w-8" /></>
                  ) : (
                    <><button onClick={() => setMobileView('products')} className="p-1 -ml-1"><ChevronLeft className="w-6 h-6 text-[#1B9EEB]" /></button><span className="font-bold text-[#1F2A37] text-base">{mobileCat?.name}</span><span className="text-[#1B9EEB] text-sm font-semibold cursor-pointer">View all</span></>
                  )}
                </div>
              )}

              <div className="bg-white overflow-y-auto" style={{ maxHeight: 580 }}>
                {mobileView === 'closed' && <div className="h-64 bg-grey-50 flex items-center justify-center"><p className="text-xs text-text-muted">Page content area — tap ☰ to open menu</p></div>}
                {mobileView === 'menu' && (
                  <>
                    <div className="pt-2 pb-1 px-5">
                      <button onClick={() => setMobileView('products')} className="w-full flex items-center justify-between bg-[#1B9EEB] text-white rounded-2xl px-5 py-4 font-bold text-base mb-4">Our Products<ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <div className="border-t border-[#E5E7EB]">
                      {visibleLinks.map(link => {
                        const isRed = link.color === 'red', isBrand = link.color === 'brand'
                        return (
                          <div key={link.id} className="border-b border-[#E5E7EB]">
                            <button className="w-full flex items-center justify-between px-5 py-4">
                              <span className={`text-base font-semibold ${isRed ? 'text-[#C01048]' : isBrand ? 'text-[#1B9EEB]' : 'text-[#1F2A37]'}`}>{link.label}</span>
                              <ChevronRight className={`w-5 h-5 ${isRed ? 'text-[#C01048]' : 'text-[#6B7280]'}`} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 border-t border-[#E5E7EB]">
                      {['About Us', 'Testimonials', 'Contact Us'].map(label => (
                        <div key={label} className="border-b border-[#E5E7EB]">
                          <button className="w-full flex items-center justify-between px-5 py-4">
                            <span className="text-base text-[#6B7280]">{label}</span><ChevronRight className="w-5 h-5 text-[#6B7280]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {mobileView === 'products' && (
                  <div className="border-t border-[#E5E7EB]">
                    {visibleCats.map(cat => (
                      <div key={cat.id} className="border-b border-[#E5E7EB]">
                        <button onClick={() => { setMobileCatId(cat.id); setMobileView('category') }} className="w-full flex items-center gap-4 px-5 py-4">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF8FF] flex items-center justify-center shrink-0"><span className="text-[#1B9EEB] text-sm font-black">{cat.name.charAt(0)}</span></div>
                          <span className="flex-1 text-left text-base font-semibold text-[#1F2A37]">{cat.name}</span>
                          <ChevronRight className="w-5 h-5 text-[#6B7280] shrink-0" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {mobileView === 'category' && mobileCat && (
                  <>
                    <div className="border-t border-[#E5E7EB]">
                      {mobileCat.subcategories.filter(s => s.visible).map(sub => (
                        <div key={sub.id} className="border-b border-[#E5E7EB] px-5 py-4">
                          <p className="font-semibold text-[#1F2A37] text-sm leading-snug">{sub.name}</p>
                          {sub.desc && <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">{sub.desc}</p>}
                        </div>
                      ))}
                      {mobileCat.subcategories.filter(s => s.visible).length === 0 && <div className="px-5 py-6"><p className="text-sm text-text-muted italic">No subcategories configured.</p></div>}
                    </div>
                    {(mobileResources.length > 0 || mobileArticles.length > 0) && (
                      <div className="mt-2 border-t border-[#E5E7EB] px-5 pt-5 pb-4">
                        <p className="font-bold text-[#1F2A37] text-base mb-4">Related Content</p>
                        {mobileResources.map(item => {
                          const content = resolveContent(item.contentType, item.contentId)
                          if (!content) return null
                          return (
                            <div key={`${item.contentType}-${item.contentId}`} className="flex items-center gap-3 py-3 border-b border-[#E5E7EB]">
                              <div className="w-8 h-8 bg-[#FEF9C3] rounded-lg flex items-center justify-center shrink-0"><Wrench className="w-4 h-4 text-[#CA8504]" /></div>
                              <span className="text-sm font-semibold text-[#1F2A37]">{content.title}</span>
                              <ChevronRight className="w-4 h-4 text-[#6B7280] ml-auto shrink-0" />
                            </div>
                          )
                        })}
                        {mobileArticles.map(item => {
                          const post = resolveContent('article', item.contentId)
                          if (!post) return null
                          return (
                            <div key={item.contentId} className="flex items-center gap-3 py-3 border-b border-[#E5E7EB]">
                              <div className="w-8 h-8 bg-grey-100 rounded-lg shrink-0" />
                              <span className="text-sm font-semibold text-[#1F2A37] flex-1 line-clamp-1">{post.title}</span>
                              <ChevronRight className="w-4 h-4 text-[#6B7280] shrink-0" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {mobileResources.length === 0 && mobileArticles.length === 0 && (
                      <div className="px-5 py-5 border-t border-[#E5E7EB] text-center">
                        <p className="text-xs text-text-muted italic">No related content for this category.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ── Structure tab ─────────────────────────────────────────────────────────────
const CAT_TABS = [
  { id: 'related',  label: 'Related Content' },
  { id: 'tags',     label: 'Tags' },
  { id: 'general',  label: 'General' },
  { id: 'banners',  label: 'Banners' },
  { id: 'seo',      label: 'SEO' },
  { id: 'faqs',     label: 'FAQs' },
  { id: 'products', label: 'Products' },
]
const SUB_TABS = [
  { id: 'general',  label: 'General' },
  { id: 'banners',  label: 'Banners' },
  { id: 'seo',      label: 'SEO' },
  { id: 'faqs',     label: 'FAQs' },
  { id: 'products', label: 'Products' },
]

function StructureTab({ navLinks, setNavLinks, categories, setCategories, categoryTagLinks, setCategoryTagLinks, contentTagLinks, categoryManualContent, setCategoryManualContent }) {
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id ?? null)
  const [editingSubId, setEditingSubId] = useState(null)
  const [catPanelTab, setCatPanelTab] = useState('related')
  const [subPanelTab, setSubPanelTab] = useState('general')

  const dragNav = useRef(null); const dragOverNav = useRef(null)
  const dragCat = useRef(null); const dragOverCat = useRef(null)
  const dragSub = useRef(null); const dragOverSub = useRef(null)

  const [navPickerOpen, setNavPickerOpen] = useState(false)
  const [navSearch, setNavSearch] = useState('')

  const selectedCat = categories.find(c => c.id === selectedCatId) ?? null
  const editingSub = editingSubId ? selectedCat?.subcategories.find(s => s.id === editingSubId) ?? null : null

  const updateCat = (field, value) => {
    setCategories(prev => prev.map(c => c.id === selectedCatId ? { ...c, [field]: value } : c))
  }

  const updateSub = (field, value) => {
    setCategories(prev => prev.map(c =>
      c.id === selectedCatId
        ? { ...c, subcategories: c.subcategories.map(s => s.id === editingSubId ? { ...s, [field]: value } : s) }
        : c
    ))
  }

  const selectCategory = (catId) => { setSelectedCatId(catId); setEditingSubId(null) }
  const openSubEditor = (subId) => { setEditingSubId(subId); setSubPanelTab('general') }

  const addNavLinkFromPage = (pageId) => {
    const page = mockPages.find(p => p.id === pageId); if (!page) return
    setNavLinks(prev => [...prev, { id: Date.now(), pageId, label: page.title, color: 'default', visible: true }])
    setNavPickerOpen(false); setNavSearch('')
  }
  const updateNavLink = (id, field, value) => setNavLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  const removeNavLink = (id) => setNavLinks(prev => prev.filter(l => l.id !== id))

  const onNavDragStart = idx => { dragNav.current = idx }
  const onNavDragOver = (e, idx) => { e.preventDefault(); dragOverNav.current = idx }
  const onNavDrop = () => {
    const from = dragNav.current, to = dragOverNav.current
    if (from !== null && to !== null && from !== to) { const arr = [...navLinks]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); setNavLinks(arr) }
    dragNav.current = null; dragOverNav.current = null
  }

  const onCatDragStart = idx => { dragCat.current = idx }
  const onCatDragOver = (e, idx) => { e.preventDefault(); dragOverCat.current = idx }
  const onCatDrop = () => {
    const from = dragCat.current, to = dragOverCat.current
    if (from !== null && to !== null && from !== to) { const arr = [...categories]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); setCategories(arr) }
    dragCat.current = null; dragOverCat.current = null
  }

  const onSubDragStart = idx => { dragSub.current = idx }
  const onSubDragOver = (e, idx) => { e.preventDefault(); dragOverSub.current = idx }
  const onSubDrop = () => {
    const from = dragSub.current, to = dragOverSub.current
    if (from !== null && to !== null && from !== to) {
      setCategories(prev => prev.map(c => {
        if (c.id !== selectedCatId) return c
        const arr = [...c.subcategories]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
        return { ...c, subcategories: arr }
      }))
    }
    dragSub.current = null; dragOverSub.current = null
  }

  const toggleCatVisible = catId => setCategories(prev => prev.map(c => c.id === catId ? { ...c, visible: !c.visible } : c))
  const toggleSubVisible = (catId, subId) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: c.subcategories.map(s => s.id === subId ? { ...s, visible: !s.visible } : s) } : c))

  return (
    <div className="flex flex-col gap-6">
      {/* Top nav links */}
      <div className="bg-surface rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Top Navigation Links</h3>
            <p className="text-xs text-text-muted mt-0.5">Links shown alongside "Our Products" in the main nav bar</p>
          </div>
          <button onClick={() => { setNavPickerOpen(v => !v); setNavSearch('') }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-md hover:bg-brand-50 transition-colors border border-brand-200">
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>

        {navPickerOpen && (() => {
          const addedIds = new Set(navLinks.map(l => l.pageId))
          const available = mockPages.filter(p => p.status === 'published' && !addedIds.has(p.id) && (!navSearch || p.title.toLowerCase().includes(navSearch.toLowerCase()) || p.slug.toLowerCase().includes(navSearch.toLowerCase())))
          return (
            <div className="rounded-xl border border-border shadow-sm mb-4 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-grey-50">
                <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <input autoFocus value={navSearch} onChange={e => setNavSearch(e.target.value)} placeholder="Search pages…" className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted" />
                {navSearch && <button onClick={() => setNavSearch('')} className="text-text-muted hover:text-text-primary"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="max-h-52 overflow-y-auto">
                {available.length === 0
                  ? <div className="flex flex-col items-center gap-1.5 py-6 text-text-muted"><p className="text-xs">{navSearch ? 'No matching pages' : 'All published pages already added'}</p></div>
                  : available.map(page => (
                    <button key={page.id} onClick={() => addNavLinkFromPage(page.id)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-grey-50 transition-colors text-left border-b border-border last:border-0">
                      <div className="flex-1 min-w-0"><p className="text-sm text-text-primary">{page.title}</p><p className="text-xs text-text-muted font-mono">{page.slug}</p></div>
                      <span className="text-[10px] font-semibold text-success-600 bg-success-50 px-1.5 py-0.5 rounded shrink-0 capitalize">{page.template}</span>
                    </button>
                  ))
                }
              </div>
            </div>
          )
        })()}

        {navLinks.length > 0 && (
          <div className="flex items-center gap-3 px-3 mb-1">
            <div className="w-4 shrink-0" />
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide flex-1 min-w-0">Label / Page</p>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide" style={{ width: '7rem', flexShrink: 0 }}>Link Style</p>
            <div className="w-7 shrink-0" /><div className="w-7 shrink-0" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          {navLinks.map((link, idx) => {
            const page = mockPages.find(p => p.id === link.pageId)
            return (
              <div key={link.id} draggable onDragStart={() => onNavDragStart(idx)} onDragOver={e => onNavDragOver(e, idx)} onDrop={onNavDrop}
                className="flex items-center gap-3 border border-border rounded-lg px-3 py-2.5 group hover:bg-grey-50 transition-colors">
                <GripVertical className="w-4 h-4 text-text-muted shrink-0 cursor-grab" />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Input value={link.label} onChange={e => updateNavLink(link.id, 'label', e.target.value)} placeholder="Link label" onMouseDown={e => e.stopPropagation()} />
                  {page && <span className="inline-flex items-center gap-1 text-[11px] text-text-muted font-mono px-1">{page.slug}</span>}
                </div>
                <Select value={link.color} onChange={e => updateNavLink(link.id, 'color', e.target.value)} style={{ width: '7rem', flexShrink: 0 }} onMouseDown={e => e.stopPropagation()}>
                  <option value="default">Default</option>
                  <option value="brand">Blue</option>
                  <option value="red">Red</option>
                </Select>
                <button onClick={() => updateNavLink(link.id, 'visible', !link.visible)} className={`p-1.5 rounded-md shrink-0 transition-colors ${link.visible ? 'text-brand-500 hover:bg-brand-50' : 'text-text-muted hover:bg-grey-100'}`}>
                  {link.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => removeNavLink(link.id)} className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
          {navLinks.length === 0 && <p className="text-sm text-text-muted text-center py-4">No links added yet. Click "Add Link" to pick a page.</p>}
        </div>
      </div>

      {/* Our Products section */}
      <div className="flex gap-4 items-start">
        {/* Category list */}
        <div className="w-64 bg-surface rounded-xl border border-border shadow-card shrink-0 overflow-hidden">
          <p className="px-4 py-3 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">Our Products — Categories</p>
          {categories.map((cat, idx) => (
            <div key={cat.id} draggable onDragStart={() => onCatDragStart(idx)} onDragOver={e => onCatDragOver(e, idx)} onDrop={onCatDrop}>
              <button onClick={() => selectCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm border-b border-border hover:bg-grey-50 transition-colors text-left ${selectedCatId === cat.id ? 'bg-brand-50 text-brand-600 font-medium' : 'text-text-primary'}`}>
                <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0 cursor-grab" />
                <span className="flex-1 truncate">{cat.name}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${cat.visible ? 'bg-success-500' : 'bg-grey-300'}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Right panel */}
        {selectedCat && (
          <div className="flex-1 min-w-0 bg-surface rounded-xl border border-border shadow-card overflow-hidden">

            {/* Subcategory editor */}
            {editingSub ? (
              <div className="p-5 flex flex-col gap-4">
                <button onClick={() => setEditingSubId(null)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
                  <ArrowLeft className="w-4 h-4" /> Back to {selectedCat.name}
                </button>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">{editingSub.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">Subcategory of {selectedCat.name}</p>
                </div>
                <div className="flex gap-0 border-b border-border -mx-5 px-5">
                  {SUB_TABS.map(t => (
                    <button key={t.id} onClick={() => setSubPanelTab(t.id)}
                      className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${subPanelTab === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {subPanelTab === 'general'  && <CatTabGeneral  item={editingSub} onChange={updateSub} isSubcategory />}
                {subPanelTab === 'banners'  && <CatTabBanners  item={editingSub} onChange={updateSub} />}
                {subPanelTab === 'seo'      && <CatTabSEO      item={editingSub} onChange={updateSub} />}
                {subPanelTab === 'faqs'     && <CatTabFAQs     item={editingSub} onChange={updateSub} />}
                {subPanelTab === 'products' && <CatTabProducts item={editingSub} />}
              </div>

            ) : (
              /* Category editor */
              <div className="flex flex-col">
                <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{selectedCat.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">/{selectedCat.slug}</p>
                  </div>
                  <Toggle checked={selectedCat.visible} onChange={() => toggleCatVisible(selectedCat.id)} label="Show in menu" />
                </div>

                <div className="flex gap-0 border-b border-border px-5">
                  {CAT_TABS.map(t => (
                    <button key={t.id} onClick={() => setCatPanelTab(t.id)}
                      className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${catPanelTab === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="p-5 flex flex-col gap-4">
                  {catPanelTab === 'related' && (
                    <>
                      {/* Subcategories section stays in Related Content tab */}
                      <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Subcategories</p>
                        {selectedCat.subcategories.length === 0
                          ? <p className="text-sm text-text-muted">No subcategories.</p>
                          : (
                            <div className="flex flex-col gap-2">
                              {selectedCat.subcategories.map((sub, idx) => (
                                <div key={sub.id} draggable onDragStart={() => onSubDragStart(idx)} onDragOver={e => onSubDragOver(e, idx)} onDrop={onSubDrop}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-grey-50 transition-colors group">
                                  <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0 cursor-grab" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary font-medium leading-snug">{sub.name}</p>
                                    {sub.desc && <p className="text-xs text-text-muted truncate mt-0.5">{sub.desc}</p>}
                                  </div>
                                  <button onClick={() => openSubEditor(sub.id)} title="Edit subcategory"
                                    className="p-1.5 rounded-md shrink-0 text-text-muted hover:text-brand-500 hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => toggleSubVisible(selectedCat.id, sub.id)}
                                    className={`p-1.5 rounded-md shrink-0 transition-colors ${sub.visible ? 'text-brand-500 hover:bg-brand-50' : 'text-text-muted hover:bg-grey-100'}`}>
                                    {sub.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )
                        }
                      </div>

                      <div className="border-t border-border" />

                      <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Related Content</p>
                        <CatTabRelatedContent
                          categoryId={selectedCat.id}
                          categoryTagLinks={categoryTagLinks}
                          contentTagLinks={contentTagLinks}
                          items={categoryManualContent[selectedCat.id]}
                          setItems={newList => setCategoryManualContent(prev => {
                            if (newList === undefined) {
                              const { [selectedCat.id]: _, ...rest } = prev
                              return rest
                            }
                            return { ...prev, [selectedCat.id]: newList }
                          })}
                        />
                      </div>
                    </>
                  )}

                  {catPanelTab === 'tags' && (
                    <CatTabTags
                      categoryId={selectedCat.id}
                      categoryTagLinks={categoryTagLinks}
                      setCategoryTagLinks={setCategoryTagLinks}
                    />
                  )}

                  {catPanelTab === 'general'  && <CatTabGeneral  item={selectedCat} onChange={updateCat} />}
                  {catPanelTab === 'banners'  && <CatTabBanners  item={selectedCat} onChange={updateCat} />}
                  {catPanelTab === 'seo'      && <CatTabSEO      item={selectedCat} onChange={updateCat} />}
                  {catPanelTab === 'faqs'     && <CatTabFAQs     item={selectedCat} onChange={updateCat} />}
                  {catPanelTab === 'products' && <CatTabProducts item={selectedCat} />}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'live',      label: 'Live Menu', Icon: Monitor },
  { id: 'structure', label: 'Structure', Icon: Settings2 },
]

export function MegaMenu() {
  const [tab, setTab] = useState('live')
  const [navLinks, setNavLinks] = useState(INITIAL_NAV_LINKS)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [categoryTagLinks, setCategoryTagLinks] = useState(INITIAL_CAT_LINKS)
  const [contentTagLinks] = useState(INITIAL_CONTENT_LINKS)
  const [categoryManualContent, setCategoryManualContent] = useState({})

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mega Menu"
        subtitle="Configure what appears in the site's navigation mega menu"
        actions={<Button variant="primary" onClick={() => toast('Mega menu saved', 'success')}>Save Changes</Button>}
      />

      <div className="flex gap-1 border-b border-border -mt-2">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? 'border-brand-500 text-brand-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'live'
        ? <LiveMenuTab
            navLinks={navLinks}
            categories={categories}
            categoryTagLinks={categoryTagLinks}
            contentTagLinks={contentTagLinks}
            categoryManualContent={categoryManualContent}
          />
        : <StructureTab
            navLinks={navLinks}
            setNavLinks={setNavLinks}
            categories={categories}
            setCategories={setCategories}
            categoryTagLinks={categoryTagLinks}
            setCategoryTagLinks={setCategoryTagLinks}
            contentTagLinks={contentTagLinks}
            categoryManualContent={categoryManualContent}
            setCategoryManualContent={setCategoryManualContent}
          />
      }
    </div>
  )
}
