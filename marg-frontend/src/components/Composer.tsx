import { useRef, useEffect, useCallback, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALLOWED_PARENT_ORIGINS } from '@/config/constants'
import { rememberParentOrigin } from '@/lib/parentOrigin'

interface ComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
}

/**
 * Big rounded card composer at the bottom — soft elevation, generous
 * padding, send arrow as a circular accent button. Auto-grows up to ~6
 * lines. Centered max-width matches the messages column above.
 */
export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  // Re-focus when the parent docs page opens the panel via postMessage.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!ALLOWED_PARENT_ORIGINS.includes(e.origin)) return
      rememberParentOrigin(e.origin)
      if (e.data?.type === 'focusInput') textareaRef.current?.focus()
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [value])

  const submit = useCallback(() => {
    if (disabled) return
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }, [disabled, value, onSend])

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
    <div className="px-5 pb-5 pt-2">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
        <div
          className={cn(
            'rounded-2xl border border-border bg-surface',
            'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
            'focus-within:border-primary focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
            'transition-shadow transition-colors',
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled}
            rows={1}
            placeholder={disabled ? 'Waiting for response...' : 'Ask a question...'}
            className={cn(
              'block w-full resize-none bg-transparent outline-none',
              'px-4 pt-3.5 pb-2 text-[14px] leading-6 text-foreground',
              'placeholder:text-muted-foreground/70 font-sans',
              disabled && 'cursor-not-allowed opacity-70',
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
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground/40 cursor-not-allowed',
              )}
            >
              <ArrowUp className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
