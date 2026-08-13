import { useRef, useState } from 'react'
import ExcelJS from 'exceljs'
import { Upload, Download, FileSpreadsheet, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../components/ui/Toast'
import { CATEGORIES } from '../../data/mockProducts'

const TEMPLATE_ROWS = [
  ['Name', 'Type', 'Unit', 'Categories', 'Values'],
  ['Diameter', 'Numeric', 'mm', 'Modular Grab Rails, Angled Toilet Grab Rails', '25, 28, 32, 35, 38'],
  ['Material', 'Categorical', '', 'Modular Grab Rails, Fold Down Shower Seat, Antislip Tapes', 'Aluminium, Stainless Steel, Chrome'],
]

function splitList(str) {
  return String(str ?? '').split(/[,;]/).map(s => s.trim()).filter(Boolean)
}

// Reads the first worksheet, maps columns by header name (order-independent)
// so a re-arranged template still imports correctly.
async function parseWorkbook(arrayBuffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)
  const sheet = workbook.worksheets[0]
  if (!sheet) return []

  const headerRow = sheet.getRow(1)
  const headers = {}
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? '').trim().toLowerCase()
  })

  const rows = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const obj = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber]
      if (key) obj[key] = cell.value != null ? String(cell.value).trim() : ''
    })
    if (Object.values(obj).some(v => v)) rows.push(obj)
  })
  return rows
}

// Turns raw sheet rows into an import plan: one entry per unique attribute
// name (case-insensitive), merged against duplicates within the file itself
// and against any attribute that already exists in the CMS.
function buildImportPlan(rawRows, existingAttributes) {
  const byName = new Map()
  const skipped = []

  for (const row of rawRows) {
    const name = String(row.name ?? '').trim()
    if (!name) { skipped.push(row); continue }

    const typeRaw = String(row.type ?? 'categorical').trim().toLowerCase()
    const type = typeRaw.startsWith('num') ? 'numeric' : 'categorical'
    const unit = String(row.unit ?? '').trim()

    const rawCategories = splitList(row.categories)
    const categories = rawCategories.filter(c => CATEGORIES.includes(c))
    const unmatchedCategories = rawCategories.filter(c => !CATEGORIES.includes(c))

    const rawValues = splitList(row.values)
    const values = type === 'numeric' ? rawValues.filter(v => !Number.isNaN(Number(v))) : rawValues
    const invalidValueCount = rawValues.length - values.length

    const key = name.toLowerCase()
    if (byName.has(key)) {
      const existing = byName.get(key)
      existing.categories = Array.from(new Set([...existing.categories, ...categories]))
      existing.values = Array.from(new Set([...existing.values, ...values]))
      existing.unmatchedCategories = Array.from(new Set([...existing.unmatchedCategories, ...unmatchedCategories]))
      existing.invalidValueCount += invalidValueCount
    } else {
      byName.set(key, { name, type, unit, categories, unmatchedCategories, values, invalidValueCount })
    }
  }

  const plan = Array.from(byName.values()).map(row => {
    const match = existingAttributes.find(a => a.name.toLowerCase() === row.name.toLowerCase())
    if (!match) return { ...row, action: 'create' }

    const newValues = row.values.filter(v => !match.values.includes(v))
    const newCategories = row.categories.filter(c => !match.categories.includes(c))
    return {
      ...row,
      action: 'merge',
      targetId: match.id,
      type: match.type,
      unit: match.unit,
      newValueCount: newValues.length,
      newCategoryCount: newCategories.length,
      mergedValues: Array.from(new Set([...match.values, ...row.values])),
      mergedCategories: Array.from(new Set([...match.categories, ...row.categories])),
    }
  })

  return { plan, skippedCount: skipped.length }
}

