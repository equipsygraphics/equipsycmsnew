import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Field, Input, Textarea } from '../../../components/ui/FormField'
import { toast } from '../../../components/ui/Toast'

const MAM_COLS = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'sku', label: 'SKU' },
  { key: 'mamPrice', label: 'MAM Price', csvValue: r => (r.mamPrice == null ? '' : `$${r.mamPrice.toFixed(2)}`) },
]

function buildMamCsv(rows) {
  const header = MAM_COLS.map(c => `"${c.label}"`).join(',')
  const lines = rows.map(row => MAM_COLS.map(c => {
    const val = c.csvValue ? c.csvValue(row) : (row[c.key] ?? '')
    return `"${String(val).replace(/"/g, '""')}"`
  }).join(','))
  return [header, ...lines].join('\n')
}

const DEFAULT_MESSAGE = `Hi team,

Please note that pricing has been updated for some products. The current Member At Cost (MAM) price list is attached for your reference.

Thanks,
Equipsy`

// There's no real mail server behind this (same as the rest of the app's
// simulated actions — the scrape bot, etc.) — "sending" downloads the actual
// CSV that would be attached, so there's a real artifact to check, and
// confirms via toast. `rows` is the FULL, unfiltered price list (not
// whatever the on-screen column filters currently narrow it to) since MAM
// needs the complete list regardless of what the CMS user happened to be
// looking at.
export function EmailMamPriceListModal({ open, onClose, rows }) {
  const [to, setTo] = useState('mam@equipsy.com.au')
  const [subject, setSubject] = useState('Updated Price List — Pricing Changes')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)

  // Custom-quote products have no real MAM price (POA) — leaving them out
  // of a "here's the updated pricing" notice avoids a confusing $0 row.
  const includedRows = rows.filter(r => r.retailPrice > 0)
  const filename = `mam-price-list-${new Date().toISOString().slice(0, 10)}.csv`

  const handleSend = () => {
    if (!to.trim()) {
      toast('Enter a recipient email address first.', 'error')
      return
    }
    const csv = buildMamCsv(includedRows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast(`Email sent to ${to} — updated MAM price list attached.`, 'success')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Email Price List to MAM"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSend}>Send Email</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="To">
          <Input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="mam@equipsy.com.au" />
        </Field>
        <Field label="Subject">
          <Input value={subject} onChange={e => setSubject(e.target.value)} />
        </Field>
        <Field label="Message">
          <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={7} />
        </Field>
        <div className="bg-grey-50 border border-border rounded-lg px-3 py-2.5 text-xs text-text-muted">
          <span className="font-medium text-text-secondary">Attachment:</span> {filename} — Name, Category, SKU, and MAM
          Price for {includedRows.length} product{includedRows.length === 1 ? '' : 's'}.
        </div>
      </div>
    </Modal>
  )
}
