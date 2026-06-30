import { useState } from 'react'
import { X, Search, Grid, List, Folder, ChevronDown, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react'

// ── Mock SharePoint folder tree ───────────────────────────────────────────────
const FOLDER_TREE = [
  {
    id: 'website-assets', label: 'Website Assets', children: [
      {
        id: 'product-images', label: 'Product Images', children: [
          {
            id: 'ramps-access', label: 'Ramps & Access', children: [
              {
                id: 'rubber-ramps', label: 'Rubber Ramps', children: [
                  { id: 'standard-rubber-ramp', label: 'Standard Rubber Ramp – 1:8 Gradient 900mm Wide', children: [] },
                ],
              },
            ],
          },
        ],
      },
      { id: 'banners', label: 'Banners', children: [] },
      { id: 'completed-installs', label: 'Completed Installs', children: [] },
      { id: 'product-brochures', label: 'Product Brochures', children: [] },
      { id: 'line-drawings', label: 'Line Drawings', children: [] },
      { id: 'installation-guide', label: 'Installation Guide', children: [] },
    ],
  },
]

// ── Mock media files ──────────────────────────────────────────────────────────
const MOCK_MEDIA = [
  { id: 1, folderId: 'standard-rubber-ramp', name: 'SlipGuard-Ramp-Tape.png', title: 'SlipGuard Ramp Tape - Black', type: 'image/png', ext: 'PNG', size: '2 MB', date: '5 June 2026', dims: '1620×1620 px', altText: 'Black rubber ramp component for doorway access', description: 'A durable rubber ramp designed for 1:8 gradient access. Suitable for indoor and outdoor commercial use.', tags: ['Ramps', 'Access', 'Rubber', 'Commercial'] },
  { id: 2, folderId: 'standard-rubber-ramp', name: 'SlipGuard-Ramp-Tape-Side.png', title: 'SlipGuard Ramp Tape - Side View', type: 'image/png', ext: 'PNG', size: '1.8 MB', date: '5 June 2026', dims: '1620×1620 px', altText: 'Side view of rubber ramp', description: '', tags: ['Ramps', 'Access'] },
  { id: 3, folderId: 'standard-rubber-ramp', name: 'SlipGuard-Ramp-Detail.png', title: 'SlipGuard Ramp Tape - Detail', type: 'image/png', ext: 'PNG', size: '980 KB', date: '4 June 2026', dims: '800×800 px', altText: '', description: '', tags: [] },
  { id: 4, folderId: 'standard-rubber-ramp', name: 'Ramp-Install-Guide.pdf', title: 'Installation Guide PDF', type: 'application/pdf', ext: 'PDF', size: '450 KB', date: '1 June 2026', dims: null, altText: '', description: 'Step-by-step installation instructions.', tags: ['Guide'] },
  { id: 5, folderId: 'standard-rubber-ramp', name: 'Ramp-900mm-Spec.pdf', title: 'Technical Specifications Sheet', type: 'application/pdf', ext: 'PDF', size: '320 KB', date: '28 May 2026', dims: null, altText: '', description: '', tags: ['Spec'] },
  { id: 6, folderId: 'standard-rubber-ramp', name: 'Ramp-Lifestyle-1.png', title: 'Lifestyle Shot 1', type: 'image/png', ext: 'PNG', size: '3.1 MB', date: '20 May 2026', dims: '2400×1600 px', altText: '', description: '', tags: [] },
  { id: 7, folderId: 'standard-rubber-ramp', name: 'Ramp-Lifestyle-2.png', title: 'Lifestyle Shot 2', type: 'image/png', ext: 'PNG', size: '2.9 MB', date: '20 May 2026', dims: '2400×1600 px', altText: '', description: '', tags: [] },
  { id: 8, folderId: 'standard-rubber-ramp', name: 'Ramp-Line-Drawing.png', title: 'Line Drawing', type: 'image/png', ext: 'PNG', size: '120 KB', date: '15 May 2026', dims: '1200×900 px', altText: '', description: '', tags: ['Drawing'] },
  { id: 9, folderId: 'product-brochures', name: 'Equipsy-Ramp-Range-Brochure.pdf', title: 'Ramp Range Brochure 2026', type: 'application/pdf', ext: 'PDF', size: '5.4 MB', date: '1 Jan 2026', dims: null, altText: '', description: '', tags: [] },
  { id: 10, folderId: 'banners', name: 'Homepage-Banner-Summer.jpg', title: 'Homepage Banner – Summer', type: 'image/jpeg', ext: 'JPG', size: '1.2 MB', date: '10 June 2026', dims: '1920×600 px', altText: '', description: '', tags: ['Banner'] },
]

// ── Folder tree node ──────────────────────────────────────────────────────────
function FolderNode({ node, depth = 0, selectedId, onSelect, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen || depth < 2)
  const hasChildren = node.children?.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <button
        onClick={() => { onSelect(node.id); if (hasChildren) setOpen(o => !o) }}
        className={`w-full flex items-center gap-2 py-2.5 pr-4 text-sm font-semibold transition-colors ${isSelected ? 'bg-brand-50 text-brand-700' : 'text-[#1f2a37] hover:bg-grey-50'}`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand-600' : 'text-text-muted'}`} />
        <span className="flex-1 text-left truncate">{node.label}</span>
        {hasChildren && (
          open
            ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-text-muted" />
            : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-text-muted" />
        )}
      </button>
      {open && hasChildren && node.children.map(child => (
        <FolderNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  )
}

// ── Media grid item ───────────────────────────────────────────────────────────
function MediaItem({ item, selected, onClick }) {
  const isImage = item.type?.startsWith('image/')
  return (
    <button
      onClick={() => onClick(item)}
      className={`flex flex-col gap-2 p-2 rounded-xl border-2 text-left transition-colors ${selected ? 'border-brand-500 bg-brand-50' : 'border-border bg-surface hover:border-brand-300'}`}
    >
      <div className="w-full aspect-square bg-grey-50 rounded-lg flex items-center justify-center overflow-hidden">
        {isImage ? (
          <ImageIcon className="w-8 h-8 text-grey-200" />
        ) : (
          <FileText className="w-8 h-8 text-grey-300" />
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-[#1f2a37] truncate leading-tight">{item.title || item.name}</p>
        <p className="text-[11px] text-text-muted">{item.ext}</p>
      </div>
    </button>
  )
}

// ── File info panel ───────────────────────────────────────────────────────────
function FileInfo({ item, onSelect }) {
  if (!item) return (
    <div className="w-60 shrink-0 flex items-center justify-center h-full border border-border rounded-xl">
      <p className="text-sm text-text-muted text-center px-4">Select a file to see its details</p>
    </div>
  )
  const isImage = item.type?.startsWith('image/')
  return (
    <div className="w-60 shrink-0 flex flex-col gap-4 p-4 border border-border rounded-xl bg-surface overflow-y-auto">
      <p className="text-base font-semibold text-[#1f2a37]">File information</p>
      <div className="w-full aspect-square bg-grey-50 rounded-lg flex items-center justify-center">
        {isImage ? <ImageIcon className="w-10 h-10 text-grey-200" /> : <FileText className="w-10 h-10 text-grey-300" />}
      </div>
      <div className="flex flex-col gap-0">
        <p className="text-sm font-semibold text-[#1f2a37]">{item.name}</p>
        <p className="text-xs text-[#4d5761]">{item.date}</p>
        <p className="text-xs text-[#4d5761]">{item.size}</p>
        {item.dims && <p className="text-xs text-[#4d5761]">{item.dims}</p>}
      </div>
      <div className="flex flex-col gap-2">
        {[['Title', item.title], ['Alt Text', item.altText], ['Description', item.description]].map(([label, val]) => val ? (
          <div key={label} className="flex flex-col">
            <p className="text-xs font-medium text-[#9da4ae]">{label}</p>
            <p className="text-sm text-[#1f2a37] line-clamp-3">{val}</p>
          </div>
        ) : null)}
        {item.tags?.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-[#4d5761]">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-grey-50 border border-[#d2d6db] text-xs font-medium text-[#1f2a37]">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => onSelect(item)}
        className="w-full py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors"
      >
        Select
      </button>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function MediaLibraryModal({ open, onClose, onSelect, multiple = false }) {
  const [selectedFolder, setSelectedFolder] = useState('standard-rubber-ramp')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [focusedItem, setFocusedItem] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])

  if (!open) return null

  const folderFiles = MOCK_MEDIA.filter(m =>
    m.folderId === selectedFolder &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.title.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleItem = (item) => {
    if (multiple) {
      setSelectedItems(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item])
    }
    setFocusedItem(item)
  }

  const handleSelect = (item) => {
    onSelect([item])
    onClose()
  }

  const handleConfirmMultiple = () => {
    if (selectedItems.length) { onSelect(selectedItems); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-[1040px] h-[80vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-border shrink-0">
          <h2 className="text-2xl font-semibold text-[#0d121c]">Add media</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-grey-100 transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="flex flex-1 gap-4 p-6 min-h-0">
            {/* Folder sidebar */}
            <div className="w-60 shrink-0 border border-border rounded-xl overflow-y-auto">
              {FOLDER_TREE.map(node => (
                <FolderNode key={node.id} node={node} selectedId={selectedFolder} onSelect={setSelectedFolder} defaultOpen />
              ))}
            </div>

            {/* Main content */}
            <div className="flex flex-1 gap-4 min-w-0">
              <div className="flex flex-col flex-1 min-w-0 gap-3">
                {/* Search + view toggle */}
                <div className="flex gap-3 items-center shrink-0">
                  <div className="flex-1 flex items-center gap-2 border border-[#9da4ae] rounded-lg px-3.5 py-2.5 shadow-sm bg-white">
                    <Search className="w-4 h-4 text-[#4d5761] shrink-0" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search media"
                      className="flex-1 text-sm text-[#4d5761] outline-none bg-transparent"
                    />
                  </div>
                  <div className="flex border border-[#9da4ae] rounded-lg overflow-hidden shadow-sm">
                    <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-r border-[#9da4ae] transition-colors ${viewMode === 'grid' ? 'bg-grey-50 text-[#1f2a37]' : 'bg-white text-[#1f2a37] hover:bg-grey-50'}`}>
                      <Grid className="w-4 h-4" /> Grid
                    </button>
                    <button onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-grey-50 text-[#1f2a37]' : 'bg-white text-[#1f2a37] hover:bg-grey-50'}`}>
                      <List className="w-4 h-4" /> List
                    </button>
                  </div>
                </div>

                {/* File grid / list */}
                <div className="flex-1 overflow-y-auto">
                  {folderFiles.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-sm text-text-muted">No files in this folder</p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-4 gap-2">
                      {folderFiles.map(item => (
                        <MediaItem key={item.id} item={item} selected={focusedItem?.id === item.id} onClick={toggleItem} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
                      {folderFiles.map(item => {
                        const isImage = item.type?.startsWith('image/')
                        const focused = focusedItem?.id === item.id
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(item)}
                            className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${focused ? 'bg-brand-50' : 'bg-surface hover:bg-grey-50'}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-grey-100 flex items-center justify-center shrink-0">
                              {isImage ? <ImageIcon className="w-4 h-4 text-grey-300" /> : <FileText className="w-4 h-4 text-grey-300" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1f2a37] truncate">{item.title || item.name}</p>
                              <p className="text-xs text-text-muted">{item.ext} · {item.size}</p>
                            </div>
                            <p className="text-xs text-text-muted shrink-0">{item.date}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* File info panel */}
              <FileInfo item={focusedItem} onSelect={handleSelect} />
            </div>
          </div>
      </div>
    </div>
  )
}
