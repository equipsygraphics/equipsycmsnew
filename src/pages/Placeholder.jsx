import { Construction } from 'lucide-react'

export function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-80 gap-3 text-text-muted">
      <Construction className="w-10 h-10" />
      <p className="font-semibold text-text-secondary">{title}</p>
      <p className="text-sm">Coming soon — this section is planned for a future phase.</p>
    </div>
  )
}
