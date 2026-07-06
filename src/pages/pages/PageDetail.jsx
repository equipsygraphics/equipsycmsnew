import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Globe, GripVertical, Plus, Trash2, X, ChevronRight, FileText, Home, Mail, Info } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea, Toggle, Select } from '../../components/ui/FormField'
import { TagPicker } from '../../components/ui/TagPicker'
import { toast } from '../../components/ui/Toast'
import { mockPages, PAGE_TEMPLATES } from '../../data/mockContent'
import { MediaLibraryModal } from '../../components/ui/MediaLibraryModal'
import { mockTags as INITIAL_TAGS, mockContentTagLinks } from '../../data/mockTagging'
import { mockCategories } from '../../data/mockCategories'

const PAGE_TABS = [
  { id: 'general', label: 'General' },
  { id: 'banners', label: 'Banners' },
  { id: 'seo',     label: 'SEO' },
  { id: 'faqs',    label: 'FAQs' },
  { id: 'tags',    label: 'Tags' },
]

const TEMPLATE_ICON = {
  standard: <FileText className="w-4 h-4 text-text-muted" />,
  landing:  <Home className="w-4 h-4 text-brand-500" />,
  contact:  <Mail className="w-4 h-4 text-text-muted" />,
  about:    <Info className="w-4 h-4 text-text-muted" />,
}

const checkerStyle = {
  backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0,0 6px,6px -6px,-6px 0px',
  backgroundColor: '#f9fafb',
}

const EMPTY_BANNER = { image: null, title: '', text: '', buttonText: '', buttonUrl: '' }
const CTA_MAX = 3
const CTA_DEFAULT_POSITIONS = [3, 7, 12]
const BANNER_STYLES = [
  { value: 'two-banner', label: '2-Banner', description: 'Two split banners — image left, content right' },
  { value: 'one-banner', label: '1-Banner', description: 'Single wide strip — image, text, and button' },
]

const DEFAULT_PAGE = {
  title: '', template: 'standard', slug: '', status: 'draft',
  h1: '', description: '', bodyContent: '', heroTitle: '', heroSubtitle: '',
  ctaLabel: '', ctaUrl: '', showInNav: false,
  seo: { metaTitle: '', metaDescription: '', focusKeyword: '' },
  faqs: [], mainBanners: [], ctaBanners: [], mainBannerStyle: 'two-banner',
}

// ── Shared primitives ─────────────────────────────────────────────────────────

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
          : <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-medium text-brand-500">Select image</span>
              <span className="text-[10px] text-text-muted">Click to browse media library</span>
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

