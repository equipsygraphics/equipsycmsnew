import { useState } from 'react'
import { ShieldAlert, Bell, Lock, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Field, Input, Select, Toggle } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'

export function AdminSettings() {
  const [security, setSecurity] = useState({
    twoFactorRequired: false,
    loginAttempts: 5,
    ipAllowlist: '',
    passwordExpiry: 90,
    auditLog: true,
  })

  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowStock: true,
    newQuote: true,
    tradeApplication: true,
    builderPack: false,
    newSubscriber: false,
    notifyEmail: 'admin@equipsy.com.au',
  })

  const setSec = (k, v) => setSecurity(s => ({ ...s, [k]: v }))
  const setNotif = (k, v) => setNotifications(n => ({ ...n, [k]: v }))

  const handleSave = () => toast('Admin settings saved', 'success')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin Settings"
        subtitle="Security, notifications, and system configuration."
        actions={<Button variant="primary" onClick={handleSave}>Save Changes</Button>}
      />

      {/* Security */}
      <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-error-500/10 flex items-center justify-center"><ShieldAlert className="w-4 h-4 text-error-500" /></div>
          <p className="text-sm font-semibold text-text-primary">Security</p>
        </div>
        <Toggle label="Require two-factor authentication for all admin users" checked={security.twoFactorRequired} onChange={v => setSec('twoFactorRequired', v)} />
        <Toggle label="Enable audit log (record all admin actions)" checked={security.auditLog} onChange={v => setSec('auditLog', v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Max Login Attempts" hint="Lock account after N failed attempts">
            <Input type="number" value={security.loginAttempts} onChange={e => setSec('loginAttempts', Number(e.target.value))} min={1} max={20} />
          </Field>
          <Field label="Password Expiry (days)" hint="Force password reset after N days">
            <Input type="number" value={security.passwordExpiry} onChange={e => setSec('passwordExpiry', Number(e.target.value))} />
          </Field>
        </div>
        <Field label="IP Allowlist" hint="Comma-separated IPs. Leave blank to allow all.">
          <Input value={security.ipAllowlist} onChange={e => setSec('ipAllowlist', e.target.value)} placeholder="e.g. 203.0.113.1, 198.51.100.0" />
        </Field>
      </div>

      {/* Notifications */}
      <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><Bell className="w-4 h-4 text-brand-500" /></div>
          <p className="text-sm font-semibold text-text-primary">Admin Notifications</p>
        </div>
        <Field label="Notify email address">
          <Input type="email" value={notifications.notifyEmail} onChange={e => setNotif('notifyEmail', e.target.value)} />
        </Field>
        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Send notifications for</p>
          {[
            { key: 'newOrder', label: 'New order placed' },
            { key: 'lowStock', label: 'Product low stock alert' },
            { key: 'newQuote', label: 'New quote request received' },
            { key: 'tradeApplication', label: 'Trade account application' },
            { key: 'builderPack', label: 'Builder pack request' },
            { key: 'newSubscriber', label: 'New newsletter subscriber' },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <p className="text-sm text-text-secondary">{opt.label}</p>
              <Toggle checked={notifications[opt.key]} onChange={v => setNotif(opt.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* System */}
      <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-grey-100 flex items-center justify-center"><Lock className="w-4 h-4 text-text-muted" /></div>
          <p className="text-sm font-semibold text-text-primary">System</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Clear CMS Cache', desc: 'Force reload all cached data', action: () => toast('CMS cache cleared', 'success'), icon: RefreshCw, variant: 'secondary' },
            { label: 'Rebuild Search Index', desc: 'Re-index all products and pages', action: () => toast('Search index rebuilt', 'success'), icon: RefreshCw, variant: 'secondary' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-border p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
              </div>
              <Button variant={item.variant} size="sm" icon={<item.icon className="w-3.5 h-3.5" />} onClick={item.action}>Run</Button>
            </div>
          ))}
        </div>
        <div className="bg-error-500/5 border border-error-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Reset Demo Data</p>
            <p className="text-xs text-text-muted">Restore all mock data to default state</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => toast('Demo data reset to defaults', 'success')}>Reset</Button>
        </div>
      </div>
    </div>
  )
}
