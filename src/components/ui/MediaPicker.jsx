import { useState, useRef } from 'react'
import { Upload, X, Image, FileText } from 'lucide-react'

export function MediaPicker({ value, onChange, accept = 'image/*', multiple = false, label = 'Upload file' }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFiles = (files) => {
    const arr = Array.from(files)
    const previews = arr.map(f => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
      type: f.type,
      file: f,
    }))
    if (multiple) onChange([...(value || []), ...previews])
    else onChange(previews[0] || null)
  }

  const remove = (idx) => {
    if (multiple) onChange((value || []).filter((_, i) => i !== idx))
    else onChange(null)
  }

  const items = multiple ? (value || []) : (value ? [value] : [])
  const isImage = (item) => item.type?.startsWith('image/')

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-6 py-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${dragging ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-300 hover:bg-grey-50'}`}
      >
        <Upload className="w-6 h-6 text-text-muted" />
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <p className="text-xs text-text-muted">Drag & drop or click to browse</p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {items.length > 0 && (
        <div className={`flex gap-2 flex-wrap`}>
          {items.map((item, i) => (
            <div key={i} className="relative group border border-border rounded-lg overflow-hidden bg-grey-50">
              {isImage(item) ? (
                <img src={item.url} alt={item.name} className="w-20 h-20 object-cover" />
              ) : (
                <div className="w-20 h-20 flex flex-col items-center justify-center gap-1">
                  <FileText className="w-6 h-6 text-text-muted" />
                  <span className="text-[10px] text-text-muted truncate max-w-[72px] px-1">{item.name}</span>
                </div>
              )}
              <button
                onClick={e => { e.stopPropagation(); remove(i) }}
                className="absolute top-1 right-1 bg-grey-900/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
