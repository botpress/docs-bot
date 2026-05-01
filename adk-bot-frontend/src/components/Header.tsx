import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type LastMessagePayload =
  | { type: 'text'; text?: string }
  | { type: 'bloc'; items?: Array<{ type: string; payload?: { text?: string } }> }
  | { type: string; [k: string]: unknown }

type Conversation = {
  id: string
  createdAt?: string
  updatedAt?: string
  lastMessage?: {
    sentOn?: string
    payload?: LastMessagePayload
    author?: { type: 'bot' | 'user' }
  }
}

interface HeaderProps {
  conversations: Conversation[]
  isLoading: boolean
  currentConversationId?: string
  onSwitchConversation: (id: string) => void
  onNewConversation: () => void
  onRefresh: () => Promise<unknown>
  getTitle: (conversationId: string) => Promise<string | undefined>
}

const TITLE_CACHE_KEY = 'adk-bot-conv-titles'

/**
 * Top bar with a conversation menu (label + chevron) on the left and a "+"
 * button to start a new chat on the right. The menu opens a Claude.ai-style
 * floating card listing recent conversations; click to switch.
 *
 * Conversation "titles" are derived lazily from each chat's first user
 * message (the API doesn't store a title). Results are cached to
 * localStorage so subsequent opens are instant.
 */
export function Header({
  conversations,
  isLoading,
  currentConversationId,
  onSwitchConversation,
  onNewConversation,
  onRefresh,
  getTitle,
}: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [titles, setTitles] = useState<Record<string, string>>(() => loadTitles())
  const titlesRef = useRef(titles)
  titlesRef.current = titles
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    void onRefresh()
    const onClickAway = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClickAway)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open, onRefresh])

  // When the dropdown is open, lazily fetch a title for any conversation
  // that doesn't have one cached yet. Run sequentially to avoid hammering
  // the API; read the latest cache via ref so adding a title doesn't
  // restart the loop. Cancel cleanly if the dropdown closes.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      for (const c of conversations) {
        if (cancelled) return
        if (titlesRef.current[c.id]) continue
        try {
          const t = await getTitle(c.id)
          if (cancelled) return
          if (t) {
            setTitles((prev) => {
              const next = { ...prev, [c.id]: t }
              saveTitles(next)
              return next
            })
          }
        } catch {
          /* keep trying others */
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, conversations, getTitle])

  const handlePick = (id: string) => {
    setOpen(false)
    if (id !== currentConversationId) onSwitchConversation(id)
  }

  const handleNew = () => {
    setOpen(false)
    onNewConversation()
  }

  return (
    <header
      ref={wrapperRef}
      className="relative px-4 py-2.5 flex items-center justify-between border-b border-border/40"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 -ml-1',
          'text-[12px] font-medium text-muted-foreground',
          'hover:bg-muted hover:text-foreground transition-colors',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        AI assistant
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <button
        type="button"
        onClick={handleNew}
        className={cn(
          'size-7 rounded-md flex items-center justify-center -mr-1',
          'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
        )}
        aria-label="New conversation"
        title="New conversation"
      >
        <Plus className="size-4" strokeWidth={2.25} />
      </button>

      {open && (
        <ConversationMenu
          conversations={conversations}
          isLoading={isLoading}
          currentConversationId={currentConversationId}
          titles={titles}
          onPick={handlePick}
          onNew={handleNew}
        />
      )}
    </header>
  )
}

interface MenuProps {
  conversations: Conversation[]
  isLoading: boolean
  currentConversationId?: string
  titles: Record<string, string>
  onPick: (id: string) => void
  onNew: () => void
}

function ConversationMenu({
  conversations,
  isLoading,
  currentConversationId,
  titles,
  onPick,
  onNew,
}: MenuProps) {
  return (
    <div
      role="menu"
      className={cn(
        'absolute z-20 left-3 top-[calc(100%-4px)] w-[280px]',
        'rounded-xl border border-border/80 bg-surface-elevated shadow-lg',
        'overflow-hidden animate-fade-up',
      )}
    >
      <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground/70 border-b border-border/60">
        Recent
      </div>

      <div className="max-h-[280px] overflow-y-auto scrollbar-subtle py-1">
        {conversations.length === 0 ? (
          <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
            {isLoading ? 'Loading…' : 'No conversations yet'}
          </div>
        ) : (
          conversations.map((c) => {
            const isActive = c.id === currentConversationId
            const preview = previewOf(c, titles[c.id])
            return (
              <button
                key={c.id}
                type="button"
                role="menuitem"
                onClick={() => onPick(c.id)}
                className={cn(
                  'w-full text-left px-3 py-2 flex flex-col gap-0.5 transition-colors',
                  'hover:bg-muted',
                  isActive && 'bg-muted',
                )}
              >
                <span
                  className={cn(
                    'text-[13px] leading-5 truncate',
                    isActive ? 'text-foreground font-medium' : 'text-foreground/85',
                  )}
                >
                  {preview.title}
                </span>
                {preview.subtitle && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {preview.subtitle}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>

      <button
        type="button"
        onClick={onNew}
        className={cn(
          'w-full px-3 py-2.5 flex items-center gap-2 border-t border-border/60',
          'text-[13px] text-foreground hover:bg-muted transition-colors',
        )}
      >
        <Plus className="size-3.5" strokeWidth={2.5} />
        New conversation
      </button>
    </div>
  )
}

function previewOf(c: Conversation, cachedTitle?: string): { title: string; subtitle?: string } {
  const time = relativeTime(c.lastMessage?.sentOn ?? c.updatedAt ?? c.createdAt)
  if (cachedTitle) {
    return { title: stripMarkdown(cachedTitle), subtitle: time }
  }
  // Fallback: the last message text, with markdown chars stripped.
  const payload = c.lastMessage?.payload
  let text: string | undefined
  if (payload?.type === 'text') {
    text = (payload as { text?: string }).text
  } else if (payload?.type === 'bloc') {
    const items = (payload as { items?: Array<{ type: string; payload?: { text?: string } }> }).items
    text = items?.find((i) => i.type === 'text')?.payload?.text
  }
  text = text ? stripMarkdown(text) : undefined
  if (text) return { title: text, subtitle: time }
  return { title: 'New conversation', subtitle: time }
}

/**
 * Strip the most common Markdown formatting so previews read as plain text.
 * Conservative — keeps content, just removes inline tokens that look noisy.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')                  // fenced code blocks
    .replace(/`([^`]+)`/g, '$1')                       // inline code
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')          // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')           // links
    .replace(/(\*\*|__)(.*?)\1/g, '$2')                // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')                   // italic
    .replace(/^#{1,6}\s+/gm, '')                       // headings
    .replace(/^>\s?/gm, '')                            // blockquote
    .replace(/^[-*+]\s+/gm, '')                        // bullets
    .replace(/^\d+\.\s+/gm, '')                        // numbered list
    .replace(/\s+/g, ' ')                              // collapse whitespace
    .trim()
}

function relativeTime(iso?: string): string | undefined {
  if (!iso) return undefined
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return undefined
  const diff = Date.now() - t
  const s = Math.round(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function loadTitles(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TITLE_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

function saveTitles(titles: Record<string, string>): void {
  try {
    localStorage.setItem(TITLE_CACHE_KEY, JSON.stringify(titles))
  } catch {
    /* quota exceeded or storage unavailable — ignore */
  }
}
