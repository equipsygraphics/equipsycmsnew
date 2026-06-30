import { useState } from 'react'
import { Bold, Italic, List, ListOrdered, Link, Image, Heading2, Quote, Minus } from 'lucide-react'

const TOOLBAR = [
  { icon: <Heading2 className="w-4 h-4" />, label: 'Heading' },
  { icon: <Bold className="w-4 h-4" />, label: 'Bold' },
  { icon: <Italic className="w-4 h-4" />, label: 'Italic' },
  null, // divider
  { icon: <List className="w-4 h-4" />, label: 'Bullet list' },
  { icon: <ListOrdered className="w-4 h-4" />, label: 'Numbered list' },
  { icon: <Quote className="w-4 h-4" />, label: 'Blockquote' },
  null,
  { icon: <Link className="w-4 h-4" />, label: 'Link' },
  { icon: <Image className="w-4 h-4" />, label: 'Image' },
  { icon: <Minus className="w-4 h-4" />, label: 'Divider' },
]

export function RichTextEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 200 }) {
  const [activeFormat, setActiveFormat] = useState(null)

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-grey-50 flex-wrap">
        {TOOLBAR.map((item, i) =>
          item === null ? (
            <div key={i} className="w-px h-5 bg-border mx-1" />
          ) : (
            <button
              key={item.label}
              type="button"
              title={item.label}
              onClick={() => setActiveFormat(f => f === item.label ? null : item.label)}
              className={`p-1.5 rounded-md transition-colors ${activeFormat === item.label ? 'bg-brand-100 text-brand-600' : 'text-text-muted hover:text-text-primary hover:bg-grey-100'}`}
            >
              {item.icon}
            </button>
          )
        )}
      </div>

      {/* Editable area */}
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange?.(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="px-4 py-3 text-sm text-text-primary outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-muted leading-relaxed"
        dangerouslySetInnerHTML={value ? { __html: value } : undefined}
      />
    </div>
  )
}
