import { useState } from 'react'
import { CheckCircle, XCircle, Link, Unlink } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Field, Input, Select, Toggle } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'

const TABS = ['Store Details', 'Shipping', 'Payments', 'Integrations', 'Advanced']

const INTEGRATIONS = [
  { id: 'shippit', name: 'Shippit', desc: 'Shipping automation', category: 'Shipping', connected: true },
  { id: 'klaviyo', name: 'Klaviyo', desc: 'Email marketing', category: 'Marketing', connected: true },
  { id: 'ga4', name: 'Google Analytics 4', desc: 'Web analytics', category: 'Analytics', connected: true },
  { id: 'sharepoint', name: 'SharePoint', desc: 'Media library sync', category: 'Storage', connected: true },
  { id: 'xero', name: 'Xero', desc: 'Accounting & invoicing', category: 'Finance', connected: false },
  { id: 'mailchimp', name: 'Mailchimp', desc: 'Email campaigns', category: 'Marketing', connected: false },
]

const SHIPPING_ZONES = [
  { id: 1, name: 'Australia Standard', carrier: 'Australia Post', rate: 'Flat $12.95', freeOver: 1000 },
  { id: 2, name: 'Australia Express', carrier: 'Australia Post', rate: 'Flat $24.95', freeOver: null },
  { id: 3, name: 'Heavy / Bulky', carrier: 'Freight', rate: 'Quote on checkout', freeOver: null },
]

