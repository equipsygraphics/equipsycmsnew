import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Building2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { mockTradeAccounts } from '../../data/mockRequests'

const STATUS_VARIANT = { pending: 'warning', approved: 'success', declined: 'error' }

const MOCK_ABN_DB = {
  '12 345 678 901': { name: 'SDA Living Co.', gst: true, status: 'Active' },
  '98 765 432 109': { name: 'Peninsula Aged Care Pty Ltd', gst: true, status: 'Active' },
  '55 444 333 222': { name: 'QuickCare Solutions Pty Ltd', gst: false, status: 'Active' },
  '77 888 999 000': { name: 'HomeMod Specialists', gst: true, status: 'Active' },
  '11 222 333 444': { name: 'Coastal Disability Services Inc', gst: false, status: 'Cancelled' },
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm text-text-primary">{value || '—'}</p>
    </div>
  )
}

export function TradeAccountDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const found = mockTradeAccounts.find(a => a.id === id) || mockTradeAccounts[0]
  const [account, setAccount] = useState(found)
  const [form, setForm] = useState({ ...found })
  const [abnInput, setAbnInput] = useState(found.abn)
  const [abnResult, setAbnResult] = useState(null)
  const [abnLooking, setAbnLooking] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const lookupABN = () => {
    const normalized = abnInput.trim()
    setAbnLooking(true)
    setTimeout(() => {
      const result = MOCK_ABN_DB[normalized]
      if (result) {
        setAbnResult({ ...result, abn: normalized })
        toast(`ABN verified: ${result.name}`, 'success')
      } else {
        setAbnResult(null)
        toast('ABN not found in the ABR. Please check and try again.', 'error')
      }
      setAbnLooking(false)
    }, 900)
  }

  const handleApprove = () => {
    const updated = { ...account, ...form, status: 'approved', approved: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }
    setAccount(updated)
    setForm(updated)
    toast(`Trade account approved for ${account.company}`, 'success')
  }

  const handleDecline = () => {
    const updated = { ...account, ...form, status: 'declined' }
    setAccount(updated)
    setForm(updated)
    toast(`Trade account declined for ${account.company}`, 'error')
  }

  const handleSave = () => {
    setAccount({ ...account, ...form })
    toast('Account updated', 'success')
  }

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate('/trade-account')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Trade Accounts
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">{account.company}</h1>
              <Badge variant={STATUS_VARIANT[account.status]} label={account.status.charAt(0).toUpperCase() + account.status.slice(1)} dot />
            </div>
            <p className="text-sm text-text-muted font-mono">{account.id} · ABN {account.abn}</p>
          </div>
        </div>
        {account.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={handleDecline}>Decline</Button>
            <Button variant="primary" icon={<CheckCircle className="w-4 h-4" />} onClick={handleApprove}>Approve Account</Button>
          </div>
        )}
        {account.status !== 'pending' && (
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Main */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* ABN Verification */}
          <SectionCard title="ABN Verification">
            <div className="flex gap-2">
              <Input value={abnInput} onChange={e => setAbnInput(e.target.value)} placeholder="XX XXX XXX XXX" className="flex-1 font-mono" />
              <Button variant="secondary" onClick={lookupABN} loading={abnLooking}>Lookup ABN</Button>
            </div>
            {abnResult && (
              <div className={`rounded-lg p-3 text-sm ${abnResult.status === 'Active' ? 'bg-success-500/10 border border-success-500/20' : 'bg-error-500/10 border border-error-500/20'}`}>
                <p className="font-semibold text-text-primary">{abnResult.name}</p>
                <div className="flex gap-4 mt-1 text-xs text-text-secondary">
                  <span>ABR Status: <strong className={abnResult.status === 'Active' ? 'text-success-500' : 'text-error-500'}>{abnResult.status}</strong></span>
                  <span>GST Registered: <strong>{abnResult.gst ? 'Yes' : 'No'}</strong></span>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Contact Details */}
          <SectionCard title="Contact Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contact Name"><Input value={form.contact ?? ''} onChange={e => set('contact', e.target.value)} /></Field>
              <Field label="Email"><Input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} /></Field>
              <Field label="Phone"><Input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} /></Field>
              <Field label="Account Type">
                <Select value={form.type ?? ''} onChange={e => set('type', e.target.value)}>
                  <option>SDA Provider</option>
                  <option>Aged Care</option>
                  <option>Builder</option>
                  <option>Other</option>
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* Internal Notes */}
          <SectionCard title="Internal Notes">
            <Textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={4} placeholder="Notes for internal use only..." />
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Application Info">
            <InfoRow label="Application ID" value={account.id} />
            <InfoRow label="Date Applied" value={account.applied} />
            {account.approved && <InfoRow label="Date Approved" value={account.approved} />}
            <InfoRow label="Account Type" value={account.type} />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Status</p>
              <Badge variant={STATUS_VARIANT[account.status]} label={account.status.charAt(0).toUpperCase() + account.status.slice(1)} dot />
            </div>
          </SectionCard>

          {account.status === 'pending' && (
            <div className="flex flex-col gap-2">
              <Button variant="primary" icon={<CheckCircle className="w-4 h-4" />} onClick={handleApprove} className="w-full justify-center">Approve Account</Button>
              <Button variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={handleDecline} className="w-full justify-center">Decline</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
