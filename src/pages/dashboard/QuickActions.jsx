import { Link } from 'react-router-dom'
import { Plus, FileEdit, Package, ClipboardList, Ticket, UserPlus } from 'lucide-react'

const ICON_MAP = {
  plus:    Plus,
  edit:    FileEdit,
  package: Package,
  inbox:   ClipboardList,
  coupon:  Ticket,
  user:    UserPlus,
}

const ACTIONS = [
  { label: 'Add Product',    icon: 'plus',    to: '/products/new',   desc: 'Create a new product listing'   },
  { label: 'New Blog Post',  icon: 'edit',    to: '/blog/new',       desc: 'Write and publish a blog post'  },
  { label: 'Process Orders', icon: 'package', to: '/orders',         desc: 'Review and fulfil open orders'  },
  { label: 'View Requests',  icon: 'inbox',   to: '/quote-requests', desc: 'Quote, trade & builder requests'},
]

export function QuickActions({ editMode, onRemove }) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5 relative">
      {editMode && (
        <button onClick={() => onRemove('quick_actions')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
      )}
      <p className="text-sm font-semibold text-text-primary mb-4">Quick Actions</p>
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map(action => {
          const Icon = ICON_MAP[action.icon] ?? Plus
          return (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-brand-300 hover:bg-brand-50 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-grey-100 group-hover:bg-brand-100 flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4 text-text-muted group-hover:text-brand-600 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary group-hover:text-brand-700 transition-colors">{action.label}</p>
                <p className="text-xs text-text-muted mt-0.5 leading-snug">{action.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
