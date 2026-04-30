import { useRef, useEffect, useCallback, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
  externalValue?: string
  onExternalValueConsumed?: () => void
}

/**
 * Minimal composer — multiline textarea + send button. No attachments, no
 * slash commands, no model picker. Auto-grows up to ~6 lines.
 *
 * `externalValue` lets the parent inject text (used when the docs page's
 * "Ask a question..." input bubble forwards a pre-typed message).
 */
export function Composer({ onSend, disabled, externalValue, onExternalValueConsumed }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus on mount
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  // Accept externally-injected text and forward it
  useEffect(() => {
    if (!externalValue) return
    onSend(externalValue)
    onExternalValueConsumed?.()
  }, [externalValue, onSend, onExternalValueConsumed])

  // Auto-grow
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 144) + 'px'
  }, [value])

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend])

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-background-surface px-3 py-3"
    >
      <div className="rounded-lg bg-background border border-border focus-within:border-muted-foreground/30 transition-colors flex items-end gap-2 px-3 py-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask agent(0)..."
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none font-sans leading-5"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'shrink-0 size-7 rounded-md flex items-center justify-center transition-colors',
            canSend
              ? 'bg-foreground text-background hover:bg-foreground/90'
              : 'bg-background-elevated text-muted-foreground/40 cursor-not-allowed',
          )}
        >
          <ArrowUp className="size-4" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  )
}
