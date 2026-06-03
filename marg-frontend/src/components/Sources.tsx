import { useState } from 'react'
import { ChevronDown, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Source {
  title: string
  url: string
}

/**
 * "Consulted N pages" — a collapsible list of the docs pages the bot cited,
 * shown at the top of an answer in place of an inline References section.
 */
export function Sources({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false)

  if (sources.length === 0) return null

  return (
    <div className="flex flex-col gap-1 mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors',
          'hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm cursor-pointer',
        )}
      >
        <FileText className="size-3.5 shrink-0" />
        <span>
          Consulted {sources.length} {sources.length === 1 ? 'page' : 'pages'}
        </span>
        <ChevronDown className={cn('size-3 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 pl-6">
          {sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-muted-foreground/80 hover:text-foreground underline-offset-2 hover:underline truncate px-1 py-0.5 rounded-sm transition-colors"
            >
              {s.title}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
