import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, ShoppingBag, Tag, Navigation, ShoppingCart, Users,
  FileText, Hash, BookOpen, FolderOpen, MessageSquare, Briefcase, Package,
  Megaphone, Ticket, Mail, Rss, BarChart2, Globe, Search, Settings, UserCog, Sliders,
  ChevronDown, ChevronRight, ClipboardList,
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  {
    label: 'Commerce', icon: ShoppingBag, children: [
      { label: 'Products', icon: ShoppingBag, to: '/products' },
      { label: 'Attributes', icon: Tag, to: '/attributes' },
      { label: 'Mega Menu', icon: Navigation, to: '/mega-menu' },
      { label: 'Orders', icon: ShoppingCart, to: '/orders' },
      { label: 'Customers', icon: Users, to: '/customers' },
    ],
  },
  {
    label: 'Content', icon: FileText, children: [
      { label: 'Pages', icon: FileText, to: '/pages' },
      { label: 'Tags', icon: Hash, to: '/tags' },
      { label: 'Blog', icon: BookOpen, to: '/blog' },
      { label: 'Media & Resources', icon: FolderOpen, to: '/media' },
    ],
  },
  { label: 'Forms', icon: ClipboardList, to: '/forms' },
  { label: 'Enquiries', icon: MessageSquare, to: '/enquiries' },
  {
    label: 'Requests', icon: Briefcase, children: [
      { label: 'Quote Requests', icon: MessageSquare, to: '/quote-requests' },
      { label: 'Trade Account', icon: Briefcase, to: '/trade-account' },
      { label: 'Builder Pack', icon: Package, to: '/builder-pack' },
    ],
  },
  { label: 'Subscribers', icon: Rss, to: '/subscribers' },
  {
    label: 'Marketing', icon: Megaphone, children: [
      { label: 'Campaigns', icon: Megaphone, to: '/campaigns' },
      { label: 'Coupons & Vouchers', icon: Ticket, to: '/coupons' },
      { label: 'Emails', icon: Mail, to: '/emails' },
    ],
  },
  {
    label: 'Analytics', icon: BarChart2, children: [
      { label: 'Sales', icon: BarChart2, to: '/analytics/sales' },
      { label: 'Website Performance', icon: Globe, to: '/analytics/performance' },
      { label: 'SEO', icon: Search, to: '/analytics/seo' },
    ],
  },
  { label: 'Settings', icon: Settings, to: '/settings' },
  { label: 'Accounts & Users', icon: UserCog, to: '/accounts' },
  { label: 'Admin Settings', icon: Sliders, to: '/admin-settings' },
]

function NavGroup({ item, defaultOpen }) {
  const location = useLocation()
  const isActive = item.children?.some(c => location.pathname.startsWith(c.to))
  const [open, setOpen] = useState(defaultOpen || isActive)
  const Icon = item.icon

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-[#9DA4AE] hover:text-white hover:bg-white/5'}`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="mt-0.5 ml-3 pl-4 border-l border-white/10 flex flex-col gap-0.5">
          {item.children.map(child => {
            const CIcon = child.icon
            return (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors ${isActive ? 'bg-white text-[#0D121C] font-medium' : 'text-[#9DA4AE] hover:text-white hover:bg-white/5'}`
                }
              >
                <CIcon className="w-3.5 h-3.5 shrink-0" />
                {child.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="w-[280px] h-full bg-sidebar flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/8">
        <img src="/equipsy-logo.png" alt="Equipsy" className="h-7 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(item =>
          item.children ? (
            <NavGroup key={item.label} item={item} defaultOpen />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white text-[#0D121C]' : 'text-[#9DA4AE] hover:text-white hover:bg-white/5'}`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon
                return (
                  <>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </>
                )
              }}
            </NavLink>
          )
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            KS
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">Krist S.</p>
            <p className="text-grey-300 text-xs truncate">graphics@equipsy.com.au</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