export function Settings() {
  const [activeTab, setActiveTab] = useState('Store Details')
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [storeForm, setStoreForm] = useState({
    businessName: 'Equipsy Pty Ltd',
    abn: '71 234 567 890',
    email: 'admin@equipsy.com.au',
    phone: '1300 000 000',
    address: '123 Industry Drive, Sumner QLD 4074',
    currency: 'AUD',
    timezone: 'Australia/Brisbane',
    logo: null,
  })

  const [shippingForm, setShippingForm] = useState({
    freeShippingThreshold: 1000,
    defaultCarrier: 'Australia Post',
    shippit: true,
  })

  const [paymentForm, setPaymentForm] = useState({
    stripe: true,
    afterpay: true,
    bankTransfer: true,
    paypalEnabled: false,
    gstInclusive: true,
  })

  const [advancedForm, setAdvancedForm] = useState({
    maintenanceMode: false,
    allowGuestCheckout: true,
    requireAccountForTrade: true,
    lowStockThreshold: 8,
    sessionTimeout: 60,
  })

  const toggleIntegration = (id) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i
      const next = !i.connected
      toast(next ? `${i.name} connected` : `${i.name} disconnected`, next ? 'success' : 'error')
      return { ...i, connected: next }
    }))
  }

  const handleSave = () => toast('Settings saved', 'success')
  const setStore = (k, v) => setStoreForm(f => ({ ...f, [k]: v }))
  const setShipping = (k, v) => setShippingForm(f => ({ ...f, [k]: v }))
  const setPayment = (k, v) => setPaymentForm(f => ({ ...f, [k]: v }))
  const setAdvanced = (k, v) => setAdvancedForm(f => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        actions={<Button variant="primary" onClick={handleSave}>Save Changes</Button>}
      />

      <div className="flex gap-6 items-start">
        {/* Left sub-nav */}
        <div className="w-48 bg-surface rounded-xl border border-border shadow-card overflow-x-auto shrink-0">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-border last:border-0 transition-colors ${activeTab === tab ? 'bg-brand-50 text-brand-500 font-semibold' : 'text-text-secondary hover:bg-grey-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {activeTab === 'Store Details' && (
            <>
              <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
                <p className="text-sm font-semibold text-text-primary">Business Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Business Name"><Input value={storeForm.businessName} onChange={e => setStore('businessName', e.target.value)} /></Field>
                  <Field label="ABN"><Input value={storeForm.abn} onChange={e => setStore('abn', e.target.value)} /></Field>
                  <Field label="Store Email"><Input type="email" value={storeForm.email} onChange={e => setStore('email', e.target.value)} /></Field>
                  <Field label="Phone"><Input value={storeForm.phone} onChange={e => setStore('phone', e.target.value)} /></Field>
                </div>
                <Field label="Address"><Input value={storeForm.address} onChange={e => setStore('address', e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Currency">
                    <Select value={storeForm.currency} onChange={e => setStore('currency', e.target.value)}>
                      <option value="AUD">AUD â€” Australian Dollar</option>
                      <option value="USD">USD â€” US Dollar</option>
                    </Select>
                  </Field>
                  <Field label="Timezone">
                    <Select value={storeForm.timezone} onChange={e => setStore('timezone', e.target.value)}>
                      <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                      <option value="Australia/Melbourne">Australia/Melbourne</option>
                      <option value="Australia/Perth">Australia/Perth (AWST)</option>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* Integrations shown on Store Details too (per Figma) */}
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">Integrations</p>
                </div>
                {integrations.map((int, i) => (
                  <div key={int.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{int.name}</p>
                      <p className="text-xs text-text-muted">{int.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${int.connected ? 'text-success-500' : 'text-text-muted'}`}>
                        {int.connected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {int.connected ? 'Connected' : 'Not connected'}
                      </span>
                      <Button variant="secondary" size="sm" icon={int.connected ? <Unlink className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
                        onClick={() => toggleIntegration(int.id)}>
                        {int.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'Shipping' && (
            <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-5">
              <p className="text-sm font-semibold text-text-primary">Shipping Settings</p>
              <Field label="Free Shipping Threshold (AUD)">
                <div className="flex items-center">
                  <span className="h-10 px-3 bg-grey-50 border border-r-0 border-border rounded-l-lg text-sm text-text-muted flex items-center">$</span>
                  <Input type="number" value={shippingForm.freeShippingThreshold} onChange={e => setShipping('freeShippingThreshold', e.target.value)} className="rounded-l-none" />
                </div>
              </Field>
              <Toggle label="Use Shippit for shipping automation" checked={shippingForm.shippit} onChange={v => setShipping('shippit', v)} />
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Shipping Zones</p>
                <div className="rounded-xl border border-border overflow-hidden">
                  {SHIPPING_ZONES.map((zone, i) => (
                    <div key={zone.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-border' : ''} hover:bg-grey-50 transition-colors`}>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{zone.name}</p>
                        <p className="text-xs text-text-muted">{zone.carrier} · {zone.rate}{zone.freeOver ? ` · Free over $${zone.freeOver}` : ''}</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => toast(`Editing "${zone.name}" â€” mock only`, 'info')}>Edit</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Payments' && (
            <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
              <p className="text-sm font-semibold text-text-primary">Payment Methods</p>
              {[
                { key: 'stripe', label: 'Stripe', desc: 'Credit & debit card payments' },
                { key: 'afterpay', label: 'Afterpay', desc: 'Buy now, pay later' },
                { key: 'bankTransfer', label: 'Bank Transfer', desc: 'Manual EFT for trade accounts' },
                { key: 'paypalEnabled', label: 'PayPal', desc: 'PayPal checkout' },
              ].map(method => (
                <div key={method.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{method.label}</p>
                    <p className="text-xs text-text-muted">{method.desc}</p>
                  </div>
                  <Toggle checked={paymentForm[method.key]} onChange={v => setPayment(method.key, v)} />
                </div>
              ))}
              <div className="border-t border-border pt-4">
                <Toggle label="Display prices GST inclusive" checked={paymentForm.gstInclusive} onChange={v => setPayment('gstInclusive', v)} />
              </div>
            </div>
          )}

          {activeTab === 'Integrations' && (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text-primary">Connected Services</p>
                <p className="text-xs text-text-muted mt-0.5">Manage third-party integrations</p>
              </div>
              {integrations.map((int, i) => (
                <div key={int.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{int.name}</p>
                    <p className="text-xs text-text-muted">{int.desc} · {int.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${int.connected ? 'text-success-500' : 'text-text-muted'}`}>
                      {int.connected ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {int.connected ? 'Connected' : 'Not connected'}
                    </span>
                    <Button variant="secondary" size="sm" icon={int.connected ? <Unlink className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
                      onClick={() => toggleIntegration(int.id)}>
                      {int.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                    {int.connected && <Button variant="ghost" size="sm" onClick={() => toast(`${int.name} settings â€” mock only`, 'info')}>Settings</Button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Advanced' && (
            <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
              <p className="text-sm font-semibold text-text-primary">Advanced Settings</p>
              {[
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to public visitors' },
                { key: 'allowGuestCheckout', label: 'Allow Guest Checkout', desc: 'Let customers checkout without an account' },
                { key: 'requireAccountForTrade', label: 'Require Account for Trade Pricing', desc: 'Trade prices hidden until logged in' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{opt.label}</p>
                    <p className="text-xs text-text-muted">{opt.desc}</p>
                  </div>
                  <Toggle checked={advancedForm[opt.key]} onChange={v => setAdvanced(opt.key, v)} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Field label="Low Stock Threshold" hint="Items at or below this qty show as low stock">
                  <Input type="number" value={advancedForm.lowStockThreshold} onChange={e => setAdvanced('lowStockThreshold', Number(e.target.value))} />
                </Field>
                <Field label="Session Timeout (minutes)">
                  <Input type="number" value={advancedForm.sessionTimeout} onChange={e => setAdvanced('sessionTimeout', Number(e.target.value))} />
                </Field>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Danger Zone</p>
                <div className="bg-error-500/5 border border-error-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Clear All Cache</p>
                    <p className="text-xs text-text-muted">Force refresh all cached data and images</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => toast('Cache cleared', 'success')}>Clear Cache</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