async function downloadTemplate() {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Attributes')
  sheet.addRows(TEMPLATE_ROWS)
  sheet.getRow(1).font = { bold: true }
  sheet.columns.forEach(col => { col.width = 22 })
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'attributes-import-template.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

export function AttributesImportModal({ open, onClose, attributes, addAttribute, updateAttribute }) {
  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState(null)
  const [plan, setPlan] = useState(null)
  const [skippedCount, setSkippedCount] = useState(0)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)

  const reset = () => {
    setFileName(null)
    setPlan(null)
    setSkippedCount(0)
    setParseError(null)
  }

  const handleClose = () => { reset(); onClose() }

  const handleFile = async (file) => {
    if (!file) return
    setFileName(file.name)
    setParsing(true)
    setParseError(null)
    try {
      const buffer = await file.arrayBuffer()
      const rawRows = await parseWorkbook(buffer)
      const { plan: builtPlan, skippedCount: skipped } = buildImportPlan(rawRows, attributes)
      setPlan(builtPlan)
      setSkippedCount(skipped)
      if (builtPlan.length === 0) setParseError('No usable rows found — check the file matches the template columns (Name, Type, Unit, Categories, Values).')
    } catch (err) {
      setParseError(`Couldn't read this file — make sure it's a valid .xlsx export. (${err.message})`)
    } finally {
      setParsing(false)
    }
  }

  const handleImport = () => {
    plan.forEach(item => {
      if (item.action === 'create') {
        addAttribute({ name: item.name, type: item.type, unit: item.unit, categories: item.categories, values: item.values })
      } else {
        updateAttribute(item.targetId, { categories: item.mergedCategories, values: item.mergedValues })
      }
    })
    const created = plan.filter(p => p.action === 'create').length
    const merged = plan.filter(p => p.action === 'merge').length
    toast(`Import complete — ${created} new attribute${created === 1 ? '' : 's'}, ${merged} updated`, 'success')
    handleClose()
  }

  const createCount = plan?.filter(p => p.action === 'create').length ?? 0
  const mergeCount = plan?.filter(p => p.action === 'merge').length ?? 0

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Attributes from Excel"
      size="xl"
      footer={
        plan && plan.length > 0 ? (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={handleImport}>
              Import {createCount > 0 && `${createCount} new`}{createCount > 0 && mergeCount > 0 && ', '}{mergeCount > 0 && `${mergeCount} updated`}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 bg-grey-50 border border-border rounded-xl px-4 py-3">
          <div className="text-sm text-text-secondary">
            <p className="font-medium text-text-primary">Expected columns</p>
            <p className="text-xs text-text-muted mt-0.5">Name, Type (Categorical/Numeric), Unit, Categories (comma-separated), Values (comma-separated)</p>
          </div>
          <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={downloadTemplate}>
            Download Template
          </Button>
        </div>

        {!fileName ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl px-6 py-10 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
          >
            <Upload className="w-6 h-6 text-text-muted" />
            <p className="text-sm font-medium text-text-primary">Click to choose an .xlsx file</p>
            <p className="text-xs text-text-muted">Attributes matching an existing name are merged in; new names are created.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="text-sm text-text-primary truncate">{fileName}</span>
            </div>
            <button onClick={() => { fileInputRef.current.value = ''; reset() }} className="p-1 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {parsing && <p className="text-sm text-text-muted text-center py-4">Reading file…</p>}

        {parseError && (
          <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/20 rounded-xl px-4 py-3 text-sm text-error-500">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {plan && plan.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              {plan.length} attribute{plan.length === 1 ? '' : 's'} parsed — {createCount} new, {mergeCount} will merge into existing
              {skippedCount > 0 && `, ${skippedCount} row${skippedCount === 1 ? '' : 's'} skipped (no name)`}
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full min-w-max text-sm">
                  <thead>
                    <tr className="border-b border-border bg-grey-50 sticky top-0">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Categories</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Values</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.map(item => (
                      <tr key={item.name} className="border-b border-border last:border-0">
                        <td className="px-3 py-2.5 font-medium text-text-primary whitespace-nowrap">{item.name}</td>
                        <td className="px-3 py-2.5 text-text-secondary whitespace-nowrap">{item.type === 'numeric' ? `Numeric${item.unit ? ` (${item.unit})` : ''}` : 'Categorical'}</td>
                        <td className="px-3 py-2.5 text-text-secondary">
                          {item.categories.join(', ') || '—'}
                          {item.unmatchedCategories.length > 0 && (
                            <span className="block text-xs text-warning-600">{item.unmatchedCategories.length} unrecognised, ignored</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary">
                          {item.values.length} value{item.values.length === 1 ? '' : 's'}
                          {item.invalidValueCount > 0 && (
                            <span className="block text-xs text-warning-600">{item.invalidValueCount} non-numeric, ignored</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {item.action === 'create' ? (
                            <Badge variant="success" label="New attribute" />
                          ) : (
                            <Badge variant="info" label={`Merge (+${item.newValueCount} values${item.newCategoryCount ? `, +${item.newCategoryCount} categories` : ''})`} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
