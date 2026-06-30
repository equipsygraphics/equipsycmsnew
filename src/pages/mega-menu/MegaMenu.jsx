import { useState, useRef } from 'react'
import { Menu, X, ChevronRight, ChevronDown, ChevronLeft, Eye, EyeOff, GripVertical, Plus, Trash2, Monitor, Settings2, Wrench, Search, BookOpen, Smartphone, ShoppingCart, User, ClipboardList } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Input, Toggle, Select } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockBlogPosts, mockPages } from '../../data/mockContent'
import { mockCategories } from '../../data/mockCategories'

// ── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_NAV_LINKS = [
  { id: 1, pageId: 7,  label: 'Ramp Calculator',     color: 'brand',   visible: true },
  { id: 2, pageId: 9,  label: 'Accessible Bathroom',  color: 'default', visible: true },
  { id: 3, pageId: 5,  label: 'Builder Pack',          color: 'default', visible: true },
  { id: 4, pageId: 10, label: 'Trade Account',         color: 'default', visible: true },
  { id: 5, pageId: 11, label: 'Clearance Sale',        color: 'red',     visible: true },
]

// Derive initial mega menu categories from the shared categories data.
// Only primary categories are shown; subcategories come from there too.
// Mega-menu-specific overlay (visible, resources, blog) starts empty/true.
const INITIAL_CATEGORIES = mockCategories
  .filter(c => c.primary)
  .map(c => ({
    id: c.id,
    name: c.name,
    visible: true,
    subcategories: c.subcategories.map(s => ({
      id: s.id,
      name: s.name,
      desc: s.description || '',
      visible: true,
    })),
    resources: [],
    blog: [],
  }))

const NAV_LINK_COLOR_CLASS = {
  default: 'text-[#1F2A37]',
  brand: 'text-[#04619A]',
  red: 'text-[#B42318]',
}

