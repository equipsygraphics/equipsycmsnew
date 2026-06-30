import { useState } from 'react'
import { Plus, Settings2, X, ChevronDown, Check } from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import { toast } from '../components/ui/Toast'
import { KpiCard } from './dashboard/KpiCard'
import { CustomerBreakdown } from './dashboard/CustomerBreakdown'
import { VendorRating } from './dashboard/VendorRating'
import { RevenueSummary } from './dashboard/RevenueSummary'
import { RecentOrders } from './dashboard/RecentOrders'
import { LowStock } from './dashboard/LowStock'
import { TrafficSummary } from './dashboard/TrafficSummary'
import { PendingRequests } from './dashboard/PendingRequests'
import { kpiMetrics, WIDGET_CATALOG, DEFAULT_WIDGETS } from '../data/mockDashboard'

const PERIOD_PRESETS = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month', 'Last month', 'This year', 'Custom range']

function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary hover:bg-grey-50 transition-colors"
      >
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 text-text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-52 bg-surface border border-border rounded-xl shadow-sm z-20 py-1.5 overflow-hidden">
          {PERIOD_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => { onChange(p); setOpen(false); toast(`Period set to "${p}"`, 'info') }}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-grey-50 transition-colors ${value === p ? 'text-brand-500 font-medium' : 'text-text-primary'}`}
            >
              {p}
              {value === p && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function WidgetGalleryModal({ open, onClose, activeWidgets, onToggle }) {
  return (
    <Modal open={open} onClose={onClose} title="Widget gallery" size="md">
      <p className="text-sm text-text-muted mb-4">Add or remove widgets from your dashboard.</p>
      <div className="flex flex-col gap-2">
        {WIDGET_CATALOG.map(w => {
          const active = activeWidgets.includes(w.id)
          return (
            <div key={w.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-grey-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-text-primary">{w.label}</p>
                <p className="text-xs text-text-muted capitalize">{w.size} width</p>
              </div>
              <button
                onClick={() => onToggle(w.id)}
                className={`w-8 h-5 rounded-full transition-colors relative ${active ? 'bg-brand-500' : 'bg-grey-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${active ? 'translate-x-3' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export function Dashboard() {
  const [period, setPeriod] = useState('Last 30 days')
  const [editMode, setEditMode] = useState(false)
  const [activeWidgets, setActiveWidgets] = useState(DEFAULT_WIDGETS)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const removeWidget = (id) => {
    setActiveWidgets(prev => prev.filter(w => w !== id))
    toast(`Widget removed. Add it back from the widget gallery.`, 'info')
  }

  const toggleWidget = (id) => {
    setActiveWidgets(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  const has = (id) => activeWidgets.includes(id)

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Welcome back, Krist.</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker value={period} onChange={setPeriod} />
          <button
            onClick={() => setGalleryOpen(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-secondary hover:bg-grey-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add widget
          </button>
          <button
            onClick={() => {
              setEditMode(e => !e)
              if (editMode) toast('Layout saved', 'success')
            }}
            className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition-colors ${editMode ? 'bg-brand-500 text-white border-brand-500' : 'border-border bg-surface text-text-secondary hover:bg-grey-50'}`}
          >
            {editMode ? <><Check className="w-4 h-4" /> Done</> : <><Settings2 className="w-4 h-4" /> Edit</>}
          </button>
        </div>
      </div>

      {editMode && (
        <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 text-sm text-brand-700">
          <Settings2 className="w-4 h-4 shrink-0" />
          <span>Edit mode — click <strong>×</strong> on any widget to remove it, or use <strong>Add widget</strong> to restore removed widgets. Click <strong>Done</strong> to save.</span>
        </div>
      )}

      {/* KPI row */}
      {has('kpi') && (
        <div className="grid grid-cols-3 gap-4 relative">
          {editMode && (
            <button onClick={() => removeWidget('kpi')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-grey-700 text-white text-xs flex items-center justify-center hover:bg-error-500 z-10">×</button>
          )}
          {kpiMetrics.map(m => (
            <KpiCard key={m.id} metric={m} editMode={false} />
          ))}
        </div>
      )}

      {/* Customer breakdown + Vendor rating */}
      {(has('customer') || has('vendor')) && (
        <div className="grid grid-cols-3 gap-4" style={{ minHeight: 300 }}>
          {has('customer') && (
            <div className="col-span-1">
              <CustomerBreakdown editMode={editMode} onRemove={removeWidget} />
            </div>
          )}
          {has('vendor') && (
            <div className={has('customer') ? 'col-span-2' : 'col-span-3'}>
              <VendorRating editMode={editMode} onRemove={removeWidget} />
            </div>
          )}
        </div>
      )}

      {/* Revenue summary */}
      {has('revenue') && <RevenueSummary editMode={editMode} onRemove={removeWidget} />}

      {/* Recent orders + Low stock */}
      {(has('recent_orders') || has('low_stock')) && (
        <div className="grid grid-cols-2 gap-4">
          {has('recent_orders') && <RecentOrders editMode={editMode} onRemove={removeWidget} />}
          {has('low_stock') && <LowStock editMode={editMode} onRemove={removeWidget} />}
        </div>
      )}

      {/* Traffic + Pending requests */}
      {(has('traffic') || has('requests')) && (
        <div className="grid grid-cols-2 gap-4">
          {has('traffic') && <TrafficSummary editMode={editMode} onRemove={removeWidget} />}
          {has('requests') && <PendingRequests editMode={editMode} onRemove={removeWidget} />}
        </div>
      )}

      {activeWidgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-muted">
          <Settings2 className="w-10 h-10" />
          <p className="font-medium text-text-secondary">No widgets on your dashboard</p>
          <button onClick={() => setGalleryOpen(true)} className="text-sm text-brand-500 hover:underline">Add widgets from the gallery</button>
        </div>
      )}

      <WidgetGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        activeWidgets={activeWidgets}
        onToggle={toggleWidget}
      />
    </div>
  )
}