function BannerPreview({ banner }) {
  const bgColor = banner.bgColor ?? '#A15C07'
  return (
    <div className="rounded-2xl overflow-hidden flex h-40 shadow-sm border border-[#E5E7EB]">
      <div className="w-1/2 shrink-0 overflow-hidden" style={banner.image ? {} : checkerStyle}>
        {banner.image ? <img src={banner.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No image</div>}
      </div>
      <div className="flex-1 flex flex-col justify-center gap-3 px-6 py-6" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-col gap-1.5">
          <p className="text-white font-semibold text-base leading-snug line-clamp-2">{banner.title || <span className="opacity-40">Banner title</span>}</p>
          <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{banner.text || <span className="opacity-40">Banner description</span>}</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-white text-[#1F2A37] text-xs font-semibold px-4 py-2.5 rounded-lg border border-[#E5E7EB] shadow-sm w-fit">
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
        <p className="text-sm text-[#374151] line-clamp-2">{banner.text || <span className="opacity-40">Description</span>}</p>
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
    <div className="w-44 rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] flex flex-col shrink-0">
      <div className="h-36 overflow-hidden" style={banner.image ? {} : checkerStyle}>
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

// ── Tab: General ──────────────────────────────────────────────────────────────

function TabGeneral({ page, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-text-primary">Page Info</h3>
        <Field label="Page Title" required>
          <Input value={page.title ?? ''} onChange={e => onChange('title', e.target.value)} placeholder="e.g. About Us" />
        </Field>
        <Field label="H1 / Main Heading">
          <Input value={page.h1 ?? ''} onChange={e => onChange('h1', e.target.value)} placeholder="Heading shown on the page (defaults to title if blank)" />
        </Field>
        <Field label="URL Slug">
          <div className="flex items-center">
            <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center whitespace-nowrap">equipsy.com.au</span>
            <Input value={page.slug ?? ''} onChange={e => onChange('slug', e.target.value)} className="rounded-l-none" placeholder="/about" />
          </div>
        </Field>
      </div>

      <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-text-primary">Description</h3>
        <Field label="Short Description">
          <Textarea value={page.description ?? ''} onChange={e => onChange('description', e.target.value)} rows={2} placeholder="Brief summary shown in listings and cards" />
        </Field>
        <Field label="Body Content">
          <Textarea value={page.bodyContent ?? ''} onChange={e => onChange('bodyContent', e.target.value)} rows={7} placeholder="Main page content…" />
        </Field>
      </div>

      <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-text-primary">Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {PAGE_TEMPLATES.map(t => (
            <button key={t.value} onClick={() => onChange('template', t.value)}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${page.template === t.value ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-grey-300'}`}>
              <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                <span className="shrink-0">{TEMPLATE_ICON[t.value]}</span>{t.label}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>

        {(page.template === 'landing' || page.template === 'standard') && (
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Call to Action</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA Label"><Input value={page.ctaLabel ?? ''} onChange={e => onChange('ctaLabel', e.target.value)} placeholder="e.g. Shop Now" /></Field>
              <Field label="CTA URL"><Input value={page.ctaUrl ?? ''} onChange={e => onChange('ctaUrl', e.target.value)} placeholder="/products" /></Field>
            </div>
          </div>
        )}
        {page.template === 'contact' && (
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Contact Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><Input value={page.heroTitle ?? ''} onChange={e => onChange('heroTitle', e.target.value)} placeholder="(03) 9000 0000" /></Field>
              <Field label="Email"><Input value={page.heroSubtitle ?? ''} onChange={e => onChange('heroSubtitle', e.target.value)} placeholder="hello@equipsy.com.au" /></Field>
            </div>
            <Field label="Office Address"><Textarea value={page.bodyContent ?? ''} onChange={e => onChange('bodyContent', e.target.value)} rows={2} placeholder="123 Street, Melbourne VIC 3000" /></Field>
          </div>
        )}
        {page.template === 'about' && (
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">About Content</p>
            <Field label="Mission Statement"><Textarea value={page.heroTitle ?? ''} onChange={e => onChange('heroTitle', e.target.value)} rows={3} placeholder="Our mission is…" /></Field>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border p-5">
        <Toggle label="Show in Navigation" description="Display this page as a link in the top nav bar" checked={page.showInNav ?? false} onChange={v => onChange('showInNav', v)} />
      </div>
    </div>
  )
}

// ── Tab: Banners ──────────────────────────────────────────────────────────────

function TabBanners({ page, onChange }) {
  const bannerStyle = page.mainBannerStyle ?? 'two-banner'
  const bannerCount = bannerStyle === 'one-banner' ? 1 : 2

  const ensureBanners = (arr, n) => {
    const result = [...(arr ?? [])]
    while (result.length < n) result.push({ id: Date.now() + result.length, ...EMPTY_BANNER })
    return result.slice(0, n)
  }

  const mainBanners = ensureBanners(page.mainBanners, bannerCount)
  const ctaBanners = page.ctaBanners ?? []

  const updateMain = (idx, field, value) =>
    onChange('mainBanners', mainBanners.map((b, i) => i === idx ? { ...b, [field]: value } : b))

  const addCta = () => {
    if (ctaBanners.length >= CTA_MAX) return
    const usedPositions = ctaBanners.map(b => b.position)
    const nextPos = CTA_DEFAULT_POSITIONS.find(p => !usedPositions.includes(p)) ?? (Math.max(...usedPositions, 2) + 4)
    onChange('ctaBanners', [...ctaBanners, { id: Date.now(), position: nextPos, ...EMPTY_BANNER }])
  }
  const removeCta = idx => onChange('ctaBanners', ctaBanners.filter((_, i) => i !== idx))
  const updateCta = (idx, field, value) =>
    onChange('ctaBanners', ctaBanners.map((b, i) => i === idx ? { ...b, [field]: value } : b))

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border p-5 flex flex-col gap-5">
        <h3 className="text-sm font-semibold text-text-primary">Main Banners</h3>
        <div className="flex gap-3">
          {BANNER_STYLES.map(s => (
            <button key={s.value} type="button" onClick={() => onChange('mainBannerStyle', s.value)}
              className={`flex-1 flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-colors ${bannerStyle === s.value ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-200'}`}>
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
                <Field label="Button URL"><Input value={b.buttonUrl} onChange={e => updateMain(idx, 'buttonUrl', e.target.value)} placeholder="/products" /></Field>
              </div>
              <Field label="Banner Image"><BannerImagePicker value={b.image} onChange={v => updateMain(idx, 'image', v)} hint={bannerStyle === 'one-banner' ? '800×400px recommended' : '1200×600px per banner recommended'} /></Field>
              <ColorPicker label="Background Colour" value={b.bgColor ?? (bannerStyle === 'one-banner' ? '#FAC515' : '#A15C07')} onChange={v => updateMain(idx, 'bgColor', v)} />
              {idx < bannerCount - 1 && <div className="border-t border-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">CTA Banners</h3>
          <p className="text-xs text-text-muted mt-0.5">Shown between content blocks on the page. Optional — up to {CTA_MAX}.</p>
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
              <div className="flex gap-5 items-start">
                <CtaBannerPreview banner={b} />
                <div className="flex-1 flex flex-col gap-3">
                  <Field label="Position in page" hint="Slot number where this banner appears">
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
          {ctaBanners.length === 0 && <p className="text-sm text-text-muted text-center py-2">No CTA banners added yet.</p>}
        </div>
        {ctaBanners.length < CTA_MAX && (
          <button type="button" onClick={addCta} className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium w-fit">
            <Plus className="w-4 h-4" /> Add CTA Banner {ctaBanners.length > 0 ? `(${ctaBanners.length}/${CTA_MAX})` : ''}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Tab: SEO ──────────────────────────────────────────────────────────────────

function TabSEO({ page, onChange }) {
  const seo = page.seo ?? { metaTitle: '', metaDescription: '', focusKeyword: '' }
  const update = (field, value) => onChange('seo', { ...seo, [field]: value })
  return (
    <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text-primary">SEO</h3>
      <Field label="Meta Title" hint={`${seo.metaTitle?.length ?? 0}/60 chars`}>
        <Input value={seo.metaTitle ?? ''} onChange={e => update('metaTitle', e.target.value)} maxLength={60} placeholder={page.title ? `${page.title} | Equipsy` : 'Page title for search engines'} />
      </Field>
      <Field label="Meta Description" hint={`${seo.metaDescription?.length ?? 0}/160 chars`}>
        <Textarea value={seo.metaDescription ?? ''} onChange={e => update('metaDescription', e.target.value)} rows={3} maxLength={160} placeholder="Brief description shown in Google search results…" />
      </Field>
      <Field label="Focus Keyword">
        <Input value={seo.focusKeyword ?? ''} onChange={e => update('focusKeyword', e.target.value)} placeholder="e.g. grab rails australia" />
      </Field>
    </div>
  )
}

// ── Tab: FAQs ─────────────────────────────────────────────────────────────────

function TabFAQs({ page, onChange }) {
  const faqs = page.faqs ?? []
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const add = () => onChange('faqs', [...faqs, { id: Date.now(), question: '', answer: '' }])
  const remove = id => onChange('faqs', faqs.filter(f => f.id !== id))
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
    <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">FAQs</h3>
        <p className="text-xs text-text-muted mt-0.5">Frequently asked questions shown on this page. Drag to reorder.</p>
      </div>
      <div className="flex flex-col gap-3">
        {faqs.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">No FAQs added yet.</p>
        )}
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
            <button onClick={() => remove(faq.id)} className="p-1 text-text-muted hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors shrink-0 self-start opacity-0 group-hover:opacity-100">
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

// ── Tab: Tags ─────────────────────────────────────────────────────────────────

function TabTags({ page, onChange, allTags, onCreateTag }) {
  const pageId = page.id
  const contentType = page.contentType ?? 'page'

  // Derive currently applied tag IDs from the pivot (for existing pages)
  const initialIds = pageId
    ? mockContentTagLinks
        .filter(l => l.contentType === contentType && l.contentId === pageId)
        .map(l => l.tagId)
    : []

  const [tagIds, setTagIds] = useState(page.tagIds ?? initialIds)

  const handleChange = ids => {
    setTagIds(ids)
    onChange('tagIds', ids)
  }

  const linkedCats = mockCategories.filter(cat =>
    allTags
      .filter(t => tagIds.includes(t.id))
      .some(t =>
        (page._catTagLinks ?? []).some(l => l.tagId === t.id && l.categoryId === cat.id)
      )
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Tags</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Tag this {contentType === 'tool' ? 'tool' : 'page'} so it surfaces as related content in the mega menu when users browse linked product categories.
          </p>
        </div>
        <TagPicker
          allTags={allTags}
          selectedIds={tagIds}
          onChange={handleChange}
          onCreateTag={onCreateTag}
          placeholder="Search or create tags…"
        />
      </div>

      {tagIds.length > 0 && (
        <div className="rounded-xl border border-border p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-primary">Content Type</h3>
          <p className="text-xs text-text-muted">Determines how this content is classified in related-content queries.</p>
          <div className="flex gap-3">
            {['page', 'tool'].map(ct => (
              <button key={ct} onClick={() => onChange('contentType', ct)}
                className={`flex-1 p-3 rounded-xl border-2 text-left transition-colors ${contentType === ct ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-grey-300'}`}>
                <p className={`text-sm font-semibold ${contentType === ct ? 'text-brand-600' : 'text-text-primary'}`}>
                  {ct === 'tool' ? 'Embedded Tool' : 'Landing Page'}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {ct === 'tool' ? 'e.g. Ramp Calculator — surfaced as a tool in the mega menu' : 'Standard page — surfaced as a related article or guide'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const found = isNew ? null : mockPages.find(p => p.id === parseInt(id))

  const [page, setPage] = useState({ ...DEFAULT_PAGE, ...(found ?? {}) })
  const [activeTab, setActiveTab] = useState('general')
  const [allTags, setAllTags] = useState(INITIAL_TAGS)

  const onChange = (field, value) => setPage(p => ({ ...p, [field]: value }))

  const handleCreateTag = (name, slug) => {
    const newTag = { id: Date.now(), name, slug, description: '' }
    setAllTags(prev => [...prev, newTag])
    return newTag
  }

  const handleSave = () => {
    if (!page.title.trim()) { toast('Page title is required', 'error'); return }
    toast(`"${page.title}" saved`, 'success')
  }

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/pages')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Pages
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold text-text-primary">{page.title || 'Untitled Page'}</h1>
            <Badge variant={page.status === 'published' ? 'published' : 'draft'} label={page.status === 'published' ? 'Published' : 'Draft'} dot />
          </div>
          {page.slug && (
            <div className="flex items-center gap-1 mt-0.5 text-sm text-text-muted">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-mono">equipsy.com.au{page.slug}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={page.status} onChange={e => onChange('status', e.target.value)} className="w-32">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {PAGE_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {activeTab === 'general' && <TabGeneral page={page} onChange={onChange} />}
        {activeTab === 'banners' && <TabBanners page={page} onChange={onChange} />}
        {activeTab === 'seo'     && <TabSEO     page={page} onChange={onChange} />}
        {activeTab === 'faqs'    && <TabFAQs    page={page} onChange={onChange} />}
        {activeTab === 'tags'    && <TabTags    page={page} onChange={onChange} allTags={allTags} onCreateTag={handleCreateTag} />}
      </div>
    </div>
  )
}
