import { useState, useRef } from 'react'
import { Upload, Copy, Trash2, Search, Grid, List, FolderOpen, Image, FileText, File } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { ConfirmModal } from '../../components/ui/Modal'
import { toast } from '../../components/ui/Toast'
import { mockMediaFiles, MEDIA_FOLDERS, MIME_COLORS } from '../../data/mockContent'

const TYPE_FILTERS = ['All', 'JPG', 'PNG', 'SVG', 'PDF', 'DOC']

const FILE_BG = {
  JPG: 'bg-brand-50',
  PNG: 'bg-brand-50',
  SVG: 'bg-success-500/10',
  PDF: 'bg-error-500/10',
  DOC: 'bg-warning-500/10',
}
const FILE_TEXT = {
  JPG: 'text-brand-300',
  PNG: 'text-brand-300',
  SVG: 'text-success-500',
  PDF: 'text-error-500',
  DOC: 'text-warning-500',
}
const FILE_BADGE = {
  JPG: 'bg-brand-100 text-brand-600',
  PNG: 'bg-brand-100 text-brand-600',
  SVG: 'bg-success-500/10 text-success-500',
  PDF: 'bg-error-500/10 text-error-500',
  DOC: 'bg-warning-500/10 text-warning-500',
}

function FileIcon({ type }) {
  const cls = `w-7 h-7 ${FILE_TEXT[type] ?? 'text-text-muted'}`
  if (type === 'JPG' || type === 'PNG') return <Image className={cls} />
  if (type === 'SVG') return <FileText className={cls} />
  if (type === 'PDF') return <FileText className={cls} />
  return <File className={cls} />
}

export function MediaLibrary() {
  const [files, setFiles] = useState(mockMediaFiles)
  const [selected, setSelected] = useState(files[0])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [folderFilter, setFolderFilter] = useState('All Files')
  const [viewMode, setViewMode] = useState('grid')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const inputRef = useRef()

  const filtered = files.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'All' && f.type !== typeFilter) return false
    if (folderFilter !== 'All Files' && f.folder !== folderFilter) return false
    return true
  })

  const handleUpload = (e) => {
    const newFiles = Array.from(e.target.files).map((file, i) => ({
      id: Date.now() + i,
      name: file.name,
      type: file.name.split('.').pop().toUpperCase(),
      size: `${(file.size / 1024).toFixed(0)} KB`,
      dimensions: 'â€”',
      uploaded: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
      folder: folderFilter === 'All Files' ? 'Product Photos' : folderFilter,
      tags: [],
    }))
    setFiles(prev => [...newFiles, ...prev])
    toast(`${newFiles.length} file${newFiles.length > 1 ? 's' : ''} uploaded`, 'success')
    e.target.value = ''
  }

  const handleDelete = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selected?.id === id) setSelected(files.find(f => f.id !== id) ?? null)
    toast('File deleted', 'success')
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Media Library"
        subtitle={`${files.length} files`}
        actions={
          <>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />
            <Button variant="primary" icon={<Upload className="w-4 h-4" />} onClick={() => inputRef.current?.click()}>Upload Files</Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-52" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none">
          {TYPE_FILTERS.map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="flex border border-border rounded-lg overflow-hidden ml-auto">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-grey-900 text-white' : 'bg-surface text-text-muted hover:bg-grey-50'}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 border-l border-border ${viewMode === 'list' ? 'bg-grey-900 text-white' : 'bg-surface text-text-muted hover:bg-grey-50'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Folder sidebar */}
        <div className="w-44 bg-surface rounded-xl border border-border shadow-card overflow-x-auto shrink-0">
          {MEDIA_FOLDERS.map(folder => (
            <button key={folder} onClick={() => setFolderFilter(folder)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm border-b border-border last:border-0 hover:bg-grey-50 text-left transition-colors ${folderFilter === folder ? 'bg-brand-50 text-brand-600 font-medium' : 'text-text-secondary'}`}>
              <FolderOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{folder}</span>
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted mb-3">{filtered.length} files</p>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 gap-3">
              {filtered.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelected(file)}
                  className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-sm ${selected?.id === file.id ? 'border-brand-500' : 'border-border'}`}
                >
                  <div className={`h-28 flex items-center justify-center ${FILE_BG[file.type] ?? 'bg-grey-50'}`}>
                    <FileIcon type={file.type} />
                  </div>
                  <div className="p-2 bg-surface border-t border-border">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${FILE_BADGE[file.type] ?? 'bg-grey-100 text-grey-500'}`}>{file.type}</span>
                    </div>
                    <p className="text-xs text-text-primary truncate font-medium">{file.name}</p>
                    <p className="text-[10px] text-text-muted">{file.size}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
              {filtered.map((file, i) => (
                <div key={file.id} onClick={() => setSelected(file)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-grey-50 transition-colors ${i > 0 ? 'border-t border-border' : ''} ${selected?.id === file.id ? 'bg-brand-50' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${FILE_BG[file.type] ?? 'bg-grey-100'}`}><FileIcon type={file.type} /></div>
                  <p className="flex-1 text-sm font-medium text-text-primary truncate">{file.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${FILE_BADGE[file.type] ?? 'bg-grey-100 text-grey-500'}`}>{file.type}</span>
                  <p className="text-xs text-text-muted w-16 text-right">{file.size}</p>
                  <p className="text-xs text-text-muted w-24 text-right">{file.uploaded}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-56 bg-surface rounded-xl border border-border shadow-card p-4 flex flex-col gap-4 shrink-0">
            <p className="text-sm font-semibold text-text-primary">File Details</p>
            <div className={`h-32 rounded-lg flex items-center justify-center text-4xl ${FILE_BG[selected.type] ?? 'bg-grey-100'}`}>
              <FileIcon type={selected.type} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary break-all">{selected.name}</p>
              <div className="mt-3 flex flex-col gap-2 text-xs">
                {[['Type', selected.type === 'JPG' ? 'JPEG Image' : selected.type === 'SVG' ? 'SVG Vector' : selected.type === 'PDF' ? 'PDF Document' : selected.type],
                  ['Size', selected.size],
                  ['Dimensions', selected.dimensions],
                  ['Uploaded', selected.uploaded],
                  ['Folder', selected.folder],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-text-muted">{k}</span>
                    <span className="text-text-secondary text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="secondary" size="sm" icon={<Copy className="w-3.5 h-3.5" />} onClick={() => { navigator.clipboard?.writeText(`/media/${selected.name}`); toast('URL copied', 'success') }} className="w-full justify-center">
              Copy URL
            </Button>
            <Button variant="secondary" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteTarget(selected)} className="w-full justify-center text-error-500 hover:bg-error-500/10">
              Delete
            </Button>
          </div>
        )}
      </div>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete file" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" destructive />
    </div>
  )
}
