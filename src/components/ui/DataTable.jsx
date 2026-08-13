import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'

const PAGE_SIZES = [10, 25, 50]

function SortIcon({ column, sortKey, direction }) {
  if (sortKey !== column) return <ChevronsUpDown className="w-3.5 h-3.5 text-text-muted" />
  return direction === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-brand-500" />
    : <ChevronDown className="w-3.5 h-3.5 text-brand-500" />
}

// Excel/Sheets-style column filter — a checkbox list of every distinct value
// in that column (plus Select All), scoped to the full dataset so the list
// doesn't shift around as other filters are applied. `activeValues` is
// undefined when the column has no filter applied (shows everything).
function ColumnFilterMenu({ label, options, activeValues, onApply, onClear }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => new Set(activeValues ?? options.map(o => o.value)))
  const ref = useRef(null)

  useEffect(() => {
    if (open) setDraft(new Set(activeValues ?? options.map(o => o.value)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive = activeValues != null
  const allChecked = draft.size === options.length
  const toggleAll = () => setDraft(allChecked ? new Set() : new Set(options.map(o => o.value)))
  const toggleOne = (v) => setDraft(prev => {
    const next = new Set(prev)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    return next
  })

  return (
    <span className="relative inline-block normal-case font-normal" ref={ref} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`p-0.5 rounded transition-colors ${isActive ? 'text-brand-500' : 'text-text-muted hover:text-text-primary'}`}
        title={`Filter ${label}`}
      >
        <Filter className="w-3 h-3" fill={isActive ? 'currentColor' : 'none'} />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 w-56 bg-surface border border-border rounded-lg shadow-lg p-2 flex flex-col gap-1">
          <label className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-grey-50 rounded-md cursor-pointer border-b border-border mb-1 pb-2">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 accent-brand-500 shrink-0" />
            Select All
          </label>
          <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5">
            {options.length === 0 && <p className="px-2 py-1 text-xs text-text-muted italic">No values</p>}
            {options.map(({ value, label: optLabel }) => (
              <label key={String(value)} className="flex items-center gap-2 px-2 py-1 text-xs text-text-secondary hover:bg-grey-50 rounded-md cursor-pointer">
                <input type="checkbox" checked={draft.has(value)} onChange={() => toggleOne(value)} className="w-3.5 h-3.5 accent-brand-500 shrink-0" />
                <span className="truncate">{optLabel}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-border">
            <button type="button" onClick={onClear} className="text-xs text-text-muted hover:text-text-primary">
              Clear
            </button>
            <button
              type="button"
              onClick={() => onApply(draft)}
              className="text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md px-3 py-1 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </span>
  )
}

export function DataTable({
  columns,        // [{ key, label, sortable, render, width, align, band, tint, wrap }]
                  // band: { key, label, className } — opt-in spanning colour band above
                  //   the column header row; consecutive columns sharing the same band.key
                  //   merge into one cell. Columns without `band` span both header rows.
                  // tint: className applied to just that column's own header cell, e.g. to
                  //   shade sub-tiers within a band differently (2-box vs 3-box, etc).
                  // wrap: true — let long text (e.g. product names) flow onto multiple
                  //   lines instead of forcing the column wide to fit it on one line.
                  //   Pair with `width` so it actually narrows instead of just wrapping
                  //   once it happens to overflow.
  data,           // raw rows
  filters,        // JSX — slot for filter controls above table
  searchKey,      // string — key to search across (or array of keys)
  rowKey = 'id',
  emptyMessage = 'No results found.',
  onRowClick,
  columnFilters = false, // Excel/Sheets-style per-column checkbox filter, opt-in
  onFilteredChange,      // (rows) => void — fires whenever search/column-filter/sort output changes
  pagination = true,     // false = show every row, scrolling vertically within a capped-height panel instead of paging
  compact = false,       // tighter cell padding — fits more columns before horizontal scroll kicks in
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeColumnFilters, setActiveColumnFilters] = useState({}) // { [colKey]: Set<rawValue> }

  // Every distinct value per column, from the full dataset (not affected by
  // other active filters) so a checkbox list never reshuffles or drops an
  // option out from under the user mid-edit.
  const columnOptions = useMemo(() => {
    if (!columnFilters) return {}
    const map = {}
    columns.forEach(col => {
      const seen = new Map()
      data.forEach(row => {
        const raw = row[col.key]
        if (!seen.has(raw)) {
          const display = col.render ? col.render(raw, row) : raw
          seen.set(raw, (display == null || display === '') ? '(blank)' : display)
        }
      })
      map[col.key] = [...seen.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => String(a.label).localeCompare(String(b.label), undefined, { numeric: true }))
    })
    return map
  }, [data, columns, columnFilters])

  const applyColumnFilter = (key, set) => {
    const opts = columnOptions[key] || []
    setActiveColumnFilters(prev => {
      const next = { ...prev }
      if (set.size === opts.length) delete next[key] // everything checked = no filter
      else next[key] = set
      return next
    })
    setPage(1)
  }
  const clearColumnFilter = (key) => {
    setActiveColumnFilters(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPage(1)
  }

  const filtered = useMemo(() => {
    let rows = data
    if (search && searchKey) {
      const q = search.toLowerCase()
      const keys = Array.isArray(searchKey) ? searchKey : [searchKey]
      rows = rows.filter(r => keys.some(k => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    Object.entries(activeColumnFilters).forEach(([key, set]) => {
      rows = rows.filter(r => set.has(r[key]))
    })
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, search, searchKey, sortKey, sortDir, activeColumnFilters])

  useEffect(() => {
    onFilteredChange?.(filtered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = pagination ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const hasBands = columns.some(c => c.band)
  // Consecutive columns sharing the same band.key merge into one spanning
  // cell above the header row; columns without a band carry their own `col`
  // through instead and get rendered with rowSpan={2} so they still line up
  // with the row below.
  const bandSegments = useMemo(() => {
    if (!hasBands) return []
    const segments = []
    columns.forEach(col => {
      const last = segments[segments.length - 1]
      if (col.band && last?.band?.key === col.band.key) { last.span += 1; return }
      segments.push({ band: col.band ?? null, span: 1, soloCol: col.band ? null : col })
    })
    return segments
  }, [columns, hasBands])

  const cellPad = compact ? 'px-2 py-1.5' : 'px-4 py-3'
  const bandPad = compact ? 'px-2 py-1' : 'px-4 py-2'
  const wrapClass = (col) => (col.wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap')

  const headerCellContent = (col) => (
    <span className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {/* min-w-0 lets this text child actually shrink and wrap inside the
          flex row instead of forcing the row (and column) wide to fit it on
          one line — flex items don't wrap by default otherwise. */}
      <span className="min-w-0">{col.label}</span>
      {col.sortable && <SortIcon column={col.key} sortKey={sortKey} direction={sortDir} />}
      {columnFilters && (
        <ColumnFilterMenu
          label={col.label}
          options={columnOptions[col.key] || []}
          activeValues={activeColumnFilters[col.key]}
          onApply={set => applyColumnFilter(col.key, set)}
          onClear={() => clearColumnFilter(col.key)}
        />
      )}
    </span>
  )

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
        <div className={pagination ? 'overflow-x-auto' : 'overflow-auto max-h-[70vh]'}>
          <table className="w-full min-w-max text-sm">
            <thead className={pagination ? undefined : 'sticky top-0 z-10'}>
              {hasBands && (
                <tr>
                  {bandSegments.map((seg, i) => seg.band ? (
                    <th
                      key={i}
                      colSpan={seg.span}
                      className={`${bandPad} text-center text-xs font-bold uppercase tracking-wide text-white whitespace-nowrap ${seg.band.className}`}
                    >
                      {seg.band.label}
                    </th>
                  ) : (
                    <th
                      key={i}
                      rowSpan={2}
                      style={seg.soloCol.width ? { width: seg.soloCol.width } : undefined}
                      className={`${cellPad} text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${wrapClass(seg.soloCol)} bg-grey-50 border-b border-border align-top ${seg.soloCol.sortable ? 'cursor-pointer select-none hover:text-text-primary' : ''}`}
                      onClick={seg.soloCol.sortable ? () => handleSort(seg.soloCol.key) : undefined}
                    >
                      {headerCellContent(seg.soloCol)}
                    </th>
                  ))}
                </tr>
              )}
              <tr className="border-b border-border bg-grey-50">
                {columns.map(col => {
                  if (hasBands && !col.band) return null // already rendered above with rowSpan
                  return (
                    <th
                      key={col.key}
                      style={col.width ? { width: col.width } : undefined}
                      className={`${cellPad} text-left text-xs font-semibold text-text-muted uppercase tracking-wide ${wrapClass(col)} ${col.sortable ? 'cursor-pointer select-none hover:text-text-primary' : ''} ${col.tint ?? ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      {headerCellContent(col)}
                    </th>
                  )
                })}
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
                    <td key={col.key} className={`${cellPad} text-text-primary ${wrapClass(col)} align-top ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination ? (
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
        ) : (
          <div className="px-4 py-2 border-t border-border bg-grey-50 text-xs text-text-muted">
            {filtered.length} total
          </div>
        )}
      </div>
    </div>
  )
}
