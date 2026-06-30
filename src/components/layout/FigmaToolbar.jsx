import { useState, useEffect, useRef, useCallback } from 'react'
import { MousePointer2, Hand, ZoomIn, Send, X, Code2, Layers, ChevronUp } from 'lucide-react'

const FIGMA_FILE_URL = 'https://www.figma.com/design/jaK8uGslWBpBxYWwjhqZkN/%E2%9C%A8NEW%E2%9C%A8-Equipsy-Website?node-id=1854-16126&t=t1LN8DejZpLGDW0O-1'

function getComponentName(el) {
  // Walk up to find a meaningful component boundary
  const dataAttr = el.closest('[data-component]')?.getAttribute('data-component')
  if (dataAttr) return dataAttr
  // Use role or aria-label
  if (el.getAttribute('aria-label')) return el.getAttribute('aria-label')
  // Infer from classes
  const cls = el.className || ''
  if (cls.includes('rounded-xl') && cls.includes('border')) return 'Card'
  if (el.tagName === 'BUTTON') return 'Button'
  if (el.tagName === 'INPUT') return 'Input'
  if (el.tagName === 'TABLE') return 'Table'
  if (el.tagName === 'THEAD') return 'Table Header'
  if (el.tagName === 'TR') return 'Table Row'
  if (el.tagName === 'TD') return 'Table Cell'
  if (el.tagName === 'H1') return 'Heading'
  if (el.tagName === 'NAV' || el.tagName === 'ASIDE') return 'Sidebar'
  if (el.tagName === 'HEADER') return 'Header'
  if (el.tagName === 'MAIN') return 'Main Content'
  return el.tagName.charAt(0) + el.tagName.slice(1).toLowerCase()
}

function getClasses(el) {
  return (el.className || '').split(' ').filter(c => c && !c.startsWith('transition') && !c.startsWith('duration')).slice(0, 6).join(' ')
}

export function FigmaToolbar() {
  const [active, setActive] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const [rect, setRect] = useState(null)
  const [selRect, setSelRect] = useState(null)
  const overlayRef = useRef(null)

  const updateOverlay = useCallback((el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }, [])

  useEffect(() => {
    if (!active) {
      setHovered(null)
      setSelected(null)
      setRect(null)
      setSelRect(null)
      return
    }

    const onMove = (e) => {
      const toolbar = document.getElementById('figma-toolbar')
      if (toolbar?.contains(e.target)) return
      const el = e.target
      setHovered(el)
      setRect(updateOverlay(el))
    }

    const onClick = (e) => {
      const toolbar = document.getElementById('figma-toolbar')
      if (toolbar?.contains(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      const el = e.target
      setSelected(el)
      setSelRect(updateOverlay(el))
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('click', onClick, true)
    }
  }, [active, updateOverlay])

  const sendToFigma = () => {
    const el = selected || hovered
    if (!el) return
    const name = getComponentName(el)
    // In a real integration this would call the Figma API
    // For the prototype, open Figma file
    window.open(FIGMA_FILE_URL, '_blank')
  }

  const selInfo = selected || hovered

  return (
    <>
      {/* Hover outline */}
      {active && rect && hovered && !selected && (
        <div
          style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width, height: rect.height, pointerEvents: 'none', zIndex: 9998 }}
          className="border-2 border-brand-500 bg-brand-500/5"
        >
          <span className="absolute -top-5 left-0 bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-mono">
            {getComponentName(hovered)} · {Math.round(rect.width)}×{Math.round(rect.height)}
          </span>
        </div>
      )}

      {/* Selected outline */}
      {active && selRect && selected && (
        <div
          style={{ position: 'fixed', top: selRect.top, left: selRect.left, width: selRect.width, height: selRect.height, pointerEvents: 'none', zIndex: 9998 }}
          className="border-2 border-[#FF6B6B]"
        >
          {/* Corner handles */}
          {[[-4,-4],[-4,'auto'],['auto',-4],['auto','auto']].map(([t,l], i) => (
            <div key={i} style={{ position:'absolute', top: t === 'auto' ? 'auto' : t, bottom: t === 'auto' ? -4 : 'auto', left: l === 'auto' ? 'auto' : l, right: l === 'auto' ? -4 : 'auto', width:8, height:8 }}
              className="bg-white border-2 border-[#FF6B6B] rounded-sm" />
          ))}
          <span className="absolute -top-5 left-0 bg-[#FF6B6B] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-mono">
            {getComponentName(selected)} · {Math.round(selRect.width)}×{Math.round(selRect.height)}
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div
        id="figma-toolbar"
        style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}
        className="flex items-center gap-1 bg-[#2C2C2C] rounded-xl shadow-2xl px-2 py-2 select-none"
      >
        {/* Figma logo */}
        <div className="flex items-center gap-1.5 px-2 pr-3 border-r border-white/15 mr-1">
          <svg width="11" height="16" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 28.5C19 24.9 21.9 22 25.5 22C29.1 22 32 24.9 32 28.5C32 32.1 29.1 35 25.5 35C21.9 35 19 32.1 19 28.5Z" fill="#1ABCFE"/>
            <path d="M6 42C6 38.4 8.9 35.5 12.5 35.5H19V42C19 45.6 16.1 48.5 12.5 48.5C8.9 48.5 6 45.6 6 42Z" fill="#0ACF83"/>
            <path d="M19 7V21.5H25.5C29.1 21.5 32 18.6 32 15C32 11.4 29.1 8.5 25.5 8.5L19 7Z" fill="#FF7262"/>
            <path d="M6 15C6 18.6 8.9 21.5 12.5 21.5H19V8.5H12.5C8.9 8.5 6 11.4 6 15Z" fill="#F24E1E"/>
            <path d="M6 28.5C6 32.1 8.9 35 12.5 35H19V22H12.5C8.9 22 6 24.9 6 28.5Z" fill="#A259FF"/>
          </svg>
          <span className="text-white/70 text-[11px] font-medium">Figma</span>
        </div>

        {!minimised && (
          <>
            {/* Select tool */}
            <button
              onClick={() => { setActive(a => !a); setSelected(null); setSelRect(null) }}
              title="Select element (V)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${active ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <MousePointer2 className="w-3.5 h-3.5" />
              {active ? 'Selecting' : 'Select'}
            </button>

            <div className="w-px h-5 bg-white/15 mx-0.5" />

            {/* Selected element info */}
            {selInfo ? (
              <div className="flex items-center gap-2 px-2">
                <Layers className="w-3 h-3 text-white/40 shrink-0" />
                <span className="text-white/80 text-[11px] font-mono max-w-36 truncate">{getComponentName(selInfo)}</span>
                {(selRect || rect) && (
                  <span className="text-white/40 text-[10px] font-mono">
                    {Math.round((selRect || rect).width)}×{Math.round((selRect || rect).height)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-white/30 text-[11px] px-2">No element selected</span>
            )}

            <div className="w-px h-5 bg-white/15 mx-0.5" />

            {/* Send to Figma */}
            <button
              onClick={sendToFigma}
              disabled={!selInfo}
              title="Open in Figma"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${selInfo ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'text-white/30 cursor-not-allowed'}`}
            >
              <Send className="w-3 h-3" />
              Open in Figma
            </button>

            {/* Deselect */}
            {selected && (
              <button onClick={() => { setSelected(null); setSelRect(null) }} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {/* Minimise */}
        <button
          onClick={() => setMinimised(m => !m)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-0.5"
          title={minimised ? 'Expand toolbar' : 'Minimise'}
        >
          <ChevronUp className={`w-3.5 h-3.5 transition-transform ${minimised ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </>
  )
}
