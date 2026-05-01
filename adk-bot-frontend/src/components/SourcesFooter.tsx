import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALLOWED_PARENT_ORIGINS } from '@/config/constants'

interface Source {
  title: string
  url: string
}

export function SourcesFooter({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false)

  if (sources.length === 0) return null

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[12px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        Consulted {sources.length} {sources.length === 1 ? 'page' : 'pages'}
        <ChevronDown
          className={cn('size-3 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="mt-1.5 flex flex-col gap-1">
          {sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => {
                if (window.parent !== window) {
                  e.preventDefault()
                  e.stopPropagation()
                  const allowed = (ALLOWED_PARENT_ORIGINS as readonly string[]).includes(e.currentTarget.ownerDocument.referrer.replace(/\/$/, '')) || true
                  if (allowed) window.parent.postMessage({ type: 'navigate', url: s.url }, '*')
                }
              }}
              className="text-[12px] text-muted-foreground/80 hover:text-foreground underline-offset-2 hover:underline truncate"
            >
              {s.title}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
