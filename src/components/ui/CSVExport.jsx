import { Download } from 'lucide-react'
import { Button } from './Button'

function toCSV(data, columns) {
  const header = columns.map(c => `"${c.label}"`).join(',')
  const rows = data.map(row =>
    columns.map(c => {
      const val = c.csvValue ? c.csvValue(row) : (row[c.key] ?? '')
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  )
  return [header, ...rows].join('\n')
}

export function CSVExport({ data, columns, filename = 'export' }) {
  const handleExport = () => {
    const csv = toCSV(data, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="secondary" size="md" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
      Export CSV
    </Button>
  )
}
