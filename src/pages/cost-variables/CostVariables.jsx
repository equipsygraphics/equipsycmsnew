import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { useCostVariables } from '../../context/CostVariablesContext'

function EditableText({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-transparent text-sm text-text-primary outline-none rounded-md px-2 py-1.5 border border-transparent hover:border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors ${className}`}
    />
  )
}

// Rate card for freight, material, packaging, and labour costs used to build
// up product cost breakdowns — surfaced as a pop-up from the Product Cost
// tab (rather than its own sidebar page) since it's only ever referenced
// from there.
export function CostVariables() {
  const { costVariables, setCostVariables, addCostVariable, deleteCostVariable } = useCostVariables()

  const update = (id, field, value) => {
    setCostVariables(prev => prev.map(v => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const updatePercent = (id, raw) => {
    update(id, 'additionalCostPct', raw === '' ? null : Number(raw) / 100)
  }

  const updateValue = (id, raw) => {
    update(id, 'value', raw === '' ? 0 : Number(raw))
  }

  const handleAdd = () => {
    addCostVariable({ name: '', additionalCostPct: null, value: 0 })
    toast('Cost variable added', 'success')
  }

  const handleDelete = (row) => {
    deleteCostVariable(row.id)
    toast(`"${row.name || 'Cost variable'}" deleted`, 'success')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          Rate card for freight, material, packaging, and labour costs used to build up product cost breakdowns.
        </p>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>Add Cost Variable</Button>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border bg-grey-50">
              <th className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Cost Variable</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Additional Cost</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">Value</th>
              <th className="px-3 py-3 whitespace-nowrap" />
            </tr>
          </thead>
          <tbody>
            {costVariables.map(row => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="py-1">
                  <EditableText value={row.name} onChange={v => update(row.id, 'name', v)} placeholder="Cost variable name" />
                </td>
                <td className="py-1">
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      step="1"
                      value={row.additionalCostPct == null ? '' : Math.round(row.additionalCostPct * 100)}
                      onChange={e => updatePercent(row.id, e.target.value)}
                      placeholder="-"
                      className="w-16 bg-transparent text-sm text-right text-text-primary outline-none rounded-md px-2 py-1.5 border border-transparent hover:border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
                    />
                    <span className="text-xs text-text-muted w-3">{row.additionalCostPct == null ? '' : '%'}</span>
                  </div>
                </td>
                <td className="py-1">
                  <input
                    type="number"
                    step="0.00001"
                    value={row.value}
                    onChange={e => updateValue(row.id, e.target.value)}
                    className="w-28 bg-transparent text-sm text-right font-medium text-text-primary outline-none rounded-md px-2 py-1.5 border border-transparent hover:border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
                  />
                </td>
                <td className="py-1 pr-2">
                  <button
                    onClick={() => handleDelete(row)}
                    className="p-1.5 rounded-md text-text-muted hover:text-error-500 hover:bg-error-500/10 transition-colors"
                    title="Delete cost variable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {costVariables.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-text-muted text-sm">
                  No cost variables yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
