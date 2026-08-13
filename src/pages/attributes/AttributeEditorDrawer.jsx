import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/FormField'
import { CATEGORIES } from '../../data/mockProducts'

// Shared create/edit form for a product attribute — used from both the
// standalone Attributes CMS page and Competitor Pricing's Spec Matching tab,
// since both read/write the same AttributesContext. Self-contained: name,
// type, unit, category scope, and values are all editable here so a new
// attribute is immediately usable wherever it was created from.
export function AttributeEditorDrawer({ open, onClose, editing, setEditing, onSave, title }) {
  const [newValue, setNewValue] = useState('')

  const toggleCategory = (cat) => {
    setEditing(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat],
    }))
  }

  const addValue = () => {
    const v = newValue.trim()
    if (!v || !editing || editing.values.includes(v)) return
    setEditing(prev => ({ ...prev, values: [...prev.values, v] }))
    setNewValue('')
  }

  const removeValue = (v) => {
    setEditing(prev => ({ ...prev, values: prev.values.filter(x => x !== v) }))
  }

  const valid = !!editing?.name.trim()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={onSave}>Save</Button>
        </>
      }
    >
      {editing && (
        <div className="flex flex-col gap-4">
          <Field label="Attribute Name" required hint="e.g. Material, Colour, Weight Capacity">
            <Input value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Attribute name" />
          </Field>

          <Field label="Type" hint="Numeric attributes support proximity scoring and Diff % comparisons in Spec Matching.">
            <Select value={editing.type} onChange={e => setEditing(p => ({ ...p, type: e.target.value }))}>
              <option value="categorical">Categorical (e.g. Material, Colour)</option>
              <option value="numeric">Numeric (e.g. Diameter, Weight Capacity)</option>
            </Select>
          </Field>

          {editing.type === 'numeric' && (
            <Field label="Unit" hint="e.g. mm, kg, years">
              <Input value={editing.unit} onChange={e => setEditing(p => ({ ...p, unit: e.target.value }))} placeholder="mm" className="w-32" />
            </Field>
          )}

          <Field label="Categories" hint="Which product categories this attribute is available on.">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    editing.categories.includes(cat)
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-surface border-border text-text-secondary hover:bg-grey-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Values"
            hint={editing.type === 'numeric' ? 'Numeric values only, e.g. 450' : `Options for "${editing.name || 'this attribute'}"`}
          >
            <div className="flex gap-2 mb-2">
              <Input
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addValue())}
                placeholder={editing.type === 'numeric' ? 'Add a numeric value…' : 'Add a value…'}
              />
              <Button variant="secondary" onClick={addValue} icon={<Plus className="w-4 h-4" />}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editing.values.map(val => (
                <div key={val} className="flex items-center gap-1.5 bg-grey-100 text-text-primary text-sm px-3 py-1.5 rounded-full">
                  <span>{val}{editing.type === 'numeric' && editing.unit ? editing.unit : ''}</span>
                  <button type="button" onClick={() => removeValue(val)} className="text-text-muted hover:text-error-500 text-base leading-none">×</button>
                </div>
              ))}
              {editing.values.length === 0 && <p className="text-sm text-text-muted">No values yet. Add one above.</p>}
            </div>
          </Field>
        </div>
      )}
    </Drawer>
  )
}
