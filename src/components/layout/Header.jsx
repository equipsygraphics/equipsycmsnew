import { Bell, Search, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export function Header({ title }) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          placeholder="Search…"
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-bg text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-grey-50" onClick={() => setNotifOpen(o => !o)}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
        </button>
        <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-grey-50">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Notification dropdown (mock) */}
      {notifOpen && (
        <div className="absolute right-6 top-14 w-80 bg-surface border border-border rounded-xl shadow-sm z-30 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">Notifications</p>
            <button className="text-xs text-brand-500 hover:underline" onClick={() => setNotifOpen(false)}>Mark all read</button>
          </div>
          {[
            { text: 'New order #1048 received', time: '2 min ago', unread: true },
            { text: 'Quote request from Sarah M.', time: '14 min ago', unread: true },
            { text: 'Trade account application: MedEquip', time: '1 hr ago', unread: false },
          ].map((n, i) => (
            <div key={i} className={`flex gap-3 px-4 py-3 hover:bg-grey-50 cursor-pointer border-b border-border last:border-0 ${n.unread ? 'bg-brand-50/40' : ''}`} onClick={() => setNotifOpen(false)}>
              {n.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
              <div className={n.unread ? '' : 'ml-5'}>
                <p className="text-sm text-text-primary">{n.text}</p>
                <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
