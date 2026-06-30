import { useState } from 'react'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmModal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'

// Note: No Figma frame exists for this section â€” design follows existing tokens and component patterns.
const INITIAL_ATTRS = [
  { id: 1, name: 'Material', values: ['Aluminium', 'Stainless Steel', 'Chrome', 'Nylon', 'Timber'] },
  { id: 2, name: 'Colour', values: ['Silver', 'White', 'Black', 'Chrome'] },
  { id: 3, name: 'Weight Capacity', values: ['100kg', '120kg', '150kg', '200kg'] },
  { id: 4, name: 'Length', values: ['300mm', '450mm', '600mm', '750mm', '900mm'] },
  { id: 5, name: 'Compliance', values: ['AS 1428.1', 'AS 4586', 'NDIS Approved'] },
]

export function Attributes() {
  const [attrs, setAttrs] = useState(INITIAL_ATTRS)
  const [selected, setSelected] = useState(INITIAL_ATTRS[0])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [newValue, setNewValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openNewAttr = () => { setEditing({ id: null, name: '', values: [] }); setDrawerOpen(true) }
  const openEditAttr = (a) => { setEditing({ ...a, values: [...a.values] }); setDrawerOpen(true) }

  const saveAttr = () => {
    if (editing.id) {
      setAttrs(prev => prev.map(a => a.id === editing.id ? editing : a))
      if (selected?.id === editing.id) setSelected(editing)
    } else {
      const newAttr = { ...editing, id: Date.now() }
      setAttrs(prev => [...prev, newAttr])
      setSelected(newAttr)
    }
    toast(editing.id ? 'Attribute updated' : 'Attribute created', 'success')
    setDrawerOpen(false)
  }

  const deleteAttr = () => {
    setAttrs(prev => prev.filter(a => a.id !== deleteTarget.id))
    if (selected?.id === deleteTarget.id) setSelected(attrs.find(a => a.id !== deleteTarget.id) || null)
    toast('Attribute deleted', 'success')
    setDeleteTarget(null)
  }

  const addValue = () => {
    if (!newValue.trim()) return
    const updated = { ...selected, values: [...selected.values, newValue.trim()] }
    setSelected(updated)
    setAttrs(prev => prev.map(a => a.id === selected.id ? updated : a))
    setNewValue('')
    toast(`Value "${newValue.trim()}" added`, 'success')
  }

  const removeValue = (val) => {
    const updated = { ...selected, values: selected.values.filter(v => v !== val) }
    setSelected(updated)
    setAttrs(prev => prev.map(a => a.id === selected.id ? updated : a))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attributes"
        subtitle="Define filterable product attributes and their values"
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNewAttr}>Add Attribute</Button>}
      />

      <div className="flex gap-4">
        {/* Attribute list */}
        <div className="w-56 bg-surface rounded-xl border border-border shadow-card overflow-x-auto shrink-0">
          <p className="px-4 py-3 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">Attribute Types</p>
          {attrs.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className={`flex items-center gap-2.5 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-grey-50 transition-colors ${selected?.id === a.id ? 'bg-brand-50' : ''}`}
            >
              <Tag className={`w-3.5 h-3.5 shrink-0 ${selected?.id === a.id ? 'text-brand-500' : 'text-text-muted'}`} />
              <span className={`flex-1 text-sm font-medium ${selected?.id === a.id ? 'text-brand-600' : 'text-text-primary'}`}>{a.name}</span>
              <span className="text-xs text-text-muted">{a.values.length}</span>
            </div>
          ))}
        </div>

        {/* Values panel */}
        {selected ? (
          <div className="flex-1 bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{selected.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{selected.values.length} values</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEditAttr(selected)}>Edit</Button>
                <Button variant="secondary" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteTarget(selected)} className="text-error-500 hover:bg-error-500/10">Delete</Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Input value={newValue} onChange={e => setNewValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && addValue()} placeholder={`Add a value for "${selected.name}"...`} />
              <Button variant="primary" onClick={addValue} icon={<Plus className="w-4 h-4" />}>Add</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.values.map(val => (
                <div key={val} className="flex items-center gap-1.5 bg-grey-100 text-text-primary text-sm px-3 py-1.5 rounded-full">
                  <span>{val}</span>
                  <button onClick={() => removeValue(val)} className="text-text-muted hover:text-error-500 text-base leading-none">×</button>
                </div>
              ))}
              {selected.values.length === 0 && <p className="text-sm text-text-muted">No values yet. Add one above.</p>}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">Select an attribute type to manage its values.</div>
        )}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing?.id ? 'Edit Attribute' : 'New Attribute'}
        footer={<><Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button variant="primary" onClick={saveAttr}>Save</Button></>}
      >
        {editing && (
          <Field label="Attribute Name" required hint="e.g. Material, Colour, Weight Capacity">
            <Input value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Attribute name" />
          </Field>
        )}
      </Drawer>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={deleteAttr} title="Delete attribute" message={`Delete "${deleteTarget?.name}" and all its values? Products using this attribute will not be affected.`} confirmLabel="Delete" destructive />
    </div>
  )
}
