import { useRef, useEffect, useCallback, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComposerProps {
  onSend: (message: string) => void
  externalValue?: string
  onExternalValueConsumed?: () => void
}

/**
 * Big rounded card composer at the bottom — soft elevation, generous
 * padding, send arrow as a circular accent button. Auto-grows up to ~6
 * lines. Centered max-width matches the messages column above.
 */
export function Composer({ onSend, externalValue, onExternalValueConsumed }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!externalValue) return
    onSend(externalValue)
    onExternalValueConsumed?.()
  }, [externalValue, onSend, onExternalValueConsumed])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [value])

  const submit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }, [value, onSend])

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

  const canSend = value.trim().length > 0

  return (
    <div className="px-5 pb-5 pt-2">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
        <div
          className={cn(
            'rounded-2xl border border-border bg-surface',
            'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
            'focus-within:border-foreground/20 focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
            'transition-shadow transition-colors',
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Message agent(0)…"
            className={cn(
              'block w-full resize-none bg-transparent outline-none',
              'px-4 pt-3.5 pb-2 text-[14px] leading-6 text-foreground',
              'placeholder:text-muted-foreground/70 font-sans',
            )}
          />
          <div className="flex items-center justify-end px-2 pb-2">
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send"
              className={cn(
                'size-8 rounded-full flex items-center justify-center transition-all',
                canSend
                  ? 'bg-accent text-background hover:opacity-90'
                  : 'bg-muted text-muted-foreground/40 cursor-not-allowed',
              )}
            >
              <ArrowUp className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
          agent(0) can make mistakes — verify code samples against the docs.
        </p>
      </form>
    </div>
  )
}