// ── Live Menu tab ─────────────────────────────────────────────────────────────
function LiveMenuTab({ navLinks, categories }) {
  const [viewMode, setViewMode] = useState('desktop')

  // Desktop state
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCatId, setActiveCatId] = useState(null)

  // Mobile state — stack nav: 'closed' | 'menu' | 'products' | 'category'
  const [mobileView, setMobileView] = useState('closed')
  const [mobileCatId, setMobileCatId] = useState(null)

  const visibleCats = categories.filter(c => c.visible)
  const visibleLinks = navLinks.filter(l => l.visible)

  // Reset open states on view switch
  const switchView = (mode) => {
    setViewMode(mode)
    setMenuOpen(false)
    setMobileView('closed')
    setMobileCatId(null)
  }

  const activeCat = categories.find(c => c.id === activeCatId) ?? visibleCats[0]

  return (
    <div className="flex flex-col gap-4">

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Click <strong>{viewMode === 'desktop' ? 'Our Products' : 'the hamburger'}</strong> to expand. Changes in the Structure tab update instantly.
        </p>
        <div className="flex items-center gap-1 bg-grey-100 p-1 rounded-lg">
          <button
            onClick={() => switchView('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'desktop' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => switchView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'mobile' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>
      </div>

      {/* ── Desktop preview ── */}
      {viewMode === 'desktop' && (
        <div className="rounded-xl border border-border overflow-hidden shadow-card">
          {/* Browser chrome */}
          <div className="bg-grey-100 border-b border-border px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-text-muted border border-border">
              https://equipsy.com.au
            </div>
          </div>

          {/* Nav bar */}
          <div className="bg-white border-b border-[#D2D6DB] flex items-center">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={`flex items-center gap-2 px-8 py-5 border-r border-[#D2D6DB] font-bold text-base text-[#1F2A37] hover:bg-grey-50 transition-colors shrink-0 ${menuOpen ? 'bg-grey-50' : ''}`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              Our Products
            </button>
            <div className="flex items-center gap-1 px-4 flex-wrap">
              {visibleLinks.map(link => (
                <span
                  key={link.id}
                  className={`px-[18px] py-[10px] rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-grey-50 transition-colors ${NAV_LINK_COLOR_CLASS[link.color] ?? NAV_LINK_COLOR_CLASS.default}`}
                >
                  {link.label}
                </span>
              ))}
            </div>
          </div>

          {/* Mega menu dropdown */}
          {menuOpen && (
            <div className="bg-white border-b border-[#D2D6DB] flex" style={{ minHeight: 360 }}>
              {/* Left: category list */}
              <div className="w-56 border-r border-[#D2D6DB] py-4 shrink-0">
                <p className="px-5 pb-3 font-bold text-[15px] text-[#1F2A37]">Our Products</p>
                <div className="flex flex-col">
                  {visibleCats.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCatId(cat.id)}
                      className={`flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-colors w-full ${
                        activeCat?.id === cat.id ? 'bg-[#EFF8FF] text-[#04619A] font-semibold' : 'text-[#1F2A37] hover:bg-grey-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        activeCat?.id === cat.id ? 'bg-[#04619A]/10 text-[#04619A]' : 'bg-grey-100 text-text-muted'
                      }`}>
                        {cat.name.charAt(0)}
                      </div>
                      <span className="flex-1 leading-snug">{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle: subcategories */}
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
                      {activeCat.subcategories.filter(s => s.visible).length === 0 && (
                        <p className="text-sm text-text-muted italic">No visible subcategories.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right: related content */}
              <div className="w-72 p-6 shrink-0">
                <h3 className="font-bold text-[15px] text-[#1F2A37] mb-4">Related Content</h3>
                {activeCat?.resources?.filter(r => r.visible).length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-[#1F2A37] mb-2">Tools &amp; Resources</p>
                    <div className="flex flex-col gap-2">
                      {activeCat.resources.filter(r => r.visible).map(item => {
                        const page = mockPages.find(p => p.id === item.pageId)
                        if (!page) return null
                        return (
                          <div key={item.pageId} className="border-2 border-[#F5C200] rounded-xl p-3 cursor-pointer hover:bg-yellow-50 transition-colors">
                            <div className="flex gap-3">
                              <div className="w-14 h-10 bg-[#FEF9C3] rounded-lg shrink-0 flex items-center justify-center">
                                <Wrench className="w-4 h-4 text-[#CA8504]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#1F2A37] leading-snug">{page.title}</p>
                                <p className="text-[11px] text-[#6B7280] mt-0.5 font-mono">{page.slug}</p>
                                <span className="text-[11px] text-[#04619A] font-semibold mt-1 inline-flex items-center gap-0.5">
                                  Visit page <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {activeCat?.blog?.filter(b => b.visible).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#1F2A37]">Blog</p>
                      <span className="text-[11px] text-[#04619A] font-semibold cursor-pointer hover:underline">View all</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {activeCat.blog.filter(b => b.visible).map(item => {
                        const post = mockBlogPosts.find(p => p.id === item.postId)
                        if (!post) return null
                        return (
                          <div key={item.postId} className="flex gap-3 cursor-pointer group">
                            <div className="w-16 h-11 bg-grey-100 rounded-lg shrink-0" />
                            <div className="min-w-0">
                              <span className="inline-block text-[10px] font-semibold text-[#04619A] bg-[#EFF8FF] px-1.5 py-0.5 rounded mb-1">{post.category}</span>
                              <p className="text-xs font-semibold text-[#1F2A37] leading-snug group-hover:text-[#04619A] transition-colors line-clamp-2">{post.title}</p>
                              <span className="text-[11px] text-[#04619A] font-semibold mt-0.5 inline-flex items-center gap-0.5">
                                Read more <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {!activeCat?.resources?.filter(r => r.visible).length && !activeCat?.blog?.filter(b => b.visible).length && (
                  <p className="text-xs text-text-muted italic">No related content for this category.</p>
                )}
              </div>
            </div>
          )}

          {!menuOpen && (
            <div className="h-24 bg-grey-50 flex items-center justify-center">
              <p className="text-xs text-text-muted">Page content area</p>
            </div>
          )}
        </div>
      )}

      {/* ── Mobile preview ── */}
      {viewMode === 'mobile' && (() => {
        const mobileCat = categories.find(c => c.id === mobileCatId)
        return (
          <div className="flex justify-center">
            {/* Phone shell */}
            <div className="w-[390px] rounded-[2.5rem] border-[6px] border-[#1F2A37] overflow-hidden shadow-2xl bg-white" style={{ minHeight: 700 }}>

              {/* Status bar — blue when nav open, white otherwise */}
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

              {/* ── Nav bar (blue when closed, white otherwise) ── */}
              {mobileView === 'closed' ? (
                <div className="bg-[#1B9EEB] px-5 py-3 flex items-center justify-between">
                  <button onClick={() => setMobileView('menu')} className="p-1.5 rounded">
                    <Menu className="w-6 h-6 text-white" />
                  </button>
                  <div className="text-center">
                    <div className="font-black text-white text-lg tracking-wide leading-none">EQUIPSY</div>
                    <div className="text-white/70 text-[10px] font-medium tracking-wider">Safer Living</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-white" />
                    <ClipboardList className="w-5 h-5 text-white" />
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                /* White header bar for menu/products/category views */
                <div className="bg-white px-5 py-4 flex items-center justify-between">
                  {mobileView === 'menu' ? (
                    <>
                      <span className="text-xl font-bold text-[#1F2A37]">Menu</span>
                      <button onClick={() => setMobileView('closed')} className="p-1">
                        <X className="w-6 h-6 text-[#1F2A37]" />
                      </button>
                    </>
                  ) : mobileView === 'products' ? (
                    <>
                      <button onClick={() => setMobileView('menu')} className="p-1 -ml-1">
                        <ChevronLeft className="w-6 h-6 text-[#1B9EEB]" />
                      </button>
                      <span className="font-bold text-[#1F2A37] text-base">Our Products</span>
                      <div className="w-8" />
                    </>
                  ) : (
                    <>
                      <button onClick={() => setMobileView('products')} className="p-1 -ml-1">
                        <ChevronLeft className="w-6 h-6 text-[#1B9EEB]" />
                      </button>
                      <span className="font-bold text-[#1F2A37] text-base">{mobileCat?.name}</span>
                      <span className="text-[#1B9EEB] text-sm font-semibold cursor-pointer">View all</span>
                    </>
                  )}
                </div>
              )}

              {/* ── Content area ── */}
              <div className="bg-white overflow-y-auto" style={{ maxHeight: 580 }}>

                {/* CLOSED: page placeholder */}
                {mobileView === 'closed' && (
                  <div className="h-64 bg-grey-50 flex items-center justify-center">
                    <p className="text-xs text-text-muted">Page content area — tap ☰ to open menu</p>
                  </div>
                )}

                {/* MENU: main nav drawer */}
                {mobileView === 'menu' && (
                  <>
                    <div className="pt-2 pb-1 px-5">
                      {/* Our Products — blue pill button */}
                      <button
                        onClick={() => setMobileView('products')}
                        className="w-full flex items-center justify-between bg-[#1B9EEB] text-white rounded-2xl px-5 py-4 font-bold text-base mb-4"
                      >
                        Our Products
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Nav links */}
                    <div className="border-t border-[#E5E7EB]">
                      {visibleLinks.map(link => {
                        const isRed = link.color === 'red'
                        const isBrand = link.color === 'brand'
                        return (
                          <div key={link.id} className="border-b border-[#E5E7EB]">
                            <button className="w-full flex items-center justify-between px-5 py-4">
                              <span className={`text-base font-semibold ${isRed ? 'text-[#C01048]' : isBrand ? 'text-[#1B9EEB]' : 'text-[#1F2A37]'}`}>
                                {link.label}
                              </span>
                              <ChevronRight className={`w-5 h-5 ${isRed ? 'text-[#C01048]' : 'text-[#6B7280]'}`} />
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Secondary links */}
                    <div className="mt-4 border-t border-[#E5E7EB]">
                      {['About Us', 'Testimonials', 'Contact Us'].map(label => (
                        <div key={label} className="border-b border-[#E5E7EB]">
                          <button className="w-full flex items-center justify-between px-5 py-4">
                            <span className="text-base text-[#6B7280]">{label}</span>
                            <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* PRODUCTS: category list */}
                {mobileView === 'products' && (
                  <div className="border-t border-[#E5E7EB]">
                    {visibleCats.map(cat => (
                      <div key={cat.id} className="border-b border-[#E5E7EB]">
                        <button
                          onClick={() => { setMobileCatId(cat.id); setMobileView('category') }}
                          className="w-full flex items-center gap-4 px-5 py-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#EFF8FF] flex items-center justify-center shrink-0">
                            <span className="text-[#1B9EEB] text-sm font-black">{cat.name.charAt(0)}</span>
                          </div>
                          <span className="flex-1 text-left text-base font-semibold text-[#1F2A37]">{cat.name}</span>
                          <ChevronRight className="w-5 h-5 text-[#6B7280] shrink-0" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* CATEGORY: subcategory list */}
                {mobileView === 'category' && mobileCat && (
                  <>
                    <div className="border-t border-[#E5E7EB]">
                      {mobileCat.subcategories.filter(s => s.visible).map(sub => (
                        <div key={sub.id} className="border-b border-[#E5E7EB] px-5 py-4">
                          <p className="font-semibold text-[#1F2A37] text-sm leading-snug">{sub.name}</p>
                          {sub.desc && <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">{sub.desc}</p>}
                        </div>
                      ))}
                      {mobileCat.subcategories.filter(s => s.visible).length === 0 && (
                        <div className="px-5 py-6">
                          <p className="text-sm text-text-muted italic">No subcategories configured.</p>
                        </div>
                      )}
                    </div>

                    {/* Related content section */}
                    {(mobileCat.resources?.filter(r => r.visible).length > 0 || mobileCat.blog?.filter(b => b.visible).length > 0) && (
                      <div className="mt-2 border-t border-[#E5E7EB] px-5 pt-5 pb-4">
                        <p className="font-bold text-[#1F2A37] text-base mb-4">Related Content</p>
                        {mobileCat.resources?.filter(r => r.visible).map(item => {
                          const page = mockPages.find(p => p.id === item.pageId)
                          if (!page) return null
                          return (
                            <div key={item.pageId} className="flex items-center gap-3 py-3 border-b border-[#E5E7EB]">
                              <div className="w-8 h-8 bg-[#FEF9C3] rounded-lg flex items-center justify-center shrink-0">
                                <Wrench className="w-4 h-4 text-[#CA8504]" />
                              </div>
                              <span className="text-sm font-semibold text-[#1F2A37]">{page.title}</span>
                              <ChevronRight className="w-4 h-4 text-[#6B7280] ml-auto shrink-0" />
                            </div>
                          )
                        })}
                        {mobileCat.blog?.filter(b => b.visible).map(item => {
                          const post = mockBlogPosts.find(p => p.id === item.postId)
                          if (!post) return null
                          return (
                            <div key={item.postId} className="flex items-center gap-3 py-3 border-b border-[#E5E7EB]">
                              <div className="w-8 h-8 bg-grey-100 rounded-lg shrink-0" />
                              <span className="text-sm font-semibold text-[#1F2A37] flex-1 line-clamp-1">{post.title}</span>
                              <ChevronRight className="w-4 h-4 text-[#6B7280] shrink-0" />
                            </div>
                          )
                        })}
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
function StructureTab({ navLinks, setNavLinks, categories, setCategories }) {
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id ?? null)
  const selectedCat = categories.find(c => c.id === selectedCatId) ?? null
  const dragNav = useRef(null)
  const dragOverNav = useRef(null)
  const dragCat = useRef(null)
  const dragOverCat = useRef(null)
  const dragSub = useRef(null)
  const dragOverSub = useRef(null)
  const [navPickerOpen, setNavPickerOpen] = useState(false)
  const [navSearch, setNavSearch] = useState('')
  const [blogPickerOpen, setBlogPickerOpen] = useState(false)
  const [blogSearch, setBlogSearch] = useState('')
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false)
  const [resourceSearch, setResourceSearch] = useState('')

  // Nav link helpers
  const addNavLinkFromPage = (pageId) => {
    const page = mockPages.find(p => p.id === pageId)
    if (!page) return
    setNavLinks(prev => [...prev, { id: Date.now(), pageId, label: page.title, color: 'default', visible: true }])
    setNavPickerOpen(false)
    setNavSearch('')
  }
  const updateNavLink = (id, field, value) => {
    setNavLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }
  const removeNavLink = (id) => {
    setNavLinks(prev => prev.filter(l => l.id !== id))
  }
  const onNavDragStart = idx => { dragNav.current = idx }
  const onNavDragOver = (e, idx) => { e.preventDefault(); dragOverNav.current = idx }
  const onNavDrop = () => {
    const from = dragNav.current, to = dragOverNav.current
    if (from !== null && to !== null && from !== to) {
      const arr = [...navLinks]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
      setNavLinks(arr)
    }
    dragNav.current = null; dragOverNav.current = null
  }

  const onCatDragStart = idx => { dragCat.current = idx }
  const onCatDragOver = (e, idx) => { e.preventDefault(); dragOverCat.current = idx }
  const onCatDrop = () => {
    const from = dragCat.current, to = dragOverCat.current
    if (from !== null && to !== null && from !== to) {
      const arr = [...categories]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
      setCategories(arr)
    }
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

  // Resource helpers
  const addResource = (pageId) => {
    setCategories(prev => prev.map(c =>
      c.id === selectedCatId
        ? { ...c, resources: [...c.resources, { pageId, visible: true }] }
        : c
    ))
    setResourcePickerOpen(false)
    setResourceSearch('')
  }
  const removeResource = (pageId) => {
    setCategories(prev => prev.map(c =>
      c.id === selectedCatId
        ? { ...c, resources: c.resources.filter(r => r.pageId !== pageId) }
        : c
    ))
  }
  const toggleResourceVisible = (pageId) => {
    setCategories(prev => prev.map(c =>
      c.id === selectedCatId
        ? { ...c, resources: c.resources.map(r => r.pageId === pageId ? { ...r, visible: !r.visible } : r) }
        : c
    ))
  }

  // Blog helpers
  const addBlogPost = (postId) => {
    setCategories(prev => prev.map(c =>
      c.id === selectedCatId
        ? { ...c, blog: [...c.blog, { postId, visible: true }] }
        : c
    ))
    setBlogPickerOpen(false)
    setBlogSearch('')
  }
  const removeBlogPost = (postId) => {
    setCategories(prev => prev.map(c =>
      c.id === selectedCatId
        ? { ...c, blog: c.blog.filter(b => b.postId !== postId) }
        : c
    ))
  }
  const toggleBlogPostVisible = (postId) => {
    setCategories(prev => prev.map(c =>
      c.id === selectedCatId
        ? { ...c, blog: c.blog.map(b => b.postId === postId ? { ...b, visible: !b.visible } : b) }
        : c
    ))
  }

  // Category helpers
  const toggleCatVisible = catId => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, visible: !c.visible } : c))
  }
  const toggleSubVisible = (catId, subId) => {
    setCategories(prev => prev.map(c =>
      c.id === catId
        ? { ...c, subcategories: c.subcategories.map(s => s.id === subId ? { ...s, visible: !s.visible } : s) }
        : c
    ))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top nav links */}
      <div className="bg-surface rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Top Navigation Links</h3>
            <p className="text-xs text-text-muted mt-0.5">Links shown alongside "Our Products" in the main nav bar</p>
          </div>
          <button
            onClick={() => { setNavPickerOpen(v => !v); setNavSearch('') }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-md hover:bg-brand-50 transition-colors border border-brand-200"
          >
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>

        {/* Page picker */}
        {navPickerOpen && (() => {
          const addedIds = new Set(navLinks.map(l => l.pageId))
          const available = mockPages.filter(p =>
            p.status === 'published' &&
            !addedIds.has(p.id) &&
            (!navSearch || p.title.toLowerCase().includes(navSearch.toLowerCase()) || p.slug.toLowerCase().includes(navSearch.toLowerCase()))
          )
          return (
            <div className="rounded-xl border border-border shadow-sm mb-4 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-grey-50">
                <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <input
                  autoFocus
                  value={navSearch}
                  onChange={e => setNavSearch(e.target.value)}
                  placeholder="Search pages…"
                  className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
                />
                {navSearch && (
                  <button onClick={() => setNavSearch('')} className="text-text-muted hover:text-text-primary">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="max-h-52 overflow-y-auto">
                {available.length === 0 ? (
                  <div className="flex flex-col items-center gap-1.5 py-6 text-text-muted">
                    <p className="text-xs">{navSearch ? 'No matching pages' : 'All published pages already added'}</p>
                  </div>
                ) : available.map(page => (
                  <button
                    key={page.id}
                    onClick={() => addNavLinkFromPage(page.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-grey-50 transition-colors text-left border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{page.title}</p>
                      <p className="text-xs text-text-muted font-mono">{page.slug}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-success-600 bg-success-50 px-1.5 py-0.5 rounded shrink-0 capitalize">{page.template}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Nav link rows */}
        {navLinks.length > 0 && (
          <div className="flex items-center gap-3 px-3">
            <div className="w-4 shrink-0" />
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide" style={{ flex: 1, minWidth: 0 }}>Label / Page</p>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide" style={{ width: '7rem', flexShrink: 0 }}>Link Style</p>
            <div className="w-7 shrink-0" />
            <div className="w-7 shrink-0" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          {navLinks.map((link, idx) => {
            const page = mockPages.find(p => p.id === link.pageId)
            return (
              <div
                key={link.id}
                draggable
                onDragStart={() => onNavDragStart(idx)}
                onDragOver={e => onNavDragOver(e, idx)}
                onDrop={onNavDrop}
                className="flex items-center gap-3 border border-border rounded-lg px-3 py-2.5 group hover:bg-grey-50 transition-colors"
              >
                <GripVertical className="w-4 h-4 text-text-muted shrink-0 cursor-grab" />
                <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
                  <Input
                    value={link.label}
                    onChange={e => updateNavLink(link.id, 'label', e.target.value)}
                    placeholder="Link label"
                    onMouseDown={e => e.stopPropagation()}
                  />
                  {page && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted font-mono px-1">
                      {page.slug}
                    </span>
                  )}
                </div>
                <Select
                  value={link.color}
                  onChange={e => updateNavLink(link.id, 'color', e.target.value)}
                  style={{ width: '7rem', flexShrink: 0 }}
                  onMouseDown={e => e.stopPropagation()}
                >
                  <option value="default">Default</option>
                  <option value="brand">Blue</option>
                  <option value="red">Red</option>
                </Select>
                <button
                  onClick={() => updateNavLink(link.id, 'visible', !link.visible)}
                  className={`p-1.5 rounded-md shrink-0 transition-colors ${link.visible ? 'text-brand-500 hover:bg-brand-50' : 'text-text-muted hover:bg-grey-100'}`}
                >
                  {link.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => removeNavLink(link.id)}
                  className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
          {navLinks.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">No links added yet. Click "Add Link" to pick a page.</p>
          )}
        </div>
      </div>

      {/* Our Products mega menu categories */}
      <div className="flex gap-4">
        {/* Category list */}
        <div className="w-64 bg-surface rounded-xl border border-border shadow-card shrink-0 overflow-hidden">
          <p className="px-4 py-3 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">
            Our Products — Categories
          </p>
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => onCatDragStart(idx)}
              onDragOver={e => onCatDragOver(e, idx)}
              onDrop={onCatDrop}
            >
              <button
                onClick={() => setSelectedCatId(cat.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm border-b border-border hover:bg-grey-50 transition-colors text-left ${
                  selectedCatId === cat.id ? 'bg-brand-50 text-brand-600 font-medium' : 'text-text-primary'
                }`}
              >
                <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0 cursor-grab" />
                <span className="flex-1 truncate">{cat.name}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${cat.visible ? 'bg-success-500' : 'bg-grey-300'}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Category detail panel */}
        {selectedCat && (
          <div className="flex-1 bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">{selectedCat.name}</h3>
              <Toggle
                checked={selectedCat.visible}
                onChange={() => toggleCatVisible(selectedCat.id)}
                label="Show in mega menu"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Subcategories</p>
              {selectedCat.subcategories.length === 0 ? (
                <p className="text-sm text-text-muted">No subcategories.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedCat.subcategories.map((sub, idx) => (
                    <div
                      key={sub.id}
                      draggable
                      onDragStart={() => onSubDragStart(idx)}
                      onDragOver={e => onSubDragOver(e, idx)}
                      onDrop={onSubDrop}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-grey-50 transition-colors"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-medium leading-snug">{sub.name}</p>
                        {sub.desc && <p className="text-xs text-text-muted truncate mt-0.5">{sub.desc}</p>}
                      </div>
                      <button
                        onClick={() => toggleSubVisible(selectedCat.id, sub.id)}
                        className={`p-1.5 rounded-md shrink-0 transition-colors ${sub.visible ? 'text-brand-500 hover:bg-brand-50' : 'text-text-muted hover:bg-grey-100'}`}
                      >
                        {sub.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Tools &amp; Resources</p>
                <button
                  onClick={() => { setResourcePickerOpen(v => !v); setResourceSearch('') }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-md hover:bg-brand-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Page
                </button>
              </div>

              {resourcePickerOpen && (() => {
                const addedIds = new Set(selectedCat.resources.map(r => r.pageId))
                const publishedPages = mockPages.filter(p =>
                  p.status === 'published' &&
                  !addedIds.has(p.id) &&
                  (!resourceSearch || p.title.toLowerCase().includes(resourceSearch.toLowerCase()) || p.slug.toLowerCase().includes(resourceSearch.toLowerCase()))
                )
                return (
                  <div className="rounded-xl border border-border shadow-sm mb-3 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-grey-50">
                      <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <input
                        autoFocus
                        value={resourceSearch}
                        onChange={e => setResourceSearch(e.target.value)}
                        placeholder="Search pages…"
                        className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
                      />
                      {resourceSearch && (
                        <button onClick={() => setResourceSearch('')} className="text-text-muted hover:text-text-primary">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {publishedPages.length === 0 ? (
                        <div className="flex flex-col items-center gap-1.5 py-6 text-text-muted">
                          <Wrench className="w-5 h-5" />
                          <p className="text-xs">{resourceSearch ? 'No matching pages' : 'All published pages already added'}</p>
                        </div>
                      ) : publishedPages.map(page => (
                        <button
                          key={page.id}
                          onClick={() => addResource(page.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-grey-50 transition-colors text-left border-b border-border last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary">{page.title}</p>
                            <p className="text-xs text-text-muted font-mono">{page.slug}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-success-600 bg-success-50 px-1.5 py-0.5 rounded shrink-0 capitalize">{page.template}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {selectedCat.resources.length === 0 ? (
                <p className="text-xs text-text-muted italic">No pages linked. Click "Add Page" to add one.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedCat.resources.map(item => {
                    const page = mockPages.find(p => p.id === item.pageId)
                    if (!page) return null
                    return (
                      <div key={item.pageId} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-grey-50 transition-colors">
                        <Wrench className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary font-medium">{page.title}</p>
                          <p className="text-xs text-text-muted font-mono">{page.slug}</p>
                        </div>
                        <button
                          onClick={() => toggleResourceVisible(item.pageId)}
                          className={`p-1.5 rounded-md shrink-0 transition-colors ${item.visible ? 'text-brand-500 hover:bg-brand-50' : 'text-text-muted hover:bg-grey-100'}`}
                        >
                          {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeResource(item.pageId)}
                          className="p-1.5 rounded-md shrink-0 text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Blog Articles</p>
                <button
                  onClick={() => { setBlogPickerOpen(v => !v); setBlogSearch('') }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-md hover:bg-brand-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Article
                </button>
              </div>

              {blogPickerOpen && (() => {
                const addedIds = new Set(selectedCat.blog.map(b => b.postId))
                const available = mockBlogPosts.filter(p =>
                  !addedIds.has(p.id) &&
                  (!blogSearch || p.title.toLowerCase().includes(blogSearch.toLowerCase()) || p.category.toLowerCase().includes(blogSearch.toLowerCase()))
                )
                return (
                  <div className="rounded-xl border border-border shadow-sm mb-3 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-grey-50">
                      <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <input
                        autoFocus
                        value={blogSearch}
                        onChange={e => setBlogSearch(e.target.value)}
                        placeholder="Search blog posts…"
                        className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
                      />
                      {blogSearch && (
                        <button onClick={() => setBlogSearch('')} className="text-text-muted hover:text-text-primary">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {available.length === 0 ? (
                        <div className="flex flex-col items-center gap-1.5 py-6 text-text-muted">
                          <BookOpen className="w-5 h-5" />
                          <p className="text-xs">{blogSearch ? 'No matching posts' : 'All posts already added'}</p>
                        </div>
                      ) : available.map(post => (
                        <button
                          key={post.id}
                          onClick={() => addBlogPost(post.id)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-grey-50 transition-colors text-left border-b border-border last:border-0"
                        >
                          <span className="inline-block text-[10px] font-semibold text-[#04619A] bg-[#EFF8FF] px-1.5 py-0.5 rounded shrink-0 mt-0.5">{post.category}</span>
                          <span className="text-sm text-text-primary leading-snug">{post.title}</span>
                          {post.status === 'draft' && (
                            <span className="text-[10px] font-semibold text-text-muted bg-grey-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Draft</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {selectedCat.blog.length === 0 ? (
                <p className="text-xs text-text-muted italic">No blog articles linked. Click "Add Article" to add one.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedCat.blog.map(item => {
                    const post = mockBlogPosts.find(p => p.id === item.postId)
                    if (!post) return null
                    return (
                      <div key={item.postId} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-grey-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[10px] font-semibold text-[#04619A] bg-[#EFF8FF] px-1.5 py-0.5 rounded mb-0.5">{post.category}</span>
                          <p className="text-sm text-text-primary font-medium leading-snug">{post.title}</p>
                        </div>
                        <button
                          onClick={() => toggleBlogPostVisible(item.postId)}
                          className={`p-1.5 rounded-md shrink-0 transition-colors ${item.visible ? 'text-brand-500 hover:bg-brand-50' : 'text-text-muted hover:bg-grey-100'}`}
                        >
                          {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeBlogPost(item.postId)}
                          className="p-1.5 rounded-md shrink-0 text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'live', label: 'Live Menu', Icon: Monitor },
  { id: 'structure', label: 'Structure', Icon: Settings2 },
]

export function MegaMenu() {
  const [tab, setTab] = useState('live')
  const [navLinks, setNavLinks] = useState(INITIAL_NAV_LINKS)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mega Menu"
        subtitle="Configure what appears in the site's navigation mega menu"
        actions={<Button variant="primary" onClick={() => toast('Mega menu saved', 'success')}>Save Changes</Button>}
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border -mt-2">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'live'
        ? <LiveMenuTab navLinks={navLinks} categories={categories} />
        : <StructureTab navLinks={navLinks} setNavLinks={setNavLinks} categories={categories} setCategories={setCategories} />
      }
    </div>
  )
}
