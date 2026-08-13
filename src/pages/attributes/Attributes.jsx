import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Tag, Upload } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { ConfirmModal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/FormField'
import { toast } from '../../components/ui/Toast'
import { useAttributes } from '../../context/AttributesContext'
import { useCompetitorPricingConfig } from '../../context/CompetitorPricingConfigContext'
import { AttributeEditorDrawer } from './AttributeEditorDrawer'
import { CategoryAssignments } from './CategoryAssignments'
import { AttributesImportModal } from './AttributesImportModal'
import { CoreMatchAttributes, VariantMatchAttributes } from './SpecMatching'

// Note: No Figma frame exists for this section â€” design follows existing tokens and component patterns.

const VIEWS = ['Attribute Values', 'Category Assignments', 'Stage 1 Match Attributes', 'Stage 2 Match Attributes']

export function Attributes() {
  const { attributes: attrs, addAttribute, updateAttribute, deleteAttribute, addValue, removeValue } = useAttributes()
  const {
    coreAttributeSelection, setCoreAttributeSelection,
    variantAttributeSelection, setVariantAttributeSelection,
  } = useCompetitorPricingConfig()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(() => searchParams.get('view') || 'Attribute Values')
  const [selectedId, setSelectedId] = useState(attrs[0]?.id ?? null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [newValue, setNewValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  const selected = attrs.find(a => a.id === selectedId) || null

  const openNewAttr = () => {
    setEditing({ id: null, name: '', type: 'categorical', unit: '', categories: [], values: [] })
    setDrawerOpen(true)
  }
  const openEditAttr = (a) => { setEditing({ ...a, categories: [...a.categories], values: [...a.values] }); setDrawerOpen(true) }

  const saveAttr = () => {
    if (!editing.name.trim()) return
    if (editing.id) {
      updateAttribute(editing.id, editing)
    } else {
      const newAttr = addAttribute(editing)
      setSelectedId(newAttr.id)
    }
    toast(editing.id ? 'Attribute updated' : 'Attribute created', 'success')
    setDrawerOpen(false)
  }

  const confirmDeleteAttr = () => {
    deleteAttribute(deleteTarget.id)
    if (selectedId === deleteTarget.id) setSelectedId(attrs.find(a => a.id !== deleteTarget.id)?.id ?? null)
    toast('Attribute deleted', 'success')
    setDeleteTarget(null)
  }

  const handleAddValue = () => {
    if (!newValue.trim() || !selected) return
    addValue(selected.id, newValue.trim())
    setNewValue('')
    toast(`Value "${newValue.trim()}" added`, 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attributes"
        subtitle="Define filterable product attributes, their category assignments, and Stage 1/2 competitor match selections"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={() => setImportOpen(true)}>Import from Excel</Button>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openNewAttr}>Add Attribute</Button>
          </div>
        }
      />

      <div className="border-b border-border flex gap-0 overflow-x-auto">
        {VIEWS.map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              view === v ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'Category Assignments' && (
        <CategoryAssignments attributes={attrs} updateAttribute={updateAttribute} />
      )}

      {view === 'Stage 1 Match Attributes' && (
        <CoreMatchAttributes coreSelection={coreAttributeSelection} setCoreSelection={setCoreAttributeSelection} />
      )}

      {view === 'Stage 2 Match Attributes' && (
        <VariantMatchAttributes variantSelection={variantAttributeSelection} setVariantSelection={setVariantAttributeSelection} />
      )}

      {view === 'Attribute Values' && (
      <div className="flex gap-4">
        {/* Attribute list */}
        <div className="w-56 bg-surface rounded-xl border border-border shadow-card overflow-x-auto shrink-0">
          <p className="px-4 py-3 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">Attribute Types</p>
          {attrs.map(a => (
            <div
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`flex items-center gap-2.5 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-grey-50 transition-colors ${selectedId === a.id ? 'bg-brand-50' : ''}`}
            >
              <Tag className={`w-3.5 h-3.5 shrink-0 ${selectedId === a.id ? 'text-brand-500' : 'text-text-muted'}`} />
              <span className={`flex-1 text-sm font-medium ${selectedId === a.id ? 'text-brand-600' : 'text-text-primary'}`}>{a.name}</span>
              <span className="text-xs text-text-muted">{a.values.length}</span>
            </div>
          ))}
        </div>

        {/* Values panel */}
        {selected ? (
          <div className="flex-1 bg-surface rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-text-primary">{selected.name}</h3>
                  <span className="text-xs font-medium text-text-muted bg-grey-100 px-2 py-0.5 rounded-full">
                    {selected.type === 'numeric' ? `Numeric${selected.unit ? ` (${selected.unit})` : ''}` : 'Categorical'}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {selected.values.length} values · {selected.categories.length ? selected.categories.join(', ') : 'No categories assigned'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEditAttr(selected)}>Edit</Button>
                <Button variant="secondary" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteTarget(selected)} className="text-error-500 hover:bg-error-500/10">Delete</Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddValue()}
                placeholder={selected.type === 'numeric' ? `Add a numeric value, e.g. 450` : `Add a value for "${selected.name}"...`}
              />
              <Button variant="primary" onClick={handleAddValue} icon={<Plus className="w-4 h-4" />}>Add</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.values.map(val => (
                <div key={val} className="flex items-center gap-1.5 bg-grey-100 text-text-primary text-sm px-3 py-1.5 rounded-full">
                  <span>{val}{selected.type === 'numeric' && selected.unit ? selected.unit : ''}</span>
                  <button onClick={() => removeValue(selected.id, val)} className="text-text-muted hover:text-error-500 text-base leading-none">×</button>
                </div>
              ))}
              {selected.values.length === 0 && <p className="text-sm text-text-muted">No values yet. Add one above.</p>}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">Select an attribute type to manage its values.</div>
        )}
      </div>
      )}

      <AttributeEditorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
        setEditing={setEditing}
        onSave={saveAttr}
        title={editing?.id ? 'Edit Attribute' : 'New Attribute'}
      />

      <AttributesImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        attributes={attrs}
        addAttribute={addAttribute}
        updateAttribute={updateAttribute}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteAttr}
        title="Delete attribute"
        message={`Delete "${deleteTarget?.name}" and all its values? It will also be removed from any category's Spec Matching selection that uses it.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
