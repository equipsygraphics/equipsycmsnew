import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'

const PAGE_SIZES = [10, 25, 50]

function SortIcon({ column, sortKey, direction }) {
  if (sortKey !== column) return <ChevronsUpDown className="w-3.5 h-3.5 text-text-muted" />
  return direction === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-brand-500" />
    : <ChevronDown className="w-3.5 h-3.5 text-brand-500" />
}

export function DataTable({
  columns,       // [{ key, label, sortable, render, width, align }]
  data,          // raw rows
  filters,       // JSX — slot for filter controls above table
  searchKey,     // string — key to search across (or array of keys)
  rowKey = 'id',
  emptyMessage = 'No results found.',
  onRowClick,
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    let rows = data
    if (search && searchKey) {
      const q = search.toLowerCase()
      const keys = Array.isArray(searchKey) ? searchKey : [searchKey]
      rows = rows.filter(r => keys.some(k => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, search, searchKey, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {searchKey && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search…"
              className="h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 w-56"
            />
          </div>
        )}
        {filters}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-50">
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={`px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-text-primary' : ''}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon column={col.key} sortKey={sortKey} direction={sortDir} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : paginated.map(row => (
                <tr
                  key={row[rowKey]}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-border last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-grey-50' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-text-primary ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-grey-50">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="border border-border rounded-md px-2 py-1 text-xs bg-surface outline-none"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span>{filtered.length} total</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-text-muted mr-2">Page {page} of {totalPages}</span>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-md border border-border bg-surface text-text-secondary hover:bg-grey-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-md border border-border bg-surface text-text-secondary hover:bg-grey-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
