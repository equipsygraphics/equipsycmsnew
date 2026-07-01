import { useState, useRef, useEffect } from 'react'
import { Tag, X, Plus } from 'lucide-react'
import { toSlug } from '../../data/mockTagging'

// Multi-select, searchable tag picker.
// Props:
//   allTags        – array of { id, name, slug }
//   selectedIds    – array of selected tag IDs
//   onChange       – (newIds: number[]) => void
//   onCreateTag    – (name: string, slug: string) => { id, name, slug } | null
//   placeholder    – string
export function TagPicker({ allTags, selectedIds, onChange, onCreateTag, placeholder = 'Add tags…' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const selectedTags = allTags.filter(t => selectedIds.includes(t.id))
  const filteredTags = allTags
    .filter(t => !selectedIds.includes(t.id))
    .filter(t => !query || t.name.toLowerCase().includes(query.toLowerCase()))

  const exactMatch = allTags.some(t => t.name.toLowerCase() === query.toLowerCase().trim())
  const canCreate = onCreateTag && query.trim().length > 0 && !exactMatch

  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = tag => {
    onChange([...selectedIds, tag.id])
    setQuery('')
    inputRef.current?.focus()
  }

  const remove = id => onChange(selectedIds.filter(x => x !== id))

  const handleCreate = () => {
    const name = query.trim()
    if (!name) return
    const slug = toSlug(name)
    const alreadyExists = allTags.find(t => t.slug === slug)
    if (alreadyExists) { select(alreadyExists); return }
    const newTag = onCreateTag(name, slug)
    if (newTag) onChange([...selectedIds, newTag.id])
    setQuery('')
    setOpen(false)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredTags.length === 1 && !canCreate) select(filteredTags[0])
      else if (canCreate) handleCreate()
    }
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
    if (e.key === 'Backspace' && !query && selectedIds.length > 0) {
      remove(selectedIds[selectedIds.length - 1])
    }
  }

  const showDropdown = open && (query.length > 0 || filteredTags.length > 0)

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap gap-1.5 min-h-10 px-2.5 py-1.5 rounded-lg border border-border bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        {selectedTags.map(t => (
          <span key={t.id} className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-2 py-1 rounded-full shrink-0">
            <Tag className="w-3 h-3" />
            {t.name}
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); remove(t.id) }}
              className="hover:text-brand-900 ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedIds.length === 0 ? placeholder : ''}
          className="flex-1 min-w-28 outline-none text-sm text-text-primary placeholder:text-text-muted bg-transparent py-0.5"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {filteredTags.length === 0 && !canCreate && (
            <div className="px-3 py-4 text-center text-sm text-text-muted">
              {query ? 'No matching tags' : 'All tags already applied'}
            </div>
          )}
          {filteredTags.slice(0, 8).map(t => (
            <button
              key={t.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); select(t) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-grey-50 transition-colors text-left border-b border-border last:border-0"
            >
              <Tag className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="text-sm text-text-primary flex-1">{t.name}</span>
              <span className="text-xs text-text-muted font-mono">{t.slug}</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); handleCreate() }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-brand-50 transition-colors text-left border-t border-border"
            >
              <Plus className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="text-sm text-brand-600 font-medium">Create "{query.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
