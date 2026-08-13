import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

const STAGES = [
  'Scanning competitor websites',
  'Extracting attributes, specs & keywords',
  'Running core product match',
  'Running variant attribute match & price positioning',
]

const STAGE_DURATION = 900

export function ScrapeProgress({ onComplete }) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) {
      const t = setTimeout(onComplete, STAGE_DURATION)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStageIndex(i => i + 1), STAGE_DURATION)
    return () => clearTimeout(t)
  }, [stageIndex, onComplete])

  const progress = ((stageIndex + 1) / STAGES.length) * 100

  return (
    <div className="bg-brand-50 border border-brand-100 rounded-xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-brand-700 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {STAGES[stageIndex]}…
        </p>
        <span className="text-xs text-brand-600 shrink-0">{stageIndex + 1} / {STAGES.length}</span>
      </div>
      <div className="h-1.5 rounded-full bg-brand-100 overflow-hidden">
        <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {STAGES.map((s, i) => (
          <span key={s} className={`inline-flex items-center gap-1 text-xs ${i < stageIndex ? 'text-success-600' : i === stageIndex ? 'text-brand-700 font-medium' : 'text-text-muted'}`}>
            {i < stageIndex && <CheckCircle2 className="w-3 h-3" />}
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
